import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { allow, authenticate } from '../middleware/auth.js';

export const edgesRouter = Router();

const edgeSchema = z.object({
  source: z.string().min(1).max(5),
  destination: z.string().min(1).max(5),
  distance_km: z.number().nonnegative(),
  is_bidirectional: z.boolean().optional()
});

const EDGE_LIST_QUERY = `
  SELECT e.id, sn.code as source, dn.code as destination, e.distance_km, e.is_bidirectional
  FROM edges e
  JOIN nodes sn ON sn.id = e.source_node_id
  JOIN nodes dn ON dn.id = e.destination_node_id
  WHERE e.is_active = 1
  ORDER BY sn.code, dn.code
`;

edgesRouter.get('/', authenticate, (_req, res) => {
  res.json({ data: db.prepare(EDGE_LIST_QUERY).all() });
});

edgesRouter.post('/', authenticate, allow('ADMIN'), (req, res, next) => {
  try {
    const body = edgeSchema.parse(req.body);
    const sourceNode = db.prepare('SELECT id FROM nodes WHERE code = ?').get(body.source) as { id: string } | undefined;
    const destinationNode = db.prepare('SELECT id FROM nodes WHERE code = ?').get(body.destination) as
      | { id: string }
      | undefined;
    if (!sourceNode || !destinationNode) {
      res.status(400).json({ error: 'Unknown source or destination node code' });
      return;
    }
    const id = randomUUID();
    db.prepare(
      'INSERT INTO edges (id, source_node_id, destination_node_id, distance_km, is_bidirectional) VALUES (?, ?, ?, ?, ?)'
    ).run(id, sourceNode.id, destinationNode.id, body.distance_km, body.is_bidirectional === false ? 0 : 1);
    res.status(201).json(db.prepare(`${EDGE_LIST_QUERY.replace('WHERE e.is_active = 1', 'WHERE e.id = ?')}`).get(id));
  } catch (error) {
    next(error);
  }
});

edgesRouter.put('/:id', authenticate, allow('ADMIN'), (req, res, next) => {
  try {
    const id = String(req.params.id);
    const body = z.object({ distance_km: z.number().nonnegative().optional(), is_bidirectional: z.boolean().optional() }).parse(
      req.body
    );
    const existing = db.prepare('SELECT * FROM edges WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Edge not found' });
      return;
    }
    db.prepare('UPDATE edges SET distance_km = ?, is_bidirectional = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      Number(body.distance_km ?? existing.distance_km),
      body.is_bidirectional === undefined ? Number(existing.is_bidirectional) : body.is_bidirectional ? 1 : 0,
      id
    );
    res.json(db.prepare(EDGE_LIST_QUERY.replace('WHERE e.is_active = 1', 'WHERE e.id = ?')).get(id));
  } catch (error) {
    next(error);
  }
});

edgesRouter.delete('/:id', authenticate, allow('ADMIN'), (req, res) => {
  const result = db.prepare('UPDATE edges SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    String(req.params.id)
  );
  if (result.changes === 0) {
    res.status(404).json({ error: 'Edge not found' });
    return;
  }
  res.status(204).send();
});
