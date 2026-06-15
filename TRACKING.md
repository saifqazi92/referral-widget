# Referral Widget Tracking

This file documents the Cloudflare D1 tracking setup for the Jelly referral widget. It is intended as the reference point for future debugging, deployment, and funnel analysis.

## What We Built

The widget sends lightweight funnel events from the browser to a Cloudflare Pages Function, which writes the events into a Cloudflare D1 table.

```txt
referral.js
  -> https://jelly-referral-widget.pages.dev/api/referral-events
  -> Cloudflare Pages Function
  -> D1 table: referral_widget_events
```

HubSpot remains the source of truth for actual referral leads. D1 is only for raw widget analytics: who saw the widget, who opened it, whether the HubSpot form loaded, and whether HubSpot reported a successful submission.

## Current Production URLs

```txt
Widget script:
https://jelly-referral-widget.pages.dev/referral.js

Tracking endpoint:
https://jelly-referral-widget.pages.dev/api/referral-events

Launch card state endpoint:
https://jelly-referral-widget.pages.dev/api/referral-launch-card-state

D1 database:
jelly-referral-widget-events

D1 binding name:
DB
```

The Jelly app should load the widget through the feature flag with:

```html
<script src="https://jelly-referral-widget.pages.dev/referral.js" defer></script>
```

No tracking-specific script attributes are required.

## Source Files

```txt
src/tracking.js
  Browser-side analytics client.

src/widget.js
  Calls tracking events at widget lifecycle points.

functions/api/referral-events.js
  Cloudflare Pages Function that validates events and inserts rows into D1.

functions/api/referral-launch-card-state.js
  Cloudflare Pages Function that checks and writes one-time launch popup state.

migrations/0001_referral_widget_events.sql
  D1 schema and indexes.

migrations/0002_referral_launch_card_state.sql
  D1 schema for per-kitchen launch popup suppression.

widget-only-host/referral.js
  Generated deploy artifact used by Cloudflare Pages.
```

## Event Contract

The widget currently records these event names:

| Event | Meaning |
|---|---|
| `referral_widget_loaded` | Widget mounted successfully with Jelly Apollo user/kitchen context. |
| `referral_widget_visible` | Launcher was actually visible to the user. |
| `referral_widget_pill_visible` | Desktop persistent referral pill was visible to the user. |
| `referral_widget_pill_clicked` | User clicked the desktop persistent referral pill. |
| `referral_widget_opened` | User clicked or tapped the launcher and opened the widget. |
| `referral_widget_form_loaded` | HubSpot form rendered successfully. |
| `referral_widget_submitted` | HubSpot success callback fired after submission. |
| `referral_widget_closed` | User closed the widget drawer/sheet. |
| `referral_widget_form_error` | HubSpot form failed to render/load. |
| `referral_widget_launch_card_shown` | One-time launch popup rendered for an eligible kitchen. |
| `referral_widget_launch_card_cta_clicked` | User clicked `Start referral` on the launch popup. |
| `referral_widget_launch_card_dismissed` | User closed the launch popup or clicked `Maybe later`. |
| `referral_widget_launch_card_state_error` | Launch popup D1 state check or dismissal write failed. |

Each event payload includes:

| Field | Notes |
|---|---|
| `event_id` | Unique ID for dedupe. Generated with `crypto.randomUUID()` when available. |
| `event_name` | One of the allowed event names above. |
| `session_id` | Browser session ID stored in `sessionStorage` as `jrw_tracking_session_id`. |
| `user_id` | Jelly user ID from Apollo context. |
| `kitchen_id` | Jelly kitchen ID from Apollo context. |
| `kitchen_name` | Jelly kitchen name from Apollo context. |
| `route` | Pathname only, with query strings and hashes removed. |
| `device` | `mobile` when viewport is `max-width: 480px`; otherwise `desktop`. |
| `viewport_width` | Browser viewport width. |
| `viewport_height` | Browser viewport height. |
| `widget_version` | Current code version string, currently `2026-06-15-launch-popup-desktop-pill`. |
| `script_url` | Resolved `referral.js` URL. |
| `occurred_at` | Client-side ISO timestamp. |
| `received_at` | Server-side D1 insert timestamp, added by the database. |

