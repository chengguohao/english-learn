# 我想背单词 - 项目进度文档

> 新会话恢复指南：让 AI 先读本文件，即可快速了解项目全貌和待办事项。

## 项目信息

- **项目名称**: 我想背单词
- **项目路径**: `d:\hermes-agent-临时文件\English-learn\pets3-app`
- **技术栈**: 纯前端 JavaScript + Vite，无后端
- **词库**: PETS-3 公共英语三级词汇
- **启动命令**: `npm run dev`（在 pets3-app 目录下）

## 文件结构

```
pets3-app/
├── index.html              # 入口 HTML
├── package.json            # 依赖配置
├── vite.config.js          # Vite 配置
├── PROGRESS.md             # 本文件（进度文档）
├── tts-voice-test.html     # 独立 TTS 试听页（已集成到 App 内，此文件可废弃）
└── src/
    ├── main.js             # 核心逻辑（路由、渲染、交互）~1612 行
    ├── style.css           # 全局样式 ~613 行
    ├── words-data.js       # 词库数据（~1.2MB，含单词、释义、音标、例句）
    ├── roots-data.js       # 词根词缀数据
    ├── phrases-data.js     # 生活短语数据（30 条，含背景渐变、SVG 图案）
    ├── store.js            # localStorage 存储（状态、设置、历史）
    ├── srs.js              # 间隔重复算法（SRS 记忆曲线）
    ├── tts.js              # 语音合成（TTS）
    └── notify.js           # 通知提醒（Android App）
```

## 9 项需求完成状态

### 需求 1: TTS 语音试听页面集成到 App 内
- **状态: 已完成**
- `renderTTSTest()` 函数已实现（main.js），设置页有入口链接，语音列表加载、播放、刷新功能均已实现
- style.css 中已补充所有 TTS 相关样式：`.tts-desc`, `.tts-test-text`, `.tts-voice-list`, `.tts-voice-card`, `.tts-voice-info`, `.tts-voice-name`, `.tts-voice-meta`, `.tts-badge(.local/.remote/.default)`, `.tts-play-btn`, `.tts-loading`, `.tts-hint`, `.tts-refresh-btn` 及深色模式适配

### 需求 2: 今日学习页面每个单词去掉"学习中"标签
- **状态: 已完成**
- `renderLearnedWordItem(c, true)` 中 `hideStatus=true` 参数会隐藏状态标签
- 今日学习页面调用时传了 `true`，不显示状态

### 需求 3: 已学单词页面改版
- **状态: 已完成**
- "学习中"改为"已学习"/"已掌握"
- 按钮位置已调换：今日学习在前，全部已学在后
- 默认显示今日学习内容（`learnedWordsFilter = 'today'`）
- 全部已学按日期分组，style.css 已补充 `.learned-date-group`, `.ldg-header`, `.ldg-count` 样式（含 sticky 吸顶效果）
- 可剔除已学单词、可单独学习某个单词

### 需求 4: 每日新词数上限改为 500
- **状态: 已完成**
- 设置页 input `max="500"`，`setNewPerDay` 函数 `Math.min(500, ...)` 限制

### 需求 5: 单词学习例句问题
- **状态: 已完成**
- **已完成**:
  - 所有例句已通过启发式脚本添加 `type` 字段（日常/书面/职场），分类基于关键词和句长
  - `renderExamples()` 已改进：优先选取不同类型的例句（日常→书面→职场），不足时按原顺序补齐
  - `highlightWord()` 目标词高亮已实现
  - style.css 已补充 `.ex-type` 及 `.日常/.书面/.职场` 类型标签样式（含深色模式）
  - **例句数据已全部补充**：为 4483 个单词生成了 7964 条例句，100% 单词满足 3 种类型例句要求，总计 15762 条例句
  - 类型分布：日常 5889 条、书面 4576 条、职场 5297 条

### 需求 6: 中英拼写移至学习流程
- **状态: 已完成**
- 点"认识"后触发拼写，`renderPostSpell()` 渲染拼写卡片
- style.css 已补充 `.post-spell-card .spell-prompt` 绿色背景区分样式（含深色模式）
- 基础 `.spell-card` 样式复用，足够使用

