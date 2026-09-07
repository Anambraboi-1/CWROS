import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { env } from './config.js';
import { db } from './db.js';
import { seedIfEmpty } from './seed.js';
import { authRouter } from './routes/auth.js';
import { nodesRouter } from './routes/nodes.js';
import { edgesRouter } from './routes/edges.js';
import { routesRouter } from './routes/routes.js';
import { dashboardRouter } from './routes/dashboard.js';
import { operationsRouter } from './routes/operations.js';
import { settingsRouter } from './routes/settings.js';
import { usersRouter } from './routes/users.js';

seedIfEmpty();

const app = express();
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/health', (_req, res) => {
  db.prepare('SELECT 1').get();
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/nodes', nodesRouter);
app.use('/api/v1/edges', edgesRouter);
app.use('/api/v1/routes', routesRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/operations', operationsRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/users', usersRouter);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: 'Invalid request', details: error.flatten() });
    return;
  }
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(env.PORT, () => console.log(`CWROS API listening on :${env.PORT}`));
