/**
 * 发音模块：在线 TTS 优先 → Android 原生 TTS → Web Speech API 兜底
 * 优先选择明亮、清晰的女声语音
 */

let nativeTTS = null;
try {
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech) {
    nativeTTS = window.Capacitor.Plugins.TextToSpeech;
  }
} catch (e) { /* ignore */ }

export function isNativeTTS() { return !!nativeTTS; }

// ============ 在线高质量语音列表（Microsoft Edge TTS 神经网络语音） ============
// 基于 wangwangit/tts 项目部署的 Edge TTS 服务（兼容 OpenAI API 格式）
// 支持单词和句子，质量极高，CORS 已开启，浏览器和 APK 均可使用
// 项目地址: https://github.com/wangwangit/tts
const TTS_API = 'https://tts.wangwangit.com/v1/audio/speech';

export const ONLINE_VOICES = [
  { id: 'en-US-JennyNeural',  name: 'Jenny',   desc: '美国女声 · 温暖自然（推荐）', lang: 'en-US', gender: 'female' },
  { id: 'en-US-AriaNeural',   name: 'Aria',    desc: '美国女声 · 清亮专业',       lang: 'en-US', gender: 'female' },
  { id: 'en-US-GuyNeural',    name: 'Guy',     desc: '美国男声 · 沉稳有力',       lang: 'en-US', gender: 'male' },
  { id: 'en-US-AnaNeural',    name: 'Ana',     desc: '美国儿童女声 · 活泼',       lang: 'en-US', gender: 'female' },
  { id: 'en-GB-SoniaNeural',  name: 'Sonia',   desc: '英国女声 · 优雅',           lang: 'en-GB', gender: 'female' },
  { id: 'en-GB-RyanNeural',   name: 'Ryan',    desc: '英国男声 · 沉稳',           lang: 'en-GB', gender: 'male' },
];

// 用户选择的在线语音 ID（null 表示未选择，使用本地 TTS）
let selectedOnlineVoice = null;

/** 设置用户选择的在线语音 */
export function setOnlineVoice(voiceId) {
  selectedOnlineVoice = voiceId;
}

/** 获取用户选择的在线语音 */
export function getOnlineVoice() {
  return selectedOnlineVoice;
}

/** 获取在线语音信息 */
function getOnlineVoiceInfo(voiceId) {
  return ONLINE_VOICES.find(v => v.id === voiceId);
}

/** 在线 TTS 播放（通过 Edge TTS API，支持单词和句子） */
function speakOnline(text, voiceId) {
  return new Promise((resolve, reject) => {
    const info = getOnlineVoiceInfo(voiceId);
    if (!info) { reject(new Error('unknown voice')); return; }
    fetch(TTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: text,
        voice: info.id,
        speed: 1.0,
        pitch: '0',
        style: 'general',
      }),
    })
      .then(resp => {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
        audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('audio error')); };
        audio.play().catch(reject);
      })
      .catch(reject);
  });
}

// ============ 本地 Web Speech API ============

// 优选语音名称列表（按优先级排列，明亮清晰的女声优先）
const PREFERRED_VOICES = [
  'Google US English',
  'Microsoft Aria',
  'Microsoft Jenny',
  'Microsoft Zira',
  'Samantha',
  'Microsoft Michelle',
  'Microsoft Amber',
  'Microsoft Susan',
  'Google UK English Female',
  'Karen',
  'Serena',
  'Microsoft Catherine',
];

let cachedVoice = null;
let voicesLoaded = false;

/** 从可用语音中选出最佳语音 */
function pickBestVoice(voices) {
  if (!voices || !voices.length) return null;
  // 1. 按优选名单匹配
  for (const name of PREFERRED_VOICES) {
    const v = voices.find(v => v.name && v.name.includes(name));
    if (v) return v;
  }
  // 2. 优先选 en-US 的女声 / 本地语音（质量更好）
  const enUS = voices.filter(v => v.lang === 'en-US');
  const enUSLocal = enUS.filter(v => v.localService);
  if (enUSLocal.length) return enUSLocal[0];
  if (enUS.length) return enUS[0];
  // 3. 任意英语语音
  const en = voices.filter(v => v.lang && v.lang.startsWith('en'));
  if (en.length) return en[0];
  return voices[0];
}

/** 初始化语音列表（异步，在 voiceschanged 后重新选择） */
function initVoices() {
  if (!window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) {
    voicesLoaded = true;
    cachedVoice = pickBestVoice(voices);
  }
}

// 监听语音列表变化（某些浏览器异步加载语音）
if (window.speechSynthesis) {
  initVoices();
  window.speechSynthesis.onvoiceschanged = initVoices;
}

/** 用 Web Speech API 朗读 */
function speakLocal(text, lang = 'en-US') {
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      if (!voicesLoaded) initVoices();
      if (!cachedVoice) initVoices();

      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.9;
      u.pitch = 1.1;
      u.volume = 1.0;

      if (cachedVoice) {
        u.voice = cachedVoice;
      } else {
        const voices = window.speechSynthesis.getVoices();
        const v = pickBestVoice(voices);
        if (v) u.voice = v;
      }

      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }
}

/**
 * 朗读单词（或句子）
 * 策略：
 *   - 选择了在线语音 → Edge TTS（神经网络语音，单词和句子都高质量）
 *     · 在线失败时自动回退到本地 TTS
 *   - 无在线语音 → 原生 TTS → Web Speech API
 * @param {string} text
 * @param {string} lang 'en-US' | 'en-GB'
 */
export function speak(text, lang = 'en-US') {
  if (!text) return;

  // 选择了在线语音 → Edge TTS（支持单词和句子）
  if (selectedOnlineVoice) {
    speakOnline(text, selectedOnlineVoice).catch(() => {
      // 在线失败，回退到本地 TTS
      speakLocal(text, lang);
    });
    return;
  }

  // 无在线语音 → 原生 TTS → Web Speech API
  if (nativeTTS) {
    try {
      nativeTTS.speak({ text, lang, rate: 0.9 });
      return;
    } catch (e) { /* fallthrough */ }
  }
  speakLocal(text, lang);
}
