import dotenv from "dotenv";

dotenv.config();

function readEnv(key: string, aliases: string[] = []): string | undefined {
  return [key, ...aliases].map((envKey) => process.env[envKey]).find((value): value is string => Boolean(value));
}

function requireEnv(key: string, aliases: string[] = []): string {
  const value = readEnv(key, aliases);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  serviceToken: requireEnv("SERVICE_TOKEN", ["SERVICE_API_KEY", "BACKEND_SERVICE_TOKEN"]),
  aiActorUserId: process.env.AI_ACTOR_USER_ID,
};
