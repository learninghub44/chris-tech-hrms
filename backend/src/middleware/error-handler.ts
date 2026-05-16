import type { ErrorRequestHandler } from "express";
import { fail } from "../utils/api-response";

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res
      .status(error.statusCode)
      .json(fail(error.code, error.message, error.details));
    return;
  }

  console.error(error);

  res.status(500).json(
    fail("INTERNAL_SERVER_ERROR", "Something went wrong on the server")
  );
};
