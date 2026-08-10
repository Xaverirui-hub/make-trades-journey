#!/usr/bin/env python3
"""課程子頁 agenda 卡跳轉 v4 — 三層匹配（覆蓋 22 課）
① article h3 前綴（精準）→ ② section h2 關鍵詞（Pairs→Reading a Quote? 不匹配，
   改用「卡標題第一個詞 vs section 內 article 標題包含」）→ ③ 順序 fallback
實際上用「關鍵詞打分」：卡標題的每個詞，在 article h3 / section h2 中出現越多分越高
"""
import re, glob

JS = """
<script>
/* agenda cards jump to matching article — keyword score (2026-08-10) */
(function(){
  var cards = document.querySelectorAll('.agenda .card');
  if(!cards.length) return;
  var arts = Array.prototype.slice.call(document.querySelectorAll('article'));
  cards.forEach(function(card){
    var h3 = card.querySelector('h3');
    if(!h3) return;
    var title = (h3.textContent || '').replace(/&amp;/g,'&').trim().toLowerCase();
    if(!title) return;
    var words = title.split(/[^a-z0-9]+/).filter(function(w){ return w.length > 2; });
    var tgt = null, best = 0;
    for(var i=0;i<arts.length;i++){
      var ah = arts[i].querySelector('h3');
      if(!ah) continue;
      var atxt = (ah.textContent || '').toLowerCase();
      var score = 0;
      for(var w=0;w<words.length;w++){ if(atxt.indexOf(words[w]) >= 0) score++; }
      if(score > best){ best = score; tgt = arts[i]; }
    }
    if(!tgt || best === 0) return;
    card.style.cursor = 'pointer';
    card.style.transition = '.3s';
    card.addEventListener('mouseenter', function(){ card.style.transform = 'translateY(-3px)'; card.style.borderColor = 'rgba(232,200,119,.5)'; });
    card.addEventListener('mouseleave', function(){ card.style.transform = 'none'; card.style.borderColor = ''; });
    card.addEventListener('click', function(){
      tgt.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
})();
</script>
"""

def process(path):
    html = open(path, encoding="utf-8").read()
    if '.agenda .card' not in html:
        return 0
    html = re.sub(r'<script>\s*/\* agenda cards jump to matching.*?</script>', '', html, flags=re.S)
    if 'agenda cards jump to matching article' in html:
        return 0
    if '</body>' in html:
        html = html.replace('</body>', JS + '</body>')
    else:
        html += JS
    open(path, "w", encoding="utf-8").write(html)
    return 1

files = glob.glob("/tmp/mtj/MTJ-Hub/courses/*.html")
n = 0
for f in files:
    n += process(f)
print(f"更新 {n} 課")
