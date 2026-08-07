// 例句生成脚本：为缺少例句的单词补充 日常/书面/职场 三种类型的例句
// 基于词性和释义模板生成，英文例句必须包含目标单词
const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'pets3_words.json');
const raw = fs.readFileSync(FILE_PATH, 'utf8');
const data = JSON.parse(raw);
console.log('总单词数:', data.length);

// ============ 工具函数 ============
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// 清理中文释义：取第一个释义，去掉括号注释和多余空格
function cleanCn(cn) {
  let s = (cn || '').trim();
  // 取第一个释义（中英文分号）
  s = s.split(/[；;]/)[0];
  // 去掉括号注释
  s = s.replace(/[（(].*?[）)]/g, '');
  // 去掉所有空格
  s = s.replace(/\s+/g, '');
  // 去掉末尾标点
  s = s.replace(/[,，。.!！?？、]+$/, '');
  return s.trim();
}

// 解析 def 数组，返回主词性和中文释义
function parseDef(defArr) {
  if (!defArr || defArr.length === 0) return { pos: 'v', cn: '某事' };
  const first = defArr[0];
  const m = first.match(/^(\w+)\s+(.*)/);
  if (m) return { pos: m[1], cn: cleanCn(m[2]) };
  return { pos: 'v', cn: cleanCn(first) };
}

// 词性归类
function categorizePos(pos) {
  pos = (pos || '').toLowerCase();
  if (pos === 'n' || pos === 'noun') return 'n';
  if (pos === 'v' || pos === 'vt' || pos === 'vi' || pos === 'verb') return 'v';
  if (pos === 'adj' || pos === 'a' || pos === 'adjective') return 'adj';
  if (pos === 'adv' || pos === 'adverb') return 'adv';
  if (pos === 'prep' || pos === 'preposition') return 'prep';
  if (pos === 'pron' || pos === 'pronoun') return 'pron';
  if (pos === 'num' || pos === 'number') return 'num';
  if (pos === 'conj' || pos === 'conjunction') return 'conj';
  if (pos === 'int' || pos === 'interjection') return 'int';
  if (pos === 'aux' || pos === 'auxiliary') return 'aux';
  if (pos === 'art' || pos === 'article') return 'art';
  return 'v'; // 默认按动词处理
}

// ============ 模板定义 ============
// 每个模板: { en: 含{w}或{W}, cn: 含{c} }
// {w} = 单词原形, {W} = 首字母大写, {c} = 中文释义

