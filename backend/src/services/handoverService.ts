import { ItemStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/errors.js";

export async function createHandoverLog(input: {
  foundItemId: string;
  claimId?: string;
  releasedToUserId: string;
  pickupTokenPresented: string;
  idVerified: boolean;
  note?: string;
}) {
  const item = await prisma.foundItem.findUnique({ where: { id: input.foundItemId } });
  if (!item) {
    throw new HttpError(404, "Found item not found");
  }

  const handover = await prisma.handoverLog.create({
    data: {
      foundItemId: input.foundItemId,
      claimId: input.claimId,
      releasedToUserId: input.releasedToUserId,
      pickupTokenPresented: input.pickupTokenPresented,
      idVerified: input.idVerified,
      releasedAtUtc: new Date(),
      note: input.note,
    },
  });

  await prisma.foundItem.update({
    where: { id: input.foundItemId },
    data: {
      status: ItemStatus.RETURNED,
    },
  });

  return handover;
}
