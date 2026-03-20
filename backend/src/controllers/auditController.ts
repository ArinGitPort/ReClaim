import { AuditAction } from "@prisma/client";
import type { Request, Response } from "express";
import { listAuditLogs } from "@/services/auditService.js";

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const actionQuery = typeof req.query.action === "string" ? req.query.action : undefined;
  const pageQuery = typeof req.query.page === "string" ? Number.parseInt(req.query.page, 10) : undefined;
  const limitQuery = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : undefined;

  const action = actionQuery && Object.values(AuditAction).includes(actionQuery as AuditAction)
    ? (actionQuery as AuditAction)
    : undefined;

  const page = Number.isFinite(pageQuery) && (pageQuery as number) > 0
    ? (pageQuery as number)
    : 1;

  const limit = Number.isFinite(limitQuery) && (limitQuery as number) > 0
    ? Math.min(limitQuery as number, 500)
    : 25;

  const result = await listAuditLogs({ search, action, page, limit });
  res.json({
    logs: result.logs,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pageCount: result.pageCount,
    },
  });
}
