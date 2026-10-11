import bcrypt from 'bcryptjs';
import { query, execute } from './connection.js';

export async function runSeeds(): Promise<void> {
  const userCount = await query<{ count: number }>(`SELECT COUNT(*) as count FROM users`);
  if (userCount && userCount[0] && Number(userCount[0].count) > 0) {
    console.log(`[Seed] Database already contains data (${userCount[0].count} users). Skipping initial seed.`);
    return;
  }

  console.log(`[Seed] Seeding production initial dataset...`);
  const defaultPasswordHash = bcrypt.hashSync('password123', 10);

  // 1. Seed Users
  const users = [
    {
      id: 'usr-donor-1',
      full_name: 'Ananya Deshmukh',
      email: 'donor@lifelink.org',
      password_hash: defaultPasswordHash,
      phone: '+91 98401 23456',
      role: 'DONOR',
      city: 'Chennai',
      region: 'Tamil Nadu',
      approx_latitude: 13.0850,
      approx_longitude: 80.2600,
      is_verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 'usr-donor-2',
      full_name: 'Vikramaditya Rao',
      email: 'vikram@lifelink.org',
      password_hash: defaultPasswordHash,
      phone: '+91 98402 11223',
      role: 'DONOR',
      city: 'Chennai',
      region: 'Tamil Nadu',
      approx_latitude: 13.0720,
      approx_longitude: 80.2450,
      is_verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 'usr-donor-3',
      full_name: 'Priya Narayanan',
      email: 'priya@lifelink.org',
      password_hash: defaultPasswordHash,
      phone: '+91 98403 99887',
      role: 'DONOR',
      city: 'Chennai',
      region: 'Tamil Nadu',
      approx_latitude: 13.0500,
      approx_longitude: 80.2300,
      is_verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 'usr-recip-1',
      full_name: 'Rahul Verma',
      email: 'recipient@lifelink.org',
      password_hash: defaultPasswordHash,
      phone: '+91 98404 34567',
      role: 'RECIPIENT',
      city: 'Chennai',
      region: 'Tamil Nadu',
      approx_latitude: 13.0604,
      approx_longitude: 80.2496,
      is_verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 'usr-hosp-1',
      full_name: 'Dr. Meera Nambiar (Trauma Head)',
      email: 'hospital@metrogeneral.org',
      password_hash: defaultPasswordHash,
      phone: '+91 44 2530 5000',
      role: 'HOSPITAL',
      city: 'Chennai',
      region: 'Tamil Nadu',
      approx_latitude: 13.0827,
      approx_longitude: 80.2707,
      is_verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 'usr-bb-1',
      full_name: 'City Blood Bank Authority',
      email: 'bloodbank@citybank.org',
      password_hash: defaultPasswordHash,
      phone: '+91 44 2829 0200',
      role: 'BLOOD_BANK',
      city: 'Chennai',
      region: 'Tamil Nadu',
      approx_latitude: 13.0720,
      approx_longitude: 80.2450,
      is_verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 'usr-coord-1',
      full_name: 'Suresh Menon (Transplant Coordinator)',
      email: 'coordinator@organgrid.org',
      password_hash: defaultPasswordHash,
      phone: '+91 94441 55667',
      role: 'COORDINATOR',
      city: 'Chennai',
      region: 'Tamil Nadu',
      approx_latitude: 13.0827,
      approx_longitude: 80.2707,
      is_verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 'usr-admin-1',
      full_name: 'Health Grid Administrator',
      email: 'admin@lifelink.org',
      password_hash: defaultPasswordHash,
      phone: '+91 94440 11223',
      role: 'ADMINISTRATOR',
      city: 'Chennai',
      region: 'Tamil Nadu',
      approx_latitude: 13.0827,
      approx_longitude: 80.2707,
      is_verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
  ];

  for (const u of users) {
    await execute(
      `INSERT INTO users (id, full_name, email, password_hash, phone, role, city, region, approx_latitude, approx_longitude, is_verified, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.full_name, u.email, u.password_hash, u.phone, u.role, u.city, u.region, u.approx_latitude, u.approx_longitude, u.is_verified, u.avatar_url]
    );
  }

  // 2. Hospitals
  await execute(
    `INSERT INTO hospitals (id, user_id, name, license_number, address, city, latitude, longitude, contact_phone, emergency_hotline, is_transplant_center, is_accredited)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['hosp-1', 'usr-hosp-1', 'Rajiv Gandhi Government General Hospital & Trauma Centre', 'NABH-TN-TRAUMA-4091', 'EVR Periyar Salai, Park Town', 'Chennai', 13.0827, 80.2707, '+91 44 2530 5000', '+91 44 2530 5111', 1, 1]
  );

  // 3. Blood Banks
  await execute(
    `INSERT INTO blood_banks (id, user_id, name, license_number, address, city, contact_phone, cold_storage_racks_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['bb-1', 'usr-bb-1', 'Stanley Medical College Regional Blood Bank', 'LIC-BB-TN-Stanley-004', 'Old Jail Road, Royapuram', 'Chennai', '+91 44 2829 0200', 16]
  );

  // 4. Donor Profiles
  const donorProfiles = [
    {
      id: 'dp-1',
      user_id: 'usr-donor-1',
      blood_group: 'O+',
      donation_type: 'BOTH',
      is_available: 1,
      is_matching_paused: 0,
      preferred_contact: 'IN_APP',
      last_donation_date: '2026-06-15',
      total_donations_count: 5,
      donor_card_number: 'LIFE-DON-4081',
      age: 24,
      weight_kg: 62.5,
      medical_self_declaration_accepted: 1,
      consent_withdrawal_allowed: 1,
      location_permission_granted: 1,
      privacy_setting: 'ANONYMOUS_TO_PUBLIC',
    },
    {
      id: 'dp-2',
      user_id: 'usr-donor-2',
      blood_group: 'A+',
      donation_type: 'BLOOD_ONLY',
      is_available: 1,
      is_matching_paused: 0,
      preferred_contact: 'PHONE',
      last_donation_date: '2026-04-10',
      total_donations_count: 8,
      donor_card_number: 'LIFE-DON-8812',
      age: 32,
      weight_kg: 74.0,
      medical_self_declaration_accepted: 1,
      consent_withdrawal_allowed: 1,
      location_permission_granted: 1,
      privacy_setting: 'AUTHORIZED_HOSPITALS_ONLY',
    },
    {
      id: 'dp-3',
      user_id: 'usr-donor-3',
      blood_group: 'O-',
      donation_type: 'BOTH',
      is_available: 1,
      is_matching_paused: 0,
      preferred_contact: 'IN_APP',
      last_donation_date: '2026-03-22',
      total_donations_count: 12,
      donor_card_number: 'LIFE-DON-1044',
      age: 28,
      weight_kg: 58.0,
      medical_self_declaration_accepted: 1,
      consent_withdrawal_allowed: 1,
      location_permission_granted: 1,
      privacy_setting: 'ANONYMOUS_TO_PUBLIC',
    },
  ];

  for (const dp of donorProfiles) {
    await execute(
      `INSERT INTO donor_profiles (id, user_id, blood_group, donation_type, is_available, is_matching_paused, preferred_contact, last_donation_date, total_donations_count, donor_card_number, age, weight_kg, medical_self_declaration_accepted, consent_withdrawal_allowed, location_permission_granted, privacy_setting)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dp.id, dp.user_id, dp.blood_group, dp.donation_type, dp.is_available, dp.is_matching_paused, dp.preferred_contact, dp.last_donation_date, dp.total_donations_count, dp.donor_card_number, dp.age, dp.weight_kg, dp.medical_self_declaration_accepted, dp.consent_withdrawal_allowed, dp.location_permission_granted, dp.privacy_setting]
    );
  }

  // 5. Blood Requests
  const requests = [
    {
      id: 'req-101',
      requester_id: 'usr-recip-1',
      patient_name: 'Rahul Verma (Cardiac Bypass)',
      patient_age: 48,
      hospital_name: 'Rajiv Gandhi Government General Hospital & Trauma Centre',
      hospital_city: 'Chennai',
      hospital_latitude: 13.0827,
      hospital_longitude: 80.2707,
      doctor_in_charge: 'Dr. Meera Nambiar, Chief Cardiothoracic',
      contact_phone: '+91 44 2530 5111',
      blood_group: 'O-',
      component_type: 'Packed RBC',
      units_required: 3,
      units_allocated: 1,
      urgency: 'CRITICAL_EMERGENCY',
      status: 'Matching',
      required_by_date: '2026-10-12 18:00:00',
      clinical_diagnosis: 'Acute Coronary Syndrome requiring emergent CABG',
      matched_donors_count: 4,
    },
    {
      id: 'req-102',
      requester_id: 'usr-hosp-1',
      patient_name: 'Saranya Krishnan',
      patient_age: 26,
      hospital_name: 'Apollo Speciality Hospitals',
      hospital_city: 'Chennai',
      hospital_latitude: 13.0560,
      hospital_longitude: 80.2520,
      doctor_in_charge: 'Dr. Balasubramanian, Onco-Hematology',
      contact_phone: '+91 44 2829 0200',
      blood_group: 'A+',
      component_type: 'Platelets',
      units_required: 4,
      units_allocated: 4,
      urgency: 'URGENT',
      status: 'Fulfilled',
      required_by_date: '2026-10-10 12:00:00',
      clinical_diagnosis: 'Post-chemotherapy severe thrombocytopenia',
      matched_donors_count: 6,
    },
    {
      id: 'req-103',
      requester_id: 'usr-recip-1',
      patient_name: 'Kavitha Ramachandran',
      patient_age: 34,
      hospital_name: 'Stanley Medical College',
      hospital_city: 'Chennai',
      hospital_latitude: 13.1060,
      hospital_longitude: 80.2870,
      doctor_in_charge: 'Dr. R. Sundaram, Head of Obstetrics',
      contact_phone: '+91 44 2528 1341',
      blood_group: 'B+',
      component_type: 'Whole Blood',
      units_required: 2,
      units_allocated: 0,
      urgency: 'HIGH',
      status: 'Submitted',
      required_by_date: '2026-10-13 10:00:00',
      clinical_diagnosis: 'Severe obstetric hemorrhage anticipated in scheduled caesarean',
      matched_donors_count: 3,
    },
  ];

  for (const r of requests) {
    await execute(
      `INSERT INTO blood_requests (id, requester_id, patient_name, patient_age, hospital_name, hospital_city, hospital_latitude, hospital_longitude, doctor_in_charge, contact_phone, blood_group, component_type, units_required, units_allocated, urgency, status, required_by_date, clinical_diagnosis, matched_donors_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.requester_id, r.patient_name, r.patient_age, r.hospital_name, r.hospital_city, r.hospital_latitude, r.hospital_longitude, r.doctor_in_charge, r.contact_phone, r.blood_group, r.component_type, r.units_required, r.units_allocated, r.urgency, r.status, r.required_by_date, r.clinical_diagnosis, r.matched_donors_count]
    );

    // Initial timeline entry
    await execute(
      `INSERT INTO blood_request_timeline (request_id, status, note, actor)
       VALUES (?, ?, ?, ?)`,
      [r.id, r.status, `Request registered in LifeLink Grid.`, 'Hospital Triage Team']
    );
  }

  // 6. Blood Inventory (Cold Chain batches across components)
  const inventoryItems = [
    { id: 'inv-1', blood_bank_id: 'bb-1', blood_bank_name: 'Stanley Medical College Regional Blood Bank', blood_group: 'O-', component_type: 'Packed RBC', units_available: 8, units_reserved: 2, storage_rack: 'RACK-A1-COLD-4C', batch_number: 'BATCH-2026-O-NEG-01', collection_date: '2026-09-28', expiry_date: '2026-11-09', is_low_stock: 0, is_expired: 0, last_audited_date: '2026-10-09' },
    { id: 'inv-2', blood_bank_id: 'bb-1', blood_bank_name: 'Stanley Medical College Regional Blood Bank', blood_group: 'O+', component_type: 'Whole Blood', units_available: 34, units_reserved: 4, storage_rack: 'RACK-A2-COLD-4C', batch_number: 'BATCH-2026-O-POS-02', collection_date: '2026-10-02', expiry_date: '2026-11-06', is_low_stock: 0, is_expired: 0, last_audited_date: '2026-10-09' },
    { id: 'inv-3', blood_bank_id: 'bb-1', blood_bank_name: 'Stanley Medical College Regional Blood Bank', blood_group: 'A+', component_type: 'Platelets', units_available: 3, units_reserved: 1, storage_rack: 'AGITATOR-P1-22C', batch_number: 'BATCH-2026-A-POS-PLT', collection_date: '2026-10-08', expiry_date: '2026-10-13', is_low_stock: 1, is_expired: 0, last_audited_date: '2026-10-09' },
    { id: 'inv-4', blood_bank_id: 'bb-1', blood_bank_name: 'Stanley Medical College Regional Blood Bank', blood_group: 'B+', component_type: 'Packed RBC', units_available: 22, units_reserved: 3, storage_rack: 'RACK-B1-COLD-4C', batch_number: 'BATCH-2026-B-POS-01', collection_date: '2026-09-25', expiry_date: '2026-11-06', is_low_stock: 0, is_expired: 0, last_audited_date: '2026-10-09' },
    { id: 'inv-5', blood_bank_id: 'bb-1', blood_bank_name: 'Stanley Medical College Regional Blood Bank', blood_group: 'AB-', component_type: 'Fresh Frozen Plasma', units_available: 2, units_reserved: 0, storage_rack: 'DEEP-FREEZE-MINUS30', batch_number: 'BATCH-2026-AB-NEG-FFP', collection_date: '2026-06-10', expiry_date: '2027-06-10', is_low_stock: 1, is_expired: 0, last_audited_date: '2026-10-09' },
  ];

  for (const inv of inventoryItems) {
    await execute(
      `INSERT INTO blood_inventory (id, blood_bank_id, blood_bank_name, blood_group, component_type, units_available, units_reserved, storage_rack, batch_number, collection_date, expiry_date, is_low_stock, is_expired, last_audited_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [inv.id, inv.blood_bank_id, inv.blood_bank_name, inv.blood_group, inv.component_type, inv.units_available, inv.units_reserved, inv.storage_rack, inv.batch_number, inv.collection_date, inv.expiry_date, inv.is_low_stock, inv.is_expired, inv.last_audited_date]
    );
  }

  // 7. Organ Donation Intents (Ethical statutory coordination module)
  const organIntents = [
    {
      id: 'org-pledge-201',
      donor_id: 'usr-donor-1',
      donor_name: 'Ananya Deshmukh',
      donor_age: 24,
      donor_blood_group: 'O+',
      donor_city: 'Chennai',
      organs_intended: JSON.stringify(['Kidney', 'Cornea']),
      status: 'Verified',
      consent_form_signed: 1,
      nok_consent_recorded: 1,
      primary_hospital_id: 'hosp-1',
      primary_hospital_name: 'Rajiv Gandhi Government General Hospital & Trauma Centre',
      transplant_coordinator: 'Suresh Menon, Certified NOTTO Officer',
      authorized_approval_number: 'NOTTO-PLEDGE-TN-8821',
      notes: 'Next of kin counseling completed; statutory donor registry card issued.',
    },
    {
      id: 'org-pledge-202',
      donor_id: 'usr-donor-3',
      donor_name: 'Priya Narayanan',
      donor_age: 28,
      donor_blood_group: 'O-',
      donor_city: 'Chennai',
      organs_intended: JSON.stringify(['Kidney', 'Liver', 'Heart', 'Cornea']),
      status: 'Registration Submitted',
      consent_form_signed: 1,
      nok_consent_recorded: 0,
      primary_hospital_id: 'hosp-1',
      primary_hospital_name: 'Rajiv Gandhi Government General Hospital & Trauma Centre',
      transplant_coordinator: 'Awaiting Coordinator Allocation',
      authorized_approval_number: null,
      notes: 'Voluntary online declaration registered; awaiting NOTTO counselor interview.',
    },
  ];

  for (const oi of organIntents) {
    await execute(
      `INSERT INTO organ_donation_intents (id, donor_id, donor_name, donor_age, donor_blood_group, donor_city, organs_intended, status, consent_form_signed, nok_consent_recorded, primary_hospital_id, primary_hospital_name, transplant_coordinator, authorized_approval_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [oi.id, oi.donor_id, oi.donor_name, oi.donor_age, oi.donor_blood_group, oi.donor_city, oi.organs_intended, oi.status, oi.consent_form_signed, oi.nok_consent_recorded, oi.primary_hospital_id, oi.primary_hospital_name, oi.transplant_coordinator, oi.authorized_approval_number, oi.notes]
    );
  }

  // 8. Organ Requests (Statutory waitlist)
  await execute(
    `INSERT INTO organ_requests (id, recipient_name, recipient_age, blood_group, organ_needed, hospital_id, hospital_name, attending_surgeon, urgency, status, clinical_assessment, waiting_list_registration_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['org-req-301', 'Arjun Natarajan', 42, 'O+', 'Kidney', 'hosp-1', 'Rajiv Gandhi Government General Hospital & Trauma Centre', 'Dr. Sundaram (Chief Nephro-Surgeon)', 'CRITICAL_EMERGENCY', 'Verified', 'End-stage renal disease (Stage 5 CKD on hemodialysis thrice weekly)', 'TN-NOTTO-WAITLIST-KIDNEY-1092']
  );

  // 9. Initial In-App Notifications
  const notifs = [
    {
      id: 'notif-1',
      recipient_user_id: 'usr-donor-1',
      title: 'Emergency Blood SOS: O- Needed',
      message: 'Trauma ICU at Rajiv Gandhi Hospital urgently requires O- Packed RBC units within 4 hours. You are an eligible matched donor.',
      type: 'EMERGENCY_ALERT',
      is_read: 0,
      delivery_status: 'DELIVERED',
      channel: 'IN_APP',
      action_url: '/emergency-sos',
    },
    {
      id: 'notif-2',
      recipient_user_id: 'usr-bb-1',
      title: 'Low Cold Storage Alert: Platelets',
      message: 'Platelet stock (A+) has fallen below the minimum safety threshold (3 units remaining). Initiate voluntary donor callout.',
      type: 'INVENTORY_WARNING',
      is_read: 0,
      delivery_status: 'DELIVERED',
      channel: 'IN_APP',
      action_url: '/inventory',
    },
    {
      id: 'notif-3',
      recipient_user_id: 'usr-donor-1',
      title: 'Organ Pledge Certificate Issued',
      message: 'Your voluntary expression of anatomical gift has been verified under NOTTO statutory guidelines. Donor card LIFE-DON-4081 generated.',
      type: 'ORGAN_UPDATE',
      is_read: 1,
      delivery_status: 'DELIVERED',
      channel: 'IN_APP',
      action_url: '/organ-donation',
    },
  ];

  for (const n of notifs) {
    await execute(
      `INSERT INTO notifications (id, recipient_user_id, title, message, type, is_read, delivery_status, channel, action_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [n.id, n.recipient_user_id, n.title, n.message, n.type, n.is_read, n.delivery_status, n.channel, n.action_url]
    );
  }

  // 10. Audit Logs (Immutable cryptographically signed ledger)
  const auditLogs = [
    {
      id: 'audit-001',
      actor: 'Health Grid Administrator',
      role: 'ADMINISTRATOR',
      action: 'SYSTEM_GENESIS_INITIALIZED',
      entity_type: 'SECURITY',
      details: 'LifeLink Central Healthcare Grid database initial schema and security barriers verified.',
      ip_address: '127.0.0.1',
      status: 'VERIFIED',
      hash_signature: '0x9fae330a112cd4e0',
    },
    {
      id: 'audit-002',
      actor: 'Dr. Meera Nambiar',
      role: 'HOSPITAL',
      action: 'EMERGENCY_SOS_BROADCAST',
      entity_type: 'BLOOD_REQUEST',
      details: 'Critical blood requisition req-101 (O- Packed RBC, 3 units) dispatched to regional grid.',
      ip_address: '192.168.1.45',
      status: 'VERIFIED',
      hash_signature: '0x81b7e21a091cf761',
    },
    {
      id: 'audit-003',
      actor: 'City Blood Bank Authority',
      role: 'BLOOD_BANK',
      action: 'INVENTORY_STOCK_UPDATE',
      entity_type: 'INVENTORY',
      details: 'Cold storage stock verified across 5 batches with zero expired units.',
      ip_address: '192.168.1.80',
      status: 'VERIFIED',
      hash_signature: '0x7e30d199f182cba0',
    },
  ];

  for (const a of auditLogs) {
    await execute(
      `INSERT INTO audit_logs (id, actor, role, action, entity_type, details, ip_address, status, hash_signature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.id, a.actor, a.role, a.action, a.entity_type, a.details, a.ip_address, a.status, a.hash_signature]
    );
  }

  console.log(`[Seed] Seed dataset populated successfully.`);
}
