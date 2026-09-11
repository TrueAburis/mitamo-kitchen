/* キャプションから、レシピ本文のデータ（content/<slug>.js）を書き出す。


   実行： node tools/generate.ts data/captions/somen.txt <slug>

   ページのHTMLはここでは作らない。content/ に置いたデータを
   tools/build.js が読んで、日本語版と英語版の2枚に組み立てる。

   データとHTMLを分けているのは、同じ内容から2言語ぶんを出すため。
   HTMLを直接書くと、片方だけ直したときに必ずズレる。 */

import fs from 'node:fs';
import path from 'node:path';
import * as CaptionParser from './parse-caption.ts';
import * as Dict from './ingredients-ja-en.ts';
import * as TagRules from './tag-rules.ts';
import * as Phrasebook from './phrasebook-apply.ts';
import type { Parsed, Ingredient, Group } from './parse-caption.ts';
import { TAGS } from '../data/recipes.ts';

import { CONTENT } from './paths.ts';


function knownTags(): string[] {
  return Object.keys(TAGS);
}

const q = (v: unknown) => JSON.stringify(v);

/* 材料1件をデータにする。

   名前の英語は**辞書を先に引く**。キャプションの英語は回ごとに揺れる
   （昆布が kombu seaweed / Kombu (kelp) / Kelp と3通りあった）ので、
   全レシピで同じ言葉にするには辞書側を正にするしかない。
   辞書に無いときだけキャプションの英語を使い、
   それも使わないと決めた言い回し（対訳表の avoid）を含むなら捨てて null にする。
   null は「訳を当てず日本語のまま出す」の意味。間違った英語より日本語のほうが調べられる。 */
function item(ja: Ingredient, en: Ingredient | undefined, warn: (s: string) => void) {
  const fromDict = Dict.name(ja.name);
  let name: string | null = fromDict;
  if (!name && en) {
    const hits = Phrasebook.avoidHits(en.name);
    if (hits.length) {
      warn('材料「' + ja.name + '」の英語 "' + en.name + '" に ' +
           hits.map((h) => '"' + h.avoid + '"').join('・') + ' が入っていたので外した');
    } else {
      /* 「2 tbsp of red vinegar」から分量を切ると「of red vinegar」が残る。
         材料名として並べたときに前置詞から始まるので落とす。 */
      name = en.name.replace(/^(?:of|de)\s+/i, '');
    }
  }
  return {
    ja: ja.name,
    en: name,
    qja: ja.qty,
    /* 分量は辞書の単位換算を正にする。大さじ・合などは機械的に決まる */
    qen: Dict.qty(ja.qty) || (en ? en.qty : null)
  };
}

