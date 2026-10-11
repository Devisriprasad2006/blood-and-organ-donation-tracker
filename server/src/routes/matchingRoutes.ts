import { Router } from 'express';
import { matchDonorsHandler } from '../controllers/matchingController.js';

const router = Router();

router.post('/find-donors', matchDonorsHandler);

export default router;
