/* サイトの全ページを、日本語版と英語版の2枚ずつ組み立てる。

   実行： node tools/build.js

   出力：
     /            日本語（index.html, recipes.html, gacha.html, work.html, <slug>.html）
     /en/         英語（同じ構成）

   なぜ分けるのか：
   同じURLでボタン切り替えをしていると、検索エンジンから見て
   英語のページが存在しないことになる。英語で検索されたいので分けた。

   英語の本文が無いレシピは、英語ページを作らない。
   中身が日本語のままのページを「英語です」と出すと、評価を下げるだけなので。 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');

/* ---- 型 ----
   ここが全ページの組み立ての土台になるので、形をはっきりさせておく。
   null は「まだ無い」の意味で、空文字とは区別する。 */

/** 出力する言語。asset はCSSなどへの相対パス、other は別言語版への相対パス */
export type Lang = { code: 'ja' | 'en'; dir: string; asset: string; other: string; otherCode: string };

/** 日本語と英語の対。en が null は「英語がまだ無い」 */
export type Bi = { ja: string | null; en: string | null };

/** hasAlt を false にすると、別言語版が無いページとして組み立てる。
 *  英語の本文が無いレシピがこれにあたる。
 *  false のときは hreflang を出さず、言語切替の行き先も一覧ページに変える。
 *  出していない英語ページを hreflang で指すと、検索エンジンに 404 を教えることになる。 */
export type PageOpts = { file: string; title: string; desc: string; extraHead?: string; hasAlt?: boolean };

export type ContentItem = { ja: string; en: string | null; qja: string | null; qen: string | null };
export type ContentGroup = { name: Bi | null; items: ContentItem[]; note?: Bi | null };
export type ContentStep = {
  ja: string; en: string | null;
  usesJa: string | null; usesEn: string | null;
  wait?: { ja: string; en: string; long: boolean };
};

/** content/<slug>.js の中身 */
export type RecipeContent = {
  slug: string;
  meta: { servings: Bi; time: Bi };
  intro: Bi[];
  groups: ContentGroup[];
  steps: ContentStep[];
  tips: Bi[];
  jsonld: { cookTime: string | null; totalTime: string | null; yield: string | null; category?: string; cuisine?: string } | null;
};

/** recipes.js の1件 */
export type RecipeMeta = {
  slug: string;
  ja: { title: string; lead: string };
  en: { title: string; lead: string };
  tags: string[];
  image: string;
  posted: string | null;
  instagram: string | null;
  likes: number | null;
  comments: number | null;
  views: number | null;
  ready: boolean;
};

/* いまサイトが置かれている場所。hreflang と og:url は
   絶対URLでないと効かないので、ここだけが出どころ。

   TODO: 独自ドメインが決まったらここを直して組み立て直す。
   それまでは GitHub Pages の確認用URL。
   届かないドメイン（.example）を指したままだと、
   リンクを共有したときの見え方まで嘘になるので、実在する側にしてある。
   リンクはすべて相対なので、/mitamo-kitchen/ の下に置かれても崩れない。 */
const SITE_URL = 'https://trueaburis.github.io/mitamo-kitchen';

/* 検索エンジンに載せるかどうか。
   写真と手順が揃うまでは false。手順が「準備中」のレシピが検索結果に出ると、
   最初の印象が悪くなるため。中身が揃ったら true にして組み立て直すだけ。

   robots.txt では止めない。止めると、この noindex を読みに来てもらえなくなる。 */
const INDEXABLE = false;

const LANGS: Lang[] = [
  { code: 'ja', dir: '', asset: '', other: 'en/', otherCode: 'en' },
  { code: 'en', dir: 'en', asset: '../', other: '../', otherCode: 'ja' }
];

const esc = (s: unknown) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* キャプションの英語は回によって大文字小文字がばらつく（Chicken breast / chicken thigh）。
   材料名として並べたときに揃って見えるよう、先頭だけ大文字にする。 */
const cap = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const pick = (o: Partial<Bi> | null | undefined, lang: string): string => (o && (o as Record<string, string | null>)[lang] != null ? (o as Record<string, string | null>)[lang]! : (o && o.ja) || "");

