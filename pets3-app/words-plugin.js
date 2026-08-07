/** Vite 插件：构建前自动从 wordlists/pets3_words.json 生成 words-data.js */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export function wordsDataPlugin() {
  return {
    name: 'words-data-plugin',
    buildStart() {
      const src = join(process.cwd(), '..', 'wordlists', 'pets3_words.json');
      const out = join(process.cwd(), 'src', 'words-data.js');
      try {
        const words = JSON.parse(readFileSync(src, 'utf-8'));
        // 保持对象格式（与 main.js/srs.js/store.js 的字段一致：w/ph/def/sent）
        const js = 'window.__WORDS__=' + JSON.stringify(words, null, 0).replace(/</g, '\\u003c') + ';';
        writeFileSync(out, js, 'utf-8');
        console.log(`[words-data] generated ${words.length} words -> ${(js.length / 1024 / 1024).toFixed(2)} MB`);
      } catch (e) {
        console.warn('[words-data] skipped:', e.message);
      }
    },
  };
}
