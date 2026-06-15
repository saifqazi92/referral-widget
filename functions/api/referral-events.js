const MAX_BODY_BYTES = 4096;

const ALLOWED_EVENTS = new Set([
  'referral_widget_loaded',
  'referral_widget_visible',
  'referral_widget_opened',
  'referral_widget_form_loaded',
  'referral_widget_submitted',
  'referral_widget_closed',
  'referral_widget_form_error',
  'referral_widget_launch_card_shown',
  'referral_widget_launch_card_cta_clicked',
  'referral_widget_launch_card_dismissed',
  'referral_widget_launch_card_state_error',
]);

const REQUIRED_FIELDS = [
  'event_id',
  'event_name',
  'session_id',
  'user_id',
  'kitchen_id',
  'kitchen_name',
  'route',
  'device',
  'widget_version',
  'script_url',
  'occurred_at',
];

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

  normalized = normalizeEvent(body);

  if (normalized.error) {
    return jsonResponse(request, { error: normalized.error }, 400);
  }

  await env.DB.prepare(
    [
      'INSERT INTO referral_widget_events (',
      'event_id, event_name, session_id, user_id, kitchen_id, kitchen_name, route, device,',
      'viewport_width, viewport_height, widget_version, script_url, occurred_at',
      ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      'ON CONFLICT(event_id) DO NOTHING',
    ].join(' ')
  )
    .bind(
      normalized.event_id,
      normalized.event_name,
      normalized.session_id,
      normalized.user_id,
      normalized.kitchen_id,
      normalized.kitchen_name,
      normalized.route,
      normalized.device,
      normalized.viewport_width,
      normalized.viewport_height,
      normalized.widget_version,
      normalized.script_url,
      normalized.occurred_at
    )
    .run();

  return jsonResponse(request, { ok: true }, 202);
}

function normalizeEvent(body) {
  const event = {};
  let missing;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Payload must be an object' };
  }

  missing = REQUIRED_FIELDS.filter((field) => !hasString(body[field]));

  if (missing.length) {
    return { error: `Missing required field: ${missing[0]}` };
  }

  event.event_id = cleanString(body.event_id, 120);
  event.event_name = cleanString(body.event_name, 80);
  event.session_id = cleanString(body.session_id, 120);
  event.user_id = cleanString(body.user_id, 80);
  event.kitchen_id = cleanString(body.kitchen_id, 80);
  event.kitchen_name = cleanString(body.kitchen_name, 180);
  event.route = cleanString(body.route, 180);
  event.device = cleanString(body.device, 20);
  event.viewport_width = cleanInteger(body.viewport_width);
  event.viewport_height = cleanInteger(body.viewport_height);
  event.widget_version = cleanString(body.widget_version, 80);
  event.script_url = cleanString(body.script_url, 500);
  event.occurred_at = cleanString(body.occurred_at, 40);

  if (!ALLOWED_EVENTS.has(event.event_name)) {
    return { error: 'Invalid event_name' };
  }

  if (event.device !== 'desktop' && event.device !== 'mobile') {
    return { error: 'Invalid device' };
  }

  if (!event.route.startsWith('/') || event.route.includes('?') || event.route.includes('#')) {
    return { error: 'Invalid route' };
  }

  if (Number.isNaN(Date.parse(event.occurred_at))) {
    return { error: 'Invalid occurred_at' };
  }

  return event;
}

function hasString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function cleanString(value, maxLength) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim().slice(0, maxLength);
}

function cleanInteger(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.round(parsed);
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
