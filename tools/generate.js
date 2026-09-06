/* キャプションからレシピページを組み立てる。

   実行： node tools/generate.js tools/fixtures/somen.txt somen
          （第2引数は slug。省略するとファイル名から作る）

   出力： <slug>.html と、recipes.js に貼る1件分のデータ

   ヘッダーとフッターは index.html から読み取って使う。
   テンプレートとして別に持つと、片方だけ直したときにズレるので、
   「実物が唯一の出どころ」にしておく。

   手順が取れないレシピは ready:false として、画面に「手順は準備中」と出す。
   それらしい手順をこちらで書き足すことは絶対にしない。 */

const fs = require('fs');
const path = require('path');
const CaptionParser = require('./parse-caption.js');
const Dict = require('./ingredients-ja-en.js');
const TagRules = require('./tag-rules.js');

const ROOT = path.join(__dirname, '..');

/* recipes.js から TAGS のキー一覧を読む（タグを勝手に増やさないため） */
function knownTags() {
  global.window = global.window || {};
  require(path.join(ROOT, 'recipes.js'));
  return Object.keys(global.window.TAGS);
}

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* index.html からヘッダーとフッターを切り出す */
function shell() {
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const head = src.slice(src.indexOf('<!-- ヘッダーは全ページ共通'), src.indexOf('</header>') + '</header>'.length);
  const foot = src.slice(src.indexOf('<!-- フッターは全ページ共通'), src.indexOf('</footer>') + '</footer>'.length);
  if (!head || !foot) { throw new Error('index.html からヘッダーとフッターを読み取れませんでした'); }
  return { head, foot };
}

/* 材料1件。名前は日英を常に併記する（店頭でパッケージと照合するため）。
   英語が無い回は辞書で補い、辞書にも無ければ日本語のまま残す。 */
function itemRow(ja, en) {
  const enName = en ? en.name : Dict.name(ja.name);
  const enQty = en ? en.qty : Dict.qty(ja.qty);

  let dt = `<dt>${esc(ja.name)}`;
  if (enName) { dt += `<span class="en" lang="en">${esc(enName)}</span>`; }
  dt += '</dt>';

  let dd;
  if (!ja.qty) {
    dd = '<dd><span class="t-ja">要確認</span><span class="t-en">TBC</span></dd>';
  } else if (enQty && enQty !== ja.qty) {
    dd = `<dd><span class="t-ja">${esc(ja.qty)}</span><span class="t-en">${esc(enQty)}</span></dd>`;
  } else {
    dd = `<dd>${esc(ja.qty)}</dd>`;
  }
  return `                ${dt}\n                ${dd}\n`;
}

function ingredientsHtml(groupsJa, groupsEn) {
  let out = '';
  groupsJa.forEach((g, gi) => {
    const gEn = groupsEn[gi];
    if (g.name) {
      const enName = gEn && gEn.name ? gEn.name : null;
      out += `\n              <h3 class="qty-sub"><span class="t-ja">${esc(g.name)}</span>` +
             `<span class="t-en">${esc(enName || g.name)}</span></h3>\n\n`;
    }
    out += '              <dl>\n';
    g.items.forEach((it, i) => { out += itemRow(it, gEn && gEn.items[i]); });
    out += '              </dl>\n';
    g.notes.forEach((n) => {
      out += `              <p class="qty-note">${esc(n)}</p>\n`;
    });
  });
  return out;
}

function tipsHtml(notesJa, notesEn) {
  if (!notesJa.length) { return ''; }
  let out = '\n            <div class="tips">\n' +
            '              <h2 class="tips-h"><span class="t-ja">コツ</span><span class="t-en">Notes</span></h2>\n' +
            '              <ul>\n';
  notesJa.forEach((n, i) => {
    const en = notesEn[i];
    out += `                <li><span class="t-ja">${esc(n)}</span>` +
           `<span class="t-en">${esc(en || n)}</span></li>\n`;
  });
  return out + '              </ul>\n            </div>\n';
}

