import { Router } from 'express';
import { 
  getOrganIntentsHandler, 
  createOrganIntentHandler, 
  updateOrganIntentStatusHandler, 
  getOrganRequestsHandler,
  createOrganIntentSchema,
  updateOrganStatusSchema
} from '../controllers/organController.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateJwt, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/intents', getOrganIntentsHandler);
router.post('/intents', authenticateJwt, validateBody(createOrganIntentSchema), createOrganIntentHandler);
router.put(
  '/intents/:id/status', 
  authenticateJwt, 
  requireRole('COORDINATOR', 'REVIEWER', 'HOSPITAL', 'ADMINISTRATOR'), 
  validateBody(updateOrganStatusSchema), 
  updateOrganIntentStatusHandler
);
router.get('/requests', getOrganRequestsHandler);

export default router;
