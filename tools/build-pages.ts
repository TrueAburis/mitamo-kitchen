/* トップ・レシピ一覧・ガチャ・お仕事のご依頼の4ページと、
   レシピページを、日本語版と英語版で書き出す。

   本文はここに置いてある。HTMLに直接書かないのは、
   同じ内容から2言語ぶんを出すため。 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as B from './build.ts';
import { siteRecipes, writeRecipesJs, byNewest, TAGS, type SiteRecipe } from './site-data.ts';
import { COLLECTIONS, type Collection } from '../data/collections.ts';
import { ASSETS, CONTENT, DIST, DIST_EN, COPY_TO_DIST, COPY_DIRS } from './paths.ts';
const { esc, pick, page, LANGS } = B;

/* ---------- 本文 ---------- */
const C = {
  tagline: {
    ja: '出汁からはじめる、<br>家庭の和食。',
    en: 'Japanese home cooking,<br>starting with dashi.'
  },
  photoMissing: { ja: '写真がまだありません', en: 'No photo yet' },
  workCta: { ja: 'お仕事のご依頼はこちら', en: 'Work with us' },

  popularLabel: { ja: '人気のレシピ', en: 'Popular' },
  popularTitle: { ja: 'よく見られているもの', en: 'Most viewed' },
  popularNote: {
    ja: 'いいね数は Instagram の投稿から取り込んだ数値です。「—」はまだ取り込めていないものです。',
    en: 'Like counts come from Instagram. A dash means the number has not been fetched yet.'
  },
  seeAll: { ja: 'レシピをすべて見る', en: 'See all recipes' },

  latestLabel: { ja: 'レシピ', en: 'Recipes' },

  profileLabel: { ja: 'みたもっちゃんねるとは', en: 'Profile' },
  profileBody: [
    {
      ja: '出汁を引くところから始める、家庭向けの和食を紹介しています。特別な道具や、手に入りにくい材料は使いません。動画で流れを見て、このページで分量を確かめながら作ってもらう、という使い方を想定しています。',
      en: 'We cook everyday Japanese food, starting from the dashi. No special equipment, no hard-to-find ingredients. Watch the video for the rhythm of it, then use this page to check the measurements while you cook.'
    },
    {
      ja: 'レシピはすべて日本語と英語で用意しています。海外の方が店頭で材料を探せるように、材料名は英語のページでも日本語を併記しています。',
      en: 'Every recipe is written in both Japanese and English. Ingredient names keep their Japanese alongside the English, so you can match them against what is on the shelf.'
    }
  ],
  facts: [
    { label: { ja: 'はじめた年', en: 'Started' } },
    { label: { ja: '更新', en: 'Updates' } },
    { label: { ja: '拠点', en: 'Based in' } }
  ],

  recipesIntro: {
    ja: '上の検索欄に材料や料理名を入れると絞り込めます。',
    en: 'Use the search box above to filter by ingredient or dish name.'
  },
  browseByTag: { ja: 'タグから探す', en: 'Browse by tag' },
  sortLabel: { ja: '並び順', en: 'Sort' },
  emptyResult: {
    ja: '条件に合うレシピがありませんでした。検索の言葉を短くするか、タグを外してみてください。',
    en: 'No recipes matched. Try a shorter search term, or clear the tag.'
  },

  gachaTitle: { ja: 'レシピガチャ', en: 'Recipe gacha' },
  gachaIntro: {
    ja: '今日なにを作るか決まらないときに引いてください。同じ料理は重ならないので、まとめて引けばそのまま献立になります。',
    en: 'For when you cannot decide what to cook. No duplicates, so a multi-draw doubles as a menu for the week.'
  },
  narrow: { ja: '絞り込む', en: 'Narrow it down' },
  draws: { ja: '引く数', en: 'Draws' },
  draw: { ja: '引く', en: 'Draw' },

  latestLabel2: { ja: '最新のレシピ', en: 'Latest recipe' },
  serves: { ja: '分量', en: 'Serves' },
  time: { ja: '時間', en: 'Time' },
  tbc: { ja: '要確認', en: 'TBC' },
  seeHow: { ja: '作り方を見る', en: 'See how it is made' },

  collectionsTitle: { ja: '献立', en: 'Menus' },
  collectionsIntro: {
    ja: 'レシピを組み合わせて、その日の食卓がそのまま決まるようにしたものです。',
    en: 'Recipes combined so that one page settles a whole meal.'
  },
  backToCollections: { ja: '献立の一覧へ', en: 'All menus' },
  inThisMenu: { ja: 'この献立のレシピ', en: 'Recipes in this menu' },

  workLabel: { ja: 'お仕事のご依頼', en: 'Work with us' },
  workTitle: { ja: 'ご相談はこちらから', en: 'Get in touch' },
  workBody: {
    ja: 'レシピの制作、料理写真・動画の撮影、メニューの監修などのご相談を受け付けています。ご予算や納期が決まっていない段階でも構いません。下のフォームからお送りください。',
    en: 'We take on recipe development, food photography and video, and menu supervision. It is fine if the budget and schedule are not settled yet. Please use the form below.'
  },
  formAlt: {
    ja: 'うまく表示されないときは <a href="{URL}" target="_blank" rel="noopener">フォームを別のタブで開く</a> こともできます。',
    en: 'If the form does not load, you can <a href="{URL}" target="_blank" rel="noopener">open it in a new tab</a>.'
  }
};

