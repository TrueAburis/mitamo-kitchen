/* 鶏ネギ飯 の本文。
   tools/generate.js がキャプションから書き出したもの。
   英語が null の項目は、キャプションに英語が無く、辞書でも引けなかったところ。
   訳を当てずに null のままにしてある。埋めるときは実際の英語を入れること。 */

export default {
  slug: "tori-negi-meshi",

  /* 何人前と時間は、キャプションのコツの中に書かれていたものをそのまま移した。
     「※このレシピは大体2〜3人前分で作っています」
     「炊く時間は弱火23分、蒸らしが3〜5分!」 */
  meta: {
    servings: { ja: "2〜3人前", en: "2–3" },
    time: { ja: "炊き23分＋蒸らし3〜5分", en: "23 min cooking + 3–5 min resting" }
  },

  intro: [
    { ja: "味付けはかなりシンプルにしてます！ 濃い味が好きな方は、おろし生姜やニンニクを増やしたりすると良いと思います! あと炊く前に塩を1～2振りしてもいいかもしれません", en: "The seasoning is quite simple! If you prefer a stronger flavor, you can add more grated ginger or garlic! You might also want to add 1-2 shakes of salt before cooking." },
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: "鶏もも肉", en: "Chicken thigh", qja: "1枚", qen: "1 piece" },
        { ja: "お米", en: "Rice", qja: "2合(300g)", qen: null },
        { ja: "水", en: "Water", qja: "400ml", qen: "400ml" },
        { ja: "濃口醤油", en: "Koikuchi soy sauce (standard Japanese soy sauce)", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "おろし生姜", en: "Grated ginger", qja: "小さじ１", qen: "1 tsp" },
        { ja: "おろしにんにく", en: "Grated garlic", qja: "小さじ１", qen: "1 tsp" },
        { ja: "ごま油", en: "Sesame oil", qja: "大さじ１", qen: "1 tbsp" },
        { ja: "長ネギの先の部分", en: "Green tops of a negi", qja: null, qen: null },
      ]
    },
    {
      name: { ja: "ネギダレ", en: "Negi sauce" },
      items: [
        { ja: "長ネギ", en: "Negi (Japanese long onion)", qja: "1/2", qen: null },
        { ja: "濃口醤油", en: "Koikuchi soy sauce (standard Japanese soy sauce)", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "酢", en: "Vinegar", qja: "大さじ２", qen: "2 tbsp" },
        { ja: "砂糖", en: "Sugar", qja: "大さじ２", qen: "2 tbsp" },
      ],
      note: { ja: "※濃ゆくしたい方は、おろしにんにくや生姜、ごま油を追加してタレを作るといいと思います", en: "Note: for a stronger sauce, add more grated garlic, ginger and sesame oil." }
    },
  ],

  /* 手順はキャプションに書かれていないので、人が書いたもの。
     キャプションから作り直すときに消えないよう、ここに残しておくこと。
     英語の言い回しは data/phrasebook.ts の定訳にそろえてある（leek ではなく negi）。 */
  steps: [
    {
      ja: "お米2合を洗い、ざるに上げて水気を切ります。",
      en: "Rinse the rice (300g / 2 go), drain in a sieve and let the water run off.",
      usesJa: "お米 2合（300g）", usesEn: "Rice 300g (2 go)"
    },
    {
      ja: "鍋にお米、水400ml、濃口醤油 大さじ2、おろし生姜 小さじ1、おろしにんにく 小さじ1、ごま油 大さじ1を入れて、軽く混ぜます。",
      en: "In a pot, combine the rice, 400ml water, 2 tbsp soy sauce, 1 tsp grated ginger, 1 tsp grated garlic and 1 tbsp sesame oil, then stir lightly.",
      usesJa: "水 400ml ／ 醤油 大さじ2 ／ 生姜 小さじ1 ／ にんにく 小さじ1 ／ ごま油 大さじ1",
      usesEn: "Water 400ml / Soy 2 tbsp / Ginger 1 tsp / Garlic 1 tsp / Sesame oil 1 tbsp"
    },
    {
      ja: "鶏もも肉をお米の上にのせ、長ネギの先の部分も一緒にのせます。",
      en: "Lay the chicken thigh on top of the rice and add the green tops of the negi.",
      usesJa: "鶏もも肉 1枚 ／ 長ネギの先 適量", usesEn: "Chicken thigh 1 piece / Negi tops to taste"
    },
    {
      ja: "蓋をして中火にかけ、沸いてきたら弱火で炊きます。",
      en: "Cover and bring to a boil over medium heat, then turn the heat down to low.",
      usesJa: "中火 → 沸いたら弱火 23分", usesEn: "Medium, then low for 23 min",
      wait: { ja: "弱火のまま 23分", en: "23 min on low", long: true }
    },
    {
      ja: "火を止めて、蓋をしたまま蒸らします。",
      en: "Turn off the heat and let it steam with the lid on.",
      usesJa: "火を止めて 3〜5分", usesEn: "Heat off, 3–5 min",
      wait: { ja: "蒸らし 3〜5分", en: "rest 3–5 min", long: false }
    },
    {
      ja: "蒸らしている間にネギダレを作ります。長ネギ1/2本を細かく刻み、濃口醤油・酢・砂糖 各大さじ2と混ぜます。",
      en: "While it rests, make the sauce: finely chop 1/2 negi and mix with 2 tbsp each of soy sauce, vinegar and sugar.",
      usesJa: "長ネギ 1/2本 ／ 醤油・酢・砂糖 各大さじ2", usesEn: "Negi 1/2 / Soy, vinegar, sugar 2 tbsp each"
    },
    {
      ja: "鶏肉を取り出して食べやすく切り、長ネギの先は取り除きます。ご飯をさっくり混ぜて盛り付け、鶏肉をのせてネギダレをかけます。",
      en: "Take out the chicken and cut it into bite-size pieces, remove the negi tops, fluff the rice, then serve with the chicken and the sauce.",
      usesJa: "盛り付け", usesEn: "Serving"
    }
  ],

  tips: [
    { ja: "薬味で大葉、いりごま、など色々載せたり混ぜたりしてもおいしいです！", en: "Adding or mixing in various condiments like perilla leaves and sesame seeds is also delicious!" },
    { ja: "※このレシピは大体2～3人前分で作っています", en: "Note: this recipe makes about 2–3 servings." },
    { ja: "炊く時間は弱火23分、蒸らしが3～5分!", en: "Cook for 23 minutes over low heat, then let it rest, covered, for 3–5 minutes." },
  ],

  /* 手順・分量・時間がそろったので、検索用の構造化データを出す。
     totalTime は下ごしらえの時間がキャプションに無いので null のまま。
     書かれていない時間を足すと、検索結果に嘘の所要時間が出る。 */
  jsonld: { cookTime: "PT23M", totalTime: null, yield: "2〜3人前" }
};
