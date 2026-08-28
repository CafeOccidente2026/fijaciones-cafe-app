import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { ApiResponse } from "../utils/apiResponse.util";

/**
 * Restricts a route to one or more roles. Must run after `authenticate`,
 * since it relies on req.auth being already populated.
 *
 * Usage: router.post("/", authenticate, authorize(Role.ADMIN), handler)
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      ApiResponse.error(res, "No autenticado", 401);
      return;
    }

    if (!allowedRoles.includes(req.auth.role)) {
      ApiResponse.error(res, "No tienes permisos para realizar esta accion", 403);
      return;
    }

    next();
  };
}
