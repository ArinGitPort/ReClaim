import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();

    app.listen(env.port, () => {
      console.log(`ReClaim backend listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to bootstrap backend", error);
    process.exit(1);
  }
}

void bootstrap();
