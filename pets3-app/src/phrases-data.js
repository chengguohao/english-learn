/**
 * 生活短语数据（PETS-3 词汇学习应用）
 *
 * 每条格式：
 *   {
 *     en:       英文句子,
 *     cn:       中文翻译,
 *     mood:     "funny" | "poetic" | "life" | "inspirational",
 *     font:     "rounded" | "sharp" | "elegant",
 *     gradient: CSS 渐变背景字符串,
 *     pattern:  SVG data URI 纹理图案（低透明度叠加在渐变之上）
 *   }
 *
 * mood 说明：
 *   funny         —— 搞笑的（暖色/活泼，圆角字体，圆点/彩纸纹理）
 *   poetic        —— 诗意的（冷色/梦幻，优雅字体，星辰/流线纹理）
 *   life          —— 生活小例子（自然/暖色，圆角字体，叶形/有机纹理）
 *   inspirational —— 励志的（大胆/戏剧性，锐利字体，几何/射线纹理）
 */

/* ─────────────────────────────────────────────
 * SVG 纹理图案（data URI，低透明度 0.10–0.20）
 * 每种 mood 提供 3 种变体循环使用
 * ───────────────────────────────────────────── */

// funny —— 圆点 / 彩纸 / 大圆点
const PAT_FUNNY_DOT =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='4' fill='white' fill-opacity='0.15'/%3E%3C/svg%3E";

const PAT_FUNNY_CONFETTI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect x='10' y='10' width='6' height='6' fill='white' fill-opacity='0.18' transform='rotate(15 13 13)'/%3E%3Ccircle cx='40' cy='20' r='3' fill='white' fill-opacity='0.15'/%3E%3Crect x='20' y='40' width='5' height='5' fill='white' fill-opacity='0.18' transform='rotate(45 22 42)'/%3E%3Ccircle cx='50' cy='45' r='2' fill='white' fill-opacity='0.15'/%3E%3C/svg%3E";

const PAT_FUNNY_BIGDOT =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Ccircle cx='25' cy='25' r='7' fill='white' fill-opacity='0.12'/%3E%3C/svg%3E";

// poetic —— 五角星 / 流线 / 星群
const PAT_POETIC_STAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40 12 L44 30 L62 32 L48 44 L52 62 L40 52 L28 62 L32 44 L18 32 L36 30 Z' fill='white' fill-opacity='0.15'/%3E%3C/svg%3E";

const PAT_POETIC_CURVE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cpath d='M0 50 Q25 18 50 50 T100 50' stroke='white' stroke-width='1.5' fill='none' stroke-opacity='0.15'/%3E%3Cpath d='M0 70 Q25 38 50 70 T100 70' stroke='white' stroke-width='1' fill='none' stroke-opacity='0.1'/%3E%3C/svg%3E";

const PAT_POETIC_CLUSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='14' cy='14' r='1.5' fill='white' fill-opacity='0.2'/%3E%3Ccircle cx='44' cy='22' r='1' fill='white' fill-opacity='0.15'/%3E%3Ccircle cx='30' cy='44' r='2' fill='white' fill-opacity='0.18'/%3E%3Ccircle cx='50' cy='50' r='1' fill='white' fill-opacity='0.12'/%3E%3C/svg%3E";

// life —— 叶片 / 有机同心圆 / 双叶
const PAT_LIFE_LEAF =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 4 Q31 16 20 36 Q9 16 20 4 Z' fill='white' fill-opacity='0.15'/%3E%3C/svg%3E";

const PAT_LIFE_ORGANIC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='16' fill='none' stroke='white' stroke-width='1' stroke-opacity='0.15'/%3E%3Ccircle cx='30' cy='30' r='9' fill='none' stroke='white' stroke-width='1' stroke-opacity='0.12'/%3E%3C/svg%3E";

const PAT_LIFE_DOUBLELEAF =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Cpath d='M25 8 Q36 20 25 42 Q14 20 25 8 Z' fill='white' fill-opacity='0.12'/%3E%3Cpath d='M25 14 Q33 22 25 36 Q17 22 25 14 Z' fill='white' fill-opacity='0.1'/%3E%3C/svg%3E";

