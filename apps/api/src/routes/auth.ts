import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config.js';
import { db } from '../db.js';
import type { Identity } from '../middleware/auth.js';
import { isRefreshTokenValid, saveRefreshToken } from '../refreshStore.js';

export const authRouter = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

authRouter.post('/login', (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = db
      .prepare('SELECT id, email, password_hash, role, is_active FROM users WHERE email = ?')
      .get(body.email.toLowerCase()) as
      | { id: string; email: string; password_hash: string; role: string; is_active: number }
      | undefined;

    if (!user || !user.is_active || !bcrypt.compareSync(body.password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const identity: Identity = { id: user.id, email: user.email, role: user.role as Identity['role'] };
    const token = jwt.sign(identity, env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(identity, env.JWT_SECRET, { expiresIn: '7d' });
    saveRefreshToken(user.id, refreshToken, 7 * 24 * 60 * 60);

    res.json({ token, refreshToken, user: identity });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/refresh', (req, res, next) => {
  try {
    const refreshToken = z.object({ refreshToken: z.string() }).parse(req.body).refreshToken;
    const identity = jwt.verify(refreshToken, env.JWT_SECRET) as Identity;

    if (!isRefreshTokenValid(identity.id, refreshToken)) {
      res.status(401).json({ error: 'Session expired' });
      return;
    }

    res.json({ token: jwt.sign(identity, env.JWT_SECRET, { expiresIn: '15m' }) });
  } catch (error) {
    next(error);
  }
});
