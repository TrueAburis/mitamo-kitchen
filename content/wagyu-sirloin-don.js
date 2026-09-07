/* 和牛サーロインステーキ丼 の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "wagyu-sirloin-don",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "今回はステーキをどんぶりにしました！ 今回使った和牛サーロインは脂が多く、自分自身もここまで多い脂は苦手なので、丼にして新玉ねぎや、玉ねぎとリンゴのソースでさっぱり仕上げました！ ニンニクチップと合わせて食べるとさらにおいしいです！！", en: "This time I made steak into a rice bowl. The wagyu sirloin I used was very fatty, and I am not keen on that much fat myself, so I served it over rice and finished it with new-season onion and an onion-and-apple sauce to lighten it. It's even more delicious when eaten with garlic chips!" },
  ],

  groups: [
    {
      name: { ja: "ソース", en: "Sauce" },
      items: [
        { ja: "玉ねぎ", en: "Onion", qja: "1個 (大体200g前後)", qen: "approx. 200g" },
        { ja: "リンゴ", en: "Apple", qja: "1/2 (大体100g)", qen: "approx. 100g" },
        { ja: "みりん", en: "Mirin", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "料理酒", en: "Cooking sake", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "醤油", en: "Soy sauce", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "砂糖", en: "Sugar", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "酢", en: "Vinegar", qja: "大さじ１", qen: "1 tbsp" },
      ]
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "ソースは煮立たせた後に、味を見ながら煮詰める時間や味を調節してください！", en: "After boiling the sauce, adjust the simmering time and flavor while tasting it!" },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
