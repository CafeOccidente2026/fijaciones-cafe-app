import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/apiResponse.util";

/**
 * Catches every error thrown (or passed via next(err)) in one place,
 * so controllers never need their own try/catch boilerplate for
 * "unexpected" errors. Known AppErrors keep their intended status code;
 * anything else becomes a generic 500 (details are logged, not leaked).
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  console.error("Unexpected error:", err);
  res.status(500).json({ success: false, error: "Error interno del servidor" });
}