const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLScvpAUYr7rHcj1Zd4HJIZuWQ4K5wM25EXhhAolZa-DhHL3HpA/viewform';

const SNS = [
  { name: 'Instagram', url: 'https://www.instagram.com/mitamo.kitchen/',
    svg: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none"/>' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@mitamokitchen',
    svg: '<path d="M14.6 3v10.7a3.7 3.7 0 1 1-3.2-3.66"/><path d="M14.6 3.1c.35 2.2 1.95 3.8 4.15 4.15"/>' },
  { name: 'YouTube', url: 'https://www.youtube.com/channel/UCY5Py2DIsgdurOYtN0ayV3A',
    svg: '<rect x="2" y="5" width="20" height="14" rx="4.2"/><path d="M10.2 9.1l5 2.9-5 2.9z" fill="currentColor" stroke="none"/>' }
];

/* ---------- 各ページ ---------- */
/* トップに置く「最新のレシピ」の分量表。
   このサイトの主張（分量が画面から消えない）を、1画面目で見せるための一枚。
   **トップに載せるのは主な材料だけ。** レシピページと丸ごと同じ内容にすると、
   2回とも読み流されるので、続きはレシピページにある状態を保つ。 */
function latestDishHtml(lg: 'ja' | 'en', r: SiteRecipe, c: B.RecipeContent): string {
  const first = c.groups[0];
  if (!first) { return ''; }

  const rows = first.items.map((it) => {
    const primary = lg === 'en' ? B.cap(it.en || it.ja) : it.ja;
    const gloss = lg === 'en' ? (it.en ? it.ja : null) : it.en;
    const glossLang = lg === 'en' ? 'ja' : 'en';
    const qty = lg === 'en' ? (it.qen || it.qja) : it.qja;
    return `          <dt>${esc(primary)}${gloss ? `<span class="en" lang="${glossLang}">${esc(gloss)}</span>` : ''}</dt>
          <dd>${qty ? esc(qty) : esc(pick(C.tbc, lg))}</dd>`;
  }).join('\n');

  const serves = pick(c.meta.servings, lg) || pick(C.tbc, lg);
  const time = pick(c.meta.time, lg) || pick(C.tbc, lg);

  return `
  <section class="plain" id="latest">
    <div class="wrap">
      <div class="dish dish-solo">
        <div class="dish-head">
          <h2>${esc(pick(C.latestLabel2, lg))}</h2>
          <p class="dish-name">${esc(r[lg].title)}${lg === 'ja' ? `<span class="en" lang="en">${esc(r.en.title)}</span>` : ''}</p>
        </div>

        <figure class="shot">
          <!-- TODO: ${esc(r.image)} を置いたら <img> に差し替える。alt を必ず書くこと -->
          ${esc(pick(C.photoMissing, lg))}<br>${esc(r.image)}
        </figure>

        <dl class="dish-meta">
          <dt>${esc(pick(C.serves, lg))}</dt><dd>${esc(serves)}</dd>
          <dt>${esc(pick(C.time, lg))}</dt><dd>${esc(time)}</dd>
        </dl>

        <dl class="qty-list">
${rows}
        </dl>

        <a class="dish-more" href="${esc(r.slug)}.html">${esc(pick(C.seeHow, lg))}</a>
      </div>
    </div>
  </section>
`;
}

