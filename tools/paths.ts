/* どこに何が置いてあるか。**置き場所を決めているのはこのファイルだけ。**

   これを作った理由：
   道具が増えるにつれて path.join(ROOT, 'content') のような行が
   6つのファイルに散らばり、書き出し先を1つ動かすたびに
   全部を追いかけて直す必要が出てきた。1箇所でも直し忘れると、
   古い場所にファイルが残って、それに気づけない。

   この構成のいちばん大事な線は、**ソースと生成物の境**。

     人が書く（git で追う）        機械が作る（git で追わない）
     ─────────────────────────    ─────────────────────────
     data/     元データ            dist/     公開するものが全部入る
     content/  レシピ本文
     assets/   そのまま配るもの
     tools/    組み立てと検証

   dist/ を git に入れないのは、ソースから何度でも同じものが作れるため。
   入れると、中身を1文字変えるたびに46ファイルの差分が出て、
   本当の変更が履歴の中で見えなくなる。公開は GitHub Actions が
   その場で組み立てて送る（.github/workflows/deploy.yml）。 */

import path from 'node:path';

/** リポジトリの一番上 */
export const ROOT = path.join(import.meta.dirname, '..');

/* ---- 人が書く側 ---- */

/** レシピ一覧・献立・対訳表など、手で書く元データ */
export const DATA = path.join(ROOT, 'data');

/** みたもさんからもらった Instagram のキャプション本文 */
export const CAPTIONS = path.join(DATA, 'captions');

/** レシピ本文（材料・手順・コツ）。生成もできるが、人が直す前提 */
export const CONTENT = path.join(ROOT, 'content');

/** 加工せずそのまま配るもの。CSS・JS・写真 */
export const ASSETS = path.join(ROOT, 'assets');

/** みたもさんと共有しているページの元ファイル。サイト本体ではない */
export const DOCS = path.join(ROOT, 'docs');

/* ---- 機械が作る側 ---- */

/** 公開するものが全部入る。ここを丸ごと S3 に送れば公開できる */
export const DIST = path.join(ROOT, 'dist');

/** 英語版のページ。日本語は DIST の直下 */
export const DIST_EN = path.join(DIST, 'en');

/* ---- 個別のファイル ---- */

/** Instagram から取り込んだ数値。機械が書き換える唯一のデータファイル */
export const INSTAGRAM_JSON = path.join(DATA, 'instagram.json');

/** ブラウザが読むレシピ一覧。data/ の中身から書き出される */
export const RECIPES_JS = path.join(DIST, 'recipes.js');

/** そのまま配るファイルのうち、dist/ の直下に置くもの */
export const COPY_TO_DIST = ['style.css', 'script.js'];

/** そのまま配るフォルダ。中身ごと dist/ に写す */
export const COPY_DIRS = ['images'];
