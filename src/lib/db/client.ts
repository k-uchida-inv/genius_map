import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Use in-memory SQLite during build when env vars aren't available
const client = createClient(
  process.env.TURSO_DATABASE_URL
    ? { url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN ?? '' }
    : { url: 'file::memory:' },
);

export const db = drizzle(client, { schema });
