const fs=require('fs');
const crypto=require('crypto');
const htmlPath='index.html';
const b64Path='menu-bg.b64';
let html=fs.readFileSync(htmlPath,'utf8');
const raw=fs.readFileSync(b64Path,'utf8').replace(/\s+/g,'').trim();
if(!raw) throw new Error('SALATA background asset is empty');
const decoded=Buffer.from(raw,'base64');
if(decoded.length<12||decoded.subarray(0,4).toString('ascii')!=='RIFF'||decoded.subarray(8,12).toString('ascii')!=='WEBP') throw new Error('SALATA background asset is not a valid WebP');
const version=crypto.createHash('sha1').update(decoded).digest('hex').slice(0,10);
const dataUrl=`data:image/webp;base64,${raw}`;
// Keep the original photo inside the final HTML and also create the correctly typed static asset.
fs.writeFileSync('menu-bg.webp',decoded);
const backgroundCss=`<style id="salata-background-layer">
html,body{min-height:100%;background:#111711!important}
body{position:relative;isolation:isolate;margin:0}
#salata-bg-layer{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;overflow:hidden;background:#111711}
#salata-bg-layer img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;display:block}
#salata-bg-layer:after{content:"";position:absolute;inset:0;background:linear-gradient(rgba(8,14,9,.08),rgba(8,14,9,.30))}
#customerApp,#adminApp{position:relative;z-index:1;min-height:100vh}
</style>`;
html=html.replace(/<style id="salata-background-layer">[\s\S]*?<\/style>/gi,'');
html=html.replace(/<div id="salata-bg-layer"[^>]*>[\s\S]*?<\/div>/gi,'');
html=html.replace(/<!-- SALATA_BACKGROUND_INLINE:[^>]* -->/gi,'');
html=html.replace('</head>',backgroundCss+`\n<!-- SALATA_BACKGROUND_INLINE:${version} -->\n</head>`);
html=html.replace(/<body([^>]*)>/i,`<body$1><div id="salata-bg-layer" aria-hidden="true"><img src="${dataUrl}" alt=""></div>`);
fs.writeFileSync(htmlPath,html);
console.log(`SALATA background embedded and static WebP generated: ${version}`);
