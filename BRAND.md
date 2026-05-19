# Jelly Brand Guidelines — Referral Widget

Derived from reference screenshots and getjelly.co.uk. Confirm any value marked **[CONFIRM]** against the live design system if unsure.

---

## Colours

| Token | Usage | Value |
|---|---|---|
| `--jelly-primary` | Primary CTA button, active states, gift icon bg | `#1B2B4B` |
| `--jelly-primary-hover` | Button hover state | `#243660` |
| `--jelly-primary-text` | Text on primary button | `#FFFFFF` |
| `--jelly-accent` | Logo mark, highlight accents | `#F5C842` |
| `--jelly-surface` | Drawer background, card background | `#FFFFFF` |
| `--jelly-surface-subtle` | Input backgrounds, inner section bg | `#F5F5F5` |
| `--jelly-text-primary` | Headings, body text, form labels | `#1B2B4B` |
| `--jelly-text-secondary` | Subheadings, helper text, fine print | `#6B7280` |
| `--jelly-text-placeholder` | Form placeholders | `#AAAAAA` |
| `--jelly-link` | Inline links | `#4A8FD4` |
| `--jelly-border` | Input borders, dividers | `#E5E5EB` |
| `--jelly-error` | Validation error states | `#D93025` |
| `--jelly-success` | Success confirmation state | `#1A9E5C` |
| `--jelly-overlay` | Page overlay behind drawer | `rgba(0, 0, 0, 0.3)` |
| `--jelly-gift-icon` | Gift icon foreground | `#FFFFFF` |

---

## Typography

Jelly uses **Rubik** for headings and **Lato** for body text (confirmed from getjelly.co.uk CSS).

| Token | Usage | Value |
|---|---|---|
| `--jelly-font-heading` | Drawer headline | `Rubik, system-ui, sans-serif` / `20px` / `weight 600` / `line-height 1.2` |
| `--jelly-font-body` | Body copy, form labels | `Lato, system-ui, sans-serif` / `14px` / `weight 400` / `line-height 1.5` |
| `--jelly-font-small` | Helper text, fine print | `Lato, system-ui, sans-serif` / `12px` / `weight 400` / `line-height 1.4` |
| `--jelly-font-cta` | Button text | `Rubik, system-ui, sans-serif` / `14px` / `weight 600` / `no wrap` |

The widget inherits the host page's font stack where possible via `:host { font-family: inherit }`. Load Rubik and Lato from Google Fonts only as a fallback if they are not already loaded by the host page.

```html
<!-- Fallback font load (only if not already present on host page) -->
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
```

---

## Spacing & Shape

Jelly uses generous border-radius — buttons in the product are very rounded (near-pill). Inputs are more subtly rounded.

| Token | Value | Notes |
|---|---|---|
| `--jelly-radius-sm` | `8px` | Input fields |
| `--jelly-radius-md` | `12px` | Drawer inner panels, reward callout |
| `--jelly-radius-lg` | `20px` | Drawer itself (top-left + top-right corners) |
| `--jelly-radius-pill` | `999px` | CTA buttons, gift icon trigger, badges |
| `--jelly-shadow-drawer` | `0 8px 40px rgba(0,0,0,0.12)` | Drawer drop shadow |
| `--jelly-shadow-icon` | `0 4px 16px rgba(0,0,0,0.20)` | Gift icon button shadow |

---

## Iconography

The widget is self-contained — use **inline SVG** for all three icons. Do not depend on any icon library being present in the host app.

- **Gift icon** (trigger button): Simple outline gift box with a ribbon — white on `--jelly-primary` background, 22×22px
- **Close (×)**: Thin ✕, 14×14px, `--jelly-text-secondary` colour
- **Success checkmark**: Circle with tick, 40×40px, `--jelly-success` fill

Icon style: **outline/line style** — consistent with the illustrated, friendly aesthetic of Jelly's onboarding screens.

---

## Visual reference from product screenshots

- **App shell background:** Dark navy `#1B2B4B` — do not use this inside the drawer itself, only for the gift icon trigger button
- **Card/modal style:** White background, subtle light-grey inner sections, very rounded corners
- **Buttons:** Full-width in modals, pill-shaped (high border-radius), dark navy fill, white label — matches `Start Tour`, `Join Us`, `Create Account` buttons seen in screenshots
- **Illustrated style:** Friendly, colourful line illustrations — the widget should feel visually consistent with this (no hard geometric shapes, no sharp corners)
- **Existing referral pattern:** The "You are invited!" screen (Invitation.png) uses an envelope illustration — the gift icon concept fits naturally in this visual language

---

## Animation

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Drawer open/close | Slide in from right + fade | `300ms` | `ease-out` |
| Overlay | Fade in/out | `200ms` | `ease` |
| Gift icon — entry bounce | Scale 1→1.15→1 | `400ms` | `ease-in-out` |
| Gift icon — nudge pulse | Subtle ring ripple | `600ms` | `ease-out` |
| Tooltip appear | Fade up 4px | `200ms` | `ease-out` |

Keep motion subtle. Avoid looping animations after the first trigger. Respect `prefers-reduced-motion: reduce` — disable all animation if set.

---

## Tone of voice

- **Warm, not salesy** — feels like a colleague recommending something, not a pop-up ad
- **Short sentences** — maximum two lines per copy block
- **Direct** — lead with the benefit
- **No exclamation marks** — confident, not shouty
- **"You" language** — address the user directly
- **Avoid:** "Exclusive offer", "Limited time", "Don't miss out", "Amazing deal"
- **Use:** "Enjoying Jelly?", "Know someone who'd love this?", "Give a free month"

---

## Widget placement

- **Position:** Fixed, bottom-right corner
- **Offset:** `24px` from right edge, `24px` from bottom edge
- **Z-index:** `9999` (above all Jelly UI, below browser dialogs)
- **Drawer width:** `420px` on desktop, full-width (`100vw`) on mobile (`< 480px`)
- **Drawer height:** Content-fit, max `calc(100vh - 48px)`, scrollable if content overflows
- **Drawer anchor:** Slides in from the right edge, sits flush to the right on mobile

---

## Do not

- Do not use gradients on interactive elements
- Do not use sharp corners (border-radius: 0) anywhere in the widget
- Do not use colours outside this palette
- Do not animate on `prefers-reduced-motion: reduce`
- Do not use a font other than Rubik/Lato (or system fallback)
- Do not use the dark navy `#1B2B4B` as a surface/background inside the drawer — white only
