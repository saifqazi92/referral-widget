# Referral Widget — Codex Instructions

## What this is
A lightweight, embeddable referral widget for the Jelly web app (getjelly.co.uk). It lives as a persistent gift icon in the bottom-right corner of the dashboard. Clicking it opens a slide-in drawer containing a HubSpot form.

The output is a single self-contained JavaScript file (`referral.js`) that can be dropped into the Jelly app like a third-party analytics tag.

---

## Architecture decisions (do not deviate without asking)

- **Single JS bundle** — one `<script>` tag installs the entire widget. No external dependencies (no React, no Vue). Vanilla JS only.
- **Shadow DOM** — mount the widget inside a Shadow DOM so Jelly's existing CSS cannot bleed in and the widget's CSS cannot bleed out.
- **Scoped CSS** — all styles live inside the Shadow DOM. No global class names. No `!important` hacks.
- **Data attributes for config** — user context is passed via `data-*` attributes on the script tag, not via a separate API call.
- **PostHog integration** — the widget listens for PostHog feature flags to control when the tooltip nudge appears. It does not initialise PostHog itself — PostHog is already loaded by the host app.
- **HubSpot form — no custom backend** — the form inside the drawer is a HubSpot embedded form. No custom POST endpoint. HubSpot handles submission, storage, and CS notifications (Slack + email) natively.
- **No external fonts** — inherit the font stack from the host page (`:host { font-family: inherit }`).
- **No framework** — build with plain DOM APIs. Keep the bundle under 15kb gzipped.

---

## File structure

```
/src
  widget.js          ← main widget logic (init, icon, drawer, open/close)
  styles.js          ← CSS string (injected into shadow DOM)
  hubspot.js         ← HubSpot form embed + success/error handling
  posthog.js         ← PostHog feature flag trigger logic
  copy.js            ← all strings, imported from COPY.md values
/dist
  referral.js        ← minified single-file bundle
AGENTS.md
BRAND.md
COPY.md
SPEC.md
```

---

## Embed snippet (target)

```html
<script
  src="https://cdn.getjelly.co.uk/referral.js"
  data-user-id="{{ user.id }}"
  data-user-email="{{ user.email }}"
  data-user-name="{{ user.first_name }}"
  data-kitchen-id="{{ kitchen.id }}"
  data-kitchen-name="{{ kitchen.name }}"
  defer
></script>
```

No `data-plan` needed — all authenticated users see the widget.

---

## User data available in the Jelly app (confirmed)

All five `data-*` values above are available in the Jelly frontend via the **Apollo cache** (`__APOLLO_CLIENT__.cache.extract()`). Confirmed by inspecting the live app. The relevant cache keys are:

- `User:{id}` — contains `id`, `firstName`, `lastName`, `email`, `phoneNumberNational`
- `Kitchen:{id}` — contains `id`, `name`, and permission/tier info

The Jelly dev needs to pull these from Apollo when rendering the template and inject them as `data-*` attributes on the script tag. No additional API calls needed — the data is already in the cache by the time the dashboard renders.

PostHog is loaded on the page but **not** exposed as `window.posthog`. It is accessible via `__PosthogExtensions__` but the main client instance is bundled inside the React app. Do not rely on `window.posthog` being available — the nudge check should fail gracefully if it is undefined.

---

## HubSpot form integration

The drawer loads a HubSpot embedded form using the HubSpot Forms JS API.

```js
// hubspot.js
const HUBSPOT_PORTAL_ID = 'FILL_IN';   // HubSpot portal ID
const HUBSPOT_FORM_ID   = 'FILL_IN';   // HubSpot referral form ID

function loadHubSpotForm(targetElement) {
  if (window.hbspt) {
    window.hbspt.forms.create({
      region: 'na1',              // confirmed — Jelly HubSpot account is on US servers
      portalId: HUBSPOT_PORTAL_ID,
      formId: HUBSPOT_FORM_ID,
      target: '#jelly-hs-form-target',
      onFormSubmitted: handleSuccess,
    });
  }
}
```

- Load `//js.hsforms.net/forms/embed/v2.js` dynamically when the drawer first opens (not on page load)
- The form renders inside the Shadow DOM target element
- HubSpot's own styles will need to be overridden — apply scoped CSS to match Jelly brand (see BRAND.md)
- On `onFormSubmitted` callback: hide form, show success state (see COPY.md `success_*`)
- Two constants to fill in before deploy: `HUBSPOT_PORTAL_ID` and `HUBSPOT_FORM_ID`

### HubSpot form fields to create in HubSpot UI
| Field label | HubSpot field name | Required |
|---|---|---|
| Their name | `referee_name` | yes |
| Their business | `referee_business` | yes |
| Their email | `email` | yes |
| Their phone | `phone` | no |
| Referrer user ID (hidden) | `referrer_user_id` | auto-populated |
| Referrer email (hidden) | `referrer_email` | auto-populated |
| Referrer kitchen ID (hidden) | `referrer_kitchen_id` | auto-populated |
| Referrer kitchen name (hidden) | `referrer_kitchen_name` | auto-populated |

Hidden fields are pre-populated from `data-*` attributes on the script tag — passed in via HubSpot's `hiddenFields` option.

---

## PostHog trigger logic

The widget checks for a PostHog feature flag called `referral_widget_nudge`. When active, the gift icon pulses and a tooltip appears after a 3-second delay. Fires once per session only (tracked via `sessionStorage`).

PostHog is accessed via `window.posthog`. Do not initialise it — only read from it.

```js
// posthog.js
const ACTIVATION_EVENT = 'TBD'; // document only — conditions set in PostHog UI, not in code

function checkNudge() {
  if (sessionStorage.getItem('jelly_nudge_shown')) return;
  if (window.posthog?.isFeatureEnabled('referral_widget_nudge')) {
    setTimeout(triggerNudge, 3000);
    sessionStorage.setItem('jelly_nudge_shown', '1');
  }
}
```

---

## Behaviour rules

- Widget renders for all authenticated users (no plan gating)
- Drawer opens/closes with slide-in from the right (300ms ease-out)
- Gift icon has a subtle bounce on first load, stops after 2 seconds
- HubSpot form loads lazily — only when drawer is opened for the first time
- Nudge tooltip appears once per session only
- After form submission: HubSpot fires `onFormSubmitted`, widget shows success state
- Drawer stays open after submission; user closes it manually

---

## What not to do

- Do not use React, Vue, or any UI framework
- Do not load HubSpot script on page load — load it lazily when drawer opens
- Do not initialise PostHog — only read `window.posthog`
- Do not store anything in `localStorage` (use `sessionStorage` for session flags)
- Do not add features not in SPEC.md without asking
- Do not write inline styles on the host page — everything in the Shadow DOM
- Do not build a custom form POST endpoint — HubSpot handles all submissions
