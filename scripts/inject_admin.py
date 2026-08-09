#!/usr/bin/env python3
"""全站 admin 模式注入器 — 所有頁面（主頁/課程/工具）共用 admin 解鎖。

機制:
  1. URL ?admin=xrs2026 → localStorage.mtj_admin=1 → 去掉參數（乾淨 URL）
  2. localStorage.mtj_admin=1 → 全站解鎖:
     - 隱藏所有 .comingSoon / #comingSoon 遮罩
     - 課程卡解除鎖定（opacity/pointer-events 恢復 + 🔒 移除）
     - 考試直接通過（mtj_exam_pass_N 全寫 1）
     - 顯示 ADMIN VIEW badge

用法: python3 inject_admin.py <repo根>
"""
import re, glob, sys

KEY = "xrs2026"

ADMIN_JS = """<script>
/* ===== MTJ Global Admin Mode ===== */
(function(){
  var KEY = "xrs2026";
  var STORE = "mtj_admin";
  try{
    /* 1. URL 參數登入 */
    var p = new URLSearchParams(window.location.search);
    if(p.get("admin") === KEY){
      localStorage.setItem(STORE, "1");
      p.delete("admin");
      var q = p.toString();
      window.location.replace(window.location.pathname + (q ? "?" + q : ""));
      return;
    }
    /* 2. 已登入狀態 → 全站解鎖 */
    if(localStorage.getItem(STORE) === "1"){
      /* 隱藏所有遮罩 */
      document.querySelectorAll(".comingSoon, #comingSoon, [id*='comingSoon'], .memberGate, #memberGate").forEach(function(el){
        el.style.display = "none";
      });
      /* 恢復 navbar（Composer 訪客隱藏, admin 顯示） */
      var gn = document.getElementById("globalNav");
      if(gn){ gn.style.display = "flex"; }
      /* 課程卡解除鎖定 */
      document.querySelectorAll("a.mod, .mod, .locked, [class*='lock']").forEach(function(el){
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
        el.classList.remove("locked");
      });
      /* 考試直接通過（讀頁面的 MTJ_EXAM_KEY 或猜 key） */
      try{
        if(typeof MTJ_EXAM_KEY !== "undefined" && MTJ_EXAM_KEY){ localStorage.setItem(MTJ_EXAM_KEY, "1"); }
        else{
          var m = window.location.pathname.match(/Module_(\d+)_/i) || window.location.pathname.match(/_M(\d+)_/i);
          if(m){ localStorage.setItem("mtj_exam_pass_" + m[1], "1"); }
        }
      }catch(e){}
      /* ADMIN VIEW badge */
      var b = document.createElement("div");
      b.style.cssText = "position:fixed;bottom:14px;right:14px;z-index:999;background:rgba(232,180,74,.15);border:1px solid rgba(232,180,74,.5);color:#E8B44A;border-radius:20px;padding:5px 14px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;";
      b.textContent = "ADMIN VIEW · 全站管理員";
      document.body.appendChild(b);
    }
  }catch(e){}
})();
</script>
"""

def inject(fpath):
    s = open(fpath, encoding="utf-8").read()
    if "MTJ Global Admin Mode" in s:
        return "skip"
    # 在 </body> 前插入（保留原 admin 解鎖，追加全站版）
    if "</body>" in s:
        s = s.replace("</body>", ADMIN_JS + "</body>", 1)
    else:
        s += ADMIN_JS
    open(fpath, "w", encoding="utf-8").write(s)
    return "ok"

if __name__ == "__main__":
    root = sys.argv[1] if len(sys.argv) > 1 else "/tmp/mtj"
    files = ([root + "/MTJ-Hub/MakeTradesJourney.html"]
             + glob.glob(root + "/MTJ-Hub/courses/*.html")
             + glob.glob(root + "/MTJ-Hub/tools/*.html"))
    ok = skip = 0
    for f in files:
        r = inject(f)
        if r == "ok": ok += 1
        else: skip += 1
    print(f"完成: ok={ok} skip={skip} 總數={len(files)}")
