import './style.css';
import './words-data.js';
import { loadWords, loadState, saveState, loadSettings, saveSettings, addHistory } from './store.js';
import { review, buildQueue, streakDays, calendarData, todayStr, DAY } from './srs.js';
import { speak, ONLINE_VOICES, setOnlineVoice, getOnlineVoice } from './tts.js';
import { ensurePermission, setDailyReminder } from './notify.js';
import { ROOTS } from './roots-data.js';
import { PHRASES } from './phrases-data.js';

// ====== 全局状态 ======
let WORDS = [];
let shuffledWords = []; // 打乱后的词库（与单词本一致的学习顺序）
let state = { cards: {}, history: {} };
let settings = loadSettings();
// 初始化在线语音选择（验证语音 ID 是否有效，清除旧的失效 ID）
if (settings.onlineVoice && ONLINE_VOICES.some(v => v.id === settings.onlineVoice)) {
  setOnlineVoice(settings.onlineVoice);
} else if (settings.onlineVoice) {
  settings.onlineVoice = '';
  saveSettings(settings);
}
let currentView = 'home';
let prevView = 'home'; // 后退导航用
let queue = [];
let queueIndex = 0;
let sessionNew = 0;
let sessionReview = 0;
let showMeaning = true; // 进入页面直接显示释义
// 拼写模式状态
let spellInput = '';
let spellChecked = false;
let spellCorrect = false;
// 点"认识"后的拼写状态
let postSpellActive = false;
let postSpellInput = '';
let postSpellChecked = false;
let postSpellCorrect = false;
let currentRated = false; // 当前单词是否已评分（控制后退按钮行为）
// 生活短语页面
let phraseIndex = 0;
// 错词本复习状态
let drillActive = false;
let drillQueue = [];
let drillIndex = 0;
let drillShowMeaning = true; // 复习页直接显示释义
let drillStats = { again: 0, hard: 0, good: 0 };
// 已学单词页面状态
let learnedWordsFilter = 'today';
// 词根词缀状态
let rootFilter = 'all';

const $ = (sel) => document.querySelector(sel);
const app = $('#app');

// ====== 初始化 ======
async function init() {
  WORDS = await loadWords();
  shuffledWords = initShuffledWords(WORDS);
  state = loadState();
  settings = loadSettings();
  applyTheme();
  render();
  // 预加载语音列表
  if (window.speechSynthesis) window.speechSynthesis.getVoices();
}

/** 初始化打乱词库顺序（持久化到 localStorage，保证每次一致） */
function initShuffledWords(words) {
  const SHUFFLE_KEY = 'pets3_shuffle_v1';
  if (!words.length) return [];
  try {
    const stored = localStorage.getItem(SHUFFLE_KEY);
    if (stored) {
      const order = JSON.parse(stored);
      if (Array.isArray(order) && order.length === words.length) {
        return order.map(i => words[i]).filter(Boolean);
      }
    }
  } catch (e) { /* ignore */ }
  // Fisher-Yates 打乱
  const indices = words.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  try { localStorage.setItem(SHUFFLE_KEY, JSON.stringify(indices)); } catch (e) { /* ignore */ }
  return indices.map(i => words[i]);
}

/** 查找单词关联的词根词缀 */
function findRootsForWord(word) {
  const w = word.toLowerCase();
  return ROOTS.filter(r => r.words.some(rw => rw.toLowerCase() === w));
}

// ====== 路由 ======
function navigate(view) {
  prevView = currentView;
  currentView = view;
  render();
}

/** 后退到上一页面 */
function goBack() {
  // 学习页面：处理拼写中间状态
  if (currentView === 'learn') {
    if (postSpellActive && !postSpellChecked) {
      // 拼写输入阶段：取消拼写，回到卡片状态，重置评分
      postSpellActive = false;
      currentRated = false;
      renderLearn();
      return;
    }
    if (postSpellActive && postSpellChecked) {
      // 拼写结果阶段：前进到下一个单词
      advanceQueue();
      return;
    }
  }
  // 正常后退
  currentView = prevView || 'home';
  prevView = 'home';
  render();
}

// ====== 主渲染 ======
function render() {
  switch (currentView) {
    case 'home': renderHome(); break;
    case 'learn': renderLearn(); break;
    case 'wordbook': renderWordbook(); break;
    case 'mistakes': renderMistakes(); break;
    case 'stats': renderStats(); break;
    case 'settings': renderSettings(); break;
    case 'roots': renderRoots(); break;
    case 'plan': renderPlan(); break;
    case 'learned-words': renderLearnedWords(); break;
    case 'phrases': renderPhrases(); break;
    case 'tts-test': renderTTSTest(); break;
  }
}

// ====== 首页 ======
function renderHome() {
  const q = buildQueue(state.cards, shuffledWords, settings.newPerDay);
  const todayLearned = state.history[todayStr()] || 0;
  const totalLearned = Object.keys(state.cards).length;
  const streak = streakDays(state.history);
  const pending = q.queue.length;
  const mistakeCount = Object.values(state.cards).filter(c => (c.lapses || 0) > 0).length;

  app.innerHTML = `
    <div class="topbar">
      <div></div>
      <div class="title">我想背单词</div>
      <button class="btn" onclick="App.nav('settings')">⚙️</button>
    </div>
    <div class="page">
      <div class="home-header">
        <div class="slogan">公共英语三级 · PETS-3 词汇 ${WORDS.length} 词</div>
      </div>

      <div class="stats-card">
        <div class="stats-row">
          <div class="stat-item"><div class="num">${streak}</div><div class="label">连续打卡</div></div>
          <div class="stat-item" style="cursor:pointer" onclick="App.navLearnedWords('today')"><div class="num">${totalLearned}</div><div class="label">已学单词</div></div>
          <div class="stat-item" style="cursor:pointer" onclick="App.nav('mistakes')"><div class="num" style="color:var(--red)">${mistakeCount}</div><div class="label">错词</div></div>
        </div>
      </div>

      <div class="today-card ${pending === 0 ? 'completed' : ''}">
        <div class="date">${new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</div>
        <div class="count">${pending}</div>
        <div class="hint">${pending === 0 ? '今日任务已完成 🎉' : `今日待学：新词 ${q.newCount} · 复习 ${q.reviewCount}`}</div>
        <button class="start-btn" onclick="App.startLearn()">${pending === 0 ? '回顾一下' : '开始学习'}</button>
      </div>

      <div class="quick-actions">
        <div class="quick-btn" onclick="App.nav('phrases')">
          <div class="icon">✨</div><div class="name">生活短语</div><div class="desc">每日一句 · 赏心悦目</div>
        </div>
        <div class="quick-btn" onclick="App.nav('roots')">
          <div class="icon">🧩</div><div class="name">词根词缀</div><div class="desc">构词法拆解</div>
        </div>
        <div class="quick-btn" onclick="App.nav('plan')">
          <div class="icon">🎯</div><div class="name">学习计划</div><div class="desc">设定目标 · 进度</div>
        </div>
        <div class="quick-btn" onclick="App.nav('wordbook')">
          <div class="icon">📖</div><div class="name">单词本</div><div class="desc">全部 ${WORDS.length} 词</div>
        </div>
        <div class="quick-btn" onclick="App.nav('stats')">
          <div class="icon">📊</div><div class="name">学习统计</div><div class="desc">打卡 · 记忆持久度</div>
        </div>
        <div class="quick-btn" onclick="App.nav('mistakes')">
          <div class="icon">📝</div><div class="name">错词本</div><div class="desc">${mistakeCount} 个错词</div>
        </div>
      </div>
    </div>
    ${bottomNav('home')}
  `;
}

// ====== 学习页 ======
function renderLearn() {
  if (!queue.length || queueIndex >= queue.length) {
    // 队列完成
    renderLearnDone();
    return;
  }
  const item = queue[queueIndex];
  const wordData = WORDS.find(w => w.w === item.word) || { w: item.word, def: [], ph: '' };
  const progress = Math.round((queueIndex / queue.length) * 100);
  const mode = settings.learnMode || 'enzh';
  const modeLabel = mode === 'spell' ? '中英拼写' : mode === 'listen' ? '听音拼写' : '英中';

  app.innerHTML = `
    <div class="topbar">
      <button class="btn" onclick="App.goBack()">←</button>
      <div class="title">学习</div>
      <button class="btn" onclick="App.nav('home')">✕</button>
    </div>
    <div class="learn-top">
      <span>${modeLabel} · ${item.type === 'new' ? '新词' : '复习'}</span>
      <div class="progress">
        <span>${queueIndex + 1}/${queue.length}</span>
        <div class="progress-bar"><div class="fill" style="width:${progress}%"></div></div>
      </div>
    </div>
    ${postSpellActive ? renderPostSpell(wordData) : (mode === 'spell' || mode === 'listen' ? renderSpellCard(wordData, mode === 'listen') : renderEnzhCard(wordData))}
  `;

  // 拼写模式自动聚焦输入框
  if ((mode === 'spell' || mode === 'listen') && !spellChecked) {
    const inp = document.querySelector('#spell-input');
    if (inp) inp.focus();
  }
  // 认识后拼写自动聚焦
  if (postSpellActive && !postSpellChecked) {
    const inp = document.querySelector('#post-spell-input');
    if (inp) inp.focus();
  }
}

