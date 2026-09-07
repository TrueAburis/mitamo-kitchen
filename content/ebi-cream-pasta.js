/* エビクリームパスタ の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "ebi-cream-pasta",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "今回はパスタに挑戦！ いつものレシピより濃厚に仕上げました！ 味は少し強めに作ってます！", en: "This time I'm trying my hand at pasta! I made it richer than my usual recipe! I made it a little stronger in flavor!" },
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: "赤エビ", en: "Red shrimp (aka-ebi)", qja: "7～8匹", qen: null },
        { ja: "マッシュルーム", en: "Button mushrooms", qja: "2～3個", qen: null },
        { ja: "ニンニク", en: "Garlic", qja: "２欠片", qen: null },
        { ja: "パセリと黒胡椒", en: "Parsley and black pepper", qja: "お好み", qen: null },
      ]
    },
    {
      name: { ja: "ソース", en: "Sauce" },
      items: [
        { ja: "白ワイン", en: "White wine", qja: "100ml", qen: "100ml" },
        { ja: "水", en: "Water", qja: "200ml", qen: "200ml" },
        { ja: "海老の出汁", en: "Shrimp stock", qja: null, qen: null },
        { ja: "生クリーム", en: "Heavy cream", qja: "100ml", qen: "100ml" },
        { ja: "ケチャップ", en: "Ketchup", qja: "大さじ４", qen: "4 tbsp" },
        { ja: "顆粒鶏ガラ出汁", en: "Chicken stock granules", qja: "小さじ2", qen: "2 tsp" },
      ],
      note: { ja: "海老の殻(8匹分。パナメ海老などの頭がなければ10匹分以上)", en: null }
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
