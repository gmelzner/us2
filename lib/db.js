/**
 * Postgres access for the API functions. Self-hosted, plain pg, no ORM.
 * Same setup as Mis Estrellas and Padel Tracker: TLS verified against our own CA.
 */

import pg from 'pg';

/**
 * Connection settings shared by the API and the scripts. When
 * DATABASE_CA_CERTIFICATE_BASE64 is set the connection is TLS and verified
 * against it. Do not put sslmode in DATABASE_URL: pg would ignore this CA.
 */
export function getDatabaseConfig() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set, see README');
  const certificate = process.env.DATABASE_CA_CERTIFICATE_BASE64;
  return {
    connectionString,
    ssl: certificate ? { ca: Buffer.from(certificate, 'base64').toString('utf-8') } : undefined,
  };
}

// Reused across invocations of a warm function so connections don't leak
let pool;

export function query(text, params = []) {
  pool ??= new pg.Pool({
    ...getDatabaseConfig(),
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  return pool.query(text, params).then((result) => result.rows);
}
