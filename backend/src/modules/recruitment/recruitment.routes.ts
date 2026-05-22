import { Router } from "express";
import {
  ApplicationStatus,
  InterviewMode,
  InterviewStatus,
  JobStatus,
  OfferStatus,
  Prisma,
  type Notification
} from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { emitNotificationCreated } from "../../lib/realtime";
import { authenticate } from "../../middleware/authenticate";
import { requireAnyPermission, requirePermissions } from "../../middleware/authorize";
import { AppError } from "../../middleware/error-handler";
import { ok } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import {
  getPagination,
  getPaginationMeta,
  paginationQuerySchema
} from "../../utils/pagination";

export const recruitmentRouter = Router();

const employeeSelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  workEmail: true,
  department: true,
  designation: true
} satisfies Prisma.EmployeeSelect;

const applicationInclude = {
  job: {
    include: {
      department: true,
      designation: true
    }
  },
  candidate: true,
  interviews: {
    include: {
      interviewer: {
        select: employeeSelect
      }
    },
    orderBy: {
      scheduledAt: "desc" as const
    }
  },
  offers: {
    orderBy: {
      createdAt: "desc" as const
    }
  }
} satisfies Prisma.JobApplicationInclude;

const jobInclude = {
  department: true,
  designation: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  applications: {
    include: {
      candidate: true
    },
    orderBy: {
      appliedAt: "desc" as const
    }
  }
} satisfies Prisma.JobInclude;

const jobListInclude = {
  department: true,
  designation: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  applications: {
    select: {
      id: true
    }
  }
} satisfies Prisma.JobInclude;

const candidateInclude = {
  applications: {
    include: {
      job: {
        include: {
          department: true,
          designation: true
        }
      },
      interviews: {
        include: {
          interviewer: {
            select: employeeSelect
          }
        },
        orderBy: {
          scheduledAt: "desc" as const
        }
      },
      offers: {
        orderBy: {
          createdAt: "desc" as const
        }
      }
    },
    orderBy: {
      appliedAt: "desc" as const
    }
  },
  interviews: {
    include: {
      application: {
        include: {
          job: true
        }
      },
      interviewer: {
        select: employeeSelect
      }
    },
    orderBy: {
      scheduledAt: "desc" as const
    }
  },
  offers: {
    include: {
      job: true,
      application: true
    },
    orderBy: {
      createdAt: "desc" as const
    }
  }
} satisfies Prisma.CandidateInclude;

const candidateListInclude = {
  applications: {
    select: {
      id: true
    }
  }
} satisfies Prisma.CandidateInclude;

const interviewInclude = {
  application: {
    include: {
      job: true
    }
  },
  candidate: true,
  interviewer: {
    select: employeeSelect
  }
} satisfies Prisma.InterviewInclude;

const offerInclude = {
  application: true,
  candidate: true,
  job: true
} satisfies Prisma.OfferInclude;

const uuidSchema = z.string().uuid();
const nullableStringSchema = (maxLength: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value): string | null => {
      if (typeof value !== "string") {
        return null;
      }

      const trimmedValue = value.trim();

      return trimmedValue.length > 0 ? trimmedValue : null;
    })
    .pipe(z.string().max(maxLength).nullable());

const nullableUuidSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value): string | null => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  })
  .pipe(uuidSchema.nullable());

const paramsSchema = z.object({
  id: uuidSchema
});

const jobBodySchema = z.object({
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().min(10).max(5000),
  departmentId: nullableUuidSchema,
  designationId: nullableUuidSchema,
  location: nullableStringSchema(120),
  employmentType: nullableStringSchema(80),
  status: z.nativeEnum(JobStatus)
});

const jobQuerySchema = z.object({
  status: z.nativeEnum(JobStatus).optional(),
  departmentId: uuidSchema.optional()
}).merge(paginationQuerySchema);

const candidateBodySchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  phone: nullableStringSchema(30),
  source: nullableStringSchema(100),
  resumeUrl: nullableStringSchema(4000),
  currentCompany: nullableStringSchema(120),
  currentTitle: nullableStringSchema(120),
  jobId: nullableUuidSchema,
  notes: nullableStringSchema(500)
});

