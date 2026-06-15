const MAX_BODY_BYTES = 4096;

const ALLOWED_ACTIONS = new Set(['check', 'dismiss']);
const ALLOWED_DISMISS_REASONS = new Set(['close', 'cta']);

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  if (request.method !== 'POST') {
    return jsonResponse(request, { error: 'Method not allowed' }, 405);
  }

  if (!env.DB) {
    return jsonResponse(request, { error: 'D1 binding DB is not configured' }, 500);
  }

  return handlePost(request, env);
}

async function handlePost(request, env) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  let text;
  let body;
  let normalized;

  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse(request, { error: 'Payload too large' }, 413);
  }

  text = await request.text();

  if (text.length > MAX_BODY_BYTES) {
    return jsonResponse(request, { error: 'Payload too large' }, 413);
  }

  try {
    body = JSON.parse(text);
  } catch (error) {
    return jsonResponse(request, { error: 'Invalid JSON' }, 400);
  }

  normalized = normalizeRequest(body);

  if (normalized.error) {
    return jsonResponse(request, { error: normalized.error }, 400);
  }

  if (normalized.action === 'check') {
    return handleCheck(request, env, normalized);
  }

  return handleDismiss(request, env, normalized);
}

async function handleCheck(request, env, event) {
  const existing = await env.DB.prepare(
    'SELECT kitchen_id FROM referral_widget_launch_card_state WHERE kitchen_id = ? LIMIT 1'
  )
    .bind(event.kitchen_id)
    .first();

  return jsonResponse(request, { showLaunchCard: !existing }, 200);
}

async function handleDismiss(request, env, event) {
  await env.DB.prepare(
    [
      'INSERT INTO referral_widget_launch_card_state (',
      'kitchen_id, kitchen_name, first_user_id, dismissed_reason, widget_version',
      ') VALUES (?, ?, ?, ?, ?)',
      'ON CONFLICT(kitchen_id) DO NOTHING',
    ].join(' ')
  )
    .bind(
      event.kitchen_id,
      event.kitchen_name,
      event.first_user_id,
      event.dismissed_reason,
      event.widget_version
    )
    .run();

  return jsonResponse(request, { ok: true }, 202);
}

function normalizeRequest(body) {
  const event = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Payload must be an object' };
  }

  event.action = cleanString(body.action, 20);
  event.kitchen_id = cleanString(body.kitchen_id, 80);
  event.kitchen_name = cleanString(body.kitchen_name, 180);
  event.first_user_id = cleanString(body.first_user_id, 80);
  event.dismissed_reason = cleanString(body.dismissed_reason, 20);
  event.widget_version = cleanString(body.widget_version, 80);

  if (!ALLOWED_ACTIONS.has(event.action)) {
    return { error: 'Invalid action' };
  }

  if (!event.kitchen_id) {
    return { error: 'Missing required field: kitchen_id' };
  }

  if (event.action === 'dismiss') {
    if (!ALLOWED_DISMISS_REASONS.has(event.dismissed_reason)) {
      return { error: 'Invalid dismissed_reason' };
    }

    if (!event.widget_version) {
      return { error: 'Missing required field: widget_version' };
    }
  }

  return event;
}

function cleanString(value, maxLength) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim().slice(0, maxLength);
}

function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

function jsonResponse(request, body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = getAllowedOrigin(origin);

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function getAllowedOrigin(origin) {
  if (origin === 'https://kitchen.getjelly.co.uk') {
    return origin;
  }

  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return origin;
  }

  return 'https://kitchen.getjelly.co.uk';
}