function indexPage(lang: B.Lang, latest?: { r: SiteRecipe; c: B.RecipeContent }): string {
  const lg = lang.code;
  const sns = SNS.map((s) => `        <a class="sns-btn" href="${s.url}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${s.svg}</svg>
          <span>${s.name}</span>
        </a>`).join('\n');

  const facts = C.facts.map((f) =>
    `        <li><b>${esc(pick(f.label, lg))}</b><span>TODO</span></li>`).join('\n');

  const body = `
  <section class="hub" id="top">
    <div class="wrap">
      <h1 class="hub-name">${pick(C.tagline, lg)}</h1>

      <figure class="shot hub-shot">
        <!-- TODO: 本人の写真か動画のサムネイルを images/ に置いたら <img> に差し替える。alt を必ず書くこと -->
        ${esc(pick(C.photoMissing, lg))}<br>images/profile.jpg
      </figure>

      <nav class="sns" aria-label="SNS">
${sns}
      </nav>

      <p class="hub-acts">
        <a class="btn" href="work.html">${esc(pick(C.workCta, lg))}</a>
      </p>
    </div>
  </section>

${latest ? latestDishHtml(lg, latest.r, latest.c) : ''}
  <section class="plain" id="popular-section">
    <div class="wrap">
      <p class="sec-title">${esc(pick(C.popularLabel, lg))}</p>
      <h2 class="sec-h2">${esc(pick(C.popularTitle, lg))}</h2>

      <!-- カードは recipes.js のデータから作る。いいねが多い順の上位3件 -->
      <ul class="cards" id="popular"></ul>

      <p class="figures-note">${esc(pick(C.popularNote, lg))}</p>

      <p class="form-alt" style="margin-top:16px">
        <a href="recipes.html?sort=popular">${esc(pick(C.seeAll, lg))}</a>
      </p>
    </div>
  </section>

  <section class="plain" id="profile">
    <div class="wrap">
      <h2 class="sec-h2">${esc(pick(C.profileLabel, lg))}</h2>

      <!-- ▼▼▼ ここから仮の文章。本番の文章に差し替えたら class="draft" を外す ▼▼▼ -->
      <div class="prose draft">
${C.profileBody.map((p) => `        <p>${esc(pick(p, lg))}</p>`).join('\n')}
      </div>

      <ul class="facts">
${facts}
      </ul>
      <!-- TODO: 上の3項目に実際の値を入れる -->
      <!-- ▲▲▲ ここまで仮の文章 ▲▲▲ -->
    </div>
  </section>
`;

  return page(lang, {
    file: 'index.html',
    title: lg === 'ja'
      ? 'みたもっちゃんねる｜出汁からはじめる和食レシピ'
      : 'Mitamo Kitchen｜Japanese home cooking from dashi',
    desc: lg === 'ja'
      ? '出汁からはじめる和食のレシピを、日本語と英語で。分量を画面に残したまま、作りながら読めるレシピサイトです。'
      : 'Japanese home cooking that starts with dashi. The measurements stay on screen while you cook.'
  }, body);
}

