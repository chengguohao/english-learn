// 分析脚本：统计缺少例句的情况
const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'pets3_words.json');

const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
console.log('总单词数:', data.length);

// 统计
let noSent = 0;          // 完全没有 sent
let lessThan3Types = 0;  // 例句类型不足3种
let allThreeTypes = 0;   // 已有3种类型
let noSentField = 0;     // 没有 sent 字段

const typeStats = { '日常': 0, '书面': 0, '职场': 0, '其他': 0 };
const missingTypeStats = { '日常': 0, '书面': 0, '职场': 0 };

// 词性分布
const posStats = {};

const sampleMissing = [];

for (let i = 0; i < data.length; i++) {
  const w = data[i];
  if (!w.sent || !Array.isArray(w.sent)) {
    noSentField++;
    noSent++;
    lessThan3Types++;
    if (sampleMissing.length < 10) sampleMissing.push({ i, w: w.w, def: w.def });
    continue;
  }

  if (w.sent.length === 0) {
    noSent++;
    lessThan3Types++;
    if (sampleMissing.length < 10) sampleMissing.push({ i, w: w.w, def: w.def });
    continue;
  }

  // 统计已有类型
  const types = new Set();
  for (const s of w.sent) {
    if (s && s.type) {
      types.add(s.type);
      if (s.type in typeStats) typeStats[s.type]++;
      else typeStats['其他']++;
    }
  }

  if (types.has('日常') && types.has('书面') && types.has('职场')) {
    allThreeTypes++;
  } else {
    lessThan3Types++;
    if (!types.has('日常')) missingTypeStats['日常']++;
    if (!types.has('书面')) missingTypeStats['书面']++;
    if (!types.has('职场')) missingTypeStats['职场']++;
  }

  // 词性统计
  if (w.def && Array.isArray(w.def)) {
    for (const d of w.def) {
      const m = d.match(/^(\w+)/);
      if (m) {
        const pos = m[1];
        posStats[pos] = (posStats[pos] || 0) + 1;
      }
    }
  }
}

console.log('\n=== 缺例句统计 ===');
console.log('没有 sent 字段:', noSentField);
console.log('完全没例句(sent为空/不存在):', noSent);
console.log('例句类型不足3种:', lessThan3Types);
console.log('已有3种类型:', allThreeTypes);

console.log('\n=== 已有例句类型分布 ===');
console.log(typeStats);

console.log('\n=== 缺失类型统计 ===');
console.log(missingTypeStats);

console.log('\n=== 词性分布(前15) ===');
const posArr = Object.entries(posStats).sort((a, b) => b[1] - a[1]);
for (let i = 0; i < Math.min(15, posArr.length); i++) {
  console.log(posArr[i][0], ':', posArr[i][1]);
}

console.log('\n=== 缺例句单词样例 ===');
for (const s of sampleMissing) {
  console.log(JSON.stringify(s));
}

// 查看几个有例句的样本，了解格式
console.log('\n=== 有例句样本(前3个有sent的) ===');
let cnt = 0;
for (const w of data) {
  if (w.sent && w.sent.length > 0) {
    console.log(JSON.stringify(w));
    cnt++;
    if (cnt >= 3) break;
  }
}
