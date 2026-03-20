import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";

export async function logAudit(input: {
  actorUserId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  description?: string;
  payload?: object;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      description: input.description,
      payload: input.payload,
    },
  });
}
