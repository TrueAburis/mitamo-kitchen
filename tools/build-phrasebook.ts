/* data/phrasebook.ts から、みたもさんに共有する対訳表を書き出す。

   出力：docs/phrasebook.html（Artifact として公開する1枚。サイト本体には入らない）

   なぜ別ファイルにして組み立てるのか：
   台帳（docs/ledger.html）と同じ考え方で、みたもさんが見るのは1枚のページ、
   こちらが書き換えるのはデータのほう、と分けている。
   HTMLを手で足していくと、件数と中身がいつかずれる。

   実行： node tools/build-phrasebook.ts */

import fs from 'node:fs';
import path from 'node:path';
import {
  TERMS, POSTS, ASKS, LOG, TEMPLATE, TEMPLATE_RULES, EXAMPLE, EXAMPLE_NOTES,
  type Line, type Post, type Term
} from '../data/phrasebook.ts';

const ROOT = path.join(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'docs', 'phrasebook.html');

/* 最終更新の日付。中身を変えた日と表示がずれないよう、書き出した日を入れる */
const TODAY = new Date().toLocaleDateString('sv-SE');

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* キャプションのどの部分か。みたもさんが読む言葉にする */
const WHERE_JA: Record<Line['where'], string> = {
  title: 'タイトル',
  lead: '書き出し',
  tip: 'コツ',
  group: 'タレの名前',
  ingredient: '材料',
  note: '材料欄の注記'
};

const VERDICT: Record<Line['verdict'], { label: string; cls: string }> = {
  ok: { label: 'そのまま', cls: 'v-ok' },
  fix: { label: '直す', cls: 'v-fix' },
  watch: { label: '確認したい', cls: 'v-watch' }
};


/* ---------- 検算 ----------
   データの書き方が崩れていたら、静かに変なページを出さずに止める。
   みたもさんが見るページなので、理由の無い「直し」が載るほうが困る。 */
function validate(): string[] {
  const problems: string[] = [];
  POSTS.forEach(function (p) {
    p.lines.forEach(function (l, i) {
      const at = p.slug + ' の ' + (i + 1) + '件目';
      if (l.verdict === 'fix' && !l.fixed) { problems.push(at + '：直すと書いてあるのに、直した英語が無い'); }
      if (l.verdict === 'fix' && !l.why) { problems.push(at + '：直した理由が書かれていない'); }
      if (l.verdict === 'ok' && l.fixed) { problems.push(at + '：そのままでよいのに、直した英語が入っている'); }
      if (l.fixed && l.fixed === l.posted) { problems.push(at + '：投稿された英語と直した英語が同じ'); }
    });
  });
  return problems;
}


/* ---------- 部品 ---------- */

/* その定訳が「使わない」と決めた書き方が、いくつの投稿に出ているか。
   直す理由の重さは回数で決まるので、数えて画面に出す。
   2回以上のものだけ出すのは、1回なら書き間違いかもしれないため。 */
function termCount(t: Term): number {
  if (!t.avoid.length) { return 0; }
  return POSTS.filter(function (p) {
    return p.lines.some(function (l) {
      const posted = l.posted;
      if (!posted) { return false; }
      return t.avoid.some(function (a) { return posted.toLowerCase().includes(a.toLowerCase()); });
    });
  }).length;
}

function termHtml(t: Term): string {
  const avoid = t.avoid.length
    ? '<p class="avoid"><span class="lab">使わない</span>' + t.avoid.map(function (a) {
        return '<span class="en">' + esc(a) + '</span>';
      }).join('') + '</p>'
    : '';
  const n = termCount(t);
  const seen = n >= 2 ? '<span class="seen">使わない書き方が' + n + '回の投稿に出ています</span>' : '';
  return [
    '<div class="term">',
    '<p class="t-ja">' + esc(t.ja) + seen + '</p>',
    '<p class="t-en"><span class="en">' + esc(t.en) + '</span></p>',
    avoid,
    '<p class="why">' + esc(t.why) + '</p>',
    '</div>'
  ].join('');
}

