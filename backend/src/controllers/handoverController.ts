import { AuditAction } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { createHandoverLog } from "../services/handoverService.js";
import { logAudit } from "../services/auditService.js";

const handoverSchema = z.object({
  foundItemId: z.string().uuid(),
  claimId: z.string().uuid().optional(),
  releasedToUserId: z.string().uuid(),
  pickupTokenPresented: z.string().min(2),
  idVerified: z.boolean(),
  note: z.string().optional(),
});

export async function postHandover(req: Request, res: Response): Promise<void> {
  const body = handoverSchema.parse(req.body);

  const handover = await createHandoverLog(body);

  await logAudit({
    actorUserId: req.user!.id,
    action: AuditAction.HANDOVER_COMPLETED,
    targetType: "handover",
    targetId: handover.id,
    description: "Item handover completed",
    payload: {
      foundItemId: handover.foundItemId,
      releasedToUserId: handover.releasedToUserId,
    },
  });

  res.status(201).json({ handover });
}
