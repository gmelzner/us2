/** Sends one email through Resend, from US2's verified domain. */
export async function sendEmail(to, subject, html) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'US2 <hola@us2.fun>', to, subject, html }),
  });
  return { success: response.ok, data: await response.json().catch(() => ({})) };
}