// inspirational —— 交叉线 / 射线 / 斜线
const PAT_INSP_CROSS =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cline x1='0' y1='0' x2='40' y2='40' stroke='white' stroke-width='1.5' stroke-opacity='0.15'/%3E%3Cline x1='40' y1='0' x2='0' y2='40' stroke='white' stroke-width='1.5' stroke-opacity='0.15'/%3E%3C/svg%3E";

const PAT_INSP_RAYS =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cline x1='0' y1='0' x2='100' y2='50' stroke='white' stroke-width='1' stroke-opacity='0.15'/%3E%3Cline x1='0' y1='0' x2='50' y2='100' stroke='white' stroke-width='1' stroke-opacity='0.15'/%3E%3Cline x1='0' y1='0' x2='100' y2='100' stroke='white' stroke-width='1' stroke-opacity='0.1'/%3E%3C/svg%3E";

const PAT_INSP_DIAGONAL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Cline x1='0' y1='30' x2='30' y2='0' stroke='white' stroke-width='2' stroke-opacity='0.12'/%3E%3C/svg%3E";

/* ─────────────────────────────────────────────
 * PHRASES 主数组
 * ───────────────────────────────────────────── */

export const PHRASES = [
  // ═══════════════════════════════════════════
  //  FUNNY  搞笑的（8 条）
  //  暖色/活泼渐变 · 圆角字体 · 圆点/彩纸纹理
  // ═══════════════════════════════════════════
  {
    en: "I'm not lazy, I'm just on energy-saving mode like my phone all day long.",
    cn: "我不是懒，我就像手机一样，整天都处于节能模式。",
    mood: "funny",
    font: "rounded",
    gradient: "linear-gradient(135deg, #FF6B6B, #FFE66D)",
    pattern: PAT_FUNNY_DOT,
    img: "https://images.unsplash.com/photo-1543467091-5f0406620f8b?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "My bed and I have a very special relationship — we are perfect for each other.",
    cn: "我和我的床有着非常特殊的关系——我们是天作之合。",
    mood: "funny",
    font: "rounded",
    gradient: "linear-gradient(135deg, #FF8E53, #FE6B8B)",
    pattern: PAT_FUNNY_CONFETTI,
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "I put the 'pro' in procrastinate, and I am honestly very proud of it.",
    cn: "我是“拖延”里的“专业”人士，而且说实话我还挺自豪的。",
    mood: "funny",
    font: "rounded",
    gradient: "linear-gradient(135deg, #FDC830, #F37335)",
    pattern: PAT_FUNNY_BIGDOT,
    img: "https://images.unsplash.com/photo-1517242810446-cc8951b2be40?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "I'm not arguing with you, I'm just explaining why I am absolutely right.",
    cn: "我不是在和你吵架，我只是在解释为什么我完全正确。",
    mood: "funny",
    font: "rounded",
    gradient: "linear-gradient(135deg, #FF9A9E, #FECFEF)",
    pattern: PAT_FUNNY_DOT,
    img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "My wallet is like an onion — opening it always makes me want to cry.",
    cn: "我的钱包就像洋葱——每次打开它，我都想哭。",
    mood: "funny",
    font: "rounded",
    gradient: "linear-gradient(135deg, #FFB347, #FFCC33)",
    pattern: PAT_FUNNY_CONFETTI,
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "I followed my heart this morning, and it led me straight to the refrigerator.",
    cn: "今天早上我跟着心走，它直接把我带到了冰箱面前。",
    mood: "funny",
    font: "rounded",
    gradient: "linear-gradient(135deg, #FF6B9D, #FEC163)",
    pattern: PAT_FUNNY_BIGDOT,
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "I am on a strict seafood diet — I see food and then I eat it immediately.",
    cn: "我正在进行严格的海鲜饮食——我看见食物就立刻吃掉。",
    mood: "funny",
    font: "rounded",
    gradient: "linear-gradient(135deg, #F8B500, #FC5B6C)",
    pattern: PAT_FUNNY_DOT,
    img: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "Common sense is like deodorant — the people who need it most never use it.",
    cn: "常识就像除臭剂——最需要它的人从来都不用。",
    mood: "funny",
    font: "rounded",
    gradient: "linear-gradient(135deg, #FF677D, #FFA07A)",
    pattern: PAT_FUNNY_CONFETTI,
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1200&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════
  //  POETIC  诗意的（8 条）
  //  冷色/梦幻渐变 · 优雅字体 · 星辰/流线纹理
  // ═══════════════════════════════════════════
  {
    en: "The moon doesn't consider one phase better than another; it simply shines when it can.",
    cn: "月亮从不认为哪个阶段比另一个更好，它只是在能闪耀时便闪耀。",
    mood: "poetic",
    font: "elegant",
    gradient: "linear-gradient(135deg, #667eea, #764ba2)",
    pattern: PAT_POETIC_STAR,
    img: "https://images.unsplash.com/photo-1532978879514-6cac7b25b6f8?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "Stars cannot shine without darkness, and the night gives them their beautiful stage.",
    cn: "星星没有黑暗就无法闪耀，而夜空给了它们最美的舞台。",
    mood: "poetic",
    font: "elegant",
    gradient: "linear-gradient(135deg, #2E3192, #1BFFFF)",
    pattern: PAT_POETIC_CURVE,
    img: "https://images.unsplash.com/photo-1532012196267-ca84d911f1d0?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "The wind whispers ancient secrets to those who are patient enough to truly listen.",
    cn: "风会向那些足够耐心、真正倾听的人低语古老的秘密。",
    mood: "poetic",
    font: "elegant",
    gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
    pattern: PAT_POETIC_CLUSTER,
    img: "https://images.unsplash.com/photo-1499415479124-43c32433a620?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "Every sunset is a beautiful opportunity to reset and begin again with fresh eyes.",
    cn: "每一次日落都是一个美丽的契机，让人以全新的目光重新开始。",
    mood: "poetic",
    font: "elegant",
    gradient: "linear-gradient(135deg, #5B86E5, #36D1DC)",
    pattern: PAT_POETIC_STAR,
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "The ocean stirs the heart, inspires the imagination, and brings eternal joy to the soul.",
    cn: "大海触动心灵，激发想象，给灵魂带来永恒的喜悦。",
    mood: "poetic",
    font: "elegant",
    gradient: "linear-gradient(135deg, #614385, #516395)",
    pattern: PAT_POETIC_CURVE,
    img: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "Rain is just confetti from the sky, celebrating the beauty of a quiet afternoon.",
    cn: "雨不过是天空洒下的彩纸，庆祝着一个宁静午后的美好。",
    mood: "poetic",
    font: "elegant",
    gradient: "linear-gradient(135deg, #3A1C71, #D76D77)",
    pattern: PAT_POETIC_CLUSTER,
    img: "https://images.unsplash.com/photo-1515694346937-94d85e39f29a?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "A river cuts through rock not by its power, but by its sheer persistence over time.",
    cn: "河流穿透岩石，不靠力量，而靠日复一日的坚持。",
    mood: "poetic",
    font: "elegant",
    gradient: "linear-gradient(135deg, #4568DC, #B06AB3)",
    pattern: PAT_POETIC_STAR,
    img: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "The night sky is a vast library of stories that have never been told before.",
    cn: "夜空是一座浩瀚的图书馆，收藏着从未被讲述过的故事。",
    mood: "poetic",
    font: "elegant",
    gradient: "linear-gradient(135deg, #00C9FF, #92FE9D)",
    pattern: PAT_POETIC_CURVE,
    img: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=1200&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════
  //  LIFE  生活小例子（8 条）
  //  自然/暖色渐变 · 圆角字体 · 叶形/有机纹理
  // ═══════════════════════════════════════════
  {
    en: "A warm cup of coffee in the morning makes everything feel just a little better.",
    cn: "清晨一杯热咖啡，让一切都感觉好了一些。",
    mood: "life",
    font: "rounded",
    gradient: "linear-gradient(135deg, #56ab2f, #a8e063)",
    pattern: PAT_LIFE_LEAF,
    img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "The best things in life are always the people we love and the memories we share.",
    cn: "生活中最美好的事物，永远是我们爱的人和共同分享的回忆。",
    mood: "life",
    font: "rounded",
    gradient: "linear-gradient(135deg, #D4A373, #FAEDCD)",
    pattern: PAT_LIFE_ORGANIC,
    img: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "Sometimes the smallest things in life take up the most room in your heart.",
    cn: "有时候，生活中最小的东西却占据了心里最大的空间。",
    mood: "life",
    font: "rounded",
    gradient: "linear-gradient(135deg, #8B6F47, #C9A66B)",
    pattern: PAT_LIFE_DOUBLELEAF,
    img: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "Home is not just a place you live in; it is a warm feeling of truly belonging.",
    cn: "家不仅是你居住的地方，它是一种真正归属的温暖感觉。",
    mood: "life",
    font: "rounded",
    gradient: "linear-gradient(135deg, #6B8E23, #C5D86D)",
    pattern: PAT_LIFE_LEAF,
    img: "https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "A good book and a warm bath on a rainy day can fix almost anything in life.",
    cn: "雨天里一本好书和一个热水澡，几乎能治愈生活中的一切。",
    mood: "life",
    font: "rounded",
    gradient: "linear-gradient(135deg, #A0522D, #DEB887)",
    pattern: PAT_LIFE_ORGANIC,
    img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "Sunday mornings are made for slow breakfasts, fresh coffee, and long park walks.",
    cn: "周日早晨就是为慢悠悠的早餐、新鲜咖啡和公园里的长散步而生的。",
    mood: "life",
    font: "rounded",
    gradient: "linear-gradient(135deg, #556B2F, #9ACD32)",
    pattern: PAT_LIFE_DOUBLELEAF,
    img: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "There is nothing quite like the smell of fresh bread baking on a cold winter morning.",
    cn: "没有什么比寒冬早晨新鲜面包烘烤的香味更让人安心的了。",
    mood: "life",
    font: "rounded",
    gradient: "linear-gradient(135deg, #8B7355, #D2B48C)",
    pattern: PAT_LIFE_LEAF,
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "A quiet walk in nature clears the mind and soothes the soul after a long, hard day.",
    cn: "漫长辛劳的一天后，在自然中安静地散步能清醒头脑、抚慰灵魂。",
    mood: "life",
    font: "rounded",
    gradient: "linear-gradient(135deg, #7D8471, #B5C9A3)",
    pattern: PAT_LIFE_ORGANIC,
    img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1200&fit=crop&q=80",
  },

  // ═══════════════════════════════════════════
  //  INSPIRATIONAL  励志的（6 条）
  //  大胆/戏剧性渐变 · 锐利字体 · 几何/射线纹理
  // ═══════════════════════════════════════════
  {
    en: "The only way to do great work is to truly love what you do every single day.",
    cn: "做出伟大工作的唯一方法，就是每天真正热爱你所做的事。",
    mood: "inspirational",
    font: "sharp",
    gradient: "linear-gradient(135deg, #c31432, #240b36)",
    pattern: PAT_INSP_CROSS,
    img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "Success is not final, failure is not fatal — it is the courage to continue that counts.",
    cn: "成功不是终点，失败也不是末日——重要的是继续前行的勇气。",
    mood: "inspirational",
    font: "sharp",
    gradient: "linear-gradient(135deg, #FF512F, #DD2476)",
    pattern: PAT_INSP_RAYS,
    img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "The future belongs to those who believe in the beauty of their own dreams and aspirations.",
    cn: "未来属于那些相信自己梦想与抱负之美的人。",
    mood: "inspirational",
    font: "sharp",
    gradient: "linear-gradient(135deg, #F7971E, #FFD200)",
    pattern: PAT_INSP_DIAGONAL,
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "Don't watch the clock — just do what it does, and keep going no matter what happens.",
    cn: "别盯着时钟看——像它一样，无论发生什么都继续走下去。",
    mood: "inspirational",
    font: "sharp",
    gradient: "linear-gradient(135deg, #200122, #6f0000)",
    pattern: PAT_INSP_CROSS,
    img: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "Believe you can, and you are already halfway there — the rest is just hard work.",
    cn: "相信你能行，你就已经成功了一半——剩下的只是努力。",
    mood: "inspirational",
    font: "sharp",
    gradient: "linear-gradient(135deg, #1a2980, #26d0ce)",
    pattern: PAT_INSP_RAYS,
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop&q=80",
  },
  {
    en: "The harder you work for something, the greater you will feel when you finally achieve it.",
    cn: "你为某件事越是努力，最终实现时的成就感就越发强烈。",
    mood: "inspirational",
    font: "sharp",
    gradient: "linear-gradient(135deg, #cb2d3e, #ef473a)",
    pattern: PAT_INSP_DIAGONAL,
    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=1200&fit=crop&q=80",
  },
];
