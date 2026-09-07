/* キノコと鶏むね肉の和風生姜スープ の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "kinoko-shoga-soup",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "まだまだ寒い時期なので、温まるスープ作りました！ 薄味で作ってあるので、最後に塩で調節してください！", en: "It's still cold out, so I made a warming soup! It's lightly seasoned, so adjust the seasoning with salt at the end!" },
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: "鶏むね肉", en: "Chicken breast", qja: "1/2枚", qen: "1/2 piece" },
        { ja: "出汁", en: "Dashi", qja: "500ml", qen: "500ml" },
        { ja: "濃口醤油", en: "Koikuchi soy sauce (standard Japanese soy sauce)", qja: "大さじ1", qen: "1 tbsp" },
        { ja: "料理酒", en: "Cooking sake", qja: "小さじ２", qen: "2 tsp" },
        { ja: "みりん", en: "Mirin", qja: "小さじ２", qen: "2 tsp" },
        { ja: "椎茸", en: "Shiitake mushrooms", qja: "２枚", qen: "2 piece" },
        { ja: "えのき", en: "Enoki mushrooms", qja: "50g", qen: "50g" },
      ]
    },
    {
      name: { ja: "和風だし", en: "Japanese dashi" },
      items: [
        { ja: "水", en: "Water", qja: "800ml", qen: "800ml" },
        { ja: "昆布", en: "Kombu (dried kelp)", qja: "6g", qen: "6g" },
        { ja: "鰹節", en: "Bonito flakes", qja: "20g", qen: "20g" },
      ]
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "香ばしく焼いた鶏皮が、すごくいいアクセントになります！ 鶏むね肉は大体1/2枚で2人前になっています", en: "The crisp, well-browned chicken skin is what makes it. About half a chicken breast makes two servings." },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
