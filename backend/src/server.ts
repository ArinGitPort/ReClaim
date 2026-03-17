import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { createRealtimeServer } from "./realtime/socket.js";

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    const { httpServer } = createRealtimeServer(app);

    httpServer.listen(env.port, () => {
      console.log(`ReClaim backend listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to bootstrap backend", error);
    process.exit(1);
  }
}

void bootstrap();
