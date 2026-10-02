import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[FORENZIQ ERROR]:', err.message || err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal error occurred.';

  res.status(status).json({
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      details: err.details || null,
    },
  });
}
