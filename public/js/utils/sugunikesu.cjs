const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DEFAULT_PATH = path.join(__dirname,'wordData.js');

function resolvePath(arg) {
  if (!arg) return DEFAULT_PATH;
  return path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);
}

function loadViaVM(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');

  // 1) export default -> module.exports =
  src = src.replace(/export\s+default\s+/g, 'module.exports = ');

  // 2) collect named exports (export const/let/var/function/class name ...)
  const named = [];
  src = src.replace(/export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g, (m, name) => {
    named.push(name);
    return m.replace('export ', ''); // remove 'export' so declaration remains
  });

  // 3) handle "export { a, b as c };" by collecting names inside braces (best-effort)
  src = src.replace(/export\s*\{\s*([A-Za-z0-9_,$\s]+)\s*\}\s*;/g, (m, list) => {
    const parts = list.split(',').map(s => s.split('as')[0].trim()).filter(Boolean);
    for (const p of parts) if (!named.includes(p)) named.push(p);
    return ''; // remove the export line
  });

  // 4) append module.exports assignment for named exports if module.exports not already set
  if (named.length) {
    const mapping = named.map(n => `${n}: typeof ${n} !== 'undefined' ? ${n} : undefined`).join(', ');
    src += `\n// appended by printTagList to expose named exports\nif(!(module && Object.keys(module.exports || {}).length)){\n  module.exports = { ${mapping} };\n}\n`;
  }

  const sandbox = {
    module: { exports: {} },
    exports: {},
    window: {},
    global: {},
    console,
    require,
    process
  };

  try {
    vm.runInNewContext(src, sandbox, { filename: filePath, timeout: 5000 });
  } catch (e) {
    // 実行エラーはログに出すが続行
    console.error('vm run error:', e && e.message);
  }

  // 優先順位: module.exports, window.wordData, sandbox.wordData
  if (sandbox.module && sandbox.module.exports && Object.keys(sandbox.module.exports).length) return sandbox.module.exports;
  if (sandbox.window && sandbox.window.wordData) return sandbox.window.wordData;
  if (sandbox.wordData) return sandbox.wordData;
  return null;
}

function loadWordDataFromFile(filePath) {
  const abs = resolvePath(filePath);
  if (!fs.existsSync(abs)) {
    console.error('file not found:', abs);
    return null;
  }

  // try require first (may fail on 'export' syntax)
  try {
    const req = require(abs);
    if (req) return req.default || req.wordData || req;
  } catch (e) {
    // ignore, fall back to VM parsing
  }

  return loadViaVM(abs);
}

function buildTagMap(wordData) {
  const map = new Map();
  const add = (tag, word) => {
    const key = tag == null ? '(無タグ)' : String(tag);
    const entry = map.get(key) || { count: 0, words: new Set() };
    entry.count++;
    if (word) entry.words.add(word);
    map.set(key, entry);
  };

  if (!wordData) return map;

  if (Array.isArray(wordData)) {
    for (const item of wordData) {
      const word = item && (item.word || item.text || item.label) || (typeof item === 'string' ? item : null);
      const tags = item && (item.tags || item.tag || item.category) || null;
      if (Array.isArray(tags)) {
        for (const t of tags) add(t, word);
      } else if (tags) {
        add(tags, word);
      } else {
        if (typeof item === 'string') add('(無タグ)', item);
      }
    }
  } else if (typeof wordData === 'object') {
    for (const [k, v] of Object.entries(wordData)) {
      if (Array.isArray(v)) {
        for (const w of v) add(k, w);
      } else if (v && typeof v === 'object') {
        const tags = v.tags || v.tag || v.category;
        if (Array.isArray(tags)) {
          for (const t of tags) add(t, k);
        } else if (tags) {
          add(tags, k);
        } else {
          add('(無タグ)', k);
        }
      } else {
        add(v, k);
      }
    }
  }
  return map;
}

function printTagList(tagMap, sampleLimit = 8) {
  const rows = Array.from(tagMap.entries())
    .map(([tag, info]) => ({
      tag,
      count: info.count,
      samples: Array.from(info.words).slice(0, sampleLimit).join(', ')
    }))
    .sort((a, b) => b.count - a.count || (a.tag || '').localeCompare(b.tag || ''));
  console.log('--- タグ一覧 ---');
  console.table(rows);
  console.log('総タグ数:', rows.length);
}

(function main() {
  const arg = process.argv[2];
  const fp = resolvePath(arg);
  console.log('reading wordData from', fp);
  const data = loadWordDataFromFile(fp);
  if (!data) {
    console.error('wordData を読み取れませんでした。ファイルを確認してください。');
    process.exitCode = 2;
    return;
  }
  // data がモジュールオブジェクトの場合、主要なエクスポートを探す
  const candidate = data.wordData || data.tango || data.default || data;
  const tagMap = buildTagMap(candidate);
  printTagList(tagMap);
})();