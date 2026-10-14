import { query } from '../lib/db.js';
import { sendEmail } from '../lib/resend.js';
import { runScheduledEmails } from '../lib/scheduled-emails.js';

// Vercel Cron calls this once a day (vercel.json) with CRON_SECRET as a bearer token
export default async function handler(req, res) {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const result = await runScheduledEmails({ query, send: sendEmail });
  console.log('Scheduled emails:', JSON.stringify(result));
  return res.status(result.errors.length ? 500 : 200).json(result);
}
