import type { Request, Response } from "express"
import { listUserPickups } from "@/services/userPickupService.js"

export async function getUserPickups(req: Request, res: Response): Promise<void> {
  const pickups = await listUserPickups(req.user!.id)
  res.json({ pickups })
}
