/* Task 2:把全站导航栏抽成一支共用档。
   以前这段 HTML + CSS 在 32 个页面里各存一份,改一次要改 32 个文件 ——
   Phase 2 要加登录态 / 用户菜单 / 登出按钮,一定会撞上这点。

   前提已核实:31 个页面的导航结构与 CSS(含响应式 media 块)逐字节相同,
   backtest.html 是唯一例外,一并统一。 */
import fs from 'node:fs';
import path from 'node:path';

/* 从 git 里读基准页,不读工作区 —— 这支脚本跑完一次之后,工作区的
   about.html 就没有导航区块了,再读它会抓空。REF 指向抽取【之前】的提交。 */
import { execSync } from 'node:child_process';
const REF = process.env.NAV_REF || '84a5afc';   // 字体自架那次,导航尚未抽出
const src = execSync('git show ' + REF + ':MTJ-Hub/about.html', { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/* 1. 取 logo(标准页用的 JPEG 版) */
const navBlock = src.slice(src.indexOf('<nav class="navbar"'), src.indexOf('</nav>', src.indexOf('<nav class="navbar"')) + 6);
const LOGO = navBlock.match(/src="(data:image\/jpeg;base64,[^"]+)"/)[1];

/* 2. 取导航 CSS:17 条基础规则 + 1 个响应式 media 块 */
const mediaBlock = [...src.matchAll(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g)]
  .find(m => /\.navbar|\.nb-/.test(m[0]))[0];

/* 先把所有 @media 区块挖掉再抓基础规则 —— 否则响应式那几条(.navbar{flex-wrap:wrap}
   等)会被当成基础规则抓出来、无条件套用,桌面宽度下导航会直接跑成手机版两行。 */
const outsideMedia = src.replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, '');
const baseRules = [...outsideMedia.matchAll(/(^|\})\s*(\.navbar[^{]*|\.nb-[a-z-]+[^{]*)\{([^}]*)\}/gm)]
  .map(m => m[2].trim() + '{' + m[3].trim() + '}');
const CSS = baseRules.join('\n') + '\n' + mediaBlock;

console.log('logo', (LOGO.length / 1024).toFixed(0) + 'KB | CSS 规则', baseRules.length, '+ 1 media 块 |', CSS.length, '字符');

/* 3. 产生 assets/nav.js */
const navJs = `/* 全站共用导航栏 — 由 scripts/extract_nav.mjs 生成。
   以前这段 HTML + CSS 在 32 个页面里各存一份;要加登录态 / 用户菜单 /
   登出按钮,现在只改这一支。

   刻意用 classic <script>(没有 defer / async):它在解析到该位置时【同步】
   执行,导航在后面任何脚本跑之前就已经进 DOM。页面里的 scroll-spy 与
   admin 解锁都靠 getElementById('globalNav') 找它,顺序不能错。 */
(function () {
  var LOGO = '${LOGO}';

  var CSS = ${JSON.stringify(CSS)};

  /* 从自己的 src 反推站点根目录 —— 页面在第几层都不必改。
     用字符串切,不用正则:这支档是模板字符串产生的,正则的反斜杠会被吃掉一层。 */
  var me = document.currentScript;
  var ROOT = me.src.slice(0, me.src.lastIndexOf('assets/nav.js'));

  var ITEMS = [
    ['home',    'MakeTradesJourney.html#top', 'Home',            '首页'],
    ['courses', 'courses.html',               'Trading Courses', '交易课程'],
    ['ea',      'ea.html',                    'EA Courses',      'EA 课程'],
    ['tools',   'tools.html',                 'Tools',           '工具'],
    ['about',   'about.html',                 'About',           '关于']
  ];
  var SELF = { home:'MakeTradesJourney.html', courses:'courses.html',
               ea:'ea.html', tools:'tools.html', about:'about.html' };

  var pathn = location.pathname;
  var here  = pathn.slice(pathn.lastIndexOf('/') + 1) || 'MakeTradesJourney.html';

  /* 当前页归属哪一节 —— 课程内页归「交易课程」,工具内页归「工具」,
     backtest 是从 EA 课程链过去的,归「EA 课程」 */
  var inDir = function (d) { return pathn.indexOf('/' + d + '/') > -1; };
  var cur = (inDir('courses') || here === 'courses.html') ? 'courses'
          : (inDir('tools')   || here === 'tools.html')   ? 'tools'
          : (here === 'ea.html' || here === 'backtest.html') ? 'ea'
          : (here === 'about.html')                          ? 'about'
          : 'home';

  var links = ITEMS.map(function (it) {
    /* 指向自己时用 #top:与原本一致,scroll-spy 靠「href 以 # 开头」判断同页锚点 */
    var href = (SELF[it[0]] === here) ? '#top' : ROOT + it[1];
    return '<a href="' + href + '" data-sec="' + it[0] + '"' +
           (it[0] === cur ? ' class="active"' : '') +
           '>\u00b7 ' + it[2] + ' <span class="zh">\u00b7 ' + it[3] + '</span></a>';
  }).join('');

  var brand = (here === 'MakeTradesJourney.html') ? '#top' : ROOT + 'MakeTradesJourney.html#top';

  /* 样式插在 <head> 最前面:页面自己的样式仍然盖得过它,
     和原本写在页面 <style> 里的效果一致 */
  var st = document.createElement('style');
  st.setAttribute('data-mtj', 'nav');
  st.textContent = CSS;
  document.head.insertBefore(st, document.head.firstChild);

  me.insertAdjacentHTML('beforebegin',
    '<nav class="navbar" id="globalNav">' +
      '<a class="nb-brand" href="' + brand + '">' +
        '<img src="' + LOGO + '" alt="Make Trades Journey">' +
        '<span class="nb-name">Make Trades Journey</span>' +
      '</a>' +
      '<div class="nb-links">' + links + '</div>' +
      '<div class="nb-right"><div class="nb-lang">' +
        '<button id="langEn">EN</button>' +
        '<button id="langZh">\u4e2d</button>' +
      '</div></div>' +
    '</nav>');

  /* \u8bed\u8a00\u6309\u94ae\u63d2\u5165\u540e\u518d\u7ed1\u4e8b\u4ef6,\u4e0d\u5199\u884c\u5185 onclick \u2014\u2014 \u884c\u5185\u5199\u6cd5\u7684\u5f15\u53f7\u7ecf\u8fc7\u6a21\u677f
     \u5b57\u7b26\u4e32\u4f1a\u88ab\u5403\u6389\u4e00\u5c42\u3002setLang \u7531\u5404\u9875\u5b9a\u4e49\u5728\u540e\u9762,\u70b9\u4e0b\u53bb\u65f6\u65e9\u5c31\u5b58\u5728\u4e86\u3002 */
  document.getElementById('langEn').onclick = function () { window.setLang('en'); };
  document.getElementById('langZh').onclick = function () { window.setLang('zh'); };
})();
`;
fs.mkdirSync('MTJ-Hub/assets', { recursive: true });
fs.writeFileSync('MTJ-Hub/assets/nav.js', navJs, 'utf8');
console.log('已写 MTJ-Hub/assets/nav.js', (navJs.length / 1024).toFixed(0) + 'KB');
