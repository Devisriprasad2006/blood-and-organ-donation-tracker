import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getInventory, restockInventory, reserveUnits, dispatchUnits } from '../services/bloodInventoryService.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const restockSchema = z.object({
  bloodBankId: z.string(),
  bloodBankName: z.string(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  componentType: z.enum(['Whole Blood', 'Packed RBC', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate']),
  unitsToAdd: z.number().int().positive('Units must be greater than zero'),
  batchNumber: z.string().optional(),
  storageRack: z.string().optional(),
  collectionDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

export const reserveSchema = z.object({
  itemId: z.string(),
  unitsToReserve: z.number().int().positive('Reservation quantity must be positive'),
  reason: z.string().min(3, 'Clinical reason required'),
});

export const dispatchSchema = z.object({
  itemId: z.string(),
  unitsToDispatch: z.number().int().positive('Dispatch quantity must be positive'),
  destinationHospital: z.string().min(2, 'Destination facility required'),
});

export async function getInventoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { bloodGroup, componentType, isLowStock, search, bloodBankId } = req.query;
    const data = await getInventory({
      bloodGroup: bloodGroup as string,
      componentType: componentType as string,
      isLowStock: isLowStock === 'true',
      bloodBankId: bloodBankId as string,
      search: search as string,
    });
    res.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function restockHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const actor = req.user?.fullName || 'Authorized Staff';
    const role = req.user?.role || 'BLOOD_BANK';
    const item = await restockInventory({
      ...req.body,
      actor,
      role,
    });
    res.status(201).json({
      success: true,
      message: `Restocked ${req.body.unitsToAdd} units of ${req.body.bloodGroup} (${req.body.componentType}) successfully`,
      item,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function reserveHandler(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const actor = req.user?.fullName || 'Hospital Staff';
    const role = req.user?.role || 'HOSPITAL';
    const item = await reserveUnits({
      ...req.body,
      actor,
      role,
    });
    res.json({
      success: true,
      message: `Reserved ${req.body.unitsToReserve} units successfully`,
      item,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

export async function dispatchHandler(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const actor = req.user?.fullName || 'Blood Bank Dispatcher';
    const role = req.user?.role || 'BLOOD_BANK';
    const item = await dispatchUnits({
      ...req.body,
      actor,
      role,
    });
    res.json({
      success: true,
      message: `Dispatched ${req.body.unitsToDispatch} units successfully`,
      item,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}
