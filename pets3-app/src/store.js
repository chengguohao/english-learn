/**
 * 数据层：词库加载 + 学习进度持久化（localStorage）
 */

const WORDS_KEY = 'pets3_words_v1';
const STATE_KEY = 'pets3_state_v1';
const SETTINGS_KEY = 'pets3_settings_v1';
const HISTORY_KEY = 'pets3_history_v1';

/** 加载词库（优先用内置的压缩词库，可被外部注入覆盖） */
export async function loadWords() {
  // 尝试从 window.__WORDS__（内联数据）读取
  if (window.__WORDS__ && window.__WORDS__.length) {
    return window.__WORDS__;
  }
  // 回退：从 /words.json 加载
  try {
    const resp = await fetch('words.json');
    if (resp.ok) return await resp.json();
  } catch (e) { /* ignore */ }
  // 最后回退：空词库
  return [];
}

/** 读学习状态 */
export function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY)) || { cards: {}, history: {} };
  } catch { return { cards: {}, history: {} }; }
}

/** 保存学习状态 */
export function saveState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

/** 读设置 */
export function loadSettings() {
  const def = { newPerDay: 20, autoSpeak: true, showPhonetic: true, dark: false, sound: true, remind: false, remindTime: '20:00', learnMode: 'enzh', examDate: '', planEnabled: false, onlineVoice: '', theme: 'classic' };
  try {
    return { ...def, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}) };
  } catch { return def; }
}

export function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

/** 记录今天学了 n 个词 */
export function addHistory(history, n) {
  const today = new Date();
  const ts = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  history[ts] = (history[ts] || 0) + n;
}
