/* チキンカツの甘酢 の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "chicken-katsu-amazu",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "鶏肉は塩を少し強めに振って、おすすめは3時間以上置いておくことです そうすることで、しっかり下味がついて、ジューシーに仕上がります！", en: "Sprinkle a little salt on the chicken and let it sit for at least 3 hours. This will allow the seasoning to infuse and make it juicy!" },
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: "鶏もも肉", en: "Chicken thigh", qja: "1枚", qen: "1 piece" },
        { ja: "塩、黒胡椒", en: "Salt and black pepper", qja: null, qen: null },
        { ja: "パン粉", en: "Panko breadcrumbs", qja: "食パン1枚分", qen: null },
        { ja: "卵", en: "Egg", qja: "1個(鶏もも肉1枚につき1個ぐらいでちょうどです)", qen: null },
        { ja: "片栗粉", en: "Potato starch", qja: null, qen: null },
      ]
    },
    {
      name: { ja: "甘酢", en: "Sweet and sour sauce" },
      items: [
        { ja: "水", en: "Water", qja: "200ml", qen: "200ml" },
        { ja: "片栗粉", en: "Potato starch", qja: "大さじ１", qen: "1 tbsp" },
        { ja: "醤油", en: "Soy sauce", qja: "大さじ３", qen: "3 tbsp" },
        { ja: "みりん", en: "Mirin", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "料理酒", en: "Cooking sake", qja: "大さじ１", qen: "1 tbsp" },
        { ja: "砂糖", en: "Sugar", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "塩", en: "Salt", qja: "一つまみ", qen: null },
        { ja: "酢", en: "Vinegar", qja: "大さじ３", qen: "3 tbsp" },
      ],
      note: { ja: "酢は、マイルドにしあげるなら火をつける前に。", en: null }
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "最低30分でもいいですが、調理前日に下味をじっくりつけると、驚くほど変わります", en: "At least 30 minutes is fine, but marinating it the day before cooking will make a surprising difference." },
    { ja: "これにタルタルソースをかけるのも最高です！！", en: "It's also great with tartar sauce!" },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