/* ---------- 画面に出る文言 ---------- */
const T = {
  brandSub: 'Mitamo Kitchen',
  skip: { ja: '本文へスキップ', en: 'Skip to content' },
  searchLabel: { ja: 'レシピを検索', en: 'Search recipes' },
  nav: [
    { href: 'index.html', ja: 'トップ', en: 'Home' },
    { href: 'recipes.html', ja: 'レシピ', en: 'Recipes' },
    { href: 'recipes.html?sort=popular', ja: '人気のレシピ', en: 'Popular' },
    { href: 'recipes.html#tags', ja: 'タグから探す', en: 'Tags' },
    { href: 'collections.html', ja: '献立', en: 'Menus' },
    { href: 'gacha.html', ja: 'レシピガチャ', en: 'Recipe gacha' },
    { href: 'index.html#profile', ja: 'みたもっちゃんねるとは', en: 'Profile' },
    { href: 'work.html', ja: 'お仕事のご依頼', en: 'Work with us' }
  ],
  footNav: [
    { href: 'index.html', ja: 'トップ', en: 'Home' },
    { href: 'recipes.html', ja: 'レシピ', en: 'Recipes' },
    { href: 'gacha.html', ja: 'レシピガチャ', en: 'Recipe gacha' },
    { href: 'index.html#profile', ja: 'みたもっちゃんねるとは', en: 'Profile' },
    { href: 'work.html', ja: 'お仕事のご依頼', en: 'Work with us' }
  ],
  serves: { ja: '分量', en: 'Serves' },
  time: { ja: '時間', en: 'Time' },
  tbc: { ja: '要確認', en: 'TBC' },
  ingredients: { ja: '材料', en: 'Ingredients' },
  stepsComing: {
    ja: '手順はまだ入っていません。材料とコツだけ先に載せています。',
    en: 'The steps are not written up yet. For now, only the ingredients and notes are here.'
  },
  notes: { ja: 'コツ', en: 'Notes' },
  similar: { ja: '似ているレシピ', en: 'Similar recipes' },
  recipesLabel: { ja: 'レシピ', en: 'Recipes' },
  figuresNote: {
    ja: '数値は Instagram の投稿から取り込んだものです。「—」はまだ取り込めていません。',
    en: 'Figures come from Instagram. A dash means it has not been fetched yet.'
  },
};

/* ---------- ページの外枠 ---------- */
function head(lang: Lang, o: PageOpts): string {
  const L = lang;
  const alt = o.hasAlt !== false;
  const canonical = `${SITE_URL}/${L.dir ? L.dir + '/' : ''}${o.file}`;

  return `<!DOCTYPE html>
<html lang="${L.code}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<!-- TODO: ロゴが決まったら差し替える。いまは仮の椀のかたち -->
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23FCFBF8'/%3E%3Cpath d='M5 15h22a11 11 0 0 1-22 0z' fill='%231E2320'/%3E%3Crect x='3' y='26' width='26' height='2' fill='%231E2320'/%3E%3C/svg%3E">

<!-- 見出しだけ明朝を読み込む。本文はOS標準のままなので、
     フォントの到着を待たずに文章は表示される -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@600;700&display=swap">
<link rel="stylesheet" href="${L.asset}style.css">
${INDEXABLE ? '' : `<!-- 中身が揃うまで検索結果に出さない。tools/build.js の INDEXABLE を true にすると外れる -->
<meta name="robots" content="noindex, nofollow">
`}
<link rel="canonical" href="${canonical}">${alt ? `
<!-- 日本語版と英語版の対応。絶対URLでないと効かない -->
<link rel="alternate" hreflang="ja" href="${SITE_URL}/${o.file}">
<link rel="alternate" hreflang="en" href="${SITE_URL}/en/${o.file}">
<link rel="alternate" hreflang="x-default" href="${SITE_URL}/${o.file}">` : ''}

<meta property="og:type" content="website">
<meta property="og:site_name" content="みたもっちゃんねる">
<meta property="og:locale" content="${L.code === 'ja' ? 'ja_JP' : 'en_US'}">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta name="twitter:card" content="summary_large_image">
<!-- TODO: 写真が入ったら og:image を絶対URLで足す -->
${o.extraHead || ''}</head>
<body>

<a class="skip" href="#main">${esc(pick(T.skip, L.code))}</a>
`;
}

