/**
 * Migration runner. Plain SQL files in db/migrations, applied in filename
 * order, each inside a transaction, recorded in schema_migrations so running
 * it again is a no-op.
 *
 *   npm run db:migrate
 *
 * Reads DATABASE_URL and DATABASE_CA_CERTIFICATE_BASE64 from .env.local when
 * they are not already set in the shell.
 */

import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import { getDatabaseConfig } from '../lib/db.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

try {
  for (const line of readFileSync(join(root, '.env.local'), 'utf-8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].trim();
  }
} catch {
  // the variables may come from the shell instead
}

const client = new pg.Client(getDatabaseConfig());
await client.connect();
await client.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename    text PRIMARY KEY,
    applied_at  timestamptz NOT NULL DEFAULT now()
  )
`);
const applied = new Set((await client.query('SELECT filename FROM schema_migrations')).rows.map((row) => row.filename));
const directory = join(root, 'db', 'migrations');
let count = 0;
for (const file of readdirSync(directory).filter((name) => name.endsWith('.sql')).sort()) {
  if (applied.has(file)) continue;
  process.stdout.write(`  applying ${file} ... `);
  try {
    await client.query('BEGIN');
    await client.query(readFileSync(join(directory, file), 'utf-8'));
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    await client.query('COMMIT');
    console.log('ok');
    count++;
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('FAILED');
    console.error(error.message);
    await client.end();
    process.exit(1);
  }
}
console.log(count === 0 ? 'Nothing to apply, schema is current.' : `Applied ${count} migration(s).`);
await client.end();
