import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { TokenUtil } from "../utils/token.util";
import { ApiResponse } from "../utils/apiResponse.util";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: { userId: string; role: Role };
    }
  }
}

/**
 * Reads the "Authorization: Bearer <token>" header, verifies the access
 * token, and attaches { userId, role } to req.auth for downstream handlers.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    ApiResponse.error(res, "No se proporciono un token de autenticacion", 401);
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = TokenUtil.verifyAccessToken(token);
    req.auth = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    ApiResponse.error(res, "Token invalido o expirado", 401);
  }
}
