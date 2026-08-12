const fs = require('fs');
const crypto = require('crypto');

let html = fs.readFileSync('index.html', 'utf8');
let hasBackground = false;
let backgroundVersion = 'fallback';

try {
  if (fs.existsSync('menu-bg.b64')) {
    const raw = fs.readFileSync('menu-bg.b64', 'utf8').replace(/\s+/g, '').trim();
    if (raw) {
      const decoded = Buffer.from(raw, 'base64');
      const isWebp = decoded.length > 12 &&
        decoded.subarray(0, 4).toString('ascii') === 'RIFF' &&
        decoded.subarray(8, 12).toString('ascii') === 'WEBP';
      if (isWebp) {
        fs.writeFileSync('menu-bg.webp', decoded);
        backgroundVersion = crypto.createHash('sha1').update(decoded).digest('hex').slice(0, 10);
        hasBackground = true;
      } else {
        console.warn('Background asset skipped: invalid WebP data');
      }
    }
  }
} catch (err) {
  console.warn('Background asset skipped:', err.message);
}

// Replace the generated theme on every build so old CSS cannot survive a rebuild.
html = html.replace(/<style id="salata-final-theme">[\s\S]*?<\/style>/gi, '');
html = html.replace(/<meta name="keywords"[^>]*>\s*/gi, '');
html = html.replace(/<meta property="og:title"[^>]*>\s*/gi, '');
html = html.replace(/<meta property="og:description"[^>]*>\s*/gi, '');

const backgroundLayer = hasBackground
  ? `html:before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(rgba(8,14,9,.22),rgba(8,14,9,.42)),url("/menu-bg.webp?v=${backgroundVersion}");background-position:center center;background-size:cover;background-repeat:no-repeat}html,body{background:transparent!important}`
  : `html,body{background:linear-gradient(180deg,#263026 0%,#111711 100%)!important}`;

const themeCss = `<style id="salata-final-theme">${backgroundLayer}html,body{min-height:100%;background-attachment:fixed!important}body{color:#f7faf5!important}#customerApp,#adminApp{position:relative;z-index:1;min-height:100vh}.top{background:rgba(255,255,255,.06)!important;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}.veg-pattern{background-color:transparent!important;background-image:none!important}.band{background:rgba(55,112,52,.72)!important;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}.hero h1,.section-title h2{color:#fff!important;text-shadow:0 2px 12px rgba(0,0,0,.35)}.hero p,.section-title p{color:rgba(255,255,255,.9)!important;text-shadow:0 1px 8px rgba(0,0,0,.35)}.cat,.card,.panel,.stat-card,.admin-item,.modal-box,.drawer-panel{background:rgba(18,24,18,.72)!important;border-color:rgba(255,255,255,.16)!important;box-shadow:0 18px 45px rgba(0,0,0,.25)!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}.cat b,.card h3,.item-name,.panel h2{color:#fff!important}.desc,.muted,.item-meta{color:rgba(255,255,255,.78)!important}.price{color:#9be27b!important}.tag{background:rgba(102,168,82,.22)!important;color:#b7efa1!important}.cat:nth-child(n){background:rgba(20,28,20,.68)!important}.cat.active{border-color:#69ad59!important;background:rgba(59,119,55,.72)!important}.empty{background:rgba(18,24,18,.72)!important;color:rgba(255,255,255,.78)!important}.footer{background:rgba(32,83,31,.92)!important}.admin{background:transparent!important}.stock-badge{display:inline-block;margin-top:10px;padding:6px 11px;border-radius:999px;font-size:12px;font-weight:800}.stock-ok{background:#e5f5df;color:#377f32}.stock-out{background:#fff0f0;color:#d33;border:1px solid #f2bcbc}#stockFields{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}@media(max-width:560px){#stockFields{grid-template-columns:1fr}}</style>`;
const seo = '<meta name="keywords" content="سلطة, SALATA, وجبات صحية, مطعم صحي, healthy food, healthy meals, مشروبات, عصائر, مشروبات ساخنة, سناكس, إضافات, menu"><meta name="description" content="سلطة SALATA — وجبات صحية ومشروبات وعصائر وسناكس وإضافات، اختيارات صحية لحياة أفضل."><meta property="og:title" content="سلطة | SALATA"><meta property="og:description" content="وجبات صحية ومشروبات وعصائر وسناكس وإضافات — سلطة SALATA.">';
html = html.replace('</head>', themeCss + seo + '</head>');

