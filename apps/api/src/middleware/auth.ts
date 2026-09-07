import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config.js';

export type Role = 'ADMIN' | 'DISPATCHER' | 'OPERATOR';
export type Identity = { id: string; role: Role; email: string };

declare global {
  namespace Express {
    interface Request {
      identity?: Identity;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const value = req.header('authorization');
  if (!value?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    req.identity = jwt.verify(value.slice(7), env.JWT_SECRET) as Identity;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function allow(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.identity || !roles.includes(req.identity.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
