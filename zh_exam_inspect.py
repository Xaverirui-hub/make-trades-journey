#!/usr/bin/env python3
"""MTJ 考試題目中文化 — 安全做法:
對 EXAM_QUESTIONS 陣列內每個物件, 在 "q" 後加 "q_zh", 在 "opts" 陣列後加 "opts_zh"。
用正規表達式精確匹配題目物件, 不碰 gradeExam 等其他代碼。"""
import re, json, sys, subprocess

path = sys.argv[1]
html = open(path, encoding='utf-8', errors='ignore').read()
assert html.count('<!DOCTYPE') == 1 and html.count('</html>') == 1

# 找 EXAM_QUESTIONS 定義區段(從 const EXAM_QUESTIONS = 到該 script 的 ;)
scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
exam_script = None
for s in scripts:
    if 'EXAM_QUESTIONS' in s and 'renderExam' in s:
        exam_script = s
        break
assert exam_script, "exam script not found"

# 逐題物件匹配: {q:"...", opts:[...], ans:N, why:"...", why_zh:"..."}
# 用正規表達式找每個 {q: 開頭到 }, 結尾
pattern = re.compile(r'(\{[^{}]*?"q":\s*"[^"]*"[^{}]*?\})', re.S)
questions = pattern.findall(exam_script)
print(f"找到 {len(questions)} 題")

# 檢查是否已有 q_zh(避免重複處理)
if 'q_zh' in exam_script:
    print("⚠️ 已含 q_zh, 跳過(先確認)")
    sys.exit(0)

# 對每題: 解析 q 和 opts, 生成中文
# 中文翻譯表由調用方傳入(否則用 q 的內容判斷)
for i, qobj in enumerate(questions):
    m_q = re.search(r'"q":\s*"([^"]*)"', qobj)
    m_opts = re.search(r'"opts":\s*(\[[^\]]*\])', qobj)
    if not m_q or not m_opts:
        print(f"⚠️ 題 {i+1} 解析失敗, 跳過")
        continue
    q_en = m_q.group(1)
    opts_en = json.loads(m_opts.group(1))
    print(f"題 {i+1}: {q_en[:50]} | opts: {len(opts_en)}")

print("\n⚠️ 需要人工提供中文翻譯。請用 add_qzh.py 的 --translate 模式。")
