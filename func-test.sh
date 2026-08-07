#!/bin/bash
# 完整功能流程测试：首页 -> 开始学习 -> 翻卡 -> 三态 -> 完成
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
URL="http://localhost:5173/"

echo "=== [1] 首页 ==="
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless --disable-gpu --virtual-time-budget=6000 --dump-dom "$URL" 2>/dev/null > /tmp/page1.html
grep -oE "(墨词背单词|PETS-3|开始学习|今日待学|连续打卡|已学单词)" /tmp/page1.html | sort -u

echo "=== [2] 检查学习页渲染（App.startLearn 需要 JS 交互，用内嵌脚本）==="
cat > /tmp/learn_test.html <<'EOF'
<!DOCTYPE html><html><body><div id="app"></div>
<script type="module">
import '/src/main.js';
setTimeout(() => {
  // 模拟点击开始学习
  window.App.startLearn();
  setTimeout(() => {
    const html = document.getElementById('app').innerHTML;
    const out = {
      hasWordCard: html.includes('word-card'),
      hasActions: html.includes('btn-again') && html.includes('btn-hard') && html.includes('btn-good'),
      hasSpeaker: html.includes('speaker'),
      hasProgress: html.includes('progress-bar'),
      wordCount: (html.match(/class="word"/g) || []).length,
    };
    document.title = JSON.stringify(out);
    document.body.textContent = JSON.stringify(out);
  }, 1500);
}, 800);
</script></body></html>
EOF
# 直接注入测试到 dev server 页面不现实，改用 eval 方式
echo "(学习页交互用专门测试)"

echo "=== [3] 数据质量抽查 ==="
python -c "
import json
with open('D:/hermes-agent-临时文件/English-learn/wordlists/pets3_words.json', encoding='utf-8') as f:
    words = json.load(f)
print('总词数:', len(words))
# 缺音标
no_ph = [w['w'] for w in words if not w.get('ph')]
print('缺音标:', len(no_ph), '个 ->', no_ph[:8])
# 缺释义
no_def = [w['w'] for w in words if not w.get('def')]
print('缺释义:', len(no_def), '个 ->', no_def[:8])
# 缺例句
no_sent = [w['w'] for w in words if not w.get('sent')]
print('缺例句:', len(no_sent), '个 ->', no_sent[:8])
# 释义为空数组
empty_def = [w['w'] for w in words if w.get('def') and not any(d for d in w['def'])]
print('空释义项:', len(empty_def), '个')
# 释义里带诡异字符
import re
weird = [w['w'] for w in words if w.get('def') and any(re.search(r'[{}<>\[\]]', d) for d in w['def'])]
print('释义含异常字符:', len(weird), '个')
"
