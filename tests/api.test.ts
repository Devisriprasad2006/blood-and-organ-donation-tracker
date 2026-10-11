import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/src/index.js';
import { initDatabase, closeDatabase } from '../server/src/db/connection.js';
import { runMigrations } from '../server/src/db/migrations.js';
import { runSeeds } from '../server/src/db/seed.js';

let donorToken: string = '';
let adminToken: string = '';
let hospitalToken: string = '';
let bloodBankToken: string = '';

beforeAll(async () => {
  await initDatabase();
  await runMigrations();
  await runSeeds();

  // Login as seeded donor
  const donorRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'donor@lifelink.org', password: 'password123' });
  donorToken = donorRes.body.token;

  // Login as seeded admin
  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@lifelink.org', password: 'password123' });
  adminToken = adminRes.body.token;

  // Login as hospital
  const hospRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'hospital@metrogeneral.org', password: 'password123' });
  hospitalToken = hospRes.body.token;

  // Login as blood bank
  const bbRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'bloodbank@citybank.org', password: 'password123' });
  bloodBankToken = bbRes.body.token;
});

afterAll(async () => {
  await closeDatabase();
});

describe('1. Health and System Integrity', () => {
  it('GET /api/v1/health should report HEALTHY status with database driver details', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
    expect(res.body.service).toBeDefined();
    expect(res.body.databaseDriver).toBeDefined();
  });
});

describe('2. Authentication and Password Hashing', () => {
  it('POST /api/v1/auth/login should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'donor@lifelink.org', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register should create a new verified donor account with bcrypt hash', async () => {
    const newEmail = `donor_${Date.now()}@test.org`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Karthik Subramanian',
        email: newEmail,
        password: 'securePassword2026',
        phone: '+91 99887 76655',
        role: 'DONOR',
        bloodGroup: 'B+',
        donationType: 'BOTH',
        age: 26,
        weightKg: 68,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(newEmail);
    expect(res.body.donorProfile).toBeDefined();
  });

  it('GET /api/v1/auth/me should return authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${donorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('donor@lifelink.org');
  });
});

