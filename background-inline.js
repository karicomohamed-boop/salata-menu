const fs = require('fs');
const crypto = require('crypto');

const source = 'menu-bg-source.webp';
const target = 'menu-bg.webp';
const htmlPath = 'index.html';

if (!fs.existsSync(source)) throw new Error('SALATA background source asset is missing');
fs.copyFileSync(source, target);

const image = fs.readFileSync(target);
const version = crypto.createHash('sha1').update(image).digest('hex').slice(0, 10);
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/<style id="salata-static-background">[\s\S]*?<\/style>/gi, '');
const css = `<style id="salata-static-background">\nhtml,body{min-height:100%;background:#101610!important}\nbody:before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(5,9,6,.18),rgba(5,9,6,.48)),url("/menu-bg.webp?v=${version}");background-position:center center;background-size:cover;background-repeat:no-repeat}\n#customerApp,#adminApp{position:relative;z-index:1;min-height:100vh}\n</style>`;
html = html.replace('</head>', css + '\n</head>');
fs.writeFileSync(htmlPath, html);
console.log(`SALATA background restored from ${source}: ${version}`);