## What We Intentionally Do Not Track

The tracking pipeline must not send:

- User email addresses.
- User phone numbers.
- Referee names.
- Referee contact details.
- HubSpot form field values.
- Full URLs containing query parameters or hashes.
- API tokens or private credentials.

D1 rows are client-originated analytics events. They are useful for funnel analysis, but they should not be treated as trusted identity, billing, security, or CRM records.

## Browser Tracking Details

`src/tracking.js` derives the tracking endpoint from the script URL.

Example:

```txt
https://jelly-referral-widget.pages.dev/referral.js
becomes
https://jelly-referral-widget.pages.dev/api/referral-events
```

Events are sent with:

```js
fetch(endpoint, {
  method: 'POST',
  mode: 'cors',
  credentials: 'omit',
  keepalive: true,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

Tracking failures are swallowed intentionally. The referral widget must keep working even if analytics is blocked, D1 is down, or the request fails.

Session IDs use `sessionStorage`, not `localStorage`. If `sessionStorage` is blocked, the script falls back to an in-memory session ID for that page lifecycle.

The one-time launch popup uses the same script URL derivation to call:

```txt
/api/referral-launch-card-state
```

The popup state flow is:

```txt
POST { action: "check", kitchen_id }
  -> { showLaunchCard: true | false }

POST { action: "dismiss", kitchen_id, kitchen_name, first_user_id, dismissed_reason, widget_version }
  -> { ok: true }
```

`dismissed_reason` is either `close` or `cta`. CTA and close both permanently suppress the popup for that `kitchen_id`.

## Server Validation

The Cloudflare Pages Function accepts only:

```txt
POST
OPTIONS
```

It validates:

- D1 binding `DB` exists.
- Payload size is at most `4096` bytes.
- Body is valid JSON.
- Required fields are present.
- `event_name` is in the allowlist.
- `device` is either `desktop` or `mobile`.
- `route` starts with `/` and does not include `?` or `#`.
- `occurred_at` parses as a valid date.

Duplicate `event_id` values are ignored through:

```sql
ON CONFLICT(event_id) DO NOTHING
```

## CORS

The Function allows:

```txt
https://kitchen.getjelly.co.uk
http://localhost:<port>
http://127.0.0.1:<port>
```

This supports production Jelly plus local testing.

## D1 Schema

The table is created by `migrations/0001_referral_widget_events.sql`.

```sql
CREATE TABLE IF NOT EXISTS referral_widget_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  event_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  kitchen_id TEXT NOT NULL,
  kitchen_name TEXT NOT NULL,
  route TEXT NOT NULL,
  device TEXT NOT NULL,
  viewport_width INTEGER NOT NULL DEFAULT 0,
  viewport_height INTEGER NOT NULL DEFAULT 0,
  widget_version TEXT NOT NULL,
  script_url TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
```

Indexes exist for:

```txt
event_name
kitchen_id
user_id
session_id
route
```

The launch popup state table is created by `migrations/0002_referral_launch_card_state.sql`.

```sql
CREATE TABLE IF NOT EXISTS referral_widget_launch_card_state (
  kitchen_id TEXT PRIMARY KEY,
  kitchen_name TEXT NOT NULL DEFAULT '',
  first_user_id TEXT NOT NULL DEFAULT '',
  dismissed_reason TEXT NOT NULL CHECK (dismissed_reason IN ('close', 'cta')),
  dismissed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  widget_version TEXT NOT NULL
);
```

This table is intentionally keyed by `kitchen_id` so the launch popup is once per kitchen, across users/devices, for as long as the D1 state table is retained.

## Cloudflare Setup

The Pages project must be connected to GitHub or deployed through Wrangler. Do not use dashboard Direct Upload for this tracking-enabled version because Pages Functions need to be deployed with the static files.

Cloudflare Pages build settings:

```txt
Framework preset: None
Build command: npm run build
Build output directory: widget-only-host
Root directory: /
```

D1 binding:

```txt
Settings -> Bindings / Pages configuration -> D1 database binding
Variable name: DB
Database: jelly-referral-widget-events
```

Important deployment note:

`wrangler.toml` was removed from the repo because an old placeholder database UUID caused Cloudflare to fail deployments with:

