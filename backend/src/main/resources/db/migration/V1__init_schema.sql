-- =============================================================================
-- LifeLink: Digital Blood & Organ Donation Management and Tracking System
-- Flyway Database Migration: V1__init_schema.sql
-- MySQL 8 Normalized Schema, Foreign Keys, Indexes, and Constraints
-- =============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role ENUM('DONOR', 'RECIPIENT', 'HOSPITAL', 'BLOOD_BANK', 'ADMINISTRATOR') NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    approx_latitude DECIMAL(10, 6) NOT NULL DEFAULT 13.0827,
    approx_longitude DECIMAL(10, 6) NOT NULL DEFAULT 80.2707,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email),
    INDEX idx_user_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(200) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    emergency_hotline VARCHAR(30) NOT NULL,
    is_transplant_center BOOLEAN NOT NULL DEFAULT FALSE,
    is_accredited BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_hosp_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Blood Banks Table
CREATE TABLE IF NOT EXISTS blood_banks (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(200) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    cold_storage_racks_count INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Donor Profiles Table
CREATE TABLE IF NOT EXISTS donor_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    donation_type ENUM('BLOOD_ONLY', 'ORGAN_ONLY', 'BOTH') NOT NULL DEFAULT 'BOTH',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_matching_paused BOOLEAN NOT NULL DEFAULT FALSE,
    preferred_contact ENUM('IN_APP', 'PHONE', 'EMAIL') NOT NULL DEFAULT 'IN_APP',
    last_donation_date DATE,
    total_donations_count INT NOT NULL DEFAULT 0,
    donor_card_number VARCHAR(50) NOT NULL UNIQUE,
    age INT NOT NULL,
    weight_kg DECIMAL(5, 2) NOT NULL,
    medical_self_declaration_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    consent_withdrawal_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    location_permission_granted BOOLEAN NOT NULL DEFAULT TRUE,
    privacy_setting ENUM('ANONYMOUS_TO_PUBLIC', 'AUTHORIZED_HOSPITALS_ONLY') NOT NULL DEFAULT 'ANONYMOUS_TO_PUBLIC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_donor_bg (blood_group),
    INDEX idx_donor_availability (is_available, is_matching_paused)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Blood Requests Table
CREATE TABLE IF NOT EXISTS blood_requests (
    id VARCHAR(64) PRIMARY KEY,
    requester_id VARCHAR(64) NOT NULL,
    patient_name VARCHAR(150) NOT NULL,
    patient_age INT NOT NULL,
    hospital_name VARCHAR(200) NOT NULL,
    hospital_city VARCHAR(100) NOT NULL,
    hospital_latitude DECIMAL(10, 6) NOT NULL,
    hospital_longitude DECIMAL(10, 6) NOT NULL,
    doctor_in_charge VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    component_type ENUM('Whole Blood', 'Packed RBC', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate') NOT NULL,
    units_required INT NOT NULL DEFAULT 1,
    units_allocated INT NOT NULL DEFAULT 0,
    urgency ENUM('CRITICAL_EMERGENCY', 'URGENT', 'HIGH', 'ROUTINE') NOT NULL DEFAULT 'URGENT',
    status ENUM('Draft', 'Submitted', 'Under Review', 'Matching', 'Donor Contacted', 'Fulfilled', 'Rejected', 'Cancelled', 'Expired') NOT NULL DEFAULT 'Submitted',
    required_by_date DATETIME NOT NULL,
    clinical_diagnosis TEXT NOT NULL,
    matched_donors_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_req_bg (blood_group),
    INDEX idx_req_status (status),
    INDEX idx_req_urgency (urgency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Blood Request Timeline Table
CREATE TABLE IF NOT EXISTS blood_request_timeline (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(64) NOT NULL,
    status VARCHAR(50) NOT NULL,
    note TEXT NOT NULL,
    actor VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Blood Inventory Table
CREATE TABLE IF NOT EXISTS blood_inventory (
    id VARCHAR(64) PRIMARY KEY,
    blood_bank_id VARCHAR(64) NOT NULL,
    blood_bank_name VARCHAR(200) NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    component_type ENUM('Whole Blood', 'Packed RBC', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate') NOT NULL,
    units_available INT NOT NULL DEFAULT 0,
    units_reserved INT NOT NULL DEFAULT 0,
    storage_rack VARCHAR(50) NOT NULL,
    batch_number VARCHAR(100) NOT NULL UNIQUE,
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    is_low_stock BOOLEAN NOT NULL DEFAULT FALSE,
    is_expired BOOLEAN NOT NULL DEFAULT FALSE,
    last_audited_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_inv_bg_comp (blood_group, component_type),
    INDEX idx_inv_expiry (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Inventory Movement History Table
CREATE TABLE IF NOT EXISTS inventory_movements (
    id VARCHAR(64) PRIMARY KEY,
    item_id VARCHAR(64) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    action ENUM('RESTOCK', 'RESERVE', 'DISPATCH', 'DISCARD_EXPIRED') NOT NULL,
    quantity INT NOT NULL,
    reason TEXT NOT NULL,
    performed_by VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES blood_inventory(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Organ Donation Intents Table (Separate Dedicated Workflow)
CREATE TABLE IF NOT EXISTS organ_donation_intents (
    id VARCHAR(64) PRIMARY KEY,
    donor_id VARCHAR(64) NOT NULL,
    donor_name VARCHAR(150) NOT NULL,
    donor_age INT NOT NULL,
    donor_blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    donor_city VARCHAR(100) NOT NULL,
    organs_intended JSON NOT NULL,
    status ENUM('Registration Submitted', 'Awaiting Verification', 'Verified', 'Coordination in Progress', 'Awaiting Authorized Review', 'Approved by Authorized Authority', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Registration Submitted',
    consent_form_signed BOOLEAN NOT NULL DEFAULT TRUE,
    nok_consent_recorded BOOLEAN NOT NULL DEFAULT FALSE,
    primary_hospital_id VARCHAR(64) NOT NULL,
    primary_hospital_name VARCHAR(200) NOT NULL,
    transplant_coordinator VARCHAR(150),
    authorized_approval_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_organ_intent_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Organ Requests Table (Waitlist)
CREATE TABLE IF NOT EXISTS organ_requests (
    id VARCHAR(64) PRIMARY KEY,
    recipient_name VARCHAR(150) NOT NULL,
    recipient_age INT NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    organ_needed ENUM('Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas', 'Cornea') NOT NULL,
    hospital_id VARCHAR(64) NOT NULL,
    hospital_name VARCHAR(200) NOT NULL,
    attending_surgeon VARCHAR(150) NOT NULL,
    urgency ENUM('CRITICAL_EMERGENCY', 'URGENT', 'HIGH', 'ROUTINE') NOT NULL,
    status ENUM('Registration Submitted', 'Awaiting Verification', 'Verified', 'Coordination in Progress', 'Awaiting Authorized Review', 'Approved by Authorized Authority', 'Completed', 'Cancelled') NOT NULL,
    clinical_assessment TEXT NOT NULL,
    waiting_list_registration_number VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    recipient_user_id VARCHAR(64) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('EMERGENCY_ALERT', 'REQUEST_UPDATE', 'INVENTORY_WARNING', 'SYSTEM') NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_status ENUM('DELIVERED', 'SIMULATED', 'PENDING') NOT NULL DEFAULT 'SIMULATED',
    channel ENUM('IN_APP', 'SIMULATED_SMS', 'SIMULATED_EMAIL') NOT NULL DEFAULT 'IN_APP',
    action_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_user (recipient_user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Immutable Audit Log Ledger Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actor VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type ENUM('BLOOD_REQUEST', 'ORGAN_WORKFLOW', 'INVENTORY', 'SECURITY', 'VERIFICATION') NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    status ENUM('VERIFIED', 'FLAGGED') NOT NULL DEFAULT 'VERIFIED',
    hash_signature VARCHAR(64) NOT NULL,
    INDEX idx_audit_time (timestamp),
    INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Facility Verification Requests Table
CREATE TABLE IF NOT EXISTS verification_requests (
    id VARCHAR(64) PRIMARY KEY,
    facility_type ENUM('HOSPITAL', 'BLOOD_BANK') NOT NULL,
    name VARCHAR(200) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    contact_email VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    reviewed_by VARCHAR(150),
    review_notes TEXT,
    submitted_at DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- Demo Seed Records for Testing & Demonstrations (Labeled as Fictional Demo Data)
-- =============================================================================
INSERT INTO users (id, full_name, email, password_hash, phone, role, city, region, approx_latitude, approx_longitude, is_verified)
VALUES 
('usr-donor-1', 'Ananya Deshmukh', 'donor@lifelink.org', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklm', '+91 98401 23456', 'DONOR', 'Chennai', 'Tamil Nadu', 13.0850, 80.2600, TRUE),
('usr-recip-1', 'Rahul Verma', 'recipient@lifelink.org', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklm', '+91 98402 34567', 'RECIPIENT', 'Chennai', 'Tamil Nadu', 13.0604, 80.2496, TRUE),
('usr-hosp-1', 'Dr. Meera Nambiar (Trauma Head)', 'hospital@metrogeneral.org', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklm', '+91 44 2530 5000', 'HOSPITAL', 'Chennai', 'Tamil Nadu', 13.0827, 80.2707, TRUE),
('usr-bb-1', 'City Blood Bank Authority', 'bloodbank@citybank.org', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklm', '+91 44 2829 0200', 'BLOOD_BANK', 'Chennai', 'Tamil Nadu', 13.0720, 80.2450, TRUE),
('usr-admin-1', 'Health Grid Administrator', 'admin@lifelink.org', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklm', '+91 94440 11223', 'ADMINISTRATOR', 'Chennai', 'Tamil Nadu', 13.0827, 80.2707, TRUE)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO donor_profiles (id, user_id, blood_group, donation_type, is_available, is_matching_paused, preferred_contact, last_donation_date, total_donations_count, donor_card_number, age, weight_kg)
VALUES ('dp-1', 'usr-donor-1', 'O+', 'BOTH', TRUE, FALSE, 'IN_APP', '2026-06-15', 5, 'LIFE-DON-4081', 24, 62.5)
ON DUPLICATE KEY UPDATE id=id;
