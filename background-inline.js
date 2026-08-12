const fs = require('fs');
const crypto = require('crypto');

const htmlPath = 'index.html';
const b64Path = 'menu-bg.b64';

let html = fs.readFileSync(htmlPath, 'utf8');
const raw = fs.readFileSync(b64Path, 'utf8').replace(/\s+/g, '').trim();

if (!raw) throw new Error('SALATA background asset is empty');

const decoded = Buffer.from(raw, 'base64');
if (decoded.length < 12 || decoded.subarray(0, 4).toString('ascii') !== 'RIFF' || decoded.subarray(8, 12).toString('ascii') !== 'WEBP') {
  throw new Error('SALATA background asset is not a valid WebP');
}

const version = crypto.createHash('sha1').update(decoded).digest('hex').slice(0, 10);
const dataUrl = `url("data:image/webp;base64,${raw}")`;

// The main build creates the theme. Replace its runtime CSS variable with a
// self-contained data URL so the customer background cannot disappear because
// of Vercel static-output handling, routing, MIME type, or asset caching.
html = html.replace(/var\(--salata-bg-image,none\)/g, dataUrl);
html = html.replace(/<script id="salata-background-runtime">[\s\S]*?<\/script>/gi, '');
html = html.replace(/background-attachment:fixed!important/g, `background-attachment:fixed!important;background-image:linear-gradient(180deg,rgba(8,14,9,.18),rgba(8,14,9,.42)),${dataUrl}!important`);

// Keep a deterministic marker for debugging the deployed HTML.
html = html.replace('</head>', `<!-- SALATA_BACKGROUND_INLINE:${version} -->\n</head>`);

fs.writeFileSync(htmlPath, html);
console.log(`SALATA background inlined successfully: ${version}`);