function header(lang: Lang, o: PageOpts): string {
  const L = lang;
  /* 別言語版が無いページでは、そのページの別言語版を指すと 404 になる。
     押した人を行き止まりに送らないよう、一覧ページに寄せる。 */
  const otherHref = o.hasAlt === false ? L.other + 'recipes.html' : L.other + o.file;
  const navHtml = T.nav.map((n) => {
    const cur = n.href === o.file ? ' aria-current="page"' : '';
    return `      <a href="${n.href}"${cur}>${esc(pick(n, L.code))}</a>`;
  }).join('\n');

  return `<!-- ヘッダーは全ページ共通。tools/build.js が作っている。手で直さないこと -->
<header class="masthead">
  <div class="bar-top">
    <a class="brand" href="index.html">
      <span class="brand-ja">みたもっちゃんねる</span>
      <span class="brand-en" lang="en">${T.brandSub}</span>
    </a>

    <form class="searchbox" role="search" action="recipes.html" method="get">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>
      </svg>
      <input type="search" name="q" autocomplete="off" data-search
             aria-label="${esc(pick(T.searchLabel, L.code))}" placeholder="${esc(pick(T.searchLabel, L.code))}">
    </form>

    <div class="lang">
      <span class="lang-on">${L.code === 'ja' ? 'JA' : 'EN'}</span>
      <a href="${otherHref}" lang="${L.otherCode}" hreflang="${L.otherCode}">${L.code === 'ja' ? 'EN' : 'JA'}</a>
    </div>
  </div>

  <nav class="bar-nav" aria-label="${L.code === 'ja' ? 'サイト内' : 'Site'}">
    <div class="bar-nav-in">
${navHtml}
    </div>
  </nav>
</header>

<main id="main">
`;
}

function footer(lang: Lang): string {
  const L = lang;
  const links = T.footNav.map((n) =>
    `      <a href="${n.href}">${esc(pick(n, L.code))}</a>`).join('\n');
  return `</main>

<!-- フッターは全ページ共通。tools/build.js が作っている。手で直さないこと -->
<footer class="foot">
  <div class="wrap foot-in">
    <p class="foot-brand">みたもっちゃんねる<span class="en" lang="en">${T.brandSub}</span></p>
    <nav class="foot-nav" aria-label="${L.code === 'ja' ? 'フッター' : 'Footer'}">
${links}
    </nav>
    <!-- TODO: YouTube / Instagram のリンクをここに置く -->
    <p class="foot-note">© 2026 みたもっちゃんねる</p>
  </div>
</footer>

<script src="${L.asset}recipes.js"></script>
<script src="${L.asset}script.js"></script>
</body>
</html>
`;
}

const page = (lang: Lang, o: PageOpts, body: string): string => head(lang, o) + header(lang, o) + body + footer(lang);

/* ---------- レシピページ ---------- */
function ingredientsHtml(c: RecipeContent, lg: 'ja' | 'en'): string {
  let out = '';
  c.groups.forEach((g) => {
    if (g.name) {
      out += `\n              <h3 class="qty-sub">${esc(pick(g.name, lg) || g.name.ja)}</h3>\n\n`;
    }
    out += '              <dl>\n';
    g.items.forEach((it) => {
      /* 材料名は日英を常に併記する。英語ページでも日本語名を残すのは、
         海外の人が店頭でパッケージと照合するため。翻訳のためではない。 */
      const primary = lg === 'en' ? cap(it.en || it.ja) : it.ja;
      const gloss = lg === 'en' ? (it.en ? it.ja : null) : it.en;
      const glossLang = lg === 'en' ? 'ja' : 'en';
      const qty = lg === 'en' ? (it.qen || it.qja) : it.qja;

      out += `                <dt>${esc(primary)}`;
      if (gloss) { out += `<span class="en" lang="${glossLang}">${esc(gloss)}</span>`; }
      out += '</dt>\n';
      out += `                <dd>${qty ? esc(qty) : esc(pick(T.tbc, lg))}</dd>\n`;
    });
    out += '              </dl>\n';
    if (g.note) {
      out += `              <p class="qty-note">${esc(pick(g.note, lg) || g.note.ja)}</p>\n`;
    }
  });
  return out;
}

