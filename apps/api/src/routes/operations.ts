import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';

export const operationsRouter = Router();

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['SUCCESS', 'PENDING', 'FAILED']).optional(),
  source: z.string().max(5).optional(),
  destination: z.string().max(5).optional()
});

operationsRouter.get('/logs', authenticate, (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const conditions: string[] = [];
    const params: string[] = [];

    if (query.status) {
      conditions.push('status = ?');
      params.push(query.status);
    }
    if (query.source) {
      conditions.push('source_node = ?');
      params.push(query.source);
    }
    if (query.destination) {
      conditions.push('destination_node = ?');
      params.push(query.destination);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT count(*) as c FROM operation_logs ${where}`).get(...params) as { c: number }).c;
    const rows = db
      .prepare(
        `SELECT operation_id, task_description, input_size, processing_time_ms, status, source_node, destination_node, distance_km, created_at
         FROM operation_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
      )
      .all(...params, query.limit, (query.page - 1) * query.limit);

    res.json({ data: rows, page: query.page, limit: query.limit, total });
  } catch (error) {
    next(error);
  }
});
