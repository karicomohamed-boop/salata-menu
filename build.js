const fs=require('fs');
if(fs.existsSync('menu-bg.b64')){
  const raw=fs.readFileSync('menu-bg.b64','utf8').replace(/\s+/g,'').trim();
  if(raw) fs.writeFileSync('menu-bg.webp',Buffer.from(raw,'base64'));
}
let h=fs.readFileSync('index.html','utf8');
const css='<style id="salata-final-theme">body{background:linear-gradient(rgba(8,14,9,.66),rgba(8,14,9,.82)),url(\'menu-bg.webp\') center center/cover fixed!important;color:#f7faf5!important}.top{background:rgba(255,255,255,.08)!important;backdrop-filter:blur(8px)}.band{background:rgba(55,112,52,.78)!important;backdrop-filter:blur(4px)}.hero h1,.section-title h2{color:#fff!important}.hero p,.section-title p{color:rgba(255,255,255,.84)!important}.cat,.card,.panel,.stat-card,.admin-item,.modal-box,.drawer-panel{background:rgba(18,24,18,.72)!important;border-color:rgba(255,255,255,.16)!important;box-shadow:0 18px 45px rgba(0,0,0,.25)!important;backdrop-filter:blur(10px)}.cat b,.card h3,.item-name,.panel h2{color:#fff!important}.desc,.muted,.item-meta{color:rgba(255,255,255,.76)!important}.price{color:#8fd66e!important}.tag{background:rgba(102,168,82,.18)!important;color:#a4df8e!important}.cat:nth-child(n){background:rgba(20,28,20,.68)!important}.cat.active{border-color:#69ad59!important;background:rgba(59,119,55,.72)!important}.empty{background:rgba(18,24,18,.72)!important;color:rgba(255,255,255,.76)!important}.footer{background:rgba(32,83,31,.94)!important}.admin{background:transparent!important}</style>';
const seo='<meta name="keywords" content="سلطة, SALATA, وجبات صحية, مطعم صحي, healthy food, healthy meals, مشروبات, عصائر, مشروبات ساخنة, سناكس, إضافات, menu"><meta name="description" content="سلطة SALATA — وجبات صحية ومشروبات وعصائر وسناكس وإضافات، اختيارات صحية لحياة أفضل."><meta property="og:title" content="سلطة | SALATA"><meta property="og:description" content="وجبات صحية ومشروبات وعصائر وسناكس وإضافات — سلطة SALATA.">';
if(!h.includes('salata-final-theme'))h=h.replace('</head>',css+'</head>');
if(!h.includes('name="keywords"'))h=h.replace('</head>',seo+'</head>');
fs.writeFileSync('index.html',h);
