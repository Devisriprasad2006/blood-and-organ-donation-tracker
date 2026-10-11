import { query, transaction } from '../db/connection.js';
import { recordAuditLog } from './auditService.js';
import { emitInventoryUpdate } from '../realtime/socket.js';
import type { BloodInventoryEntity, BloodGroup, BloodComponentType } from '../types/index.js';

export async function getInventory(filters?: {
  bloodGroup?: string;
  componentType?: string;
  isLowStock?: boolean;
  bloodBankId?: string;
  search?: string;
}) {
  let sql = `SELECT * FROM blood_inventory WHERE 1=1`;
  const params: any[] = [];

  if (filters?.bloodGroup) {
    sql += ` AND blood_group = ?`;
    params.push(filters.bloodGroup);
  }
  if (filters?.componentType) {
    sql += ` AND component_type = ?`;
    params.push(filters.componentType);
  }
  if (filters?.isLowStock) {
    sql += ` AND is_low_stock = 1`;
  }
  if (filters?.bloodBankId) {
    sql += ` AND blood_bank_id = ?`;
    params.push(filters.bloodBankId);
  }
  if (filters?.search) {
    sql += ` AND (blood_bank_name LIKE ? OR batch_number LIKE ? OR storage_rack LIKE ?)`;
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }

  sql += ` ORDER BY blood_group ASC, component_type ASC`;
  const items = await query<BloodInventoryEntity>(sql, params);

  // Calculate aggregates
  const totalAvailable = items.reduce((sum, item) => sum + item.units_available, 0);
  const totalReserved = items.reduce((sum, item) => sum + item.units_reserved, 0);
  const lowStockCount = items.filter(item => item.is_low_stock).length;

  return {
    items,
    totalAvailable,
    totalReserved,
    lowStockCount,
  };
}

