/* 人が書いたレシピ情報（data/recipes.ts）と、
   Instagram から取り込んだ数値（data/instagram.json）を合流させて、
   ブラウザが読む recipes.js を書き出す。

   分けている理由：
   機械にコメント付きのファイルを書き換えさせると、いつか必ず壊す。
   人が書く側と機械が書く側を別のファイルにしておけば、その事故が起きない。 */

import fs from 'node:fs';
import path from 'node:path';
import { RECIPES, TAGS, TAG_AXES, TAG_MIN, type Recipe } from '../data/recipes.ts';

const ROOT = path.join(import.meta.dirname, '..');

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
  const file = path.join(ROOT, 'data', 'instagram.json');
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

/** ブラウザが読む recipes.js を書き出す */
export function writeRecipesJs(): string {
  const rows = siteRecipes();
  const body = `/* このファイルは書き出されたものです。直接編集しないでください。上書きされます。
   人が書く元データ … data/recipes.ts
   取り込んだ数値   … data/instagram.json
   書き出し         … npm run build

   likes などが null は「まだ取り込めていない」の意味。
   0 と null は違う。0 と書くと「いいねが0件」という嘘になる。 */

window.RECIPES = ${JSON.stringify(rows, null, 2)};

window.TAGS = ${JSON.stringify(TAGS, null, 2)};

window.TAG_AXES = ${JSON.stringify(TAG_AXES, null, 2)};

window.TAG_MIN = ${TAG_MIN};
`;
  fs.writeFileSync(path.join(ROOT, 'recipes.js'), body, 'utf8');
  return body;
}
