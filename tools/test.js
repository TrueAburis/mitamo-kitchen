/* キャプション解析と材料辞書の検証。
   実行： node tools/test.js

   実際の投稿（tools/fixtures/）に対して、取れるはずのものが取れているかを確かめる。
   キャプションの書き方は回によって揺れるので、
   「1本でたまたま動いた」を「3本とも動く」に変えるのがこのファイルの役目。

   失敗すると終了コード 1 を返すので、あとで GitHub Actions からも同じものを回せる。 */

const fs = require('fs');
const path = require('path');
const CaptionParser = require('./parse-caption.js');
const IngredientDict = require('./ingredients-ja-en.js');

const dir = path.join(__dirname, 'fixtures');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');

let failed = 0;
let checked = 0;

function check(label, actual, expected) {
  checked++;
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failed++;
    console.log(`  NG  ${label}`);
    console.log(`      期待: ${JSON.stringify(expected)}`);
    console.log(`      実際: ${JSON.stringify(actual)}`);
  } else {
    console.log(`  ok  ${label}`);
  }
}

function itemCount(groups) {
  return groups.reduce((n, g) => n + g.items.length, 0);
}

function groupNames(groups) {
  return groups.map((g) => g.name).filter(Boolean);
}

function allNames(groups) {
  const out = [];
  groups.forEach((g) => g.items.forEach((it) => out.push(it.name)));
  return out;
}

/* ---------- 南蛮漬け：英語あり、グループあり ---------- */
console.log('\n南蛮漬け（英語あり・グループあり）');
{
  const r = CaptionParser.parse(read('nanbanzuke.txt'));
  check('日本語タイトル', r.titleJa, '鶏むね肉と茄子の南蛮漬け');
  check('英語タイトル', r.titleEn, 'Chicken Breast and Eggplant Nanban-zuke');
  check('材料の数（日）', itemCount(r.groupsJa), 14);
  check('材料の数（英）', itemCount(r.groupsEn), 14);
  check('グループ名（日）', groupNames(r.groupsJa), ['南蛮のタレ']);
  check('グループ名（英）', groupNames(r.groupsEn), ['Nanban Sauce']);
  check('手順は無い', r.steps.length, 0);
  check('PRではない', r.isPR, false);

  const cov = IngredientDict.coverage(allNames(r.groupsJa));
  check('辞書で全部引ける', cov.missing, []);
}

/* ---------- 素麺：材料欄に注意書きが混ざる、英語の語順が逆 ---------- */
console.log('\n素麺（注意書きの混入・英語の語順が逆）');
{
  const r = CaptionParser.parse(read('somen.txt'));
  check('日本語タイトル', r.titleJa, '冷やし鶏鰹出汁さっぱり素麺');
  check('材料の数（日）', itemCount(r.groupsJa), 11);
  check('材料の数（英）', itemCount(r.groupsEn), 11);
  check('グループ名（日）', groupNames(r.groupsJa), ['みょうがの甘酢漬け']);

  /* 「出汁ガラを引き上げ後」は材料ではない。材料として数えてはいけない */
  const notes = r.groupsJa.reduce((a, g) => a.concat(g.notes), []);
  check('注意書きを材料から分けた', notes, ['出汁ガラを引き上げ後']);

  /* 全角スペース区切り・全角数字 */
  const names = allNames(r.groupsJa);
  check('全角スペース区切りを分解', names.includes('薄口醤油'), true);
  const sugar = r.groupsJa[1].items.find((i) => i.name === '砂糖');
  check('全角数字の分量', sugar && sugar.qty, '大さじ１');

  /* 英語は「1 chicken thigh」と分量が先に来る */
  const en = allNames(r.groupsEn);
  check('英語の語順が逆でも名前を取れる', en.includes('chicken thigh'), true);

  const cov = IngredientDict.coverage(names);
  check('辞書で全部引ける', cov.missing, []);
}

/* ---------- 小籠包：英語なし、PR案件 ---------- */
console.log('\n小籠包（英語なし・PR案件）');
{
  const r = CaptionParser.parse(read('shoronpo.txt'));
  check('日本語タイトル', r.titleJa, '包まない海老小籠包');
  check('英語タイトルは無い', r.titleEn, null);
  check('英語の材料も無い', itemCount(r.groupsEn), 0);
  check('材料の数（日）', itemCount(r.groupsJa), 5);
  check('PR案件として検出', r.isPR, true);

  /* 分量に補足が付く回：「長ネギ 1本分　大体 50g」 */
  const negi = r.groupsJa[0].items.find((i) => i.name === '長ネギ');
  check('分量の補足を落とさない', negi && negi.qty, '1本分 大体 50g');

  /* 商品名は辞書に無いのが正しい。訳さず日本語のまま残す */
  const cov = IngredientDict.coverage(allNames(r.groupsJa));
  check('商品名だけ訳さない', cov.missing, ['これ!うま‼つゆ']);
}

/* ---------- 単位の変換 ---------- */
console.log('\n単位の変換');
check('大さじ2', IngredientDict.qty('大さじ2'), '2 tbsp');
check('小さじ1', IngredientDict.qty('小さじ1'), '1 tsp');
check('全角数字', IngredientDict.qty('大さじ２'), '2 tbsp');
check('400ml', IngredientDict.qty('400ml'), '400ml');
check('適量', IngredientDict.qty('適量'), 'to taste');
check('二つまみ', IngredientDict.qty('二つまみ'), '2 pinches');
check('訳せないものは null', IngredientDict.qty('お好きなだけ'), null);

/* ---------- 結果 ---------- */
console.log(`\n${checked} 件中 ${checked - failed} 件が期待どおり。`);
if (failed) {
  console.log(`${failed} 件が想定と違います。`);
  process.exit(1);
}
console.log('すべて通りました。');
