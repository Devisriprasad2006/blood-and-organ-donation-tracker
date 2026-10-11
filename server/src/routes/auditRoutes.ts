import { Router } from 'express';
import { getAuditLogsHandler } from '../controllers/auditController.js';
import { authenticateJwt, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/logs', authenticateJwt, requireRole('ADMINISTRATOR', 'REVIEWER'), getAuditLogsHandler);

export default router;
