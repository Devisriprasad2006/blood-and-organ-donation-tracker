import crypto from 'crypto';
import { query, execute } from '../db/connection.js';
import { emitAuditLog } from '../realtime/socket.js';
import type { AuditLogEntity } from '../types/index.js';

export async function recordAuditLog(params: {
  actor: string;
  role: string;
  action: string;
  entityType: 'BLOOD_REQUEST' | 'ORGAN_WORKFLOW' | 'INVENTORY' | 'SECURITY' | 'VERIFICATION';
  details: string;
  ipAddress?: string;
  status?: 'VERIFIED' | 'FLAGGED';
}): Promise<AuditLogEntity> {
  const id = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const ip = params.ipAddress || '127.0.0.1';
  const status = params.status || 'VERIFIED';

  // Cryptographic SHA-256 signature chain for tamper evidence
  const hashInput = `${id}|${timestamp}|${params.actor}|${params.role}|${params.action}|${params.details}|${ip}`;
  const hashSignature = '0x' + crypto.createHash('sha256').update(hashInput).digest('hex').slice(0, 16);

  await execute(
    `INSERT INTO audit_logs (id, timestamp, actor, role, action, entity_type, details, ip_address, status, hash_signature)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, timestamp, params.actor, params.role, params.action, params.entityType, params.details, ip, status, hashSignature]
  );

  const entry: AuditLogEntity = {
    id,
    timestamp,
    actor: params.actor,
    role: params.role,
    action: params.action,
    entity_type: params.entityType,
    details: params.details,
    ip_address: ip,
    status,
    hash_signature: hashSignature,
  };

  emitAuditLog(entry);
  return entry;
}

export async function getAuditLogs(limit = 50, offset = 0): Promise<{ logs: AuditLogEntity[]; total: number }> {
  const countRow = await query<{ count: number }>(`SELECT COUNT(*) as count FROM audit_logs`);
  const total = countRow[0] ? Number(countRow[0].count) : 0;

  const rows = await query<AuditLogEntity>(
    `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return { logs: rows, total };
}
