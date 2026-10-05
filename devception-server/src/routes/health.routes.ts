import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env';

const router = Router();

// GET /health
// Lightweight liveness probe — used by orchestrator and monitoring systems.
router.get('/', (_req: Request, res: Response): void => {
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'ok',
    environment: env.NODE_ENV,
    platform: env.PLATFORM,
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memory: {
      rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
      heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
    },
  });
});

// GET /health/ready
// Readiness probe — checks whether backend dependencies (MongoDB) are ready to handle traffic.
router.get('/ready', (_req: Request, res: Response): void => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /health/db
// Backward-compatible database probe — checks live MongoDB connection state.
router.get('/db', (_req: Request, res: Response): void => {
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const state = mongoose.connection.readyState;
  const statusText = stateMap[state] ?? 'unknown';
  const isHealthy = state === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: statusText,
    healthy: isHealthy,
    host: mongoose.connection.host ?? null,
    db: mongoose.connection.name ?? null,
  });
});

export default router;
