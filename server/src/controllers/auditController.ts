import { Request, Response, NextFunction } from 'express';
import { getAuditLogs } from '../services/auditService.js';

export async function getAuditLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const offset = parseInt((req.query.offset as string) || '0', 10);

    const { logs, total } = await getAuditLogs(limit, offset);
    res.json({
      success: true,
      logs,
      total,
      limit,
      offset,
    });
  } catch (err: any) {
    next(err);
  }
}