const candidateQuerySchema = z.object({
  search: z.string().trim().max(120).optional()
}).merge(paginationQuerySchema);

const applicationBodySchema = z.object({
  jobId: uuidSchema,
  candidateId: uuidSchema,
  status: z.nativeEnum(ApplicationStatus),
  notes: nullableStringSchema(500)
});

const applicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  notes: nullableStringSchema(500)
});

const interviewBodySchema = z.object({
  applicationId: uuidSchema,
  interviewerId: nullableUuidSchema,
  scheduledAt: z.string().trim().datetime(),
  mode: z.nativeEnum(InterviewMode),
  location: nullableStringSchema(200),
  status: z.nativeEnum(InterviewStatus),
  feedback: nullableStringSchema(2000)
});

const interviewStatusSchema = z.object({
  status: z.nativeEnum(InterviewStatus),
  feedback: nullableStringSchema(2000)
});

const offerBodySchema = z.object({
  applicationId: uuidSchema,
  offeredSalary: z.number().min(0).max(100_000_000).nullable(),
  startDate: z
    .union([z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/), z.null(), z.undefined()])
    .transform((value): string | null => {
      if (typeof value !== "string") {
        return null;
      }

      return value;
    }),
  status: z.nativeEnum(OfferStatus),
  notes: nullableStringSchema(500)
});

const offerStatusSchema = z.object({
  status: z.nativeEnum(OfferStatus),
  notes: nullableStringSchema(500)
});

function parseInput<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Request input is invalid", result.error.flatten());
  }

  return result.data;
}

function toDateOnlyFromInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function getCandidateName(candidate: { firstName: string; lastName: string }): string {
  return `${candidate.firstName} ${candidate.lastName}`.trim();
}

function getApplicationStatusForOffer(status: OfferStatus): ApplicationStatus {
  if (status === "ACCEPTED") {
    return "HIRED";
  }

  if (status === "DECLINED") {
    return "REJECTED";
  }

  return "OFFERED";
}

function handlePrismaMutationError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new AppError(409, "DUPLICATE_RECORD", "A record with the same unique value already exists");
    }

    if (error.code === "P2003") {
      throw new AppError(400, "INVALID_REFERENCE", "One of the selected related records does not exist");
    }

    if (error.code === "P2025") {
      throw new AppError(404, "RECORD_NOT_FOUND", "The requested record was not found");
    }
  }

  throw error;
}

recruitmentRouter.use(authenticate);

