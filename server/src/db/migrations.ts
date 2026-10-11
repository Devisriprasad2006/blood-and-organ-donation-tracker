import { getDbDriver, query, execute } from './connection.js';

export async function runMigrations(): Promise<void> {
  const driver = getDbDriver();
  console.log(`[Migrations] Running database migrations on ${driver.toUpperCase()} engine...`);

  // Ensure migrations tracking table exists
  if (driver === 'mysql') {
    await execute(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(50) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } else {
    await execute(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  const appliedRows = await query<{ version: string }>(`SELECT version FROM _schema_migrations`);
  const appliedVersions = new Set(appliedRows.map(r => r.version));

  if (!appliedVersions.has('001_init_schema')) {
    console.log(`[Migrations] Applying 001_init_schema migration...`);
    await applyMigration001(driver);
    await execute(`INSERT INTO _schema_migrations (version) VALUES (?)`, ['001_init_schema']);
    console.log(`[Migrations] 001_init_schema applied successfully.`);
  } else {
    console.log(`[Migrations] Database schema is up to date.`);
  }
}

async function applyMigration001(driver: 'mysql' | 'sqlite'): Promise<void> {
  if (driver === 'mysql') {
    const mysqlDDL = [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        role ENUM('DONOR', 'RECIPIENT', 'HOSPITAL', 'BLOOD_BANK', 'COORDINATOR', 'REVIEWER', 'ADMINISTRATOR') NOT NULL,
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS hospitals (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS blood_banks (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS donor_profiles (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS blood_requests (
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
        urgency ENUM('CRITICAL_EMERGENCY', 'CRITICAL_SOS', 'URGENT', 'HIGH', 'ROUTINE') NOT NULL DEFAULT 'URGENT',
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS blood_request_timeline (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(64) NOT NULL,
        status VARCHAR(50) NOT NULL,
        note TEXT NOT NULL,
        actor VARCHAR(150) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS blood_inventory (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS inventory_movements (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS organ_donation_intents (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS organ_requests (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(64) PRIMARY KEY,
        recipient_user_id VARCHAR(64) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('EMERGENCY_ALERT', 'REQUEST_UPDATE', 'INVENTORY_WARNING', 'SYSTEM', 'ORGAN_UPDATE') NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        delivery_status ENUM('DELIVERED', 'SIMULATED', 'PENDING') NOT NULL DEFAULT 'SIMULATED',
        channel ENUM('IN_APP', 'SMS_SIMULATED', 'EMAIL_SIMULATED') NOT NULL DEFAULT 'IN_APP',
        action_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notif_user (recipient_user_id, is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS audit_logs (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS verification_requests (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    ];

    for (const sql of mysqlDDL) {
      await execute(sql);
    }
  } else {
    // SQLite compatible DDL
    const sqliteDDL = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        phone TEXT NOT NULL,
        role TEXT NOT NULL,
        city TEXT NOT NULL,
        region TEXT NOT NULL,
        approx_latitude REAL NOT NULL DEFAULT 13.0827,
        approx_longitude REAL NOT NULL DEFAULT 80.2707,
        is_verified INTEGER NOT NULL DEFAULT 0,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS hospitals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        license_number TEXT NOT NULL UNIQUE,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        contact_phone TEXT NOT NULL,
        emergency_hotline TEXT NOT NULL,
        is_transplant_center INTEGER NOT NULL DEFAULT 0,
        is_accredited INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS blood_banks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        license_number TEXT NOT NULL UNIQUE,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        cold_storage_racks_count INTEGER NOT NULL DEFAULT 10,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS donor_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        blood_group TEXT NOT NULL,
        donation_type TEXT NOT NULL DEFAULT 'BOTH',
        is_available INTEGER NOT NULL DEFAULT 1,
        is_matching_paused INTEGER NOT NULL DEFAULT 0,
        preferred_contact TEXT NOT NULL DEFAULT 'IN_APP',
        last_donation_date TEXT,
        total_donations_count INTEGER NOT NULL DEFAULT 0,
        donor_card_number TEXT NOT NULL UNIQUE,
        age INTEGER NOT NULL,
        weight_kg REAL NOT NULL,
        medical_self_declaration_accepted INTEGER NOT NULL DEFAULT 1,
        consent_withdrawal_allowed INTEGER NOT NULL DEFAULT 1,
        location_permission_granted INTEGER NOT NULL DEFAULT 1,
        privacy_setting TEXT NOT NULL DEFAULT 'ANONYMOUS_TO_PUBLIC',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS blood_requests (
        id TEXT PRIMARY KEY,
        requester_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        patient_age INTEGER NOT NULL,
        hospital_name TEXT NOT NULL,
        hospital_city TEXT NOT NULL,
        hospital_latitude REAL NOT NULL,
        hospital_longitude REAL NOT NULL,
        doctor_in_charge TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        blood_group TEXT NOT NULL,
        component_type TEXT NOT NULL,
        units_required INTEGER NOT NULL DEFAULT 1,
        units_allocated INTEGER NOT NULL DEFAULT 0,
        urgency TEXT NOT NULL DEFAULT 'URGENT',
        status TEXT NOT NULL DEFAULT 'Submitted',
        required_by_date TEXT NOT NULL,
        clinical_diagnosis TEXT NOT NULL,
        matched_donors_count INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE RESTRICT
      );`,

      `CREATE TABLE IF NOT EXISTS blood_request_timeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT NOT NULL,
        status TEXT NOT NULL,
        note TEXT NOT NULL,
        actor TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS blood_inventory (
        id TEXT PRIMARY KEY,
        blood_bank_id TEXT NOT NULL,
        blood_bank_name TEXT NOT NULL,
        blood_group TEXT NOT NULL,
        component_type TEXT NOT NULL,
        units_available INTEGER NOT NULL DEFAULT 0,
        units_reserved INTEGER NOT NULL DEFAULT 0,
        storage_rack TEXT NOT NULL,
        batch_number TEXT NOT NULL UNIQUE,
        collection_date TEXT NOT NULL,
        expiry_date TEXT NOT NULL,
        is_low_stock INTEGER NOT NULL DEFAULT 0,
        is_expired INTEGER NOT NULL DEFAULT 0,
        last_audited_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS inventory_movements (
        id TEXT PRIMARY KEY,
        item_id TEXT NOT NULL,
        blood_group TEXT NOT NULL,
        component_type TEXT NOT NULL,
        action TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        reason TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES blood_inventory(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS organ_donation_intents (
        id TEXT PRIMARY KEY,
        donor_id TEXT NOT NULL,
        donor_name TEXT NOT NULL,
        donor_age INTEGER NOT NULL,
        donor_blood_group TEXT NOT NULL,
        donor_city TEXT NOT NULL,
        organs_intended TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Registration Submitted',
        consent_form_signed INTEGER NOT NULL DEFAULT 1,
        nok_consent_recorded INTEGER NOT NULL DEFAULT 0,
        primary_hospital_id TEXT NOT NULL,
        primary_hospital_name TEXT NOT NULL,
        transplant_coordinator TEXT,
        authorized_approval_number TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS organ_requests (
        id TEXT PRIMARY KEY,
        recipient_name TEXT NOT NULL,
        recipient_age INTEGER NOT NULL,
        blood_group TEXT NOT NULL,
        organ_needed TEXT NOT NULL,
        hospital_id TEXT NOT NULL,
        hospital_name TEXT NOT NULL,
        attending_surgeon TEXT NOT NULL,
        urgency TEXT NOT NULL,
        status TEXT NOT NULL,
        clinical_assessment TEXT NOT NULL,
        waiting_list_registration_number TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        recipient_user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0,
        delivery_status TEXT NOT NULL DEFAULT 'SIMULATED',
        channel TEXT NOT NULL DEFAULT 'IN_APP',
        action_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        actor TEXT NOT NULL,
        role TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        details TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'VERIFIED',
        hash_signature TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS verification_requests (
        id TEXT PRIMARY KEY,
        facility_type TEXT NOT NULL,
        name TEXT NOT NULL,
        license_number TEXT NOT NULL UNIQUE,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        reviewed_by TEXT,
        review_notes TEXT,
        submitted_at TEXT NOT NULL
      );`
    ];

    for (const sql of sqliteDDL) {
      await execute(sql);
    }
  }
}
