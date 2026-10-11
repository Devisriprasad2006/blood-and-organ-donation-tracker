import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env.js';

let activeDriver: 'mysql' | 'sqlite' = 'sqlite';
let mysqlPool: mysql.Pool | null = null;
let sqliteDb: InstanceType<typeof Database> | null = null;

export function getDbDriver(): 'mysql' | 'sqlite' {
  return activeDriver;
}

export async function initDatabase(): Promise<void> {
  // Step 1: Attempt MySQL 8 connection
  try {
    console.log(`[Database] Attempting connection to MySQL 8 on ${config.db.host}:${config.db.port}...`);
    
    // Connect without database first to ensure lifelink_db database exists
    const rootConn = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
    });
    
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // Create pool with target database
    mysqlPool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });

    // Test ping
    const testConn = await mysqlPool.getConnection();
    testConn.release();

    activeDriver = 'mysql';
    console.log(`[Database] Successfully connected to MySQL 8 server database '${config.db.database}'.`);
    return;
  } catch (err: any) {
    console.warn(`[Database] MySQL 8 connection not established (${err.message}).`);
    console.log(`[Database] Initializing embedded relational storage engine for reliable zero-downtime execution.`);
  }

  // Step 2: Resilient embedded relational storage fallback
  try {
    const dataDir = path.resolve(process.cwd(), 'server', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'lifelink.db');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');

    activeDriver = 'sqlite';
    console.log(`[Database] Relational storage engine online at ${dbPath}.`);
  } catch (sqliteErr: any) {
    console.error(`[Database Critical Error] Failed to initialize fallback database:`, sqliteErr);
    throw sqliteErr;
  }
}

/**
 * Standardized parameterized query execution.
 * Accepts SQL with ? placeholders.
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (activeDriver === 'mysql' && mysqlPool) {
    const [rows] = await mysqlPool.query(sql, params);
    return rows as T[];
  } else if (sqliteDb) {
    // Convert boolean booleans to 0/1 for SQLite if needed
    const normalizedParams = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);
    // Replace MySQL ON DUPLICATE KEY UPDATE or similar if necessary, or execute standard SELECT/UPDATE
    const stmt = sqliteDb.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('PRAGMA')) {
      const rows = stmt.all(...normalizedParams) as T[];
      return rows;
    } else {
      stmt.run(...normalizedParams);
      return [] as T[];
    }
  }
  throw new Error('Database is not initialized');
}

/**
 * Standardized execute for INSERT, UPDATE, DELETE
 */
export async function execute(sql: string, params: any[] = []): Promise<{ affectedRows: number; insertId?: number | string }> {
  if (activeDriver === 'mysql' && mysqlPool) {
    const [result] = await mysqlPool.execute(sql, params) as any;
    return {
      affectedRows: result.affectedRows || 0,
      insertId: result.insertId,
    };
  } else if (sqliteDb) {
    const normalizedParams = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);
    const stmt = sqliteDb.prepare(sql);
    const info = stmt.run(...normalizedParams);
    return {
      affectedRows: info.changes,
      insertId: info.lastInsertRowid,
    };
  }
  throw new Error('Database is not initialized');
}

/**
 * ACID Transaction runner with rollback on error.
 */
export async function transaction<T>(
  fn: (trx: {
    query: <R = any>(sql: string, params?: any[]) => Promise<R[]>;
    execute: (sql: string, params?: any[]) => Promise<{ affectedRows: number; insertId?: number | string }>;
  }) => Promise<T>
): Promise<T> {
  if (activeDriver === 'mysql' && mysqlPool) {
    const conn = await mysqlPool.getConnection();
    await conn.beginTransaction();
    try {
      const trxRunner = {
        query: async <R = any>(sql: string, params: any[] = []): Promise<R[]> => {
          const [rows] = await conn.query(sql, params);
          return rows as R[];
        },
        execute: async (sql: string, params: any[] = []): Promise<{ affectedRows: number; insertId?: number | string }> => {
          const [res] = await conn.execute(sql, params) as any;
          return { affectedRows: res.affectedRows || 0, insertId: res.insertId };
        },
      };
      const result = await fn(trxRunner);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } else if (sqliteDb) {
    sqliteDb.exec('BEGIN TRANSACTION;');
    try {
      const trxRunner = {
        query: async <R = any>(sql: string, params: any[] = []): Promise<R[]> => {
          const normalizedParams = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);
          const stmt = sqliteDb!.prepare(sql);
          return stmt.all(...normalizedParams) as R[];
        },
        execute: async (sql: string, params: any[] = []): Promise<{ affectedRows: number; insertId?: number | string }> => {
          const normalizedParams = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);
          const stmt = sqliteDb!.prepare(sql);
          const info = stmt.run(...normalizedParams);
          return { affectedRows: info.changes, insertId: info.lastInsertRowid };
        },
      };
      const result = await fn(trxRunner);
      sqliteDb.exec('COMMIT;');
      return result;
    } catch (err) {
      sqliteDb.exec('ROLLBACK;');
      throw err;
    }
  }
  throw new Error('Database is not initialized');
}

export async function closeDatabase(): Promise<void> {
  if (mysqlPool) {
    await mysqlPool.end();
    mysqlPool = null;
  }
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
  }
}
