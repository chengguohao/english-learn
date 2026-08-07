/**
 * 常见英语词根词缀数据（PETS-3 级别）
 * 每条：{ root: 词根, meaning: 含义, origin: 来源, words: [相关单词...] }
 */

export const ROOTS = [
  // ====== 前缀 ======
  { root: 'un-', meaning: '不、非、相反', origin: '古英语', type: 'prefix', words: ['unable', 'unfair', 'unknown', 'unlike', 'unlikely', 'unusual', 'unwilling'] },
  { root: 'in-/im-/il-/ir-', meaning: '不、无、非', origin: '拉丁语', type: 'prefix', words: ['invisible', 'impossible', 'illegal', 'irregular', 'independent', 'incorrect'] },
  { root: 'dis-', meaning: '不、消失、分离', origin: '拉丁语', type: 'prefix', words: ['disagree', 'disappear', 'discover', 'dishonest', 'dislike', 'disorder'] },
  { root: 're-', meaning: '再、重新、回', origin: '拉丁语', type: 'prefix', words: ['return', 'review', 'reuse', 'rebuild', 'recall', 'recover', 'reduce', 'reflect'] },
  { root: 'pre-', meaning: '在前、预先', origin: '拉丁语', type: 'prefix', words: ['prepare', 'prevent', 'preview', 'predict', 'prefer', 'previous'] },
  { root: 'over-', meaning: '超过、过度', origin: '古英语', type: 'prefix', words: ['overcome', 'overlook', 'overseas', 'overweight', 'overtake'] },
  { root: 'under-', meaning: '在下、不足', origin: '古英语', type: 'prefix', words: ['understand', 'undergo', 'underline', 'underline', 'undertake'] },
  { root: 'ex-', meaning: '出、外、前任', origin: '拉丁语', type: 'prefix', words: ['export', 'exit', 'expand', 'expect', 'explain', 'expose', 'express'] },
  { root: 'sub-/suc-/suf-', meaning: '在下面、次', origin: '拉丁语', type: 'prefix', words: ['subject', 'submit', 'succeed', 'suffer', 'suggest', 'support'] },
  { root: 'trans-', meaning: '横跨、转移', origin: '拉丁语', type: 'prefix', words: ['translate', 'transport', 'transfer', 'transform', 'transmit'] },

  // ====== 后缀 ======
  { root: '-able/-ible', meaning: '可…的、能…的', origin: '拉丁语', type: 'suffix', words: ['able', 'available', 'comfortable', 'possible', 'reasonable', 'visible'] },
  { root: '-tion/-sion', meaning: '行为、状态、结果', origin: '拉丁语', type: 'suffix', words: ['action', 'attention', 'education', 'decision', 'conclusion', 'direction'] },
  { root: '-er/-or', meaning: '做…的人/物', origin: '古英语/拉丁语', type: 'suffix', words: ['teacher', 'worker', 'actor', 'director', 'creator', 'editor'] },
  { root: '-ful', meaning: '充满…的', origin: '古英语', type: 'suffix', words: ['beautiful', 'careful', 'helpful', 'useful', 'wonderful', 'successful'] },
  { root: '-less', meaning: '无…的、不', origin: '古英语', type: 'suffix', words: ['careless', 'endless', 'homeless', 'hopeless', 'useless'] },
  { root: '-ment', meaning: '行为、过程、结果', origin: '拉丁语', type: 'suffix', words: ['achievement', 'development', 'environment', 'government', 'movement', 'agreement'] },
  { root: '-ness', meaning: '状态、性质', origin: '古英语', type: 'suffix', words: ['business', 'darkness', 'fairness', 'illness', 'weakness', 'awareness'] },
  { root: '-ly', meaning: '以…方式（副词）', origin: '古英语', type: 'suffix', words: ['badly', 'carefully', 'clearly', 'finally', 'quickly', 'really'] },
  { root: '-ize/-ise', meaning: '使…化', origin: '希腊语', type: 'suffix', words: ['organize', 'realize', 'recognize', 'specialize', 'emphasize'] },

  // ====== 词根 ======
  { root: 'spect', meaning: '看', origin: '拉丁语', type: 'root', words: ['inspect', 'respect', 'aspect', 'suspect', 'expect', 'perspective'] },
  { root: 'port', meaning: '搬运、携带', origin: '拉丁语', type: 'root', words: ['import', 'export', 'transport', 'report', 'support', 'portable'] },
  { root: 'dict', meaning: '说、言', origin: '拉丁语', type: 'root', words: ['dictate', 'dictionary', 'predict', 'contradict'] },
  { root: 'duct/duke', meaning: '引导、领导', origin: '拉丁语', type: 'root', words: ['conduct', 'introduce', 'produce', 'reduce', 'educate'] },
  { root: 'ject', meaning: '投、掷', origin: '拉丁语', type: 'root', words: ['inject', 'object', 'project', 'reject', 'subject'] },
  { root: 'mit/miss', meaning: '送、发', origin: '拉丁语', type: 'root', words: ['admit', 'commit', 'emit', 'permit', 'submit', 'transmit', 'dismiss'] },
  { root: 'scrib/script', meaning: '写', origin: '拉丁语', type: 'root', words: ['describe', 'inscribe', 'prescribe', 'subscribe', 'script'] },
  { root: 'tract', meaning: '拉、拖', origin: '拉丁语', type: 'root', words: ['attract', 'contract', 'distract', 'extract', 'subtract'] },
  { root: 'vert/vers', meaning: '转', origin: '拉丁语', type: 'root', words: ['convert', 'diverse', 'reverse', 'universe', 'vertical'] },
  { root: 'struct', meaning: '建造', origin: '拉丁语', type: 'root', words: ['construct', 'destroy', 'industry', 'instruct', 'structure'] },
  { root: 'duct', meaning: '引导', origin: '拉丁语', type: 'root', words: ['conduct', 'deduct', 'induct', 'product', 'reduction'] },
  { root: 'press', meaning: '压', origin: '拉丁语', type: 'root', words: ['compress', 'depress', 'express', 'impress', 'pressure'] },
  { root: 'ceed/cess', meaning: '走、让', origin: '拉丁语', type: 'root', words: ['access', 'exceed', 'proceed', 'process', 'succeed', 'success'] },
  { root: 'pose', meaning: '放置', origin: '拉丁语', type: 'root', words: ['compose', 'dispose', 'expose', 'impose', 'oppose', 'propose', 'purpose'] },
  { root: 'tain', meaning: '持有、保持', origin: '拉丁语', type: 'root', words: ['contain', 'maintain', 'obtain', 'retain', 'sustain', 'entertain'] },
  { root: 'fer', meaning: '带来、承载', origin: '拉丁语', type: 'root', words: ['differ', 'infer', 'offer', 'prefer', 'refer', 'transfer'] },
  { root: 'vis/vid', meaning: '看', origin: '拉丁语', type: 'root', words: ['visible', 'visit', 'visual', 'evidence', 'provide', 'video'] },
  { root: 'log', meaning: '言、学', origin: '希腊语', type: 'root', words: ['dialogue', 'logic', 'apology', 'catalog', 'technology'] },
  { root: 'graph', meaning: '写、画', origin: '希腊语', type: 'root', words: ['autograph', 'biography', 'graph', 'paragraph', 'photograph'] },
  { root: 'phon', meaning: '声音', origin: '希腊语', type: 'root', words: ['telephone', 'symphony', 'phonetics', 'microphone'] },
];
