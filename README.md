# 墨词背单词（PETS-3 版）

仿「墨墨背单词」的公共英语三级（PETS-3）词汇学习 App。

## 功能
- **记忆曲线引擎**：认识/模糊/忘记 三态 → 智能间隔复习（1/3/7/15/30/60/90 天递增）
- **每日学习流**：N 个新词 + 到期待复习词
- **单词卡片**：单词/音标/释义/例句/发音（点卡片翻释义）
- **打卡统计**：连续天数、累计学词、记忆持久度、70 天学习日历热力图
- **单词本**：全部 4544 词浏览/搜索（搜单词或释义）
- **每日提醒**：定时本地通知（Android）
- **深色模式**、每日新词数可调、自动发音开关

## 词库
公共英语三级（PETS-3）大纲词汇 **4544 词**，含美式/英式音标、词性、中文释义、双语例句。
数据源：kajweb/dict（CET4 词库合并去重）——PETS-3 与四级词汇高度重合。

## 安装 APK
- `pets3-app.apk` 为签名安装包（debug 签名，可直接安装）
- 手机开启「允许安装未知来源应用」→ 传输 APK → 点击安装
- 上架应用商店需重新用正式 keystore 签名

## 本地开发
```bash
cd pets3-app
npm install
npm run dev        # 网页预览（PC/手机浏览器）
npm run build      # 构建 www/
npx cap sync android
cd android && ./gradlew assembleDebug   # 或 gradlew.bat assembleDebug
```

## 技术栈
- 前端：Vanilla JS + Vite（单文件构建，离线可用）
- 壳：Capacitor 6（Android WebView）
- 数据：localStorage 本地持久化，无需联网
- 发音：Android 原生 TTS / Web Speech API

## 目录结构
```
pets3-app/
  src/            # 前端源码
    main.js       # 主应用（UI + 交互）
    srs.js        # 记忆曲线算法
    store.js      # 数据持久化
    tts.js        # 发音
    notify.js     # 本地通知
    style.css     # 样式
    words-data.js # 词库数据（构建时生成）
  android/        # Android 原生工程（Capacitor 生成）
  www/            # 构建产物
wordlists/        # 原始词库 + 合并脚本
```