function buildContent(parsed: Parsed, slug: string, warn: (s: string) => void): string {
  const ov = Phrasebook.overrides(slug);
  const en = (ja: string | null, posted: string | null) => Phrasebook.sentence(ov, ja, posted);

  const groups = parsed.groupsJa.map((g, gi) => {
    const gEn: Group | undefined = parsed.groupsEn[gi];
    /* 日英で品数が違うグループは、英語を順番で当てると1つずつずれる。
       ずれた英語を出すくらいなら辞書だけで組む。 */
    const aligned = gEn && gEn.items.length === g.items.length ? gEn : undefined;
    if (gEn && !aligned) {
      warn('材料の品数が日英で違うので、英語を順番で当てるのをやめた（日 ' +
           g.items.length + ' / 英 ' + gEn.items.length + '）');
    }
    return {
      name: g.name ? { ja: g.name, en: en(g.name, (gEn && gEn.name) || null) } : null,
      items: g.items.map((it, i) => item(it, aligned && aligned.items[i], warn)),
      note: g.notes.length ? { ja: g.notes[0], en: en(g.notes[0], null) } : null
    };
  });

  const intro = [];
  if (parsed.leadJa) { intro.push({ ja: parsed.leadJa, en: en(parsed.leadJa, parsed.leadEn) }); }

  const tips = parsed.notesJa.map((n, i) => ({ ja: n, en: en(n, parsed.notesEn[i] || null) }));

  /* 手順。英語は [Steps] があれば入る。
     日英で数が違うときは順番で対応づけられないので、英語は付けない
     （1つずれた英語を出すより、無いほうがまし）。
     usesJa / usesEn（その手順で使う分量）はキャプションから決めようがないので、
     ここでは空にしておく。人が書く。 */
  const pairEn = parsed.stepsEn.length === parsed.steps.length;
  const steps = parsed.steps.map((s, i) => ({
    ja: s,
    en: pairEn ? parsed.stepsEn[i]! : null,
    usesJa: null, usesEn: null
  }));

  const lines = [];
  lines.push('/* ' + parsed.titleJa + ' の本文。');
  lines.push('   tools/generate.js がキャプションから書き出したもの。');
  lines.push('   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。');
  lines.push('   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */');
  lines.push('');
  lines.push('export default {');
  lines.push('  slug: ' + q(slug) + ',');
  lines.push('');
  if (parsed.servingsJa) {
    lines.push('  /* TODO: 時間がキャプションに無かった。分かり次第埋める */');
  } else {
    lines.push('  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */');
  }
  lines.push('  meta: {');
  lines.push('    servings: { ja: ' + q(parsed.servingsJa) + ', en: ' + q(parsed.servingsEn) + ' },');
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

const extra: string[] = [];
const warn = (s: string) => { if (!extra.includes(s)) { extra.push(s); } };

if (!Phrasebook.known(slug)) {
  warn('対訳表（data/phrasebook.ts）にこの回がない。英文はキャプションのまま出る');
}

fs.mkdirSync(CONTENT, { recursive: true });
const out = path.join(CONTENT, slug + '.js');
fs.writeFileSync(out, buildContent(parsed, slug, warn), 'utf8');

/* 一覧に出すタイトルとリード文も、対訳表を通す */
const ov = Phrasebook.overrides(slug);
const titleEn = Phrasebook.sentence(ov, parsed.titleJa, parsed.titleEn) || parsed.titleJa;
const leadEn = Phrasebook.sentence(ov, parsed.leadJa, parsed.leadEn) || '';

/* 対訳表に書いてあるのに一度も当たらなかった行。
   日本語が1字でも違うと当たらず、そのぶん投稿のままの英語が出る。
   黙って通すと直したつもりのものが直っていないので、必ず知らせる。 */
Phrasebook.unused(slug).forEach((k) => {
  warn('対訳表の「' + k + '」がキャプションのどの行にも当たらなかった。日本語を見比べること');
});

const itemCount = parsed.groupsJa.reduce((n, g) => n + g.items.length, 0);
console.log(`\ncontent/${slug}.js を書き出しました`);
console.log(`  タイトル: ${parsed.titleJa}${titleEn && titleEn !== parsed.titleJa ? " / " + titleEn : "（英語なし）"}`);
console.log(`  材料: ${itemCount}品 / 手順: ${parsed.steps.length}`);
console.log(`  タグ: ${tags.join(' / ') || '（付きませんでした）'}`);
parsed.warnings.concat(extra).forEach((w) => console.log('  ・' + w));

console.log('\ndata/recipes.ts の配列に、これを足してください:\n');
console.log(`  {
    slug: ${q(slug)},
    ja: { title: ${q(parsed.titleJa)}, lead: ${q(parsed.leadJa || '')} },
    en: { title: ${q(titleEn)}, lead: ${q(leadEn)} },
    tags: ${JSON.stringify(tags)},
    image: ${q('images/' + slug + '.jpg')},
    posted: null,
    instagram: null,
    ready: ${parsed.steps.length > 0}
  },`);
console.log('\nそのあと npm run build でページを組み立てます。');
