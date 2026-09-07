/* 煮干しと鶏出汁の醤油ラーメン の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "niboshi-shoyu-ramen",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "寒い時期なので、生姜や柚子の皮を入れてもおいしいと思います！ 煮干しを焼きあごにしたりと、出汁のアレンジもやりやすいと思います！", en: "Since it's cold out, adding ginger or yuzu peel would be delicious! You can vary the dashi easily, for example by swapping the niboshi for grilled flying fish (yaki-ago)." },
  ],

  groups: [
    {
      name: { ja: "スープ", en: "Soup" },
      items: [
        { ja: "水", en: "Water", qja: "800ml", qen: "800ml" },
        { ja: "鶏もも肉", en: "Chicken thigh", qja: "1枚", qen: "1 piece" },
        { ja: "みりん", en: "Mirin", qja: "100ml", qen: "100ml" },
        { ja: "濃口醤油", en: "Koikuchi soy sauce (standard Japanese soy sauce)", qja: "100ml", qen: "100ml" },
        { ja: "昆布", en: "Kombu (dried kelp)", qja: "10g", qen: "10g" },
        { ja: "煮干し", en: "Niboshi (dried baby sardines)", qja: "8本", qen: "8" },
        { ja: "砂糖", en: "Sugar", qja: "大さじ1/2 (今回使ったのはきび砂糖)", qen: "1/2 tablespoon" },
        { ja: "小葱", en: "Thinly sliced scallions", qja: "お好み", qen: null },
      ],
      note: { ja: "柚子胡椒もおいしいかもです！", en: null }
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "いつも料理酒などを使って、キリっとした味付けばかりなので、 みりんなどでコクを出したスープも作ってみました", en: "I usually use cooking sake and other seasonings for a crisp flavor, but I tried making a soup with mirin and other ingredients to add depth of flavor." },
    { ja: "もっと改良できると思うので、この路線も研究していきます！", en: "I think there's room for improvement, so I'll keep exploring this route!" },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