const TEMPLATES = {
  // ===== 名词 n =====
  n: {
    '日常': [
      { en: "The {w} is very common in our daily life.", cn: "{c}在我们的日常生活中很常见。" },
      { en: "I often see this {w} around my neighborhood.", cn: "我经常在附近看到这个{c}。" },
      { en: "She showed me a {w} yesterday.", cn: "她昨天给我看了一个{c}。" },
      { en: "Can you pass me that {w}?", cn: "你能把那个{c}递给我吗？" },
      { en: "We found a {w} in the kitchen.", cn: "我们在厨房里发现了一个{c}。" },
      { en: "The {w} caught my attention immediately.", cn: "那个{c}立刻引起了我的注意。" },
    ],
    '书面': [
      { en: "The {w} has attracted much academic attention.", cn: "{c}引起了学术界的广泛关注。" },
      { en: "Research indicates that the {w} plays a significant role.", cn: "研究表明{c}起着重要作用。" },
      { en: "The concept of {w} is widely discussed in the literature.", cn: "{c}的概念在文献中被广泛讨论。" },
      { en: "Scholars have conducted extensive research on the {w}.", cn: "学者们对{c}进行了广泛的研究。" },
      { en: "The {w} is a key subject in this field of study.", cn: "{c}是该研究领域的一个重要课题。" },
      { en: "Numerous studies have examined the {w} in detail.", cn: "许多研究详细考察了{c}。" },
    ],
    '职场': [
      { en: "The company needs to manage the {w} properly.", cn: "公司需要妥善管理{c}。" },
      { en: "Our team is responsible for the {w}.", cn: "我们的团队负责{c}。" },
      { en: "The {w} is essential for our business operation.", cn: "{c}对我们的业务运营至关重要。" },
      { en: "We need to update the {w} system this quarter.", cn: "本季度我们需要更新{c}系统。" },
      { en: "The manager asked about the {w} during the meeting.", cn: "经理在会议上询问了{c}的情况。" },
      { en: "Investing in the {w} will improve our efficiency.", cn: "投资{c}将提高我们的效率。" },
    ],
  },

  // ===== 动词 v (v/vt/vi) =====
  v: {
    '日常': [
      { en: "I try to {w} every day.", cn: "我每天尽量{c}。" },
      { en: "She decided to {w} last night.", cn: "她昨晚决定{c}。" },
      { en: "We should {w} more often.", cn: "我们应该更经常地{c}。" },
      { en: "He likes to {w} in his free time.", cn: "他喜欢在空闲时间{c}。" },
      { en: "They plan to {w} this weekend.", cn: "他们计划这个周末{c}。" },
      { en: "I usually {w} when I get home.", cn: "我到家后通常会{c}。" },
    ],
    '书面': [
      { en: "It is necessary to {w} under such circumstances.", cn: "在这种情况下，{c}是必要的。" },
      { en: "Scholars suggest that people should {w} regularly.", cn: "学者建议人们应该定期{c}。" },
      { en: "The tendency to {w} has been widely observed.", cn: "{c}的倾向已被广泛观察到。" },
      { en: "Researchers continue to {w} in order to find answers.", cn: "研究人员继续{c}以寻找答案。" },
      { en: "It is important to {w} in a proper manner.", cn: "以适当的方式{c}很重要。" },
      { en: "Many factors contribute to the decision to {w}.", cn: "许多因素促成了{c}的决定。" },
    ],
    '职场': [
      { en: "The manager decided to {w} the plan.", cn: "经理决定{c}这个计划。" },
      { en: "We need to {w} before the deadline.", cn: "我们需要在截止日期前{c}。" },
      { en: "The company plans to {w} next year.", cn: "公司计划明年{c}。" },
      { en: "Please {w} the report by Friday.", cn: "请在周五前{c}报告。" },
      { en: "The team will {w} the new policy.", cn: "团队将{c}新政策。" },
      { en: "Our goal is to {w} the project successfully.", cn: "我们的目标是成功{c}该项目。" },
    ],
  },

  // ===== 形容词 adj =====
  adj: {
    '日常': [
      { en: "She looks very {w} today.", cn: "她今天看起来很{c}。" },
      { en: "I find this book quite {w}.", cn: "我觉得这本书很{c}。" },
      { en: "The weather is {w} these days.", cn: "这几天天气很{c}。" },
      { en: "He bought a {w} car last month.", cn: "他上个月买了一辆{c}的车。" },
      { en: "The movie was really {w}.", cn: "这部电影真的很{c}。" },
      { en: "My friend is a {w} person.", cn: "我的朋友是一个{c}的人。" },
    ],
    '书面': [
      { en: "The {w} phenomenon deserves further study.", cn: "{c}的现象值得进一步研究。" },
      { en: "It is {w} in the context of modern science.", cn: "在现代科学的背景下，这是{c}的。" },
      { en: "The {w} trend has been clearly documented.", cn: "{c}的趋势已被清楚记录。" },
      { en: "This {w} approach has gained wide acceptance.", cn: "这种{c}的方法已获得广泛接受。" },
      { en: "The findings remain {w} across different studies.", cn: "在不同研究中，结果始终是{c}的。" },
      { en: "A {w} relationship exists between the variables.", cn: "变量之间存在{c}的关系。" },
    ],
    '职场': [
      { en: "The {w} report surprised everyone.", cn: "{c}的报告让所有人惊讶。" },
      { en: "We need a {w} solution to this problem.", cn: "我们需要一个{c}的解决方案。" },
      { en: "The result was quite {w}.", cn: "结果相当{c}。" },
      { en: "She gave a {w} presentation.", cn: "她做了一个{c}的演示。" },
      { en: "The market remains {w} this quarter.", cn: "本季度市场保持{c}。" },
      { en: "Our team achieved a {w} outcome.", cn: "我们的团队取得了{c}的成果。" },
    ],
  },

  // ===== 副词 adv =====
  adv: {
    '日常': [
      { en: "She speaks {w} when she is happy.", cn: "她开心时说话{c}。" },
      { en: "He runs {w} every morning.", cn: "他每天早上跑步{c}。" },
      { en: "They arrived {w} at the station.", cn: "他们{c}地到达了车站。" },
      { en: "The children played {w} in the garden.", cn: "孩子们在花园里{c}地玩耍。" },
      { en: "I usually wake up {w} on weekends.", cn: "周末我通常{c}地起床。" },
      { en: "She smiled {w} at the guests.", cn: "她对客人{c}地微笑。" },
    ],
    '书面': [
      { en: "The data {w} supports the conclusion.", cn: "数据{c}地支持了这一结论。" },
      { en: "The issue is {w} discussed in the paper.", cn: "这个问题在论文中被{c}地讨论。" },
      { en: "The results {w} indicate a clear trend.", cn: "结果{c}地表明了一个清晰的趋势。" },
      { en: "This phenomenon is {w} observed in experiments.", cn: "这种现象在实验中被{c}地观察到。" },
      { en: "The theory has been {w} criticized by experts.", cn: "该理论被专家们{c}地批评。" },
      { en: "The argument is {w} presented in the study.", cn: "该论点在研究中被{c}地阐述。" },
    ],
    '职场': [
      { en: "The team {w} completed the project.", cn: "团队{c}地完成了项目。" },
      { en: "She {w} handled the difficult client.", cn: "她{c}地处理了难缠的客户。" },
      { en: "The report was {w} prepared by the staff.", cn: "报告由员工{c}地准备。" },
      { en: "The company {w} expanded its market share.", cn: "公司{c}地扩大了市场份额。" },
      { en: "He {w} responded to the manager's request.", cn: "他{c}地回应了经理的要求。" },
      { en: "The negotiation progressed {w} throughout the day.", cn: "谈判全天{c}地推进。" },
    ],
  },

  // ===== 介词 prep =====
  prep: {
    '日常': [
      { en: "She walked {w} the street to get home.", cn: "她走过街道回家。" },
      { en: "The cat jumped {w} the fence quickly.", cn: "猫迅速跳过了篱笆。" },
      { en: "We sat {w} the tree for a rest.", cn: "我们坐在树下休息。" },
      { en: "He looked {w} the window at the rain.", cn: "他透过窗户看雨。" },
      { en: "The shop is {w} the bank and the post office.", cn: "商店在银行和邮局之间。" },
      { en: "Children ran {w} the playground happily.", cn: "孩子们在操场上快乐地跑着。" },
    ],
    '书面': [
      { en: "The theory applies {w} various academic fields.", cn: "该理论适用于各个学术领域。" },
      { en: "Evidence exists {w} the stated hypothesis.", cn: "有证据支持所述假设。" },
      { en: "The relationship {w} the variables is complex.", cn: "变量之间的关系很复杂。" },
      { en: "The data is consistent {w} previous findings.", cn: "数据与先前的研究结果一致。" },
      { en: "This method differs {w} traditional approaches.", cn: "这种方法不同于传统方法。" },
      { en: "The conclusion is drawn {w} careful analysis.", cn: "结论是在仔细分析后得出的。" },
    ],
    '职场': [
      { en: "The meeting is scheduled {w} Monday morning.", cn: "会议安排在周一上午。" },
      { en: "Please send the report {w} the client.", cn: "请把报告发送给客户。" },
      { en: "The policy applies {w} all employees.", cn: "该政策适用于所有员工。" },
      { en: "We cooperate {w} several partners.", cn: "我们与几家合作伙伴合作。" },
      { en: "The project is {w} schedule and budget.", cn: "项目按进度和预算进行。" },
      { en: "Communication {w} teams is essential.", cn: "团队之间的沟通至关重要。" },
    ],
  },

  // ===== 代词 pron =====
  pron: {
    '日常': [
      { en: "{W} of us went to the park together.", cn: "我们中有人一起去公园了。" },
      { en: "I gave {w} a nice gift yesterday.", cn: "我昨天给了它一份好礼物。" },
      { en: "She told {w} the good news excitedly.", cn: "她兴奋地告诉了大家这个好消息。" },
      { en: "{W} is my favorite among all.", cn: "这是所有当中我最喜欢的。" },
      { en: "We chose {w} from many options.", cn: "我们从许多选项中选择了它。" },
      { en: "Everyone likes {w} in our group.", cn: "我们组里每个人都喜欢它。" },
    ],
    '书面': [
      { en: "{W} represents a key factor in this study.", cn: "它是本研究中的一个关键因素。" },
      { en: "The author emphasizes {w} throughout the text.", cn: "作者在全文中强调了它。" },
      { en: "{W} is often cited as a typical example.", cn: "它常被引用为典型例子。" },
      { en: "Researchers consider {w} to be significant.", cn: "研究人员认为它具有重要意义。" },
      { en: "The analysis focuses on {w} in detail.", cn: "分析详细聚焦于它。" },
      { en: "{W} remains central to the argument.", cn: "它仍是论证的核心。" },
    ],
    '职场': [
      { en: "Please send {w} the document by email.", cn: "请通过邮件把它发送给我。" },
      { en: "{W} will handle the project next quarter.", cn: "下季度它将负责该项目。" },
      { en: "We informed {w} about the recent change.", cn: "我们通知了它最近的变更。" },
      { en: "The manager assigned {w} to the new team.", cn: "经理把它分配到了新团队。" },
      { en: "{W} is responsible for the final decision.", cn: "它对最终决定负责。" },
      { en: "Everyone trusts {w} in the company.", cn: "公司里每个人都信任它。" },
    ],
  },

  // ===== 数词 num =====
  num: {
    '日常': [
      { en: "I have {w} books on my shelf.", cn: "我的书架上有{c}本书。" },
      { en: "She bought {w} apples at the market.", cn: "她在市场买了{c}个苹果。" },
      { en: "There are {w} chairs in the room.", cn: "房间里有{c}把椅子。" },
      { en: "We waited for {w} hours at the station.", cn: "我们在车站等了{c}个小时。" },
      { en: "He scored {w} points in the game.", cn: "他在比赛中得了{c}分。" },
      { en: "I need {w} more days to finish.", cn: "我还需要{c}天才能完成。" },
    ],
    '书面': [
      { en: "The number {w} appears frequently in the data.", cn: "数字{c}在数据中频繁出现。" },
      { en: "The study surveyed {w} participants in total.", cn: "研究共调查了{c}名参与者。" },
      { en: "Results are divided into {w} categories.", cn: "结果分为{c}个类别。" },
      { en: "The experiment was repeated {w} times.", cn: "实验重复了{c}次。" },
      { en: "Chapter {w} discusses the main findings.", cn: "第{c}章讨论了主要发现。" },
      { en: "The value increased by {w} percent.", cn: "该值增长了百分之{c}。" },
    ],
    '职场': [
      { en: "We need {w} more staff for the event.", cn: "我们需要再招{c}名员工负责活动。" },
      { en: "The budget was cut by {w} percent.", cn: "预算被削减了百分之{c}。" },
      { en: "Sales grew by {w} fold this year.", cn: "今年销售额增长了{c}倍。" },
      { en: "The project will last {w} months.", cn: "项目将持续{c}个月。" },
      { en: "We signed {w} new contracts last week.", cn: "我们上周签了{c}份新合同。" },
      { en: "The team consists of {w} members.", cn: "团队由{c}名成员组成。" },
    ],
  },

  // ===== 连词 conj =====
  conj: {
    '日常': [
      { en: "I like apples {w} oranges too.", cn: "我喜欢苹果，也喜欢橘子。" },
      { en: "She was tired {w} kept working.", cn: "她很累，但还是继续工作。" },
      { en: "We can go now {w} wait a bit.", cn: "我们可以现在走，或者等一会儿。" },
      { en: "He tried hard {w} failed again.", cn: "他努力尝试，但又失败了。" },
      { en: "I stayed home {w} it was raining.", cn: "因为下雨，我留在了家里。" },
      { en: "She sings {w} dances well.", cn: "她唱歌和跳舞都很好。" },
    ],
    '书面': [
      { en: "The theory is accepted {w} still debated.", cn: "该理论被接受，但仍有争议。" },
      { en: "Evidence supports {w} also challenges the claim.", cn: "证据支持同时也挑战了这一主张。" },
      { en: "The method is effective {w} costly.", cn: "该方法有效，但成本高昂。" },
      { en: "Results are significant {w} require replication.", cn: "结果显著，但需要重复验证。" },
      { en: "The model is simple {w} powerful.", cn: "该模型简单却强大。" },
      { en: "Critics agree {w} offer different reasons.", cn: "批评者同意，但提出了不同理由。" },
    ],
    '职场': [
      { en: "We finished the report {w} the presentation.", cn: "我们完成了报告和演示。" },
      { en: "The plan is feasible {w} needs funding.", cn: "计划可行，但需要资金。" },
      { en: "He is skilled {w} lacks experience.", cn: "他技能娴熟，但缺乏经验。" },
      { en: "The deal is profitable {w} risky.", cn: "这笔交易有利可图，但有风险。" },
      { en: "We must act now {w} lose the chance.", cn: "我们必须现在行动，否则会失去机会。" },
      { en: "The product is cheap {w} reliable.", cn: "产品便宜且可靠。" },
    ],
  },

  // ===== 感叹词 int =====
  int: {
    '日常': [
      { en: "{W}! That is really amazing.", cn: "哇！那真是太神奇了。" },
      { en: "{W}! I did not see that coming.", cn: "哎呀！我没料到会这样。" },
      { en: "{W}! You scared me a lot.", cn: "天哪！你吓了我一跳。" },
      { en: "{W}! This tastes so good.", cn: "嗯！这味道真好。" },
      { en: "{W}! What a beautiful day.", cn: "啊！多美的一天。" },
      { en: "{W}! Let me think about it.", cn: "嗯！让我想想。" },
    ],
    '书面': [
      { en: "{W} is often used to express strong emotion.", cn: "该感叹词常用于表达强烈情感。" },
      { en: "The word {w} conveys surprise in context.", cn: "在语境中，该词传达了惊讶。" },
      { en: "{W} appears frequently in spoken language.", cn: "该感叹词在口语中频繁出现。" },
      { en: "Linguists study {w} as an interjection.", cn: "语言学家将其作为感叹词研究。" },
      { en: "The use of {w} reflects the speaker's feeling.", cn: "该词的使用反映了说话者的感受。" },
      { en: "{W} serves as a marker of emotion here.", cn: "在这里它作为情感的标志。" },
    ],
    '职场': [
      { en: "{W}! The project was a great success.", cn: "太好了！项目取得了巨大成功。" },
      { en: "{W}! We missed the deadline again.", cn: "糟了！我们又错过了截止日期。" },
      { en: "{W}! That is an unexpected result.", cn: "哦！那是一个意外的结果。" },
      { en: "{W}! The client agreed to the terms.", cn: "好！客户同意了条款。" },
      { en: "{W}! We need to rethink this plan.", cn: "嗯！我们需要重新考虑这个计划。" },
      { en: "{W}! The numbers look promising.", cn: "哇！这些数字看起来很有希望。" },
    ],
  },

  // ===== 助动词 aux =====
  aux: {
    '日常': [
      { en: "I {w} go to school by bus every day.", cn: "我每天会乘公交车去上学。" },
      { en: "She {w} help you if you ask.", cn: "如果你开口，她会帮你的。" },
      { en: "We {w} visit grandma this weekend.", cn: "这个周末我们会去看奶奶。" },
      { en: "He {w} be here in ten minutes.", cn: "他十分钟后就到。" },
      { en: "They {w} come to the party tonight.", cn: "他们今晚会来参加聚会。" },
      { en: "You {w} find it on the table.", cn: "你会在桌子上找到它的。" },
    ],
    '书面': [
      { en: "The system {w} be analyzed in the next section.", cn: "该系统将在下一节中被分析。" },
      { en: "This phenomenon {w} be discussed further.", cn: "这一现象将被进一步讨论。" },
      { en: "The data {w} reveal a clear pattern.", cn: "数据将揭示一个清晰的模式。" },
      { en: "The theory {w} be tested through experiments.", cn: "该理论将通过实验来检验。" },
      { en: "Results {w} be presented in the final chapter.", cn: "结果将在最后一章中呈现。" },
      { en: "The method {w} be applied to other fields.", cn: "该方法将被应用到其他领域。" },
    ],
    '职场': [
      { en: "We {w} submit the report by Friday.", cn: "我们将在周五前提交报告。" },
      { en: "The company {w} launch the new product soon.", cn: "公司将很快推出新产品。" },
      { en: "I {w} send you the details later.", cn: "我稍后会发送详细信息给你。" },
      { en: "The team {w} review the proposal tomorrow.", cn: "团队明天将审查提案。" },
      { en: "She {w} attend the meeting online.", cn: "她将在线参加会议。" },
      { en: "We {w} need more resources for this.", cn: "我们将需要更多资源来做这件事。" },
    ],
  },

  // ===== 冠词 art =====
  art: {
    '日常': [
      { en: "I bought {w} new book yesterday.", cn: "我昨天买了一本新书。" },
      { en: "She has {w} lovely cat at home.", cn: "她家里有一只可爱的猫。" },
      { en: "There is {w} apple on the table.", cn: "桌子上有一个苹果。" },
      { en: "He saw {w} bird in the sky.", cn: "他看到天空中有一只鸟。" },
      { en: "We need {w} umbrella today.", cn: "我们今天需要一把伞。" },
      { en: "She made {w} cake for the party.", cn: "她为聚会做了一个蛋糕。" },
    ],
    '书面': [
      { en: "This is {w} example of the phenomenon.", cn: "这是该现象的一个例子。" },
      { en: "The study presents {w} new approach.", cn: "该研究提出了一种新方法。" },
      { en: "There is {w} growing interest in the topic.", cn: "对该主题的兴趣日益增长。" },
      { en: "The author offers {w} detailed analysis.", cn: "作者提供了详细的分析。" },
      { en: "This constitutes {w} significant contribution.", cn: "这构成了一项重要贡献。" },
      { en: "The paper provides {w} comprehensive review.", cn: "该论文提供了全面的综述。" },
    ],
    '职场': [
      { en: "We signed {w} new contract today.", cn: "我们今天签了一份新合同。" },
      { en: "She gave {w} presentation to the clients.", cn: "她向客户做了一次演示。" },
      { en: "The company made {w} big profit.", cn: "公司获得了一大笔利润。" },
      { en: "He sent {w} email to the manager.", cn: "他给经理发了一封邮件。" },
      { en: "We need {w} plan for next year.", cn: "我们需要一个明年的计划。" },
      { en: "They held {w} meeting this morning.", cn: "他们今天上午开了一个会。" },
    ],
  },
};

