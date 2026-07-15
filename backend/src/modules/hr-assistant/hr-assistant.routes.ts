import type { Request } from "express";
import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/authenticate";
import { requirePermissions } from "../../middleware/authorize";
import { AppError } from "../../middleware/error-handler";
import { companyScope, requireCompanyContext } from "../../middleware/tenant";
import type { AuthUser } from "../auth/auth.service";
import { ok } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";

export const hrAssistantRouter = Router();

type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type GroqToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

type GroqAssistantMessage = {
  role: "assistant";
  content: string | null;
  tool_calls?: GroqToolCall[];
};

type GroqSystemMessage = {
  role: "system";
  content: string;
};

type GroqUserMessage = {
  role: "user";
  content: string;
};

type GroqToolMessage = {
  role: "tool";
  tool_call_id: string;
  content: string;
};

type GroqChatMessage = GroqSystemMessage | GroqUserMessage | GroqAssistantMessage | GroqToolMessage;

type GroqChoice = {
  message: GroqAssistantMessage;
  finish_reason?: string;
};

type GroqChatCompletionResponse = {
  choices: GroqChoice[];
};

type GroqFunctionDeclaration = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

type GroqTool = {
  type: "function";
  function: GroqFunctionDeclaration;
};

type FunctionCallRequest = {
  id: string;
  name: string;
  args: unknown;
};

type ToolExecutionResult = {
  toolCallId: string;
  toolName: string;
  response: Record<string, unknown>;
  isError: boolean;
};

const chatHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2_000)
});

const chatBodySchema = z.object({
  message: z.string().trim().min(1).max(1_000),
  history: z.array(chatHistoryMessageSchema).max(8).optional()
});

const leaveBalanceToolInputSchema = z.object({
  year: z.number().int().min(2000).max(2100).optional()
});

const emptyToolInputSchema = z.object({}).passthrough();

const employeeSelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  workEmail: true,
  status: true,
  department: true,
  designation: true,
  manager: {
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      workEmail: true,
      status: true,
      department: true,
      designation: true
    }
  }
};

const hrAssistantFunctions: GroqFunctionDeclaration[] = [
  {
    name: "get_leave_balance",
    description:
      "Use this function when the employee asks about remaining leave, leave balances, used leave, pending leave, or leave allowance. It returns leave balances only for the currently authenticated employee, so do not ask the user for an employee ID. If the user asks for a year, pass that calendar year; otherwise omit year and the server will use the current year. The result includes leave type names, opening balance, used days, pending days, available days, and totals.",
    parameters: {
      type: "object",
      properties: {
        year: {
          type: "integer",
          description: "Optional calendar year for the leave balance, for example 2026."
        }
      }
    }
  },
  {
    name: "get_next_payroll",
    description:
      "Use this function when the employee asks about payroll, next payroll, salary setup, latest payslip, whether this month's payroll is generated, or expected payroll period. It returns payroll information only for the currently authenticated employee. The HRMS database stores payroll month and year plus payslip issue time; it does not store a guaranteed pay date, so explain that limitation when relevant.",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_manager",
    description:
      "Use this function when the employee asks who their manager is, who they report to, or wants their department/designation reporting context. It returns the manager linked to the currently authenticated employee profile. If no manager is assigned, say that the employee profile does not currently have a manager assigned.",
    parameters: {
      type: "object",
      properties: {}
    }
  }
];

const hrAssistantTools: GroqTool[] = hrAssistantFunctions.map((functionDeclaration) => ({
  type: "function" as const,
  function: functionDeclaration
}));

const systemPrompt = [
  "You are the HR Assistant inside HRMS.",
  "Answer employee self-service questions using only the HR functions and the user's question.",
  "For factual HR data, call the relevant function before answering. Do not invent balances, payroll status, manager names, or dates.",
  "The functions are scoped to the authenticated employee. Never claim to access another employee's private data.",
  "If a function result says data is missing, explain what is missing and what HR should configure.",
  "Keep answers concise, practical, and under 120 words unless the user asks for detail."
].join("\n");

