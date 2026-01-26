// Vercel Serverless Function - Called daily by Vercel Cron
// Triggers Supabase Edge Function to send scheduled emails

export default async function handler(req, res) {
  // Verify this is coming from Vercel Cron (optional security)
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow if no CRON_SECRET is set (for testing) or if it matches
    if (process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const SUPABASE_URL = 'https://lcmooxztnwdvhmnhfwyu.supabase.co';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjbW9veHp0bndkdmhtbmhmd3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMDIxNDcsImV4cCI6MjA4NDc3ODE0N30.96aIqPR0lt8mqId8lPKuIg-lNKt92AbAAFvGRIG-fj8';

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-scheduled-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ type: 'cron' }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Supabase edge function error:', data);
      return res.status(500).json({ error: 'Edge function failed', details: data });
    }

    console.log('Cron job completed:', data);
    return res.status(200).json({ success: true, ...data });

  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({ error: error.message });
  }
}