### 需求 7: 页面增加后退按钮（保留退出 X）
- **状态: 已完成**
- `goBack()` 函数实现后退逻辑，各页面 topbar 同时有 `←`（后退）和 `✕`（退出回首页）按钮

### 需求 8: 删除"墨词"品牌，改为"我想背单词"
- **状态: 已完成**
- 已清理所有源文件中的"墨"字残留：style.css 注释、srs.js 注释、notify.js 通知标题、package.json 描述、capacitor.config.js appName、public/manifest.json name/short_name、android strings.xml app_name/title_activity_main
- words-data.js 中的"墨"是"石墨"释义，属于正常数据
- 构建产物（www/、android/build/、android/assets/）将在 `npm run build && cap sync` 后自动更新

### 需求 9: 首页底部导航增加"生活短语"
- **状态: 已完成**
- 底部导航已改为用户要求的 6 项：词根词缀、学习计划、单词本、学习统计、错词本、生活短语
- `phrases-data.js` 已创建（30 条短语，含 gradient 和 SVG pattern）
- `renderPhrases()` 已实现，首页快捷入口已有"生活短语"按钮
- style.css 已补充短语页面所有 CSS：`.phrases-page`, `.phrase-card`, `.phrase-pattern`, `.phrase-content`, `.phrase-mood`, `.phrase-en`, `.phrase-cn`, `.phrase-play-hint`, `.phrase-nav`, `.pn-btn`, `.pn-count`, `.phrase-dots`, `.pd`, `.font-rounded/.font-sharp/.font-elegant` 及深色模式适配

## 待完成任务汇总

| 序号 | 任务 | 状态 |
|------|------|------|
| 1 | 补充 TTS 试听页 CSS 样式 | ✅ 已完成 |
| 2 | 补充生活短语页 CSS 样式 | ✅ 已完成 |
| 3 | 补充已学单词日期分组 CSS | ✅ 已完成 |
| 4 | 修改底部导航为用户要求的 6 项 | ✅ 已完成 |
| 5 | 清理残留"墨"字 | ✅ 已完成 |
| 6 | 检查并补充例句数据 | ✅ 已完成（4483单词7964条例句） |
| 7 | 确认 post-spell-card 样式 | ✅ 已完成 |
| 8 | 补充例句类型标签 CSS | ✅ 已完成 |

## 第二轮 5 项需求完成状态

### 需求 1: 合并已学单词和今日学习
- **状态: 已完成**
- 首页统计行从 4 项减为 3 项：连续打卡、已学单词、错词
- 移除了重复的"今日学习"卡片，点击"已学单词"进入已学单词页（内部仍有今日/全部 tab 切换）

### 需求 2: 修复后退按钮在拼写状态的问题
- **状态: 已完成**
- 新增 `currentRated` 全局变量，标记当前单词是否已评分
- `goBack()` 检查学习页面状态：
  - 拼写输入阶段（postSpellActive && !postSpellChecked）：取消拼写，回到卡片显示"下一个"按钮
  - 拼写结果阶段（postSpellChecked）：前进到下一个单词
  - 普通状态：正常后退到上一页
- `renderEnzhCard` 和 `renderSpellCard` 检查 `currentRated`，已评分时显示"下一个"而非三态按钮

### 需求 3: 补充例句数据
- **状态: 已完成**
- 为 4483 个单词生成了 7964 条例句（基于词性模板系统）
- 100% 单词满足 3 种类型例句要求（日常/书面/职场）
- 总计 15762 条例句，全部验证通过

### 需求 4: 词根词缀按类型分组换行显示
- **状态: 已完成**
- `renderRootsInfo()` 按 prefix/root/suffix 三组分组显示
- 每组有标题标签（前缀/词根/后缀），组内为词根+释义
- style.css 补充 `.wri-group`, `.wri-group-label` 样式

### 需求 5: 学习页面显示扩展词族
- **状态: 已完成**
- 新增 `getWordFamily(word)` 函数：通过词根数据 + 前缀匹配查找同族单词
- 新增 `renderWordFamily(family)` 函数：渲染相关单词列表（单词+释义，点击可朗读）
- 最多显示 6 个相关单词，如 inspect → respect/aspect/suspect/expect/perspective/inspection
- style.css 补充 `.word-family`, `.wf-title`, `.wf-item`, `.wf-word`, `.wf-def` 样式（含深色模式）