function parseInput<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Request input is invalid", result.error.flatten());
  }

  return result.data;
}

function assertAuthenticated(req: Request): AuthUser {
  if (!req.auth) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "A valid access token is required");
  }

  return req.auth;
}

function getEmployeeName(employee: { firstName: string; lastName: string }): string {
  return `${employee.firstName} ${employee.lastName}`.trim();
}

function formatPayrollPeriod(month: number, year: number): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function getNextPayrollPeriod(input: {
  month: number;
  year: number;
}): { month: number; year: number; label: string } {
  const month = input.month === 12 ? 1 : input.month + 1;
  const year = input.month === 12 ? input.year + 1 : input.year;

  return {
    month,
    year,
    label: formatPayrollPeriod(month, year)
  };
}

function normalizeToolArgs(rawArguments: string): unknown {
  if (!rawArguments || rawArguments.trim().length === 0) {
    return {};
  }

  try {
    return JSON.parse(rawArguments) as unknown;
  } catch {
    return {};
  }
}

function extractAssistantText(message: GroqAssistantMessage): string {
  return (message.content ?? "").trim();
}

function extractFunctionCalls(message: GroqAssistantMessage): FunctionCallRequest[] {
  return (message.tool_calls ?? []).map((toolCall) => ({
    id: toolCall.id,
    name: toolCall.function.name,
    args: normalizeToolArgs(toolCall.function.arguments)
  }));
}

