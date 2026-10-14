import { query } from '../lib/db.js';

// Used by the daily healthcheck on the VPS: is the app reaching its database?
export default async function handler(req, res) {
  try {
    await query('SELECT 1');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(503).json({ ok: false });
  }
}