```txt
Invalid database UUID (REPLACE_WITH_CLOUDFLARE_D1_DATABASE_ID)
```

If `wrangler.toml` is reintroduced later, it must contain a real Cloudflare D1 database UUID. Do not commit placeholder D1 IDs.

## Applying The Migration

Using Wrangler:

```bash
npx wrangler d1 execute jelly-referral-widget-events --remote --file migrations/0001_referral_widget_events.sql
npx wrangler d1 execute jelly-referral-widget-events --remote --file migrations/0002_referral_launch_card_state.sql
```

Using the Cloudflare UI:

1. Open Cloudflare dashboard.
2. Go to D1 SQL Database.
3. Open `jelly-referral-widget-events`.
4. Open Console.
5. Paste the contents of `migrations/0001_referral_widget_events.sql`.
6. Run it once.

The migration uses `IF NOT EXISTS`, so it is safe to rerun.

## Manual API Test

Run this from a browser console:

```js
fetch('https://jelly-referral-widget.pages.dev/api/referral-events', {
  method: 'POST',
  mode: 'cors',
  credentials: 'omit',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_id: crypto.randomUUID(),
    event_name: 'referral_widget_opened',
    session_id: crypto.randomUUID(),
    user_id: 'test-user-1',
    kitchen_id: 'test-kitchen-1',
    kitchen_name: 'Test Kitchen',
    route: '/finance',
    device: 'desktop',
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    widget_version: 'manual-test',
    script_url: 'https://jelly-referral-widget.pages.dev/referral.js',
    occurred_at: new Date().toISOString(),
  }),
})
  .then(async (res) => ({ status: res.status, body: await res.text() }))
  .then(console.log);
```

Expected result:

```js
{ status: 202, body: '{"ok":true}' }
```

## Useful SQL

Overall funnel:

```sql
select event_name, count(*) as events, count(distinct session_id) as sessions
from referral_widget_events
group by event_name
order by event_name;
```

Kitchen-level funnel:

```sql
select kitchen_id, kitchen_name, event_name, count(distinct session_id) as sessions
from referral_widget_events
group by kitchen_id, kitchen_name, event_name
order by kitchen_name, event_name;
```

Route performance:

```sql
select route, event_name, count(distinct session_id) as sessions
from referral_widget_events
group by route, event_name
order by route, event_name;
```

Device funnel:

```sql
select device, event_name, count(distinct session_id) as sessions
from referral_widget_events
group by device, event_name
order by device, event_name;
```

Open rate by device:

```sql
with visible as (
  select device, count(distinct session_id) as visible_sessions
  from referral_widget_events
  where event_name = 'referral_widget_visible'
  group by device
),
opened as (
  select device, count(distinct session_id) as opened_sessions
  from referral_widget_events
  where event_name = 'referral_widget_opened'
  group by device
)
select
  visible.device,
  visible.visible_sessions,
  coalesce(opened.opened_sessions, 0) as opened_sessions,
  round(100.0 * coalesce(opened.opened_sessions, 0) / visible.visible_sessions, 2) as open_rate_percent
from visible
left join opened on opened.device = visible.device;
```

Sessions that opened but did not load the form:

```sql
select distinct opened.session_id, opened.kitchen_id, opened.kitchen_name, opened.route, opened.device
from referral_widget_events opened
left join referral_widget_events loaded
  on loaded.session_id = opened.session_id
  and loaded.event_name = 'referral_widget_form_loaded'
where opened.event_name = 'referral_widget_opened'
  and loaded.session_id is null;
```

Form loads without submission:

```sql
select distinct loaded.session_id, loaded.kitchen_id, loaded.kitchen_name, loaded.route, loaded.device
from referral_widget_events loaded
left join referral_widget_events submitted
  on submitted.session_id = loaded.session_id
  and submitted.event_name = 'referral_widget_submitted'
where loaded.event_name = 'referral_widget_form_loaded'
  and submitted.session_id is null;
```

Launch popup funnel:

```sql
select event_name, count(*) as events, count(distinct kitchen_id) as kitchens
from referral_widget_events
where event_name in (
  'referral_widget_launch_card_shown',
  'referral_widget_launch_card_cta_clicked',
  'referral_widget_launch_card_dismissed',
  'referral_widget_launch_card_state_error'
)
group by event_name
order by event_name;
```

