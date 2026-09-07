/* 鴨ネギ蕎麦 の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "kamo-negi-soba",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "出汁から鴨葱蕎麦を作ってみました", en: "I made duck and negi soba from scratch, starting with the dashi." },
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: "水", en: "Water", qja: "1L", qen: "1L" },
        { ja: "昆布", en: "Kombu (dried kelp)", qja: "10g", qen: "10g" },
        { ja: "鰹節", en: "Bonito flakes", qja: "20g", qen: "20g" },
        { ja: "みりん", en: "Mirin", qja: "100ml", qen: "100ml" },
        { ja: "濃口醤油", en: "Koikuchi soy sauce (standard Japanese soy sauce)", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "薄口醤油", en: "Usukuchi soy sauce (lighter in color, saltier)", qja: "大さじ３", qen: "3 tbsp" },
        { ja: "生姜スライス", en: "Sliced ginger", qja: "10g", qen: "10g" },
        { ja: "合鴨ロース", en: "Duck breast (aigamo)", qja: "1枚", qen: "1 piece" },
        { ja: "長ネギ", en: "Negi (Japanese long onion)", qja: null, qen: null },
        { ja: "小葱", en: "Thinly sliced scallions", qja: null, qen: null },
        { ja: "七味唐辛子", en: "Shichimi togarashi (seven-spice blend)", qja: "お好み", qen: null },
      ],
      note: { ja: "塩で味を調節", en: null }
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "和風出汁、鴨、ネギ、そして蕎麦の風味は相性がよく、1杯にまとめることでおいしさが倍増します！", en: "The dashi, the duck, the negi and the soba all suit each other, and in one bowl they add up to more than the parts." },
    { ja: "今はなかなか鴨ロースを売っている場所がありませんが、もし手に入れることがてきたら試してみてください", en: "Duck breast can be hard to find these days, but if you can get hold of some, please give it a try." },
    { ja: "スープの味は、最後は塩で調節してください。鴨もタイミングはいつでもいいので、切った後は再度塩を振りましょう", en: "Adjust the final taste of the soup with salt. You can add the duck at any point during cooking, but be sure to sprinkle a little salt on the meat after slicing it." },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
