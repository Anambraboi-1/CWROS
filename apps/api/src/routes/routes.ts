import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { calculateShortestRoute } from '../services/routing.js';

export const routesRouter = Router();

const shortestPathSchema = z.object({ source: z.string().min(1).max(5), destination: z.string().min(1).max(5) });

routesRouter.post('/shortest-path', authenticate, (req, res, next) => {
  try {
    const body = shortestPathSchema.parse(req.body);
    const result = calculateShortestRoute(body.source, body.destination, req.identity?.id);
    if (!result.success) {
      res.status(422).json(result);
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});
