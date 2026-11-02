/* Minimal static file server for local preview.
   ES modules and CDN imports need a real http origin; the file:// and
   data: sandboxes both break relative module resolution. */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = process.argv[2] || process.cwd();
/* 第三个参数可指定 port —— 好同时开第二个站(例如另一个 repo 的预览) */
const PORT = Number(process.argv[3]) || Number(process.env.PORT) || 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp'
};

/* 站台根目录的 _headers 由 Cloudflare Pages 解读。本机预览也读同一份 ——
   不然 CSP 这种只在正式站生效的东西,要等上线才发现挡错了。
   格式:一行路径样式,底下缩排的 Name: value,空行分隔。只支援尾端 * 的
   前缀比对,Cloudflare 的 :placeholder 没用到就不实作。 */
async function loadHeaderRules() {
  let text;
  try { text = await readFile(join(ROOT, '_headers'), 'utf8'); }
  catch { return []; }
  const rules = [];
  let cur = null;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    if (/^\s/.test(raw)) {
      const i = raw.indexOf(':');
      if (cur && i > 0) cur.headers.push([raw.slice(0, i).trim(), raw.slice(i + 1).trim()]);
    } else {
      cur = { pattern: raw.trim(), headers: [] };
      rules.push(cur);
    }
  }
  return rules;
}
const HEADER_RULES = await loadHeaderRules();
function headersFor(pathname) {
  const out = {};
  for (const r of HEADER_RULES) {
    const p = r.pattern;
    const hit = p.endsWith('*') ? pathname.startsWith(p.slice(0, -1)) : pathname === p;
    if (hit) for (const [k, v] of r.headers) out[k] = v;
  }
  return out;
}

createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const filePath = join(ROOT, normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
    const info = await stat(filePath);
    const target = info.isDirectory() ? join(filePath, 'index.html') : filePath;
    const body = await readFile(target);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(target).toLowerCase()] || 'application/octet-stream',
      ...headersFor(pathname),
      /* 预览永远不快取:_headers 给字体与 vendor 的一年期快取会让本机改档看不到效果 */
      'Cache-Control': 'no-store'
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404');
  }
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
