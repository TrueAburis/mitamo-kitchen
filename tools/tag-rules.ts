/* キャプションからタグを自動で決める。

   確度の高い順に3層。
   1. 材料と料理名から   … 語彙が限られているので、ほぼ間違えない
   2. ハッシュタグから   … みたもさんが投稿時に完全に制御できる
   3. 本文のことばから   … 一番ゆるい。誤爆しやすいので語を絞る

   **決められたタグ以外は絶対に作らない。**
   本文から新しいタグ名を作らせると「お手軽」「手軽」「かんたん」が
   別々のタグとして増殖して、タグ検索そのものが機能しなくなる。
   一覧（recipes.js の TAGS）に無い言葉は捨てる。 */


import type { Parsed } from './parse-caption.ts';

  /* 香味野菜は「野菜」にしない。ネギや生姜が入っているだけの料理を
     野菜料理として出すと、野菜のタグを押した人の期待から外れる。 */
  var AROMATIC = /ネギ|ねぎ|生姜|しょうが|にんにく|ニンニク|大葉|みょうが|ミョウガ|ごま|胡麻/;

  /* 材料名と料理名から引くタグ */
  var FROM_TEXT = [
    { tag: 'chicken',   re: /鶏|とり肉|チキン/ },
    { tag: 'pork',      re: /豚|ポーク/ },
    { tag: 'beef',      re: /牛肉|ビーフ/ },
    { tag: 'seafood',   re: /海老|エビ|鮭|鰤|鰆|鯛|いか|イカ|たこ|タコ|貝|あさり|ホタテ|まぐろ|マグロ|魚/ },
    { tag: 'egg',       re: /^卵$|たまご|玉子/ },
    { tag: 'tofu',      re: /豆腐|大豆|油揚げ|厚揚げ/ },
    { tag: 'vegetable', re: /茄子|なす|パプリカ|ピーマン|玉ねぎ|人参|にんじん|大根|オクラ|キャベツ|白菜|きのこ|ほうれん草|小松菜|トマト|きゅうり|ズッキーニ|かぼちゃ|れんこん|ごぼう|いも/ },
    { tag: 'rice',      re: /^お米$|^米$|ごはん|ご飯|飯$|丼|チャーハン|炊き込み/ },
    { tag: 'noodle',    re: /素麺|そうめん|うどん|そば|蕎麦|パスタ|ラーメン|中華麺|焼きそば/ },
    { tag: 'soup',      re: /味噌汁|スープ|お吸い物|汁$/ },
    { tag: 'fried',     re: /揚げ|フライ|唐揚げ|天ぷら/ },
    { tag: 'pickled',   re: /漬け|マリネ|ナムル|和え/ }
  ];

  /* ハッシュタグから引くタグ。表記ゆれをここで吸収する */
  var FROM_HASHTAG: Record<string, string> = {
    '簡単レシピ': 'easy', '簡単': 'easy', 'お手軽': 'easy', '時短': 'easy', '時短レシピ': 'easy',
    '作り置き': 'makeahead', 'つくりおき': 'makeahead',
    'お弁当': 'bento', 'お弁当おかず': 'bento', 'べんとう': 'bento',
    'おつまみ': 'snack', 'つまみ': 'snack', '酒の肴': 'snack'
  };

  /* 本文から引くタグ。誤爆しやすいので、意味がはっきりする言い回しだけ */
  var FROM_BODY = [
    { tag: 'easy',      re: /手間をへらして|時間がないとき|簡単に作れ|手軽に/ },
    { tag: 'makeahead', re: /作り置き|冷蔵で[0-9０-９]|日持ち/ },
    { tag: 'bento',     re: /お弁当に/ },
    { tag: 'snack',     re: /おつまみに|お酒に合/ }
  ];

  /* 手順に書かれた時間から、合計の調理時間を見積もってタグにする。
     書かれていない時間は数えない（推測した加熱時間は事故になるので）。 */
  function timeTag(steps: string[]): string | null {
    if (!steps || !steps.length) { return null; }
    var total = 0, found = false;
    steps.forEach(function (s) {
      var m = String(s).match(/([0-9]+)\s*〜?\s*([0-9]+)?\s*分/g);
      if (!m) { return; }
      m.forEach(function (hit) {
        var digits = hit.match(/[0-9]+/g);
        if (!digits) { return; }   /* 数字が取れない書き方だったら数えない */
        var nums = digits.map(Number);
        total += Math.max.apply(null, nums);
        found = true;
      });
    });
    if (!found) { return null; }
    if (total <= 15) { return 'min15'; }
    if (total <= 30) { return 'min30'; }
    return null;
  }

  /* parsed は parse-caption.js の戻り値。known は recipes.js の TAGS のキー一覧 */
  function decide(parsed: Parsed, known: string[]): string[] {
    var found: string[] = [];
    var add = function (t: string | null) {
      if (t && known.indexOf(t) > -1 && found.indexOf(t) < 0) { found.push(t); }
    };

    var names: string[] = [];
    (parsed.groupsJa || []).forEach(function (g) {
      g.items.forEach(function (it) { names.push(it.name); });
    });

    /* 1. 材料から。香味野菜は野菜として数えない */
    names.forEach(function (n) {
      FROM_TEXT.forEach(function (rule) {
        if (rule.tag === 'vegetable' && AROMATIC.test(n)) { return; }
        if (rule.re.test(n)) { add(rule.tag); }
      });
    });

    /* 料理名からも引く。素麺のように、材料欄に本体が書かれていない回があるため */
    var title = parsed.titleJa || '';
    FROM_TEXT.forEach(function (rule) {
      if (rule.tag === 'vegetable') { return; }   /* 料理名から野菜は判定しない */
      if (rule.re.test(title)) { add(rule.tag); }
    });

    /* 2. ハッシュタグから */
    (parsed.hashtags || []).forEach(function (h) {
      if (FROM_HASHTAG[h]) { add(FROM_HASHTAG[h]); }
    });

    /* 3. 本文から */
    var body = [parsed.leadJa || ''].concat(parsed.notesJa || []).join(' ');
    FROM_BODY.forEach(function (rule) { if (rule.re.test(body)) { add(rule.tag); } });

    /* 4. 時間 */
    add(timeTag(parsed.steps));

    return found;
  }

export { decide, timeTag };
