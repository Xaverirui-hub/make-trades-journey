/* =====================================================================
   COMING SOON 遮罩 — 全站共用

   【这不是权限控制】。被盖住的内容仍然在 DOM 里,打开开发者工具删掉这层
   就看得到。它的作用是「告诉访客这块还没好」,不是「不让人看」。
   真正要挡内容,只能靠服务器不发 —— 见 specs/PHASE2_AUTH_SPEC.md。

   beta 期间免费开放,所以这样就够了。等要收钱时,该换成服务器侧的拦截。

   用法:
     mountComingSoon('.galaxy-zone', { title:[en, zh], note:[en, zh] })
     mountComingSoon('page', {...})        // 'page' = 盖满整个视口
   ===================================================================== */

const CSS = `
/* 定位三条用 !important:遮罩要盖在【任意】宿主页面上,而宿主随时可能有
   更高特异性的规则。ea.html 就有一条 .galaxy-zone>*:not(.galaxy-bg)
   {position:relative;z-index:1},把遮罩按回了文档流里。 */
.mtj-cs{position:absolute !important;inset:0 !important;z-index:60 !important;
  display:flex;justify-content:center;pointer-events:auto;
  background:linear-gradient(180deg,rgba(6,6,9,.72) 0%,rgba(6,6,9,.9) 22%,rgba(6,6,9,.93) 100%);
  -webkit-backdrop-filter:blur(9px) saturate(.7);backdrop-filter:blur(9px) saturate(.7);}
.mtj-cs.is-page{position:fixed !important;}
/* 面板黏在视口中间 —— 被盖的区域很长,不黏住的话滚两屏就看不到说明了 */
.mtj-cs-panel{position:sticky;top:38vh;align-self:flex-start;
  max-width:430px;margin:38vh 22px 0;text-align:center;
  transform:translateY(-50%);}
.mtj-cs.is-page .mtj-cs-panel{position:static;margin:0 22px;align-self:center;transform:none;}
.mtj-cs-badge{display:inline-block;
  font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.24em;
  text-transform:uppercase;font-weight:700;color:var(--gold,#E8C877);
  border:1px solid rgba(232,200,119,.4);background:rgba(232,200,119,.08);
  border-radius:20px;padding:6px 15px;margin-bottom:20px;}
.mtj-cs-title{font-family:'Sora',sans-serif;font-size:clamp(23px,3.4vw,31px);
  line-height:1.22;font-weight:800;letter-spacing:-.02em;
  color:var(--gold-bright,#FCE9A8);margin:0 0 13px;text-wrap:balance;}
.mtj-cs-title .zh{display:block;font-size:.72em;margin-top:9px;
  font-family:'Noto Sans SC',sans-serif;letter-spacing:.04em;color:var(--gold,#E8C877);}
.mtj-cs-note{font-size:13.5px;line-height:1.75;color:var(--muted,#9A968C);margin:0;}
.mtj-cs-note .zh{font-family:'Noto Sans SC',sans-serif;}
@media(max-width:640px){
  .mtj-cs-panel{top:30vh;margin-top:30vh;}
}
`;

let cssDone = false;
function ensureCss() {
  if (cssDone) return;
  const s = document.createElement('style');
  s.setAttribute('data-mtj', 'comingsoon');
  s.textContent = CSS;
  document.head.appendChild(s);
  cssDone = true;
}

const pair = (en, zh) =>
  '<span class="en">' + en + '</span><span class="zh">' + zh + '</span>';

export function mountComingSoon(target, opts = {}) {
  ensureCss();

  const isPage = target === 'page';
  const host = isPage
    ? document.body
    : (typeof target === 'string' ? document.querySelector(target) : target);
  if (!host) return null;

  const title = opts.title || ['Coming soon', '即将上线'];
  const note = opts.note || ['This part is still being built.', '这部分还在做。'];
  const badge = opts.badge || 'Coming soon';

  const el = document.createElement('div');
  el.className = 'mtj-cs' + (isPage ? ' is-page' : '');
  el.innerHTML =
    '<div class="mtj-cs-panel">' +
      '<div class="mtj-cs-badge">' + badge + '</div>' +
      '<h2 class="mtj-cs-title">' + pair(title[0], title[1]) + '</h2>' +
      '<p class="mtj-cs-note">' + pair(note[0], note[1]) + '</p>' +
    '</div>';

  /* 盖住的内容不能还能用 Tab 走进去 —— 看不见却能聚焦是最糟的无障碍问题。
     inert 加在【子元素】上而不是容器上:加在容器上会连遮罩自己一起 inert。
     整页模式要放过导航 —— 遮罩的 z-index(60) 低于导航(95),导航本来就
     露在外面,访客得能靠它走开。 */
  const keep = isPage ? (opts.keep || '#globalNav') : null;
  if (!isPage && getComputedStyle(host).position === 'static') host.style.position = 'relative';
  Array.prototype.forEach.call(host.children, (c) => {
    if (c === el) return;
    if (keep && c.matches(keep)) return;
    c.setAttribute('inert', '');
    c.setAttribute('aria-hidden', 'true');
    if (!('inert' in HTMLElement.prototype)) c.style.pointerEvents = 'none';
  });

  host.appendChild(el);

  /* 语言引擎在 DOMContentLoaded 跑;若已经跑过,补一次让 en/zh 立刻生效 */
  if (window.setLang) {
    window.setLang(document.body.classList.contains('lang-en') ? 'en' : 'zh');
  }
  return el;
}
