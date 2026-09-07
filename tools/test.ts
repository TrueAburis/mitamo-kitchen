/* キャプション解析と材料辞書の検証。
   実行： node tools/test.js

   実際の投稿（data/captions/）に対して、取れるはずのものが取れているかを確かめる。
   キャプションの書き方は回によって揺れるので、
   「1本でたまたま動いた」を「3本とも動く」に変えるのがこのファイルの役目。

   失敗すると終了コード 1 を返すので、あとで GitHub Actions からも同じものを回せる。 */

import fs from 'node:fs';
import path from 'node:path';
import * as CaptionParser from './parse-caption.ts';
import * as IngredientDict from './ingredients-ja-en.ts';
import type { Group } from './parse-caption.ts';
import { permalinkCode, toFigures, merge } from './fetch-instagram.ts';
import { findAvoided } from './check-english.ts';
import { CAPTIONS } from './paths.ts';

const dir = CAPTIONS;
const read = (f: string) => fs.readFileSync(path.join(dir, f), 'utf8');

let failed = 0;
let checked = 0;

function check(label: string, actual: unknown, expected: unknown): void {
  checked++;
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failed++;
    console.log(`  NG  ${label}`);
    console.log(`      期待: ${JSON.stringify(expected)}`);
    console.log(`      実際: ${JSON.stringify(actual)}`);
  } else {
    console.log(`  ok  ${label}`);
  }
}

function itemCount(groups: Group[]): number {
  return groups.reduce((n, g) => n + g.items.length, 0);
}

function groupNames(groups: Group[]): string[] {
  return groups.map((g) => g.name).filter((n): n is string => Boolean(n));
}

function allNames(groups: Group[]): string[] {
  const out: string[] = [];
  groups.forEach((g) => g.items.forEach((it) => out.push(it.name)));
  return out;
}

/* ---------- 南蛮漬け：英語あり、グループあり ---------- */
console.log('\n南蛮漬け（英語あり・グループあり）');
{
  const r = CaptionParser.parse(read('nanbanzuke.txt'));
  check('日本語タイトル', r.titleJa, '鶏むね肉と茄子の南蛮漬け');
  check('英語タイトル', r.titleEn, 'Chicken Breast and Eggplant Nanban-zuke');
  check('材料の数（日）', itemCount(r.groupsJa), 14);
  check('材料の数（英）', itemCount(r.groupsEn), 14);
  check('グループ名（日）', groupNames(r.groupsJa), ['南蛮のタレ']);
  check('グループ名（英）', groupNames(r.groupsEn), ['Nanban Sauce']);
  check('手順は無い', r.steps.length, 0);
  check('PRではない', r.isPR, false);

  const cov = IngredientDict.coverage(allNames(r.groupsJa));
  check('辞書で全部引ける', cov.missing, []);
}

/* ---------- 素麺：材料欄に注意書きが混ざる、英語の語順が逆 ---------- */
console.log('\n素麺（注意書きの混入・英語の語順が逆）');
{
  const r = CaptionParser.parse(read('somen.txt'));
  check('日本語タイトル', r.titleJa, '冷やし鶏鰹出汁さっぱり素麺');
  check('材料の数（日）', itemCount(r.groupsJa), 11);
  check('材料の数（英）', itemCount(r.groupsEn), 11);
  check('グループ名（日）', groupNames(r.groupsJa), ['みょうがの甘酢漬け']);

  /* 「出汁ガラを引き上げ後」は材料ではない。材料として数えてはいけない */
  const notes = r.groupsJa.reduce((a: string[], g) => a.concat(g.notes), [] as string[]);
  check('注意書きを材料から分けた', notes, ['出汁ガラを引き上げ後']);

  /* 全角スペース区切り・全角数字 */
  const names = allNames(r.groupsJa);
  check('全角スペース区切りを分解', names.includes('薄口醤油'), true);
  const sugar = r.groupsJa[1].items.find((i) => i.name === '砂糖');
  check('全角数字の分量', sugar && sugar.qty, '大さじ１');

  /* 英語は「1 chicken thigh」と分量が先に来る */
  const en = allNames(r.groupsEn);
  check('英語の語順が逆でも名前を取れる', en.includes('chicken thigh'), true);

  const cov = IngredientDict.coverage(names);
  check('辞書で全部引ける', cov.missing, []);
}

