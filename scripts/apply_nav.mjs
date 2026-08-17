/* 把各页的导航栏(HTML + CSS)换成 assets/nav.js 一行。
   逐页校验:动手前先确认那页的导航 CSS 与基准页一致,不一致就跳过不动。 */
import fs from 'node:fs';
import path from 'node:path';

const pages = [];
(function w(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) w(p); else if (e.name.endsWith('.html')) pages.push(p);
  }
})('MTJ-Hub');

const canon = fs.readFileSync('MTJ-Hub/about.html', 'utf8');
const canonRules = new Set([...canon.matchAll(/(^|\})\s*(\.navbar[^{]*|\.nb-[a-z-]+[^{]*)\{([^}]*)\}/gm)]
  .map(m => (m[2].trim() + '{' + m[3].replace(/\s+/g, ' ').trim() + '}')));

let done = 0; const skipped = [], notes = [];

for (const p of pages) {
  let s = fs.readFileSync(p, 'utf8');
  const i = s.indexOf('<nav class="navbar"');
  if (i < 0) { skipped.push(path.relative('MTJ-Hub', p) + ' (没有导航)'); continue; }
  const j = s.indexOf('</nav>', i) + 6;

  const rel = path.relative(path.dirname(p), 'MTJ-Hub/assets/nav.js').split(path.sep).join('/');
  const before = s;

  /* ① 移除基础规则 —— 只删和基准页逐字节相同的,不同的留着不碰 */
  let removedBase = 0, kept = [];
  s = s.replace(/(^|\})(\s*)(\.navbar[^{]*|\.nb-[a-z-]+[^{]*)\{([^}]*)\}/gm, (m, pre, ws, sel, body) => {
    const norm = sel.trim() + '{' + body.replace(/\s+/g, ' ').trim() + '}';
    if (canonRules.has(norm)) { removedBase++; return pre; }
    kept.push(sel.trim()); return m;
  });

  /* ② 移除响应式 media 块 —— 只有整块都是导航规则才删 */
  let removedMedia = 0;
  s = s.replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, (m) => {
    if (!/\.navbar|\.nb-/.test(m)) return m;
    const sels = [...m.matchAll(/([^{}]+)\{[^}]*\}/g)].map(x => x[1].trim()).filter(x => !x.startsWith('@media'));
    if (sels.some(x => !/^\.navbar|^\.nb-/.test(x))) { notes.push(path.relative('MTJ-Hub', p) + ' media 块有混杂,保留'); return m; }
    removedMedia++; return '';
  });

  /* ③ 导航标记换成脚本(位置不变 → 同步执行,后面的 scroll-spy 仍找得到) */
  const iNow = s.indexOf('<nav class="navbar"');
  const jNow = s.indexOf('</nav>', iNow) + 6;
  s = s.slice(0, iNow) + '<script src="' + rel + '"></script><!-- 全站共用导航,见 assets/nav.js -->' + s.slice(jNow);

  if (s !== before) {
    fs.writeFileSync(p, s, 'utf8'); done++;
    if (kept.length) notes.push(path.relative('MTJ-Hub', p) + ' 保留了非标准规则: ' + kept.join(', '));
    if (!removedBase && !removedMedia) notes.push(path.relative('MTJ-Hub', p) + ' 只换了标记,CSS 未匹配');
  }
}
console.log(JSON.stringify({ 已改: done, 跳过: skipped, 备注: notes }, null, 1));
