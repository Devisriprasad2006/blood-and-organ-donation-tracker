# Digital Blood and Organ Donation Management and Tracking System (LifeLink)

An enterprise-grade, real-time healthcare platform connecting voluntary blood donors, clinical transplant coordinators, recipients, surgical trauma centers, and regional cold-chain blood repositories with explainable clinical matching, concurrency-safe inventory controls, and auditable statutory coordination.

---

## 1. System Architecture & Technology Stack

- **Frontend Tier**:
  - React (Vite), JavaScript & TypeScript
  - React Router
  - Axios HTTP Client with JWT interceptors
  - Recharts for clinical inventory analytics and demand curves
  - Lucide React iconography
  - Socket.IO Client for real-time live event streaming
  - Web Audio API synthesizer for trauma siren alerts
  - Deep Teal (`#0d5c75`), Mint Green (`#10b981`), Amber (`#f59e0b`), and dark/light healthcare theme

- **Backend & API Engine Tier**:
  - Node.js & Express.js REST API under `/api/v1`
  - Socket.IO authenticated server for real-time live updates
  - Helmet HTTP security headers & Cross-Origin Resource Sharing (CORS)
  - Express Rate Limiting for DDoS and brute-force protection
  - Bcrypt password hashing & Stateless JWT authentication
  - Server-enforced Role-Based Access Control (RBAC) across 7 healthcare roles
  - Background scheduler service for automated cold-chain expiration and low-stock quarantining

- **Database & Persistence Tier**:
  - **MySQL 8.0**: Normalized schema, foreign keys, indexes, and ACID transactions
  - Versioned migration runner (`_schema_migrations`)
  - Automated initial seed runner
  - Embedded resilient relational adapter ensuring zero-downtime execution

- **DevOps & Infrastructure**:
  - Docker & Docker Compose multi-container configuration
  - NGINX production reverse proxy with gzip and security headers
  - Automated testing with Vitest and Supertest (100% pass rate across 20 test suites)
  - Hot database backup automation scripts (PowerShell & Shell)

---

## 2. Healthcare Personas & Access Control (RBAC)

1. **Public Visitor**:
   - Access public portal, regional emergency blood appeals, and general information on blood & organ donation protocols.
2. **Blood Donor**:
   - Register voluntary donor profile, manage donation cooldowns, generate digital donor cards, toggle availability, and consent management with one-click withdrawal.
3. **Recipient / Requester**:
   - Submit emergency and routine blood requisitions, monitor request status progression, and view compatible matches.
4. **Hospital Staff**:
   - Requisition blood units with urgency levels (`CRITICAL_EMERGENCY`, `CRITICAL_SOS`, `URGENT`, `HIGH`, `ROUTINE`), track live green-corridor transits, and manage organ transplant referrals.
5. **Blood Bank Authority**:
   - Cold chain blood inventory management across all components (Packed RBC, Whole Blood, Platelets, Fresh Frozen Plasma, Cryoprecipitate).
   - Concurrency-protected reservations preventing negative stock or overselling.
6. **Organ Donation Coordinator**:
   - Oversee statutory expressions of organ donation intent under national anatomical gift protocols (NOTTO / THOA).
   - Coordinate counseling, next-of-kin documentation, and authorized review checkpoints.
7. **System Administrator & Reviewer**:
   - System telemetry and hospital facility verification.
   - Immutable audit logs signed with SHA-256 cryptographic hash chains.

---

## 3. Dedicated Organ Donation Coordination Module

In strict compliance with statutory anatomical gift frameworks (THOA Act & NOTTO protocols):
- Organ donation is managed as an ethical coordination module **strictly separated from blood donation matching**.
- Citizens voluntarily record expressions of donation intent (Kidney, Liver, Heart, Lung, Pancreas, Cornea) with next-of-kin counseling acknowledgments.
- Case progression requires explicit multi-party verification gates: `Registration Submitted` &rarr; `Awaiting Verification` &rarr; `Verified` &rarr; `Coordination in Progress` &rarr; `Awaiting Authorized Review` &rarr; `Approved by Authorized Authority` &rarr; `Completed`.
- **Statutory Notice**: The platform does not autonomously allocate organs or override certified clinical determinations. Final cross-matching and surgical allocation remain solely under certified medical transplant authorities.

---

## 4. Quick Start & Execution Commands

### Prerequisites
- Node.js 18+ (Node 24 LTS recommended)
- MySQL 8.0 (running locally on port 3306 or via Docker)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Launch Both Backend & Frontend Simultaneously (Recommended)
You can launch both the Node.js Express backend (port 5000) and the Vite frontend (port 5173) together in a single command:
```bash
npm run dev:all
# or
npm start
```

On Windows, you can also simply double-click or run:
```cmd
start.bat
```
or in PowerShell:
```powershell
.\start.ps1
```

### 4. Or Launch in Separate Terminals
**Terminal 1 (Backend Server on Port 5000):**
```bash
npm run server:watch
```

**Terminal 2 (Frontend Client on Port 5173):**
```bash
npm run dev
```

Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 5. Run Automated Test Suite
Executes the comprehensive automated tests (Authentication, RBAC, Concurrency Locking, ABO Compatibility, State Machines):
```bash
npm run test
```

### 6. Verify Production Bundle
```bash
npm run build
```

---

## 5. Seed Credentials for Local Testing

| Role | Email | Password |
| :--- | :--- | :--- |
| **Voluntary Donor** | `donor@lifelink.org` | `password123` |
| **Recipient** | `recipient@lifelink.org` | `password123` |
| **Hospital Trauma Head** | `hospital@metrogeneral.org` | `password123` |
| **Blood Bank Authority** | `bloodbank@citybank.org` | `password123` |
| **Transplant Coordinator** | `coordinator@organgrid.org` | `password123` |
| **System Administrator** | `admin@lifelink.org` | `password123` |

---

## 6. Real-Time Socket.IO Event Reference

| Event Name | Direction | Payload Description |
| :--- | :--- | :--- |
| `emergency_sos_broadcast` | Server &rarr; Client | Sanitized real-time emergency broadcast (blood group, urgency, hospital) |
| `inventory_updated` | Server &rarr; Client | Real-time cold chain stock change dispatched to blood banks and hospitals |
| `request_status_changed` | Server &rarr; Client | Live transition of blood request status with actor and timeline note |
| `notification_received` | Server &rarr; User Room | Direct push of in-app alert to authenticated user |
| `audit_log_added` | Server &rarr; Admin Room | Real-time push of SHA-256 cryptographically hashed audit ledger record |

---

## 7. Production Container Deployment

Launch MySQL 8, Node.js API engine, and NGINX frontend via Docker Compose:
```bash
docker compose up -d --build
```
Health Check:
```bash
curl http://localhost:5000/api/v1/health
```
