import { query, execute } from '../db/connection.js';
import { recordAuditLog } from './auditService.js';
import { createNotification } from './notificationService.js';
import { emitInventoryUpdate } from '../realtime/socket.js';
import { config } from '../config/env.js';

let intervalTimer: NodeJS.Timeout | null = null;

export function startBackgroundScheduler(): void {
  console.log(`[Scheduler] Starting background health monitoring service (Interval: ${config.monitoring.intervalMs}ms)...`);

  intervalTimer = setInterval(async () => {
    try {
      await checkInventoryExpiryAndStock();
    } catch (err) {
      console.error('[Scheduler Error] Background check encountered an error:', err);
    }
  }, config.monitoring.intervalMs);
}

export function stopBackgroundScheduler(): void {
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
    console.log('[Scheduler] Background health monitoring stopped.');
  }
}

async function checkInventoryExpiryAndStock(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  // 1. Detect expired batches
  const expiredBatches = await query<any>(
    `SELECT * FROM blood_inventory WHERE expiry_date <= ? AND is_expired = 0`,
    [today]
  );

  for (const batch of expiredBatches) {
    await execute(
      `UPDATE blood_inventory SET is_expired = 1, units_available = 0, is_low_stock = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [batch.id]
    );

    await recordAuditLog({
      actor: 'System Automated Scheduler',
      role: 'SYSTEM',
      action: 'INVENTORY_BATCH_EXPIRED',
      entityType: 'INVENTORY',
      details: `Batch ${batch.batch_number} (${batch.blood_group} ${batch.component_type}) has reached its expiration date (${batch.expiry_date}). Units quarantined from available stock.`,
      status: 'FLAGGED',
    });

    // Notify blood bank admin
    const bbAdmins = await query<any>(`SELECT id FROM users WHERE role = 'BLOOD_BANK'`);
    for (const admin of bbAdmins) {
      await createNotification({
        recipientUserId: admin.id,
        title: 'Batch Expired & Quarantined',
        message: `Batch ${batch.batch_number} (${batch.blood_group} ${batch.component_type}) has expired. Quarantined from available inventory.`,
        type: 'INVENTORY_WARNING',
        actionUrl: '/inventory',
      });
    }

    emitInventoryUpdate({ ...batch, is_expired: 1, units_available: 0 });
  }

  // 2. Detect low stock items
  const lowStockBatches = await query<any>(
    `SELECT * FROM blood_inventory WHERE units_available <= 5 AND is_expired = 0 AND is_low_stock = 0`
  );

  for (const item of lowStockBatches) {
    await execute(`UPDATE blood_inventory SET is_low_stock = 1 WHERE id = ?`, [item.id]);
    emitInventoryUpdate({ ...item, is_low_stock: 1 });
  }
}
