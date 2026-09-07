/* 牛筋大根 の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "gyusuji-daikon",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "牛筋と大根はとても相性がよく、一緒に煮るととてもおいしい惣菜になります！ 圧力鍋があればもっと早く、簡単にできます", en: "Beef tendon and daikon radish go incredibly well together, making a delicious side dish when simmered together! If you have a pressure cooker, this will be even faster and easier." },
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: "牛筋", en: "Beef tendon", qja: "200g", qen: "200g" },
        { ja: "大根", en: "Daikon radish", qja: "1本", qen: "1" },
        { ja: "みりん", en: "Mirin", qja: "70ml", qen: "70ml" },
        { ja: "料理酒", en: "Cooking sake", qja: "70ml", qen: "70ml" },
        { ja: "出汁", en: "Dashi", qja: "250ml", qen: "250ml" },
        { ja: "砂糖", en: "Sugar", qja: "大さじ1/2", qen: "1/2 tbsp" },
        { ja: "濃口醤油", en: "Koikuchi soy sauce (standard Japanese soy sauce)", qja: "大さじ1", qen: "1 tbsp" },
        { ja: "輪切り唐辛子", en: "Sliced red chili", qja: "お好み", qen: null },
      ]
    },
    {
      name: { ja: "和風だし", en: "Japanese Dashi" },
      items: [
        { ja: "昆布", en: "Kombu (dried kelp)", qja: "10g", qen: "10g" },
        { ja: "鰹節", en: "Bonito flakes", qja: "25g", qen: "25g" },
        { ja: "水", en: "Water", qja: "1L", qen: "1L" },
      ]
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "余った出汁は、ラーメンのスープにしたり色々してみてください！ 余った出汁のレシピも今後出すので、少々お待ちを！", en: "Try using leftover dashi in various ways, like making ramen soup! I'll be posting some recipes for leftover dashi in the future, so stay tuned!" },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
