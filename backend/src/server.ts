import { app } from "@/app.js";
import { env } from "@/config/env.js";
import { prisma } from "@/lib/prisma.js";
import { createRealtimeServer } from "@/realtime/socket.js";

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    const { httpServer } = createRealtimeServer(app);

    httpServer.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${env.port} is already in use. Stop the existing backend process or set a different PORT.`);
      } else {
        console.error("Backend server error", error);
      }
      void prisma.$disconnect().finally(() => process.exit(1));
    });

    httpServer.listen(env.port, () => {
      console.log(`ReClaim backend listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to bootstrap backend", error);
    process.exit(1);
  }
}

void bootstrap();