function recipesPage(lang: B.Lang): string {
  const lg = lang.code;
  const body = `
  <section class="plain" id="recipes">
    <div class="wrap">
      <h1 class="sec-h2">${esc(pick(C.latestLabel, lg))}</h1>

      <p class="prose" style="margin-top:10px">${esc(pick(C.recipesIntro, lg))}</p>

      <h2 class="sec-title" id="tags" style="margin-top:24px">${esc(pick(C.browseByTag, lg))}</h2>
      <!-- タグのボタンは recipes.js の TAGS から作る -->
      <div class="filters" id="chips"></div>

      <div class="sort">
        <span>${esc(pick(C.sortLabel, lg))}</span>
        <button class="chip" type="button" data-sort="new" aria-pressed="true"></button>
        <button class="chip" type="button" data-sort="popular" aria-pressed="false"></button>
      </div>

      <p class="result-count" id="count" aria-live="polite"></p>

      <ul class="cards" id="cards"></ul>

      <p class="empty" id="empty" hidden>${esc(pick(C.emptyResult, lg))}</p>
    </div>
  </section>
`;
  return page(lang, {
    file: 'recipes.html',
    title: lg === 'ja' ? 'レシピ一覧｜みたもっちゃんねる' : 'Recipes｜Mitamo Kitchen',
    desc: lg === 'ja'
      ? 'みたもっちゃんねるのレシピ一覧。分量を画面に残したまま作れる、日本語と英語のレシピです。'
      : 'All recipes from Mitamo Kitchen. The measurements stay on screen while you cook.'
  }, body);
}

function gachaPage(lang: B.Lang): string {
  const lg = lang.code;
  const body = `
  <section class="plain" id="gacha">
    <div class="wrap">
      <h1 class="sec-h2">${esc(pick(C.gachaTitle, lg))}</h1>

      <div class="prose" style="margin-top:12px">
        <p>${esc(pick(C.gachaIntro, lg))}</p>
      </div>

      <h2 class="sec-title" style="margin-top:22px">${esc(pick(C.narrow, lg))}</h2>
      <!-- タグのボタンは recipes.js の TAGS から作る -->
      <div class="filters" id="chips"></div>

      <div class="sort" style="margin-top:18px">
        <span>${esc(pick(C.draws, lg))}</span>
        <button class="chip" type="button" data-pull="1">1</button>
        <button class="chip" type="button" data-pull="3">3</button>
        <button class="chip" type="button" data-pull="5">5</button>
        <button class="chip" type="button" data-pull="10">10</button>
      </div>

      <p class="acts" style="margin-top:18px">
        <button class="btn" type="button" id="draw">${esc(pick(C.draw, lg))}</button>
      </p>

      <p class="result-count" id="gacha-note" aria-live="polite"></p>

      <ul class="cards" id="gacha-cards"></ul>
    </div>
  </section>
`;
  return page(lang, {
    file: 'gacha.html',
    title: lg === 'ja' ? 'レシピガチャ｜みたもっちゃんねる' : 'Recipe gacha｜Mitamo Kitchen',
    desc: lg === 'ja'
      ? '今日なにを作るか決まらないときに。レシピをランダムに引いて、献立を決めるページです。'
      : 'For when you cannot decide what to cook. Draw recipes at random and build a menu.'
  }, body);
}

function workPage(lang: B.Lang): string {
  const lg = lang.code;
  const body = `
  <section class="plain" id="work">
    <div class="wrap">
      <p class="sec-title">${esc(pick(C.workLabel, lg))}</p>
      <h1 class="sec-h2">${esc(pick(C.workTitle, lg))}</h1>

      <!-- ▼▼▼ ここから仮の文章 ▼▼▼ -->
      <div class="prose draft">
        <p>${esc(pick(C.workBody, lg))}</p>
      </div>
      <!-- ▲▲▲ ここまで仮の文章 ▲▲▲ -->

      <!-- このサイトで唯一の外部読み込み（動画を除く）。フォームの差し替えはこの src を変える -->
      <iframe
        class="form-embed"
        src="${FORM}?embedded=true"
        title="${lg === 'ja' ? 'お仕事のご依頼フォーム' : 'Enquiry form'}"
        loading="lazy">${lg === 'ja' ? '読み込んでいます…' : 'Loading…'}</iframe>

      <p class="form-alt">${pick(C.formAlt, lg).replace('{URL}', FORM)}</p>

      <!-- TODO: 公開用の連絡先メールアドレスが決まったら、雛形を有効にして載せる。
           いまは公開リポジトリに個人アドレスを置かないために外してある。
           問い合わせ導線は上の Google フォームがあるので、無くても成立している。

      <p class="contact">
        <a href="mailto:ここにアドレス">ここにアドレス</a>
      </p>
      -->
    </div>
  </section>
`;
  return page(lang, {
    file: 'work.html',
    title: lg === 'ja' ? 'お仕事のご依頼｜みたもっちゃんねる' : 'Work with us｜Mitamo Kitchen',
    desc: lg === 'ja'
      ? 'レシピ制作、料理写真・動画の撮影、メニュー監修などのご相談を受け付けています。'
      : 'Recipe development, food photography and video, and menu supervision.'
  }, body);
}


