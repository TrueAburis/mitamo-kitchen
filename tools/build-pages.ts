/* トップ・レシピ一覧・ガチャ・お仕事のご依頼の4ページと、
   レシピページを、日本語版と英語版で書き出す。

   本文はここに置いてある。HTMLに直接書かないのは、
   同じ内容から2言語ぶんを出すため。 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as B from './build.ts';
import { siteRecipes, writeRecipesJs } from './site-data.ts';

const ROOT = path.join(import.meta.dirname, '..');
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
function indexPage(lang: B.Lang): string {
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

/* ---------- 実行 ---------- */
async function run() {


  /* 人が書いた情報と取り込んだ数値を合流させ、recipes.js を書き出す */
  writeRecipesJs();
  const RECIPES = siteRecipes();

  const written = [];
  fs.mkdirSync(path.join(ROOT, 'en'), { recursive: true });

  for (const lang of LANGS) {
    const dir = lang.dir ? path.join(ROOT, lang.dir) : ROOT;

    const statics = [
      ['index.html', indexPage(lang)],
      ['recipes.html', recipesPage(lang)],
      ['gacha.html', gachaPage(lang)],
      ['work.html', workPage(lang)]
    ];
    statics.forEach(([file, html]) => {
      fs.writeFileSync(path.join(dir, file), html, 'utf8');
      written.push(path.join(lang.dir || '.', file));
    });

    for (const r of RECIPES) {
      const cPath = path.join(ROOT, 'content', r.slug + '.js');
      if (!fs.existsSync(cPath)) {
        console.log(`  ! content/${r.slug}.js が無いので飛ばしました`);
        continue;
      }
      /* 毎回読み直す。同じ実行の中で content を書き換えても反映されるように */
      const c = (await import(pathToFileURL(cPath).href + '?t=' + Date.now())).default;

      /* 英語の本文が無いレシピは、英語ページを作らない。
         中身が日本語のままのページを「英語です」と出すと評価を下げるため。 */
      const hasEn = !!(r.en && r.en.title && c.intro.length && c.intro[0].en);
      if (lang.code === 'en' && !hasEn) {
        console.log(`  - ${r.slug}: 英語の本文が無いので英語ページは作りません`);
        continue;
      }
      fs.writeFileSync(path.join(dir, r.slug + '.html'), B.recipePage(lang, c, r), 'utf8');
      written.push(path.join(lang.dir || '.', r.slug + '.html'));
    }
  }

  console.log(`\n${written.length} ページを書き出しました:`);
  written.forEach((w) => console.log('  ' + w.replace(/\\/g, '/')));
}

export { run };
if (import.meta.main) { run(); }
