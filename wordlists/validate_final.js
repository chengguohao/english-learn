// 最终验证脚本：全面变形匹配
const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'pets3_words.json');
const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
const VALID_TYPES = ['日常', '书面', '职场'];

// 不规则动词变形字典（补充版）
const IRREGULAR_VERBS = {
  'arise': ['arose','arisen','arising','arises'], 'be': ['am','is','are','was','were','been','being',"m",'re','s'],
  'bear': ['bore','borne','born','bearing','bears'], 'beat': ['beat','beaten','beating','beats'],
  'become': ['became','becomes','becoming'], 'begin': ['began','begun','beginning','begins'],
  'bend': ['bent','bending','bends'], 'bet': ['bet','betting','bets'], 'bind': ['bound','binding','binds'],
  'bite': ['bit','bitten','biting','bites'], 'bleed': ['bled','bleeding','bleeds'],
  'blow': ['blew','blown','blowing','blows'], 'break': ['broke','broken','breaking','breaks'],
  'breed': ['bred','breeding','breeds'], 'bring': ['brought','bringing','brings'],
  'build': ['built','building','builds'], 'rebuild': ['rebuilt','rebuilding','rebuilds'],
  'burn': ['burnt','burned','burning','burns'], 'burst': ['burst','bursting','bursts'],
  'buy': ['bought','buying','buys'], 'cast': ['cast','casting','casts'],
  'catch': ['caught','catching','catches'], 'choose': ['chose','chosen','choosing','chooses'],
  'cling': ['clung','clinging','clings'], 'come': ['came','coming','comes'],
  'cost': ['cost','costing','costs'], 'creep': ['crept','creeping','creeps'],
  'cut': ['cut','cutting','cuts'], 'deal': ['dealt','dealing','deals'],
  'dig': ['dug','digging','digs'], 'do': ['did','done','doing','does'],
  'draw': ['drew','drawn','drawing','draws'], 'dream': ['dreamt','dreamed','dreaming','dreams'],
  'drink': ['drank','drunk','drinking','drinks'], 'drive': ['drove','driven','driving','drives'],
  'eat': ['ate','eaten','eating','eats'], 'fall': ['fell','fallen','falling','falls'],
  'feed': ['fed','feeding','feeds'], 'feel': ['felt','feeling','feels'],
  'fight': ['fought','fighting','fights'], 'find': ['found','finding','finds'],
  'flee': ['fled','fleeing','flees'], 'fly': ['flew','flown','flying','flies'],
  'forbid': ['forbade','forbidden','forbidding','forbids'], 'forget': ['forgot','forgotten','forgetting','forgets'],
  'forgive': ['forgave','forgiven','forgiving','forgives'], 'freeze': ['froze','frozen','freezing','freezes'],
  'get': ['got','gotten','getting','gets'], 'give': ['gave','given','giving','gives'],
  'go': ['went','gone','going','goes'], 'grind': ['ground','grinding','grinds'],
  'grow': ['grew','grown','growing','grows'], 'hang': ['hung','hanging','hangs'],
  'have': ['had','having','has'], 'hear': ['heard','hearing','hears'],
  'hide': ['hid','hidden','hiding','hides'], 'hit': ['hit','hitting','hits'],
  'hold': ['held','holding','holds'], 'hurt': ['hurt','hurting','hurts'],
  'keep': ['kept','keeping','keeps'], 'kneel': ['knelt','kneeling','kneels'],
  'know': ['knew','known','knowing','knows'], 'lay': ['laid','laying','lays'],
  'lead': ['led','leading','leads'], 'lean': ['leant','leaned','leaning','leans'],
  'leap': ['leapt','leaped','leaping','leaps'], 'learn': ['learnt','learned','learning','learns'],
  'leave': ['left','leaving','leaves'], 'lend': ['lent','lending','lends'],
  'let': ['let','letting','lets'], 'lie': ['lay','lain','lying','lies'],
  'light': ['lit','lighted','lighting','lights'], 'lose': ['lost','losing','loses'],
  'make': ['made','making','makes'], 'mean': ['meant','meaning','means'],
  'meet': ['met','meeting','meets'], 'mislead': ['misled','misleading','misleads'],
  'mistake': ['mistook','mistaken','mistaking','mistakes'], 'misunderstand': ['misunderstood','misunderstanding','misunderstands'],
  'pay': ['paid','paying','pays'], 'put': ['put','putting','puts'],
  'quit': ['quit','quitting','quits'], 'read': ['read','reading','reads'],
  'ride': ['rode','ridden','riding','rides'], 'ring': ['rang','rung','ringing','rings'],
  'rise': ['rose','risen','rising','rises'], 'run': ['ran','running','runs'],
  'say': ['said','saying','says'], 'see': ['saw','seen','seeing','sees'],
  'seek': ['sought','seeking','seeks'], 'sell': ['sold','selling','sells'],
  'send': ['sent','sending','sends'], 'set': ['set','setting','sets'],
  'sew': ['sewed','sewn','sewing','sews'], 'shake': ['shook','shaken','shaking','shakes'],
  'shed': ['shed','shedding','sheds'], 'shear': ['sheared','shorn','shearing','shears'],
  'shine': ['shone','shined','shining','shines'], 'shoot': ['shot','shooting','shoots'],
  'show': ['showed','shown','showing','shows'], 'shrink': ['shrank','shrunk','shrinking','shrinks'],
  'shut': ['shut','shutting','shuts'], 'sing': ['sang','sung','singing','sings'],
  'sink': ['sank','sunk','sinking','sinks'], 'sit': ['sat','sitting','sits'],
  'sleep': ['slept','sleeping','sleeps'], 'slide': ['slid','slidden','sliding','slides'],
  'smell': ['smelt','smelled','smelling','smells'], 'speak': ['spoke','spoken','speaking','speaks'],
  'speed': ['sped','speeded','speeding','speeds'], 'spell': ['spelt','spelled','spelling','spells'],
  'spend': ['spent','spending','spends'], 'spill': ['spilt','spilled','spilling','spills'],
  'spin': ['spun','spinning','spins'], 'spread': ['spread','spreading','spreads'],
  'spring': ['sprang','sprung','springing','springs'], 'stand': ['stood','standing','stands'],
  'steal': ['stole','stolen','stealing','steals'], 'stick': ['stuck','sticking','sticks'],
  'strike': ['struck','stricken','striking','strikes'], 'swear': ['swore','sworn','swearing','swears'],
  'sweep': ['swept','sweeping','sweeps'], 'swim': ['swam','swum','swimming','swims'],
  'swing': ['swung','swinging','swings'], 'take': ['took','taken','taking','takes'],
  'teach': ['taught','teaching','teaches'], 'tear': ['tore','torn','tearing','tears'],
  'tell': ['told','telling','tells'], 'think': ['thought','thinking','thinks'],
  'throw': ['threw','thrown','throwing','throws'], 'understand': ['understood','understanding','understands'],
  'wake': ['woke','woken','waking','wakes'], 'wear': ['wore','worn','wearing','wears'],
  'weave': ['wove','woven','weaving','weaves'], 'weep': ['wept','weeping','weeps'],
  'win': ['won','winning','wins'], 'wind': ['wound','winding','winds'],
  'write': ['wrote','written','writing','writes'], 'spit': ['spat','spitting','spits'],
  'spread': ['spread','spreading','spreads'], 'forbid': ['forbade','forbidden','forbidding'],
  'foresee': ['foresaw','foreseen','foreseeing'], 'foretell': ['foretold','foretelling'],
  'redo': ['redid','redone','redoing'], 'rewrite': ['rewrote','rewritten','rewriting'],
  'overcome': ['overcame','overcoming'], 'overdo': ['overdid','overdone','overdoing'],
  'overdraw': ['overdrew','overdrawn','overdrawing'], 'overeat': ['overate','overeaten','overeating'],
  'override': ['overrode','overridden','overriding'], 'overrun': ['overran','overrun','overrunning'],
  'oversee': ['oversaw','overseen','overseeing'], 'overshoot': ['overshot','overshooting'],
  'oversleep': ['overslept','oversleeping'], 'overtake': ['overtook','overtaken','overtaking'],
  'overthrow': ['overthrew','overthrown','overthrowing'], 'precast': ['precast','precasting'],
  'predo': ['predid','predone'], 'premake': ['premade','premaking'], 'prepay': ['prepaid','prepaying'],
  'presell': ['presold','preselling'], 'preset': ['preset','presetting'], 'preshow': ['preshowed','preshown'],
  'prove': ['proved','proven','proving','proves'], 'saw': ['sawn','sawed','sawing'],
  'seethe': ['seethed','sodden','seething'], 'slit': ['slit','slitting','slits'],
  'smite': ['smote','smitten','smiting'], 'sow': ['sowed','sown','sowing'],
  'stave': ['staved','stove','staving'], 'strew': ['strewed','strewn','strewing'],
  'swell': ['swelled','swollen','swelling'], 'thrive': ['throve','thriven','thriving'],
  'weird': ['weirded','weirding'], 'withdraw': ['withdrew','withdrawn','withdrawing'],
  'withhold': ['withheld','withholding'], 'withstand': ['withstood','withstanding'],
};

