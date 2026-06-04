import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.path}`));
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      error: error.message,
      details: error.details
    });
    return;
  }

  console.error("Unhandled backend error", error);

  res.status(500).json({
    error: "Something went wrong. Please try again."
  });
}
