/* 人が書いたレシピ情報（data/recipes.ts）と、
   Instagram から取り込んだ数値（data/instagram.json）を合流させて、
   ブラウザが読む dist/recipes.js を書き出す。

   分けている理由：
   機械にコメント付きのファイルを書き換えさせると、いつか必ず壊す。
   人が書く側と機械が書く側を別のファイルにしておけば、その事故が起きない。 */

import fs from 'node:fs';
import path from 'node:path';
import { RECIPES, TAGS, TAG_AXES, TAG_MIN, type Recipe } from '../data/recipes.ts';
import { INSTAGRAM_JSON, RECIPES_JS } from './paths.ts';

/** Instagram から取り込んだ1件分。取れていない項目は null のまま */
export type Figures = {
  likes: number | null;
  comments: number | null;
  views: number | null;
  fetchedAt: string | null;
};

/** 画面に渡す1件。人が書いた情報に数値を合流させたもの */
export type SiteRecipe = Recipe & Figures;

const EMPTY: Figures = { likes: null, comments: null, views: null, fetchedAt: null };

/** data/instagram.json を読む。無ければ空として扱う（初回や、取り込み前） */
export function loadFigures(): Record<string, Figures> {
  const file = INSTAGRAM_JSON;
  if (!fs.existsSync(file)) { return {}; }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, Figures>;
  } catch {
    console.log('  ! data/instagram.json を読めませんでした。数値なしで組み立てます');
    return {};
  }
}

/** 人が書いた情報と数値を合流させる */
export function siteRecipes(): SiteRecipe[] {
  const figures = loadFigures();
  return RECIPES.map((r) => ({ ...r, ...(figures[r.slug] ?? EMPTY) }));
}

export { TAGS, TAG_AXES, TAG_MIN };

/* 新しい順。投稿日が分からない回（posted が null）は後ろに回す。
   script.js にも同じ並べ方が入っている（あちらはブラウザが読む側）。
   並べようがないものを新しい側に置くと、一覧の先頭が意味を持たなくなるため。 */
export function byNewest(a: Recipe, b: Recipe): number {
  if (!a.posted && !b.posted) { return 0; }
  if (!a.posted) { return 1; }
  if (!b.posted) { return -1; }
  return b.posted.localeCompare(a.posted);
}

/** ブラウザが読む dist/recipes.js を書き出す。
 *  withEn には英語ページを作った回の slug を渡す。
 *  一覧・ガチャ・関連レシピは画面側で組み立てているので、
 *  ここで教えておかないと、英語ページで「英語版が無い回」へのリンクを出してしまう。 */
export function writeRecipesJs(withEn?: Set<string>): string {
  const rows = siteRecipes().map((r) => ({ ...r, hasEn: withEn ? withEn.has(r.slug) : true }));
  const body = `/* このファイルは書き出されたものです。直接編集しないでください。上書きされます。
   人が書く元データ … data/recipes.ts
   取り込んだ数値   … data/instagram.json
   書き出し         … npm run build

   likes などが null は「まだ取り込めていない」の意味。
   0 と null は違う。0 と書くと「いいねが0件」という嘘になる。

   hasEn が false は「この回の英語ページは作っていない」の意味。
   英語で見ているときは、一覧にもガチャにも出さない（開いても 404 になるため）。 */

window.RECIPES = ${JSON.stringify(rows, null, 2)};

window.TAGS = ${JSON.stringify(TAGS, null, 2)};

window.TAG_AXES = ${JSON.stringify(TAG_AXES, null, 2)};

window.TAG_MIN = ${TAG_MIN};
`;
  fs.mkdirSync(path.dirname(RECIPES_JS), { recursive: true });
  fs.writeFileSync(RECIPES_JS, body, 'utf8');
  return body;
}
