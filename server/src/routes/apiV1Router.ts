import { Router, Request, Response } from 'express';
import { getDbDriver } from '../db/connection.js';
import authRoutes from './authRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import bloodRequestRoutes from './bloodRequestRoutes.js';
import matchingRoutes from './matchingRoutes.js';
import organRoutes from './organRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import auditRoutes from './auditRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = Router();

// Health Check Endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'Digital Blood and Organ Donation Management and Tracking Platform Engine',
    version: '1.0.0',
    platform: 'LifeLink Central Healthcare Grid',
    databaseDriver: getDbDriver().toUpperCase(),
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Mounted versioned sub-routers
router.use('/auth', authRoutes);
router.use('/blood/inventory', inventoryRoutes);
router.use('/blood/requests', bloodRequestRoutes);
router.use('/matching', matchingRoutes);
router.use('/organs', organRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit', auditRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