## 第三轮 4 项需求完成状态

### 需求 1: 修复从第二个单词开始没有三态按钮的 bug
- **状态: 已完成**
- **根因**: `advanceQueue()` 中缺少 `currentRated = false` 重置，导致拼写完成后 `currentRated` 仍为 `true`，显示"下一个"而非三态按钮
- **修复**: 在 `advanceQueue()` 中添加 `currentRated = false`；在 `startLearn()` 中重置 `currentRated` 和 `postSpellActive`；在 `goBack()` 拼写输入阶段也重置 `currentRated`

### 需求 2: 去掉主页"我想"logo
- **状态: 已完成**
- 移除了 `renderHome()` 中的 `<div class="logo">我想</div>`

### 需求 3: 重新布局学习卡片，一页可见全部内容
- **状态: 已完成**
- 播放图标从单独一行移到单词行旁边（inline，`.speaker-inline`）
- 新增 `.word-card.compact` 紧凑模式：缩小 padding、字号、行距
- 缩小释义、例句、词根词缀、扩展词族的间距和字号
- 整体内容可在手机屏幕一页内显示

### 需求 4: 生活短语整页铺满，用照片背景
- **状态: 已完成**
- 为 30 条短语添加 Unsplash 图片 URL（`img` 字段）
- `renderPhrases()` 重新设计为整页铺满（`position: fixed; inset: 0`）
- 背景使用照片 + 渐变遮罩保证文字可读性
- 底部浮动导航按钮和圆点指示器，毛玻璃效果
- 顶部浮动后退/关闭按钮，计数器

## 第四轮 6 项需求完成状态

### 需求 1: 多页面顶部标题居中
- **状态: 已完成**
- `.topbar .title` 改为绝对定位居中（`position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)`）
- 无论左右两侧是否有按钮，标题始终水平垂直居中
- 同时增加 topbar padding 至 `14px 16px 8px` + `calc(14px + env(safe-area-inset-top))`，避免内容过于贴顶

### 需求 2: APK 沉浸式状态栏（非全屏隐藏）
- **状态: 已完成**
- **方案**: 沉浸式状态栏——状态栏背景与 app 同色融为一体，图标仍显示，内容在状态栏下方
- 新建 [colors.xml](android/app/src/main/res/values/colors.xml)，定义 `appBackground = #f5f6f8`（与 CSS `--bg` 一致）
- [styles.xml](android/app/src/main/res/values/styles.xml) 的 `AppTheme.NoActionBar` 添加：
  - `android:windowTranslucentStatus` = false
  - `android:windowDrawsSystemBarBackgrounds` = true
  - `android:statusBarColor` = @color/appBackground
  - `android:navigationBarColor` = @color/appBackground
  - `android:windowLayoutInDisplayCutoutMode` = shortEdges
- style.css 的 `.topbar` 添加 `padding-top: calc(14px + env(safe-area-inset-top))` 自动避开状态栏
- 需重新打包 APK 生效

### 需求 3: 复习逻辑说明（SRS 间隔重复）
- **状态: 已说明，无需修改**
- 复习**不是**简单的"第二天复习前一天所有单词"
- 使用 SRS 间隔重复算法（[srs.js](src/srs.js)），每个单词有独立复习时间表：
  - 间隔阶梯：`1天 → 3天 → 7天 → 15天 → 30天 → 60天 → 90天 → 120天 → 180天 → 365天`
  - **认识(good)**：间隔上升一阶
  - **模糊(hard)**：原地踏步
  - **忘记(again)**：间隔归零，10分钟后重学
- 每天系统自动收集所有 `due` 到期的单词组成复习队列

### 需求 4: 单词本随机按钮逻辑确认
- **状态: 保留，逻辑合理**
- `reshuffleWords()` 清除存储的打乱顺序 → 重新随机排列
- 已学习单词状态存储在 `state.cards`（以单词为 key），与显示顺序无关
- 打乱**不影响**已学单词进度，保留按钮