function stepsHtml(c: RecipeContent, lg: 'ja' | 'en'): string {
  if (!c.steps.length) {
    return `            <div class="prose draft">\n              <p>${esc(pick(T.stepsComing, lg))}</p>\n            </div>\n`;
  }
  let out = '            <ol class="steps">\n';
  c.steps.forEach((s, i) => {
    const uses = lg === 'en' ? (s.usesEn || s.usesJa) : s.usesJa;
    const attr = uses ? ` data-uses="${esc(uses)}"` : '';
    out += `              <li${attr}><span class="step-n">${i + 1}</span>\n`;
    out += `                <p>${esc(pick(s, lg) || s.ja)}</p>\n`;
    if (s.wait) {
      out += `                <p class="wait wait-${s.wait.long ? 'long' : 'short'}">${esc(pick(s.wait, lg))}</p>\n`;
    }
    out += '              </li>\n';
  });
  return out + '            </ol>\n';
}

function jsonLd(c: RecipeContent, r: RecipeMeta, lg: 'ja' | 'en'): string {
  if (!c.steps.length || !c.jsonld || !c.jsonld.cookTime) { return ''; }
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: r[lg].title,
    inLanguage: lg,
    description: r[lg].lead,
    author: { '@type': 'Organization', name: 'みたもっちゃんねる' },
    cookTime: c.jsonld.cookTime,
    recipeIngredient: ([] as string[]).concat.apply([] as string[], c.groups.map((g) => g.items.map((it) => {
      const n = lg === 'en' ? (it.en || it.ja) : it.ja;
      const q = lg === 'en' ? (it.qen || it.qja) : it.qja;
      return q ? `${n} ${q}` : n;
    }))),
    recipeInstructions: c.steps.map((s) => ({ '@type': 'HowToStep', text: pick(s, lg) || s.ja }))
  };
  /* 値の無い項目は、キーごと出さない。
     "totalTime": null のように書くと、schema.org の記述としては
     「所要時間が null である」という主張になってしまう。
     分からないことは黙っているのが正しい。 */
  if (c.jsonld.totalTime) { data.totalTime = c.jsonld.totalTime; }
  if (c.jsonld.yield) { data.recipeYield = c.jsonld.yield; }
  if (c.jsonld.category && lg === 'ja') { data.recipeCategory = c.jsonld.category; }
  if (c.jsonld.cuisine && lg === 'ja') { data.recipeCuisine = c.jsonld.cuisine; }
  return '<!-- Google のレシピ検索に出すための記述。手順と時間がそろっているレシピにだけ書く。\n' +
         '     TODO: 写真が入ったら "image" を絶対URLで足す -->\n' +
         '<script type="application/ld+json">\n' + JSON.stringify(data, null, 2) + '\n</script>\n';
}

