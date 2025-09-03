import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
import path from 'path';
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Environment variables schema
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string(),
  CORS_ORIGIN: z.string().default('*'),
  JWT_SECRET: z.string().default('your-super-secure-jwt-secret-key'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  REDIS_URL: z.string().optional(),
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
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  },
  redis: {
    url: env.REDIS_URL,
  },
} as const;
