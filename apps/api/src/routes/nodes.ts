import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { allow, authenticate } from '../middleware/auth.js';

export const nodesRouter = Router();

const nodeSchema = z.object({
  code: z.string().min(1).max(5),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  node_type: z.enum(['COLLECTION_POINT', 'JUNCTION', 'DESTINATION'])
});

nodesRouter.get('/', authenticate, (_req, res) => {
  const rows = db.prepare('SELECT * FROM nodes WHERE is_active = 1 ORDER BY code').all();
  res.json({ data: rows });
});

nodesRouter.get('/:code', authenticate, (req, res) => {
  const row = db.prepare('SELECT * FROM nodes WHERE code = ?').get(String(req.params.code));
  if (!row) {
    res.status(404).json({ error: 'Node not found' });
    return;
  }
  res.json(row);
});

nodesRouter.post('/', authenticate, allow('ADMIN'), (req, res, next) => {
  try {
    const body = nodeSchema.parse(req.body);
    const id = randomUUID();
    db.prepare(
      'INSERT INTO nodes (id, code, name, description, latitude, longitude, node_type) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, body.code, body.name, body.description ?? null, body.latitude ?? null, body.longitude ?? null, body.node_type);
    res.status(201).json(db.prepare('SELECT * FROM nodes WHERE id = ?').get(id));
  } catch (error) {
    next(error);
  }
});

nodesRouter.put('/:code', authenticate, allow('ADMIN'), (req, res, next) => {
  try {
    const code = String(req.params.code);
    const body = nodeSchema.partial().parse(req.body);
    const existing = db.prepare('SELECT * FROM nodes WHERE code = ?').get(code) as
      | Record<string, unknown>
      | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Node not found' });
      return;
    }
    db.prepare(
      `UPDATE nodes SET name = ?, description = ?, latitude = ?, longitude = ?, node_type = ?, updated_at = CURRENT_TIMESTAMP
       WHERE code = ?`
    ).run(
      String(body.name ?? existing.name),
      String(body.description ?? existing.description ?? ''),
      Number(body.latitude ?? existing.latitude ?? 0),
      Number(body.longitude ?? existing.longitude ?? 0),
      String(body.node_type ?? existing.node_type),
      code
    );
    res.json(db.prepare('SELECT * FROM nodes WHERE code = ?').get(code));
  } catch (error) {
    next(error);
  }
});

nodesRouter.delete('/:code', authenticate, allow('ADMIN'), (req, res) => {
  const result = db.prepare('UPDATE nodes SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE code = ?').run(
    String(req.params.code)
  );
  if (result.changes === 0) {
    res.status(404).json({ error: 'Node not found' });
    return;
  }
  res.status(204).send();
});
