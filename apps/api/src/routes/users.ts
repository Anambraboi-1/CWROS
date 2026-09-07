import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { allow, authenticate } from '../middleware/auth.js';

// Not an explicit README §20-25 API section, but required for admins to
// "create and deactivate users" (README §6.1) via the User Management view
// (README §26). Admin-gated, matching the nodes/edges CRUD pattern.
export const usersRouter = Router();

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['ADMIN', 'DISPATCHER', 'OPERATOR']).default('OPERATOR')
});

usersRouter.get('/', authenticate, allow('ADMIN'), (_req, res) => {
  res.json({ data: db.prepare('SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC').all() });
});

usersRouter.post('/', authenticate, allow('ADMIN'), (req, res, next) => {
  try {
    const body = createUserSchema.parse(req.body);
    const id = randomUUID();
    const passwordHash = bcrypt.hashSync(body.password, 10);
    db.prepare('INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
      id,
      body.username,
      body.email.toLowerCase(),
      passwordHash,
      body.role
    );
    res.status(201).json(db.prepare('SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?').get(id));
  } catch (error) {
    next(error);
  }
});

usersRouter.put('/:id/deactivate', authenticate, allow('ADMIN'), (req, res) => {
  const result = db.prepare('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    String(req.params.id)
  );
  if (result.changes === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.status(204).send();
});

usersRouter.put('/:id/activate', authenticate, allow('ADMIN'), (req, res) => {
  const result = db.prepare('UPDATE users SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    String(req.params.id)
  );
  if (result.changes === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.status(204).send();
});
