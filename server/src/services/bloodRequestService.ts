import { query, transaction } from '../db/connection.js';
import { recordAuditLog } from './auditService.js';
import { findMatchingDonors } from './matchingService.js';
import { createNotification } from './notificationService.js';
import { emitEmergencySosBroadcast, emitRequestStatusUpdate } from '../realtime/socket.js';
import type { 
  BloodRequestEntity, 
  BloodRequestStatus, 
  BloodGroup, 
  BloodComponentType, 
  RequestUrgency 
} from '../types/index.js';

export async function createBloodRequest(params: {
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  patientName: string;
  patientAge: number;
  hospitalName: string;
  hospitalCity: string;
  hospitalLatitude: number;
  hospitalLongitude: number;
  doctorInCharge: string;
  contactPhone: string;
  bloodGroup: BloodGroup;
  componentType: BloodComponentType;
  unitsRequired: number;
  urgency: RequestUrgency;
  requiredByDate: string;
  clinicalDiagnosis: string;
  radiusKm?: number;
}) {
  const id = `req-${Date.now()}`;
  const status: BloodRequestStatus = 'Submitted';

  // Find compatible donors in proximity
  const matchedDonors = await findMatchingDonors({
    recipientBloodGroup: params.bloodGroup,
    componentType: params.componentType,
    urgency: params.urgency,
    targetLatitude: params.hospitalLatitude,
    targetLongitude: params.hospitalLongitude,
    maxRadiusKm: params.radiusKm || 25,
  });

  const matchedCount = matchedDonors.length;

  const createdRequest = await transaction(async (trx) => {
    await trx.execute(
      `INSERT INTO blood_requests (id, requester_id, patient_name, patient_age, hospital_name, hospital_city, hospital_latitude, hospital_longitude, doctor_in_charge, contact_phone, blood_group, component_type, units_required, units_allocated, urgency, status, required_by_date, clinical_diagnosis, matched_donors_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
      [
        id,
        params.requesterId,
        params.patientName,
        params.patientAge,
        params.hospitalName,
        params.hospitalCity,
        params.hospitalLatitude,
        params.hospitalLongitude,
        params.doctorInCharge,
        params.contactPhone,
        params.bloodGroup,
        params.componentType,
        params.unitsRequired,
        params.urgency,
        status,
        params.requiredByDate,
        params.clinicalDiagnosis,
        matchedCount,
      ]
    );

    // Initial timeline record
    await trx.execute(
      `INSERT INTO blood_request_timeline (request_id, status, note, actor)
       VALUES (?, ?, ?, ?)`,
      [id, status, 'Blood requisition registered in LifeLink Grid', params.requesterName]
    );

    const rows = await trx.query<BloodRequestEntity>(`SELECT * FROM blood_requests WHERE id = ?`, [id]);
    return rows[0];
  });

  // Record audit log
  await recordAuditLog({
    actor: params.requesterName,
    role: params.requesterRole,
    action: 'CREATE_BLOOD_REQUEST',
    entityType: 'BLOOD_REQUEST',
    details: `Created ${params.urgency} blood request ${id} for ${params.unitsRequired} units of ${params.bloodGroup} (${params.componentType}) at ${params.hospitalName}`,
  });

  // If Critical SOS or Emergency, broadcast via Socket.IO
  if (params.urgency === 'CRITICAL_EMERGENCY' || params.urgency === 'CRITICAL_SOS') {
    emitEmergencySosBroadcast(createdRequest);

    // Notify matched donors directly
    for (const donor of matchedDonors.slice(0, 10)) {
      await createNotification({
        recipientUserId: donor.donorId,
        title: `CRITICAL BLOOD SOS: ${params.bloodGroup} Needed`,
        message: `${params.hospitalName} requires ${params.unitsRequired} unit(s) of ${params.bloodGroup} urgently (${params.clinicalDiagnosis.slice(0, 50)}...). You are an eligible matched donor ~${donor.distanceKm}km away.`,
        type: 'EMERGENCY_ALERT',
        actionUrl: `/request-tracking?id=${id}`,
      });
    }
  }

  return {
    request: createdRequest,
    matchedDonors,
  };
}

export async function getBloodRequests(filters?: {
  status?: string;
  bloodGroup?: string;
  urgency?: string;
  requesterId?: string;
  search?: string;
}) {
  let sql = `SELECT * FROM blood_requests WHERE 1=1`;
  const params: any[] = [];

  if (filters?.status) {
    sql += ` AND status = ?`;
    params.push(filters.status);
  }
  if (filters?.bloodGroup) {
    sql += ` AND blood_group = ?`;
    params.push(filters.bloodGroup);
  }
  if (filters?.urgency) {
    sql += ` AND urgency = ?`;
    params.push(filters.urgency);
  }
  if (filters?.requesterId) {
    sql += ` AND requester_id = ?`;
    params.push(filters.requesterId);
  }
  if (filters?.search) {
    sql += ` AND (patient_name LIKE ? OR hospital_name LIKE ? OR doctor_in_charge LIKE ?)`;
    const t = `%${filters.search}%`;
    params.push(t, t, t);
  }

  sql += ` ORDER BY created_at DESC`;
  const requests = await query<BloodRequestEntity>(sql, params);

  // Fetch timelines for requests
  const requestsWithTimeline = await Promise.all(
    requests.map(async (r) => {
      const timeline = await query<any>(
        `SELECT id, status, note, actor, created_at as createdAt FROM blood_request_timeline WHERE request_id = ? ORDER BY id ASC`,
        [r.id]
      );
      return {
        ...r,
        timeline,
      };
    })
  );

  return requestsWithTimeline;
}

export async function getBloodRequestById(id: string) {
  const rows = await query<BloodRequestEntity>(`SELECT * FROM blood_requests WHERE id = ?`, [id]);
  if (rows.length === 0) return null;

  const request = rows[0];
  const timeline = await query<any>(
    `SELECT id, status, note, actor, created_at as createdAt FROM blood_request_timeline WHERE request_id = ? ORDER BY id ASC`,
    [id]
  );

  return {
    ...request,
    timeline,
  };
}

const VALID_STATUS_TRANSITIONS: Record<BloodRequestStatus, BloodRequestStatus[]> = {
  Draft: ['Submitted', 'Cancelled'],
  Submitted: ['Under Review', 'Matching', 'Cancelled', 'Rejected'],
  'Under Review': ['Matching', 'Cancelled', 'Rejected'],
  Matching: ['Donor Contacted', 'Fulfilled', 'Cancelled', 'Expired'],
  'Donor Contacted': ['Fulfilled', 'Cancelled', 'Expired'],
  Fulfilled: [],
  Rejected: [],
  Cancelled: [],
  Expired: [],
};

export async function updateBloodRequestStatus(params: {
  requestId: string;
  newStatus: BloodRequestStatus;
  note: string;
  actor: string;
  actorRole: string;
}) {
  const rows = await query<BloodRequestEntity>(`SELECT * FROM blood_requests WHERE id = ?`, [params.requestId]);
  if (rows.length === 0) throw new Error('Blood request not found');

  const current = rows[0];
  const allowed = VALID_STATUS_TRANSITIONS[current.status] || [];

  if (!allowed.includes(params.newStatus)) {
    throw new Error(`Invalid status transition from '${current.status}' to '${params.newStatus}'. Allowed: [${allowed.join(', ')}]`);
  }

  await transaction(async (trx) => {
    await trx.execute(
      `UPDATE blood_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [params.newStatus, params.requestId]
    );

    await trx.execute(
      `INSERT INTO blood_request_timeline (request_id, status, note, actor)
       VALUES (?, ?, ?, ?)`,
      [params.requestId, params.newStatus, params.note, params.actor]
    );
  });

  await recordAuditLog({
    actor: params.actor,
    role: params.actorRole,
    action: 'UPDATE_REQUEST_STATUS',
    entityType: 'BLOOD_REQUEST',
    details: `Transitioned request ${params.requestId} to status '${params.newStatus}': ${params.note}`,
  });

  emitRequestStatusUpdate(params.requestId, {
    status: params.newStatus,
    note: params.note,
    actor: params.actor,
    timestamp: new Date().toISOString(),
  });

  return getBloodRequestById(params.requestId);
}
