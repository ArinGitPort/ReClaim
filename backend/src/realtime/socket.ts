import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import jwt from "jsonwebtoken";
import type { Express } from "express";
import { env } from "../config/env.js";

type SocketUser = {
  id: string;
  role: "STUDENT" | "STAFF" | "ADMIN";
  email: string;
};

type RealtimeServer = {
  httpServer: ReturnType<typeof createServer>;
  io: Server;
};

let ioInstance: Server | null = null;

function getAllowedOrigins(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }

  const isConfiguredOrigin = origin === env.frontendOrigin;
  const isLocalDevOrigin = /^http:\/\/localhost:\d+$/.test(origin);
  return isConfiguredOrigin || isLocalDevOrigin;
}

function parseBearerToken(socket: Socket): string | null {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.length > 0) {
    return authToken;
  }

  const header = socket.handshake.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }

  return null;
}

export function createRealtimeServer(app: Express): RealtimeServer {
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (getAllowedOrigins(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("CORS origin not allowed"));
      },
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = parseBearerToken(socket);
      if (!token) {
        next(new Error("Unauthorized"));
        return;
      }

      const payload = jwt.verify(token, env.jwtSecret) as {
        sub: string;
        role: "STUDENT" | "STAFF" | "ADMIN";
        email: string;
      };

      socket.data.user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
      } as SocketUser;

      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as SocketUser;

    socket.join(`reports:user:${user.id}`);
    if (user.role === "ADMIN" || user.role === "STAFF") {
      socket.join("reports:admins");
    }
  });

  ioInstance = io;
  return { httpServer, io };
}

export function emitReportStatusUpdated(payload: {
  reportId: string;
  reportCode: string;
  status: string;
  reporterUserId: string;
  matchedItemId?: string | null;
}): void {
  if (!ioInstance) {
    return;
  }

  ioInstance.to("reports:admins").emit("report.status.updated", payload);
  ioInstance.to(`reports:user:${payload.reporterUserId}`).emit("report.status.updated", payload);
}