recruitmentRouter.get(
  "/jobs",
  requireAnyPermission(["recruitment:read", "recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(jobQuerySchema, req.query);
    const pagination = getPagination(query);
    const where: Prisma.JobWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.departmentId ? { departmentId: query.departmentId } : {})
    };
    const [total, jobs] = await prisma.$transaction([
      prisma.job.count({
        where
      }),
      prisma.job.findMany({
        where,
        include: jobListInclude,
        orderBy: {
          createdAt: "desc"
        },
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    res.status(200).json(ok({ jobs }, getPaginationMeta({ total, pagination })));
  })
);

recruitmentRouter.post(
  "/jobs",
  requirePermissions(["recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(jobBodySchema, req.body);

    try {
      const job = await prisma.job.create({
        data: {
          title: body.title,
          description: body.description,
          departmentId: body.departmentId,
          designationId: body.designationId,
          location: body.location,
          employmentType: body.employmentType,
          status: body.status,
          createdById: req.auth?.id ?? null
        },
        include: jobInclude
      });

      res.status(201).json(ok({ job }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

recruitmentRouter.get(
  "/jobs/:id",
  requireAnyPermission(["recruitment:read", "recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const params = parseInput(paramsSchema, req.params);
    const job = await prisma.job.findUnique({
      where: {
        id: params.id
      },
      include: jobInclude
    });

    if (!job) {
      throw new AppError(404, "JOB_NOT_FOUND", "Job was not found");
    }

    res.status(200).json(ok({ job }));
  })
);

recruitmentRouter.get(
  "/candidates",
  requireAnyPermission(["recruitment:read", "recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(candidateQuerySchema, req.query);
    const pagination = getPagination(query);
    const where: Prisma.CandidateWhereInput = query.search
      ? {
          OR: [
            {
              firstName: {
                contains: query.search,
                mode: "insensitive"
              }
            },
            {
              lastName: {
                contains: query.search,
                mode: "insensitive"
              }
            },
            {
              email: {
                contains: query.search,
                mode: "insensitive"
              }
            }
          ]
        }
      : {};
    const [total, candidates] = await prisma.$transaction([
      prisma.candidate.count({
        where
      }),
      prisma.candidate.findMany({
        where,
        include: candidateListInclude,
        orderBy: {
          createdAt: "desc"
        },
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    res.status(200).json(ok({ candidates }, getPaginationMeta({ total, pagination })));
  })
);

recruitmentRouter.post(
  "/candidates",
  requirePermissions(["recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(candidateBodySchema, req.body);

    try {
      const candidate = await prisma.$transaction(async (transaction) => {
        const createdCandidate = await transaction.candidate.create({
          data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            phone: body.phone,
            source: body.source,
            resumeUrl: body.resumeUrl,
            currentCompany: body.currentCompany,
            currentTitle: body.currentTitle
          }
        });

        if (body.jobId) {
          await transaction.jobApplication.create({
            data: {
              jobId: body.jobId,
              candidateId: createdCandidate.id,
              status: "APPLIED",
              notes: body.notes
            }
          });
        }

        return transaction.candidate.findUniqueOrThrow({
          where: {
            id: createdCandidate.id
          },
          include: candidateInclude
        });
      });

      res.status(201).json(ok({ candidate }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

recruitmentRouter.get(
  "/candidates/:id",
  requireAnyPermission(["recruitment:read", "recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const params = parseInput(paramsSchema, req.params);
    const candidate = await prisma.candidate.findUnique({
      where: {
        id: params.id
      },
      include: candidateInclude
    });

    if (!candidate) {
      throw new AppError(404, "CANDIDATE_NOT_FOUND", "Candidate was not found");
    }

    res.status(200).json(ok({ candidate }));
  })
);

recruitmentRouter.get(
  "/applications",
  requireAnyPermission(["recruitment:read", "recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(paginationQuerySchema, req.query);
    const pagination = getPagination(query);
    const [total, applications] = await prisma.$transaction([
      prisma.jobApplication.count(),
      prisma.jobApplication.findMany({
        include: applicationInclude,
        orderBy: {
          appliedAt: "desc"
        },
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    res.status(200).json(ok({ applications }, getPaginationMeta({ total, pagination })));
  })
);

recruitmentRouter.post(
  "/applications",
  requirePermissions(["recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(applicationBodySchema, req.body);

    try {
      const application = await prisma.jobApplication.create({
        data: body,
        include: applicationInclude
      });

      res.status(201).json(ok({ application }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

recruitmentRouter.put(
  "/applications/:id/status",
  requirePermissions(["recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const params = parseInput(paramsSchema, req.params);
    const body = parseInput(applicationStatusSchema, req.body);

    try {
      const application = await prisma.jobApplication.update({
        where: {
          id: params.id
        },
        data: {
          status: body.status,
          notes: body.notes
        },
        include: applicationInclude
      });

      res.status(200).json(ok({ application }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

recruitmentRouter.get(
  "/interviews",
  requireAnyPermission(["recruitment:read", "recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(paginationQuerySchema, req.query);
    const pagination = getPagination(query);
    const [total, interviews] = await prisma.$transaction([
      prisma.interview.count(),
      prisma.interview.findMany({
        include: interviewInclude,
        orderBy: {
          scheduledAt: "asc"
        },
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    res.status(200).json(ok({ interviews }, getPaginationMeta({ total, pagination })));
  })
);

recruitmentRouter.post(
  "/interviews",
  requirePermissions(["recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(interviewBodySchema, req.body);

    try {
      const transactionResult = await prisma.$transaction(async (transaction) => {
        const application = await transaction.jobApplication.findUnique({
          where: {
            id: body.applicationId
          },
          include: {
            candidate: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            job: {
              select: {
                title: true
              }
            }
          }
        });

        if (!application) {
          throw new AppError(404, "APPLICATION_NOT_FOUND", "Application was not found");
        }

        const createdInterview = await transaction.interview.create({
          data: {
            applicationId: application.id,
            candidateId: application.candidateId,
            interviewerId: body.interviewerId,
            scheduledAt: new Date(body.scheduledAt),
            mode: body.mode,
            location: body.location,
            status: body.status,
            feedback: body.feedback
          }
        });
        let notification: Notification | null = null;

        if (body.interviewerId) {
          const interviewer = await transaction.employee.findUnique({
            where: {
              id: body.interviewerId
            },
            select: {
              userId: true
            }
          });

          if (interviewer?.userId) {
            notification = await transaction.notification.create({
              data: {
                userId: interviewer.userId,
                title: "Interview scheduled",
                message: `Interview scheduled for ${getCandidateName(application.candidate)} - ${application.job.title}`,
                category: "recruitment"
              }
            });
          }
        }

        await transaction.jobApplication.update({
          where: {
            id: application.id
          },
          data: {
            status: "INTERVIEW"
          }
        });

        const interview = await transaction.interview.findUniqueOrThrow({
          where: {
            id: createdInterview.id
          },
          include: interviewInclude
        });

        return {
          interview,
          notifications: notification ? [notification] : []
        };
      });

      transactionResult.notifications.forEach(emitNotificationCreated);
      res.status(201).json(ok({ interview: transactionResult.interview }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

recruitmentRouter.put(
  "/interviews/:id/status",
  requirePermissions(["recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const params = parseInput(paramsSchema, req.params);
    const body = parseInput(interviewStatusSchema, req.body);

    try {
      const interview = await prisma.interview.update({
        where: {
          id: params.id
        },
        data: {
          status: body.status,
          feedback: body.feedback
        },
        include: interviewInclude
      });

      res.status(200).json(ok({ interview }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

recruitmentRouter.get(
  "/offers",
  requireAnyPermission(["recruitment:read", "recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(paginationQuerySchema, req.query);
    const pagination = getPagination(query);
    const [total, offers] = await prisma.$transaction([
      prisma.offer.count(),
      prisma.offer.findMany({
        include: offerInclude,
        orderBy: {
          createdAt: "desc"
        },
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    res.status(200).json(ok({ offers }, getPaginationMeta({ total, pagination })));
  })
);

recruitmentRouter.put(
  "/offers/:id/status",
  requirePermissions(["recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const params = parseInput(paramsSchema, req.params);
    const body = parseInput(offerStatusSchema, req.body);

    try {
      const offer = await prisma.$transaction(async (transaction) => {
        const updatedOffer = await transaction.offer.update({
          where: {
            id: params.id
          },
          data: {
            status: body.status,
            notes: body.notes
          }
        });

        await transaction.jobApplication.update({
          where: {
            id: updatedOffer.applicationId
          },
          data: {
            status: getApplicationStatusForOffer(body.status)
          }
        });

        return transaction.offer.findUniqueOrThrow({
          where: {
            id: updatedOffer.id
          },
          include: offerInclude
        });
      });

      res.status(200).json(ok({ offer }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

recruitmentRouter.post(
  "/offers",
  requirePermissions(["recruitment:manage"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(offerBodySchema, req.body);

    try {
      const offer = await prisma.$transaction(async (transaction) => {
        const application = await transaction.jobApplication.findUnique({
          where: {
            id: body.applicationId
          }
        });

        if (!application) {
          throw new AppError(404, "APPLICATION_NOT_FOUND", "Application was not found");
        }

        const createdOffer = await transaction.offer.create({
          data: {
            applicationId: application.id,
            candidateId: application.candidateId,
            jobId: application.jobId,
            offeredSalary: body.offeredSalary,
            startDate: body.startDate ? toDateOnlyFromInput(body.startDate) : null,
            status: body.status,
            notes: body.notes
          }
        });

        await transaction.jobApplication.update({
          where: {
            id: application.id
          },
          data: {
            status: getApplicationStatusForOffer(body.status)
          }
        });

        return transaction.offer.findUniqueOrThrow({
          where: {
            id: createdOffer.id
          },
          include: offerInclude
        });
      });

      res.status(201).json(ok({ offer }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);