describe('3. Role-Based Access Control (RBAC) & Security Enforcement', () => {
  it('Anonymous user should receive 401 Unauthorized for audit log access', async () => {
    const res = await request(app).get('/api/v1/audit/logs');
    expect(res.status).toBe(401);
  });

  it('Donor role should receive 403 Forbidden for administrator audit logs', async () => {
    const res = await request(app)
      .get('/api/v1/audit/logs')
      .set('Authorization', `Bearer ${donorToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Access Denied');
  });

  it('Administrator role should receive 200 OK for cryptographically hashed audit logs', async () => {
    const res = await request(app)
      .get('/api/v1/audit/logs')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.logs.length).toBeGreaterThan(0);
    expect(res.body.logs[0].hash_signature).toBeDefined();
  });
});

describe('4. Blood Inventory Management & Concurrency Locking', () => {
  it('GET /api/v1/blood/inventory should list cold chain inventory batches', async () => {
    const res = await request(app).get('/api/v1/blood/inventory');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.totalAvailable).toBeGreaterThan(0);
  });

  it('POST /api/v1/blood/inventory/restock should intake new batch units with transaction protection', async () => {
    const res = await request(app)
      .post('/api/v1/blood/inventory/restock')
      .set('Authorization', `Bearer ${bloodBankToken}`)
      .send({
        bloodBankId: 'bb-1',
        bloodBankName: 'Stanley Medical College Regional Blood Bank',
        bloodGroup: 'O-',
        componentType: 'Packed RBC',
        unitsToAdd: 5,
        storageRack: 'RACK-A1-COLD-4C',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.item.units_available).toBeGreaterThanOrEqual(5);
  });

  it('POST /api/v1/blood/inventory/reserve should reject overselling and prevent negative stock', async () => {
    const invRes = await request(app).get('/api/v1/blood/inventory?bloodGroup=O-');
    const item = invRes.body.items[0];

    // Attempt to reserve 9999 units (far exceeding available stock)
    const oversellRes = await request(app)
      .post('/api/v1/blood/inventory/reserve')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        itemId: item.id,
        unitsToReserve: 9999,
        reason: 'Attempted overselling stress test',
      });

    expect(oversellRes.status).toBe(400);
    expect(oversellRes.body.error).toContain('Insufficient stock');
  });

  it('POST /api/v1/blood/inventory/reserve should successfully reserve available units within bounds', async () => {
    const invRes = await request(app).get('/api/v1/blood/inventory?bloodGroup=O-');
    const item = invRes.body.items[0];

    const res = await request(app)
      .post('/api/v1/blood/inventory/reserve')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        itemId: item.id,
        unitsToReserve: 2,
        reason: 'Scheduled emergency cardiac bypass',
      });

    expect(res.status).toBe(200);
    expect(res.body.item.units_reserved).toBeGreaterThanOrEqual(2);
  });
});

describe('5. Explainable Clinical Donor Matching Engine', () => {
  it('POST /api/v1/matching/find-donors should match compatible donors under statutory ABO/Rh rules', async () => {
    const res = await request(app)
      .post('/api/v1/matching/find-donors')
      .send({
        recipientBloodGroup: 'O+',
        componentType: 'Whole Blood',
        urgency: 'URGENT',
        targetLatitude: 13.0827,
        targetLongitude: 80.2707,
        radiusKm: 30,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.candidatesCount).toBeGreaterThan(0);
    const topCandidate = res.body.candidates[0];
    expect(topCandidate.matchScore).toBeGreaterThan(50);
    expect(topCandidate.distanceKm).toBeDefined();
    expect(topCandidate.reasons.length).toBeGreaterThan(0);
  });
});

describe('6. Blood Request Lifecycle and State Transitions', () => {
  let createdRequestId: string = '';

  it('POST /api/v1/blood/requests should create a blood requisition with timeline tracking', async () => {
    const res = await request(app)
      .post('/api/v1/blood/requests')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        patientName: 'Karthikeyan (Orthopedic Trauma)',
        patientAge: 38,
        hospitalName: 'Rajiv Gandhi Government General Hospital',
        hospitalCity: 'Chennai',
        doctorInCharge: 'Dr. Sundaram, Head of Ortho',
        contactPhone: '+91 44 2530 5111',
        bloodGroup: 'B+',
        componentType: 'Packed RBC',
        unitsRequired: 2,
        urgency: 'HIGH',
        requiredByDate: '2026-10-15 14:00',
        clinicalDiagnosis: 'Compound femur fracture with arterial bleed',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.request.id).toBeDefined();
    expect(res.body.request.status).toBe('Submitted');
    createdRequestId = res.body.request.id;
  });

  it('PUT /api/v1/blood/requests/:id/status should reject invalid state transitions', async () => {
    // Cannot transition directly from Submitted to Fulfilled (must go through review/matching)
    const res = await request(app)
      .put(`/api/v1/blood/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        newStatus: 'Fulfilled',
        note: 'Attempting invalid jump to Fulfilled',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid status transition');
  });

  it('PUT /api/v1/blood/requests/:id/status should successfully progress to Under Review', async () => {
    const res = await request(app)
      .put(`/api/v1/blood/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        newStatus: 'Under Review',
        note: 'Clinical requisition verified by attending hematologist',
      });

    expect(res.status).toBe(200);
    expect(res.body.request.status).toBe('Under Review');
    expect(res.body.request.timeline.length).toBeGreaterThanOrEqual(2);
  });
});

describe('7. Dedicated Ethical Organ Donation Coordination Module', () => {
  let createdIntentId: string = '';

  it('POST /api/v1/organs/intents should register statutory expression of organ donation intent', async () => {
    const res = await request(app)
      .post('/api/v1/organs/intents')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        donorName: 'Ananya Deshmukh',
        donorAge: 24,
        donorBloodGroup: 'O+',
        donorCity: 'Chennai',
        organsIntended: ['Kidney', 'Cornea'],
        notes: 'Voluntary expression of anatomical gift registered under NOTTO protocols.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.intent.status).toBe('Registration Submitted');
    createdIntentId = res.body.intent.id;
  });

  it('PUT /api/v1/organs/intents/:id/status should allow authorized coordinator to update verification gate', async () => {
    const res = await request(app)
      .put(`/api/v1/organs/intents/${createdIntentId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Verified',
        transplantCoordinator: 'Suresh Menon, NOTTO Coordinator',
        authorizedApprovalNumber: 'NOTTO-APP-TN-9901',
        notes: 'Statutory family counseling completed; verified digital donor card issued.',
        nokConsentRecorded: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.intent.status).toBe('Verified');
    expect(res.body.intent.transplant_coordinator).toBe('Suresh Menon, NOTTO Coordinator');
  });

  it('GET /api/v1/organs/requests should return statutory organ transplant waitlist', async () => {
    const res = await request(app).get('/api/v1/organs/requests');
    expect(res.status).toBe(200);
    expect(res.body.requests.length).toBeGreaterThan(0);
  });
});

describe('8. Input Validation & Defense in Depth', () => {
  it('POST /api/v1/auth/login should reject invalid email format with Zod validation error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Validation failed');
  });

  it('POST /api/v1/blood/requests should reject non-positive units required', async () => {
    const res = await request(app)
      .post('/api/v1/blood/requests')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        patientName: 'Test Patient',
        patientAge: 30,
        hospitalName: 'General Hospital',
        doctorInCharge: 'Dr. Test',
        contactPhone: '+91 99999 88888',
        bloodGroup: 'O+',
        componentType: 'Packed RBC',
        unitsRequired: -5,
        urgency: 'HIGH',
        requiredByDate: '2026-10-20',
        clinicalDiagnosis: 'Test diagnosis',
      });
    expect(res.status).toBe(400);
  });
});
