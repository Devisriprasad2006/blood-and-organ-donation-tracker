import { Router } from 'express';
import { 
  getInventoryHandler, 
  restockHandler, 
  reserveHandler, 
  dispatchHandler, 
  restockSchema, 
  reserveSchema, 
  dispatchSchema 
} from '../controllers/bloodInventoryController.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateJwt, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getInventoryHandler);
router.post('/restock', authenticateJwt, requireRole('BLOOD_BANK', 'ADMINISTRATOR'), validateBody(restockSchema), restockHandler);
router.post('/reserve', authenticateJwt, requireRole('HOSPITAL', 'BLOOD_BANK', 'ADMINISTRATOR'), validateBody(reserveSchema), reserveHandler);
router.post('/dispatch', authenticateJwt, requireRole('BLOOD_BANK', 'ADMINISTRATOR'), validateBody(dispatchSchema), dispatchHandler);

export default router;
