// Emails a contact request collected by Keeper to the CCTC lead inbox (via Resend).
const { RESEND_API_KEY, LEAD_EMAIL_TO, LEAD_EMAIL_FROM } = process.env;

const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function sendLead(lead) {
  if (!RESEND_API_KEY || !LEAD_EMAIL_TO) throw new Error('Email not configured');
  const rows = [
    ['First name', lead.name],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['Prefers', lead.contact],
    ['Best time', lead.time],
    ['Voicemail OK', lead.voicemail],
    ['Looking for', lead.need],
  ];
  const html = `<h2>New contact request from Keeper (website chat)</h2>
<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif">
${rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v) || '—'}</td></tr>`).join('\n')}
</table>
<p style="color:#666;font-family:Arial,sans-serif">Please reach out promptly. This request came from the chat on cctcwichita.com.</p>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: LEAD_EMAIL_FROM || 'Keeper <onboarding@resend.dev>',
      to: [LEAD_EMAIL_TO],
      subject: `Keeper: new contact request${lead.name ? ` from ${lead.name}` : ''}`,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
