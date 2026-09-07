/* 牛カルビ 甘辛たれ漬け の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "gyu-karubi-tare",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "黒毛和牛カルビを甘辛いタレにつけて、すき焼き風焼き肉にしてみました！ 下味なので、漬けた後に焼き肉のたれで食べてもおいしいです！", en: "I marinated Japanese Black wagyu short rib in a sweet-savory sauce, for a sukiyaki-flavored yakiniku. This is a marinade rather than a dipping sauce, so it is also good with yakiniku sauce after grilling." },
  ],

  groups: [
    {
      name: { ja: "タレ", en: "Sauce" },
      items: [
        { ja: "濃口醤油", en: "Koikuchi soy sauce (standard Japanese soy sauce)", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "料理酒", en: "Cooking sake", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "ごま油", en: "Sesame oil", qja: "大さじ１", qen: "1 tbsp" },
        { ja: "砂糖", en: "Sugar", qja: "大さじ１", qen: "1 tbsp" },
        { ja: "おろし生姜", en: "Grated ginger", qja: "小さじ１", qen: "1 tsp" },
        { ja: "おろしにんにく", en: "Grated garlic", qja: "小さじ１", qen: "1 tsp" },
        { ja: "豆板醤", en: "Doubanjiang (chili bean paste):", qja: "小さじ１", qen: "1 tsp" },
      ],
      note: { ja: "これに胡麻などを混ぜるのもありです！", en: "You can also add sesame seeds to this!" }
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
