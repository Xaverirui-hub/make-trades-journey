
function makeEl(){ return { style:{}, classList:{add(){},remove(){},contains(){return false}} }; }
global.document = {
  getElementById(){ return makeEl(); },
  createElement(){ return makeEl(); },
  createTextNode(){ return {}; },
  body:{ classList:{ add(){}, remove(){}, contains(){return false} } },
  querySelectorAll(){ return []; }
};
global.localStorage = { getItem(){return 'zh'}, setItem(){} };


/* ===== MTJ Language Toggle (course) ===== */
function setLang(l){
  document.body.classList.remove('lang-en','lang-zh');
  document.body.classList.add('lang-'+l);
  try{ localStorage.setItem('mtj_lang', l); }catch(e){}
  var en=document.getElementById('langEn'), zh=document.getElementById('langZh');
  var on = "background:var(--gold);color:#0a0e14;border-color:var(--gold);border-radius:20px;padding:5px 14px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;cursor:pointer;font-weight:700;";
  var off = "background:none;border:1px solid var(--line);color:var(--muted);border-radius:20px;padding:5px 14px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;cursor:pointer;";
  if(en) en.style.cssText = l==='en' ? on : off;
  if(zh) zh.style.cssText = l==='zh' ? on : off;
}
(function(){
  var saved='en'; try{ saved=localStorage.getItem('mtj_lang')||'en'; }catch(e){}
  setLang(saved);
})();
