import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { loginUser, registerUser, getCurrentUser, updateDonorProfile } from '../services/authService.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(8, 'Contact phone is required'),
  role: z.enum(['DONOR', 'RECIPIENT', 'HOSPITAL', 'BLOOD_BANK', 'COORDINATOR', 'REVIEWER', 'ADMINISTRATOR']),
  city: z.string().optional().default('Chennai'),
  region: z.string().optional().default('Tamil Nadu'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  donationType: z.enum(['BLOOD_ONLY', 'ORGAN_ONLY', 'BOTH']).optional(),
  age: z.number().min(18).max(65).optional(),
  weightKg: z.number().min(45).optional(),
});

export async function loginHandler(req: Request, res: Response, _next: NextFunction) {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = await loginUser(email, password, clientIp);
    res.json({
      success: true,
      message: 'Authentication successful',
      token: result.token,
      user: result.user,
      donorProfile: result.donorProfile,
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
}

export async function registerHandler(req: Request, res: Response, _next: NextFunction) {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = await registerUser({
      ...req.body,
      clientIp,
    });
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: result.token,
      user: result.user,
      donorProfile: result.donorProfile,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

export async function getMeHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const profile = await getCurrentUser(req.user.userId);
    res.json({
      success: true,
      user: profile,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function updateDonorProfileHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const updated = await updateDonorProfile(req.user.userId, req.body, req.user.fullName);
    res.json({
      success: true,
      message: 'Donor preferences and statutory consent updated',
      donorProfile: updated,
    });
  } catch (err: any) {
    next(err);
  }
}
