/* 対訳表（data/phrasebook.ts）を、レシピ本文を作るときに効かせるための道具。

   対訳表は「投稿の英語のここが違う」を1行ずつ人が書き留めたもの。
   書いただけでは画面は直らないので、ここで橋を架ける。

   やることは2つだけ。

   1. 文（タイトル・リード文・コツ）は、日本語をキーに直した英語へ差し替える
   2. 出てはいけない英語（TERMS の avoid）が混ざっていないか見張る

   材料名をここで差し替えないのは、対訳表の材料行が「昆布 10g」のように
   名前と分量をひとつなぎで持っているのに対し、画面は名前と分量を別の欄に
   出すため。材料名は tools/ingredients-ja-en.ts の辞書を正とする。
   （定訳が固まったものは辞書側に反映する、と CLAUDE.md で決めてある） */

import { POSTS, TERMS } from '../data/phrasebook.ts';

/** 全角スペースや連続した空白を詰めて、突き合わせられる形にする */
function norm(s: string): string {
  return s.replace(/　/g, ' ').replace(/\s+/g, ' ').trim();
}

/** 日本語 → 直した英語。値が null は「英語を当てない」の意味 */
export type Overrides = Map<string, string | null>;

/* 対訳表に載っている回だけ、日本語をキーにした差し替え表を作る。
   fixed が入っていればそれを、null なら投稿された英語をそのまま使う。
   fixed も posted も null の行（判断がつかず保留にした行）は、
   値を null にして返す。呼ぶ側で「英語なし」として扱う。 */
export function overrides(slug: string): Overrides {
  const map: Overrides = new Map();
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) { return map; }
  post.lines.forEach((l) => {
    if (l.where === 'ingredient') { return; }
    map.set(norm(l.ja), l.fixed !== null ? l.fixed : l.posted);
  });
  return map;
}

/* どのキーが使われたかを覚えておく。使われなかったキーは、
   対訳表に書いた日本語とキャプションの日本語が食い違っているという意味で、
   黙って投稿のままの英語が出てしまう。generate.ts がこれを見て警告する。
   （実際、鴨ネギ蕎麦のコツが「てきたら」「できたら」の1字違いで当たっていなかった） */
const used = new Set<string>();

/** その回の、まだ一度も当たっていないキー（日本語）を返す */
export function unused(slug: string): string[] {
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) { return []; }
  return post.lines
    .filter((l) => l.where !== 'ingredient')
    .map((l) => norm(l.ja))
    .filter((k) => !used.has(k));
}

/** 対訳表に、この回の行があるか（無い回は差し替えようがない） */
export function known(slug: string): boolean {
  return POSTS.some((p) => p.slug === slug);
}

/* 英文に、使わないと決めた言い回しが残っていないか。
   残っていたものを配列で返す（空なら問題なし）。
   avoid は実際に投稿で使われた語なので、部分一致で足りる。 */
export function avoidHits(en: string | null): { avoid: string; use: string }[] {
  if (!en) { return []; }
  const low = en.toLowerCase();
  const hits: { avoid: string; use: string }[] = [];
  TERMS.forEach((t) => {
    /* 正しい言い方のほうが、避けたい語を含んでいることがある。
       Kelp を避けて kombu (dried kelp) を使う、がその例で、
       素通しにすると正解のほうが引っかかってしまう。
       すでに正しい言い方になっている文は、見逃してよい。 */
    if (low.includes(t.en.toLowerCase())) { return; }
    t.avoid.forEach((a) => {
      if (low.includes(a.toLowerCase())) { hits.push({ avoid: a, use: t.en }); }
    });
  });
  return hits;
}

/* 差し替え表を引く。載っていない文はそのまま返す。

   キャプションは1行1文で書かれているが、サイトのリード文は
   段落まるごとを1つの文字列にして持つ。だから
   「A！ B！」で引いても対訳表には A と B が別々に載っていて当たらない。
   段落で当たらなかったときは、文に切って1つずつ引き、
   **全部そろったときだけ**つなぎ直す。1文でも欠けたら、
   つぎはぎの英語になるので投稿のままにしておく。 */
export function sentence(map: Overrides, ja: string | null, en: string | null): string | null {
  if (!ja) { return en; }
  const key = norm(ja);
  if (map.has(key)) { used.add(key); return map.get(key) as string | null; }

  /* 「！！」のように記号が続く回がある。1つずつ切ると空に近い断片ができて、
     日本語と英語で文の数がずれ、直した英語が当たらなくなる。 */
  const parts = norm(ja).split(/(?<=[。！？!?])(?![。！？!?])\s*/).filter((p) => p.trim());
  if (parts.length < 2) { return en; }

  /* 全文そろっているとき。いちばん素直な形 */
  const all = parts.map((p) => map.get(norm(p)));
  if (all.every((v) => typeof v === 'string')) {
    parts.forEach((p) => used.add(norm(p)));
    return (all as string[]).join(' ');
  }

  /* 一部しか載っていないとき。
     対訳表は全文を写しているとは限らないので、ここで諦めると
     直した文まで投稿のままの英語に戻ってしまう。
     日本語と英語の文の数が合っていれば、載っている文だけ入れ替える。
     数が合わなければ、どの文がどれに対応するか分からないので投稿のまま。 */
  if (!en) { return en; }
  const enParts = en.split(/(?<=[.!?])(?![.!?])\s+/).filter((p) => p.trim());
  if (enParts.length !== parts.length) { return en; }

  return parts.map((p, i) => {
    const v = map.get(norm(p));
    if (typeof v !== 'string') { return enParts[i]; }
    used.add(norm(p));
    return v;
  }).join(' ');
}
