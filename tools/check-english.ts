/* 出来上がったレシピ本文に、使わないと決めた英語が残っていないか調べる。

   対訳表（data/phrasebook.ts）の TERMS には「この英語は使わない」（avoid）が
   書いてある。書いただけでは画面は直らないので、
   **書き出したあとの中身を機械が読み返して**、残っていたら止める。

   これが要る理由：
   これまでの検査はキャプションの読み取りだけを見ていて、
   出来上がったページに何が載っているかは誰も見ていなかった。
   実際、多言語化のときにトップの分量表が丸ごと消えたのに気づけなかった。
   「入口」ではなく「出口」を見張る検査をここに置く。 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { avoidHits } from './phrasebook-apply.ts';
import { RECIPES } from '../data/recipes.ts';

import { CONTENT } from './paths.ts';

export type Finding = { where: string; text: string; avoid: string; use: string };

/** 英語とみなす文字列だけを見る。日本語が混ざっていれば材料の日本語名なので対象外 */
function isEnglish(s: string): boolean {
  return /[A-Za-z]/.test(s) && !/[ぁ-んァ-ヶ一-龥]/.test(s);
}

/** どんな形のデータでも、中の文字列を全部たどる */
function walk(node: unknown, at: string, out: Finding[]): void {
  if (typeof node === 'string') {
    if (!isEnglish(node)) { return; }
    avoidHits(node).forEach((h) => out.push({ where: at, text: node, avoid: h.avoid, use: h.use }));
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, at + '[' + i + ']', out));
    return;
  }
  if (node && typeof node === 'object') {
    Object.entries(node as Record<string, unknown>).forEach(([k, v]) => {
      /* tags は画面に出る言葉ではなく、TAGS を引くための鍵。
         "pickled" のような鍵が英文として引っかかるので見ない。 */
      if (k === 'tags' || k === 'slug' || k === 'image') { return; }
      walk(v, at + '.' + k, out);
    });
  }
}

/** content/*.js と data/recipes.ts を読み返して、残っている avoid を集める */
export async function findAvoided(): Promise<Finding[]> {
  const out: Finding[] = [];
  walk(RECIPES, 'data/recipes.ts', out);

  const dir = CONTENT;
  if (!fs.existsSync(dir)) { return out; }
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const mod = await import(pathToFileURL(path.join(dir, file)).href + '?t=' + Date.now());
    walk(mod.default, 'content/' + file, out);
  }
  return out;
}

/* 単体でも走らせられるようにしておく（node tools/check-english.ts） */
if (process.argv[1] && import.meta.filename === path.resolve(process.argv[1])) {
  const found = await findAvoided();
  found.forEach((f) => {
    console.log('  ' + f.where + '\n    "' + f.text + '"\n    → "' + f.avoid + '" は使わない。' + f.use);
  });
  console.log(found.length ? '\n' + found.length + ' 件残っています' : '使わないと決めた英語は残っていません');
  process.exit(found.length ? 1 : 0);
}
