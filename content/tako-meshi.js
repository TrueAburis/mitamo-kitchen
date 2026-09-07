/* タコ飯とタコの唐揚げ の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "tako-meshi",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "生のタコが珍しく売ってあったので、買ってたこ飯で豪快に使ってみました！", en: "Raw octopus is not something you see on sale very often, so when I found some I bought it and used it generously for octopus rice." },
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: "タコ", en: "Octopus", qja: "300g", qen: "300g" },
        { ja: "お米", en: "Rice", qja: "300g", qen: "300g" },
        { ja: "水", en: "Water", qja: "400ml", qen: "400ml" },
        { ja: "薄口醤油", en: "Usukuchi soy sauce (lighter in color, saltier)", qja: "大さじ１", qen: "1 tbsp" },
        { ja: "料理酒", en: "Cooking sake", qja: "大さじ2", qen: "2 tbsp" },
        { ja: "みりん", en: "Mirin", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "ほんだじ", en: "Hondashi (dashi granules):", qja: "小さじ１", qen: "1 tsp" },
      ]
    },
    {
      name: { ja: "たこの唐揚げ", en: "Deep-fried Octopus (Karaage)" },
      items: [
        { ja: "タコ", en: "Octopus", qja: "150g", qen: "150g" },
        { ja: "おろし生姜", en: "Grated ginger", qja: "小さじ１", qen: "1 tsp" },
        { ja: "おろしにんにく", en: "Grated garlic", qja: "小さじ１", qen: "1 tsp" },
        { ja: "料理酒", en: "Cooking sake", qja: "大さじ１", qen: "1 tbsp" },
        { ja: "醤油", en: "Soy sauce", qja: "大さじ１", qen: "1 tbsp" },
      ],
      note: { ja: "15分だけ漬ける。それ以上は塩辛くなってしまいます", en: "Marinate for only 15 minutes. Marinating any longer will make it too salty." }
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "タコを塩もみするときの塩は、粗塩を使うのが良いです", en: "It is best to use coarse salt when massaging the octopus." },
    { ja: "塩もみして洗った後は、キッチンペーパーなどでしっかり水気を切りましょう", en: "After massaging it with salt and rinsing it off, make sure to pat it thoroughly dry with paper towels." },
    { ja: "また、タコを生から調理する場合、水分がかなり出るので、そこを考えながら調理したほうがいいです 特にたこ飯を生タコを使って調理する場合は、水分を良く飛ばさないと、米を炊くときの水分量に影響が出てくるので、 注意しながら料理しましょう", en: "Also, keep in mind that cooking with raw octopus releases a significant amount of moisture. This is especially important when making octopus rice with raw octopus; if you don't cook off enough of the moisture, it will affect the liquid-to-rice ratio during cooking, so please be mindful of this while preparing the dish." },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
