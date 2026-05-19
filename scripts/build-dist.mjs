import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePaths = [
  path.join(root, 'src', 'copy.js'),
  path.join(root, 'src', 'styles.js'),
  path.join(root, 'src', 'hubspot.js'),
];
const widgetPath = path.join(root, 'src', 'widget.js');
const outputPath = path.join(root, 'dist', 'referral.js');

const banner = [
  '/*!',
  ' * Jelly Referral Widget',
  ' * getjelly.co.uk',
  ' *',
  ' * Install with one script tag:',
  ' *   <script',
  ' *     src="https://cdn.getjelly.co.uk/referral.js"',
  ' *     defer',
  ' *   ></script>',
  ' *',
  ' * This build reads the current user and kitchen from Jelly\'s Apollo cache.',
  ' */',
  '',
].join('\n');

const sourceChunks = sourcePaths.map((filePath) => fs.readFileSync(filePath, 'utf8').trim());
const widgetSource = fs.readFileSync(widgetPath, 'utf8');
const widgetStartToken = '(function () {';
const widgetStartIndex = widgetSource.indexOf(widgetStartToken);

if (widgetStartIndex === -1) {
  throw new Error('Could not find widget IIFE start token.');
}

const widgetSuffix = widgetSource.slice(widgetStartIndex + widgetStartToken.length);
const widgetBundle = [
  '(function () {',
  '  "use strict";',
  '',
  sourceChunks.join('\n\n'),
  widgetSuffix.trimStart(),
].join('\n');

const bundle = [
  banner,
  widgetBundle.trim(),
  '',
].join('\n');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, bundle);

console.log(
  JSON.stringify(
    {
      outputPath,
      bytes: Buffer.byteLength(bundle, 'utf8'),
    },
    null,
    2
  )
);
