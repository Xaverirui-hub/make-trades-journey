/* 三门新课插入之后,显示用的课号又散了 —— 中英两半各被改过一次但基准不同,
   有的只改了中文、有的两边都错(MACD 英文写 20、中文写 17,正确是 15)。

   和上次一样:不逐处补,全部从【唯一权威】重新生成 —— 权威是各页
   MTJ_EXAM_KEY 的顺序,那个已经验证过 1..25 唯一齐全。 */
import fs from 'node:fs';
import path from 'node:path';

const dir = 'MTJ-Hub/courses';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

/* 按 exam key 排出真实顺序 */
const order = files.map(f => {
  const s = fs.readFileSync(path.join(dir, f), 'utf8');
  const k = +(s.match(/MTJ_EXAM_KEY\s*=\s*"mtj_exam_pass_(\d+)"/) || [])[1];
  return { f, k, s };
}).sort((a, b) => a.k - b.k);

const LAST_TRADING = 24;            // 25 是 EA 课,不在交易线里
const pad = n => String(n).padStart(2, '0');
const log = [];

for (const it of order) {
  const N = it.k, NEXT = N + 1;
  let s = it.s;
  const before = s;
  const hits = [];

  /* ① course-tag 里出现的课号一律等于本课号 */
  s = s.replace(/<div class="course-tag">([\s\S]*?)<\/div>/, (m, inner) => {
    const fixed = inner
      .replace(/\bModule\s*0*\d+/g, 'Module ' + pad(N))
      .replace(/\bMODULE\s*0*\d+/g, 'MODULE ' + pad(N))
      .replace(/模块\s*0*\d+/g, '模块 ' + pad(N))
      .replace(/第\s*0*\d+\s*课/g, '第 ' + N + ' 课');
    if (fixed !== inner) hits.push('tag');
    return '<div class="course-tag">' + fixed + '</div>';
  });

  /* ② 考试标题 + ③ 下一课文案:承诺的是【下一课】 */
  const isLast = N >= LAST_TRADING;
  const b2 = s;
  if (!isLast) {
    s = s.replace(/Unlock Module\s*0*\d+/g, 'Unlock Module ' + pad(NEXT));
    s = s.replace(/解锁\s*Module\s*0*\d+/g, '解锁 Module ' + pad(NEXT));
    s = s.replace(/Module\s*0*\d+\s*is unlocked/g, 'Module ' + pad(NEXT) + ' is unlocked');
    s = s.replace(/模块\s*0*\d+\s*已解锁/g, '模块 ' + pad(NEXT) + ' 已解锁');
  }
  if (s !== b2) hits.push('unlock');

  /* ④ 源码注释,免得下一个人被误导 */
  const b3 = s;
  s = s.replace(/MTJ EXAM MODULE - Module\s*0*\d+/g, 'MTJ EXAM MODULE - Module ' + pad(N));
  if (s !== b3) hits.push('comment');

  if (s !== before) {
    fs.writeFileSync(path.join(dir, it.f), s, 'utf8');
    log.push(pad(N) + ' ' + it.f.replace('_MakeTradesJourney.html', '') + '  [' + hits.join(', ') + ']');
  }
}
console.log(log.join('\n') || '(无改动)');
console.log('\n改动文件数:', log.length);