Launch popup state rows:

```sql
select dismissed_reason, count(*) as kitchens
from referral_widget_launch_card_state
group by dismissed_reason;
```

Kitchens that saw the launch popup but did not click CTA:

```sql
select distinct shown.kitchen_id, shown.kitchen_name
from referral_widget_events shown
left join referral_widget_events cta
  on cta.kitchen_id = shown.kitchen_id
  and cta.event_name = 'referral_widget_launch_card_cta_clicked'
where shown.event_name = 'referral_widget_launch_card_shown'
  and cta.kitchen_id is null;
```

## Exporting Data

From Wrangler:

```bash
npx wrangler d1 execute jelly-referral-widget-events --remote --command "select * from referral_widget_events order by received_at desc;" --json > referral-widget-events.json
```

From Cloudflare UI:

1. Open the D1 database.
2. Open Console.
3. Run a `select` query.
4. Copy the results into a spreadsheet if needed.

Avoid committing exported customer/kitchen event data into the public repo.

## Reporting Sheet

The working analysis flow used a Google Sheet named:

```txt
Referral Widget Tracking
```

Recommended tabs:

```txt
Sheet1
  Raw D1 export.

Analysis Data
  Helper tab with normalized route groups and filtered rows.

Analysis
  Funnel, route, device, coverage, and technical checks.
```

Keep any raw customer-level export outside the public repo.

## How To Interpret The Funnel

Primary funnel:

```txt
loaded -> visible -> opened -> form_loaded -> submitted
```

What each drop-off usually means:

| Drop-off | Likely meaning |
|---|---|
| `loaded` to `visible` | Widget was mounted but not actually shown, usually because route/device/session rules hid it. |
| `visible` to `opened` | Entry point is not noticeable or not compelling enough. |
| `opened` to `form_loaded` | HubSpot failed to load, network issue, embed timing issue, or user closed too quickly. |
| `form_loaded` to `submitted` | Form/copy/intent issue, or not enough motivated users. |

The early data showed the main issue was `visible -> opened`, not form loading. The recommended next test was to make the closed-state entry point more visible before changing the form or offer.

## Troubleshooting

### `500 D1 binding DB is not configured`

Cause:

The Pages Function is deployed, but the Cloudflare Pages project does not have a D1 binding named `DB` in the active environment.

Fix:

1. Go to the Cloudflare Pages project.
2. Open Settings.
3. Add a D1 database binding.
4. Set variable name to `DB`.
5. Select `jelly-referral-widget-events`.
6. Configure the binding for both Preview and Production environments.
7. Redeploy.

If only Production has the binding, branch-preview Functions return this error and the launch popup correctly fails closed.

### `Invalid database UUID (REPLACE_WITH_CLOUDFLARE_D1_DATABASE_ID)`

Cause:

Cloudflare found a `wrangler.toml` with a placeholder D1 UUID.

Fix:

Remove the placeholder config or replace it with the real D1 database UUID. The current repo intentionally does not include `wrangler.toml`.

### Events insert but do not appear in analysis

Check:

- Was the raw export refreshed into the sheet?
- Was `manual-test` filtered out?
- Are formulas grouping by `session_id` instead of raw event count?
- Are date filters excluding the new rows?

### `visible` events exist but no `opened`

This is usually a product/design issue, not a technical issue. It means the user had the widget visible but did not engage with the entry point.

### `opened` exists but no `form_loaded`

Check browser console and Cloudflare rows for `referral_widget_form_error`. Also verify HubSpot embed script is reachable and the current HubSpot form IDs are valid.

### `launch_card_state_error` events exist

Check:

- Has `migrations/0002_referral_launch_card_state.sql` been applied?
- Does the Pages project still have the D1 binding named `DB`?
- Is `/api/referral-launch-card-state` deployed with the latest Pages Function build?
- Is the browser origin allowed by the endpoint CORS rules?

## Build And Verification

Run before deployment:

```bash
npm run build
npm run check
```

The build regenerates:

```txt
dist/referral.js
share-preview/
share-preview-single/
widget-only-host/
```

Cloudflare should deploy `widget-only-host` as the static output directory and include `functions/api/referral-events.js` as the Pages Function.
