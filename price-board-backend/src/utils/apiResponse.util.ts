import { Response } from "express";

/**
 * Keeps every endpoint returning the same JSON shape, so the frontend
 * can rely on a single format: { success, data } or { success, error }.
 */
export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200): Response {
    return res.status(statusCode).json({ success: true, data });
  }

  static error(res: Response, message: string, statusCode = 400): Response {
    return res.status(statusCode).json({ success: false, error: message });
  }
}

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