const stockJs = '<script id="salata-stock-build">(function(){function addStockFields(){if(document.getElementById(\'stockFields\'))return;const price=document.getElementById(\'aPrice\');if(!price||!price.closest(\'.form-grid\'))return;const wrap=document.createElement(\'div\');wrap.id=\'stockFields\';wrap.innerHTML=\'<div><label>متابعة المخزون</label><select id="aTrackStock"><option value="false">لا</option><option value="true">نعم</option></select></div><div><label>الكمية الحالية</label><input id="aQuantity" type="number" min="0" value="0"></div>\';price.closest(\'.form-grid\').after(wrap)}function stockStatus(x){if(!x.track_stock)return \'\';return Number(x.quantity||0)>0?\'<span class="stock-badge stock-ok">متاح</span>\':\'<span class="stock-badge stock-out">SOLD OUT • متاح قريبًا</span>\'}function hook(){addStockFields();if(typeof window.saveItem!==\'function\'||window.saveItem.__salataStock)return;const originalEdit=window.editItem;window.saveItem=async function(){addStockFields();const n=document.getElementById(\'aName\').value.trim(),c=document.getElementById(\'aCategory\').value,d=document.getElementById(\'aDesc\').value.trim(),p=document.getElementById(\'aPrice\').value===\'\'?null:Number(document.getElementById(\'aPrice\').value),f=document.getElementById(\'aImage\').files[0],t=document.getElementById(\'aTrackStock\').value===\'true\',q=Math.max(0,parseInt(document.getElementById(\'aQuantity\').value||\'0\',10));if(!n||!c){document.getElementById(\'saveMsg\').textContent=\'من فضلك اكتب اسم الصنف واختر القسم.\';return}document.getElementById(\'saveBtn\').disabled=true;document.getElementById(\'saveMsg\').textContent=\'جاري الحفظ...\';try{let image_url=null;if(f)image_url=await uploadImage(f);const data={name:n,category:c,description:d,price:p,track_stock:t,quantity:q};if(image_url)data.image_url=image_url;const r=editingId?await sb.from(\'menu_items\').update(data).eq(\'id\',editingId):await sb.from(\'menu_items\').insert(data).select().single();if(r.error)throw r.error;document.getElementById(\'saveMsg\').textContent=\'تم الحفظ بنجاح.\';resetForm();await loadItems()}catch(e){document.getElementById(\'saveMsg\').textContent=\'تعذر الحفظ: \'+(e.message||\'حدث خطأ\')}finally{document.getElementById(\'saveBtn\').disabled=false}};window.saveItem.__salataStock=true;window.editItem=function(id){originalEdit(id);setTimeout(function(){addStockFields();const x=items.find(i=>Number(i.id)===Number(id));if(x){document.getElementById(\'aTrackStock\').value=String(!!x.track_stock);document.getElementById(\'aQuantity\').value=Number(x.quantity||0)}},100)};const originalRender=window.renderItems;window.renderItems=function(){originalRender();document.querySelectorAll(\'.card\').forEach(function(el,i){const list=items.filter(x=>x.category===active);if(list[i]){const badge=stockStatus(list[i]);if(badge)el.querySelector(\'.price\')?.insertAdjacentHTML(\'afterend\',badge)}})}};new MutationObserver(hook).observe(document.body,{childList:true,subtree:true});setTimeout(hook,300)})();</script>';
html = html.replace(/<script id="salata-stock-build">[\s\S]*?<\/script>/gi, '');
html = html.replace('</body>', stockJs + '</body>');

fs.writeFileSync('index.html', html);
console.log('SALATA build completed successfully. Background:', hasBackground ? 'menu-bg.webp fixed background (' + backgroundVersion + ')' : 'fallback');
