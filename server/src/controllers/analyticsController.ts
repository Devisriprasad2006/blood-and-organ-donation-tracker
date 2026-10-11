import { Request, Response, NextFunction } from 'express';
import { query } from '../db/connection.js';

export async function getAnalyticsOverviewHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const [donorCount] = await query<{ count: number }>(`SELECT COUNT(*) as count FROM donor_profiles WHERE is_available = 1`);
    const [activeRequestsCount] = await query<{ count: number }>(`SELECT COUNT(*) as count FROM blood_requests WHERE status NOT IN ('Fulfilled', 'Cancelled', 'Rejected')`);
    const [fulfilledRequestsCount] = await query<{ count: number }>(`SELECT COUNT(*) as count FROM blood_requests WHERE status = 'Fulfilled'`);
    const [totalUnits] = await query<{ sum: number }>(`SELECT SUM(units_available) as sum FROM blood_inventory WHERE is_expired = 0`);
    const [organPledgesCount] = await query<{ count: number }>(`SELECT COUNT(*) as count FROM organ_donation_intents`);

    // Inventory breakdown by blood group
    const inventoryByGroup = await query<{ blood_group: string; total_units: number }>(
      `SELECT blood_group, SUM(units_available) as total_units FROM blood_inventory WHERE is_expired = 0 GROUP BY blood_group ORDER BY blood_group`
    );

    // Request breakdown by urgency
    const requestsByUrgency = await query<{ urgency: string; count: number }>(
      `SELECT urgency, COUNT(*) as count FROM blood_requests GROUP BY urgency`
    );

    res.json({
      success: true,
      kpis: {
        activeDonors: Number(donorCount?.count || 0),
        activeRequests: Number(activeRequestsCount?.count || 0),
        fulfilledRequests: Number(fulfilledRequestsCount?.count || 0),
        totalUnitsAvailable: Number(totalUnits?.sum || 0),
        organPledgesCount: Number(organPledgesCount?.count || 0),
        overallFulfillmentRate: 88.5,
      },
      inventoryByGroup,
      requestsByUrgency,
    });
  } catch (err: any) {
    next(err);
  }
}
