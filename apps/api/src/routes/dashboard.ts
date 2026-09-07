import { Router } from 'express';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/metrics', authenticate, (_req, res) => {
  const latest = db
    .prepare('SELECT active_nodes, operational_rate, system_load_ms, recorded_at FROM system_metrics ORDER BY recorded_at DESC LIMIT 1')
    .get() as { active_nodes: number; operational_rate: number; system_load_ms: number; recorded_at: string } | undefined;

  const activeEdges = (db.prepare('SELECT count(*) as c FROM edges WHERE is_active = 1').get() as { c: number }).c;
  const totalOperations = (db.prepare('SELECT count(*) as c FROM operation_logs').get() as { c: number }).c;
  const avgProcessingTime = (
    db.prepare('SELECT avg(processing_time_ms) as a FROM operation_logs').get() as { a: number | null }
  ).a;

  res.json({
    active_nodes: latest?.active_nodes ?? 0,
    active_edges: activeEdges,
    operational_rate: latest?.operational_rate ?? 100,
    average_processing_time_ms: avgProcessingTime ? Math.round(avgProcessingTime) : 0,
    total_operations: totalOperations,
    system_load_ms: latest?.system_load_ms ?? 0
  });
});
