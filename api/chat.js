// Keeper chat endpoint: relays a visitor message to the CCTC agent on
// Google Agent Runtime, returns the reply, and emails any contact request.
import { googleToken } from './_google.js';
import { sendLead } from './_lead.js';

const { AGENT_RESOURCE } = process.env; // projects/<p>/locations/us-west1/reasoningEngines/<id>
const MAX_MESSAGE_CHARS = 600;

function endpoint(method) {
  const region = AGENT_RESOURCE.split('/locations/')[1].split('/')[0];
  return `https://${region}-aiplatform.googleapis.com/v1/${AGENT_RESOURCE}:${method}`;
}

// Sessions live in Agent Runtime's managed Sessions service.
async function createSession(token, userId) {
  const region = AGENT_RESOURCE.split('/locations/')[1].split('/')[0];
  const res = await fetch(`https://${region}-aiplatform.googleapis.com/v1/${AGENT_RESOURCE}/sessions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error(`create_session ${res.status}: ${await res.text()}`);
  const data = await res.json();
  // Returns an operation named .../sessions/<id>/operations/<op>
  const m = (data.name || '').match(/\/sessions\/([^/]+)/);
  if (!m) throw new Error(`create_session: unexpected ${JSON.stringify(data).slice(0, 300)}`);
  return m[1];
}

async function ask(token, userId, sessionId, message) {
  let res;
  for (const method of ['async_stream_query', 'stream_query']) {
    res = await fetch(endpoint('streamQuery'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        class_method: method,
        input: { user_id: userId, session_id: sessionId, message },
      }),
    });
    if (res.ok) break;
  }
  if (!res.ok) throw new Error(`stream_query ${res.status}: ${await res.text()}`);
  const raw = await res.text();
  // The response is a series of JSON events (one per line). Collect the agent's text.
  let text = '';
  for (let line of raw.split('\n')) {
    line = line.trim().replace(/^data:\s*/, '');
    if (!line.startsWith('{')) continue;
    try {
      const evt = JSON.parse(line);
      if (evt.content?.role === 'user') continue;
      for (const part of evt.content?.parts || []) {
        if (typeof part.text === 'string' && !part.thought) text += part.text;
      }
    } catch { /* ignore partial lines */ }
  }
  return text.trim();
}

// The agent ends a confirmed contact request with one line:
// LEAD:: name=...; phone=...; email=...; contact=...; time=...; voicemail=...; need=...
function extractLead(text) {
  const match = text.match(/^\s*LEAD::(.*)$/m);
  if (!match) return { reply: text, lead: null };
  const lead = {};
  for (const pair of match[1].split(';')) {
    const [k, ...v] = pair.split('=');
    if (k && v.length) lead[k.trim().toLowerCase()] = v.join('=').trim();
  }
  return { reply: text.replace(match[0], '').trim(), lead };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { message, userId, sessionId } = req.body || {};
    if (typeof message !== 'string' || !message.trim() || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Bad request' });
    }
    const text = message.slice(0, MAX_MESSAGE_CHARS);
    const token = await googleToken();
    const sid = sessionId || (await createSession(token, userId));
    const answer = await ask(token, userId, sid, text);
    const { reply, lead } = extractLead(answer);
    if (lead) {
      try { await sendLead(lead); } catch (e) { console.error('lead email failed', e.message); }
    }
    return res.status(200).json({
      reply: reply || "Sorry, I didn't catch that. You can always reach our admissions team 24/7 at (316) 330-7126.",
      sessionId: sid,
    });
  } catch (e) {
    console.error('chat error', e.message);
    return res.status(200).json({
      reply: "I'm having trouble right now. Please call our admissions team 24/7 at (316) 330-7126. If this is an emergency, call 911, or call or text 988.",
      error: true,
    });
  }
}
