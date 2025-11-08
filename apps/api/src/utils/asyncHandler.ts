import { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

type Handler = (req: Request, res: Response, next: NextFunction) => void;

export function asyncHandler(fn: AsyncRouteHandler): Handler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
