import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { env } from "@/config/env.js";

type DaemonStatusPayload = {
  status?: string;
  active_cameras?: string[];
  model?: string;
  device?: string;
  cudaAvailable?: boolean;
};

export type AiDaemonStatus = {
  running: boolean;
  managed: boolean;
  pid: number | null;
  streamBaseUrl: string;
  activeCameras: string[];
  model: string | null;
  device: string | null;
  cudaAvailable: boolean | null;
  error?: string;
};

let managedProcess: ChildProcess | null = null;

export async function getAiDaemonStatus(): Promise<AiDaemonStatus> {
  const payload = await probeDaemon();
  return toStatus(payload);
}

export async function startAiDaemon(): Promise<AiDaemonStatus> {
  const existing = await probeDaemon();
  if (existing) {
    return toStatus(existing);
  }

  const aiServiceDir = path.resolve(process.cwd(), "..", "ai-service");
  const scriptPath = path.join(aiServiceDir, "daemon.py");
  const child = spawn(env.aiDaemonPython, [scriptPath], {
    cwd: aiServiceDir,
    env: {
      ...process.env,
      BACKEND_API_BASE: process.env.BACKEND_API_BASE ?? `http://127.0.0.1:${env.port}/api`,
      BACKEND_SERVICE_TOKEN: env.serviceToken,
    },
    windowsHide: true,
    stdio: "ignore",
  });
  managedProcess = child;
  child.unref();
  child.once("exit", () => {
    managedProcess = null;
  });

  await waitForDaemon();
  const payload = await probeDaemon();
  return toStatus(payload, payload ? undefined : "AI daemon did not become ready.");
}

export async function stopAiDaemon(): Promise<AiDaemonStatus> {
  try {
    await fetch(`${env.aiServiceBaseUrl}/shutdown`, {
      method: "POST",
      headers: { "x-service-token": env.serviceToken },
      signal: AbortSignal.timeout(1500),
    });
  } catch {
    // The process may close the connection while shutting down.
  }

  if (managedProcess?.pid) {
    managedProcess.kill();
    managedProcess = null;
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  const payload = await probeDaemon();
  return toStatus(payload);
}

async function waitForDaemon() {
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const payload = await probeDaemon();
    if (payload) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

async function probeDaemon(): Promise<DaemonStatusPayload | null> {
  try {
    const response = await fetch(`${env.aiServiceBaseUrl}/status`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) return null;
    return await response.json() as DaemonStatusPayload;
  } catch {
    return null;
  }
}

function toStatus(payload: DaemonStatusPayload | null, error?: string): AiDaemonStatus {
  return {
    running: Boolean(payload),
    managed: Boolean(managedProcess),
    pid: managedProcess?.pid ?? null,
    streamBaseUrl: env.aiServiceBaseUrl,
    activeCameras: payload?.active_cameras ?? [],
    model: payload?.model ?? null,
    device: payload?.device ?? null,
    cudaAvailable: typeof payload?.cudaAvailable === "boolean" ? payload.cudaAvailable : null,
    error,
  };
}
