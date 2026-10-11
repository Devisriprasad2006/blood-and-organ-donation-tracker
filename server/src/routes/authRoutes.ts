import { Router } from 'express';
import { 
  loginHandler, 
  registerHandler, 
  getMeHandler, 
  updateDonorProfileHandler, 
  loginSchema, 
  registerSchema 
} from '../controllers/authController.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateJwt, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/login', validateBody(loginSchema), loginHandler);
router.post('/register', validateBody(registerSchema), registerHandler);
router.get('/me', authenticateJwt, getMeHandler);
router.put('/donor-profile', authenticateJwt, requireRole('DONOR'), updateDonorProfileHandler);

export default router;