### 需求 5: 生活短语页改造
- **状态: 已完成**
- 去掉了"搞笑/诗意/生活/励志"标签文字
- 移除了底部圆点指示器组件
- 左右导航按钮：去掉圆形背景，仅保留 `‹` `›` 箭头图标，增大到 40px，透明度 0.5
- 按钮移到屏幕垂直居中位置
- 英文从 26px 增大到 30px，中文从 15px 增大到 18px
- 文字上下左右居中（`justify-content: center; align-items: center`）
- 新增 8 秒自动滚动，到最后一条后循环回第一条
- 切换优化：不再重建整个 DOM，只更新文字和背景内容；文字淡入淡出过渡（250ms）；图片预加载相邻 2-3 张

### 需求 6: 首页标题增大 + 动态问候语
- **状态: 已完成**
- "我想背单词"作为顶部居中标题（28px 加粗）
- 新增动态问候语，根据当前时间自动变化：
  - 6-11点：早上好 👋
  - 11-13点：中午好 👋
  - 13-17点：下午好 👋
  - 17-19点：傍晚好 👋
  - 19-6点：晚上好 👋
- 副标题"今天也是进步一点点的一天"
- 恢复"公共英语三级 4544 词"词库信息行
- 两个主题（classic/playful）均已同步：playful 主题的 `✦` 装饰符从 slogan 迁移到 greeting

## 第五轮需求完成状态

### 需求 1: 状态栏动态联动（方案 B）
- **状态: 已完成**
- **问题**: 状态栏图标看不清 + playful 风格状态栏颜色不跟随
- **方案**: 创建 StatusBar 自定义 Capacitor 插件，实现前端主题切换时动态同步 Android 状态栏颜色
- **实现细节**:
  - 新建 [StatusBarPlugin.java](android/app/src/main/java/com/pets3/vocab/StatusBarPlugin.java)，实现 `setColor` 方法
  - 修改 [MainActivity.java](android/app/src/main/java/com/pets3/vocab/MainActivity.java)，注册插件
  - 修改 [main.js](src/main.js) 的 `applyTheme()` 函数，主题切换时调用 `updateStatusBarColor()`
  - `updateStatusBarColor()` 从 `document.body` 获取实际背景色，配合 `requestAnimationFrame` 确保 CSS 变量已生效
  - 四种主题自动映射图标明暗（浅色背景用深色图标，深色背景用浅色图标）

