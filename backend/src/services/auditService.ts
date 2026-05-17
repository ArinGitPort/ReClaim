import { AuditAction, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";

export async function logAudit(input: {
  actorUserId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  description?: string;
  payload?: Prisma.InputJsonValue;
  targetReferenceCode?: string;
}): Promise<void> {
  const payloadObject =
    input.payload && typeof input.payload === "object" && !Array.isArray(input.payload)
      ? ({ ...(input.payload as Record<string, unknown>) } as Record<string, unknown>)
      : undefined;

  if (input.targetReferenceCode && payloadObject && !payloadObject.targetReferenceCode) {
    payloadObject.targetReferenceCode = input.targetReferenceCode;
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      description: input.description,
      payload: (payloadObject ?? input.payload) as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function listAuditLogs(filters: {
  search?: string;
  action?: AuditAction;
  limit?: number;
  page?: number;
}) {
  const normalizedSearch = filters.search?.trim();
  const page = Math.max(filters.page ?? 1, 1);
  const limit = Math.min(Math.max(filters.limit ?? 25, 1), 100);

  const where: Prisma.AuditLogWhereInput = {
    ...(filters.action ? { action: filters.action } : {}),
    ...(normalizedSearch
      ? {
          OR: [
            { description: { contains: normalizedSearch, mode: "insensitive" as const } },
            { targetType: { contains: normalizedSearch, mode: "insensitive" as const } },
            { targetId: { contains: normalizedSearch, mode: "insensitive" as const } },
            { actorUser: { name: { contains: normalizedSearch, mode: "insensitive" as const } } },
            { actorUser: { email: { contains: normalizedSearch, mode: "insensitive" as const } } },
            { action: { equals: normalizedSearch as AuditAction } },
          ],
        }
      : {}),
  };

  const [baseLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actorUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            studentId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const itemIds = baseLogs.filter((log) => log.targetType === "found_item").map((log) => log.targetId);
  const claimIds = baseLogs.filter((log) => log.targetType === "claim").map((log) => log.targetId);
  const reportIds = baseLogs.filter((log) => log.targetType === "lost_report").map((log) => log.targetId);
  const handoverIds = baseLogs.filter((log) => log.targetType === "handover").map((log) => log.targetId);

  const [items, claims, reports, handovers] = await Promise.all([
    itemIds.length > 0
      ? prisma.foundItem.findMany({ where: { id: { in: itemIds } }, select: { id: true, code: true } })
      : Promise.resolve([]),
    claimIds.length > 0
      ? prisma.claim.findMany({ where: { id: { in: claimIds } }, select: { id: true, claimCode: true } })
      : Promise.resolve([]),
    reportIds.length > 0
      ? prisma.lostReport.findMany({ where: { id: { in: reportIds } }, select: { id: true, reportCode: true } })
      : Promise.resolve([]),
    handoverIds.length > 0
      ? prisma.handoverLog.findMany({
          where: { id: { in: handoverIds } },
          select: {
            id: true,
            foundItem: { select: { code: true } },
            claim: { select: { claimCode: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const itemCodeById = new Map(items.map((item) => [item.id, item.code]));
  const claimCodeById = new Map(claims.map((claim) => [claim.id, claim.claimCode]));
  const reportCodeById = new Map(reports.map((report) => [report.id, report.reportCode]));
  const handoverRefById = new Map(
    handovers.map((handover) => [handover.id, handover.claim?.claimCode ?? handover.foundItem.code ?? handover.id.slice(0, 8)])
  );

  const enriched = baseLogs.map((log) => {
    const payloadObject = toPayloadObject(log.payload);

    const targetReferenceCode =
      (typeof payloadObject?.targetReferenceCode === "string" ? payloadObject.targetReferenceCode : undefined) ??
      (log.targetType === "found_item"
        ? itemCodeById.get(log.targetId)
        : log.targetType === "claim"
          ? claimCodeById.get(log.targetId)
          : log.targetType === "lost_report"
            ? reportCodeById.get(log.targetId)
            : log.targetType === "handover"
              ? handoverRefById.get(log.targetId)
              : undefined) ??
      log.targetId.slice(0, 8);

    return {
      ...log,
      targetReferenceCode,
      actionSentence: `${log.actorUser.name} ${toActionVerb(log.action)} ${toTargetLabel(log.targetType)} (${targetReferenceCode})`,
    };
  });

  return {
    logs: enriched,
    total,
    page,
    limit,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
}

function toPayloadObject(payload: Prisma.JsonValue | null): Record<string, unknown> | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return undefined;
  }

  return payload as Record<string, unknown>;
}

function toTargetLabel(targetType: string): string {
  if (targetType === "found_item") return "Found Item";
  if (targetType === "claim") return "Claim";
  if (targetType === "lost_report") return "Lost Report";
  if (targetType === "handover") return "Handover";
  if (targetType === "user") return "User";
  if (targetType === "snapshot") return "AI Snapshot";
  return targetType;
}

function toActionVerb(action: AuditAction): string {
  if (action === AuditAction.AUTH_LOGIN) return "logged in and accessed";
  if (action === AuditAction.ITEM_CREATED) return "created";
  if (action === AuditAction.ITEM_UPDATED) return "updated";
  if (action === AuditAction.CLAIM_SUBMITTED) return "submitted";
  if (action === AuditAction.CLAIM_APPROVED) return "approved";
  if (action === AuditAction.CLAIM_DENIED) return "denied";
  if (action === AuditAction.CLAIM_REVIEWED) return "reviewed";
  if (action === AuditAction.REPORT_SUBMITTED) return "submitted";
  if (action === AuditAction.REPORT_UPDATED) return "updated";
  if (action === AuditAction.REPORT_LINKED) return "linked";
  if (action === AuditAction.HANDOVER_COMPLETED) return "completed";
  if (action === AuditAction.SNAPSHOT_DISMISSED) return "dismissed";
  if (action === AuditAction.SNAPSHOT_RESTORED) return "restored";
  if (action === AuditAction.USER_CREATED) return "created";
  if (action === AuditAction.USER_UPDATED) return "updated";
  if (action === AuditAction.USER_ROLE_CHANGED) return "changed role for";
  if (action === AuditAction.USER_DISABLED) return "disabled";
  if (action === AuditAction.USER_ENABLED) return "enabled";
  if (action === AuditAction.USER_PASSWORD_RESET) return "reset password for";
  return "updated";
}
