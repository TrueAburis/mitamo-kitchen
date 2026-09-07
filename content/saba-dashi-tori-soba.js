/* 鯖出汁鶏そば の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "saba-dashi-tori-soba",

  /* TODO: 時間がキャプションに無かった。分かり次第埋める */
  meta: {
    servings: { ja: "2人前", en: "2" },
    time: { ja: null, en: null }
  },

  intro: [
    { ja: "今回は鯖節で出汁を取って、そばにしてみました！ 鯖節は特に出汁の味が強めで味を感じやすく、あまり調味料を入れなくてもおいしい出汁として飲めるところがとても好きで、おすすめです！ 特にうどんの出汁にも合うと思います！ あまり鯖節だけで売ってるところもないかもですが、その場合はサバやイワシ、マグロなどいろんなものが混ざってるものがおすすめです", en: "This time, I made soba noodles using dashi stock made with mackerel flakes! Mackerel flakes have a particularly strong dashi flavor that's easy to detect, and I really love that they can be enjoyed as a delicious dashi without adding much seasoning, so I recommend them! I think they go especially well with udon noodle dashi! Sababushi on its own can be hard to find. If you can't get it, a blend of mackerel, sardine and tuna works well." },
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: "鶏もも肉", en: "Chicken thigh", qja: "1枚", qen: "1 piece" },
        { ja: "長ネギ", en: "Negi (Japanese long onion)", qja: "1/2", qen: null },
        { ja: "青ネギ", en: "Green onion", qja: null, qen: null },
        { ja: "わかめ", en: "Wakame seaweed", qja: "お好みの量", qen: null },
        { ja: "蕎麦", en: "Soba noodles", qja: "2人分", qen: null },
        { ja: "七味唐辛子", en: "Shichimi togarashi (seven-spice blend)", qja: "お好み", qen: null },
      ]
    },
    {
      name: { ja: "出汁", en: "Dashi" },
      items: [
        { ja: "水", en: "Water", qja: "700ml", qen: "700ml" },
        { ja: "料理酒", en: "Cooking sake", qja: "50ml", qen: "50ml" },
        { ja: "みりん", en: "Mirin", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "濃口醤油", en: "Koikuchi soy sauce (standard Japanese soy sauce)", qja: "大さじ１", qen: "1 tbsp" },
        { ja: "薄口醤油", en: "Usukuchi soy sauce (lighter in color, saltier)", qja: "大さじ２", qen: "2 tbsp" },
      ],
      note: { ja: "もし味が薄いと感じるなら、塩で調節してください", en: null }
    },
  ],

  /* キャプションに手順が書かれていなかった。
     それらしい手順を書き足さないこと。空のままだと画面に「手順は準備中」と出る。 */
  steps: [],

  tips: [
  ],

  /* 手順と時間がそろうまで、検索用の構造化データは出さない */
  jsonld: null
};