/* ---------- 小籠包：英語なし、PR案件 ---------- */
console.log('\n小籠包（英語なし・PR案件）');
{
  const r = CaptionParser.parse(read('shoronpo.txt'));
  check('日本語タイトル', r.titleJa, '包まない海老小籠包');
  check('英語タイトルは無い', r.titleEn, null);
  check('英語の材料も無い', itemCount(r.groupsEn), 0);
  check('材料の数（日）', itemCount(r.groupsJa), 5);
  check('PR案件として検出', r.isPR, true);

  /* 分量に補足が付く回：「長ネギ 1本分　大体 50g」 */
  const negi = r.groupsJa[0].items.find((i) => i.name === '長ネギ');
  check('分量の補足を落とさない', negi && negi.qty, '1本分 大体 50g');

  /* 商品名は辞書に無いのが正しい。訳さず日本語のまま残す */
  const cov = IngredientDict.coverage(allNames(r.groupsJa));
  check('商品名だけ訳さない', cov.missing, ['これ!うま‼つゆ']);
}

/* ---------- 単位の変換 ---------- */
console.log('\n単位の変換');
check('大さじ2', IngredientDict.qty('大さじ2'), '2 tbsp');
check('小さじ1', IngredientDict.qty('小さじ1'), '1 tsp');
check('全角数字', IngredientDict.qty('大さじ２'), '2 tbsp');
check('400ml', IngredientDict.qty('400ml'), '400ml');
check('適量', IngredientDict.qty('適量'), 'to taste');
check('二つまみ', IngredientDict.qty('二つまみ'), '2 pinches');
check('訳せないものは null', IngredientDict.qty('お好きなだけ'), null);

/* ---------- Instagram の取り込み ---------- */
console.log('\nInstagram の取り込み');
{
  check('リールのURLからコードを取れる',
    permalinkCode('https://www.instagram.com/reel/DcaOmyvRcAI/'), 'DcaOmyvRcAI');
  check('通常投稿のURLからも取れる',
    permalinkCode('https://www.instagram.com/p/ABC123/?utm_source=x'), 'ABC123');
  check('URLが無ければ null', permalinkCode(null), null);

  const media = [
    { id: '1', permalink: 'https://www.instagram.com/reel/DcaOmyvRcAI/', like_count: 1842, comments_count: 37 },
    { id: '2', permalink: 'https://www.instagram.com/reel/NOTMINE/', like_count: 99 }
  ];
  const figs = toFigures(media, '2026-09-07');

  check('投稿URLのあるレシピに数値が付く', figs['tori-mune-nasu-nanbanzuke']?.likes, 1842);
  check('投稿URLの無いレシピは対象外', figs['tori-negi-meshi'], undefined);
  check('再生数は権限がまだ無いので null', figs['tori-mune-nasu-nanbanzuke']?.views, null);

  /* ここが一番大事。取れなかったときに前の数字を消してしまうと、
     画面から数値が消えて「取り込みが壊れた」ように見える */
  const prev = { 'tori-negi-meshi': { likes: 500, comments: 8, views: null, fetchedAt: '2026-09-01' } };
  const merged = merge(prev, { 'tori-negi-meshi': { likes: null, comments: null, views: null, fetchedAt: '2026-09-07' } });
  check('取れなかったときは前の数字を残す', merged['tori-negi-meshi']?.likes, 500);
  check('取れたときは新しい数字で置き換える',
    merge(prev, { 'tori-negi-meshi': { likes: 640, comments: 9, views: null, fetchedAt: '2026-09-07' } })['tori-negi-meshi']?.likes, 640);
}

/* ---------- 出来上がったものを読み返す ---------- */
/* ここまでの検査は「キャプションを正しく読めたか」だけを見ている。
   読めたあと、書き出したページに何が載っているかは誰も見ていなかった。
   実際、多言語化のときにトップの分量表が丸ごと消えたのに気づけなかったので、
   出口側の検査をここに足す。 */
{
  console.log('\n── 書き出したレシピ本文（content/）');
  const found = await findAvoided();
  check('使わないと決めた英語が残っていない', found.map((f) => f.where + ': ' + f.avoid), []);
  found.forEach((f) => console.log(`      ${f.where}\n        "${f.text}"\n        → "${f.avoid}" ではなく ${f.use}`));
}

/* ---------- 結果 ---------- */
console.log(`\n${checked} 件中 ${checked - failed} 件が期待どおり。`);
if (failed) {
  console.log(`${failed} 件が想定と違います。`);
  process.exit(1);
}
console.log('すべて通りました。');
