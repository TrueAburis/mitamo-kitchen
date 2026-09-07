/* 鰤の漬け丼 の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "buri-zuke-don",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "久しぶりに鰤を使いました！ 最近は天然よりも養殖のほうが脂がのっていておいしいですね", en: "It's been a while since I last used yellowtail!" },
  ],

  groups: [
    {
      name: { ja: "漬けダレ", en: "Marinade" },
      items: [
        { ja: "醤油", en: "Soy sauce", qja: "大さじ４", qen: "4 tbsp" },
        { ja: "みりん", en: "Mirin", qja: "大さじ４", qen: "4 tbsp" },
        { ja: "料理酒", en: "Cooking sake", qja: "大さじ２", qen: "2 tbsp" },
      ],
      note: { ja: "沸騰させてアルコールを飛ばしてください", en: null }
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "魚は刺身や漬け丼など、生のまま食べるのが好きですが、火を入れる魚料理も今年はいっぱい作ろうと思います！", en: "Lately, farmed yellowtail has become more fatty and delicious than wild-caught ones." },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
