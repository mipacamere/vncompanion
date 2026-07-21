/**
 * Via Nazionale Guest Data Sender — Netlify Function
 * -----------------------------------------
 * Riceve il JSON con i dati degli ospiti dal frontend e lo invia via email come
 * allegato, usando Resend (https://resend.com). Nessun intervento manuale richiesto:
 * l'utente tocca un bottone, il file arriva direttamente nella casella email configurata.
 *
 * Raggiungibile su: https://tuosito.netlify.app/api/send-guest-data
 */
export default async (request) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-App-Token',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const expectedToken = process.env.APP_SHARED_TOKEN;
  if (expectedToken) {
    const token = request.headers.get('X-App-Token');
    if (token !== expectedToken) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
  }

  const exportData = body.exportData;
  const filename = body.filename || 'export_alloggiati.json';
  if (!exportData || !Array.isArray(exportData.guests) || exportData.guests.length === 0) {
    return new Response('Missing or empty exportData', { status: 400, headers: corsHeaders });
  }

  const jsonString = JSON.stringify(exportData, null, 2);
  const base64Content = Buffer.from(jsonString, 'utf-8').toString('base64');

  const guestNames = exportData.guests
    .map(g => (g.personal && (g.personal.lastName + ' ' + g.personal.firstName)) || '—')
    .join(', ');

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
  const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;

  if (!RESEND_API_KEY || !RECIPIENT_EMAIL) {
    return new Response(JSON.stringify({ error: 'Email non configurata sul server (RESEND_API_KEY o RECIPIENT_EMAIL mancanti)' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let resendRes;
  try {
    resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: [RECIPIENT_EMAIL],
        subject: 'Via Nazionale — Nuova pratica alloggiati (' + exportData.guests.length + ' ospiti)',
        text: 'In allegato i dati ospiti raccolti dall\'app Via Nazionale.\n\nOspiti: ' + guestNames
          + '\nData export: ' + exportData.exportDate,
        attachments: [{ filename, content: base64Content }],
      }),
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Servizio email non raggiungibile' }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!resendRes.ok) {
    const detail = await resendRes.text();
    return new Response(JSON.stringify({ error: 'Invio email fallito', detail }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

export const config = { path: '/api/send-guest-data' };
