import { Router } from 'express';
import { getAnalyticsOverviewHandler } from '../controllers/analyticsController.js';

const router = Router();

router.get('/overview', getAnalyticsOverviewHandler);

export default router;
