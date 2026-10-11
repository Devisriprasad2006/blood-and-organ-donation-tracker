import { Router } from 'express';
import { 
  getBloodRequestsHandler, 
  getBloodRequestByIdHandler, 
  createBloodRequestHandler, 
  updateBloodRequestStatusHandler, 
  createBloodRequestSchema, 
  updateStatusSchema 
} from '../controllers/bloodRequestController.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.get('/', getBloodRequestsHandler);
router.get('/:id', getBloodRequestByIdHandler);
router.post('/', authenticateJwt, validateBody(createBloodRequestSchema), createBloodRequestHandler);
router.put('/:id/status', authenticateJwt, validateBody(updateStatusSchema), updateBloodRequestStatusHandler);

// Public / Quick emergency SOS dispatch endpoint (with or without auth)
router.post('/emergency-sos', validateBody(createBloodRequestSchema), createBloodRequestHandler);

export default router;
