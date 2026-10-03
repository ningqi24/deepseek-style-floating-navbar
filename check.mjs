/**
 * 自检：node check.mjs
 *  1. 两侧语言的 i18n key 必须完全对齐
 *  2. 页面里引用的 key 必须存在
 *  3. 本地资源引用必须真实存在
 *  4. JS 语法可解析
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const errors = [];
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));

for (const f of ['glass-navbar.css', 'glass-navbar.js', 'index.html', 'demo.css', 'demo.js', 'demo-i18n.js']) {
  if (!exists(f)) errors.push('缺少 ' + f);
}

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read('demo-i18n.js'), sandbox);
const dict = sandbox.window.GNAV_I18N || {};

const zh = Object.keys(dict.zh || {}).sort();
const en = Object.keys(dict.en || {}).sort();
zh.filter((k) => en.indexOf(k) === -1).forEach((k) => errors.push('英文缺少词条：' + k));
en.filter((k) => zh.indexOf(k) === -1).forEach((k) => errors.push('中文缺少词条：' + k));

const html = read('index.html');
const used = new Set();
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) used.add(m[1]);
for (const k of used) if (!(k in (dict.zh || {}))) errors.push('页面引用了不存在的词条：' + k);

for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const url = m[1];
  if (/^(https?:|data:|#|mailto:)/i.test(url)) continue;
  if (!exists(url.split('?')[0])) errors.push('引用了不存在的文件：' + url);
}

for (const f of ['glass-navbar.js', 'demo.js', 'demo-i18n.js']) {
  try { execFileSync(process.execPath, ['--check', path.join(ROOT, f)], { stdio: 'pipe' }); }
  catch (e) { errors.push('语法错误 ' + f + ' :: ' + String(e.stderr || e.message).trim().split('\n').pop()); }
}

console.log('词条 zh ' + zh.length + ' / en ' + en.length + ' · 页面引用 ' + used.size + ' 条');
if (errors.length) { errors.forEach((e) => console.log('  x ' + e)); process.exit(1); }
console.log('全部通过 ✓');