/* ---------- 献立 ---------- */
function collectionsPage(lang: B.Lang, cols: Collection[]): string {
  const lg = lang.code;
  const rows = cols.map((c) => `        <li>
          <a href="collection-${esc(c.slug)}.html">${esc(c[lg].title)}<span class="en" lang="${lg === 'ja' ? 'en' : 'ja'}">${esc(lg === 'ja' ? c.en.title : c.ja.title)}</span></a>
          <p>${esc(c[lg].lead)}</p>
        </li>`).join('\n');

  const body = `
  <section class="plain" id="collections">
    <div class="wrap">
      <h1 class="sec-h2">${esc(pick(C.collectionsTitle, lg))}</h1>
      <p class="prose" style="margin-top:10px">${esc(pick(C.collectionsIntro, lg))}</p>

      <ul class="menu-list">
${rows}
      </ul>
    </div>
  </section>
`;
  return page(lang, {
    file: 'collections.html',
    title: lg === 'ja' ? '献立｜みたもっちゃんねる' : 'Menus｜Mitamo Kitchen',
    desc: lg === 'ja'
      ? 'その日の食卓がそのまま決まる、レシピの組み合わせです。'
      : 'Recipe combinations that settle a whole meal at once.'
  }, body);
}

function collectionPage(lang: B.Lang, col: Collection, recipes: SiteRecipe[], tagNames: Record<string, string>): string {
  const lg = lang.code;
  const cards = recipes.map((r) => B.recipeCardHtml(r, lg, tagNames)).join('\n');

  const body = `
  <section class="plain" id="collection">
    <div class="wrap">
      <p class="sec-title">${esc(pick(C.collectionsTitle, lg))}</p>
      <h1 class="sec-h2">${esc(col[lg].title)}</h1>

      <div class="prose${col.draft ? ' draft' : ''}" style="margin-top:14px">
        <p>${esc(col[lg].lead)}</p>
      </div>

      <h2 class="sec-title" style="margin-top:26px">${esc(pick(C.inThisMenu, lg))}</h2>
      <p class="result-count"><b>${recipes.length}</b>${lg === 'ja' ? ' 品' : (recipes.length === 1 ? ' recipe' : ' recipes')}</p>

      <ul class="cards">
${cards}
      </ul>

      <p class="form-alt" style="margin-top:22px">
        <a href="collections.html">${esc(pick(C.backToCollections, lg))}</a>
      </p>
    </div>
  </section>
`;
  return page(lang, {
    file: `collection-${col.slug}.html`,
    title: `${col[lg].title}｜${lg === 'ja' ? 'みたもっちゃんねる' : 'Mitamo Kitchen'}`,
    desc: col[lg].lead
  }, body);
}

/* assets/ の中身を dist/ に写す。
   CSS も JS も写真も、組み立てで作り変えるものではないので、
   ここでは中身に触れずに置き場所だけ移す。 */
function copyAssets(): void {
  COPY_TO_DIST.forEach((name) => {
    const from = path.join(ASSETS, name);
    if (fs.existsSync(from)) { fs.copyFileSync(from, path.join(DIST, name)); }
  });
  COPY_DIRS.forEach((name) => {
    const from = path.join(ASSETS, name);
    fs.mkdirSync(path.join(DIST, name), { recursive: true });
    if (fs.existsSync(from)) { fs.cpSync(from, path.join(DIST, name), { recursive: true }); }
  });
}

