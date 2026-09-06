/* 鶏むね肉と茄子の南蛮漬け の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "tori-mune-nasu-nanbanzuke",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "いつもは魚で南蛮漬けを作るのですが、今回はお肉でやってみました！", en: "I usually make *Nanban-zuke* (marinated fried dish) with fish, but this time I decided to try it with meat!" },
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: "鶏むね肉", en: "Chicken breast", qja: null, qen: null },
        { ja: "黄パプリカ", en: "Yellow bell pepper", qja: "1/4個", qen: "1/4" },
        { ja: "赤パプリカ", en: "Red bell pepper", qja: "1/4個", qen: "1/4" },
        { ja: "ピーマン", en: "Green bell pepper", qja: "1/2個", qen: "1/2" },
        { ja: "茄子", en: "Eggplant", qja: "1本", qen: "1" },
        { ja: "昆布", en: "Kombu (dried kelp)", qja: "1枚", qen: "1 sheet" },
        { ja: "水", en: "Water", qja: "600ml", qen: "600ml" },
        { ja: "鰹節", en: "Bonito flakes", qja: "20g", qen: "20g" },
      ]
    },
    {
      name: { ja: "南蛮のタレ", en: "Nanban Sauce" },
      items: [
        { ja: "和風だし", en: "Japanese dashi stock", qja: "100ml", qen: "100ml" },
        { ja: "酢", en: "Vinegar", qja: "50ml", qen: "50ml" },
        { ja: "ザラメ糖", en: "Coarse sugar (Zarame)", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "みりん", en: "Mirin", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "料理酒", en: "Cooking sake", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "薄口醤油", en: "Light soy sauce", qja: "大さじ２", qen: "2 tbsp" },
      ]
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "甘酢のタレは、しんなりした野菜を食べたければ温かいうちに。 しゃきしゃきとした食感で食べたければ、タレの粗熱が取れてから入れてください", en: "If you prefer the vegetables to be tender and soft, add them to the sweet-and-sour sauce while it is still warm. If you prefer a crisp texture, wait until the sauce has cooled down before adding them." },
    { ja: "また、茄子のちょうどいい揚げ具合は、箸を刺してみて、スッと刺されば引き上げ時です！", en: "As for the eggplant, the perfect frying point is when you can easily pierce it with a chopstick—that's the time to take it out!" },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
