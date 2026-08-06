#!/usr/bin/env python3
"""診斷2: 看 HTML 中 EXAM_QUESTIONS 的實際文字格式"""
import re

html = open('MTJ-Hub/courses/Three_Types_of_Analysis_MakeTradesJourney.html', encoding='utf-8', errors='ignore').read()
scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
for i, s in enumerate(scripts):
    if 'EXAM_QUESTIONS' in s:
        print(f"script {i}:")
        idx = s.find('EXAM_QUESTIONS')
        print(s[idx:idx+600])
        break