// 英中模式卡片（释义始终显示，点击英语例句可朗读）
function renderEnzhCard(wordData) {
  const roots = findRootsForWord(wordData.w);
  const family = getWordFamily(wordData.w);
  return `
    <div class="card-wrap">
      <div class="word-card compact">
        <div class="word-row">
          <div class="word">${wordData.w}</div>
          <button class="speaker-inline" onclick="App.speakWord('${wordData.w}')">🔊</button>
        </div>
        ${settings.showPhonetic && wordData.ph ? `<div class="phonetic">/${wordData.ph}/</div>` : ''}
        <div class="meaning show">
          ${renderDefs(wordData.def)}
          ${renderExamples(wordData)}
        </div>
        ${roots.length ? renderRootsInfo(roots) : ''}
        ${family.length ? renderWordFamily(family) : ''}
      </div>
    </div>
    <div class="actions">
      ${currentRated
        ? `<button class="btn-good" style="flex:1" onclick="App.advanceAfterPostSpell()">下一个</button>`
        : `<button class="btn-good" onclick="App.answer('good')">认识</button>
           <button class="btn-hard" onclick="App.answer('hard')">不确定</button>
           <button class="btn-again" onclick="App.answer('again')">不认识</button>`
      }
    </div>`;
}

// 拼写模式卡片（中英拼写 / 听音拼写）
function renderSpellCard(wordData, isListen) {
  const defs = (wordData.def && wordData.def.length) ? wordData.def : ['（暂无释义）'];
  const promptHTML = isListen
    ? `<div class="spell-prompt">🔊 听音拼写</div>
       <button class="speaker big" onclick="App.speakWord('${wordData.w}')">🔊 播放</button>`
    : `<div class="spell-def">${defs.map(d => `<span>${d}</span>`).join('<br>')}</div>`;

  if (!spellChecked) {
    // 输入阶段
    return `
      <div class="card-wrap">
        <div class="word-card spell-card">
          ${promptHTML}
          <input id="spell-input" class="spell-input" autocomplete="off" autocorrect="off"
                 autocapitalize="off" spellcheck="false" placeholder="输入拼写"
                 value="${escapeAttr(spellInput)}"
                 oninput="App.onSpellInput(this.value)"
                 onkeydown="if(event.key==='Enter'){App.submitSpell()}" />
          <button class="spell-submit" onclick="App.submitSpell()">确认</button>
        </div>
      </div>
      <div class="actions">
        <button class="btn-again" style="flex:1" onclick="App.skipSpell()">跳过</button>
      </div>`;
  }

  // 已确认：显示结果 + 三态按钮
  const resultHTML = spellCorrect
    ? `<div class="spell-result ok">✓ 拼写正确</div>`
    : `<div class="spell-result bad">✗ 正确答案：${wordData.w}</div>`;
  return `
    <div class="card-wrap">
      <div class="word-card spell-card checked ${spellCorrect ? '' : 'wrong'}">
        ${resultHTML}
        <div class="word">${wordData.w}</div>
        ${settings.showPhonetic && wordData.ph ? `<div class="phonetic">/${wordData.ph}/</div>` : ''}
        <button class="speaker" onclick="App.speakWord('${wordData.w}')">🔊</button>
        <div class="meaning show">
          ${renderDefs(wordData.def)}
          ${renderExamples(wordData)}
        </div>
      </div>
    </div>
    <div class="actions">
      ${currentRated
        ? `<button class="btn-good" style="flex:1" onclick="App.advanceAfterPostSpell()">下一个</button>`
        : `<button class="btn-good" onclick="App.answer('good')">认识</button>
           <button class="btn-hard" onclick="App.answer('hard')">不确定</button>
           <button class="btn-again" onclick="App.answer('again')">不认识</button>`
      }
    </div>`;
}

