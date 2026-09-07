/* チャーシューラーメン の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "chashu-ramen",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "チャ―シューを作る過程で出来た煮汁や漬けダレを使ってラーメンを作ってみました", en: "I made ramen with the braising liquid and marinade left over from making chashu (braised pork)." },
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: "豚肩ロースブロック", en: "Pork shoulder, in one piece", qja: "500g", qen: "500g" },
        { ja: "水", en: "Water", qja: "1.5L", qen: "1.5L" },
        { ja: "料理酒", en: "Cooking sake", qja: "50ml", qen: "50ml" },
        { ja: "みりん", en: "Mirin", qja: "50ml", qen: "50ml" },
        { ja: "長ネギ 先の部分", en: "Green tops of a negi", qja: null, qen: null },
        { ja: "玉ねぎ", en: "Onion", qja: "1個", qen: "1" },
        { ja: "ニンニク", en: "Garlic", qja: "1～2欠片", qen: null },
        { ja: "生姜スライス", en: "Sliced ginger", qja: "15g", qen: "15g" },
        { ja: "昆布", en: "Kombu (dried kelp)", qja: "15g", qen: "15g" },
      ]
    },
    {
      name: { ja: "漬けダレ", en: "Marinade" },
      items: [
        { ja: "煮汁", en: "Braising liquid", qja: "400ml", qen: "400ml" },
        { ja: "濃口醤油", en: "Koikuchi soy sauce (standard Japanese soy sauce)", qja: "200ml", qen: "200ml" },
        { ja: "ザラメ糖", en: "Zarame (coarse raw sugar)", qja: "大さじ4", qen: "4 tbsp" },
      ]
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "自分は福岡出身で、甘めの醤油ラーメンは好きですが、関東や関西の人にとっては甘すぎるかもしれません", en: "I'm from Fukuoka, so I like my soy sauce ramen on the sweet side. It may be too sweet if you're used to Kanto or Kansai (Tokyo, Osaka) seasoning." },
    { ja: "甘いなと思ったら、醤油と水などを使って調節してください", en: "If you find it too sweet, adjust the taste by adding soy sauce and water." },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