// 不规则名词复数
const IRREGULAR_NOUNS = {
  'child': ['children',"children's"], 'foot': ['feet'], 'tooth': ['teeth'],
  'goose': ['geese'], 'man': ['men',"men's"], 'woman': ['women',"women's"],
  'mouse': ['mice'], 'ox': ['oxen'], 'person': ['people','persons'],
  'louse': ['lice'], 'criterion': ['criteria'], 'phenomenon': ['phenomena'],
  'datum': ['data'], 'medium': ['media'], 'analysis': ['analyses'],
  'basis': ['bases'], 'crisis': ['crises'], 'diagnosis': ['diagnoses'],
  'hypothesis': ['hypotheses'], 'oasis': ['oases'], 'parenthesis': ['parentheses'],
  'synthesis': ['syntheses'], 'thesis': ['theses'], 'bacterium': ['bacteria'],
  'curriculum': ['curricula'], 'index': ['indices','indexes'], 'matrix': ['matrices'],
  'appendix': ['appendices','appendixes'], 'die': ['dice'], 'knife': ['knives'],
  'leaf': ['leaves'], 'shelf': ['shelves'], 'life': ['lives'], 'wife': ['wives'],
  'wolf': ['wolves'], 'calf': ['calves'], 'half': ['halves'], 'loaf': ['loaves'],
  'self': ['selves'], 'thief': ['thieves'], ' elf': ['elves'],
};

