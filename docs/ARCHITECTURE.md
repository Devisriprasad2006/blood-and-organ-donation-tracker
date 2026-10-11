# Architecture & Engineering Specification

## Digital Blood and Organ Donation Management and Tracking System

### 1. Executive Summary

The **Digital Blood and Organ Donation Management and Tracking System (LifeLink)** is an independent, real-world healthcare technology platform engineered to bridge voluntary blood donors, patients in critical need, accredited surgical hospitals, regional cold chain blood repositories, and authorized organ donation transplant coordinators.

### 2. High-Level System Architecture

```
+-----------------------------------------------------------------------------------------+
|                                    PRESENTATION TIER                                    |
|   React (Vite) Single Page Application + Responsive Theme (Teal/Mint/Amber/Dark)        |
|   Role-Based Dashboards: Donor | Recipient | Hospital | Blood Bank | Admin | Coord      |
|   Leaflet Geospatial Map | Recharts Visuals | Web Audio Trauma Siren Synthesizer         |
+--------------------------------------------+--------------------------------------------+
                                             |
                   HTTP/REST + JWT           |   WebSocket (Socket.IO bi-directional)
                                             |
+--------------------------------------------v--------------------------------------------+
|                                 APPLICATION & ENGINE TIER                               |
|   Node.js & Express.js REST API Engine (/api/v1)                                        |
|   - Security: Helmet, CORS, Express Rate Limiter, Bcrypt Hashing, JWT Auth Middleware   |
|   - Role-Based Access Control (RBAC): Server-Enforced across 7 Healthcare Personas      |
|   - Real-Time Event Bus: Authenticated Socket.IO with User & Organization Rooms         |
|   - Explainable Clinical Matching: ABO/Rh Phenotype Criteria + Haversine Proximity      |
|   - Cold Chain Concurrency Engine: Database Transaction Isolation preventing oversell   |
|   - Background Health Monitor: Automated Expiry & Low-Stock Quarantining                |
|   - Cryptographic Ledger: SHA-256 Chained Immutable Audit Log                           |
+--------------------------------------------+--------------------------------------------+
                                             |
                                SQL Queries  |   ACID Transactions
                                             |
+--------------------------------------------v--------------------------------------------+
|                                  DATA PERSISTENCE TIER                                  |
|   Primary: MySQL 8.0 Relational Server (InnoDB Engine, FK Constraints, UTF8MB4)         |
|   - Tables: users, hospitals, blood_banks, donor_profiles, blood_requests,              |
|             blood_request_timeline, blood_inventory, inventory_movements,               |
|             organ_donation_intents, organ_requests, notifications, audit_logs           |
|   - Resilience Adapter: Auto-Failover Embedded ACID Relational Engine for Zero-Downtime |
+-----------------------------------------------------------------------------------------+
```

### 3. Core Operational Workflows

#### 3.1. Emergency Blood SOS & Matching
1. **Request Intake**: Hospital triage team creates an emergency blood requisition with patient age, blood group, component, units needed, and urgency tier (`CRITICAL_EMERGENCY`, `CRITICAL_SOS`, `URGENT`, `HIGH`, `ROUTINE`).
2. **Clinical Validation**: Server validates required parameters and diagnosis.
3. **Database Insertion**: Requisition stored with a unique tracking ID and initial timeline record.
4. **Candidate Discovery**: Server evaluates donors against the medically valid ABO/Rh hemotherapy compatibility matrix, checking 90-day cooldown interval and computing distance using the Haversine formula with masked approximate coordinates.
5. **Real-Time Dispatch**: High-urgency requisitions are published instantly to listening connected clients over Socket.IO and recorded in persistent in-app notifications.

#### 3.2. Cold Chain Blood Inventory Management
1. **Intake & Restock**: Blood banks log units by blood group, component type, collection date, expiry date, storage rack, and unique batch numbers.
2. **Transactional Reservation**: Hospital reservation requests execute inside a database transaction (`BEGIN ... COMMIT`). If requested units exceed available units, the transaction rolls back immediately with an error, preventing overselling or negative inventory.
3. **Automated Expiry Quarantining**: The background scheduler scans active inventory batches every 30 seconds. Expired batches are automatically flagged (`is_expired = 1`), removed from available units, and logged to the immutable audit ledger.

#### 3.3. Ethical Organ Donation Coordination (Strictly Separated from Blood Matching)
In strict compliance with statutory anatomical gift frameworks (THOA Act & NOTTO protocols):
- Organ donation is managed through a distinct, auditable coordination module.
- Citizens express voluntary donation intent for specific organs (Kidney, Liver, Heart, Lung, Pancreas, Cornea) with next-of-kin counseling acknowledgments.
- Case progression requires explicit multi-party verification gates: `Registration Submitted` &rarr; `Awaiting Verification` &rarr; `Verified` &rarr; `Coordination in Progress` &rarr; `Awaiting Authorized Review` &rarr; `Approved by Authorized Authority` &rarr; `Completed`.
- **Statutory Notice**: The platform does not autonomously allocate organs or override certified clinical determinations. Final cross-matching and surgical allocation remain solely under certified medical transplant authorities.

### 4. Security & Privacy Controls
- **Statutory Privacy**: Unconsented personal phone coordinates and exact home addresses are never published to public directories.
- **Role-Based Access Control**: Server enforces route-level and query-level authorization; switching frontend URL paths or identifiers cannot bypass server checks.
- **Tamper Evidence**: Critical security and clinical state mutations are cryptographically signed with SHA-256 hash chains.
