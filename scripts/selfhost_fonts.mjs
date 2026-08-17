/* Task 0：Google Fonts 改自架。
   大陆连不上 fonts.googleapis.com,全站 34 页的 Sora / JetBrains Mono /
   Noto Sans SC / Cormorant Garamond 都会掉回系统默认字体 —— 而且从墙外
   测不出来。

   用 @fontsource 的【可变字体】版:Noto Sans SC 4 个静态权重要 15MB/408 檔,
   可变版覆盖全部权重只要 4.6MB/101 檔。

   字体族名沿用站上现有的('Sora' 而非 'Sora Variable'),34 份 CSS 一行不改。
   站上没有任何希腊/西里尔/越南字符,那些子集不带。 */
import fs from 'node:fs';
import path from 'node:path';

const SRC = process.env.TMP + '/fonts';
const OUT = 'MTJ-Hub/assets/fonts';
const FILES = OUT + '/files';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(FILES, { recursive: true });

/* pkgDir, 站上用的族名, 只要哪些子集(正则,null=全要), 要读哪几份 CSS

   注意:@fontsource 的 index.css 只有【正体】,斜体另外放在 wght-italic.css。
   只读 index.css 的话斜体会被静默丢掉,页面会退化成浏览器合成的假斜体。
   Cormorant Garamond 站上是 ital,wght@0,500;1,500,真的要斜体。
   其余三套原本的 Google Fonts 链接就没要斜体,保持一致。 */
const FONTS = [
  ['xv_sora/package',               'Sora',               null, ['index.css']],
  ['xv_jetbrains-mono/package',     'JetBrains Mono',     /-(latin|latin-ext)-wght-normal\.woff2$/, ['index.css']],
  ['xv_cormorant-garamond/package', 'Cormorant Garamond', /-(latin|latin-ext)-wght-(normal|italic)\.woff2$/, ['index.css', 'wght-italic.css']],
  ['xv/package',                    'Noto Sans SC',       null, ['index.css']],
];

let css = `/* 自架字体 — 由 scripts/selfhost_fonts.mjs 生成,不要手改。
   来源:@fontsource-variable/{sora,jetbrains-mono,cormorant-garamond,noto-sans-sc} 5.3.0
   全部 SIL Open Font License 1.1,授权见 assets/fonts/LICENSE.txt
   族名刻意沿用站上原本的名字,所以各页 CSS 不需要改动。 */\n`;

let copied = 0, bytes = 0, faces = 0;
const licenses = [];

for (const [dir, family, keep, cssFiles] of FONTS) {
  const base = path.join(SRC, dir);
  const src = cssFiles.map(f => fs.readFileSync(path.join(base, f), 'utf8')).join('\n');

  const lic = path.join(base, 'LICENSE');
  if (fs.existsSync(lic)) licenses.push('===== ' + family + ' =====\n' + fs.readFileSync(lic, 'utf8'));

  /* 逐条 @font-face 拆开,只留需要的子集,顺手把族名换掉 */
  for (const block of src.split('@font-face').slice(1)) {
    const body = '@font-face' + block.slice(0, block.indexOf('}') + 1);
    const m = body.match(/url\(\.\/files\/([^)]+)\)/);
    if (!m) continue;
    const file = m[1];
    if (keep && !keep.test(file)) continue;

    fs.copyFileSync(path.join(base, 'files', file), path.join(FILES, file));
    bytes += fs.statSync(path.join(FILES, file)).size;
    copied++; faces++;

    css += '\n' + body
      .replace(/font-family:\s*'[^']+'/, "font-family: '" + family + "'")
      .replace('url(./files/', 'url(files/') + '\n';
  }
}

fs.writeFileSync(OUT + '/fonts.css', css, 'utf8');
fs.writeFileSync(OUT + '/LICENSE.txt', licenses.join('\n\n'), 'utf8');

console.log('woff2 檔:', copied, '| @font-face:', faces,
            '| 合计', (bytes / 1048576).toFixed(1), 'MB');
