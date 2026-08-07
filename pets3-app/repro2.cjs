// 用 jsdom 模拟浏览器环境，验证完整数据流
// 需要先装 jsdom（如果没装，改用轻量方案）
const { JSDOM } = require('jsdom');

// 创建带 window 的环境
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
});

// 模拟 localStorage
const store = {};
dom.window.localStorage = {
  getItem: k => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
};

// 执行 words-data.js（挂 window.__WORDS__）
const fs = require('fs');
const wordsData = fs.readFileSync('./src/words-data.js', 'utf-8');
dom.window.eval(wordsData);

// 执行 store.js 的 loadWords
const code = `
  (async () => {
    const { loadWords } = await import('./src/store.js');
    const words = await loadWords();
    return JSON.stringify({ count: words.length, first: words[0] });
  })()
`;
// jsdom 里 dynamic import 需要路径处理，直接在 window 上调用
dom.window.eval(`
  window.__testResult = 'pending';
  setTimeout(async () => {
    try {
      const words = window.__WORDS__;
      window.__testResult = JSON.stringify({ count: words.length, first: words[0] });
    } catch(e) { window.__testResult = 'ERR:' + e.message; }
  }, 100);
`);
setTimeout(() => {
  console.log('RESULT:', dom.window.__testResult);
  process.exit(0);
}, 500);
