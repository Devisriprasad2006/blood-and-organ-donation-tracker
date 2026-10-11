import { Router } from 'express';
import { 
  getUserNotificationsHandler, 
  markAsReadHandler, 
  markAllAsReadHandler 
} from '../controllers/notificationController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateJwt, getUserNotificationsHandler);
router.put('/:id/read', authenticateJwt, markAsReadHandler);
router.put('/read-all', authenticateJwt, markAllAsReadHandler);

export default router;
