/* Instagram から、いいね数・コメント数・投稿URLを取り込む。
 *
 *   node tools/fetch-instagram.ts            本番（環境変数 IG_TOKEN が要る）
 *   node tools/fetch-instagram.ts --dry-run  取り込まず、何が起きるかだけ出す
 *
 * 書き込むのは data/instagram.json だけ。**人が書いたファイルは触らない。**
 * 機械にコメント付きのファイルを書き換えさせると、いつか必ず壊すため。
 *
 * トークンはリポジトリに書かない。GitHub の Secrets から環境変数で渡す。
 *
 * 対応づけの考え方：
 *   data/recipes.ts の instagram（投稿URL）に含まれる短いコードと、
 *   API が返す permalink のコードを突き合わせる。
 *   投稿URLが書かれていないレシピは、対応づけようがないので触らない。 */

import fs from 'node:fs';
import path from 'node:path';
import { RECIPES } from '../data/recipes.ts';
import type { Figures } from './site-data.ts';

import { ROOT, INSTAGRAM_JSON } from './paths.ts';
const OUT = INSTAGRAM_JSON;

/** API が返す1件。使うものだけ書いている */
export type Media = {
  id: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
  timestamp?: string;
  media_type?: string;
  thumbnail_url?: string;
  media_url?: string;
};

/** 投稿URLから短いコードを取り出す。 /reel/ABC123/ → ABC123 */
export function permalinkCode(url: string | null): string | null {
  if (!url) { return null; }
  const m = url.match(/instagram\.com\/(?:reel|p|tv)\/([^/?#]+)/);
  return m ? m[1]! : null;
}

/** API の返答を、slug ごとの数値に変換する。ここが処理の中心 */
export function toFigures(media: Media[], now: string): Record<string, Figures> {
  const byCode = new Map<string, Media>();
  for (const m of media) {
    const code = permalinkCode(m.permalink ?? null);
    if (code) { byCode.set(code, m); }
  }

  const out: Record<string, Figures> = {};
  for (const r of RECIPES) {
    const code = permalinkCode(r.instagram);
    if (!code) { continue; }          /* 投稿URLが無いレシピは対応づけられない */
    const m = byCode.get(code);
    if (!m) { continue; }             /* 消された投稿かもしれない。前の数値を残す */

    out[r.slug] = {
      /* 取れなかった項目は null のままにする。0 と混同しないため。
         いいね数は、投稿者が非表示にしていると API からも返ってこない */
      likes: typeof m.like_count === 'number' ? m.like_count : null,
      comments: typeof m.comments_count === 'number' ? m.comments_count : null,
      /* 再生数は insights の追加権限が要る。まだ取っていないので null 固定 */
      views: null,
      fetchedAt: now
    };
  }
  return out;
}

/** 前回の内容と混ぜる。今回取れなかったものは、前回の値を残す。
 *  取れなかったからといって null で上書きすると、画面から数字が消えてしまう */
export function merge(prev: Record<string, Figures>, next: Record<string, Figures>): Record<string, Figures> {
  const out: Record<string, Figures> = { ...prev };
  for (const [slug, fig] of Object.entries(next)) {
    const before = prev[slug];
    out[slug] = {
      likes: fig.likes ?? before?.likes ?? null,
      comments: fig.comments ?? before?.comments ?? null,
      views: fig.views ?? before?.views ?? null,
      fetchedAt: fig.fetchedAt
    };
  }
  return out;
}

async function fetchMedia(token: string): Promise<Media[]> {
  const fields = 'id,permalink,like_count,comments_count,timestamp,media_type,thumbnail_url,media_url';
  const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=50&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Instagram API が ${res.status} を返しました: ${body.slice(0, 300)}`);
  }
  const json = await res.json() as { data?: Media[] };
  return json.data ?? [];
}

/* ---------- 実行 ---------- */
if (import.meta.main) {
  const dryRun = process.argv.includes('--dry-run');
  const token = process.env.IG_TOKEN;

  if (!token && !dryRun) {
    console.log('環境変数 IG_TOKEN がありません。');
    console.log('本番は GitHub の Secrets から渡します。');
    console.log('手元で動きだけ見るなら: node tools/fetch-instagram.ts --dry-run');
    process.exit(1);
  }

  const prev: Record<string, Figures> =
    fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};

  let media: Media[] = [];
  if (dryRun) {
    /* 録っておいた返答で動かす。トークンが無くても処理を確かめられる */
    const fixture = path.join(ROOT, 'tools', 'fixtures', 'instagram-media.json');
    media = JSON.parse(fs.readFileSync(fixture, 'utf8')) as Media[];
    console.log(`（お試し）記録済みの返答 ${media.length} 件で動かします\n`);
  } else {
    media = await fetchMedia(token!);
    console.log(`Instagram から ${media.length} 件を取得しました\n`);
  }

  const next = merge(prev, toFigures(media, new Date().toISOString().slice(0, 10)));

  for (const r of RECIPES) {
    const f = next[r.slug];
    const code = permalinkCode(r.instagram);
    if (!code) {
      console.log(`  -  ${r.slug}：投稿URLが書かれていないので対象外`);
    } else if (!f || f.likes == null) {
      console.log(`  ?  ${r.slug}：投稿が見つからないか、いいね数が非公開`);
    } else {
      console.log(`  ok ${r.slug}：いいね ${f.likes} ／ コメント ${f.comments ?? '—'}`);
    }
  }

  if (dryRun) {
    console.log('\n（お試しなので data/instagram.json は書き換えていません）');
  } else {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(next, null, 2) + '\n', 'utf8');
    console.log('\ndata/instagram.json を更新しました。npm run build でページに反映されます。');
  }
}
