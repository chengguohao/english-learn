/**
 * 记忆曲线引擎（SRS 间隔重复算法）
 * 每个单词有: state(0=新词,1=学习中,2=已掌握), 下次复习时间, 间隔天数, 熟练度(0-100)
 * 三态选择:
 *   认识(good): 间隔翻倍或 +1 天, 熟练度上升
 *   模糊(hard): 间隔不变或略增, 熟练度微升
 *   忘记(again): 间隔重置为最短, 熟练度下降, 重新进入学习
 */

// 间隔序列（天）：忘记→1天→3天→7天→15天→30天→60天→90天
const INTERVALS = [1, 3, 7, 15, 30, 60, 90, 120, 180, 365];

export const DAY = 24 * 60 * 60 * 1000;

export function todayStr(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 在 INTERVALS 阶梯中定位当前间隔的索引；新词/未学(0)返回 -1，未精确命中取不超过该值的最大阶梯 */
function intervalIndex(v) {
  if (!v || v < 1) return -1;
  const idx = INTERVALS.indexOf(v);
  if (idx !== -1) return idx;
  let i = 0;
  while (i + 1 < INTERVALS.length && INTERVALS[i + 1] <= v) i++;
  return i;
}

/** 在阶梯上前进 steps 步（可为 0），结果夹在阶梯首末之间 */
function stepInterval(v, steps) {
  const next = Math.max(0, Math.min(INTERVALS.length - 1, intervalIndex(v) + steps));
  return INTERVALS[next];
}

/**
 * 处理一次学习结果
 * @param {object} card 单词学习状态 {word, state, interval, due, ease, lapses, reps}
 * @param {'again'|'hard'|'good'} rating
 * @returns 更新后的状态
 *
 * 阶梯模型：INTERVALS = [1,3,7,15,30,60,90,120,180,365]
 *   again 忘记 → 间隔归 0，10 分钟后重学
 *   hard 模糊 → 原地踏步（保证 ≥1 天），熟练度微降
 *   good 认识 → 上升一阶，熟练度上升；到 15 天判为已掌握
 */
export function review(card, rating) {
  const now = Date.now();
  const c = { ...card, ease: card.ease || 2.5, lapses: card.lapses || 0, reps: card.reps || 0, interval: card.interval || 0 };

  if (rating === 'again') {
    c.lapses += 1;
    c.interval = 0; // 立即重学
    c.due = now + 10 * 60 * 1000; // 10 分钟后再次出现
    c.ease = Math.max(1.3, c.ease - 0.15);
    c.state = 1;
  } else if (rating === 'hard') {
    c.interval = stepInterval(c.interval, 0); // 原地踏步，但保证 ≥1 天
    c.due = now + c.interval * DAY;
    c.ease = Math.max(1.3, c.ease - 0.05);
    c.state = 1;
  } else { // good
    c.interval = stepInterval(c.interval, 1); // 上升一阶
    c.due = now + c.interval * DAY;
    c.ease = Math.min(3.0, c.ease + 0.05);
    c.state = c.interval >= 15 ? 2 : 1;
  }
  c.reps += 1;
  return c;
}

/** 熟练度：基于间隔和重学次数估算 0-100 */
export function proficiency(card) {
  const interval = card.interval || 0;
  const lapses = card.lapses || 0;
  let p = Math.min(100, interval * 5 + 20 - lapses * 10);
  return Math.max(0, Math.round(p));
}

/**
 * 获取今日学习队列
 * @param {Map} stateMap 单词状态表
 * @param {Array} allWords 所有单词
 * @param {number} newPerDay 每日新词数
 * @returns {{queue: Array, newCount: number, reviewCount: number}}
 */
export function buildQueue(stateMap, allWords, newPerDay) {
  const now = Date.now();
  const today = todayStr();
  const learnedToday = new Set(
    Object.values(stateMap).filter(c => c.lastStudyDate === today).map(c => c.word)
  );
  const queue = [];
  let newCount = 0, reviewCount = 0;

  // 1. 到期的复习词（due <= now 且不是今天已学的）
  const dueReviews = [];
  for (const [w, c] of Object.entries(stateMap)) {
    if (c.due && c.due <= now && c.lastStudyDate !== today) {
      dueReviews.push({ word: w, ...c });
    }
  }
  dueReviews.sort((a, b) => (a.due || 0) - (b.due || 0));
  queue.push(...dueReviews.map(c => ({ word: c.word, type: 'review', card: c })));
  reviewCount = dueReviews.length;

  // 2. 新词（按词库顺序，跳过已学的）
  // 注意：词库对象用 .w 字段存单词（非 .word）
  const learnedSet = new Set(Object.keys(stateMap));
  const wordKey = (w) => (w.word !== undefined ? w.word : w.w);
  let newWords = [];
  for (const w of allWords) {
    if (!learnedSet.has(wordKey(w))) {
      newWords.push(w);
      if (newWords.length >= newPerDay) break;
    }
  }
  queue.push(...newWords.map(w => ({ word: wordKey(w), type: 'new', card: null })));
  newCount = newWords.length;

  // 去重（同一词可能既是复习又新学，取复习）
  const seen = new Set();
  const result = [];
  for (const item of queue) {
    if (!seen.has(item.word)) {
      seen.add(item.word);
      result.push(item);
    }
  }
  return { queue: result, newCount, reviewCount };
}

/** 计算连续打卡天数 */
export function streakDays(history) {
  let streak = 0;
  const d = new Date();
  // 今天没学，从昨天开始算
  if (!history[todayStr(d)]) d.setDate(d.getDate() - 1);
  while (history[todayStr(d)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** 学习日历数据：近 N 天每天学了多少词 */
export function calendarData(history, days = 70) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ts = todayStr(d);
    out.push({ date: ts, count: history[ts] || 0 });
  }
  return out;
}
