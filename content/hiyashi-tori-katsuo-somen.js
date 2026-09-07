/* 冷やし鶏鰹出汁さっぱり素麺 の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "hiyashi-tori-katsuo-somen",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "熱くなってきたので、冷たくてさっぱりした優しい味の冷やし素麺作りました！ 少し薄味なので、もしもっと味が欲しいなって人は、濃口醤油を追加するといいかもです", en: "It's getting hot, so I made chilled somen noodles with a refreshing and gentle flavor! The seasoning is on the light side, so add a splash of koikuchi (regular) soy sauce if you want it stronger." },
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: "鶏もも肉", en: "Chicken thigh", qja: "1枚", qen: "1 piece" },
        { ja: "水", en: "Water", qja: "700ml", qen: "700ml" },
        { ja: "薄口醤油", en: "Usukuchi soy sauce (lighter in color, saltier)", qja: "50ml", qen: "50ml" },
        { ja: "料理酒", en: "Cooking sake", qja: "100ml", qen: "100ml" },
        { ja: "みりん", en: "Mirin", qja: "大さじ2", qen: "2 tbsp" },
        { ja: "昆布", en: "Kombu (dried kelp)", qja: "10g", qen: "10g" },
        { ja: "鰹節", en: "Bonito flakes", qja: "20g", qen: "20g" },
      ],
      note: { ja: "出汁ガラを引き上げ後", en: "After lifting out the spent kombu and chicken" }
    },
    {
      name: { ja: "みょうがの甘酢漬け", en: "Quick-pickled myoga in sweet vinegar" },
      items: [
        { ja: "水(理想は昆布出汁)", en: "Water", qja: "100ml", qen: "100ml" },
        { ja: "砂糖", en: "Sugar", qja: "大さじ１", qen: "1 tbsp" },
        { ja: "酢", en: "Vinegar", qja: "大さじ４", qen: "4 tbsp" },
        { ja: "塩", en: "Salt", qja: "二つまみ", qen: "2 pinches" },
      ]
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "鶏でも出汁を取るので心配な人も多いですが、鶏の脂はそこまで固まらないと思います", en: "Since the dashi is made partly from chicken, people worry the fat will set as it chills. In my experience it doesn't, not much." },
    { ja: "素麺は表記されている時間よりも短く茹でてます！茹で具合はお好みで！", en: "I cook the somen a little short of the time on the package. Adjust it to your liking." },
    { ja: "オクラは生でも食べられます。 ですが大きく育っていて固いものは、茹でて柔らかくしたほうが食べやすいです", en: "Okra can be eaten raw. However, if it has grown large and become tough, it is easier to eat after boiling it until tender." },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
