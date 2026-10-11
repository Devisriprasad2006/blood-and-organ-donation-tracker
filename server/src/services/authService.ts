import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, execute } from '../db/connection.js';
import { config } from '../config/env.js';
import { recordAuditLog } from './auditService.js';
import type { UserEntity, DonorProfileEntity, AuthTokenPayload, UserRole } from '../types/index.js';

export async function loginUser(email: string, password: string, clientIp = '127.0.0.1') {
  const users = await query<UserEntity>(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
  if (!users || users.length === 0) {
    await recordAuditLog({
      actor: email,
      role: 'ANONYMOUS',
      action: 'LOGIN_FAILURE',
      entityType: 'SECURITY',
      details: `Failed authentication attempt for unknown or inactive email: ${email}`,
      ipAddress: clientIp,
      status: 'FLAGGED',
    });
    throw new Error('Invalid email or password credentials');
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    await recordAuditLog({
      actor: user.full_name,
      role: user.role,
      action: 'LOGIN_FAILURE',
      entityType: 'SECURITY',
      details: `Failed authentication attempt for user ${user.id} (${email})`,
      ipAddress: clientIp,
      status: 'FLAGGED',
    });
    throw new Error('Invalid email or password credentials');
  }

  const payload: AuthTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name,
  };

  const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });

  await recordAuditLog({
    actor: user.full_name,
    role: user.role,
    action: 'LOGIN_SUCCESS',
    entityType: 'SECURITY',
    details: `User session authenticated successfully for ${user.email}`,
    ipAddress: clientIp,
  });

  // Fetch donor profile if role is DONOR
  let donorProfile: DonorProfileEntity | null = null;
  if (user.role === 'DONOR') {
    const dps = await query<DonorProfileEntity>(`SELECT * FROM donor_profiles WHERE user_id = ?`, [user.id]);
    if (dps.length > 0) donorProfile = dps[0];
  }

  const safeUser = {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    city: user.city,
    region: user.region,
    approxLatitude: user.approx_latitude,
    approxLongitude: user.approx_longitude,
    isVerified: Boolean(user.is_verified),
    avatarUrl: user.avatar_url,
  };

  return {
    token,
    user: safeUser,
    donorProfile,
  };
}

export async function registerUser(params: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  city: string;
  region: string;
  bloodGroup?: string;
  donationType?: 'BLOOD_ONLY' | 'ORGAN_ONLY' | 'BOTH';
  age?: number;
  weightKg?: number;
  clientIp?: string;
}) {
  const existing = await query<UserEntity>(`SELECT id FROM users WHERE email = ?`, [params.email.toLowerCase().trim()]);
  if (existing.length > 0) {
    throw new Error('An account with this email address already exists');
  }

  const id = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const passwordHash = await bcrypt.hash(params.password, 10);
  const city = params.city || 'Chennai';
  const region = params.region || 'Tamil Nadu';

  await execute(
    `INSERT INTO users (id, full_name, email, password_hash, phone, role, city, region, approx_latitude, approx_longitude, is_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 13.0827, 80.2707, 1)`,
    [id, params.fullName, params.email.toLowerCase().trim(), passwordHash, params.phone, params.role, city, region]
  );

  let donorProfile: DonorProfileEntity | null = null;
  if (params.role === 'DONOR' && params.bloodGroup) {
    const dpId = `dp-${Date.now()}`;
    const donorCardNumber = `LIFE-DON-${Math.floor(1000 + Math.random() * 9000)}`;
    await execute(
      `INSERT INTO donor_profiles (id, user_id, blood_group, donation_type, is_available, is_matching_paused, preferred_contact, total_donations_count, donor_card_number, age, weight_kg, medical_self_declaration_accepted, consent_withdrawal_allowed, location_permission_granted, privacy_setting)
       VALUES (?, ?, ?, ?, 1, 0, 'IN_APP', 0, ?, ?, ?, 1, 1, 1, 'ANONYMOUS_TO_PUBLIC')`,
      [dpId, id, params.bloodGroup, params.donationType || 'BOTH', donorCardNumber, params.age || 25, params.weightKg || 65.0]
    );

    const dps = await query<DonorProfileEntity>(`SELECT * FROM donor_profiles WHERE id = ?`, [dpId]);
    if (dps.length > 0) donorProfile = dps[0];
  }

  await recordAuditLog({
    actor: params.fullName,
    role: params.role,
    action: 'USER_REGISTRATION',
    entityType: 'SECURITY',
    details: `Registered new account with role ${params.role} for ${params.email}`,
    ipAddress: params.clientIp,
  });

  const payload: AuthTokenPayload = {
    userId: id,
    email: params.email.toLowerCase().trim(),
    role: params.role,
    fullName: params.fullName,
  };

  const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });

  return {
    token,
    user: {
      id,
      fullName: params.fullName,
      email: params.email.toLowerCase().trim(),
      phone: params.phone,
      role: params.role,
      city,
      region,
      approxLatitude: 13.0827,
      approxLongitude: 80.2707,
      isVerified: true,
    },
    donorProfile,
  };
}

export async function getCurrentUser(userId: string) {
  const users = await query<UserEntity>(`SELECT * FROM users WHERE id = ?`, [userId]);
  if (!users || users.length === 0) {
    throw new Error('User not found');
  }

  const user = users[0];
  let donorProfile: DonorProfileEntity | null = null;
  if (user.role === 'DONOR') {
    const dps = await query<DonorProfileEntity>(`SELECT * FROM donor_profiles WHERE user_id = ?`, [user.id]);
    if (dps.length > 0) donorProfile = dps[0];
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    city: user.city,
    region: user.region,
    approxLatitude: user.approx_latitude,
    approxLongitude: user.approx_longitude,
    isVerified: Boolean(user.is_verified),
    avatarUrl: user.avatar_url,
    donorProfile,
  };
}

export async function updateDonorProfile(userId: string, updates: Partial<DonorProfileEntity>, actorName: string) {
  const existing = await query<DonorProfileEntity>(`SELECT * FROM donor_profiles WHERE user_id = ?`, [userId]);
  if (existing.length === 0) {
    throw new Error('Donor profile not found for user');
  }

  const fields: string[] = [];
  const params: any[] = [];

  if (updates.is_available !== undefined) {
    fields.push(`is_available = ?`);
    params.push(updates.is_available ? 1 : 0);
  }
  if (updates.is_matching_paused !== undefined) {
    fields.push(`is_matching_paused = ?`);
    params.push(updates.is_matching_paused ? 1 : 0);
  }
  if (updates.preferred_contact !== undefined) {
    fields.push(`preferred_contact = ?`);
    params.push(updates.preferred_contact);
  }
  if (updates.privacy_setting !== undefined) {
    fields.push(`privacy_setting = ?`);
    params.push(updates.privacy_setting);
  }
  if (updates.consent_withdrawal_allowed !== undefined) {
    fields.push(`consent_withdrawal_allowed = ?`);
    params.push(updates.consent_withdrawal_allowed ? 1 : 0);
  }

  if (fields.length > 0) {
    params.push(userId);
    await execute(`UPDATE donor_profiles SET ${fields.join(', ')} WHERE user_id = ?`, params);
  }

  await recordAuditLog({
    actor: actorName,
    role: 'DONOR',
    action: 'DONOR_PROFILE_UPDATED',
    entityType: 'SECURITY',
    details: `Updated preferences and statutory consent flags for donor profile`,
  });

  const updated = await query<DonorProfileEntity>(`SELECT * FROM donor_profiles WHERE user_id = ?`, [userId]);
  return updated[0];
}
