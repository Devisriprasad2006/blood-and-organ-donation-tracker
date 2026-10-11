# Production Deployment & Operations Guide

## Digital Blood and Organ Donation Management and Tracking System

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v24 LTS recommended)
- **Database**: MySQL Server 8.0+ or Docker Compose
- **Container Runtime**: Docker & Docker Compose v2.0+ (for containerized deployments)
- **Reverse Proxy**: NGINX with SSL/TLS termination

---

### 2. Local Bare-Metal Execution

#### 2.1. Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env
```
Ensure database credentials in `.env` reflect your local MySQL instance:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lifelink_db
JWT_SECRET=production_random_secret_string
```

#### 2.2. Install Dependencies
```bash
npm install
```

#### 2.3. Run Server Engine
The server automatically applies versioned schema migrations (`_schema_migrations`) and populates the initial seed dataset on boot:
```bash
npm run server
```

#### 2.4. Run Web Application
In a separate terminal:
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

### 3. Automated Verification & Testing

Execute the comprehensive automated test suite (authentication, RBAC, inventory concurrency, matching rules, validation):
```bash
npm run test
```

Verify TypeScript types and build bundle:
```bash
npm run build
```

---

### 4. Containerized Multi-Tier Deployment (Docker Compose)

Launch the MySQL 8 database, Node.js API engine, and NGINX frontend reverse proxy:
```bash
docker compose up -d --build
```

Verify service health:
```bash
docker compose ps
curl http://localhost/api/v1/health
```

To review backend application logs:
```bash
docker compose logs -f lifelink-api
```

---

### 5. Database Backup and Recovery

#### Hot Backup Generation (PowerShell):
```powershell
.\scripts\backup_mysql.ps1 -DbHost "127.0.0.1" -DbUser "root" -DbPassword "your_password" -DbName "lifelink_db"
```

#### Hot Backup Generation (Linux/Bash):
```bash
mysqldump -h 127.0.0.1 -u root -p --single-transaction --routines --triggers lifelink_db > backups/lifelink_backup_$(date +%Y%m%d).sql
```

#### Restoration Procedure:
```bash
mysql -h 127.0.0.1 -u root -p lifelink_db < backups/lifelink_backup_YYYYMMDD.sql
```

---

### 6. Operational Health Checks

- **REST API Endpoint**: `GET /api/v1/health`
- **Uptime Telemetry**: Returns service uptime, database driver status, platform version, and timestamp.
