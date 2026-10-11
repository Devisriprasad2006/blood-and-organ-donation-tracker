// =============================================================================
// Digital Blood and Organ Donation Management and Tracking System
// Core Node.js / Express / Socket.IO Production Application Server
// =============================================================================

import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { initDatabase, closeDatabase } from './db/connection.js';
import { runMigrations } from './db/migrations.js';
import { runSeeds } from './db/seed.js';
import { initSocketServer } from './realtime/socket.js';
import { startBackgroundScheduler, stopBackgroundScheduler } from './services/schedulerService.js';
import apiV1Router from './routes/apiV1Router.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../dist');

const app = express();
const server = http.createServer(app);

// 1. Security Headers & CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman, vitest)
    if (!origin) return callback(null, true);
    if (config.cors.origin.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// 2. Global Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api/', limiter);

// 3. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Request Logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (config.nodeEnv !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// 5. Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'LifeLink Digital Blood & Organ Platform Engine',
    timestamp: new Date().toISOString(),
  });
});

// 6. Mount Versioned API under /api/v1 and /api
app.use('/api/v1', apiV1Router);
app.use('/api', apiV1Router);

// 7. Serve Built Frontend (Production SPA)
if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
  console.log(`[LifeLink] Serving client production assets from: ${distPath}`);
  app.use(express.static(distPath));

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
} else {
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      service: 'Digital Blood and Organ Donation Management and Tracking System API',
      version: '1.0.0',
      status: 'ONLINE',
    });
  });
}

// 8. Global Error Handler
app.use(errorHandler);

// 8. Socket.IO Initialization
export const io = initSocketServer(server);

// 9. Startup & Initialization Sequence
export async function startServer() {
  try {
    console.log('[LifeLink Boot] Initializing database and storage engine...');
    await initDatabase();

    console.log('[LifeLink Boot] Checking and executing versioned migrations...');
    await runMigrations();

    console.log('[LifeLink Boot] Checking seed dataset...');
    await runSeeds();

    console.log('[LifeLink Boot] Starting background health & inventory monitor...');
    startBackgroundScheduler();

    if (process.env.NODE_ENV !== 'test') {
      server.listen(config.port, () => {
        console.log(`=================================================================`);
        console.log(` LifeLink: Digital Blood & Organ Donation Management Platform `);
        console.log(` Server active on port: ${config.port}`);
        console.log(` Health check URL: http://localhost:${config.port}/api/v1/health`);
        console.log(` Environment: ${config.nodeEnv}`);
        console.log(`=================================================================`);
      });
    }

    return server;
  } catch (err) {
    console.error('[LifeLink Boot Fatal Error] Server failed to start:', err);
    process.exit(1);
  }
}

// Graceful Shutdown Handlers
process.on('SIGTERM', async () => {
  console.log('[LifeLink Shutdown] SIGTERM received. Gracefully closing resources...');
  stopBackgroundScheduler();
  await closeDatabase();
  server.close(() => {
    console.log('[LifeLink Shutdown] Server closed cleanly.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('[LifeLink Shutdown] SIGINT received. Gracefully closing resources...');
  stopBackgroundScheduler();
  await closeDatabase();
  server.close(() => {
    console.log('[LifeLink Shutdown] Server closed cleanly.');
    process.exit(0);
  });
});

// Auto-start if invoked directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, server };
