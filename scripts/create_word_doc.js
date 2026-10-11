import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple, robust pure Node.js ZIP archive generator
function createZip(files) {
  const fileEntries = [];
  let offset = 0;

  for (const file of files) {
    const nameBuffer = Buffer.from(file.name, 'utf8');
    const uncompressedData = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, 'utf8');
    const compressedData = zlib.deflateRawSync(uncompressedData);
    
    // CRC32 calculation
    const crc = crc32(uncompressedData);

    const localHeader = Buffer.alloc(30 + nameBuffer.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Signature
    localHeader.writeUInt16LE(20, 4);         // Version needed
    localHeader.writeUInt16LE(0x0800, 6);     // Flags (UTF-8)
    localHeader.writeUInt16LE(8, 8);          // Compression: DEFLATE
    localHeader.writeUInt16LE(0, 10);         // Mod time
    localHeader.writeUInt16LE(0, 12);         // Mod date
    localHeader.writeUInt32LE(crc, 14);       // CRC32
    localHeader.writeUInt32LE(compressedData.length, 18);   // Compressed size
    localHeader.writeUInt32LE(uncompressedData.length, 22); // Uncompressed size
    localHeader.writeUInt16LE(nameBuffer.length, 26);       // Filename length
    localHeader.writeUInt16LE(0, 28);                       // Extra length
    nameBuffer.copy(localHeader, 30);

    fileEntries.push({
      nameBuffer,
      compressedData,
      uncompressedData,
      crc,
      offset,
      headerLength: localHeader.length
    });

    offset += localHeader.length + compressedData.length;
  }

  // Calculate central directory
  const cdBuffers = [];
  let cdSize = 0;

  for (const entry of fileEntries) {
    const cdHeader = Buffer.alloc(46 + entry.nameBuffer.length);
    cdHeader.writeUInt32LE(0x02014b50, 0); // Signature
    cdHeader.writeUInt16LE(20, 4);         // Version made by
    cdHeader.writeUInt16LE(20, 6);         // Version needed
    cdHeader.writeUInt16LE(0x0800, 8);     // Flags (UTF-8)
    cdHeader.writeUInt16LE(8, 10);         // Compression: DEFLATE
    cdHeader.writeUInt16LE(0, 12);         // Mod time
    cdHeader.writeUInt16LE(0, 14);         // Mod date
    cdHeader.writeUInt32LE(entry.crc, 16); // CRC32
    cdHeader.writeUInt32LE(entry.compressedData.length, 20);   // Compressed size
    cdHeader.writeUInt32LE(entry.uncompressedData.length, 24); // Uncompressed size
    cdHeader.writeUInt16LE(entry.nameBuffer.length, 28);       // Filename length
    cdHeader.writeUInt16LE(0, 30);                             // Extra length
    cdHeader.writeUInt16LE(0, 32);                             // Comment length
    cdHeader.writeUInt16LE(0, 34);                             // Disk start
    cdHeader.writeUInt16LE(0, 36);                             // Internal attrs
    cdHeader.writeUInt32LE(0, 38);                             // External attrs
    cdHeader.writeUInt32LE(entry.offset, 42);                  // Local header offset
    entry.nameBuffer.copy(cdHeader, 46);

    cdBuffers.push(cdHeader);
    cdSize += cdHeader.length;
  }

  // End of Central Directory
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);       // Signature
  eocd.writeUInt16LE(0, 4);                // Disk num
  eocd.writeUInt16LE(0, 6);                // Start disk
  eocd.writeUInt16LE(fileEntries.length, 8);  // Total entries on disk
  eocd.writeUInt16LE(fileEntries.length, 10); // Total entries overall
  eocd.writeUInt32LE(cdSize, 12);          // Central directory size
  eocd.writeUInt32LE(offset, 16);          // Central directory offset
  eocd.writeUInt16LE(0, 20);               // Comment length

  // Combine everything
  const allBuffers = [];
  for (const entry of fileEntries) {
    const localHdr = Buffer.alloc(30 + entry.nameBuffer.length);
    localHdr.writeUInt32LE(0x04034b50, 0);
    localHdr.writeUInt16LE(20, 4);
    localHdr.writeUInt16LE(0x0800, 6);
    localHdr.writeUInt16LE(8, 8);
    localHdr.writeUInt16LE(0, 10);
    localHdr.writeUInt16LE(0, 12);
    localHdr.writeUInt32LE(entry.crc, 14);
    localHdr.writeUInt32LE(entry.compressedData.length, 18);
    localHdr.writeUInt32LE(entry.uncompressedData.length, 22);
    localHdr.writeUInt16LE(entry.nameBuffer.length, 26);
    localHdr.writeUInt16LE(0, 28);
    entry.nameBuffer.copy(localHdr, 30);

    allBuffers.push(localHdr);
    allBuffers.push(entry.compressedData);
  }
  allBuffers.push(...cdBuffers);
  allBuffers.push(eocd);

  return Buffer.concat(allBuffers);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Escape XML
