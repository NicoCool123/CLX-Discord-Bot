import dotenv from 'dotenv';
import { resolve } from 'path';

// Load root .env from monorepo root
dotenv.config({ path: resolve(__dirname, '../../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  token: requireEnv('DISCORD_TOKEN'),
  clientId: requireEnv('CLIENT_ID'),
  databaseUrl: requireEnv('DATABASE_URL'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
} as const;
