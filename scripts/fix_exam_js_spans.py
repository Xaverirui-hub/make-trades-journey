#!/usr/bin/env python3
"""修復 JS 字串內被拆分腳本破壞的 span（2026-08-10 實災）。
拆分腳本不識別 JS 字串上下文，把 fb.innerHTML="..." 內的字串也拆成
<span class="en">/ <span class="zh">，去掉反斜杠轉義 → JS 語法錯誤 →
整個 EXAM script 不執行 → 所有課的題目消失。

修復：把 JS 字串內的 <span class="en">X</span><span class="zh">Y</span>
還原成中英混排 X Y（原始格式）。JS 字串內 CSS 語言切換不生效，
還原中英混排是正確行為（原本就是這樣）。

注意：只處理 <script> 區塊內、且前綴是引號/字串拼接的 span。
顯示層（HTML body）內的 span 不動。
"""
import re
import glob

# 模式：字串內 <span class="en">X</span><span class="zh">Y</span>
# 前面是 " 或 ' 或 + "（字串上下文）
# 處理 X 或 Y 可能含 JS 表達式（如 " + correct + "）
INLINE_PAIR = re.compile(
    r'<span class="en">([^<]*?)</span><span class="zh">([^<]*?)</span>'
)

# 需要上下文判斷：只修 script 區塊內的
def fix_script_block(block: str) -> tuple:
    count = 0
    def repl(m):
        nonlocal count
        en, zh = m.group(1), m.group(2)
        count += 1
        return en + ' ' + zh
    # 先處理純文字配對（✓ Correct 正确 這種）
    new_block = INLINE_PAIR.sub(repl, block)
    # 再處理含 JS 表達式的（" + correct + " 這種）
    # 模式：<span class="en">🎉 PASSED - " + correct + "/" + total + "</span><span class="zh">通过!</span>
    EXPR_PAIR = re.compile(
        r'<span class="en">([^<]*?"\s*\+\s*[^<]*?)</span><span class="zh">([^<]*?)</span>'
    )
    new_block2 = EXPR_PAIR.sub(lambda m: m.group(1) + m.group(2), new_block)
    return new_block2, count


def main():
    files = sorted(glob.glob("/tmp/mtj/MTJ-Hub/courses/*.html"))
    total_fixed = 0
    total_files = 0
    for f in files:
        html = open(f, encoding="utf-8").read()
        orig = html
        # 逐 script 區塊修
        def fix_scripts(m):
            return m.group(0)[0:0] + fix_script_block(m.group(1))[0]
        # 用 split 手動處理（避免 re.sub 的 backref 問題）
        parts = re.split(r'(<script[^>]*>)(.*?)(</script>)', html, flags=re.S)
        # parts: [pre, open_tag, body, close_tag, pre2, open2, body2, close2, ...]
        new_parts = []
        fixed_in_file = 0
        for i in range(0, len(parts), 4):
            if i + 3 <= len(parts):
                pre, open_tag, body, close_tag = parts[i:i+4]
                new_body, n = fix_script_block(body)
                new_parts.extend([pre, open_tag, new_body, close_tag])
                fixed_in_file += n
            else:
                new_parts.append(parts[i])
        new_html = ''.join(new_parts)
        if new_html != orig:
            open(f, "w", encoding="utf-8").write(new_html)
            total_files += 1
            total_fixed += fixed_in_file
            print(f"{f.split('/')[-1]}: 修 {fixed_in_file}")
    print(f"\nTOTAL: {total_files} 檔, {total_fixed} 處")


if __name__ == "__main__":
    main()
