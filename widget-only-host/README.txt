Upload this folder as a static site.

Useful URLs after deploy:
- /            -> blank page with only the widget loaded
- /referral.js -> the raw widget script URL to give the Jelly engineer

Example engineer embed:
<script src="https://YOUR-HOST/referral.js" defer></script>

This build reads the current user and kitchen directly from Jelly's Apollo cache.
No CSV file is required. The widget renders when Apollo user/kitchen context is available.