function toMessages(history: ChatHistoryMessage[], message: string): GroqChatMessage[] {
  const trimmedHistory = history.slice(-8);

  return [
    { role: "system", content: systemPrompt },
    ...trimmedHistory.map((historyMessage): GroqChatMessage => ({
      role: historyMessage.role,
      content: historyMessage.content
    })),
    {
      role: "user",
      content: message
    }
  ];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isGroqChatCompletionResponse(payload: unknown): payload is GroqChatCompletionResponse {
  if (!isObject(payload) || !Array.isArray(payload.choices)) {
    return false;
  }

  return payload.choices.every((choice) => isObject(choice) && isObject(choice.message));
}

async function getEmployeeForAuth(auth: AuthUser) {
  return prisma.employee.findFirst({
    where: {
      userId: auth.id,
      companyId: companyScope({ auth }).companyId
    },
    select: employeeSelect
  });
}

async function getLeaveBalanceToolResult(auth: AuthUser, input: unknown) {
  const parsedInput = parseInput(leaveBalanceToolInputSchema, input);
  const year = parsedInput.year ?? new Date().getFullYear();
  const employee = await getEmployeeForAuth(auth);

  if (!employee) {
    return {
      profileLinked: false,
      message: "This user account is not linked to an employee profile."
    };
  }

  const leaveBalances = await prisma.leaveBalance.findMany({
    where: {
      employeeId: employee.id,
      companyId: companyScope({ auth }).companyId,
      year
    },
    include: {
      leaveType: true
    },
    orderBy: {
      leaveType: {
        name: "asc"
      }
    }
  });
  const totals = leaveBalances.reduce(
    (summary, balance) => ({
      openingBalance: summary.openingBalance + balance.openingBalance,
      accrued: summary.accrued + balance.accrued,
      used: summary.used + balance.used,
      pending: summary.pending + balance.pending,
      available: summary.available + balance.available
    }),
    {
      openingBalance: 0,
      accrued: 0,
      used: 0,
      pending: 0,
      available: 0
    }
  );

  return {
    profileLinked: true,
    employee: {
      name: getEmployeeName(employee),
      employeeCode: employee.employeeCode
    },
    year,
    balances: leaveBalances.map((balance) => ({
      leaveType: balance.leaveType.name,
      isPaid: balance.leaveType.isPaid,
      openingBalance: balance.openingBalance,
      accrued: balance.accrued,
      used: balance.used,
      pending: balance.pending,
      available: balance.available
    })),
    totals,
    message:
      leaveBalances.length === 0
        ? "No leave balances exist for this employee and year."
        : "Leave balances returned from HRMS."
  };
}

async function getNextPayrollToolResult(auth: AuthUser, input: unknown) {
  parseInput(emptyToolInputSchema, input);
  const employee = await getEmployeeForAuth(auth);

  if (!employee) {
    return {
      profileLinked: false,
      message: "This user account is not linked to an employee profile."
    };
  }

  const companyId = companyScope({ auth }).companyId;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentPeriod = {
    month: currentMonth,
    year: currentYear,
    label: formatPayrollPeriod(currentMonth, currentYear)
  };
  const [latestPayslip, currentPayslip, salary] = await Promise.all([
    prisma.payslip.findFirst({
      where: {
        employeeId: employee.id,
        companyId
      },
      include: {
        payroll: true
      },
      orderBy: {
        issuedAt: "desc"
      }
    }),
    prisma.payslip.findFirst({
      where: {
        employeeId: employee.id,
        companyId,
        payroll: {
          month: currentMonth,
          year: currentYear
        }
      },
      include: {
        payroll: true
      }
    }),
    prisma.salary.findFirst({
      where: {
        employeeId: employee.id,
        companyId
      }
    })
  ]);
  const nextExpectedPeriod = currentPayslip
    ? getNextPayrollPeriod(currentPeriod)
    : currentPeriod;

  return {
    profileLinked: true,
    employee: {
      name: getEmployeeName(employee),
      employeeCode: employee.employeeCode
    },
    salaryConfigured: Boolean(salary?.isActive),
    currentPeriod: {
      ...currentPeriod,
      payslipGenerated: Boolean(currentPayslip),
      netPay: currentPayslip?.netPay ?? null,
      issuedAt: currentPayslip?.issuedAt.toISOString() ?? null
    },
    nextExpectedPeriod,
    latestPayslip: latestPayslip
      ? {
          period: formatPayrollPeriod(latestPayslip.payroll.month, latestPayslip.payroll.year),
          month: latestPayslip.payroll.month,
          year: latestPayslip.payroll.year,
          payslipNumber: latestPayslip.payslipNumber,
          netPay: latestPayslip.netPay,
          issuedAt: latestPayslip.issuedAt.toISOString()
        }
      : null,
    message:
      "HRMS stores payroll month/year and payslip issue time, not a guaranteed salary credit date."
  };
}

async function getManagerToolResult(auth: AuthUser, input: unknown) {
  parseInput(emptyToolInputSchema, input);
  const employee = await getEmployeeForAuth(auth);

  if (!employee) {
    return {
      profileLinked: false,
      message: "This user account is not linked to an employee profile."
    };
  }

  return {
    profileLinked: true,
    employee: {
      name: getEmployeeName(employee),
      employeeCode: employee.employeeCode,
      department: employee.department?.name ?? null,
      designation: employee.designation?.title ?? null
    },
    manager: employee.manager
      ? {
          name: getEmployeeName(employee.manager),
          employeeCode: employee.manager.employeeCode,
          email: employee.manager.workEmail,
          status: employee.manager.status,
          department: employee.manager.department?.name ?? null,
          designation: employee.manager.designation?.title ?? null
        }
      : null,
    message: employee.manager ? "Manager returned from HRMS." : "No manager is assigned."
  };
}

async function executeTool(input: {
  auth: AuthUser;
  functionCall: FunctionCallRequest;
}): Promise<ToolExecutionResult> {
  try {
    if (input.functionCall.name === "get_leave_balance") {
      return {
        toolCallId: input.functionCall.id,
        toolName: input.functionCall.name,
        response: {
          result: await getLeaveBalanceToolResult(input.auth, input.functionCall.args)
        },
        isError: false
      };
    }

    if (input.functionCall.name === "get_next_payroll") {
      return {
        toolCallId: input.functionCall.id,
        toolName: input.functionCall.name,
        response: {
          result: await getNextPayrollToolResult(input.auth, input.functionCall.args)
        },
        isError: false
      };
    }

    if (input.functionCall.name === "get_manager") {
      return {
        toolCallId: input.functionCall.id,
        toolName: input.functionCall.name,
        response: {
          result: await getManagerToolResult(input.auth, input.functionCall.args)
        },
        isError: false
      };
    }

    return {
      toolCallId: input.functionCall.id,
      toolName: input.functionCall.name,
      response: {
        error: {
          message: "Unknown HR assistant function."
        }
      },
      isError: true
    };
  } catch (error) {
    return {
      toolCallId: input.functionCall.id,
      toolName: input.functionCall.name,
      response: {
        error: {
          message: error instanceof Error ? error.message : "Function execution failed."
        }
      },
      isError: true
    };
  }
}

async function createGroqChatCompletion(messages: GroqChatMessage[]): Promise<GroqAssistantMessage> {
  if (!env.GROQ_API_KEY) {
    throw new AppError(
      503,
      "GROQ_NOT_CONFIGURED",
      "HR Assistant is not configured",
      {
        hint: "Set GROQ_API_KEY in backend/.env, restart the backend, and try again."
      }
    );
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL,
      messages,
      tools: hrAssistantTools,
      tool_choice: "auto",
      max_tokens: env.GROQ_MAX_OUTPUT_TOKENS,
      temperature: 0.2
    })
  });
  const responseText = await response.text();

  if (!response.ok) {
    throw new AppError(
      502,
      "GROQ_REQUEST_FAILED",
      "Groq could not answer the HR Assistant request",
      {
        status: response.status,
        responseBody: responseText
      }
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(responseText) as unknown;
  } catch (error) {
    throw new AppError(
      502,
      "GROQ_RESPONSE_INVALID",
      "Groq returned invalid JSON",
      {
        message: error instanceof Error ? error.message : "JSON parsing failed"
      }
    );
  }

  if (!isGroqChatCompletionResponse(payload) || !payload.choices[0]) {
    throw new AppError(
      502,
      "GROQ_RESPONSE_INVALID",
      "Groq returned an unexpected response shape"
    );
  }

  return payload.choices[0].message;
}

