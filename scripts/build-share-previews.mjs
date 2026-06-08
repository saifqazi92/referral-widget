import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const testHtmlPath = path.join(root, 'test.html');
const bundlePath = path.join(root, 'dist', 'referral.js');
const previewHtmlPath = path.join(root, 'share-preview', 'index.html');
const previewBundlePath = path.join(root, 'share-preview', 'dist', 'referral.js');
const singlePreviewHtmlPath = path.join(root, 'share-preview-single', 'index.html');
const widgetOnlyDir = path.join(root, 'widget-only-host');
const widgetOnlyHtmlPath = path.join(widgetOnlyDir, 'index.html');
const widgetOnlyBundlePath = path.join(widgetOnlyDir, 'referral.js');
const widgetOnlyReadmePath = path.join(widgetOnlyDir, 'README.txt');

const testHtml = fs.readFileSync(testHtmlPath, 'utf8');
const bundle = fs.readFileSync(bundlePath, 'utf8');

const scriptTagPattern = /<script\s+src="dist\/referral\.js"([\s\S]*?)><\/script>/;
const match = testHtml.match(scriptTagPattern);

if (!match) {
  throw new Error('Could not find the dist/referral.js script tag in test.html');
}

const scriptAttributes = match[1];
const safeInlineBundle = bundle.replace(/<\/script/gi, '<\\/script');
const singlePreviewHtml = testHtml.replace(
  scriptTagPattern,
  `<script${scriptAttributes}>\n${safeInlineBundle}\n</script>`
);
const widgetOnlyHtml = [
  '<!DOCTYPE html>',
  '<html lang="en">',
  '<head>',
  '  <meta charset="UTF-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1">',
  '  <title>Jelly Referral Widget</title>',
  '  <style>',
  '    html, body { height: 100%; margin: 0; }',
  '    body { min-height: 100vh; background: #FFFFFF; }',
  '  </style>',
  '  <script>',
  '    window.__APOLLO_CLIENT__ = {',
  '      cache: {',
  '        extract: function () {',
  '          return {',
  '            ROOT_QUERY: { viewer: { __ref: "User:1001" }, kitchen: { __ref: "Kitchen:2001" } },',
  '            "User:1001": { id: 1001, firstName: "Alex", lastName: "Example", email: "alex@example.com", phoneNumberNational: "07700900123" },',
  '            "Kitchen:2001": { id: 2001, name: "Demo Bistro" }',
  '          };',
  '        }',
  '      }',
  '    };',
  '  </script>',
  '</head>',
  '<body>',
  '  <script',
  '    src="./referral.js"',
  '    defer',
  '  ></script>',
  '</body>',
  '</html>',
  '',
].join('\n');
const widgetOnlyReadme = [
  'This folder contains the static widget assets.',
  '',
  'Because tracking uses a Cloudflare Pages Function, deploy the repo with Cloudflare Pages Git/Wrangler rather than dashboard Direct Upload.',
  '',
  'Useful URLs after deploy:',
  '- /            -> blank page with only the widget loaded',
  '- /referral.js -> the raw widget script URL to give the Jelly engineer',
  '- /api/referral-events -> Pages Function endpoint used by the widget for D1 funnel tracking',
  '',
  'Example engineer embed:',
  '<script src="https://YOUR-HOST/referral.js" defer></script>',
  '',
  'This build reads the current user and kitchen directly from Jelly\'s Apollo cache.',
  'No CSV file is required. The widget renders when Apollo user/kitchen context is available.',
  '',
  'D1 tracking setup:',
  '1. Create a D1 database named jelly-referral-widget-events.',
  '2. Bind it to the Pages project as DB.',
  '3. Apply migrations/0001_referral_widget_events.sql.',
  '4. Apply migrations/0002_referral_launch_card_state.sql.',
  '',
].join('\n');

fs.mkdirSync(path.dirname(previewBundlePath), { recursive: true });
fs.mkdirSync(path.dirname(singlePreviewHtmlPath), { recursive: true });
fs.copyFileSync(testHtmlPath, previewHtmlPath);
fs.copyFileSync(bundlePath, previewBundlePath);
fs.writeFileSync(singlePreviewHtmlPath, singlePreviewHtml);
fs.mkdirSync(widgetOnlyDir, { recursive: true });
fs.copyFileSync(bundlePath, widgetOnlyBundlePath);
fs.writeFileSync(widgetOnlyHtmlPath, widgetOnlyHtml);
fs.writeFileSync(widgetOnlyReadmePath, widgetOnlyReadme);

console.log(
  JSON.stringify(
    {
      previewHtmlPath,
      previewBundlePath,
      singlePreviewHtmlPath,
      widgetOnlyHtmlPath,
      widgetOnlyBundlePath,
      widgetOnlyReadmePath,
    },
    null,
    2
  )
);
