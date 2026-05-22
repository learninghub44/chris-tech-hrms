import type { Request } from "express";
import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/authenticate";
import { requirePermissions } from "../../middleware/authorize";
import { AppError } from "../../middleware/error-handler";
import type { AuthUser } from "../auth/auth.service";
import { ok } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";

export const hrAssistantRouter = Router();

type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type GeminiTextPart = {
  text: string;
};

type GeminiFunctionCall = {
  id?: string;
  name: string;
  args?: unknown;
};

type GeminiFunctionCallPart = {
  functionCall: GeminiFunctionCall;
};

type GeminiFunctionResponsePart = {
  functionResponse: {
    id?: string;
    name: string;
    response: Record<string, unknown>;
  };
};

type GeminiPart = GeminiTextPart | GeminiFunctionCallPart | GeminiFunctionResponsePart;

type GeminiContent = {
  role: "user" | "model";
  parts: GeminiPart[];
};

type GeminiCandidate = {
  content?: GeminiContent;
  finishReason?: string;
};

type GeminiGenerateContentResponse = {
  candidates: GeminiCandidate[];
};

type GeminiFunctionDeclaration = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

type ToolExecutionResult = {
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

const hrAssistantTools: GeminiFunctionDeclaration[] = [
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

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isTextPart(part: GeminiPart): part is GeminiTextPart {
  return "text" in part && typeof part.text === "string";
}

function isFunctionCallPart(part: GeminiPart): part is GeminiFunctionCallPart {
  return "functionCall" in part && isObject(part.functionCall) && typeof part.functionCall.name === "string";
}

function extractAssistantText(response: GeminiGenerateContentResponse): string {
  return response.candidates
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .filter(isTextPart)
    .map((part) => part.text.trim())
    .filter((text) => text.length > 0)
    .join("\n")
    .trim();
}

function extractFunctionCalls(response: GeminiGenerateContentResponse): GeminiFunctionCall[] {
  return response.candidates
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .filter(isFunctionCallPart)
    .map((part) => part.functionCall);
}

function getFirstCandidateContent(response: GeminiGenerateContentResponse): GeminiContent | null {
  return response.candidates[0]?.content ?? null;
}

function isGeminiGenerateContentResponse(payload: unknown): payload is GeminiGenerateContentResponse {
  if (!isObject(payload) || !Array.isArray(payload.candidates)) {
    return false;
  }

  return payload.candidates.every((candidate) => isObject(candidate));
}

function toContents(history: ChatHistoryMessage[], message: string): GeminiContent[] {
  const trimmedHistory = history.slice(-8);

  return [
    ...trimmedHistory.map((historyMessage) => ({
      role: historyMessage.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: historyMessage.content }]
    })),
    {
      role: "user" as const,
      parts: [{ text: message }]
    }
  ];
}

function getGeminiModelPath(): string {
  return env.GEMINI_MODEL.startsWith("models/") ? env.GEMINI_MODEL : `models/${env.GEMINI_MODEL}`;
}

function normalizeToolArgs(args: unknown): unknown {
  return args === undefined ? {} : args;
}

async function getEmployeeForAuth(auth: AuthUser) {
  return prisma.employee.findUnique({
    where: {
      userId: auth.id
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
        employeeId: employee.id
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
        payroll: {
          month: currentMonth,
          year: currentYear
        }
      },
      include: {
        payroll: true
      }
    }),
    prisma.salary.findUnique({
      where: {
        employeeId: employee.id
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
  functionCall: GeminiFunctionCall;
}): Promise<ToolExecutionResult> {
  const functionArgs = normalizeToolArgs(input.functionCall.args);

  try {
    if (input.functionCall.name === "get_leave_balance") {
      return {
        toolName: input.functionCall.name,
        response: {
          result: await getLeaveBalanceToolResult(input.auth, functionArgs)
        },
        isError: false
      };
    }

    if (input.functionCall.name === "get_next_payroll") {
      return {
        toolName: input.functionCall.name,
        response: {
          result: await getNextPayrollToolResult(input.auth, functionArgs)
        },
        isError: false
      };
    }

    if (input.functionCall.name === "get_manager") {
      return {
        toolName: input.functionCall.name,
        response: {
          result: await getManagerToolResult(input.auth, functionArgs)
        },
        isError: false
      };
    }

    return {
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

async function createGeminiContent(contents: GeminiContent[]): Promise<GeminiGenerateContentResponse> {
  if (!env.GEMINI_API_KEY) {
    throw new AppError(
      503,
      "GEMINI_NOT_CONFIGURED",
      "HR Assistant is not configured",
      {
        hint: "Set GEMINI_API_KEY in backend/.env, restart the backend, and try again."
      }
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${getGeminiModelPath()}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents,
        tools: [
          {
            functionDeclarations: hrAssistantTools
          }
        ],
        generationConfig: {
          maxOutputTokens: env.GEMINI_MAX_OUTPUT_TOKENS,
          temperature: 0.2
        }
      })
    }
  );
  const responseText = await response.text();

  if (!response.ok) {
    throw new AppError(
      502,
      "GEMINI_REQUEST_FAILED",
      "Gemini could not answer the HR Assistant request",
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
      "GEMINI_RESPONSE_INVALID",
      "Gemini returned invalid JSON",
      {
        message: error instanceof Error ? error.message : "JSON parsing failed"
      }
    );
  }

  if (!isGeminiGenerateContentResponse(payload)) {
    throw new AppError(
      502,
      "GEMINI_RESPONSE_INVALID",
      "Gemini returned an unexpected response shape"
    );
  }

  return payload;
}

async function runAssistant(input: {
  auth: AuthUser;
  message: string;
  history: ChatHistoryMessage[];
}): Promise<{ reply: string; toolsUsed: string[] }> {
  const contents = toContents(input.history, input.message);
  const toolsUsed: string[] = [];
  let response = await createGeminiContent(contents);

  for (let toolRound = 0; toolRound < 3; toolRound += 1) {
    const functionCalls = extractFunctionCalls(response);

    if (functionCalls.length === 0) {
      return {
        reply: extractAssistantText(response) || "I could not find enough HR data to answer that.",
        toolsUsed
      };
    }

    const modelContent = getFirstCandidateContent(response);

    if (!modelContent) {
      throw new AppError(
        502,
        "GEMINI_RESPONSE_INVALID",
        "Gemini requested a function call without returning model content"
      );
    }

    contents.push(modelContent);

    const functionResponseParts = await Promise.all(
      functionCalls.map(async (functionCall): Promise<GeminiFunctionResponsePart> => {
        const result = await executeTool({
          auth: input.auth,
          functionCall
        });

        toolsUsed.push(result.toolName);

        return {
          functionResponse: {
            ...(functionCall.id ? { id: functionCall.id } : {}),
            name: functionCall.name,
            response: result.response
          }
        };
      })
    );

    contents.push({
      role: "user",
      parts: functionResponseParts
    });
    response = await createGeminiContent(contents);
  }

  return {
    reply: extractAssistantText(response) || "I found HR data, but could not produce a final answer.",
    toolsUsed
  };
}

hrAssistantRouter.use(authenticate);

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