async function runAssistant(input: {
  auth: AuthUser;
  message: string;
  history: ChatHistoryMessage[];
}): Promise<{ reply: string; toolsUsed: string[] }> {
  const messages = toMessages(input.history, input.message);
  const toolsUsed: string[] = [];
  let assistantMessage = await createGroqChatCompletion(messages);

  for (let toolRound = 0; toolRound < 3; toolRound += 1) {
    const functionCalls = extractFunctionCalls(assistantMessage);

    if (functionCalls.length === 0) {
      return {
        reply: extractAssistantText(assistantMessage) || "I could not find enough HR data to answer that.",
        toolsUsed
      };
    }

    messages.push(assistantMessage);

    const toolMessages = await Promise.all(
      functionCalls.map(async (functionCall): Promise<GroqToolMessage> => {
        const result = await executeTool({
          auth: input.auth,
          functionCall
        });

        toolsUsed.push(result.toolName);

        return {
          role: "tool",
          tool_call_id: result.toolCallId,
          content: JSON.stringify(result.response)
        };
      })
    );

    messages.push(...toolMessages);
    assistantMessage = await createGroqChatCompletion(messages);
  }

  return {
    reply: extractAssistantText(assistantMessage) || "I found HR data, but could not produce a final answer.",
    toolsUsed
  };
}

hrAssistantRouter.use(authenticate);
hrAssistantRouter.use(requireCompanyContext);

hrAssistantRouter.post(
  "/hr-assistant/chat",
  requirePermissions(["profile:read"]),
  asyncHandler(async (req, res) => {
    const auth = assertAuthenticated(req);
    const body = parseInput(chatBodySchema, req.body);
    const response = await runAssistant({
      auth,
      message: body.message,
      history: body.history ?? []
    });

    res.status(200).json(ok(response));
  })
);