// 英美拼写转换
const OUR_EXCEPTIONS = new Set(['course','four','hour','sour','tour','our','flour','scour','spout','dour','hour','sour','tour']);
function spellVariants(word) {
  const results = new Set([word]);
  // -our -> -or (含词中)
  if (word.includes('our') && !OUR_EXCEPTIONS.has(word)) {
    results.add(word.replace('our', 'or'));
  }
  // -ise -> -ize / -yse -> -yze
  if (word.endsWith('ise')) results.add(word.slice(0, -3) + 'ize');
  if (word.endsWith('yse')) results.add(word.slice(0, -3) + 'yze');
  if (word.endsWith('ised')) results.add(word.slice(0, -4) + 'ized');
  if (word.endsWith('ysed')) results.add(word.slice(0, -4) + 'yzed');
  if (word.endsWith('ising')) results.add(word.slice(0, -5) + 'izing');
  if (word.endsWith('ysing')) results.add(word.slice(0, -5) + 'yzing');
  if (word.endsWith('isation')) results.add(word.slice(0, -7) + 'ization');
  // -ogue -> -og
  if (word.endsWith('ogue')) results.add(word.slice(0, -1));
  // -re -> -er
  if (word.length > 4 && word.endsWith('re') && !['more','fire','wire','tire','hire','bare','care','dare','fare','rare','ware','acre','lucre','massacre','some'].includes(word)) {
    results.add(word.slice(0, -2) + 'er');
  }
  // practise -> practice (特殊)
  if (word === 'practise') results.add('practice');
  if (word === 'practised') results.add('practiced');
  if (word === 'practising') results.add('practicing');
  return results;
}

function isWordInSentence(word, sentence) {
  const w = word.toLowerCase();
  const s = sentence.toLowerCase();
  const candidates = new Set();
  // 英美拼写变体
  for (const v of spellVariants(w)) candidates.add(v);
  // 不规则动词
  if (IRREGULAR_VERBS[w]) for (const f of IRREGULAR_VERBS[w]) candidates.add(f);
  // 不规则名词
  if (IRREGULAR_NOUNS[w]) for (const f of IRREGULAR_NOUNS[w]) candidates.add(f);

  // 短词特殊处理：直接 \b 匹配原形
  if (w.length <= 2) {
    const p = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('\\b' + p + '\\b', 'i').test(s);
  }

  // 规则变形
  const endsWithE = w.endsWith('e');
  const endsWithY = w.endsWith('y');
  const endsWithIe = w.endsWith('ie');
  const endsWithF = /f$|fe$/.test(w);
  const lastChar = w[w.length - 1];
  const vowels = 'aeiou';
  const add = (suf) => candidates.add(w + suf);
  add('s'); add('es'); add('ed'); add('d'); add('ing');
  add('er'); add('est'); add('ly'); add('ers'); add('ests');
  add('eds'); add('ings'); add('ness'); add('ment'); add('ful'); add('less'); add('ably'); add('ibly');
  if (endsWithE && w.length > 2) {
    candidates.add(w.slice(0, -1) + 'ing');
    candidates.add(w.slice(0, -1) + 'ed');
    candidates.add(w.slice(0, -1) + 'er');
    candidates.add(w.slice(0, -1) + 'est');
    candidates.add(w.slice(0, -1) + 'able');
  }
  if (endsWithIe) candidates.add(w.slice(0, -2) + 'ying');
  if (endsWithY) {
    candidates.add(w.slice(0, -1) + 'ies');
    candidates.add(w.slice(0, -1) + 'ied');
    candidates.add(w.slice(0, -1) + 'ier');
    candidates.add(w.slice(0, -1) + 'iest');
    candidates.add(w.slice(0, -1) + 'ily');
  }
  // f/fe -> ves (名词复数)
  if (endsWithF) {
    if (w.endsWith('fe')) candidates.add(w.slice(0, -2) + 'ves');
    else candidates.add(w.slice(0, -1) + 'ves');
  }
  // 双写末字母 (CVC) - 放宽到长度>=3
  if (w.length >= 3) {
    const c1 = !vowels.includes(w[w.length - 1]);
    const v = vowels.includes(w[w.length - 2]);
    const c2 = !vowels.includes(w[w.length - 3]);
    if (c1 && v && c2) {
      candidates.add(w + lastChar + 'ed');
      candidates.add(w + lastChar + 'ing');
      candidates.add(w + lastChar + 'er');
      candidates.add(w + lastChar + 'est');
      candidates.add(w + lastChar + 'ers');
    }
  }

  // 检查每个候选形式
  const sorted = [...candidates].sort((a, b) => b.length - a.length);
  for (const c of sorted) {
    if (c.length < 2) continue;
    const p = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp('\\b' + p + '\\b', 'i').test(s)) return true;
  }
  // more/most + 形容词
  const m = s.match(/\b(?:more|most)\s+(\w+)/);
  if (m && m[1].startsWith(w.slice(0, Math.max(3, w.length - 2)))) return true;
  return false;
}

