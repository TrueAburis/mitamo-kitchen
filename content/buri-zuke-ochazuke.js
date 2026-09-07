/* 鰤漬け丼のお茶漬け の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "buri-zuke-ochazuke",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "おなかの脂がのっている部分を使って、漬け丼のお茶漬けにしました。 脂の旨味をしっかり感じながら、あっさりと食べられるのでお勧めです！", en: "I used the fatty belly to make a marinated yellowtail bowl, then poured dashi over it. It's recommended because it's light and delicious while still allowing you to fully enjoy the umami of the fat!" },
  ],

  groups: [
    {
      name: { ja: "出汁", en: "Dashi" },
      items: [
        { ja: "水", en: "Water", qja: "600ml", qen: "600ml" },
        { ja: "昆布", en: "Kombu (dried kelp)", qja: "5g", qen: "5g" },
        { ja: "鰹節", en: "Bonito flakes", qja: "15g", qen: "15g" },
        { ja: "濃口醤油", en: "Koikuchi soy sauce (standard Japanese soy sauce)", qja: "小さじ1/2", qen: "1/2 tsp" },
        { ja: "塩", en: "Salt", qja: "小さじ 1/2", qen: "1/2 tsp" },
        { ja: "柚子の皮", en: "Yuzu zest", qja: null, qen: null },
      ]
    },
    {
      name: { ja: "漬けダレ", en: "Marinade" },
      items: [
        { ja: "醤油", en: "Soy sauce", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "みりん", en: "Mirin", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "料理酒", en: "Cooking sake", qja: "大さじ２", qen: "2 tbsp" },
      ]
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "※出汁をかける際は、ほんのりあったかい程度に温めましょう。 沸騰させたり、湯気が出るくらいの温度でかけると、魚に火が入ってしまします 魚の身があまり白くならないように温度を気を付けましょう", en: "*When pouring the dashi stock over the fish, make sure it's just slightly warm. If you pour it over at a boiling point or when it's hot enough to produce steam, the fish will cook. Be careful with the temperature so the fish doesn't turn too white." },
    { ja: "ごはんも粗熱を取ってから盛り付けましょう", en: "Allow the rice to cool slightly before serving." },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
