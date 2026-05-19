# Jelly Referral Widget

A lightweight, self-contained referral widget prototype for the Jelly kitchen dashboard.

The widget renders as a floating gift icon. When opened, it shows referral copy and a HubSpot embedded form. Referrer context is read from the Jelly app's Apollo cache and sent to HubSpot hidden fields.

## Current Behaviour

- Desktop: floating bottom-right launcher with hover label, opening into a right-side drawer.
- Mobile: launcher appears only on `/`, `/finance`, `/kitchen`, and `/settings`.
- Mobile settings page: launcher remains visible after close, even if the user hid it elsewhere in the same session.
- Other mobile pages: closing the widget hides the launcher for the current `sessionStorage` session.
- HubSpot form loads lazily when the widget opens.
- No custom backend is used.
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
  widget.js     Widget mount, routing, Apollo lookup, and UI behaviour

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

## Deploying To Cloudflare Pages

For the simple static-host flow, deploy the contents of `widget-only-host/`.

After deployment, the engineer needs the raw script URL:

```html
<script src="https://YOUR-PROJECT.pages.dev/referral.js" defer></script>
```

## Security Notes

- This repo does not contain API keys, private tokens, or backend credentials.
- HubSpot portal/form IDs are public embed identifiers, not secrets.
- Hidden fields are for attribution and CRM routing, not security. Do not treat them as trusted server-side identity.
- The widget reads already-loaded Apollo cache data in the authenticated Jelly app; it does not make additional API calls.
- Keep rollout control in the Jelly app/PostHog feature flag, not inside this standalone script.
- Do not commit real customer/user data into preview files. Demo data in this repo should stay anonymised.

## License

No open-source license has been added. All rights reserved unless a license is added later.
