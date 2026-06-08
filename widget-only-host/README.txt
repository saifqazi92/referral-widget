This folder contains the static widget assets.

Because tracking uses a Cloudflare Pages Function, deploy the repo with Cloudflare Pages Git/Wrangler rather than dashboard Direct Upload.

Useful URLs after deploy:
- /            -> blank page with only the widget loaded
- /referral.js -> the raw widget script URL to give the Jelly engineer
- /api/referral-events -> Pages Function endpoint used by the widget for D1 funnel tracking

Example engineer embed:
<script src="https://YOUR-HOST/referral.js" defer></script>

This build reads the current user and kitchen directly from Jelly's Apollo cache.
No CSV file is required. The widget renders when Apollo user/kitchen context is available.

D1 tracking setup:
1. Create a D1 database named jelly-referral-widget-events.
2. Bind it to the Pages project as DB.
3. Apply migrations/0001_referral_widget_events.sql.
4. Apply migrations/0002_referral_launch_card_state.sql.
