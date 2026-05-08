import { z } from "zod";

export const addCameraSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  location: z.string().trim().min(2, "Location must be at least 2 characters."),
  sourceType: z.enum(["webcam", "rtsp"]),
  webcamIndex: z.string().optional(),
  rtspUrl: z.string().optional(),
}).refine((data) => {
  if (data.sourceType === "rtsp" && (!data.rtspUrl || !data.rtspUrl.startsWith("rtsp://"))) {
    return false;
  }
  return true;
}, {
  message: "Valid RTSP URL is required for IP cameras.",
  path: ["rtspUrl"],
});

export type AddCameraFormData = z.infer<typeof addCameraSchema>;
