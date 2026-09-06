/* 材料名と単位の対訳辞書。

   なぜ辞書なのか：
   キャプションに英語が無い回がある（実際に小籠包の回がそうだった）。
   そういう回でも「材料表だけは英語にする」ために使う。

   機械翻訳を使わない理由は、海外の人がこのサイトを見る一番の目的が
   「店頭でパッケージと照合すること」だから。
   薄口醤油と濃口醤油を訳し分けられない翻訳は、その目的に対して害になる。

   和食の材料は同じものが何度も出てくるので、投稿が増えるほど辞書が育つ。
   ここに無い材料は「訳さずに日本語のまま残す」。間違った英語を出すより、
   日本語のまま出したほうが、まだ辞書やアプリで調べられる。

   出典：tools/fixtures/ の実際のキャプション3本から抜き出したものが中心。 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.IngredientDict = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {

  /* 材料名。キャプションに出てきた表記をそのままキーにする */
  var NAMES = {
    /* 肉・魚介 */
    '鶏むね肉': 'Chicken breast',
    '鶏もも肉': 'Chicken thigh',
    '鶏モモミンチ': 'Ground chicken thigh',
    '鶏ひき肉': 'Ground chicken',
    '豚バラ肉': 'Pork belly',
    '豚こま切れ肉': 'Thinly sliced pork',
    '海老': 'Shrimp',
    '鮭': 'Salmon',
    '鰤': 'Yellowtail',

    /* 野菜 */
    '茄子': 'Eggplant',
    '黄パプリカ': 'Yellow bell pepper',
    '赤パプリカ': 'Red bell pepper',
    'ピーマン': 'Green bell pepper',
    '長ネギ': 'Leek',
    '長ネギの先の部分': 'Tip of a leek',
    '玉ねぎ': 'Onion',
    '人参': 'Carrot',
    '大根': 'Daikon radish',
    'オクラ': 'Okra',
    'みょうが': 'Myoga ginger',
    '大葉': 'Perilla leaves',
    'きのこ': 'Mushrooms',

    /* 出汁・乾物 */
    '昆布': 'Kombu (dried kelp)',
    '鰹節': 'Bonito flakes',
    '和風だし': 'Japanese dashi stock',
    'だし汁': 'Dashi stock',

    /* 主食 */
    'お米': 'Rice',
    '米': 'Rice',
    '素麺': 'Somen noodles',
    'うどん': 'Udon noodles',

    /* 調味料 */
    '水': 'Water',
    '濃口醤油': 'Soy sauce',
    '薄口醤油': 'Light soy sauce',
    '醤油': 'Soy sauce',
    'みりん': 'Mirin',
    '料理酒': 'Cooking sake',
    '酒': 'Sake',
    '酢': 'Vinegar',
    '砂糖': 'Sugar',
    'ザラメ糖': 'Coarse sugar (zarame)',
    '塩': 'Salt',
    '味噌': 'Miso',
    'ごま油': 'Sesame oil',
    'サラダ油': 'Vegetable oil',
    '片栗粉': 'Potato starch',
    '小麦粉': 'Flour',
    'おろし生姜': 'Grated ginger',
    'おろしにんにく': 'Grated garlic',
    '生姜': 'Ginger',
    'にんにく': 'Garlic',
    'いりごま': 'Toasted sesame seeds',
    '卵': 'Egg'
  };

  /* 単位。数字はそのまま残し、単位語だけ置き換える。
     英語では「2 tbsp」のように分量が先に来るのが自然なので、
     置き換えたあとに語順を入れ替える。 */
  var UNITS = [
    [/^大さじ\s*([0-9０-９/／.]+)$/, '$1 tbsp'],
    [/^小さじ\s*([0-9０-９/／.]+)$/, '$1 tsp'],
    [/^([0-9０-９/／.]+)\s*合$/, '$1 cups (rice)'],
    [/^([0-9０-９/／.]+)\s*枚$/, '$1 piece'],
    [/^([0-9０-９/／.]+)\s*本$/, '$1'],
    [/^([0-9０-９/／.]+)\s*個$/, '$1'],
    [/^([0-9０-９/／.]+)\s*尾$/, '$1'],
    [/^([0-9０-９/／.]+)\s*片$/, '$1 clove'],
    [/^適量$/, 'to taste'],
    [/^少々$/, 'a pinch'],
    [/^ひとつまみ$/, '1 pinch'],
    [/^二つまみ$/, '2 pinches'],
    [/^お好みで$/, 'to taste']
  ];

  function toHalfDigits(s) {
    return String(s).replace(/[０-９]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xfee0);
    }).replace(/／/g, '/');
  }

  /* 材料名を英語にする。辞書に無ければ null を返す。
     null は「訳せなかった」という意味で、呼ぶ側が日本語のまま残す。 */
  function name(ja) {
    var key = String(ja).trim();
    if (Object.prototype.hasOwnProperty.call(NAMES, key)) { return NAMES[key]; }

    /* 「水(理想は昆布出汁)」のように補足が括弧で付く回がある。
       括弧を外してもう一度引く。補足は訳さずに落とす（分量ではなく好みの話なので） */
    var stripped = key.replace(/[（(][^）)]*[）)]\s*$/, '').trim();
    if (stripped !== key && Object.prototype.hasOwnProperty.call(NAMES, stripped)) {
      return NAMES[stripped];
    }
    return null;
  }

  /* 分量を英語にする。g / ml / cm はそのまま通す */
  function qty(ja) {
    if (ja == null) { return null; }
    var s = toHalfDigits(ja).trim();
    if (!s) { return null; }
    if (/^[0-9]+(\.[0-9]+)?\s*(g|kg|ml|l|cm)$/i.test(s)) { return s.replace(/\s+/g, ''); }
    for (var i = 0; i < UNITS.length; i++) {
      if (UNITS[i][0].test(s)) { return s.replace(UNITS[i][0], UNITS[i][1]); }
    }
    return null;
  }

  /* 辞書がどれだけ埋まっているかを見るために使う */
  function coverage(list) {
    var known = 0;
    list.forEach(function (n) { if (name(n)) { known++; } });
    return { total: list.length, known: known, missing: list.filter(function (n) { return !name(n); }) };
  }

  return { name: name, qty: qty, coverage: coverage, NAMES: NAMES };
}));
