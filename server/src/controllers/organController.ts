import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { 
  createOrganIntent, 
  getOrganIntents, 
  updateOrganIntentStatus, 
  getOrganRequests 
} from '../services/organCoordinationService.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const createOrganIntentSchema = z.object({
  donorName: z.string().min(2),
  donorAge: z.number().int().min(18).max(90),
  donorBloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  donorCity: z.string().optional().default('Chennai'),
  organsIntended: z.array(z.enum(['Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas', 'Cornea'])).min(1),
  primaryHospitalId: z.string().optional().default('hosp-1'),
  primaryHospitalName: z.string().optional().default('Rajiv Gandhi Government General Hospital'),
  notes: z.string().optional(),
});

export const updateOrganStatusSchema = z.object({
  status: z.enum([
    'Registration Submitted',
    'Awaiting Verification',
    'Verified',
    'Coordination in Progress',
    'Awaiting Authorized Review',
    'Approved by Authorized Authority',
    'Completed',
    'Cancelled'
  ]),
  transplantCoordinator: z.string().optional(),
  authorizedApprovalNumber: z.string().optional(),
  notes: z.string().optional(),
  nokConsentRecorded: z.boolean().optional(),
});

export async function getOrganIntentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, search, hospitalId } = req.query;
    const intents = await getOrganIntents({
      status: status as string,
      search: search as string,
      hospitalId: hospitalId as string,
    });
    res.json({
      success: true,
      intents,
      count: intents.length,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function createOrganIntentHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const donorId = req.user?.userId || `usr-anon-${Date.now()}`;
    const actor = req.user?.fullName || req.body.donorName;
    const actorRole = req.user?.role || 'DONOR';

    const intent = await createOrganIntent({
      donorId,
      ...req.body,
      actor,
      actorRole,
    });

    res.status(201).json({
      success: true,
      message: 'Voluntary expression of organ donation intent registered under NOTTO protocols',
      intent,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function updateOrganIntentStatusHandler(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const actor = req.user?.fullName || 'Transplant Coordinator';
    const actorRole = req.user?.role || 'COORDINATOR';
    const { id } = req.params;

    const updated = await updateOrganIntentStatus({
      intentId: id,
      ...req.body,
      actor,
      actorRole,
    });

    res.json({
      success: true,
      message: `Coordination case status updated to ${req.body.status}`,
      intent: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

export async function getOrganRequestsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const requests = await getOrganRequests();
    res.json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (err: any) {
    next(err);
  }
}
