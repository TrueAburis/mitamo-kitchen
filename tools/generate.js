/* キャプションから、レシピ本文のデータ（content/<slug>.js）を書き出す。

   実行： node tools/generate.js tools/fixtures/somen.txt <slug>

   ページのHTMLはここでは作らない。content/ に置いたデータを
   tools/build.js が読んで、日本語版と英語版の2枚に組み立てる。

   データとHTMLを分けているのは、同じ内容から2言語ぶんを出すため。
   HTMLを直接書くと、片方だけ直したときに必ずズレる。 */

const fs = require('fs');
const path = require('path');
const CaptionParser = require('./parse-caption.js');
const Dict = require('./ingredients-ja-en.js');
const TagRules = require('./tag-rules.js');

const ROOT = path.join(__dirname, '..');

function knownTags() {
  global.window = global.window || {};
  require(path.join(ROOT, 'recipes.js'));
  return Object.keys(global.window.TAGS);
}

const q = (v) => JSON.stringify(v);

/* 材料1件をデータにする。英語が無ければ辞書で補い、
   辞書にも無ければ null（訳さず日本語のまま出す） */
function item(ja, en) {
  return {
    ja: ja.name,
    en: en ? en.name : Dict.name(ja.name),
    qja: ja.qty,
    qen: en ? en.qty : Dict.qty(ja.qty)
  };
}

function buildContent(parsed, slug) {
  const groups = parsed.groupsJa.map((g, gi) => {
    const gEn = parsed.groupsEn[gi];
    return {
      name: g.name ? { ja: g.name, en: (gEn && gEn.name) || null } : null,
      items: g.items.map((it, i) => item(it, gEn && gEn.items[i])),
      note: g.notes.length ? { ja: g.notes[0], en: null } : null
    };
  });

  const intro = [];
  if (parsed.leadJa) { intro.push({ ja: parsed.leadJa, en: parsed.leadEn }); }

  const tips = parsed.notesJa.map((n, i) => ({ ja: n, en: parsed.notesEn[i] || null }));

  const steps = parsed.steps.map((s) => ({ ja: s, en: null, usesJa: null, usesEn: null }));

  const lines = [];
  lines.push('/* ' + parsed.titleJa + ' の本文。');
  lines.push('   tools/generate.js がキャプションから書き出したもの。');
  lines.push('   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。');
  lines.push('   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */');
  lines.push('');
  lines.push('module.exports = {');
  lines.push('  slug: ' + q(slug) + ',');
  lines.push('');
  lines.push('  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */');
  lines.push('  meta: {');
  lines.push('    servings: { ja: null, en: null },');
  lines.push('    time: { ja: null, en: null }');
  lines.push('  },');
  lines.push('');
  lines.push('  intro: [');
  intro.forEach((p) => lines.push('    { ja: ' + q(p.ja) + ', en: ' + q(p.en) + ' },'));
  lines.push('  ],');
  lines.push('');
  lines.push('  groups: [');
  groups.forEach((g) => {
    lines.push('    {');
    lines.push('      name: ' + (g.name ? '{ ja: ' + q(g.name.ja) + ', en: ' + q(g.name.en) + ' }' : 'null') + ',');
    lines.push('      items: [');
    g.items.forEach((it) => {
      lines.push('        { ja: ' + q(it.ja) + ', en: ' + q(it.en) +
                 ', qja: ' + q(it.qja) + ', qen: ' + q(it.qen) + ' },');
    });
    lines.push('      ]' + (g.note ? ',' : ''));
    if (g.note) {
      lines.push('      note: { ja: ' + q(g.note.ja) + ', en: ' + q(g.note.en) + ' }');
    }
    lines.push('    },');
  });
  lines.push('  ],');
  lines.push('');
  if (steps.length) {
    lines.push('  steps: [');
    steps.forEach((s) => lines.push('    { ja: ' + q(s.ja) + ', en: ' + q(s.en) +
                                    ', usesJa: null, usesEn: null },'));
    lines.push('  ],');
  } else {
    lines.push('  /* キャプションに手順が書かれていなかった。');
    lines.push('     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */');
    lines.push('  steps: [],');
  }
  lines.push('');
  lines.push('  tips: [');
  tips.forEach((t) => lines.push('    { ja: ' + q(t.ja) + ', en: ' + q(t.en) + ' },'));
  lines.push('  ],');
  lines.push('');
  lines.push('  /* 手順と時間がそろうまで、検索用の構造化データは出さない */');
  lines.push('  jsonld: ' + (steps.length ? '{ cookTime: null, totalTime: null, yield: null }' : 'null'));
  lines.push('};');
  return lines.join('\n') + '\n';
}

/* ---------- 実行 ---------- */
const file = process.argv[2];
if (!file) {
  console.log('使い方: node tools/generate.js <キャプションのファイル> [slug]');
  process.exit(1);
}

const parsed = CaptionParser.parse(fs.readFileSync(file, 'utf8'));

if (parsed.isPR) {
  console.log('この投稿は PR案件（#PR）です。自動投稿の対象外にしているため、中止しました。');
  console.log('載せると決めた場合だけ手で追加し、その際は PR である旨を明記すること。');
  process.exit(2);
}

if (!parsed.titleJa || !parsed.groupsJa.length) {
  console.log('タイトルか材料を読み取れませんでした。キャプションの形を確認してください。');
  parsed.warnings.forEach((w) => console.log('  ・' + w));
  process.exit(1);
}

const slug = process.argv[3] || path.basename(file, path.extname(file));
const tags = TagRules.decide(parsed, knownTags());

fs.mkdirSync(path.join(ROOT, 'content'), { recursive: true });
const out = path.join(ROOT, 'content', slug + '.js');
fs.writeFileSync(out, buildContent(parsed, slug), 'utf8');

const itemCount = parsed.groupsJa.reduce((n, g) => n + g.items.length, 0);
console.log(`\ncontent/${slug}.js を書き出しました`);
console.log(`  タイトル: ${parsed.titleJa}${parsed.titleEn ? ' / ' + parsed.titleEn : '（英語なし）'}`);
console.log(`  材料: ${itemCount}品 / 手順: ${parsed.steps.length}`);
console.log(`  タグ: ${tags.join(' / ') || '（付きませんでした）'}`);
parsed.warnings.forEach((w) => console.log('  ・' + w));

console.log('\nrecipes.js の配列の先頭に、これを足してください:\n');
console.log(`  {
    slug: ${q(slug)},
    ja: { title: ${q(parsed.titleJa)}, lead: ${q(parsed.leadJa || '')} },
    en: { title: ${q(parsed.titleEn || parsed.titleJa)}, lead: ${q(parsed.leadEn || '')} },
    tags: ${JSON.stringify(tags)},
    image: ${q('images/' + slug + '.jpg')},
    posted: ${q(new Date().toISOString().slice(0, 10))},
    instagram: null,
    likes: null, comments: null, views: null,
    ready: ${parsed.steps.length > 0}
  },`);
console.log('\nそのあと node tools/build.js でページを組み立てます。');
