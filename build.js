const fs = require('fs');
const crypto = require('crypto');

let html = fs.readFileSync('index.html', 'utf8');
let backgroundVersion = 'fallback';
let backgroundImage = 'none';

// Build the customer's background into the page itself. This avoids runtime
// fetches, CDN paths, cache issues, and Vercel static-output differences.
try {
  if (fs.existsSync('menu-bg.b64')) {
    const raw = fs.readFileSync('menu-bg.b64', 'utf8').replace(/\s+/g, '').trim();
    if (raw) {
      const decoded = Buffer.from(raw, 'base64');
      const isWebp = decoded.length > 12 && decoded.subarray(0, 4).toString('ascii') === 'RIFF' && decoded.subarray(8, 12).toString('ascii') === 'WEBP';
      if (isWebp) {
        fs.writeFileSync('menu-bg.webp', decoded);
        backgroundVersion = crypto.createHash('sha1').update(decoded).digest('hex').slice(0, 10);
        backgroundImage = `url("data:image/webp;base64,${raw}")`;
      } else console.warn('Background asset skipped: invalid WebP data');
    }
  }
} catch (err) { console.warn('Background asset skipped:', err.message); }

// Remove previous generated blocks so every build is deterministic.
html = html.replace(/<style id="salata-final-theme">[\s\S]*?<\/style>/gi, '');
html = html.replace(/<script id="salata-background-runtime">[\s\S]*?<\/script>/gi, '');
html = html.replace(/<meta name="keywords"[^>]*>\s*/gi, '');
html = html.replace(/<meta property="og:title"[^>]*>\s*/gi, '');
html = html.replace(/<meta property="og:description"[^>]*>\s*/gi, '');

// The background is a real build-time CSS value. No browser fetch is needed.
const themeCss = `<style id="salata-final-theme">
html{min-height:100%;background:#111711!important}
body{min-height:100%;position:relative;background:transparent!important;color:inherit}
body:before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(8,14,9,.10),rgba(8,14,9,.32)),${backgroundImage};background-position:center center;background-size:cover;background-repeat:no-repeat}
#customerApp,#adminApp{position:relative;z-index:1;min-height:100vh}
.top{background:rgba(255,255,255,.06)!important;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
.veg-pattern{background-color:transparent!important;background-image:none!important}
.band{background:rgba(55,112,52,.72)!important;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
.hero h1,.section-title h2{color:#fff!important;text-shadow:0 2px 12px rgba(0,0,0,.35)}
.hero p,.section-title p{color:rgba(255,255,255,.9)!important;text-shadow:0 1px 8px rgba(0,0,0,.35)}
.cat,.card,.panel,.stat-card,.admin-item,.modal-box,.drawer-panel{background:rgba(18,24,18,.72)!important;border-color:rgba(255,255,255,.16)!important;box-shadow:0 18px 45px rgba(0,0,0,.25)!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.cat b,.card h3,.item-name,.panel h2{color:#fff!important}.desc,.muted,.item-meta{color:rgba(255,255,255,.78)!important}.price{color:#9be27b!important}.tag{background:rgba(102,168,82,.22)!important;color:#b7efa1!important}.cat.active{border-color:#69ad59!important;background:rgba(59,119,55,.72)!important}.empty{background:rgba(18,24,18,.72)!important;color:rgba(255,255,255,.78)!important}.footer{background:rgba(32,83,31,.92)!important}.admin{background:transparent!important}.stock-badge{display:inline-block;margin-top:10px;padding:6px 11px;border-radius:999px;font-size:12px;font-weight:800}.stock-ok{background:#e5f5df;color:#377f32}.stock-out{background:#fff0f0;color:#d33;border:1px solid #f2bcbc}#stockFields{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}@media(max-width:560px){#stockFields{grid-template-columns:1fr}}
</style>`;

const seo = '<meta name="keywords" content="سلطة, SALATA, وجبات صحية, مطعم صحي, healthy food, healthy meals, مشروبات, عصائر, مشروبات ساخنة, سناكس, إضافات, menu"><meta name="description" content="سلطة SALATA — وجبات صحية ومشروبات وعصائر وسناكس وإضافات، اختيارات صحية لحياة أفضل."><meta property="og:title" content="سلطة | SALATA"><meta property="og:description" content="وجبات صحية ومشروبات وعصائر وسناكس وإضافات — سلطة SALATA.">';
html = html.replace('</head>', themeCss + seo + `<!-- SALATA_BACKGROUND_BUILD:${backgroundVersion} -->` + '</head>');

const stockJs = '<script id="salata-stock-build">(function(){function addStockFields(){if(document.getElementById(\'stockFields\'))return;const price=document.getElementById(\'aPrice\');if(!price||!price.closest(\'.form-grid\'))return;const wrap=document.createElement(\'div\');wrap.id=\'stockFields\';wrap.innerHTML=\'<div><label>متابعة المخزون</label><select id="aTrackStock"><option value="false">لا</option><option value="true">نعم</option></select></div><div><label>الكمية الحالية</label><input id="aQuantity" type="number" min="0" value="0"></div>\';price.closest(\'.form-grid\').after(wrap)}function hook(){addStockFields();if(typeof window.saveItem!==\'function\'||window.saveItem.__salataStock)return;const originalEdit=window.editItem;window.saveItem.__salataStock=true;window.editItem=function(id){originalEdit(id);setTimeout(function(){addStockFields();const x=items.find(i=>Number(i.id)===Number(id));if(x){document.getElementById(\'aTrackStock\').value=String(!!x.track_stock);document.getElementById(\'aQuantity\').value=Number(x.quantity||0)}},100)}}new MutationObserver(hook).observe(document.body,{childList:true,subtree:true});setTimeout(hook,300)})();</script>';
html = html.replace(/<script id="salata-stock-build">[\s\S]*?<\/script>/gi, '');
html = html.replace('</body>', stockJs + '</body>');

fs.writeFileSync('index.html', html);
console.log('SALATA production build completed. Background embedded:', backgroundVersion);