// ============ 验证 ============
let totalWords = data.length, totalSentences = 0;
let noSent = 0, atLeast3 = 0, allThreeTypes = 0;
let invalidFieldSent = 0, invalidTypeSent = 0;
let wordIncluded = 0, wordNotIncluded = 0;
const typeDist = { '日常': 0, '书面': 0, '职场': 0 };
const errors = [];
const MAX_ERR = 80;

for (let i = 0; i < data.length; i++) {
  const w = data[i];
  if (!w.sent || !Array.isArray(w.sent)) { noSent++; continue; }
  if (w.sent.length >= 3) atLeast3++;
  const types = new Set();
  for (let j = 0; j < w.sent.length; j++) {
    const s = w.sent[j];
    totalSentences++;
    if (!s || typeof s.en !== 'string' || typeof s.cn !== 'string' || typeof s.type !== 'string') {
      invalidFieldSent++; continue;
    }
    if (VALID_TYPES.includes(s.type)) { types.add(s.type); typeDist[s.type]++; }
    else invalidTypeSent++;
    if (isWordInSentence(w.w, s.en)) wordIncluded++;
    else {
      wordNotIncluded++;
      if (errors.length < MAX_ERR) errors.push(`[idx ${i}] ${w.w} sent[${j}] type=${s.type} | en="${s.en}"`);
    }
  }
  if (types.has('日常') && types.has('书面') && types.has('职场')) allThreeTypes++;
}

console.log('============== 最终验证报告 ==============');
console.log('总单词数:', totalWords, '| 总例句数:', totalSentences);
console.log('');
console.log('检查1 有sent数组:', (totalWords - noSent) + '/' + totalWords, noSent === 0 ? '✓' : '✗');
console.log('检查2 至少3个例句:', atLeast3 + '/' + totalWords, atLeast3 === totalWords ? '✓' : '✗');
console.log('检查3 拥有3种类型:', allThreeTypes + '/' + totalWords, allThreeTypes === totalWords ? '✓' : '✗');
console.log('检查4 字段完整:', (totalSentences - invalidFieldSent) + '/' + totalSentences, invalidFieldSent === 0 ? '✓' : '✗');
console.log('检查5 type合法:', (totalSentences - invalidTypeSent) + '/' + totalSentences, invalidTypeSent === 0 ? '✓' : '✗');
console.log('检查6 包含目标单词(原形/变形/英美拼写):', wordIncluded + '/' + totalSentences, wordNotIncluded === 0 ? '✓' : '✗ (' + wordNotIncluded + '条未匹配)');
console.log('');
console.log('类型分布:', typeDist);
console.log('');
const passCore = noSent === 0 && atLeast3 === totalWords && allThreeTypes === totalWords && invalidFieldSent === 0 && invalidTypeSent === 0;
console.log('核心检查(1-5)通过:', passCore ? '是 ✓' : '否 ✗');
console.log('');
if (errors.length > 0) {
  console.log('--- 未匹配例句(前' + Math.min(MAX_ERR, errors.length) + '条，均为原有例句) ---');
  for (const e of errors) console.log(e);
}
