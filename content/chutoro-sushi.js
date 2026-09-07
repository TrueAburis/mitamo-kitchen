/* 中とろ寿司 の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "chutoro-sushi",

  /* TODO: 何人前と時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: null, en: null },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "あけましておめでとうごさいます! 12月の後半は少し病気をしていて、あまり動画を出せませんでした・・・ もう全快しているので、これからガンガン動画出します！", en: "Happy New Year! I was a little sick in the latter half of December, so I wasn't able to upload many videos... I'm fully recovered now, so I'll be uploading videos as soon as possible!" },
  ],

  groups: [
    {
      name: { ja: "赤しゃり", en: "Akashari — sushi rice with red vinegar (halve everything for 1 go of rice)" },
      items: [
        { ja: "米", en: "Rice", qja: "2合", qen: "2 go (180ml rice cups)" },
        { ja: "赤酢", en: "Red vinegar (akazu)", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "砂糖", en: "Sugar", qja: "大さじ１ 小さじ１（米1合なら小さじ２)", qen: "2 teaspoons for 1 cup of rice" },
        { ja: "塩", en: "Salt", qja: "小さじ２", qen: "2 tsp" },
      ],
      note: { ja: "米1合はこの半分", en: null }
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
    { ja: "今回は本マグロの中とろを寿司にしてみました！", en: "This time, I tried making sushi using medium fatty tuna!" },
    { ja: "マグロを使うのはほぼ初めてで緊張しましたが、繊維を意識して切ったのですが、思ったようにうまくいきませんでした・・・ 歯切れが悪かったわけではありませんが、おそらく理想は切ったときに横しまになることだと思うのですが、 縦線になってしまいました・・・", en: "It was almost my first time using tuna, so I was a little nervous, and I tried to cut it while keeping the fibers in mind, but it didn't turn out as well as I'd hoped... It wasn't that it was hard to cut, but ideally, you'd want horizontal stripes when you cut it, and instead, it ended up with vertical stripes..." },
    { ja: "魚は特に繊細ですごく難しいと思いました！これも経験ですね 今年は魚をもっと動画で使いたいなと思っています！", en: "I found fish to be particularly delicate and very difficult! This is also a learning experience. I'd like to use fish in more videos this year!" },
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