function lineHtml(l: Line): string {
  const v = VERDICT[l.verdict];
  const rows: string[] = [];

  rows.push('<div class="r r-ja"><span class="lab">日本語</span><p>' + esc(l.ja) + '</p></div>');

  rows.push('<div class="r r-posted"><span class="lab">投稿の英語</span><p class="en">'
    + (l.posted ? esc(l.posted) : '<span class="none">英語なし</span>') + '</p></div>');

  if (l.fixed) {
    rows.push('<div class="r r-fixed"><span class="lab">直した英語</span><p class="en">' + esc(l.fixed) + '</p></div>');
  }
  if (l.why) {
    rows.push('<div class="r r-why"><span class="lab">理由</span><p>' + esc(l.why) + '</p></div>');
  }

  return [
    '<li class="line ' + v.cls + '">',
    '<p class="head"><span class="where">' + WHERE_JA[l.where] + '</span>',
    '<span class="chip">' + v.label + '</span></p>',
    rows.join(''),
    '</li>'
  ].join('');
}

function postHtml(p: Post): string {
  if (!p.lines.length) {
    const why = p.note ? esc(p.note) : (p.pr
      ? 'タイアップの回で、キャプションに英語がありません。タイアップは契約の範囲が案件ごとに違うので、'
        + 'サイトへの自動掲載からも外してあります。載せると決まった回だけ、PR である旨を明記して手で足します。'
      : 'この回のキャプションには英語が書かれていません。'
        + '英語が付いた回だけ対訳を作るので、この回は日本語のままにしてあります。');
    return [
      '<section class="post empty">',
      '<h3>' + esc(p.titleJa) + (p.pr ? '<span class="pr">PR</span>' : '') + '</h3>',
      '<p class="note">' + why + '</p>',
      '</section>'
    ].join('');
  }
  const n = p.lines.filter(function (l) { return l.verdict === 'fix'; }).length;
  return [
    '<section class="post">',
    '<h3>' + esc(p.titleJa) + '</h3>',
    '<p class="src"><span class="cnt">直したい箇所 ' + n + '</span></p>',
    '<ul class="lines">' + p.lines.map(lineHtml).join('') + '</ul>',
    '</section>'
  ].join('');
}

/* 見終わったキャプションの一覧。POSTS から作るので、
   投稿を足したら自動で載る。手で二重に管理しない。 */
function seenHtml(): string {
  return POSTS.map(function (p) {
    const state = p.pr ? 'PR・英語なし' : (p.lines.length ? '対訳あり' : '英語なし');
    const cls = p.pr ? 's-pr' : (p.lines.length ? 's-done' : 's-none');
    return '<li><span class="t">' + esc(p.titleJa) + '</span>'
      + '<span class="st ' + cls + '">' + state + '</span></li>';
  }).join('');
}


/* ---------- 組み立て ---------- */

