import { query } from '../lib/db.js';
import { sendEmail } from '../lib/resend.js';
import { notifyPartnerCompleted } from '../lib/scheduled-emails.js';

const PAIR_ID = /^[A-Za-z0-9_-]{3,64}$/;

// Called by the page when person B finishes. The page only says which pair;
// whether an email goes out, to whom and with which link is decided here.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const pairId = req.body?.pairId;
  if (typeof pairId !== 'string' || !PAIR_ID.test(pairId)) return res.status(400).json({ error: 'pairId' });
  try {
    return res.status(200).json({ sent: await notifyPartnerCompleted({ query, send: sendEmail, pairId }) });
  } catch (error) {
    console.error('Partner notification failed:', error);
    return res.status(500).json({ error: 'Could not send' });
  }
}