export async function restockInventory(params: {
  bloodBankId: string;
  bloodBankName: string;
  bloodGroup: BloodGroup;
  componentType: BloodComponentType;
  unitsToAdd: number;
  batchNumber?: string;
  storageRack?: string;
  collectionDate?: string;
  expiryDate?: string;
  actor: string;
  role: string;
}) {
  if (params.unitsToAdd <= 0) {
    throw new Error('Restock quantity must be a positive integer');
  }

  const batchNumber = params.batchNumber || `BATCH-${Date.now()}-${params.bloodGroup.replace('+', 'POS').replace('-', 'NEG')}`;
  const rack = params.storageRack || 'COLD-RACK-GEN';
  const collDate = params.collectionDate || new Date().toISOString().slice(0, 10);
  
  // Default shelf-life: Platelets 5 days, Packed RBC 42 days, FFP 365 days, Whole Blood 35 days
  let expDate = params.expiryDate;
  if (!expDate) {
    const d = new Date(collDate);
    if (params.componentType === 'Platelets') d.setDate(d.getDate() + 5);
    else if (params.componentType === 'Fresh Frozen Plasma') d.setDate(d.getDate() + 365);
    else if (params.componentType === 'Packed RBC') d.setDate(d.getDate() + 42);
    else d.setDate(d.getDate() + 35);
    expDate = d.toISOString().slice(0, 10);
  }

  const result = await transaction(async (trx) => {
    // Check if identical active batch exists
    const existing = await trx.query<BloodInventoryEntity>(
      `SELECT * FROM blood_inventory WHERE blood_bank_id = ? AND blood_group = ? AND component_type = ? AND batch_number = ?`,
      [params.bloodBankId, params.bloodGroup, params.componentType, batchNumber]
    );

    let updatedItem: BloodInventoryEntity;

    if (existing.length > 0) {
      const item = existing[0];
      const newAvail = item.units_available + params.unitsToAdd;
      const isLow = newAvail <= 5 ? 1 : 0;
      await trx.execute(
        `UPDATE blood_inventory SET units_available = ?, is_low_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [newAvail, isLow, item.id]
      );
      const rows = await trx.query<BloodInventoryEntity>(`SELECT * FROM blood_inventory WHERE id = ?`, [item.id]);
      updatedItem = rows[0];
    } else {
      const id = `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const isLow = params.unitsToAdd <= 5 ? 1 : 0;
      const today = new Date().toISOString().slice(0, 10);
      await trx.execute(
        `INSERT INTO blood_inventory (id, blood_bank_id, blood_bank_name, blood_group, component_type, units_available, units_reserved, storage_rack, batch_number, collection_date, expiry_date, is_low_stock, is_expired, last_audited_date)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 0, ?)`,
        [id, params.bloodBankId, params.bloodBankName, params.bloodGroup, params.componentType, params.unitsToAdd, rack, batchNumber, collDate, expDate, isLow, today]
      );
      const rows = await trx.query<BloodInventoryEntity>(`SELECT * FROM blood_inventory WHERE id = ?`, [id]);
      updatedItem = rows[0];
    }

    // Record inventory movement ledger
    const movId = `mov-${Date.now()}`;
    await trx.execute(
      `INSERT INTO inventory_movements (id, item_id, blood_group, component_type, action, quantity, reason, performed_by)
       VALUES (?, ?, ?, ?, 'RESTOCK', ?, ?, ?)`,
      [movId, updatedItem.id, params.bloodGroup, params.componentType, params.unitsToAdd, 'Authorized cold-chain stock intake', params.actor]
    );

    return updatedItem;
  });

  await recordAuditLog({
    actor: params.actor,
    role: params.role,
    action: 'INVENTORY_RESTOCK',
    entityType: 'INVENTORY',
    details: `Added ${params.unitsToAdd} units of ${params.bloodGroup} (${params.componentType}) to ${params.bloodBankName} (Batch: ${batchNumber})`,
  });

  emitInventoryUpdate(result);
  return result;
}

/**
 * Concurrency protected Reservation: prevents overselling and negative inventory
 */
export async function reserveUnits(params: {
  itemId: string;
  unitsToReserve: number;
  actor: string;
  role: string;
  reason: string;
}) {
  if (params.unitsToReserve <= 0) {
    throw new Error('Reservation units must be positive');
  }

  const result = await transaction(async (trx) => {
    const rows = await trx.query<BloodInventoryEntity>(`SELECT * FROM blood_inventory WHERE id = ?`, [params.itemId]);
    if (rows.length === 0) {
      throw new Error('Inventory batch item not found');
    }
    const item = rows[0];

    if (item.is_expired) {
      throw new Error('Cannot reserve units from an expired batch');
    }

    if (item.units_available < params.unitsToReserve) {
      throw new Error(`Insufficient stock. Requested: ${params.unitsToReserve}, Available: ${item.units_available}`);
    }

    const newAvail = item.units_available - params.unitsToReserve;
    const newReserved = item.units_reserved + params.unitsToReserve;
    const isLow = newAvail <= 5 ? 1 : 0;

    await trx.execute(
      `UPDATE blood_inventory SET units_available = ?, units_reserved = ?, is_low_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newAvail, newReserved, isLow, item.id]
    );

    const movId = `mov-${Date.now()}`;
    await trx.execute(
      `INSERT INTO inventory_movements (id, item_id, blood_group, component_type, action, quantity, reason, performed_by)
       VALUES (?, ?, ?, ?, 'RESERVE', ?, ?, ?)`,
      [movId, item.id, item.blood_group, item.component_type, params.unitsToReserve, params.reason, params.actor]
    );

    const updated = await trx.query<BloodInventoryEntity>(`SELECT * FROM blood_inventory WHERE id = ?`, [item.id]);
    return updated[0];
  });

  await recordAuditLog({
    actor: params.actor,
    role: params.role,
    action: 'INVENTORY_RESERVED',
    entityType: 'INVENTORY',
    details: `Reserved ${params.unitsToReserve} units of ${result.blood_group} (${result.component_type}). Reason: ${params.reason}`,
  });

  emitInventoryUpdate(result);
  return result;
}

/**
 * Dispatch reserved blood units to hospital
 */
export async function dispatchUnits(params: {
  itemId: string;
  unitsToDispatch: number;
  actor: string;
  role: string;
  destinationHospital: string;
}) {
  if (params.unitsToDispatch <= 0) {
    throw new Error('Dispatch quantity must be positive');
  }

  const result = await transaction(async (trx) => {
    const rows = await trx.query<BloodInventoryEntity>(`SELECT * FROM blood_inventory WHERE id = ?`, [params.itemId]);
    if (rows.length === 0) throw new Error('Inventory batch item not found');
    const item = rows[0];

    if (item.units_reserved < params.unitsToDispatch) {
      throw new Error(`Cannot dispatch more than reserved units (${item.units_reserved} reserved)`);
    }

    const newReserved = item.units_reserved - params.unitsToDispatch;
    await trx.execute(
      `UPDATE blood_inventory SET units_reserved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newReserved, item.id]
    );

    const movId = `mov-${Date.now()}`;
    await trx.execute(
      `INSERT INTO inventory_movements (id, item_id, blood_group, component_type, action, quantity, reason, performed_by)
       VALUES (?, ?, ?, ?, 'DISPATCH', ?, ?, ?)`,
      [movId, item.id, item.blood_group, item.component_type, params.unitsToDispatch, `Dispatched to ${params.destinationHospital}`, params.actor]
    );

    const updated = await trx.query<BloodInventoryEntity>(`SELECT * FROM blood_inventory WHERE id = ?`, [item.id]);
    return updated[0];
  });

  await recordAuditLog({
    actor: params.actor,
    role: params.role,
    action: 'INVENTORY_DISPATCHED',
    entityType: 'INVENTORY',
    details: `Dispatched ${params.unitsToDispatch} units of ${result.blood_group} to ${params.destinationHospital}`,
  });

  emitInventoryUpdate(result);
  return result;
}
