#!/bin/bash
# 进入学习页验证单词显示（修复 undefined 后必须能看到真实单词）
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
URL="http://localhost:5173/"

# 用 CDP 风格：headless + dump-dom 但先跑 JS 触发 startLearn
cat > /tmp/learn_probe.html <<'EOF'
<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<div id="app"></div>
<script type="module">
import '/src/main.js';
// 等待 app 初始化完成
setTimeout(() => {
  try {
    window.App.startLearn();
    setTimeout(() => {
      const html = document.getElementById('app').innerHTML;
      // 提取单词卡片内容
      const wordMatch = html.match(/class="word">([^<]+)<\/div>/);
      const hasButtons = html.includes('btn-again') && html.includes('btn-hard') && html.includes('btn-good');
      const hasSpeaker = html.includes('speaker');
      const hasMeaning = html.includes('meaning');
      const result = {
        word: wordMatch ? wordMatch[1] : 'UNDEFINED!',
        hasButtons,
        hasSpeaker,
        hasMeaning,
        queueLen: (html.match(/progress/) ? 'yes' : 'no'),
      };
      document.body.setAttribute('data-result', JSON.stringify(result));
      document.body.textContent = 'RESULT: ' + JSON.stringify(result);
    }, 1200);
  } catch(e) {
    document.body.textContent = 'ERROR: ' + e.message;
  }
}, 600);
</script></body></html>
EOF
echo "=== 学习页验证 ==="
"$EDGE" --headless --disable-gpu --virtual-time-budget=6000 --dump-dom "http://localhost:5173/learn-probe.html" 2>/dev/null | grep -oE "RESULT: [^<]*|ERROR: [^<]*" | head -3