### 需求 2: 生活短语自动滚动时间调整
- **状态: 已完成**
- 自动切换时间从 8 秒改为 15 秒（[main.js#L1560](src/main.js)）

### 需求 3: 生活短语每天打乱一次顺序
- **状态: 已完成**
- 新增 `initShuffledPhrases()` 函数（[main.js#L70-L96](src/main.js)）
- 使用日期作为缓存 key（`pets3_phrases_shuffle_YYYY-MM-DD`）
- 同一天内顺序一致（从 localStorage 读取）
- 第二天自动重新打乱
- 自动清理旧日期的缓存

### 需求 4: APK 输出位置固定
- **状态: 已完成**
- APK 固定复制到 `English-learn/pets3-app.apk`（根目录）
- 删除 `pets3-app/pets3-app.apk` 冗余副本

## 关键代码位置索引

| 功能 | 文件 | 行号 | 函数/变量名 |
|------|------|------|-------------|
| 路由系统 | main.js | 88-117 | `navigate()`, `goBack()`, `render()` |
| 首页渲染 | main.js | 120-179 | `renderHome()` |
| 学习页渲染 | main.js | 182-220 | `renderLearn()` |
| 英中模式卡片 | main.js | 223-243 | `renderEnzhCard()` |
| 拼写模式卡片 | main.js | 246-294 | `renderSpellCard()` |
| 认识后拼写卡片 | main.js | 301-342 | `renderPostSpell()` |
| 例句渲染 | main.js | 349-360 | `renderExamples()` |
| 词根信息 | main.js | 363-375 | `renderRootsInfo()` |
| 学习操作 | main.js | 401-460 | `startLearn()`, `answer()`, `advanceQueue()` |
| 认识后拼写逻辑 | main.js | 462-482 | `onPostSpellInput()`, `submitPostSpell()` 等 |
| 错词本 | main.js | 524-700 | `getMistakes()`, `renderMistakes()`, `renderDrill()` |
| 已学单词页 | main.js | 773-853 | `renderLearnedWords()`, `renderLearnedWordItem()` |
| 单词本 | main.js | ~880-930 | `renderWordbook()` |
| 统计页 | main.js | ~950-1035 | `renderStats()` |
| 词根词缀页 | main.js | 1048-1105 | `renderRoots()` |
| 学习计划页 | main.js | ~1110-1245 | `renderPlan()` |
| 设置页 | main.js | 1277-1346 | `renderSettings()` |
| 生活短语页 | main.js | 1349-1401 | `renderPhrases()`, `nextPhrase()` 等 |
| TTS 试听页 | main.js | 1404-1497 | `renderTTSTest()`, `loadVoiceList()`, `playTestVoice()` |
| 底部导航 | main.js | 1500-1522 | `bottomNav()` |
| 全局 API 注册 | main.js | 1569-1609 | `window.App = {...}` |
| 新词数限制 | main.js | 1295, 1530 | `max="500"`, `Math.min(500,...)` |
| 高亮目标词 | main.js | 1037-1041 | `highlightWord()` |
| 朗读句子 | main.js | 1043-1045 | `speakSentence()` |
| 打乱词库 | main.js | 60-80 | `initShuffledWords()` |

## 全局状态变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `WORDS` | Array | 完整词库 |
| `shuffledWords` | Array | 打乱后的词库（持久化顺序） |
| `state` | Object | `{ cards: {}, history: {} }` 学习状态 |
| `settings` | Object | 学习设置（模式、新词数、音标、深色等） |
| `currentView` | String | 当前页面 |
| `prevView` | String | 上一页面（后退用） |
| `queue` / `queueIndex` | Array/Number | 学习队列 |
| `postSpellActive` | Boolean | 是否处于认识后拼写状态 |
| `phraseIndex` | Number | 生活短语当前索引 |
| `learnedWordsFilter` | String | 已学单词页筛选（'today'/'all'） |
| `drillActive` | Boolean | 错词复习模式 |

## 数据格式

### 单词数据 (words-data.js)
```json
{ "w": "word", "ph": "phonetic", "def": ["n. 释义", "v. 释义"], "sent": [{ "en": "...", "cn": "...", "type": "日常|书面|职场" }] }
```

### 词根数据 (roots-data.js)
```json
{ "root": "pre", "type": "prefix|suffix|root", "meaning": "前", "origin": "...", "words": ["prefix", "prepare", ...] }
```

### 短语数据 (phrases-data.js)
```json
{ "en": "...", "cn": "...", "mood": "funny|poetic|life|inspirational", "font": "rounded|sharp|elegant", "gradient": "linear-gradient(...)", "pattern": "data:image/svg+xml;base64,..." }
```

## 注意事项

1. **words-data.js 文件很大（~1.2MB）**，不能用 Read 整体读取，需用 Grep 搜索或 offset 分段读取
2. 项目使用 Vite，修改代码后会自动热更新
3. localStorage 存储数据，清除浏览器数据会丢失学习进度
4. TTS 使用浏览器原生 `speechSynthesis` API，不同设备语音列表不同
5. `window.App` 对象是所有 onclick 事件的入口，新增函数必须在此注册

## 设置功能详解（生动版）

> 打开 App，点右上角的 ⚙️ 齿轮图标，就能进入「设置」中心。这里藏着让你学习更顺手、更个性化的小机关，逐项介绍如下：

### 🎯 学习模式 —— 选你顺手的方式背

**功能说明**：决定每个新词出现时，你将以何种方式与它"交锋"。两种模式任选其一：
- **英中（看词回想释义）**：屏幕显示英文单词，释义直接展示，例句齐飞。点「认识」后会弹出一个拼写框，让你手写一遍单词加深印象。
- **听音拼写**：只播声音不显示单词，靠耳朵辨认后键入拼写。适合通勤路上戴耳机训练听力。

**操作步骤**：
1. 进入「设置」→ 找到「学习模式」下拉框
2. 点开下拉，选择你想要的模式
3. 返回首页点「开始学习」，新模式立即生效

### 📚 每日新词数 —— 你说了算的节奏

**功能说明**：每天要学多少新词？5 个慢工出细活，500 个狂飙突进，范围 5~500 任你调。系统会按你设定的数量，从打乱的词库中取词加入今日队列。

**操作步骤**：
1. 进入「设置」→ 找到「每日新词数」输入框
2. 直接输入数字，或用上下箭头微调（步进 5）
3. 失焦后自动保存，第二天起按新数量执行

### 📅 考试日期 —— 倒计时给你紧迫感

**功能说明**：填上你的 PETS-3 考试日期，学习计划页会自动计算剩余天数，并按剩余时间智能分配每日新词量，确保考前能过完一遍。

**操作步骤**：
1. 进入「设置」→ 找到「考试日期」
2. 点日期选择器，选你的考试日
3. 到「学习计划」页就能看到倒计时和推荐节奏

### 🔊 自动发音 —— 开口说是关键

**功能说明**：开启后，每进入一个新词卡片，App 自动朗读一遍单词。关闭则需要手动点 🔊 图标播放。建议开启，多听多练。

**操作步骤**：进入「设置」→ 找到「自动发音」开关 → 点一下圆点滑块即可切换开/关。

### 🎵 显示音标 —— 拼读更精准

**功能说明**：控制单词卡片上是否显示音标（如 `/ˈrɪbən/`）。初学建议开启帮助拼读，熟练后可关闭以增加难度。

**操作步骤**：进入「设置」→ 找到「显示音标」开关 → 点滑块切换。

### 🌙 深色模式 —— 护眼夜读必备

**功能说明**：一键切换暗色主题，背景变深、文字变亮，夜晚或弱光环境下不刺眼，省电（OLED 屏更明显）。

**操作步骤**：进入「设置」→ 找到「深色模式」开关 → 点滑块切换，全 App 立即换装。

### ⏰ 每日提醒 —— 再也不会忘打卡

**功能说明**：开启后，每天到指定时间会推送本地通知，提醒你今天还没背单词。仅 Android 生效（需授予通知权限）。

**操作步骤**：
1. 进入「设置」→ 打开「每日提醒」开关
2. 开关下方会出现「提醒时间」输入框
3. 设定时间（如 20:00），到点自动推送通知
4. 关闭提醒只需再次点开关

### 🎤 语音试听与选择 —— 挑你最喜欢的声音

**功能说明**：进入试听页，可输入任意英文文本，对比 6 种 Microsoft Edge 神经网络语音（Jenny 温暖、Aria 清亮、Guy 沉稳、Ana 活泼儿童、Sonia 英式优雅、Ryan 英式男声）和系统本地语音，选中后学习时全程使用该声音。Edge TTS 单词句子都能播，质量极高，需联网；离线自动回退本地语音。

**操作步骤**：
1. 进入「设置」→ 点「🔊 语音试听与选择」行
2. 在顶部输入框输入要朗读的文本（默认已有一句示例）
3. 点每个语音卡片右侧的 ▶ 播放按钮试听
4. 听中哪个，点「选择」按钮（已选的会显示「✓ 已选」）
5. 想换回系统默认？点底部「✕ 取消在线语音」按钮即可
6. 返回后学习时使用所选语音，设置自动保存

### 📖 词库信息 —— 透明可查

**功能说明**：展示当前词库来源（PETS-3 大纲）和总词数（4544 词），让你心里有数。

**操作步骤**：进入「设置」→ 下拉到「词库」行即可查看，无需操作。

### ℹ️ 版本号 —— 追踪更新

**功能说明**：显示当前 App 版本（v2.0.0），后续迭代时便于排查问题。

**操作步骤**：进入「设置」→ 下拉到「版本」行即可查看。

---

**小贴士**：所有设置项均自动保存到本地（localStorage），关 App、重启手机都不会丢。卸载 App 才会清除，重要数据请定期手动备份。

## 界面风格规范（双主题系统）

> 项目支持两套可切换的界面风格，用户在「设置 → 界面风格」中自选，选择持久化到 `localStorage`。
> 两套风格共享同一套 HTML 结构和 JS 逻辑，仅通过 CSS 变量和 body class 切换，互不干扰，可叠加深色模式。

### 架构原理

```
用户选择 settings.theme
        ↓
applyTheme() 给 body 加 class
        ↓
┌─ theme-classic  → 使用 :root 默认变量（蓝色扁平）
└─ theme-playful  → 使用 body.theme-playful 覆盖变量（橙色圆润）
        ↓
深色模式 settings.dark 叠加 body.dark → 进一步覆盖变量
```

**关键文件：**
- [src/store.js](src/store.js) — 默认设置 `theme: 'classic'`
- [src/main.js#applyTheme](src/main.js) — `applyTheme()` 和 `setTheme()` 函数
- [src/style.css](src/style.css) — `:root`（经典）+ `body.theme-playful`（趣味）变量和组件样式

### 经典主题（Classic）

| 属性 | 值 |
|------|-----|
| 启用方式 | `body.theme-classic`（默认） |
| 主色 | `#3b82f6`（蓝色） |
| 背景 | `#f5f6f8`（浅灰） |
| 卡片 | `#ffffff`（纯白） |
| 圆角 | `14px` |
| 阴影 | `0 2px 12px rgba(0,0,0,0.06)` |
| 气质 | 专业、专注、扁平化 |
| 适用场景 | 严肃学习、长时间使用 |

**CSS 变量定义位置：** `:root`（style.css 第 2-17 行）

### 趣味主题（Playful）

| 属性 | 值 |
|------|-----|
| 启用方式 | `body.theme-playful` |
| 主色 | `#ff8a4c`（橙色） |
| 背景 | `#fff8f0`（暖白） |
| 卡片 | `#ffffff`（纯白） |
| 圆角 | `16px`（更圆润） |
| 阴影 | `0 4px 12px rgba(255,138,76,0.12)`（带橙色色调） |
| 气质 | 友好、温暖、活泼 |
| 适用场景 | 轻松学习、降低焦虑 |
| 设计参考 | vibe-hub.org/style-playful |

**特色组件样式（仅 Playful 主题）：**
- 统计卡片：三个彩色背景（橙/蓝/红），非统一白底
- 今日卡片：橙色渐变 + 右上角装饰圆 + 内高光
- 开始按钮：按压时 `translateY(2px)` + 阴影收缩（弹性反馈）
- 快捷入口：图标有彩色圆角背景（6 种颜色）
- 三态按钮：底部 4px 立体阴影，按压时下沉
- 底部导航：顶部圆角 + 橙色色调阴影

**CSS 位置：** style.css 末尾「趣味主题（Playful）」章节（约第 880 行起）

### 深色模式叠加

深色模式独立于界面风格，两者可任意组合（4 种状态）：

| 组合 | body class | 效果 |
|------|-----------|------|
| 经典 + 亮色 | `theme-classic` | 蓝色扁平白底 |
| 经典 + 暗色 | `theme-classic dark` | 蓝色扁平深底 |
| 趣味 + 亮色 | `theme-playful` | 橙色圆润暖白底 |
| 趣味 + 暗色 | `theme-playful dark` | 橙色圆润深紫底 |

**深色模式变量覆盖位置：**
- 经典：`body.dark`（style.css 第 296 行）
- 趣味：`body.theme-playful.dark`（style.css 第 906 行）

### 新增风格时的扩展指南

若要新增第三套风格（如 Y2K 千禧风），按以下步骤：

1. **store.js**：`theme` 字段值新增一个选项（如 `'y2k'`）
2. **main.js applyTheme()**：在 class 切换逻辑中加新值
3. **main.js 设置页**：下拉框加新选项
4. **style.css**：新增 `body.theme-y2k { ... }` 变量块 + 组件增强样式
5. **深色叠加**：新增 `body.theme-y2k.dark { ... }` 变量覆盖
6. **本文档**：在上表补充新风格的属性说明

**核心原则：**
- 所有组件样式必须用 `var(--xxx)` 引用变量，不能硬编码颜色
- 新风格只覆盖需要变化的变量，其余继承 `:root` 默认值
- 组件增强用 `body.theme-xxx .component` 选择器，不修改原组件样式
- 深色模式必须同时支持所有风格（写对应的 `.dark` 覆盖）
