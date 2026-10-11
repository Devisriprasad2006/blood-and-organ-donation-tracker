import { query, execute } from '../db/connection.js';
import { recordAuditLog } from './auditService.js';
import { createNotification } from './notificationService.js';
import type { OrganDonationIntentEntity, OrganWorkflowStatus, BloodGroup, OrganType } from '../types/index.js';

export async function createOrganIntent(params: {
  donorId: string;
  donorName: string;
  donorAge: number;
  donorBloodGroup: BloodGroup;
  donorCity: string;
  organsIntended: OrganType[];
  primaryHospitalId: string;
  primaryHospitalName: string;
  notes?: string;
  actor: string;
  actorRole: string;
}) {
  const id = `org-pledge-${Date.now()}`;
  const organsJson = JSON.stringify(params.organsIntended);
  const status: OrganWorkflowStatus = 'Registration Submitted';

  await execute(
    `INSERT INTO organ_donation_intents (id, donor_id, donor_name, donor_age, donor_blood_group, donor_city, organs_intended, status, consent_form_signed, nok_consent_recorded, primary_hospital_id, primary_hospital_name, transplant_coordinator, authorized_approval_number, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?, 'Awaiting Coordinator Allocation', NULL, ?)`,
    [
      id,
      params.donorId,
      params.donorName,
      params.donorAge,
      params.donorBloodGroup,
      params.donorCity,
      organsJson,
      status,
      params.primaryHospitalId,
      params.primaryHospitalName,
      params.notes || 'Voluntary anatomical gift registration submitted online.',
    ]
  );

  await recordAuditLog({
    actor: params.actor,
    role: params.actorRole,
    action: 'ORGAN_INTENT_REGISTERED',
    entityType: 'ORGAN_WORKFLOW',
    details: `Registered expression of organ donation intent ${id} for organs [${params.organsIntended.join(', ')}] with ${params.primaryHospitalName}`,
  });

  await createNotification({
    recipientUserId: params.donorId,
    title: 'Organ Pledge Registration Received',
    message: `Your voluntary intent to donate (${params.organsIntended.join(', ')}) has been registered under national anatomical gift coordination protocols. Case ID: ${id}.`,
    type: 'ORGAN_UPDATE',
    actionUrl: '/organ-donation',
  });

  const rows = await query<OrganDonationIntentEntity>(`SELECT * FROM organ_donation_intents WHERE id = ?`, [id]);
  return rows[0];
}

export async function getOrganIntents(filters?: {
  status?: string;
  search?: string;
  hospitalId?: string;
}) {
  let sql = `SELECT * FROM organ_donation_intents WHERE 1=1`;
  const params: any[] = [];

  if (filters?.status) {
    sql += ` AND status = ?`;
    params.push(filters.status);
  }
  if (filters?.hospitalId) {
    sql += ` AND primary_hospital_id = ?`;
    params.push(filters.hospitalId);
  }
  if (filters?.search) {
    sql += ` AND (donor_name LIKE ? OR primary_hospital_name LIKE ? OR transplant_coordinator LIKE ?)`;
    const t = `%${filters.search}%`;
    params.push(t, t, t);
  }

  sql += ` ORDER BY created_at DESC`;
  const rows = await query<any>(sql, params);

  return rows.map(r => ({
    ...r,
    organs_intended: typeof r.organs_intended === 'string' ? JSON.parse(r.organs_intended) : r.organs_intended,
  }));
}

export async function updateOrganIntentStatus(params: {
  intentId: string;
  status: OrganWorkflowStatus;
  transplantCoordinator?: string;
  authorizedApprovalNumber?: string;
  notes?: string;
  nokConsentRecorded?: boolean;
  actor: string;
  actorRole: string;
}) {
  const existing = await query<OrganDonationIntentEntity>(`SELECT * FROM organ_donation_intents WHERE id = ?`, [params.intentId]);
  if (existing.length === 0) throw new Error('Organ pledge case not found');

  const current = existing[0];
  const fields: string[] = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
  const values: any[] = [params.status];

  if (params.transplantCoordinator) {
    fields.push('transplant_coordinator = ?');
    values.push(params.transplantCoordinator);
  }
  if (params.authorizedApprovalNumber) {
    fields.push('authorized_approval_number = ?');
    values.push(params.authorizedApprovalNumber);
  }
  if (params.notes) {
    fields.push('notes = ?');
    values.push(params.notes);
  }
  if (params.nokConsentRecorded !== undefined) {
    fields.push('nok_consent_recorded = ?');
    values.push(params.nokConsentRecorded ? 1 : 0);
  }

  values.push(params.intentId);
  await execute(`UPDATE organ_donation_intents SET ${fields.join(', ')} WHERE id = ?`, values);

  await recordAuditLog({
    actor: params.actor,
    role: params.actorRole,
    action: 'ORGAN_INTENT_STATUS_UPDATE',
    entityType: 'ORGAN_WORKFLOW',
    details: `Updated organ intent ${params.intentId} from '${current.status}' to '${params.status}'. Approval: ${params.authorizedApprovalNumber || 'N/A'}`,
  });

  await createNotification({
    recipientUserId: current.donor_id,
    title: `Organ Coordination Update: ${params.status}`,
    message: `Your donation coordination case status has progressed to '${params.status}'. ${params.notes || ''}`,
    type: 'ORGAN_UPDATE',
    actionUrl: '/organ-donation',
  });

  const updated = await query<any>(`SELECT * FROM organ_donation_intents WHERE id = ?`, [params.intentId]);
  return {
    ...updated[0],
    organs_intended: typeof updated[0].organs_intended === 'string' ? JSON.parse(updated[0].organs_intended) : updated[0].organs_intended,
  };
}

export async function getOrganRequests() {
  return query(`SELECT * FROM organ_requests ORDER BY created_at DESC`);
}
