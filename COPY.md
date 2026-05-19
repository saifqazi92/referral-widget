# Referral Widget — Copy

All user-facing strings live here. Nothing is hardcoded in the widget source.
To update copy, edit this file. The build process imports from here.

---

## Gift icon tooltip (hover)

```
tooltip: "Give a friend a free month"
```

---

## Nudge tooltip (PostHog-triggered, appears once per session)

```
nudge_heading: "Know someone who'd love Jelly?"
nudge_body: "Invite them and you both get a month free."
nudge_cta: "Send an invite"
```

---

## Drawer — default state

```
drawer_eyebrow: "Refer a friend"
drawer_heading: "Enjoying Jelly?"
drawer_subheading: "Invite a colleague to JellyPlus and you both get 1 month free — on us."

reward_detail: "When your friend becomes a paying JellyPlus member, we'll add a free month to both accounts."
```

---

## Form labels and placeholders

```
field_referee_name_label: "Their name"
field_referee_name_placeholder: "Sarah Johnson"

field_referee_business_label: "Their business"
field_referee_business_placeholder: "The Ivy, London"

field_referee_email_label: "Their email"
field_referee_email_placeholder: "sarah@theivylondon.com"

field_referee_phone_label: "Their phone (optional)"
field_referee_phone_placeholder: "+44 7700 000000"
```

---

## Form CTA

```
cta_submit: "Send my invite"
cta_submitting: "Sending..."
```

---

## Validation errors

```
error_name_required: "Please enter their name"
error_business_required: "Please enter their business name"
error_email_required: "Please enter their email address"
error_email_invalid: "That doesn't look like a valid email"
error_submission_failed: "Something went wrong — please try again"
```

---

## Success state (post-submission)

```
success_heading: "Invite sent"
success_body: "We'll reach out to {referee_name} at {referee_business}. If they join JellyPlus, you'll both get a free month added automatically."
success_cta: "Send another invite"
success_fine_print: "The free month is added when your friend becomes a paying member."
```

---

## Fine print / legal (bottom of drawer)

```
fine_print: "One free month per qualifying referral. Applied when the referred person starts a paid JellyPlus plan. No cap on referrals."
```

---

## Accessibility labels (screen readers)

```
aria_open_widget: "Open referral programme"
aria_close_drawer: "Close referral drawer"
aria_gift_icon: "Refer a friend"
```

---

## Copy variants to A/B test later

These are alternatives to the defaults above. Not used in V1 — kept here for reference.

```
# Variant B — self-interest framing
drawer_heading: "Get a free month of Jelly"
drawer_subheading: "Invite one colleague to JellyPlus and we'll add a free month to your account when they sign up."

# Variant C — community framing
drawer_heading: "Know someone who'd love Jelly?"
drawer_subheading: "Share the love. Invite them to JellyPlus and you both get a month on us."

# Variant D — direct/short
drawer_heading: "Give a month, get a month."
drawer_subheading: "Invite a colleague to JellyPlus. When they join, you both get 1 month free."
```