function build(parsed, slug, tags) {
  const { head, foot } = shell();
  const titleJa = parsed.titleJa;
  const titleEn = parsed.titleEn;
  const itemCount = parsed.groupsJa.reduce((n, g) => n + g.items.length, 0);
  const peek = parsed.groupsJa[0].items.slice(0, 3)
    .map((i) => `${i.name} ${i.qty || ''}`.trim()).join(' ／ ');

  const noEnglish = !titleEn;

  return `<!DOCTYPE html>
<html lang="ja" data-lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titleJa)}｜みたもっちゃんねる</title>
<meta name="description" content="${esc(parsed.leadJa || titleJa)}">
<!-- TODO: ロゴが決まったら差し替える。いまは仮の椀のかたち -->
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23FCFBF8'/%3E%3Cpath d='M5 15h22a11 11 0 0 1-22 0z' fill='%231E2320'/%3E%3Crect x='3' y='26' width='26' height='2' fill='%231E2320'/%3E%3C/svg%3E">
<link rel="stylesheet" href="style.css">

<!-- SNSで共有されたときの表示。TODO: 独自ドメインが決まったら og:url を、
     写真が入ったら og:image を足す。どちらも絶対URLでないと効かない -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="みたもっちゃんねる">
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="${esc(titleJa)}｜みたもっちゃんねる">
<meta property="og:description" content="${esc(parsed.leadJa || titleJa)}">
<meta name="twitter:card" content="summary_large_image">

<!-- 手順がキャプションに無いため JSON-LD は書いていない。
     手順の無いレシピに構造化データを入れても検索結果には出ないうえ、
     それらしい手順で埋めるのは論外なので。手順が入った時点で足すこと。 -->

<script>
  /* 表示前に言語を決める。ちらつき防止のため head で実行する */
  (function () {
    var lang = null;
    try { lang = localStorage.getItem('mk-lang'); } catch (e) {}
    if (lang !== 'ja' && lang !== 'en') {
      lang = (navigator.language || 'ja').toLowerCase().indexOf('ja') === 0 ? 'ja' : 'en';
    }
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.lang = lang;
  })();
</script>
</head>
<body>

<a class="skip" href="#main"><span class="t-ja">本文へスキップ</span><span class="t-en">Skip to content</span></a>

${head}

<main id="main">

  <section class="recipes" id="recipes">
    <div class="wrap">
      <p class="sec-title"><span class="t-ja">レシピ</span><span class="t-en">Recipes</span></p>

      <article id="${esc(slug)}">
        <h1 class="recipe-title">${esc(titleJa)}${titleEn ? `<span class="en" lang="en">${esc(titleEn)}</span>` : ''}</h1>

        <div class="recipe-intro">
          <p>
            <span class="t-ja">${esc(parsed.leadJa || '')}</span>
            <span class="t-en">${esc(parsed.leadEn || parsed.leadJa || '')}</span>
          </p>
${noEnglish ? `        </div>

        <p class="figures-note">
          <span class="t-ja">この回は日本語のみです。材料名だけ英語を添えています。</span>
          <span class="t-en">This post is in Japanese only. Ingredient names carry an English gloss.</span>
        </p>
` : '        </div>\n'}
        <!-- TODO: 何人前と時間がキャプションに無かったため未確認。分かり次第ここを埋める -->
        <dl class="recipe-meta">
          <div>
            <dt><span class="t-ja">分量</span><span class="t-en">Serves</span></dt>
            <dd><span class="t-ja">要確認</span><span class="t-en">TBC</span></dd>
          </div>
          <div>
            <dt><span class="t-ja">時間</span><span class="t-en">Time</span></dt>
            <dd><span class="t-ja">要確認</span><span class="t-en">TBC</span></dd>
          </div>
        </dl>

        <!-- いいね数・コメント数・タグは recipes.js から入る -->
        <div class="figures" id="figures"></div>
        <p class="figures-note">
          <span class="t-ja">数値は Instagram の投稿から取り込んだものです。「—」はまだ取り込めていません。</span>
          <span class="t-en">Figures come from Instagram. A dash means it has not been fetched yet.</span>
        </p>

        <!-- Instagram の動画。permalink があるレシピにだけ入る -->
        <div id="video"></div>

        <!-- TODO: images/${esc(slug)}.jpg を置いたら完成写真を入れる。alt を必ず書くこと -->

        <div class="cook">

          <div class="qty-bar" id="qty">
            <h2 class="qty-title"><span class="t-ja">材料</span><span class="t-en">Ingredients</span></h2>
            <button class="qty-toggle" type="button" aria-expanded="false" aria-controls="qty-body">
              <span class="t-ja">材料 ${itemCount}品</span><span class="t-en">${itemCount} ingredients</span>
              <span class="qty-step" aria-hidden="true"></span>
              <span class="qty-peek"><span class="t-ja">${esc(peek)} …</span><span class="t-en">${esc(peek)} …</span></span>
            </button>

            <div class="qty-body" id="qty-body">
${ingredientsHtml(parsed.groupsJa, parsed.groupsEn)}            </div>
          </div>

          <div>
            <!-- TODO: 手順が未入手。キャプションに【作り方】が書かれていれば自動で入る。
                 分かり次第、ol.steps を作る。data-uses には
                 その手順の文章に実際に出てくる材料と分量だけを入れること。 -->
            <div class="prose draft">
              <p>
                <span class="t-ja">手順はまだ入っていません。材料とコツだけ先に載せています。</span>
                <span class="t-en">The steps are not written up yet. For now, only the ingredients and notes are here.</span>
              </p>
            </div>
${tipsHtml(parsed.notesJa, parsed.notesEn)}          </div>

        </div>

        <div class="related-wrap" hidden>
          <h2><span class="t-ja">似ているレシピ</span><span class="t-en">Similar recipes</span></h2>
          <ul class="cards" id="related"></ul>
        </div>
      </article>
    </div>
  </section>
</main>

${foot}

<script src="recipes.js"></script>
<script src="script.js"></script>
</body>
</html>
`;
}