function build(): string {
  const all = POSTS.reduce<Line[]>(function (a, p) { return a.concat(p.lines); }, []);
  const nFix = all.filter(function (l) { return l.verdict === 'fix'; }).length;
  const withEn = POSTS.filter(function (p) { return p.lines.length; }).length;

  return `<title>みたもキッチン 日英対訳表</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@500;700&display=swap">
<style>
  :root{
    --ground:#FCFBF8;
    --raise:#F4F1EB;
    --ink:#1F2328;
    --ink-soft:#5E6670;
    --rule:#DCD6CC;
    --indigo:#33465A;
    --indigo-ink:#FCFBF8;
    --mark:#9E5A63;
    --mincho:"Zen Old Mincho",serif;
    --sans:system-ui,-apple-system,"Hiragino Kaku Gothic ProN","Yu Gothic UI","Noto Sans JP",Meiryo,sans-serif;
    --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,"Noto Sans Mono",monospace;
  }
  @media (prefers-color-scheme:dark){
    :root:not([data-theme="light"]){
      --ground:#15181C;
      --raise:#1D2229;
      --ink:#E9E6E0;
      --ink-soft:#9AA1AA;
      --rule:#303840;
      --indigo:#7A97B8;
      --indigo-ink:#12161A;
      --mark:#D0868F;
    }
  }
  :root[data-theme="dark"]{
    --ground:#15181C;
    --raise:#1D2229;
    --ink:#E9E6E0;
    --ink-soft:#9AA1AA;
    --rule:#303840;
    --indigo:#7A97B8;
    --indigo-ink:#12161A;
    --mark:#D0868F;
  }

  *,*::before,*::after{box-sizing:border-box}
  body{
    margin:0;background:var(--ground);color:var(--ink);
    font-family:var(--sans);font-size:16px;line-height:1.8;
    font-feature-settings:"palt";-webkit-font-smoothing:antialiased;
  }
  .wrap{max-width:880px;margin:0 auto;padding:0 clamp(18px,5vw,40px) 96px}
  .en{font-family:var(--sans);font-feature-settings:normal;letter-spacing:.005em}

  /* ---- 冒頭 ---- */
  .top{padding:clamp(34px,6vw,60px) 0 26px;border-bottom:1px solid var(--rule)}
  h1{margin:0;font-family:var(--mincho);font-size:clamp(28px,5vw,42px);font-weight:700;line-height:1.35;text-wrap:balance}
  .sub{margin:14px 0 0;max-width:38em;color:var(--ink-soft);font-size:15px}
  .asof{margin:16px 0 0;font-family:var(--mono);font-size:12px;color:var(--ink-soft)}
  .tally{display:flex;flex-wrap:wrap;margin:24px 0 0;border:1px solid var(--rule)}
  .tally div{flex:1 1 30%;min-width:140px;padding:13px 16px}
  .tally div+div{border-left:1px solid var(--rule)}
  .tally b{display:block;font-family:var(--mono);font-variant-numeric:tabular-nums;font-size:26px;font-weight:400;line-height:1.2}
  .tally span{font-size:12.5px;color:var(--ink-soft)}
  @media (max-width:600px){
    .tally div{flex-basis:100%}
    .tally div+div{border-left:0;border-top:1px solid var(--rule)}
  }

  /* ---- 節 ---- */
  section.sec{padding-top:52px}
  h2{margin:0 0 6px;font-family:var(--mincho);font-size:23px;font-weight:700;line-height:1.4}
  .lead{margin:0 0 22px;max-width:38em;color:var(--ink-soft);font-size:14px}

  /* ---- 定訳 ---- */
  .terms{display:grid;gap:0;border-top:1px solid var(--rule)}
  .term{padding:16px 0 18px;border-bottom:1px solid var(--rule)}
  .t-ja{margin:0;font-family:var(--mincho);font-size:19px;font-weight:500;line-height:1.5}
  .seen{margin-left:12px;font-family:var(--mono);font-size:11px;color:var(--mark);vertical-align:2px}
  .t-en{margin:4px 0 0;font-size:15.5px}
  .t-en .en{color:var(--indigo);font-weight:600}
  .avoid{margin:4px 0 0;font-size:14.5px}
  .avoid .en{color:var(--ink-soft);text-decoration:line-through;text-decoration-color:var(--mark);text-decoration-thickness:1px}
  .avoid .en+.en{margin-left:12px}
  .why{margin:8px 0 0;max-width:40em;color:var(--ink-soft);font-size:13.5px;line-height:1.75}
  .lab{
    display:inline-block;min-width:5.6em;margin-right:10px;
    font-family:var(--mono);font-size:11px;letter-spacing:.02em;color:var(--ink-soft);
  }

  /* ---- 投稿ごとの対訳 ---- */
  .post{padding-top:34px}
  .post h3{margin:0;font-family:var(--mincho);font-size:18px;font-weight:700}
  .pr{margin-left:10px;padding:1px 7px;border:1px solid var(--mark);color:var(--mark);
    font-family:var(--mono);font-size:11px;font-weight:400;vertical-align:3px}
  .src{margin:4px 0 14px;font-family:var(--mono);font-size:11.5px;color:var(--ink-soft)}
  .cnt{margin-left:12px;color:var(--mark)}
  .post.empty .note{margin:0;max-width:38em;color:var(--ink-soft);font-size:13.5px;
    border-left:2px solid var(--rule);padding-left:14px}

  .lines{list-style:none;margin:0;padding:0;display:grid;gap:0}
  .line{padding:14px 0 16px 16px;border-top:1px solid var(--rule);border-left:2px solid var(--rule)}
  .lines .line:last-child{border-bottom:1px solid var(--rule)}
  .v-fix{border-left-color:var(--mark)}
  .v-watch{border-left-color:var(--indigo)}

  .head{display:flex;align-items:center;gap:10px;margin:0 0 8px}
  .where{font-family:var(--mono);font-size:11px;color:var(--ink-soft)}
  .chip{font-family:var(--mono);font-size:11px;line-height:1.6;padding:1px 8px;border:1px solid currentColor}
  .v-ok .chip{color:var(--ink-soft)}
  .v-fix .chip{color:var(--mark)}
  .v-watch .chip{color:var(--indigo)}

  .r{display:grid;grid-template-columns:6.4em 1fr;align-items:baseline;padding:2px 0}
  .r p{margin:0;line-height:1.7}
  .r .lab{min-width:0;margin:0}
  .r-ja p{font-size:15.5px}
  .r-posted p{font-size:15px;color:var(--ink-soft)}
  .r-fixed p{font-size:15.5px;color:var(--ink);font-weight:500}
  .r-fixed .lab{color:var(--mark)}
  .r-why{margin-top:4px}
  .r-why p{font-size:13.5px;color:var(--ink-soft)}
  .none{color:var(--ink-soft);font-family:var(--mono);font-size:12.5px}
  @media (max-width:620px){
    .r{grid-template-columns:1fr;gap:1px}
    .r .lab{display:block}
  }

  /* ---- 推奨テンプレート ----
     コピーして使うものなので、日本語も英語も等幅で、行の形がそのまま見えるようにする */
  .tpl{
    margin:0;padding:20px 22px;overflow-x:auto;
    background:var(--raise);border-left:2px solid var(--indigo);
    font-family:var(--mono);font-size:13px;line-height:1.85;
    white-space:pre;tab-size:2;
  }
  .tpl.ex{border-left-color:var(--mark)}
  .tplnote{margin:10px 0 0;max-width:40em;color:var(--ink-soft);font-size:13.5px}
  .rh{margin:38px 0 10px;font-family:var(--mincho);font-size:17px;font-weight:700}
  .exnote{margin:12px 0 0;padding-left:1.2em;max-width:40em;color:var(--ink-soft);font-size:13.5px}
  .exnote li{margin:5px 0}

  /* ---- 約束・聞きたいこと ---- */
  .rules{list-style:none;margin:0;padding:0;border-top:1px solid var(--rule)}
  .rules li{padding:12px 0;border-bottom:1px solid var(--rule)}
  .rules b{display:block;font-weight:600;font-size:15px}
  .rules p{margin:3px 0 0;max-width:40em;color:var(--ink-soft);font-size:13.5px}
  .rules code{font-family:var(--mono);font-size:12.5px;background:var(--raise);padding:1px 5px}

  .ask{background:var(--indigo);color:var(--indigo-ink);padding:clamp(20px,4vw,30px);margin-top:20px}
  .ask h2{margin:0 0 10px;color:var(--indigo-ink)}
  .ask ol{margin:0;padding-left:1.3em}
  .ask li{margin:10px 0;font-size:15px}
  .ask li span{display:block;font-size:13.5px;opacity:.82;margin-top:2px}

  /* ---- 見終わったキャプション ----
     番号は「いただいた順の何本目か」という意味があるので付けている */
  .seen{margin:0;padding:0 0 0 2.6em;border-top:1px solid var(--rule)}
  .seen li{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 12px;
    padding:9px 0;border-bottom:1px solid var(--rule)}
  .seen::marker,.seen li::marker{font-family:var(--mono);font-size:12px;color:var(--ink-soft)}
  .seen .t{font-family:var(--mincho);font-size:16.5px}
  .st{font-family:var(--mono);font-size:11px;padding:1px 8px;border:1px solid currentColor;white-space:nowrap}
  .s-done{color:var(--ink-soft)}
  .s-none{color:var(--ink-soft)}
  .s-pr{color:var(--mark)}

  .log{list-style:none;margin:0;padding:0;border-top:1px solid var(--rule)}
  .log li{display:grid;grid-template-columns:7.5em 1fr;gap:0 14px;padding:9px 0;border-bottom:1px solid var(--rule);font-size:14px}
  .log time{font-family:var(--mono);font-size:12px;color:var(--ink-soft)}
  @media (max-width:520px){.log li{grid-template-columns:1fr;gap:2px}}

  a{color:var(--indigo)}
  a:focus-visible,:focus-visible{outline:2px solid var(--mark);outline-offset:2px}
</style>

<div class="wrap">

  <header class="top">
    <h1>キャプションの日英対訳表</h1>
    <p class="sub">Instagram のキャプションに付いている英文を、日本語と1文ずつ突き合わせた表です。直したほうがよい箇所は、直した英文と、なぜ直したかを添えてあります。あわせて、次からのキャプションの<b>推奨テンプレート</b>を載せました。新しい投稿のキャプションをもらうたびに、この表に足していきます。</p>
    <p class="asof">最終更新 ${TODAY} ／ 対訳ができている回 ${withEn}件</p>
    <div class="tally">
      <div><b>${TERMS.length}</b><span>次から使う言い方（定訳）</span></div>
      <div><b>${nFix}</b><span>直したい箇所</span></div>
      <div><b>${ASKS.length}</b><span>みたもさんに聞きたいこと</span></div>
    </div>
  </header>

  <section class="sec">
    <h2>まず、この言い方にそろえたい</h2>
    <p class="lead">何度も出てくる言葉です。ここさえ決まっていれば、次からのキャプションは直す箇所がほとんど無くなります。はじめの2つ（薄口・濃口）と出汁ガラは、間違うと海外の人が別の商品を買ってしまう、作れなくなる、という種類のものです。</p>

    <h3 class="rh">材料と部位の名前</h3>
    <p class="lead">売り場でパッケージを探すときに効くものです。ここが違うと、別のものを買って作ることになります。</p>
    <div class="terms">${TERMS.filter(function (t) { return t.kind !== 'phrase'; }).map(termHtml).join('')}</div>

    <h3 class="rh">言い回しと料理名</h3>
    <div class="terms">${TERMS.filter(function (t) { return t.kind === 'phrase'; }).map(termHtml).join('')}</div>
  </section>

  <section class="sec">
    <h2>推奨テンプレート</h2>
    <p class="lead">次からのキャプションを、この形で書いていただけると助かります。10回分を見比べて、書き方が揺れていた箇所と、サイトへの取り込みが実際に失敗した箇所から作りました。【レシピ】や [Recipe] といった目印は、いま動いているものをそのまま使っています。新しく足したのは【作り方】と [Steps] の2つだけです。</p>

    <pre class="tpl">${esc(TEMPLATE)}</pre>
    <p class="tplnote">【作り方】と [Steps] は、これから使う目印です。いまのサイト側の取り込みはまだこの2つを読めないので、テンプレートが決まりしだい、こちらで合わせます。みたもさんの書き方が先で、道具はあとから合わせるほうが安全なためです。</p>

    <h3 class="rh">それぞれの決まりと、その理由</h3>
    <ul class="rules">
      ${TEMPLATE_RULES.map(function (r) {
        return '<li><b>' + esc(r.title) + '</b><p>' + esc(r.body) + '</p></li>';
      }).join('')}
    </ul>

    <h3 class="rh">記入例</h3>
    <p class="lead">鴨ネギ蕎麦の回を、この形と、上の定訳で書き直したものです。そのままコピーして使える形にしてあります。</p>
    <pre class="tpl ex">${esc(EXAMPLE)}</pre>
    <ul class="exnote">
      ${EXAMPLE_NOTES.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('')}
    </ul>

    <h3 class="rh">英語が書けない回について</h3>
    <p class="lead">小籠包の回のように英語が付いていない回は、英語ページを作りません。中身が日本語のままのページを英語として出すと、検索の評価を落とすためです。日本語だけで公開して、あとから英語をもらえれば、その時点で足せます。無理に英語を付けなくて大丈夫です。</p>
  </section>

  <section class="sec">
    <h2>投稿ごとの対訳</h2>
    <p class="lead">左が日本語、次が投稿されたままの英語、その下が直した英語です。「そのまま」と付いているものは直す必要がありません。</p>
    ${POSTS.map(postHtml).join('')}
  </section>

  <section class="sec ask">
    <h2>みたもさんに聞きたいこと</h2>
    <ol>
      ${ASKS.map(function (a) {
        return '<li>' + esc(a.q) + '<span>' + esc(a.note) + '</span></li>';
      }).join('')}
    </ol>
  </section>

  <section class="sec">
    <h2>更新履歴</h2>
    <ul class="log">
      ${LOG.map(function (l) {
        return '<li><time>' + esc(l.date) + '</time><span>' + esc(l.text) + '</span></li>';
      }).join('')}
    </ul>
  </section>

  <section class="sec">
    <h2>見終わったキャプション</h2>
    <p class="lead">いただいた順に並べています。この${POSTS.length}回ぶんは英文を最後まで見終わっていて、直したい箇所は上の「投稿ごとの対訳」に入っています。ここに無い回は、まだ見ていない回です。</p>
    <ol class="seen">${seenHtml()}</ol>
  </section>

</div>
`;
}


const problems = validate();
if (problems.length) {
  console.error('data/phrasebook.ts の書き方に問題があります。直してから書き出してください。');
  problems.forEach(function (p) { console.error('  - ' + p); });
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, build(), 'utf8');

const all = POSTS.reduce<Line[]>(function (a, p) { return a.concat(p.lines); }, []);
console.log('docs/phrasebook.html を書き出しました');
console.log('  定訳 ' + TERMS.length + '件 ／ 対訳 ' + all.length + '行'
  + '（直す ' + all.filter(function (l) { return l.verdict === 'fix'; }).length
  + ' ／ 確認 ' + all.filter(function (l) { return l.verdict === 'watch'; }).length
  + ' ／ そのまま ' + all.filter(function (l) { return l.verdict === 'ok'; }).length + '）');
