import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { allow, authenticate } from '../middleware/auth.js';

// Not an explicit README §20-25 API section, but required by the System
// Settings frontend view (README §26/§27) which manages the system_settings
// table (README §19). Admin-gated, matching the nodes/edges CRUD pattern.
export const settingsRouter = Router();

settingsRouter.get('/', authenticate, (_req, res) => {
  res.json({ data: db.prepare('SELECT setting_key, setting_value, description, updated_at FROM system_settings ORDER BY setting_key').all() });
});

settingsRouter.put('/:key', authenticate, allow('ADMIN'), (req, res, next) => {
  try {
    const key = String(req.params.key);
    const body = z.object({ value: z.string().min(1).max(255) }).parse(req.body);
    const result = db
      .prepare('UPDATE system_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?')
      .run(body.value, key);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }
    res.json(db.prepare('SELECT setting_key, setting_value, description, updated_at FROM system_settings WHERE setting_key = ?').get(key));
  } catch (error) {
    next(error);
  }
});