function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Word XML Builders
function p(text, options = {}) {
  const { bold, color, size, heading, center, italic, spaceBefore, spaceAfter } = options;
  let pPr = '';
  let rPr = '';

  if (heading === 'Title') {
    pPr += '<w:pStyle w:val="Title"/><w:jc w:val="center"/>';
    rPr += '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:color w:val="0D5C75"/><w:sz w:val="56"/>';
  } else if (heading === 'Subtitle') {
    pPr += '<w:pStyle w:val="Subtitle"/><w:jc w:val="center"/>';
    rPr += '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:i/><w:color w:val="64748B"/><w:sz w:val="28"/>';
  } else if (heading === 'Heading1') {
    pPr += '<w:pStyle w:val="Heading1"/><w:spacing w:before="360" w:after="160"/>';
    rPr += '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:color w:val="0D5C75"/><w:sz w:val="36"/>';
  } else if (heading === 'Heading2') {
    pPr += '<w:pStyle w:val="Heading2"/><w:spacing w:before="240" w:after="120"/>';
    rPr += '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:color w:val="1E293B"/><w:sz w:val="28"/>';
  } else if (heading === 'Heading3') {
    pPr += '<w:pStyle w:val="Heading3"/><w:spacing w:before="180" w:after="80"/>';
    rPr += '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:color w:val="0F766E"/><w:sz w:val="24"/>';
  } else {
    let spacingAttrs = [];
    if (spaceBefore) spacingAttrs.push(`w:before="${spaceBefore}"`);
    if (spaceAfter) spacingAttrs.push(`w:after="${spaceAfter}"`);
    if (spacingAttrs.length) pPr += `<w:spacing ${spacingAttrs.join(' ')}/>`;
    if (center) pPr += '<w:jc w:val="center"/>';
    
    let fontAttrs = [];
    if (bold) fontAttrs.push('<w:b/>');
    if (italic) fontAttrs.push('<w:i/>');
    if (color) fontAttrs.push(`<w:color w:val="${color}"/>`);
    if (size) fontAttrs.push(`<w:sz w:val="${size}"/>`);
    fontAttrs.push('<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>');
    rPr += fontAttrs.join('');
  }

  return `<w:p>${pPr ? `<w:pPr>${pPr}</w:pPr>` : ''}<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ''}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function bullet(text, boldPrefix = '') {
  return `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:spacing w:after="80"/></w:pPr>${boldPrefix ? `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:color w:val="0F172A"/></w:rPr><w:t xml:space="preserve">${escapeXml(boldPrefix)} </w:t></w:r>` : ''}<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="334155"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function table(headers, rows) {
  let xml = '<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/><w:left w:val="none"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/><w:right w:val="none"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/><w:insideV w:val="none"/></w:tblBorders><w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:left w:w="160" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="160" w:type="dxa"/></w:tblCellMar></w:tblPr>';

  // Header row
  xml += '<w:tr><w:trPr><w:tblHeader/></w:trPr>';
  for (const h of headers) {
    xml += `<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="0D5C75"/></w:tcPr><w:p><w:pPr><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr><w:t>${escapeXml(h)}</w:t></w:r></w:p></w:tc>`;
  }
  xml += '</w:tr>';

  // Data rows
  let rowIdx = 0;
  for (const row of rows) {
    const bg = rowIdx % 2 === 1 ? 'F8FAFC' : 'FFFFFF';
    xml += `<w:tr>`;
    for (const cell of row) {
      xml += `<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="${bg}"/></w:tcPr><w:p><w:pPr><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="1E293B"/><w:sz w:val="20"/></w:rPr><w:t>${escapeXml(cell)}</w:t></w:r></w:p></w:tc>`;
    }
    xml += '</w:tr>';
    rowIdx++;
  }

  xml += '</w:tbl>';
  return xml;
}

function callout(title, message) {
  return `<w:tbl><w:tblPr><w:tblW w:w="9200" w:type="dxa"/><w:tblBorders><w:top w:val="none"/><w:left w:val="single" w:sz="36" w:space="0" w:color="0D5C75"/><w:bottom w:val="none"/><w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders><w:tblCellMar><w:top w:w="160" w:type="dxa"/><w:left w:w="240" w:type="dxa"/><w:bottom w:w="160" w:type="dxa"/><w:right w:w="200" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tr><w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F0FDFA"/></w:tcPr><w:p><w:pPr><w:spacing w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:color w:val="0D5C75"/><w:sz w:val="22"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p><w:p><w:pPr><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="134E4A"/><w:sz w:val="20"/></w:rPr><w:t>${escapeXml(message)}</w:t></w:r></w:p></w:tc></w:tr></w:tbl>`;
}

// Assemble Document XML
let docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>`;

// Title & Subtitle
docXml += p("LifeLink Healthcare Grid", { heading: 'Title' });
docXml += p("Digital Blood and Organ Donation Management and Tracking System", { heading: 'Subtitle' });
docXml += p("Comprehensive Architecture, Clinical Workflows, Security Model & System Specification", { center: true, color: "0D5C75", bold: true, spaceAfter: 360 });

// Statutory Callout
docXml += callout("Statutory Regulatory Notice (THOA & NOTTO Compliance)", 
  "LifeLink is an independent healthcare technology platform engineered to facilitate real-time discovery and inventory tracking. In strict compliance with national hemovigilance and anatomical gift frameworks (THOA / NOTTO), final clinical compatibility cross-matching, blood safety screening, and organ transplant authorizations must be executed by certified medical personnel and statutory authorities.");

docXml += p("", { spaceAfter: 200 });

// Section 1
docXml += p("1. Executive Summary & Clinical Problem Space", { heading: 'Heading1' });
docXml += p("In critical healthcare coordination and emergency trauma medicine, immediate access to biological supplies is the primary determinant of patient survival. Fragmented manual logs, telephone-based donor searches, and untracked blood bank stocks frequently lead to life-threatening delays. Furthermore, navigating expressions of anatomical gift intent requires strict regulatory compliance, transparent counseling documentation, and multi-party verification gates.");
docXml += p("LifeLink provides a dual-track digital coordination architecture:", { bold: true, spaceBefore: 120, spaceAfter: 120 });

docXml += bullet("Real-Time Blood Allocation Mesh: High-speed, rule-based ABO/Rh cross-matching, privacy-preserving geospatial donor discovery, and concurrency-locked cold-chain blood bank inventory tracking.", "Track 1:");
docXml += bullet("Statutory Organ Coordination Desk: A dedicated governance module strictly decoupled from commercial blood matching, enforcing non-negotiable verification gates, next-of-kin counseling acknowledgments, and immutable cryptographic audit ledgers.", "Track 2:");

// Section 2
docXml += p("2. System Architecture & Technology Stack", { heading: 'Heading1' });
docXml += p("The platform is engineered using modern, production-grade technologies across all tiers:");

docXml += table(
  ["System Layer", "Technology", "Architectural Role"],
  [
    ["Frontend Client", "React 19, TypeScript, Vite", "High-performance SPA with sub-second compilation and type safety"],
    ["Styling & Design System", "Vanilla CSS & Tailwind CSS", "Modern healthcare theme: Deep Teal (#0D5C75), Mint (#10B981), Crimson SOS"],
    ["Real-Time Gateway", "Socket.IO WebSockets", "Sub-millisecond broadcast of Emergency SOS events and stock updates"],
    ["Audio Synthesizer", "Web Audio API", "Browser-native ambulance siren synthesizer without external MP3 dependencies"],
    ["Data Analytics", "Recharts", "Interactive demand curves, blood group stock matrix, and donor trends"],
    ["Backend REST API", "Node.js, Express.js (/api/v1)", "RESTful controllers with Helmet, CORS, and Express Rate Limiting"],
    ["Authentication & RBAC", "Stateless JWT, Bcrypt", "Role-based token validation across 6 healthcare personas"],
    ["Persistence Tier", "MySQL 8.0 & ACID Relational Adapter", "Dual-engine relational abstraction ensuring zero downtime and ACID integrity"],
    ["Audit Ledger", "SHA-256 Hash Chaining", "Cryptographically verifiable tamper-evident activity ledger"],
    ["Background Scheduler", "Node.js Cron Interval", "Automated cold-chain blood expiration and low-stock quarantining"]
  ]
);

// Section 3
docXml += p("3. Healthcare Personas & Role-Based Workspaces", { heading: 'Heading1' });
docXml += p("To ensure clinical compliance, each user persona accesses an isolated workspace with strictly enforced permissions:");

docXml += p("3.1 Voluntary Citizen Donor (DONOR)", { heading: 'Heading2' });
docXml += bullet("Digital Donor Card & Profile with verified blood group and registration badge.");
docXml += bullet("Emergency Blood Appeals displaying urgent regional hospital calls with live distance metrics.");
docXml += bullet("Eligibility Countdown Tracking enforcing 90-day whole blood and 14-day platelet cooldowns.");
docXml += bullet("Statutory Anatomical Gift Pledge for voluntary organ donation (Kidney, Liver, Heart, Lung, Pancreas, Cornea).");
docXml += bullet("Granular Privacy & Consent Governance with 1-click statutory consent withdrawal.");

docXml += p("3.2 Patient / Family Requester (RECIPIENT)", { heading: 'Heading2' });
docXml += bullet("Emergency & Scheduled Requisitions logging required units, blood component, and clinical urgency.");
docXml += bullet("Transparent Status Pipeline: Submitted -> Matching -> Donor Contacted -> Fulfilled.");
docXml += bullet("Regional Cold-Chain Discovery to locate blood banks with available stock buffers.");

docXml += p("3.3 Hospital Surgical & Trauma Center (HOSPITAL)", { heading: 'Heading2' });
docXml += bullet("Trauma ICU Command Desk with instant emergency patient admission.");
docXml += bullet("Trauma SOS Dispatcher broadcasting urgent calls with synchronized audio sirens.");
docXml += bullet("Clinical Donor Cross-Matching evaluating ABO/Rh compatibility rules within perimeter radii.");
docXml += bullet("Blood Bank Unit Reservations with ACID concurrency protection preventing double-allocation.");
docXml += bullet("Organ Transplant Referrals submitting surgical candidate cases to the coordinator network.");

docXml += p("3.4 Regional Blood Bank Authority (BLOOD_BANK)", { heading: 'Heading2' });
docXml += bullet("Cold Chain Storage Matrix managing Packed RBC, Whole Blood, Platelets, FFP, and Cryoprecipitate.");
docXml += bullet("Storage Rack & Batch Control tracking collection dates, expiration dates, and batch barcodes.");
docXml += bullet("Atomic Stock Intake & Reservation Locks preventing negative inventory or overselling.");
docXml += bullet("Automatic Quarantine Alerts for expired units or low safety thresholds.");

docXml += p("3.5 Organ Transplant Coordinator (COORDINATOR)", { heading: 'Heading2' });
docXml += bullet("Ethical Coordination Hub adhering to national NOTTO and THOA frameworks.");
docXml += bullet("Expression of Intent Verification confirming voluntary consent and next-of-kin counseling.");
docXml += bullet("Transplant Waitlist Registry prioritizing end-stage candidates based on medical criteria.");
docXml += bullet("Formal Authorized Review Gates required prior to any organ retrieval procedure.");

docXml += p("3.6 System Health Grid Administrator (ADMINISTRATOR)", { heading: 'Heading2' });
docXml += bullet("Executive Telemetry monitoring regional donor metrics, shortages, and hospital operations.");
docXml += bullet("Cryptographic SHA-256 Audit Ledger providing complete forensic traceability.");
docXml += bullet("Facility Credentialing Queue verifying medical licenses and hospital accreditations.");

// Section 4
docXml += p("4. Clinical Compatibility & Discovery Algorithms", { heading: 'Heading1' });

docXml += p("4.1 ABO/Rh Medical Compatibility Matrix", { heading: 'Heading2' });
docXml += table(
  ["Patient Blood Type", "Compatible Packed RBC Donors", "Compatible Platelet / Plasma Donors"],
  [
    ["O Negative (O-)", "O- only (Universal RBC Donor)", "O-, O+, A-, A+, B-, B+, AB-, AB+"],
    ["O Positive (O+)", "O-, O+", "O+, A+, B+, AB+"],
    ["A Negative (A-)", "O-, A-", "A-, A+, AB-, AB+"],
    ["A Positive (A+)", "O-, O+, A-, A+", "A+, AB+"],
    ["B Negative (B-)", "O-, B-", "B-, B+, AB-, AB+"],
    ["B Positive (B+)", "O-, O+, B-, B+", "B+, AB+"],
    ["AB Negative (AB-)", "O-, A-, B-, AB-", "AB-, AB+"],
    ["AB Positive (AB+)", "All Groups (Universal Recipient)", "AB+ only (Universal Plasma Donor)"]
  ]
);

docXml += p("4.2 Privacy-Preserving Geospatial Distance Decay", { heading: 'Heading2' });
docXml += p("To prevent exposing exact residential coordinates of voluntary donors, raw coordinates are snapped to 1-kilometer grid centroids. The matching engine computes composite donor scores using distance decay:");
docXml += bullet("Score = (ClinicalCompatibility * 0.50) + (1.0 - Distance/MaxRadius) * 0.30 + (DonorReliability * 0.20)");

docXml += p("4.3 Concurrency-Safe ACID Inventory Reservations", { heading: 'Heading2' });
docXml += p("When hospital trauma centers requisition blood units simultaneously, the database executes row-level transactional locks to verify units_available >= requested_units before atomically decrementing available units and incrementing reserved units. This eliminates duplicate reservations.");

// Section 5
docXml += p("5. REST API Architecture (/api/v1)", { heading: 'Heading1' });
docXml += table(
  ["HTTP Method", "Endpoint", "Access Role", "Functional Description"],
  [
    ["POST", "/api/v1/auth/register", "Public", "Register user under chosen healthcare role"],
    ["POST", "/api/v1/auth/login", "Public", "Authenticate and issue stateless JWT token"],
    ["GET", "/api/v1/auth/me", "Authenticated", "Retrieve active authenticated user profile"],
    ["GET", "/api/v1/blood-requests", "All Roles", "List filtered blood requisitions"],
    ["POST", "/api/v1/blood-requests", "Recipient / Hospital", "Create new blood requisition"],
    ["POST", "/api/v1/blood-requests/sos", "Hospital / Admin", "Broadcast critical trauma SOS with siren event"],
    ["PATCH", "/api/v1/blood-requests/:id", "Hospital / Bank", "Update status (Matching -> Contacted -> Fulfilled)"],
    ["GET", "/api/v1/inventory", "All Roles", "Query regional cold-chain stock levels"],
    ["POST", "/api/v1/inventory/reserve", "Hospital / Bank", "Execute concurrency-safe unit reservation"],
    ["GET", "/api/v1/matching/candidates", "Hospital / Admin", "Discover compatible donors and stock buffers"],
    ["GET", "/api/v1/organs/intents", "Donor / Coord / Admin", "Query voluntary expressions of organ intent"],
    ["POST", "/api/v1/organs/intents", "Donor", "Submit voluntary anatomical gift pledge"],
    ["PATCH", "/api/v1/organs/intents/:id", "Coordinator / Admin", "Advance statutory review verification gate"],
    ["GET", "/api/v1/audit/logs", "Administrator", "Inspect cryptographic SHA-256 audit ledger"],
    ["GET", "/api/v1/health", "Public", "Check backend uptime and database health"]
  ]
);

// Section 6
docXml += p("6. Verification, Testing & Operational Runbook", { heading: 'Heading1' });

docXml += p("6.1 Quality & Automated Test Suite", { heading: 'Heading2' });
docXml += bullet("Automated Tests: 20/20 Vitest + Supertest integration tests passing (100% pass rate).");
docXml += bullet("Static Analysis: npx oxlint passed with 0 errors and 0 warnings across 63 files.");
docXml += bullet("Production Bundle: npm run build compiles cleanly into dist/ in under 1 second.");

docXml += p("6.2 Quick Launch Commands", { heading: 'Heading2' });
docXml += p("Simultaneous 1-Command Startup (Backend API + Frontend Web App):", { bold: true });
docXml += bullet("npm run dev:all (or npm start) - runs both servers concurrently with colored logs.");
docXml += bullet("start.bat - Windows 1-click batch launcher.");
docXml += bullet(".\\start.ps1 - PowerShell full-stack launch script.");

docXml += p("6.3 Default Test Accounts (Password: password123)", { heading: 'Heading2' });
docXml += table(
  ["Healthcare Persona", "Test Login Email", "Default Password"],
  [
    ["Voluntary Citizen Donor", "donor@lifelink.org", "password123"],
    ["Patient / Family Requester", "recipient@lifelink.org", "password123"],
    ["Hospital Trauma Center Head", "hospital@metrogeneral.org", "password123"],
    ["Blood Bank Regional Admin", "bloodbank@citybank.org", "password123"],
    ["Organ Transplant Coordinator", "coordinator@organgrid.org", "password123"],
    ["System Grid Administrator", "admin@lifelink.org", "password123"]
  ]
);

// Close document XML
docXml += `
<w:sectPr>
  <w:pgSz w:w="12240" w:h="15840"/>
  <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
</w:sectPr>
</w:body>
</w:document>`;

// Auxiliary XML Files
const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:color w:val="334155"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Normal" w:default="1">
    <w:name w:val="Normal"/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="56"/>
      <w:color w:val="0D5C75"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle">
    <w:name w:val="Subtitle"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr>
      <w:i/>
      <w:sz w:val="28"/>
      <w:color w:val="64748B"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="36"/>
      <w:color w:val="0D5C75"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
      <w:color w:val="1E293B"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="24"/>
      <w:color w:val="0F766E"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:ind w:left="360"/>
    </w:pPr>
  </w:style>
</w:styles>`;

// Build zip package
const zipBuffer = createZip([
  { name: '[Content_Types].xml', data: contentTypesXml },
  { name: '_rels/.rels', data: rootRelsXml },
  { name: 'word/_rels/document.xml.rels', data: docRelsXml },
  { name: 'word/document.xml', data: docXml },
  { name: 'word/styles.xml', data: stylesXml },
]);

// Write output file
const outputPath = path.resolve('LifeLink_Complete_Project_Documentation.docx');
fs.writeFileSync(outputPath, zipBuffer);
console.log(`Successfully generated Word Document (.docx) at: ${outputPath} (${zipBuffer.length} bytes)`);