/* ---------- 実行 ---------- */
async function run() {


  /* dist/ は毎回まっさらから作り直す。
     消したページや名前を変えたページが古いまま残るのを防ぐ。
     ここに手で置いたものは消えるので、置かないこと。 */
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST_EN, { recursive: true });

  /* そのまま配るものを写す。加工しないので、assets/ を直接編集してよい */
  copyAssets();

  const RECIPES = siteRecipes();

  /* 先にレシピ本文を全部読んで、どの回に英語ページを作れるかを決めておく。

     組み立ての途中で判断すると、日本語ページを書き出すときに
     「この回の英語版があるかどうか」がまだ分からない。
     分からないまま hreflang と言語切替を出していたので、
     英語の無い回が来たら 404 を指すようになっていた。 */
  const contents = new Map<string, B.RecipeContent>();
  const withEn = new Set<string>();
  for (const r of RECIPES) {
    const p = path.join(CONTENT, r.slug + '.js');
    if (!fs.existsSync(p)) {
      console.log(`  ! content/${r.slug}.js が無いので飛ばしました`);
      continue;
    }
    /* 毎回読み直す。同じ実行の中で content を書き換えても反映されるように */
    const c: B.RecipeContent = (await import(pathToFileURL(p).href + '?t=' + Date.now())).default;
    contents.set(r.slug, c);
    if (r.en && r.en.title && c.intro.length && c.intro[0].en) { withEn.add(r.slug); }
  }

  /* 人が書いた情報と取り込んだ数値を合流させ、dist/recipes.js を書き出す。
     英語ページの有無も渡す。画面側は、英語のときに無い回を一覧から外す */
  writeRecipesJs(withEn);

  const written = [];

  /* トップに出す「最新のレシピ」。投稿日がいちばん新しいもの。
     投稿日が分からない回は候補にならない（byNewest が後ろに回す） */
  const newest = RECIPES.slice().sort(byNewest)[0];
  const newestContent = newest && contents.get(newest.slug);
  const latest = newest && newestContent ? { r: newest, c: newestContent } : undefined;

  for (const lang of LANGS) {
    const dir = lang.dir ? path.join(DIST, lang.dir) : DIST;

    const statics = [
      ['index.html', indexPage(lang, latest)],
      ['recipes.html', recipesPage(lang)],
      ['gacha.html', gachaPage(lang)],
      ['work.html', workPage(lang)],
      ['collections.html', collectionsPage(lang, COLLECTIONS)]
    ];
    statics.forEach(([file, html]) => {
      fs.writeFileSync(path.join(dir, file), html, 'utf8');
      written.push(path.join(lang.dir || '.', file));
    });


    /* 献立ページ。中身のカードは組み立て時にHTMLへ書き出す（検索エンジンに読ませるため） */
    for (const col of COLLECTIONS) {
      const picked = col.recipes.map((slug) => {
        const found = RECIPES.find((r) => r.slug === slug);
        if (!found) {
          throw new Error(`data/collections.ts の「${col.slug}」に、存在しないレシピ「${slug}」が入っています`);
        }
        return found;
      /* 英語ページを作っていない回は、英語の献立ページから外す。
         カードを出すと、開いたときに 404 になる。 */
      }).filter((r) => lang.code === 'ja' || withEn.has(r.slug));
      const tagNames: Record<string, string> = {};
      Object.keys(TAGS).forEach((k) => { tagNames[k] = TAGS[k]![lang.code]; });

      fs.writeFileSync(
        path.join(dir, `collection-${col.slug}.html`),
        collectionPage(lang, col, picked, tagNames), 'utf8'
      );
      written.push(path.join(lang.dir || '.', `collection-${col.slug}.html`));
    }

    for (const r of RECIPES) {
      const c = contents.get(r.slug);
      if (!c) { continue; }

      /* 英語の本文が無いレシピは、英語ページを作らない。
         中身が日本語のままのページを「英語です」と出すと評価を下げるため。 */
      const hasEn = withEn.has(r.slug);
      if (lang.code === 'en' && !hasEn) {
        console.log(`  - ${r.slug}: 英語の本文が無いので英語ページは作りません`);
        continue;
      }
      fs.writeFileSync(path.join(dir, r.slug + '.html'), B.recipePage(lang, c, r, hasEn), 'utf8');
      written.push(path.join(lang.dir || '.', r.slug + '.html'));
    }
  }

  console.log(`\n${written.length} ページを書き出しました:`);
  written.forEach((w) => console.log('  ' + w.replace(/\\/g, '/')));
}

export { run };
if (import.meta.main) { run(); }