// ============ 生成单个例句 ============
function generateSentence(wordObj, type, variantIndex) {
  const { pos, cn } = parseDef(wordObj.def);
  const category = categorizePos(pos);
  const catTemplates = TEMPLATES[category] || TEMPLATES.v;
  const typeTemplates = catTemplates[type] || catTemplates['日常'];
  const tpl = typeTemplates[variantIndex % typeTemplates.length];

  let en = tpl.en
    .replace(/\{w\}/g, wordObj.w)
    .replace(/\{W\}/g, capitalize(wordObj.w));
  let cnTrans = tpl.cn.replace(/\{c\}/g, cn);

  // 清理可能的多余空格
  en = en.replace(/\s+/g, ' ').trim();
  // 修正句末标点
  if (!/[.?!]$/.test(en)) en += '.';

  return { en, cn: cnTrans, type };
}

// ============ 主处理逻辑 ============
const TYPES = ['日常', '书面', '职场'];
let processed = 0;       // 处理的单词数（有补充）
let skipped = 0;         // 跳过的单词数（已有3种类型）
let generated = 0;       // 生成的例句总数
let failed = 0;          // 生成失败的单词数
const failList = [];

const BATCH = 100; // 每批打印进度

for (let i = 0; i < data.length; i++) {
  const w = data[i];

  // 确保 sent 数组存在
  if (!w.sent || !Array.isArray(w.sent)) {
    w.sent = [];
  }

  // 统计已有类型
  const existingTypes = new Set();
  for (const s of w.sent) {
    if (s && s.type && TYPES.includes(s.type)) {
      existingTypes.add(s.type);
    }
  }

  // 如果已有3种类型，跳过
  if (existingTypes.size >= 3) {
    skipped++;
    continue;
  }

  // 找出缺失类型
  const missingTypes = TYPES.filter(t => !existingTypes.has(t));

  let wordChanged = false;
  for (const type of missingTypes) {
    try {
      const sent = generateSentence(w, type, i);
      // 验证英文例句包含目标单词（不区分大小写）
      const wordLower = w.w.toLowerCase();
      const enLower = sent.en.toLowerCase();
      if (!enLower.includes(wordLower)) {
        // 如果模板替换后没包含单词，记录失败
        failList.push({ i, w: w.w, type, reason: 'word not in en' });
        continue;
      }
      w.sent.push(sent);
      generated++;
      wordChanged = true;
    } catch (e) {
      failList.push({ i, w: w.w, type, reason: e.message });
    }
  }

  if (wordChanged) {
    processed++;
  } else if (missingTypes.length > 0) {
    failed++;
  }

  // 分批打印进度
  if ((i + 1) % BATCH === 0) {
    console.log(`已处理 ${i + 1}/${data.length} 个单词...`);
  }
}

console.log('\n=== 处理完成 ===');
console.log('补充例句的单词数:', processed);
console.log('跳过(已有3种类型)的单词数:', skipped);
console.log('生成的例句总数:', generated);
console.log('生成失败的单词数:', failed);
if (failList.length > 0) {
  console.log('失败详情(前20条):');
  for (let k = 0; k < Math.min(20, failList.length); k++) {
    console.log(JSON.stringify(failList[k]));
  }
}

// ============ 写回文件（紧凑格式，与原文件一致）============
const output = JSON.stringify(data);
fs.writeFileSync(FILE_PATH, output, 'utf8');
console.log('\n文件已写回:', FILE_PATH);
console.log('原文件大小:', raw.length, '字节');
console.log('新文件大小:', output.length, '字节');
