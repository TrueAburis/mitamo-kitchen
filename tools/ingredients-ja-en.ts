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


  /* 材料名。キャプションに出てきた表記をそのままキーにする */
  var NAMES: Record<string, string> = {
    /* 肉・魚介 */
    '鶏むね肉': 'Chicken breast',
    '鶏もも肉': 'Chicken thigh',
    '鶏モモミンチ': 'Ground chicken thigh',
    '鶏ひき肉': 'Ground chicken',
    '豚バラ肉': 'Pork belly',
    '豚こま切れ肉': 'Thinly sliced pork',
    '赤エビ': 'Red shrimp (aka-ebi)',
    '海老の殻': 'Shrimp shells',
    '海老の出汁': 'Shrimp stock',
    'タコ': 'Octopus',
    '牛筋': 'Beef tendon',
    'カルビ': 'Beef short rib (kalbi)',
    '黒毛和牛カルビ': 'Kuroge wagyu short rib (kalbi)',
    '和牛サーロイン': 'Wagyu sirloin',
    '合鴨ロース': 'Duck breast (aigamo)',
    '鴨ロース': 'Duck breast',
    '豚肩ロースブロック': 'Pork shoulder, in one piece',
    'かにかま': 'Crab sticks',
    '海老': 'Shrimp',
    '鮭': 'Salmon',
    '鰤': 'Yellowtail',

    /* 野菜 */
    '茄子': 'Eggplant',
    '黄パプリカ': 'Yellow bell pepper',
    '赤パプリカ': 'Red bell pepper',
    'ピーマン': 'Green bell pepper',
    '長ネギ': 'Negi (Japanese long onion)',
    '長ネギの先の部分': 'Green tops of a negi',
    '玉ねぎ': 'Onion',
    '人参': 'Carrot',
    '大根': 'Daikon radish',
    'オクラ': 'Okra',
    'みょうが': 'Myoga ginger',
    '大葉': 'Shiso (perilla leaves)',
    'きのこ': 'Mushrooms',

    'マッシュルーム': 'Button mushrooms',
    'しめじ': 'Shimeji mushrooms',
    'えのき': 'Enoki mushrooms',
    '舞茸': 'Maitake mushrooms',
    '椎茸': 'Shiitake mushrooms',
    '小葱': 'Thinly sliced scallions',
    '青ネギ': 'Green onion',
    '長ネギ 先の部分': 'Green tops of a negi',
    'ニンニク': 'Garlic',
    '生姜スライス': 'Sliced ginger',
    '新玉ねぎ': 'New-season onion (sweet and mild)',
    'リンゴ': 'Apple',
    '柚子の皮': 'Yuzu zest',
    '輪切り唐辛子': 'Sliced red chili',
    'わかめ': 'Wakame seaweed',
    /* 出汁・乾物 */
    '昆布': 'Kombu (dried kelp)',
    '鰹節': 'Bonito flakes',
    '和風だし': 'Japanese dashi stock',
    '出汁': 'Dashi',
    '煮干し': 'Niboshi (dried baby sardines)',
    '鯖節': 'Sababushi (dried mackerel flakes)',
    '顆粒鶏ガラ出汁': 'Chicken stock granules',
    '鶏ガラ': 'Chicken bones',
    'だし汁': 'Dashi stock',

    /* 主食 */
    'お米': 'Rice',
    '米': 'Rice',
    '蕎麦': 'Soba noodles',
    '中華麺': 'Ramen noodles',
    'パスタ': 'Pasta',
    '素麺': 'Somen noodles',
    'うどん': 'Udon noodles',

    /* 調味料 */
    '水': 'Water',
    '濃口醤油': 'Koikuchi soy sauce (standard Japanese soy sauce)',
    '薄口醤油': 'Usukuchi soy sauce (lighter in color, saltier)',
    '醤油': 'Soy sauce',
    'みりん': 'Mirin',
    '料理酒': 'Cooking sake',
    '酒': 'Sake',
    '酢': 'Vinegar',
    '赤酢': 'Red vinegar (akazu)',
    '米酢': 'Rice vinegar',
    '砂糖': 'Sugar',
    'ザラメ糖': 'Zarame (coarse raw sugar)',
    '塩': 'Salt',
    'きび砂糖': 'Kibizato (unrefined cane sugar)',
    '柚子胡椒': 'Yuzu kosho (yuzu and chili paste)',
    '七味唐辛子': 'Shichimi togarashi (seven-spice blend)',
    '塩、黒胡椒': 'Salt and black pepper',
    'パセリと黒胡椒': 'Parsley and black pepper',
    'ケチャップ': 'Ketchup',
    'パン粉': 'Panko breadcrumbs',
    '生クリーム': 'Heavy cream',
    '白ワイン': 'White wine',
    'オリーブオイル': 'Olive oil',
    'バター': 'Butter',
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
  var UNITS: [RegExp, string][] = [
    [/^大さじ\s*([0-9０-９/／.]+)$/, '$1 tbsp'],
    [/^小さじ\s*([0-9０-９/／.]+)$/, '$1 tsp'],
    /* 1合は180ml。英語の1カップ（240ml）ではないので、cups とだけ書くと量が変わる */
    [/^([0-9０-９/／.]+)\s*合$/, '$1 go (180ml rice cups)'],
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

  function toHalfDigits(s: string | null): string {
    return String(s).replace(/[０-９]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xfee0);
    }).replace(/／/g, '/');
  }

  /* 材料名を英語にする。辞書に無ければ null を返す。
     null は「訳せなかった」という意味で、呼ぶ側が日本語のまま残す。 */
  function name(ja: string): string | null {
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
  function qty(ja: string | null): string | null {
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
  function coverage(list: string[]) {
    var known = 0;
    list.forEach(function (n) { if (name(n)) { known++; } });
    return { total: list.length, known: known, missing: list.filter(function (n) { return !name(n); }) };
  }

export { name, qty, coverage, NAMES };
