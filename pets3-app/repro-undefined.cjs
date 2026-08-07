// 复现 undefined：模拟 main.js 的完整数据流
const words = require('./src/words-data.js'); // 这会执行 window 赋值，Node 里不行
// 改为直接读 JSON
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('../wordlists/pets3_words.json', 'utf-8'));
console.log('JSON 词条数:', data.length);
console.log('第一条:', JSON.stringify(data[0]).slice(0, 120));

// 模拟 main.js 的查找
const wordData = data.find(w => w.w === 'a');
console.log('find("a") ->', wordData ? JSON.stringify(wordData).slice(0, 80) : 'NOT FOUND');

// 模拟 buildQueue 里用 w.word
const { buildQueue } = require('./src/srs.js');
const q = buildQueue({}, data, 3);
console.log('queue 前3个:', q.queue.slice(0, 3).map(x => JSON.stringify(x)));