function recipePage(lang: Lang, c: RecipeContent, r: RecipeMeta, hasAlt: boolean): string {
  const lg = lang.code;
  const title = r[lg].title;
  const count = c.groups.reduce((n, g) => n + g.items.length, 0);
  const peek = c.groups[0].items.slice(0, 3).map((it) => {
    const n = lg === 'en' ? (it.en || it.ja) : it.ja;
    const q = lg === 'en' ? (it.qen || it.qja) : it.qja;
    return `${n} ${q || ''}`.trim();
  }).join(' ／ ');

  const body = `
  <section class="recipes" id="recipes">
    <div class="wrap">
      <p class="sec-title">${esc(pick(T.recipesLabel, lg))}</p>

      <article id="${esc(c.slug)}">
        <h1 class="recipe-title">${esc(title)}${lg === 'ja' && r.en.title !== r.ja.title ? `<span class="en" lang="en">${esc(r.en.title)}</span>` : ''}</h1>

        <div class="recipe-intro">
${c.intro.map((p) => `          <p>${esc(pick(p, lg) || p.ja)}</p>`).join('\n')}
        </div>

        <dl class="recipe-meta">
          <div>
            <dt>${esc(pick(T.serves, lg))}</dt>
            <dd>${esc(pick(c.meta.servings, lg) || pick(T.tbc, lg))}</dd>
          </div>
          <div>
            <dt>${esc(pick(T.time, lg))}</dt>
            <dd>${esc(pick(c.meta.time, lg) || pick(T.tbc, lg))}</dd>
          </div>
        </dl>

        <!-- いいね数・コメント数・タグは recipes.js から入る -->
        <div class="figures" id="figures"></div>
        <p class="figures-note">${esc(pick(T.figuresNote, lg))}</p>

        <!-- Instagram の動画。permalink があるレシピにだけ入る -->
        <div id="video"></div>

        <!-- TODO: images/${esc(c.slug)}.jpg を置いたら完成写真を入れる。alt を必ず書くこと -->

        <div class="cook">

          <!-- バーが画面上端に貼り付いた瞬間を知るための目印 -->
          <div class="qty-sentinel" aria-hidden="true"></div>
          <div class="qty-bar" id="qty">
            <h2 class="qty-title">${esc(pick(T.ingredients, lg))}</h2>
            <button class="qty-toggle" type="button" aria-expanded="false" aria-controls="qty-body">
              <span>${lg === 'ja' ? `材料 ${count}品` : `${count} ingredients`}</span>
              <span class="qty-step" aria-hidden="true"></span>
              <span class="qty-peek">${esc(peek)} …</span>
            </button>

            <div class="qty-body" id="qty-body">
${ingredientsHtml(c, lg)}            </div>
          </div>

          <div>
${stepsHtml(c, lg)}${c.tips.length ? `
            <div class="tips">
              <h2 class="tips-h">${esc(pick(T.notes, lg))}</h2>
              <ul>
${c.tips.map((t) => `                <li>${esc(pick(t, lg) || t.ja)}</li>`).join('\n')}
              </ul>
            </div>
` : ''}          </div>

        </div>

        <div class="related-wrap" hidden>
          <h2>${esc(pick(T.similar, lg))}</h2>
          <ul class="cards" id="related"></ul>
        </div>
      </article>
    </div>
  </section>
`;

  return page(lang, {
    file: c.slug + '.html',
    title: lg === 'ja' ? `${title}｜みたもっちゃんねる` : `${title}｜Mitamo Kitchen`,
    desc: r[lg].lead || title,
    extraHead: jsonLd(c, r, lg),
    hasAlt
  }, body);
}

/* ---------- レシピのカード ----------
   一覧やガチャは画面側（script.js）で組み立てているが、
   献立ページは**組み立て時にHTMLへ書き出す**。
   検索エンジンに中身を読ませたいので、JavaScript 頼みにしない。 */
function recipeCardHtml(r: RecipeMeta & { likes: number | null }, lg: 'ja' | 'en', tagNames: Record<string, string>): string {
  const title = r[lg].title;
  const sub = lg === 'ja' && r.en.title !== r.ja.title
    ? `<span class="en" lang="en">${esc(r.en.title)}</span>` : '';
  const likes = r.likes == null ? '—' : String(r.likes);
  const tags = r.tags.map((t) => `<span>${esc(tagNames[t] ?? t)}</span>`).join('');
  const draft = r.ready ? '' :
    `<span class="card-draft">${lg === 'ja' ? '手順は準備中' : 'Steps coming'}</span>`;

  return `        <li class="card">
          <a href="${esc(r.slug)}.html">
            <figure class="card-shot"><span>${esc(r.image)}</span></figure>
            <h3 class="card-title">${esc(title)}${sub}</h3>
            <p class="card-lead">${esc(r[lg].lead)}</p>
            <div class="card-meta"><span>${lg === 'ja' ? 'いいね ' : 'Likes '}${likes}</span>${r.posted ? `<span>${esc(r.posted)}</span>` : ''}</div>
            <div class="card-tags">${tags}</div>${draft}
          </a>
        </li>`;
}

export { T, page, esc, pick, cap, LANGS, SITE_URL, recipePage, recipeCardHtml };

