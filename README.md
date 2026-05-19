# Jelly Referral Widget

A lightweight, self-contained referral widget prototype for the Jelly kitchen dashboard.

The widget renders as a floating gift icon. When opened, it shows referral copy and a HubSpot embedded form. Referrer context is read from the Jelly app's Apollo cache and sent to HubSpot hidden fields.

## Current Behaviour

- Desktop: floating bottom-right launcher with hover label, opening into a right-side drawer.
- Mobile: launcher appears only on `/`, `/finance`, `/kitchen`, and `/settings`.
- Mobile settings page: launcher remains visible after close, even if the user hid it elsewhere in the same session.
- Other mobile pages: closing the widget hides the launcher for the current `sessionStorage` session.
- HubSpot form loads lazily when the widget opens.
- Widget funnel events are sent to a Cloudflare Pages Function backed by D1.
- No custom referral submission backend is used; HubSpot still handles referral submissions.
- No external JS dependencies are bundled.

## Embed

The production app should load the widget script behind the Jelly/PostHog feature flag:

```html
<script src="https://YOUR-HOST/referral.js" defer></script>
```

The widget expects to run inside the authenticated Jelly app where `window.__APOLLO_CLIENT__` is available.

## Referrer Data

The widget reads these values from the Apollo cache:

- `referrer_user_id`
- `referrer_email`
- `referrer_phone_number`
- `referrer_kitchen_id`
- `referrer_kitchen_name`

These are sent into the HubSpot form hidden fields using the current HubSpot embed integration.

## Project Structure

```txt
src/
  copy.js       User-facing copy
  styles.js     Shadow DOM widget styles and HubSpot style overrides
  hubspot.js    HubSpot embed loading and hidden-field wiring
  tracking.js   Cloudflare D1 tracking client
  widget.js     Widget mount, routing, Apollo lookup, and UI behaviour

functions/
  api/referral-events.js  Cloudflare Pages Function that writes events to D1

migrations/
  0001_referral_widget_events.sql  D1 schema for raw widget funnel events

scripts/
  build-dist.mjs            Builds dist/referral.js
  build-share-previews.mjs  Builds preview and Cloudflare host artifacts

dist/
  referral.js   Generated single-file widget bundle

widget-only-host/
  index.html    Minimal host page for Cloudflare Pages
  referral.js   Deployable widget script

share-preview/
share-preview-single/
  Local/shareable demo pages
```

## Build

No dependencies are required.

```bash
npm run build
npm run check
```

The build regenerates:

- `dist/referral.js`
- `share-preview/`
- `share-preview-single/`
- `widget-only-host/`

## Local Preview

Open `test.html` in a browser for the full dashboard mock.

Important: the demo uses the live HubSpot form configuration. Submitting the form can create a real HubSpot submission.

For mobile route testing, serve the project locally and visit one of the allowed mobile paths:

```txt
/
/finance
/kitchen
/settings
```

Raw `file://.../test.html` paths do not represent the production Jelly route structure.

## Widget Funnel Tracking

The widget records these raw events for kitchens that receive the script:

```txt
referral_widget_loaded
referral_widget_visible
referral_widget_opened
referral_widget_form_loaded
referral_widget_submitted
referral_widget_closed
referral_widget_form_error
```

Each event includes only funnel metadata: event/session IDs, user ID, kitchen ID/name, route path, device, viewport, widget version, script URL, and timestamp. It does not send email, phone number, referee details, form values, or full URLs with query params.

## Deploying To Cloudflare Pages With D1

Tracking requires a Cloudflare Pages Function, so deploy from the GitHub repo or Wrangler. Dashboard Direct Upload is not suitable for the tracking-enabled build.

After deployment, the engineer needs the raw script URL:

```html
<script src="https://YOUR-PROJECT.pages.dev/referral.js" defer></script>
```

Create and bind the D1 database:

```bash
npx wrangler d1 create jelly-referral-widget-events
```

Copy the returned `database_id` into `wrangler.toml`, then apply the schema:

```bash
npx wrangler d1 execute jelly-referral-widget-events --remote --file migrations/0001_referral_widget_events.sql
```

Cloudflare Pages settings:

```txt
Build command: npm run build
Build output directory: widget-only-host
D1 binding: DB -> jelly-referral-widget-events
```

Manual Wrangler deploy:

```bash
npm run build
npx wrangler pages deploy widget-only-host --project-name jelly-referral-widget
```

Useful D1 funnel query:

```sql
select event_name, count(*) as events, count(distinct session_id) as sessions
from referral_widget_events
group by event_name;
```

Kitchen-level funnel:

```sql
select kitchen_id, kitchen_name, event_name, count(distinct session_id) as sessions
from referral_widget_events
group by kitchen_id, kitchen_name, event_name;
```

Route performance:

```sql
select route, event_name, count(distinct session_id) as sessions
from referral_widget_events
group by route, event_name;
```

## Security Notes

- This repo does not contain API keys, private tokens, or backend credentials.
- HubSpot portal/form IDs are public embed identifiers, not secrets.
- Hidden fields are for attribution and CRM routing, not security. Do not treat them as trusted server-side identity.
- D1 tracking rows are also client-originated analytics events, not trusted identity or billing records.
- The widget reads already-loaded Apollo cache data in the authenticated Jelly app; it does not make additional API calls.
- Keep rollout control in the Jelly app/PostHog feature flag, not inside this standalone script.
- Do not commit real customer/user data into preview files. Demo data in this repo should stay anonymised.

## License

No open-source license has been added. All rights reserved unless a license is added later.
