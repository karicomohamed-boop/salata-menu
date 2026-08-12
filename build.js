const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
let hasBackground = false;
let backgroundBase64 = '';
try {
  if (fs.existsSync('menu-bg.b64')) {
    const raw = fs.readFileSync('menu-bg.b64', 'utf8').replace(/\s+/g, '').trim();
    if (raw) {
      backgroundBase64 = raw;
      fs.writeFileSync('menu-bg.webp', Buffer.from(raw, 'base64'));
      hasBackground = fs.existsSync('menu-bg.webp');
    }
  }
} catch (err) {
  console.warn('Background asset skipped:', err.message);
}

// Inline the background image as a data URL as well as generating menu-bg.webp.
// This prevents the background from disappearing if the generated asset is not served by the host.
const backgroundCss = hasBackground
  ? `body{background:linear-gradient(rgba(8,14,9,.66),rgba(8,14,9,.82)),url("data:image/webp;base64,${backgroundBase64}") center center/cover fixed!important;color:#f7faf5!important}`
  : "body{background:linear-gradient(180deg,#f7fbf4 0%,#eef6ea 100%)!important}";

const themeCss = `<style id="salata-final-theme">${backgroundCss}.top{background:rgba(255,255,255,.08)!important;backdrop-filter:blur(8px)}.band{background:rgba(55,112,52,.78)!important;backdrop-filter:blur(4px)}.hero h1,.section-title h2{color:#fff!important}.hero p,.section-title p{color:rgba(255,255,255,.84)!important}.cat,.card,.panel,.stat-card,.admin-item,.modal-box,.drawer-panel{background:rgba(18,24,18,.72)!important;border-color:rgba(255,255,255,.16)!important;box-shadow:0 18px 45px rgba(0,0,0,.25)!important;backdrop-filter:blur(10px)}.cat b,.card h3,.item-name,.panel h2{color:#fff!important}.desc,.muted,.item-meta{color:rgba(255,255,255,.76)!important}.price{color:#8fd66e!important}.tag{background:rgba(102,168,82,.18)!important;color:#a4df8e!important}.cat:nth-child(n){background:rgba(20,28,20,.68)!important}.cat.active{border-color:#69ad59!important;background:rgba(59,119,55,.72)!important}.empty{background:rgba(18,24,18,.72)!important;color:rgba(255,255,255,.76)!important}.footer{background:rgba(32,83,31,.94)!important}.admin{background:transparent!important}.stock-badge{display:inline-block;margin-top:10px;padding:6px 11px;border-radius:999px;font-size:12px;font-weight:800}.stock-ok{background:#e5f5df;color:#377f32}.stock-out{background:#fff0f0;color:#d33;border:1px solid #f2bcbc}#stockFields{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}@media(max-width:560px){#stockFields{grid-template-columns:1fr}}</style>`;
const seo = '<meta name="keywords" content="سلطة, SALATA, وجبات صحية, مطعم صحي, healthy food, healthy meals, مشروبات, عصائر, مشروبات ساخنة, سناكس, إضافات, menu"><meta name="description" content="سلطة SALATA — وجبات صحية ومشروبات وعصائر وسناكس وإضافات، اختيارات صحية لحياة أفضل."><meta property="og:title" content="سلطة | SALATA"><meta property="og:description" content="وجبات صحية ومشروبات وعصائر وسناكس وإضافات — سلطة SALATA.">';
if (!html.includes('salata-final-theme')) html = html.replace('</head>', themeCss + '</head>');
if (!html.includes('name="keywords"')) html = html.replace('</head>', seo + '</head>');

const stockJs = `<script id="salata-stock-build">(function(){function addStockFields(){if(document.getElementById('stockFields'))return;const price=document.getElementById('aPrice');if(!price||!price.closest('.form-grid'))return;const wrap=document.createElement('div');wrap.id='stockFields';wrap.innerHTML='<div><label>متابعة المخزون</label><select id="aTrackStock"><option value="false">لا</option><option value="true">نعم</option></select></div><div><label>الكمية الحالية</label><input id="aQuantity" type="number" min="0" value="0"></div>';price.closest('.form-grid').after(wrap)}function stockStatus(x){if(!x.track_stock)return '';return Number(x.quantity||0)>0?'<span class="stock-badge stock-ok">متاح</span>':'<span class="stock-badge stock-out">SOLD OUT • متاح قريبًا</span>'}function hook(){addStockFields();if(typeof window.saveItem!=='function'||window.saveItem.__salataStock)return;const originalEdit=window.editItem;window.saveItem=async function(){addStockFields();const n=document.getElementById('aName').value.trim(),c=document.getElementById('aCategory').value,d=document.getElementById('aDesc').value.trim(),p=document.getElementById('aPrice').value===''?null:Number(document.getElementById('aPrice').value),f=document.getElementById('aImage').files[0],t=document.getElementById('aTrackStock').value==='true',q=Math.max(0,parseInt(document.getElementById('aQuantity').value||'0',10));if(!n||!c){document.getElementById('saveMsg').textContent='من فضلك اكتب اسم الصنف واختر القسم.';return}document.getElementById('saveBtn').disabled=true;document.getElementById('saveMsg').textContent='جاري الحفظ...';try{let image_url=null;if(f)image_url=await uploadImage(f);const data={name:n,category:c,description:d,price:p,track_stock:t,quantity:q};if(image_url)data.image_url=image_url;const r=editingId?await sb.from('menu_items').update(data).eq('id',editingId):await sb.from('menu_items').insert(data).select().single();if(r.error)throw r.error;document.getElementById('saveMsg').textContent='تم الحفظ بنجاح.';resetForm();await loadItems()}catch(e){document.getElementById('saveMsg').textContent='تعذر الحفظ: '+(e.message||'حدث خطأ')}finally{document.getElementById('saveBtn').disabled=false}};window.saveItem.__salataStock=true;window.editItem=function(id){originalEdit(id);setTimeout(function(){addStockFields();const x=items.find(i=>Number(i.id)===Number(id));if(x){document.getElementById('aTrackStock').value=String(!!x.track_stock);document.getElementById('aQuantity').value=Number(x.quantity||0)}},100)};const originalRender=window.renderItems;window.renderItems=function(){originalRender();document.querySelectorAll('.card').forEach(function(el,i){const list=items.filter(x=>x.category===active);if(list[i]){const badge=stockStatus(list[i]);if(badge)el.querySelector('.price')?.insertAdjacentHTML('afterend',badge)}})}};new MutationObserver(hook).observe(document.body,{childList:true,subtree:true});setTimeout(hook,300)})();</script>`;
if (!html.includes('salata-stock-build')) html = html.replace('</body>', stockJs + '</body>');

fs.writeFileSync('index.html', html);
console.log('SALATA build completed successfully. Background:', hasBackground ? 'enabled-inline' : 'fallback');
