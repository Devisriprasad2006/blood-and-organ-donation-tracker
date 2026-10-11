import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { findMatchingDonors } from '../services/matchingService.js';

export const matchingQuerySchema = z.object({
  recipientBloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  componentType: z.enum(['Whole Blood', 'Packed RBC', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate']).optional().default('Packed RBC'),
  urgency: z.enum(['CRITICAL_EMERGENCY', 'CRITICAL_SOS', 'URGENT', 'HIGH', 'ROUTINE']).optional().default('URGENT'),
  targetLatitude: z.number().optional().default(13.0827),
  targetLongitude: z.number().optional().default(80.2707),
  radiusKm: z.number().optional().default(30),
});

export async function matchDonorsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const params = matchingQuerySchema.parse(req.body);
    const candidates = await findMatchingDonors({
      recipientBloodGroup: params.recipientBloodGroup,
      componentType: params.componentType,
      urgency: params.urgency,
      targetLatitude: params.targetLatitude,
      targetLongitude: params.targetLongitude,
      maxRadiusKm: params.radiusKm,
    });

    res.json({
      success: true,
      engine: 'LifeLink Rule-Based Clinical Matching Engine v3.0',
      compatibilityStandard: 'Statutory ABO/Rh Hemotherapy Protocol',
      query: params,
      candidatesCount: candidates.length,
      candidates,
    });
  } catch (err: any) {
    next(err);
  }
}
