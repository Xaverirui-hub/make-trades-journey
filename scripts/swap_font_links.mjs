/* 把各页的 Google Fonts <link> 换成本地 fonts.css。
   preconnect 一并拿掉 —— 已经没有外部字体主机要预连了,留着只会多两次
   无用的 DNS/TLS。 */
import fs from 'node:fs';
import path from 'node:path';

const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(p);
  }
})('MTJ-Hub');

let done = 0, skipped = [];
for (const p of pages) {
  let s = fs.readFileSync(p, 'utf8');
  if (!/fonts\.googleapis\.com/.test(s)) { skipped.push(p + ' (本来就没有)'); continue; }

  const rel = path.relative(path.dirname(p), 'MTJ-Hub/assets/fonts/fonts.css').split(path.sep).join('/');
  const before = s;

  s = s.replace(/[ \t]*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\r?\n/g, '');
  s = s.replace(/[ \t]*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\r?\n/g, '');
  s = s.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*" rel="stylesheet">/g,
                '<link href="' + rel + '" rel="stylesheet"><!-- 自架字体,不走 CDN:大陆连不上 Google Fonts -->');

  if (/fonts\.(googleapis|gstatic)\.com/.test(s)) { skipped.push(p + ' (还有残留,没动)'); continue; }
  if (s !== before) { fs.writeFileSync(p, s, 'utf8'); done++; }
}
console.log(JSON.stringify({ 已改: done, 跳过: skipped }, null, 1));
