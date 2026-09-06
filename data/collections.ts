/* 献立（レシピをいくつか束ねたもの）。
 *
 * 単品のレシピは「今日これを作る」には答えるが、
 * 「今週どうするか」には答えない。そこを埋めるのが献立。
 *
 * 自動では作れない。**どれとどれを組み合わせると食卓が成立するかは、
 * 作る人の判断**なので、ここは人が書く。
 * 自動で増えたレシピを、後から束ねるだけなので手間は小さい。
 *
 * recipes には data/recipes.ts の slug を並べる。
 * 存在しない slug を書くと、組み立てのときに気づけるようにしてある。 */

export type Collection = {
  slug: string;
  ja: { title: string; lead: string };
  en: { title: string; lead: string };
  /** data/recipes.ts の slug。並べた順に出る */
  recipes: string[];
  /** 本文が仮のものかどうか。true だと画面に「仮の文章」と出る */
  draft: boolean;
};

export const COLLECTIONS: Collection[] = [
  {
    slug: 'atsui-hi',
    ja: {
      title: '暑い日の献立',
      lead: '火の前に長く立ちたくない日に。さっぱりした主菜と、冷たい麺の組み合わせです。'
    },
    en: {
      title: 'For a hot day',
      lead: 'For days you would rather not stand over the stove. A tangy main and a chilled noodle dish.'
    },
    recipes: ['tori-mune-nasu-nanbanzuke', 'hiyashi-tori-katsuo-somen'],
    /* 文章はこちらで書いた仮のもの。みたもさんの言葉に差し替える */
    draft: true
  }
];
