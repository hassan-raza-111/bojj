import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables
dotenv.config();

// Environment variables schema
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("5000"),
  DATABASE_URL: z.string(),
  CORS_ORIGIN: z.string().default("*"),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  database: {
    url: env.DATABASE_URL,
  },
  corsOrigin: env.CORS_ORIGIN,
} as const;
