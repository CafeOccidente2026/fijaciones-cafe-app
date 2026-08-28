import { NextFunction, Request, Response } from "express";

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async Express handler so that any rejected promise is
 * forwarded to next(err) automatically, instead of crashing the process
 * or requiring a try/catch in every single controller.
 */
export function asyncHandler(fn: AsyncController) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
