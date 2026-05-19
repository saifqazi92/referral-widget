# Referral Widget — Product Spec

This is the source of truth for product decisions. Do not reopen these in build conversations.

---

## Problem statement

Email-based referral campaigns do not convert. Users refer when the moment is convenient and the prompt is in-context — inside the product, when they are already experiencing value. This widget creates that in-product moment.

---

## Decisions (final)

| Decision | Answer | Rationale |
|---|---|---|
| Form backend | HubSpot embedded form — no custom endpoint | Zero backend work, CS team already lives in HubSpot, handles Slack + email notifications natively |
| Reward fulfilment | Manual — CS team works from HubSpot submissions | Keeps V1 simple, avoids Stripe/billing integration complexity |
| What counts as a referral converting | Referee becomes a paying member | Aligns reward with revenue, not just signups |
| Reward structure | Double-sided — both referrer and referee get 1 month free | Double-sided consistently outperforms one-sided |
| Referral cap | None — unlimited referrals per user | Avoids friction, rewards power users, low abuse risk for B2B |
| PostHog | Already instrumented — use existing feature flags | No new instrumentation needed |
| Surface | Main app dashboard only | Limit scope for V1 |
| Widget visibility | All authenticated users (one plan only) | No gating needed |

---

## User journey

### Ambient state
1. User is on the Jelly dashboard
2. Gift icon visible bottom-right, gentle bounce on first load
3. No action required

### PostHog nudge (triggered)
1. PostHog feature flag `referral_widget_nudge` becomes active for this user
2. After 3-second delay: tooltip appears above gift icon — *"Know someone who'd love Jelly?"*
3. If ignored: tooltip fades after 8 seconds, does not reappear this session
4. If clicked: drawer opens

### Referral submission
1. User opens drawer, reads value prop
2. HubSpot form loads inside drawer (lazy — loads on first open)
3. User fills in referee details, hits submit
4. HubSpot handles submission and notifies CS team (Slack + email)
5. `onFormSubmitted` callback fires — widget shows success state
6. User can click "Send another invite" to reload the form
7. Drawer stays open until user closes it manually

### CS team flow (off-widget)
1. CS receives HubSpot notification (Slack + email) on each submission
2. CS reaches out to referee manually
3. When referee converts to paid: CS manually applies 1 month credit to both accounts
4. Referral tracked in HubSpot CRM — no additional tooling needed for V1

---

## PostHog trigger spec

Feature flag name: `referral_widget_nudge`

Suggested targeting conditions (set in PostHog UI — not in code):
- User has been active for 14+ days since signup
- User has completed the key activation event (TBD — confirm event name with team)
- Flag shown maximum once per user (use PostHog's one-time exposure option)

---

## HubSpot setup required (before build)

1. Create a new form in HubSpot called **"JellyPlus Referral"**
2. Add fields:

| Field label | Internal name | Type | Note |
|---|---|---|---|
| Their name | `referee_name` | Single line text | Required |
| Their business | `referee_business` | Single line text | Required |
| Their email | `email` | Email | Required |
| Their phone | `phone` | Phone number | Optional |
| Referrer user ID | `referrer_user_id` | Hidden | Auto-filled from PostHog |
| Referrer kitchen ID | `referrer_kitchen_id` | Hidden | Auto-filled from PostHog |
| Referrer kitchen name | `referrer_kitchen` | Hidden | Auto-filled from Redux store |

3. Set up a workflow: on form submission → notify CS via Slack webhook + email
4. Note the **Portal ID** and **Form ID** — paste into `HUBSPOT_PORTAL_ID` and `HUBSPOT_FORM_ID` in `dist/referral.js`

---

## Non-goals (V1)

- Automated reward fulfilment (Stripe coupon, billing integration)
- Referee-side landing page or personalised invite link
- Referral status tracking for the referrer
- Analytics dashboard for the Jelly team
- Mobile app version

---

## Success metrics

- HubSpot form submissions per week
- Submission → conversion rate (referee becomes paying member)
- Referrer satisfaction (qualitative, via CS feedback)

V1 target: validate that in-product referral converts better than the email campaign baseline.

---

## Open questions (to resolve before build)

- [ ] PostHog activation event name — TBD. Wire as `ACTIVATION_EVENT` constant in `posthog.js`, set conditions in PostHog UI.
- [ ] HubSpot Portal ID and Form ID — needed before deploy. Create the form in HubSpot first.
- [ ] HubSpot account region — EU (`eu1`) or US? Confirm from HubSpot account settings.