/* ---------- 実行 ---------- */
const file = process.argv[2];
if (!file) {
  console.log('使い方: node tools/generate.js <キャプションのファイル> [slug]');
  process.exit(1);
}

const caption = fs.readFileSync(file, 'utf8');
const parsed = CaptionParser.parse(caption);

if (parsed.isPR) {
  console.log('この投稿は PR案件（#PR）です。自動投稿の対象外にしているため、生成を中止しました。');
  console.log('載せると決めた場合だけ、手で追加してください。その際は PR である旨を明記すること。');
  process.exit(2);
}

if (!parsed.titleJa || !parsed.groupsJa.length) {
  console.log('タイトルか材料を読み取れませんでした。キャプションの形を確認してください。');
  parsed.warnings.forEach((w) => console.log('  ・' + w));
  process.exit(1);
}

const slug = process.argv[3] || path.basename(file, path.extname(file));
const tags = TagRules.decide(parsed, knownTags());
const html = build(parsed, slug, tags);
const out = path.join(ROOT, slug + '.html');
fs.writeFileSync(out, html, 'utf8');

console.log(`\n${slug}.html を書き出しました（${html.split('\n').length} 行）`);
console.log(`  タイトル: ${parsed.titleJa}${parsed.titleEn ? ' / ' + parsed.titleEn : '（英語なし）'}`);
console.log(`  材料: ${parsed.groupsJa.reduce((n, g) => n + g.items.length, 0)}品`);
console.log(`  タグ: ${tags.join(' / ') || '（付きませんでした）'}`);
if (parsed.warnings.length) {
  console.log('  気をつけるところ:');
  parsed.warnings.forEach((w) => console.log('    ・' + w));
}

console.log('\nrecipes.js の配列の先頭に、これを足してください:\n');
console.log(`  {
    slug: ${JSON.stringify(slug)},
    ja: { title: ${JSON.stringify(parsed.titleJa)}, lead: ${JSON.stringify(parsed.leadJa || '')} },
    en: { title: ${JSON.stringify(parsed.titleEn || parsed.titleJa)}, lead: ${JSON.stringify(parsed.leadEn || parsed.leadJa || '')} },
    tags: ${JSON.stringify(tags)},
    image: ${JSON.stringify('images/' + slug + '.jpg')},
    posted: ${JSON.stringify(new Date().toISOString().slice(0, 10))},
    instagram: null,
    likes: null,
    comments: null,
    views: null,
    ready: ${parsed.steps.length > 0}
  },`);
