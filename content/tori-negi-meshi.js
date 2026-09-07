/* 鶏ネギ飯 の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "tori-negi-meshi",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "味付けはかなりシンプルにしてます！ 濃い味が好きな方は、おろし生姜やニンニクを増やしたりすると良いと思います! あと炊く前に塩を1～2振りしてもいいかもしれません", en: "The seasoning is quite simple! If you prefer a stronger flavor, you can add more grated ginger or garlic! You might also want to add 1-2 shakes of salt before cooking." },
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: "鶏もも肉", en: "Chicken thigh", qja: "1枚", qen: "1 piece" },
        { ja: "お米", en: "Rice", qja: "2合(300g)", qen: null },
        { ja: "水", en: "Water", qja: "400ml", qen: "400ml" },
        { ja: "濃口醤油", en: "Koikuchi soy sauce (standard Japanese soy sauce)", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "おろし生姜", en: "Grated ginger", qja: "小さじ１", qen: "1 tsp" },
        { ja: "おろしにんにく", en: "Grated garlic", qja: "小さじ１", qen: "1 tsp" },
        { ja: "ごま油", en: "Sesame oil", qja: "大さじ１", qen: "1 tbsp" },
        { ja: "長ネギの先の部分", en: "Green tops of a negi", qja: null, qen: null },
      ]
    },
    {
      name: { ja: "ネギダレ", en: "Negi sauce" },
      items: [
        { ja: "長ネギ", en: "Negi (Japanese long onion)", qja: "1/2", qen: null },
        { ja: "濃口醤油", en: "Koikuchi soy sauce (standard Japanese soy sauce)", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "酢", en: "Vinegar", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "砂糖", en: "Sugar", qja: "大さじ２", qen: "2 tbsp" },
      ],
      note: { ja: "※濃ゆくしたい方は、おろしにんにくや生姜、ごま油を追加してタレを作るといいと思います", en: "Note: for a stronger sauce, add more grated garlic, ginger and sesame oil." }
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "薬味で大葉、いりごま、など色々載せたり混ぜたりしてもおいしいです！", en: "Adding or mixing in various condiments like perilla leaves and sesame seeds is also delicious!" },
    { ja: "※このレシピは大体2～3人前分で作っています", en: "Note: this recipe makes about 2–3 servings." },
    { ja: "炊く時間は弱火23分、蒸らしが3～5分!", en: "Cook for 23 minutes over low heat, then let it rest, covered, for 3–5 minutes." },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
