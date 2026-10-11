import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { 
  createBloodRequest, 
  getBloodRequests, 
  getBloodRequestById, 
  updateBloodRequestStatus 
} from '../services/bloodRequestService.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const createBloodRequestSchema = z.object({
  patientName: z.string().min(2, 'Patient name required'),
  patientAge: z.number().int().min(0).max(120),
  hospitalName: z.string().min(2, 'Hospital name required'),
  hospitalCity: z.string().optional().default('Chennai'),
  hospitalLatitude: z.number().optional().default(13.0827),
  hospitalLongitude: z.number().optional().default(80.2707),
  doctorInCharge: z.string().min(2, 'Doctor name required'),
  contactPhone: z.string().min(8, 'Emergency contact phone required'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  componentType: z.enum(['Whole Blood', 'Packed RBC', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate']),
  unitsRequired: z.number().int().positive('Units required must be greater than zero'),
  urgency: z.enum(['CRITICAL_EMERGENCY', 'CRITICAL_SOS', 'URGENT', 'HIGH', 'ROUTINE']),
  requiredByDate: z.string().min(5, 'Required-by date and time required'),
  clinicalDiagnosis: z.string().min(5, 'Clinical diagnosis and indication required'),
  radiusKm: z.number().optional(),
});

export const updateStatusSchema = z.object({
  newStatus: z.enum(['Draft', 'Submitted', 'Under Review', 'Matching', 'Donor Contacted', 'Fulfilled', 'Rejected', 'Cancelled', 'Expired']),
  note: z.string().min(2, 'Clinical note required'),
});

export async function getBloodRequestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, bloodGroup, urgency, requesterId, search } = req.query;
    const requests = await getBloodRequests({
      status: status as string,
      bloodGroup: bloodGroup as string,
      urgency: urgency as string,
      requesterId: requesterId as string,
      search: search as string,
    });
    res.json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function getBloodRequestByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const request = await getBloodRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Blood request not found' });
    }
    res.json({
      success: true,
      request,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function createBloodRequestHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const requesterId = req.user?.userId || 'usr-anonymous-req';
    const requesterName = req.user?.fullName || 'Emergency Coordinator';
    const requesterRole = req.user?.role || 'HOSPITAL';

    const result = await createBloodRequest({
      ...req.body,
      requesterId,
      requesterName,
      requesterRole,
    });

    res.status(201).json({
      success: true,
      message: 'Blood request created and broadcasted to grid',
      request: result.request,
      matchedDonors: result.matchedDonors,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function updateBloodRequestStatusHandler(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const actor = req.user?.fullName || 'Healthcare Staff';
    const actorRole = req.user?.role || 'HOSPITAL';
    const { id } = req.params;
    const { newStatus, note } = req.body;

    const updated = await updateBloodRequestStatus({
      requestId: id,
      newStatus,
      note,
      actor,
      actorRole,
    });

    res.json({
      success: true,
      message: `Status updated to ${newStatus}`,
      request: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}