function escapeAttr(s) {
  return String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** 点"认识"后的拼写确认卡片 */
function renderPostSpell(wordData) {
  if (!postSpellChecked) {
    return `
      <div class="card-wrap">
        <div class="word-card spell-card post-spell-card">
          <div class="spell-prompt">✓ 认识！请拼写一遍</div>
          <div class="word">${wordData.w}</div>
          ${settings.showPhonetic && wordData.ph ? `<div class="phonetic">/${wordData.ph}/</div>` : ''}
          <button class="speaker" onclick="App.speakWord('${wordData.w}')">🔊</button>
          <input id="post-spell-input" class="spell-input" autocomplete="off" autocorrect="off"
                 autocapitalize="off" spellcheck="false" placeholder="输入拼写"
                 value="${escapeAttr(postSpellInput)}"
                 oninput="App.onPostSpellInput(this.value)"
                 onkeydown="if(event.key==='Enter'){App.submitPostSpell()}" />
          <button class="spell-submit" onclick="App.submitPostSpell()">确认</button>
        </div>
      </div>
      <div class="actions">
        <button class="btn-again" style="flex:1" onclick="App.skipPostSpell()">跳过</button>
      </div>`;
  }
  // 拼写完成，显示结果并进入下一个
  const resultHTML = postSpellCorrect
    ? `<div class="spell-result ok">✓ 拼写正确</div>`
    : `<div class="spell-result bad">✗ 正确答案：${wordData.w}</div>`;
  return `
    <div class="card-wrap">
      <div class="word-card spell-card checked ${postSpellCorrect ? '' : 'wrong'}">
        ${resultHTML}
        <div class="word">${wordData.w}</div>
        ${settings.showPhonetic && wordData.ph ? `<div class="phonetic">/${wordData.ph}/</div>` : ''}
        <button class="speaker" onclick="App.speakWord('${wordData.w}')">🔊</button>
        <div class="meaning show">
          ${renderDefs(wordData.def)}
          ${renderExamples(wordData)}
        </div>
      </div>
    </div>
    <div class="actions">
      <button class="btn-good" style="flex:1" onclick="App.advanceAfterPostSpell()">下一个</button>
    </div>`;
}

function renderDefs(defs) {
  if (!defs || !defs.length) return '<div class="def">—</div>';
  return `<div class="def">${defs.map(d => `<span class="pos">${d}</span>`).join('<br>')}</div>`;
}

function renderExamples(wordData) {
  if (!wordData.sent || !wordData.sent.length) return '';
  const word = wordData.w;
  const typeLabels = { '日常': '日常生活', '书面': '书面用语', '职场': '职场用语' };
  const typeOrder = ['日常', '书面', '职场'];
  // 优先选取不同类型的例句，不足3种时按原顺序补齐
  const picked = [];
  const remaining = [...wordData.sent];
  for (const t of typeOrder) {
    const idx = remaining.findIndex(s => s.type === t);
    if (idx >= 0) { picked.push(remaining.splice(idx, 1)[0]); }
  }
  while (picked.length < 3 && remaining.length) picked.push(remaining.shift());
  return picked.slice(0, 3).map(sent => `
    <div class="example">
      ${sent.type ? `<span class="ex-type ${sent.type}">${typeLabels[sent.type] || sent.type}</span>` : ''}
      <span class="en" onclick="App.speakSentence('${sent.en.replace(/'/g, "\\'")}')">${highlightWord(sent.en, word)}</span>
      <span class="cn">${sent.cn}</span>
    </div>
  `).join('');
}

/** 渲染词根词缀信息（学习卡片内嵌，按类型分组换行显示） */
function renderRootsInfo(roots) {
  const groups = { prefix: [], root: [], suffix: [] };
  roots.forEach(r => {
    const t = groups[r.type] || (groups[r.type] = []);
    t.push(r);
  });
  const typeLabels = { prefix: '前缀', root: '词根', suffix: '后缀' };
  const typeOrder = ['prefix', 'root', 'suffix'];
  return `
    <div class="word-roots-info">
      <div class="wri-title">🔗 词根词缀</div>
      ${typeOrder.filter(t => groups[t] && groups[t].length).map(t => `
        <div class="wri-group">
          <div class="wri-group-label">${typeLabels[t]}</div>
          ${groups[t].map(r => `
            <div class="wri-item">
              <span class="wri-root ${t}">${r.root}</span>
              <span class="wri-meaning">${r.meaning}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

/** 获取同词族单词（通过词根数据 + 前缀匹配） */
function getWordFamily(word) {
  const family = [];
  const seen = new Set([word.toLowerCase()]);
  // 1. 从词根数据查找同词根单词
  for (const r of ROOTS) {
    if (r.words.some(w => w.toLowerCase() === word.toLowerCase())) {
      for (const w of r.words) {
        if (!seen.has(w.toLowerCase())) {
          const wd = WORDS.find(x => x.w.toLowerCase() === w.toLowerCase());
          if (wd) { seen.add(wd.w.toLowerCase()); family.push(wd); }
        }
      }
    }
  }
  // 2. 前缀匹配补充（取前4个字母）
  if (family.length < 6 && word.length >= 4) {
    const prefix = word.toLowerCase().substring(0, 4);
    for (const wd of WORDS) {
      if (family.length >= 6) break;
      const wl = wd.w.toLowerCase();
      if (!seen.has(wl) && wl.startsWith(prefix) && wd.w !== word) {
        // 排除长度差异过大的匹配
        if (Math.abs(wd.w.length - word.length) <= 5 && wd.w.length >= 3) {
          seen.add(wl);
          family.push(wd);
        }
      }
    }
  }
  return family.slice(0, 6);
}

/** 渲染扩展词族 */
function renderWordFamily(family) {
  return `
    <div class="word-family">
      <div class="wf-title">📚 相关单词</div>
      ${family.map(wd => `
        <div class="wf-item">
          <span class="wf-word" onclick="App.speakWord('${wd.w.replace(/'/g, "\\'")}')">${wd.w}</span>
          <span class="wf-def">${(wd.def || []).join('；') || '—'}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLearnDone() {
  const todayLearned = state.history[todayStr()] || 0;
  app.innerHTML = `
    <div class="topbar"><button class="btn" onclick="App.nav('home')">←</button><div class="title">学习完成</div><button class="btn" onclick="App.nav('home')">✕</button></div>
    <div class="page" style="text-align:center; padding-top:80px;">
      <div style="font-size:64px;">🎉</div>
      <h2 style="margin:16px 0 8px;">今日学习完成！</h2>
      <p style="color:var(--text-2);">新学 ${sessionNew} 词 · 复习 ${sessionReview} 词</p>
      <p style="color:var(--text-2); margin-top:4px;">今日共学习 ${todayLearned} 词</p>
      <button class="start-btn" style="margin-top:32px; padding:14px 40px; border:none; border-radius:12px; background:var(--primary); color:#fff; font-size:16px; font-weight:700; cursor:pointer;" onclick="App.nav('home')">返回首页</button>
    </div>
    ${bottomNav('home')}
  `;
  celebrate();
}

function celebrate() {
  const el = document.createElement('div');
  el.className = 'celebration';
  el.innerHTML = '<div class="emoji">🎉</div>';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ====== 学习操作 ======
function startLearn() {
  const q = buildQueue(state.cards, shuffledWords, settings.newPerDay);
  if (q.queue.length === 0) {
    alert('词库为空或今日任务已完成');
    return;
  }
  queue = q.queue;
  queueIndex = 0;
  sessionNew = 0;
  sessionReview = 0;
  showMeaning = true;
  resetSpell();
  currentRated = false;
  postSpellActive = false;
  navigate('learn');
  autoSpeakCurrent();
}

function toggleMeaning() {
  showMeaning = !showMeaning;
  renderLearn();
}

function answer(rating) {
  const item = queue[queueIndex];
  const card = state.cards[item.word] || { word: item.word, state: 0, interval: 0, due: 0, ease: 2.5, lapses: 0, reps: 0, lastStudyDate: '' };
  const updated = review(card, rating);
  updated.lastStudyDate = todayStr();
  state.cards[item.word] = updated;

  if (item.type === 'new') sessionNew++; else sessionReview++;
  // 统计今日
  addHistory(state.history, 1);
  saveState(state);

  // 点"认识"后需要拼写一遍
  currentRated = true;
  if (rating === 'good') {
    postSpellActive = true;
    postSpellInput = '';
    postSpellChecked = false;
    postSpellCorrect = false;
    renderLearn();
    return;
  }

  // 其他评分直接前进
  advanceQueue();
}

/** 前进到下一个单词 */
function advanceQueue() {
  queueIndex++;
  showMeaning = true;
  resetSpell();
  postSpellActive = false;
  postSpellInput = '';
  postSpellChecked = false;
  postSpellCorrect = false;
  currentRated = false;
  renderLearn();
  autoSpeakCurrent();
}

// ====== 认识后拼写 ======
function onPostSpellInput(v) {
  postSpellInput = v;
}

function submitPostSpell() {
  const item = queue[queueIndex];
  if (!item) return;
  postSpellCorrect = normalizeWord(postSpellInput) === normalizeWord(item.word);
  postSpellChecked = true;
  renderLearn();
  if (postSpellCorrect) speak(item.word);
}

function skipPostSpell() {
  advanceQueue();
}

function advanceAfterPostSpell() {
  advanceQueue();
}

// 跳过当前拼写词（不计入学习，仅前进）
function skipSpell() {
  advanceQueue();
}

// 进入新卡片后按模式自动发音
function autoSpeakCurrent() {
  if (queueIndex >= queue.length) return;
  if (!settings.autoSpeak) return;
  const mode = settings.learnMode || 'enzh';
  // 中英拼写模式不自动发音（需先看释义）；英中、听音拼写自动发音
  if (mode === 'spell') return;
  setTimeout(() => speak(queue[queueIndex].word), 450);
}

// ====== 拼写模式 ======
function resetSpell() {
  spellInput = '';
  spellChecked = false;
  spellCorrect = false;
}

function onSpellInput(v) {
  spellInput = v;
}

function normalizeWord(s) {
  return (s || '').trim().toLowerCase().replace(/[^a-z'-]/g, '');
}

function submitSpell() {
  const item = queue[queueIndex];
  if (!item) return;
  spellCorrect = normalizeWord(spellInput) === normalizeWord(item.word);
  spellChecked = true;
  renderLearn();
  if (spellCorrect) speak(item.word);
}

// ====== 错词本 ======
function getMistakes() {
  return Object.values(state.cards)
    .filter(c => (c.lapses || 0) > 0)
    .sort((a, b) => (b.lapses || 0) - (a.lapses || 0));
}

function renderMistakes() {
  if (drillActive) {
    renderDrill();
    return;
  }

  const mistakes = getMistakes();
  const totalLapses = mistakes.reduce((s, c) => s + (c.lapses || 0), 0);
  const maxLapses = mistakes.length ? Math.max(...mistakes.map(c => c.lapses || 0)) : 0;

  app.innerHTML = `
    <div class="topbar">
      <button class="btn" onclick="App.nav('home')">←</button>
      <div class="title">错词本 <span style="font-size:12px; color:var(--text-2);">${mistakes.length} 词</span></div>
      <div></div>
    </div>
    <div class="page">
      ${mistakes.length ? `
        <div class="drill-summary">
          <div class="ds-item"><div class="ds-num">${mistakes.length}</div><div class="ds-label">错词总数</div></div>
          <div class="ds-item"><div class="ds-num">${totalLapses}</div><div class="ds-label">累计遗忘</div></div>
          <div class="ds-item"><div class="ds-num">${maxLapses}</div><div class="ds-label">最多遗忘</div></div>
        </div>
        <button class="drill-btn" onclick="App.startMistakeDrill()">
          <span class="drill-icon">🎯</span>
          <span>专项复习 ${mistakes.length} 个错词</span>
        </button>
        <div class="word-list">
          ${mistakes.slice(0, 200).map((c, i) => {
            const wd = WORDS.find(w => w.w === c.word) || { w: c.word, def: [], ph: '' };
            const lapseLevel = c.lapses >= 5 ? 'high' : c.lapses >= 3 ? 'mid' : 'low';
            return `
              <div class="word-item mistake-item">
                <div class="left" onclick="App.speakWord('${wd.w}')">
                  <div class="w">${wd.w} ${settings.showPhonetic && wd.ph ? `<span style="font-size:12px;color:var(--text-3);">/${wd.ph}/</span>` : ''}</div>
                  <div class="d">${(wd.def || []).slice(0, 2).join('；') || '—'}</div>
                </div>
                <div class="right mistake-actions">
                  <span class="lapse-badge ${lapseLevel}">忘 ${c.lapses} 次</span>
                  <button class="mini-btn drill-one" onclick="App.drillOne('${c.word}')" title="单独复习">📖</button>
                  <button class="mini-btn remove-one" onclick="App.removeMistake('${c.word}')" title="标记掌握">✓</button>
                </div>
              </div>`;
          }).join('')}
          ${mistakes.length > 200 ? `<div style="text-align:center; color:var(--text-3); padding:16px;">仅显示前 200 条</div>` : ''}
        </div>` : `
        <div style="text-align:center; color:var(--text-3); padding:60px 0;">
          <div style="font-size:48px;">🎉</div>
          <p style="margin-top:12px;">还没有错词，继续保持！</p>
        </div>`}
    </div>
    ${bottomNav('mistakes')}
  `;
}

// ====== 错词本内嵌复习 ======
function startMistakeDrill() {
  const mistakes = getMistakes();
  if (!mistakes.length) {
    alert('暂无错词');
    return;
  }
  drillQueue = mistakes.map(c => ({ word: c.word, card: c }));
  drillIndex = 0;
  drillShowMeaning = true;
  drillStats = { again: 0, hard: 0, good: 0 };
  drillActive = true;
  renderMistakes();
  if (settings.autoSpeak) {
    setTimeout(() => speak(drillQueue[0].word), 400);
  }
}

function drillOne(word) {
  const card = state.cards[word];
  if (!card) return;
  drillQueue = [{ word, card }];
  drillIndex = 0;
  drillShowMeaning = true;
  drillStats = { again: 0, hard: 0, good: 0 };
  drillActive = true;
  renderMistakes();
  if (settings.autoSpeak) {
    setTimeout(() => speak(word), 400);
  }
}

function renderDrill() {
  if (drillIndex >= drillQueue.length) {
    renderDrillDone();
    return;
  }

  const item = drillQueue[drillIndex];
  const wordData = WORDS.find(w => w.w === item.word) || { w: item.word, def: [], ph: '', sent: [] };
  const progress = drillQueue.length > 1 ? Math.round((drillIndex / drillQueue.length) * 100) : 100;
  const card = item.card || {};
  const lapseCount = card.lapses || 0;
  const roots = findRootsForWord(wordData.w);

  app.innerHTML = `
    <div class="topbar">
      <button class="btn" onclick="App.exitDrill()">←</button>
      <div class="title">错词复习</div>
      <button class="btn" onclick="App.exitDrill()">✕</button>
    </div>
    <div class="learn-top">
      <span>复习 ${drillIndex + 1}/${drillQueue.length} · 忘 ${lapseCount} 次</span>
      <div class="progress">
        <span>${progress}%</span>
        <div class="progress-bar"><div class="fill" style="width:${progress}%"></div></div>
      </div>
    </div>
    <div class="card-wrap">
      <div class="word-card drill-card">
        <div class="word">${wordData.w}</div>
        ${settings.showPhonetic && wordData.ph ? `<div class="phonetic">/${wordData.ph}/</div>` : ''}
        <button class="speaker" onclick="App.speakWord('${wordData.w}')">🔊</button>
        <div class="meaning show">
          ${renderDefs(wordData.def)}
          ${renderExamples(wordData)}
        </div>
        ${roots.length ? renderRootsInfo(roots) : ''}
      </div>
    </div>
    <div class="actions">
      <button class="btn-good" onclick="App.drillAnswer('good')">认识</button>
      <button class="btn-hard" onclick="App.drillAnswer('hard')">不确定</button>
      <button class="btn-again" onclick="App.drillAnswer('again')">不认识</button>
    </div>
    <div class="drill-stats-bar">
      <span class="dsb-item good">认识 ${drillStats.good}</span>
      <span class="dsb-item warn">不确定 ${drillStats.hard}</span>
      <span class="dsb-item bad">不认识 ${drillStats.again}</span>
    </div>
    ${bottomNav('mistakes')}
  `;
}

function renderDrillDone() {
  const total = drillStats.again + drillStats.hard + drillStats.good;
  const correctRate = total ? Math.round(((drillStats.hard + drillStats.good) / total) * 100) : 0;

  app.innerHTML = `
    <div class="topbar">
      <button class="btn" onclick="App.exitDrill()">←</button>
      <div class="title">复习完成</div>
      <button class="btn" onclick="App.exitDrill()">✕</button>
    </div>
    <div class="page" style="text-align:center; padding-top:60px;">
      <div style="font-size:56px;">${correctRate >= 80 ? '🎉' : correctRate >= 50 ? '💪' : '📚'}</div>
      <h2 style="margin:16px 0 8px;">复习完成！</h2>
      <p style="color:var(--text-2);">本次复习 ${total} 个错词</p>
      <div class="drill-result-stats">
        <div class="drs-item good"><div class="drs-num">${drillStats.good}</div><div class="drs-label">认识</div></div>
        <div class="drs-item warn"><div class="drs-num">${drillStats.hard}</div><div class="drs-label">不确定</div></div>
        <div class="drs-item bad"><div class="drs-num">${drillStats.again}</div><div class="drs-label">不认识</div></div>
      </div>
      <div class="drill-rate">
        <div class="dr-rate-num ${correctRate >= 80 ? 'good' : correctRate >= 50 ? 'mid' : 'bad'}">${correctRate}%</div>
        <div class="dr-rate-label">正确率</div>
      </div>
      ${drillStats.again > 0 ? `
        <button class="drill-again-btn" onclick="App.redrillMistakes()">
          重新复习 ${drillStats.again} 个不认识的词
        </button>` : ''}
      <button class="start-btn" style="margin-top:12px; padding:14px 40px; border:none; border-radius:12px; background:var(--primary); color:#fff; font-size:16px; font-weight:700; cursor:pointer;" onclick="App.exitDrill()">返回错词本</button>
    </div>
    ${bottomNav('mistakes')}
  `;
}

function toggleDrillMeaning() {
  drillShowMeaning = !drillShowMeaning;
  renderDrill();
}

function drillAnswer(rating) {
  const item = drillQueue[drillIndex];
  if (!item) return;
  const card = state.cards[item.word] || { word: item.word, state: 0, interval: 0, due: 0, ease: 2.5, lapses: 0, reps: 0, lastStudyDate: '' };
  const updated = review(card, rating);
  updated.lastStudyDate = todayStr();
  state.cards[item.word] = updated;
  addHistory(state.history, 1);
  saveState(state);

  drillStats[rating]++;
  drillIndex++;
  drillShowMeaning = true;
  renderDrill();
  if (drillIndex < drillQueue.length && settings.autoSpeak) {
    setTimeout(() => speak(drillQueue[drillIndex].word), 400);
  }
}

function redrillMistakes() {
  // 重新复习刚才答"不认识"的词
  const againWords = drillQueue
    .slice(0, drillIndex)
    .filter((item, i) => {
      // 直接从 state 检查 interval 是否被重置
      const card = state.cards[item.word];
      return card && card.interval === 0 && card.due > Date.now();
    });
  if (!againWords.length) {
    exitDrill();
    return;
  }
  drillQueue = againWords;
  drillIndex = 0;
  drillShowMeaning = true;
  drillStats = { again: 0, hard: 0, good: 0 };
  renderDrill();
  if (settings.autoSpeak) {
    setTimeout(() => speak(drillQueue[0].word), 400);
  }
}

function exitDrill() {
  drillActive = false;
  drillQueue = [];
  drillIndex = 0;
  drillShowMeaning = true;
  renderMistakes();
}

function removeMistake(word) {
  const card = state.cards[word];
  if (card) {
    card.lapses = 0;
    card.state = 2;
    saveState(state);
  }
  renderMistakes();
}

// ====== 已学单词 ======
function navLearnedWords(filter) {
  learnedWordsFilter = filter || 'today';
  navigate('learned-words');
}

function renderLearnedWords() {
  const today = todayStr();
  let words;
  let pageTitle;

  if (learnedWordsFilter === 'today') {
    words = Object.values(state.cards)
      .filter(c => c.lastStudyDate === today);
    pageTitle = '今日学习';
  } else {
    words = Object.values(state.cards);
    pageTitle = '已学单词';
  }
  // 按最近学习时间倒序
  words.sort((a, b) => (b.lastStudyDate || '').localeCompare(a.lastStudyDate || ''));

  // 全部已学：按日期分组
  let listHTML = '';
  if (learnedWordsFilter === 'all' && words.length) {
    // 按日期分组
    const groups = {};
    for (const c of words) {
      const date = c.lastStudyDate || '未知日期';
      if (!groups[date]) groups[date] = [];
      groups[date].push(c);
    }
    // 按日期倒序
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    listHTML = sortedDates.map(date => {
      const dateLabel = date === today ? '今天' : date === getYesterdayStr() ? '昨天' : formatDate(date);
      return `
        <div class="learned-date-group">
          <div class="ldg-header">${dateLabel} <span class="ldg-count">${groups[date].length} 词</span></div>
          ${groups[date].map(c => renderLearnedWordItem(c)).join('')}
        </div>`;
    }).join('');
  } else if (words.length) {
    // 今日学习：不显示状态标签
    listHTML = words.map(c => renderLearnedWordItem(c, true)).join('');
  }

  app.innerHTML = `
    <div class="topbar">
      <button class="btn" onclick="App.nav('home')">←</button>
      <div class="title">${pageTitle} <span style="font-size:12px; color:var(--text-2);">${words.length} 词</span></div>
      <div></div>
    </div>
    <div class="page">
      <div class="learned-filter-bar">
        <button class="sf-btn ${learnedWordsFilter === 'today' ? 'active' : ''}" onclick="App.navLearnedWords('today')">今日学习</button>
        <button class="sf-btn ${learnedWordsFilter === 'all' ? 'active' : ''}" onclick="App.navLearnedWords('all')">全部已学</button>
      </div>
      ${words.length ? `<div class="word-list">${listHTML}</div>` : `
        <div style="text-align:center; color:var(--text-3); padding:60px 0;">
          <div style="font-size:48px;">📚</div>
          <p style="margin-top:12px;">${learnedWordsFilter === 'today' ? '今天还没有学习记录' : '还没有学习过的单词'}</p>
        </div>`}
    </div>
    ${bottomNav('home')}
  `;
}

/** 渲染已学单词列表项 */
function renderLearnedWordItem(c, hideStatus) {
  const wd = WORDS.find(w => w.w === c.word) || { w: c.word, def: [], ph: '' };
  const isMastered = c.state === 2;
  const lapseCount = c.lapses || 0;
  const statusText = isMastered ? '已掌握' : '已学习';
  return `
    <div class="word-item learned-word-item">
      <div class="left" onclick="App.speakWord('${wd.w}')">
        <div class="w">${wd.w} ${settings.showPhonetic && wd.ph ? `<span style="font-size:12px;color:var(--text-3);">/${wd.ph}/</span>` : ''}</div>
        <div class="d">${(wd.def || []).slice(0, 2).join('；') || '—'}</div>
      </div>
      <div class="right learned-actions">
        ${hideStatus ? '' : `<span class="status ${isMastered ? 'learned' : 'learning'}">${statusText}${lapseCount ? ` · 忘${lapseCount}` : ''}</span>`}
        <button class="mini-btn learn-one" onclick="App.learnSingleWord('${wd.w}')" title="进入学习">📖</button>
        <button class="mini-btn remove-learned" onclick="App.removeLearnedWord('${wd.w}')" title="剔除已学">✕</button>
      </div>
    </div>`;
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayStr(d);
}

function formatDate(dateStr) {
  if (!dateStr || dateStr.length < 10) return dateStr || '未知';
  const y = dateStr.slice(0, 4);
  const m = parseInt(dateStr.slice(5, 7));
  const d = parseInt(dateStr.slice(8, 10));
  return `${y}年${m}月${d}日`;
}

function removeLearnedWord(word) {
  if (!confirm(`确定要将「${word}」从已学单词中剔除吗？\n剔除后该单词的学习进度将被清除，需要重新学习。`)) return;
  delete state.cards[word];
  saveState(state);
  renderLearnedWords();
}

function learnSingleWord(word) {
  queue = [{ word, type: 'review' }];
  queueIndex = 0;
  sessionNew = 0;
  sessionReview = 0;
  showMeaning = true;
  resetSpell();
  navigate('learn');
  autoSpeakCurrent();
}

// ====== 单词本 ======
function renderWordbook(filter = '') {
  const f = filter.toLowerCase();
  const source = shuffledWords.length ? shuffledWords : WORDS;
  const list = source.filter(w => !f || w.w.toLowerCase().includes(f) || (w.def || []).some(d => d.includes(f)));
  const learnedCount = Object.keys(state.cards).length;

  app.innerHTML = `
    <div class="topbar">
      <button class="btn" onclick="App.nav('home')">←</button>
      <div class="title">单词本 <span style="font-size:12px; color:var(--text-2);">${learnedCount}/${WORDS.length}</span></div>
      <button class="btn" onclick="App.reshuffleWords()" title="重新打乱顺序">🔀</button>
    </div>
    <div class="page">
      <div class="search-box">
        <span class="icon">🔍</span>
        <input id="wb-search" placeholder="搜索单词或释义" value="${filter}" oninput="App.wordbookSearch(this.value)" />
      </div>
      <div class="word-list">
        ${list.slice(0, 200).map(w => {
          const card = state.cards[w.w];
          const status = card ? (card.state === 2 ? 'learned' : 'learning') : '';
          const statusText = card ? (card.state === 2 ? '已掌握' : '学习中') : '未学';
          return `
            <div class="word-item" onclick="App.speakWord('${w.w}')">
              <div class="left">
                <div class="w">${w.w} ${settings.showPhonetic && w.ph ? `<span style="font-size:12px;color:var(--text-3);">/${w.ph}/</span>` : ''}</div>
                <div class="d">${(w.def || []).slice(0, 2).join('；')}</div>
              </div>
              <div class="right"><span class="status ${status}">${statusText}</span></div>
            </div>
          `;
        }).join('')}
        ${list.length === 0 ? '<div style="text-align:center; color:var(--text-3); padding:40px 0;">未找到匹配单词</div>' : ''}
        ${list.length > 200 ? `<div style="text-align:center; color:var(--text-3); padding:16px;">仅显示前 200 条，搜索缩小范围</div>` : ''}
      </div>
    </div>
    ${bottomNav('wordbook')}
  `;
}

/** 重新打乱词库顺序 */
function reshuffleWords() {
  localStorage.removeItem('pets3_shuffle_v1');
  shuffledWords = initShuffledWords(WORDS);
  renderWordbook();
}

// ====== 统计页 ======
function renderStats() {
  const total = Object.keys(state.cards).length;
  const learned = Object.values(state.cards).filter(c => c.state === 2).length;
  const learning = total - learned;
  const streak = streakDays(state.history);
  const cal = calendarData(state.history, 70);
  const mistakeCount = Object.values(state.cards).filter(c => (c.lapses || 0) > 0).length;
  // 最近7天
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ts = todayStr(d);
    last7.push({ label: '日一二三四五六'[d.getDay()], count: state.history[ts] || 0, date: ts });
  }
  const max7 = Math.max(1, ...last7.map(x => x.count));
  const total7 = last7.reduce((s, x) => s + x.count, 0);
  const avg7 = total7 > 0 ? (total7 / 7).toFixed(1) : '0';
  const avgProficiency = total ? Math.round(Object.values(state.cards).reduce((s, c) => s + (c.interval ? Math.min(100, c.interval * 5 + 20 - (c.lapses || 0) * 10) : 10), 0) / total) : 0;

  app.innerHTML = `
    <div class="topbar">
      <button class="btn" onclick="App.nav('home')">←</button>
      <div class="title">学习统计</div>
      <div></div>
    </div>
    <div class="page">
      <div class="stat-block">
        <h3>累计数据</h3>
        <div class="stat-grid">
          <div class="stat-cell"><div class="num" style="color:var(--green)">${total}</div><div class="label">累计学词</div></div>
          <div class="stat-cell"><div class="num" style="color:var(--primary)">${learning}</div><div class="label">学习中</div></div>
          <div class="stat-cell"><div class="num" style="color:var(--orange)">${learned}</div><div class="label">已掌握</div></div>
          <div class="stat-cell"><div class="num">${streak}</div><div class="label">连续打卡</div></div>
        </div>
      </div>

      <!-- 错词本入口 -->
      <div class="mistake-entry ${mistakeCount > 0 ? 'has-mistakes' : ''}" onclick="App.nav('mistakes')">
        <div class="me-left">
          <div class="me-icon">📝</div>
          <div class="me-info">
            <div class="me-title">错词本</div>
            <div class="me-desc">${mistakeCount > 0 ? `${mistakeCount} 个错词待复习` : '暂无错词，继续保持！'}</div>
          </div>
        </div>
        <div class="me-arrow">›</div>
      </div>

      <div class="stat-block">
        <div class="sb-header">
          <h3>最近 7 天</h3>
          <span class="sb-summary">日均 ${avg7} 词</span>
        </div>
        <div class="bar-chart">
          <div class="bc-grid">
            <div class="bc-grid-line" style="bottom:100%"></div>
            <div class="bc-grid-line" style="bottom:75%"></div>
            <div class="bc-grid-line" style="bottom:50%"></div>
            <div class="bc-grid-line" style="bottom:25%"></div>
          </div>
          ${last7.map((x, i) => {
            const h = Math.max(4, (x.count / max7) * 100);
            const isToday = i === last7.length - 1;
            return `
            <div class="bc-col">
              <div class="bc-value">${x.count || ''}</div>
              <div class="bc-bar-wrap">
                <div class="bc-bar ${isToday ? 'today' : ''} ${x.count === 0 ? 'empty' : ''}" style="height:${h}%">
                  <div class="bc-bar-top"></div>
                </div>
              </div>
              <div class="bc-label">${x.label}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="stat-block">
        <h3>学习日历（近 70 天）</h3>
        <div class="calendar">
          ${cal.map(d => {
            const level = d.count === 0 ? 0 : d.count < 10 ? 1 : d.count < 30 ? 2 : d.count < 60 ? 3 : 4;
            const isToday = d.date === todayStr();
            return `<div class="day l${level} ${isToday ? 'today' : ''}" title="${d.date}：${d.count} 词">${d.date.slice(8)}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="stat-block">
        <h3>记忆持久度</h3>
        <div style="text-align:center; padding:10px 0;">
          <div style="font-size:44px; font-weight:800; color:var(--primary);">${avgProficiency}%</div>
          <div style="font-size:13px; color:var(--text-2); margin-top:4px;">基于复习间隔与遗忘次数估算</div>
        </div>
      </div>
    </div>
    ${bottomNav('stats')}
  `;
}

// ====== 工具函数 ======
function highlightWord(en, word) {
  if (!word) return en;
  const re = new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})\\b`, 'gi');
  return en.replace(re, '<span class="hl-word">$1</span>');
}

function speakSentence(text) {
  speak(text);
}

// ====== 词根词缀 ======
function renderRoots() {
  const filtered = rootFilter === 'all' ? ROOTS : ROOTS.filter(r => r.type === rootFilter);
  const typeLabels = { prefix: '前缀', suffix: '后缀', root: '词根' };

  app.innerHTML = `
    <div class="topbar">
      <button class="btn" onclick="App.nav('home')">←</button>
      <div class="title">词根词缀 <span style="font-size:12px; color:var(--text-2);">${ROOTS.length} 条</span></div>
      <div></div>
    </div>
    <div class="page">
      <div class="sentence-filters">
        <button class="sf-btn ${rootFilter === 'all' ? 'active' : ''}" onclick="App.setRootFilter('all')">全部</button>
        <button class="sf-btn ${rootFilter === 'prefix' ? 'active' : ''}" onclick="App.setRootFilter('prefix')">前缀</button>
        <button class="sf-btn ${rootFilter === 'suffix' ? 'active' : ''}" onclick="App.setRootFilter('suffix')">后缀</button>
        <button class="sf-btn ${rootFilter === 'root' ? 'active' : ''}" onclick="App.setRootFilter('root')">词根</button>
      </div>
      <div class="roots-list">
        ${filtered.map((r, i) => {
          const matched = r.words.filter(w => WORDS.find(wd => wd.w === w));
          const unmatched = r.words.filter(w => !WORDS.find(wd => wd.w === w));
          return `
            <div class="root-card" onclick="App.toggleRootDetail(${i})">
              <div class="root-header">
                <div class="root-name">${r.root}</div>
                <div class="root-tag ${r.type}">${typeLabels[r.type]}</div>
              </div>
              <div class="root-meaning">${r.meaning}</div>
              <div class="root-origin">${r.origin}</div>
              <div class="root-words-preview">
                ${matched.slice(0, 4).map(w => `<span class="rw-chip">${w}</span>`).join('')}
                ${matched.length > 4 ? `<span class="rw-more">+${matched.length - 4}</span>` : ''}
              </div>
              <div class="root-detail" id="root-detail-${i}" style="display:none;">
                ${matched.length ? `
                  <div class="rd-section">词库中的单词：</div>
                  ${matched.map(w => {
                    const wd = WORDS.find(x => x.w === w) || {};
                    const card = state.cards[w];
                    const st = card ? (card.state === 2 ? '已掌握' : '学习中') : '未学';
                    return `
                      <div class="rd-word" onclick="event.stopPropagation(); App.speakWord('${w}')">
                        <span class="rd-w">${w}</span>
                        <span class="rd-d">${(wd.def || []).slice(0, 1).join('；') || '—'}</span>
                        <span class="rd-status ${card ? (card.state === 2 ? 'learned' : 'learning') : ''}">${st}</span>
                      </div>`;
                  }).join('')}` : ''}
                ${unmatched.length ? `
                  <div class="rd-section" style="margin-top:8px;">其他相关：</div>
                  <div class="rd-other">${unmatched.map(w => `<span class="rw-chip other">${w}</span>`).join('')}</div>` : ''}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>
    ${bottomNav('roots')}
  `;
}

function toggleRootDetail(i) {
  const el = document.getElementById(`root-detail-${i}`);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function setRootFilter(f) {
  rootFilter = f;
  renderRoots();
}

// ====== 学习计划 ======
function renderPlan() {
  const total = WORDS.length;
  const learned = Object.keys(state.cards).length;
  const mastered = Object.values(state.cards).filter(c => c.state === 2).length;
  const remaining = total - learned;
  const progress = total ? Math.round((learned / total) * 100) : 0;

  // 考试日期计算
  const examDate = settings.examDate;
  let daysLeft = 0, planText = '', dailyNeed = 0;
  if (examDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    daysLeft = Math.ceil((exam - now) / DAY);
    if (daysLeft > 0) {
      dailyNeed = Math.ceil(remaining / daysLeft);
      planText = `距考试还有 ${daysLeft} 天，每天需学 ${dailyNeed} 个新词`;
    } else if (daysLeft === 0) {
      planText = '今天就是考试日！加油！';
    } else {
      planText = `考试已过去 ${-daysLeft} 天`;
    }
  } else {
    // 无考试日期，按当前节奏估算
    const rate = settings.newPerDay;
    const estDays = Math.ceil(remaining / rate);
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + estDays);
    planText = `按每天 ${rate} 词，预计 ${estDays} 天后（${estDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}）学完`;
  }

  // 最近7天学习量
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ts = todayStr(d);
    last7.push({ label: '日一二三四五六'[d.getDay()], count: state.history[ts] || 0 });
  }
  const total7 = last7.reduce((s, x) => s + x.count, 0);
  const avg7 = Math.round(total7 / 7);

  // 目标达成判定
  const targetMet = dailyNeed > 0 && (state.history[todayStr()] || 0) >= dailyNeed;

  app.innerHTML = `
    <div class="topbar">
      <button class="btn" onclick="App.nav('home')">←</button>
      <div class="title">学习计划</div>
      <div></div>
    </div>
    <div class="page">
      <!-- 进度总览 -->
      <div class="plan-progress-card">
        <div class="pp-circle">
          <div class="pp-num">${progress}%</div>
          <div class="pp-label">完成进度</div>
        </div>
        <div class="pp-stats">
          <div class="pp-stat"><span class="num">${learned}</span><span class="lbl">已学</span></div>
          <div class="pp-stat"><span class="num">${mastered}</span><span class="lbl">已掌握</span></div>
          <div class="pp-stat"><span class="num">${remaining}</span><span class="lbl">剩余</span></div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="plan-bar-wrap">
        <div class="plan-bar">
          <div class="plan-bar-fill" style="width:${progress}%"></div>
        </div>
        <div class="plan-bar-text">${learned} / ${total}</div>
      </div>

      <!-- 考试倒计时 -->
      <div class="stat-block">
        <h3>📅 考试倒计时</h3>
        ${examDate ? `
          <div class="exam-countdown">
            <div class="ec-days ${daysLeft <= 7 ? 'urgent' : ''}">${daysLeft > 0 ? daysLeft : daysLeft === 0 ? '今天' : '已过'}</div>
            <div class="ec-info">
              <div class="ec-date">考试日期：${new Date(examDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div class="ec-plan">${planText}</div>
            </div>
          </div>
          ${daysLeft > 0 && dailyNeed > 0 ? `
            <div class="today-target ${targetMet ? 'met' : ''}">
              <span class="tt-icon">${targetMet ? '✅' : '🎯'}</span>
              <span class="tt-text">${targetMet ? '今日目标已达成！' : `今日目标：学 ${dailyNeed} 词（已学 ${state.history[todayStr()] || 0}）`}</span>
            </div>` : ''}
        ` : `
          <div class="no-exam">
            <p style="color:var(--text-2); margin-bottom:12px;">${planText}</p>
            <button class="set-exam-btn" onclick="App.nav('settings')">去设置考试日期</button>
          </div>`}
      </div>

      <!-- 近7天学习量 -->
      <div class="stat-block">
        <h3>📊 近 7 天学习</h3>
        <div style="display:flex; align-items:flex-end; gap:8px; height:90px; padding:0 4px;">
          ${last7.map(x => `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%;">
              <div style="font-size:11px; color:var(--text-2); margin-bottom:4px;">${x.count || ''}</div>
              <div style="width:100%; max-width:28px; background:${x.count ? 'var(--primary)' : '#e5e7eb'}; border-radius:4px 4px 0 0; height:${Math.max(6, (x.count / Math.max(1, ...last7.map(x => x.count))) * 70)}px;"></div>
              <div style="font-size:11px; color:var(--text-3); margin-top:4px;">${x.label}</div>
            </div>
          `).join('')}
        </div>
        <div style="text-align:center; margin-top:12px; font-size:13px; color:var(--text-2);">
          7 天共学 ${total7} 词，日均 ${avg7} 词
        </div>
      </div>

      <!-- 建议与提醒 -->
      <div class="stat-block">
        <h3>💡 学习建议</h3>
        <div class="plan-tips">
          ${generateTips(learned, mastered, remaining, daysLeft, dailyNeed, avg7)}
        </div>
      </div>
    </div>
    ${bottomNav('plan')}
  `;
}

function generateTips(learned, mastered, remaining, daysLeft, dailyNeed, avg7) {
  const tips = [];
  if (remaining === 0) {
    tips.push('🎉 词库已全部学完，建议专注于复习和错词本！');
  } else {
    if (dailyNeed > 0 && avg7 < dailyNeed) {
      tips.push(`⚠️ 当前日均 ${avg7} 词，低于目标 ${dailyNeed} 词/天，需要加速！`);
    } else if (avg7 >= (settings.newPerDay || 20)) {
      tips.push('👍 学习节奏稳定，继续保持！');
    } else {
      tips.push('📖 建议每天保持稳定的学习量，养成习惯。');
    }
  }
  const mistakeCount = Object.values(state.cards).filter(c => (c.lapses || 0) > 0).length;
  if (mistakeCount > 10) {
    tips.push(`📝 你有 ${mistakeCount} 个错词，建议每天花 5 分钟复习错词本。`);
  }
  if (mastered < learned * 0.3 && learned > 50) {
    tips.push('🔄 已掌握比例偏低，建议适当减少新词量，增加复习。');
  }
  if (daysLeft > 0 && daysLeft <= 30) {
    tips.push('🔥 考试临近，建议结合真题练习，重点关注高频词汇。');
  }
  return tips.map(t => `<div class="tip-item">${t}</div>`).join('');
}

function setExamDate(v) {
  settings.examDate = v || '';
  saveSettings(settings);
  renderPlan();
}

// ====== 设置页 ======
function renderSettings() {
  app.innerHTML = `
    <div class="topbar">
      <button class="btn" onclick="App.nav('home')">←</button>
      <div class="title">设置</div>
      <div></div>
    </div>
    <div class="page">
      <div class="setting-group">
        <div class="setting-item">
          <span class="label">学习模式</span>
          <select onchange="App.setLearnMode(this.value)">
            <option value="enzh" ${settings.learnMode === 'enzh' ? 'selected' : ''}>英中（看词回想释义）</option>
            <option value="listen" ${settings.learnMode === 'listen' ? 'selected' : ''}>听音拼写</option>
          </select>
        </div>
        <div class="setting-item">
          <span class="label">每日新词数</span>
          <input type="number" min="5" max="500" step="5" value="${settings.newPerDay}"
            onchange="App.setNewPerDay(this.value)" style="width:70px;" />
        </div>
        <div class="setting-item">
          <span class="label">考试日期</span>
          <input type="date" value="${settings.examDate || ''}" onchange="App.setExamDate(this.value)" style="font-size:14px;" />
        </div>
        <div class="setting-item">
          <span class="label">自动发音</span>
          <div class="switch ${settings.autoSpeak ? 'on' : ''}" onclick="App.toggleSetting('autoSpeak')"><div class="knob"></div></div>
        </div>
        <div class="setting-item">
          <span class="label">显示音标</span>
          <div class="switch ${settings.showPhonetic ? 'on' : ''}" onclick="App.toggleSetting('showPhonetic')"><div class="knob"></div></div>
        </div>
        <div class="setting-item">
          <span class="label">深色模式</span>
          <div class="switch ${settings.dark ? 'on' : ''}" onclick="App.toggleSetting('dark')"><div class="knob"></div></div>
        </div>
        <div class="setting-item">
          <span class="label">每日提醒</span>
          <div class="switch ${settings.remind ? 'on' : ''}" onclick="App.toggleRemind()"><div class="knob"></div></div>
        </div>
        ${settings.remind ? `
        <div class="setting-item">
          <span class="label">提醒时间</span>
          <input type="time" value="${settings.remindTime}" onchange="App.setRemindTime(this.value)" />
        </div>` : ''}
      </div>

      <div class="setting-group">
        <div class="setting-item" style="cursor:pointer" onclick="App.nav('tts-test')">
          <span class="label">🔊 语音试听与选择</span>
          <span class="value">点击试听 ›</span>
        </div>
        <div class="setting-item">
          <span class="label">词库</span>
          <span class="value">PETS-3 大纲 ${WORDS.length} 词</span>
        </div>
        <div class="setting-item">
          <span class="label">版本</span>
          <span class="value">v2.0.0</span>
        </div>
      </div>

      <div style="text-align:center; padding:20px 0; color:var(--text-3); font-size:12px;">
        我想背单词 · 记忆曲线引擎<br>仅供个人学习使用
      </div>
    </div>
    ${bottomNav('settings')}
  `;
}

// ====== 生活短语 ======
function renderPhrases() {
  const p = PHRASES[phraseIndex] || PHRASES[0];
  const moodLabels = { funny: '😂 搞笑', poetic: '🌙 诗意', life: '🌿 生活', inspirational: '🔥 励志' };
  const fontClasses = { rounded: 'font-rounded', sharp: 'font-sharp', elegant: 'font-elegant' };
  const fontClass = fontClasses[p.font] || 'font-rounded';

  app.innerHTML = `
    <div class="phrase-fullscreen ${fontClass}" style="background-image: url('${p.img}'), ${p.gradient};">
      <div class="phrase-overlay"></div>
      <div class="phrase-topbar">
        <button class="phrase-back" onclick="App.nav('home')">←</button>
        <span class="phrase-counter">${phraseIndex + 1} / ${PHRASES.length}</span>
        <button class="phrase-close" onclick="App.nav('home')">✕</button>
      </div>
      <div class="phrase-body">
        <div class="phrase-mood-tag">${moodLabels[p.mood] || ''}</div>
        <div class="phrase-en-large" onclick="App.speakSentence('${p.en.replace(/'/g, "\\'")}')">${p.en}</div>
        <div class="phrase-cn-large">${p.cn}</div>
        <div class="phrase-tap-hint">🔊 点击英文朗读</div>
      </div>
      <div class="phrase-bottom">
        <button class="phrase-nav-btn" onclick="App.prevPhrase()" ${phraseIndex === 0 ? 'disabled' : ''}>‹</button>
        <div class="phrase-dots-inline">
          ${PHRASES.map((_, i) => `<span class="pd ${i === phraseIndex ? 'active' : ''}" onclick="App.setPhraseIndex(${i})"></span>`).join('')}
        </div>
        <button class="phrase-nav-btn" onclick="App.nextPhrase()" ${phraseIndex === PHRASES.length - 1 ? 'disabled' : ''}>›</button>
      </div>
    </div>
  `;
}

function nextPhrase() {
  if (phraseIndex < PHRASES.length - 1) {
    phraseIndex++;
    renderPhrases();
  }
}

function prevPhrase() {
  if (phraseIndex > 0) {
    phraseIndex--;
    renderPhrases();
  }
}

function setPhraseIndex(i) {
  phraseIndex = i;
  renderPhrases();
}

// ====== TTS 语音试听 ======
function renderTTSTest() {
  const currentOnline = getOnlineVoice();
  app.innerHTML = `
    <div class="topbar">
      <button class="btn" onclick="App.nav('settings')">←</button>
      <div class="title">语音试听</div>
      <button class="btn" onclick="App.nav('settings')">✕</button>
    </div>
    <div class="page">
      <div class="tts-desc">输入要朗读的单词或句子，点击播放按钮试听。选择喜欢的声音后会自动保存，学习时使用该语音。</div>
      <input class="tts-test-text" id="ttsTestText" value="The ribbon is very common in our daily life." placeholder="输入要朗读的英文文本" />

      <div class="tts-section-title">🌟 Edge 神经网络语音（推荐）</div>
      <div class="tts-voice-list" id="ttsOnlineList">
        ${ONLINE_VOICES.map((v, i) => `
          <div class="tts-voice-card ${currentOnline === v.id ? 'selected' : ''}" id="tts-ov-${i}">
            <div class="tts-voice-info">
              <div class="tts-voice-name">${v.name} ${currentOnline === v.id ? '✓' : ''}</div>
              <div class="tts-voice-meta">
                <span class="tts-badge remote">在线</span>
                ${v.desc}
              </div>
            </div>
            <div class="tts-voice-actions">
              <button class="tts-play-btn" onclick="App.playOnlineVoice(${i})">▶</button>
              <button class="tts-select-btn ${currentOnline === v.id ? 'active' : ''}" onclick="App.selectOnlineVoice(${i})">${currentOnline === v.id ? '已选' : '选择'}</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="tts-section-title">💻 系统本地语音</div>
      <div class="tts-voice-list" id="ttsVoiceList">
        <div class="tts-loading">正在加载系统语音列表...</div>
      </div>

      ${currentOnline ? `
        <button class="tts-reset-btn" onclick="App.resetOnlineVoice()">✕ 取消在线语音，使用系统默认</button>
      ` : ''}

      <div class="tts-hint">
        <strong>说明：</strong><br>
        • Edge 神经网络语音质量极高，<strong>单词和句子都能播放</strong><br>
        • 基于 Microsoft Edge TTS，免费无需注册，浏览器和 APK 均可使用<br>
        • 需要网络连接，在线失败时自动回退到系统本地语音<br>
        • 系统本地语音无需网络，可离线使用
      </div>
    </div>
  `;
  // 异步加载本地语音列表
  setTimeout(() => loadVoiceList(), 100);
}

function playOnlineVoice(idx) {
  const v = ONLINE_VOICES[idx];
  if (!v) return;
  const text = (document.getElementById('ttsTestText') || {}).value || 'Hello, this is a test.';
  // 更新 UI
  document.querySelectorAll('.tts-voice-card').forEach(c => c.classList.remove('playing'));
  document.querySelectorAll('.tts-play-btn').forEach(b => { b.classList.remove('playing'); b.textContent = '▶'; });
  const card = document.getElementById('tts-ov-' + idx);
  if (card) {
    const btn = card.querySelector('.tts-play-btn');
    card.classList.add('playing');
    btn.classList.add('playing');
    btn.textContent = '⏸';
  }
  const resetBtn = () => {
    if (card) {
      card.classList.remove('playing');
      const btn = card.querySelector('.tts-play-btn');
      if (btn) { btn.classList.remove('playing'); btn.textContent = '▶'; }
    }
  };
  // 播放在线语音（Edge TTS 神经网络语音）
  fetch('https://tts.wangwangit.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: text, voice: v.id, speed: 1.0, pitch: '0', style: 'general' }),
  })
    .then(resp => {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { URL.revokeObjectURL(url); resetBtn(); };
      audio.onerror = () => { URL.revokeObjectURL(url); resetBtn(); alert('播放失败'); };
      audio.play().catch(() => { resetBtn(); alert('播放失败'); });
    })
    .catch(() => { resetBtn(); alert('播放失败，请检查网络连接'); });
}

function selectOnlineVoice(idx) {
  const v = ONLINE_VOICES[idx];
  if (!v) return;
  // 如果已选中，取消选择
  if (settings.onlineVoice === v.id) {
    settings.onlineVoice = '';
    setOnlineVoice(null);
  } else {
    settings.onlineVoice = v.id;
    setOnlineVoice(v.id);
  }
  saveSettings(settings);
  renderTTSTest();
}

function resetOnlineVoice() {
  settings.onlineVoice = '';
  setOnlineVoice(null);
  saveSettings(settings);
  renderTTSTest();
}

function loadVoiceList() {
  const list = document.getElementById('ttsVoiceList');
  if (!list) return;
  const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  if (!voices.length) {
    list.innerHTML = '<div class="tts-loading">系统语音列表为空，请等待几秒后点击刷新</div>';
    return;
  }
  // 优先显示英语语音
  const enVoices = voices.filter(v => v.lang && v.lang.startsWith('en'));
  const otherVoices = voices.filter(v => !v.lang || !v.lang.startsWith('en'));
  const displayVoices = [...enVoices, ...otherVoices];

  list.innerHTML = displayVoices.map((v, i) => {
    const isDefault = v.default;
    const isLocal = v.localService;
    return `
      <div class="tts-voice-card" id="tts-vc-${i}">
        <div class="tts-voice-info">
          <div class="tts-voice-name">${v.name}</div>
          <div class="tts-voice-meta">
            <span class="tts-badge ${isLocal ? 'local' : 'remote'}">${isLocal ? '本地' : '系统'}</span>
            ${isDefault ? '<span class="tts-badge default">默认</span>' : ''}
            ${v.lang}
          </div>
        </div>
        <button class="tts-play-btn" onclick="App.playTestVoice(${i})">▶</button>
      </div>
    `;
  }).join('');
  // 保存语音列表到全局
  window.__ttsVoices = displayVoices;
}

function refreshVoices() {
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
  }
  loadVoiceList();
}

function playTestVoice(idx) {
  const voices = window.__ttsVoices || [];
  const v = voices[idx];
  if (!v) return;
  const text = (document.getElementById('ttsTestText') || {}).value || 'Hello, this is a test.';
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = v;
  u.lang = v.lang;
  u.rate = 0.9;
  u.pitch = 1.1;

  // 更新 UI
  document.querySelectorAll('.tts-voice-card').forEach(c => c.classList.remove('playing'));
  document.querySelectorAll('.tts-play-btn').forEach(b => { b.classList.remove('playing'); b.textContent = '▶'; });
  const card = document.getElementById('tts-vc-' + idx);
  if (card) {
    const btn = card.querySelector('.tts-play-btn');
    card.classList.add('playing');
    btn.classList.add('playing');
    btn.textContent = '⏸';
    u.onend = function() {
      card.classList.remove('playing');
      btn.classList.remove('playing');
      btn.textContent = '▶';
    };
  }
  window.speechSynthesis.speak(u);
}

// ====== 底部导航 ======
function bottomNav(active) {
  const items = [
    { id: 'roots', icon: '🧩', label: '词根词缀' },
    { id: 'plan', icon: '🎯', label: '学习计划' },
    { id: 'wordbook', icon: '📖', label: '单词本' },
    { id: 'stats', icon: '📊', label: '学习统计' },
    { id: 'mistakes', icon: '📝', label: '错词本' },
    { id: 'phrases', icon: '✨', label: '生活短语' },
  ];
  return `
    <div class="bottom-nav">
      ${items.map(i => {
        const action = i.id === 'learn' ? "App.startLearn()" : `App.nav('${i.id}')`;
        return `
        <div class="nav-item ${active === i.id ? 'active' : ''}" onclick="${action}">
          <div class="icon">${i.icon}</div>
          <div class="label">${i.label}</div>
        </div>
      `;
      }).join('')}
    </div>
  `;
}

// ====== 工具 ======
function applyTheme() {
  document.body.classList.toggle('dark', settings.dark);
}

function setNewPerDay(v) {
  const n = Math.max(5, Math.min(500, parseInt(v) || 20));
  settings.newPerDay = n;
  saveSettings(settings);
}

function setLearnMode(v) {
  settings.learnMode = v || 'enzh';
  saveSettings(settings);
}

function toggleSetting(key) {
  settings[key] = !settings[key];
  saveSettings(settings);
  applyTheme();
  renderSettings();
}

async function toggleRemind() {
  const next = !settings.remind;
  if (next) {
    const ok = await ensurePermission();
    if (!ok) {
      alert('每日提醒仅在 Android App 中可用，且需要通知权限');
      return;
    }
  }
  settings.remind = next;
  saveSettings(settings);
  await setDailyReminder(settings.remind, settings.remindTime);
  renderSettings();
}

function setRemindTime(v) {
  settings.remindTime = v || '20:00';
  saveSettings(settings);
  setDailyReminder(settings.remind, settings.remindTime);
}

// ====== 全局 API（onclick 使用）=====
window.App = {
  nav: navigate,
  goBack,
  startLearn,
  toggleMeaning,
  answer,
  skipSpell,
  onSpellInput,
  submitSpell,
  onPostSpellInput,
  submitPostSpell,
  skipPostSpell,
  advanceAfterPostSpell,
  speakWord: (w) => speak(w),
  speakSentence,
  wordbookSearch: (v) => renderWordbook(v),
  reshuffleWords,
  setNewPerDay,
  setLearnMode,
  setExamDate,
  toggleSetting,
  toggleRemind,
  setRemindTime,
  startMistakeDrill,
  drillOne,
  toggleDrillMeaning,
  drillAnswer,
  redrillMistakes,
  exitDrill,
  removeMistake,
  navLearnedWords,
  removeLearnedWord,
  learnSingleWord,
  nextPhrase,
  prevPhrase,
  setPhraseIndex,
  refreshVoices,
  playTestVoice,
  playOnlineVoice,
  selectOnlineVoice,
  resetOnlineVoice,
  setRootFilter,
  toggleRootDetail,
};

// ====== 启动 ======
init();
