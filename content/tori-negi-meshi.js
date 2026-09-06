/* 鶏ネギ飯の本文。ページのHTMLはここから組み立てる。

   HTMLに直接書かずデータにしているのは、日本語版と英語版の2枚を
   同じ内容から出すため。片方だけ直してズレるのを防ぐ。 */

export default {
  slug: 'tori-negi-meshi',

  meta: {
    servings: { ja: '2〜3人前', en: '2–3' },
    time: { ja: '弱火 23分 + 蒸らし 3〜5分', en: '23 min low + 3–5 min rest' }
  },

  intro: [
    {
      ja: '味付けはかなりシンプルにしています。濃い味が好きな方は、おろし生姜やにんにくを増やしてください。炊く前に塩を1〜2振りしてもいいと思います。',
      en: 'The seasoning is quite simple. If you prefer a stronger flavour, add more grated ginger or garlic. You might also add 1–2 shakes of salt before cooking.'
    },
    {
      ja: '薬味に大葉やいりごまを載せたり混ぜたりしても、おいしいです。',
      en: 'Adding or mixing in condiments such as perilla leaves and sesame seeds is also delicious.'
    }
  ],

  groups: [
    {
      name: null,
      items: [
        { ja: '鶏もも肉', en: 'Chicken thigh', qja: '1枚', qen: '1 piece' },
        { ja: 'お米', en: 'Rice', qja: '2合（300g）', qen: '2 cups (300g)' },
        { ja: '水', en: 'Water', qja: '400ml', qen: '400ml' },
        { ja: '濃口醤油', en: 'Soy sauce', qja: '大さじ2', qen: '2 tbsp' },
        { ja: 'おろし生姜', en: 'Grated ginger', qja: '小さじ1', qen: '1 tsp' },
        { ja: 'おろしにんにく', en: 'Grated garlic', qja: '小さじ1', qen: '1 tsp' },
        { ja: 'ごま油', en: 'Sesame oil', qja: '大さじ1', qen: '1 tbsp' },
        { ja: '長ネギの先の部分', en: 'Tip of a leek', qja: '適量', qen: 'to taste' }
      ]
    },
    {
      name: { ja: 'ネギダレ', en: 'Leek sauce' },
      items: [
        { ja: '長ネギ', en: 'Leek', qja: '1/2', qen: '1/2' },
        { ja: '濃口醤油', en: 'Soy sauce', qja: '大さじ2', qen: '2 tbsp' },
        { ja: '酢', en: 'Vinegar', qja: '大さじ2', qen: '2 tbsp' },
        { ja: '砂糖', en: 'Sugar', qja: '大さじ2', qen: '2 tbsp' }
      ],
      note: {
        ja: '濃くしたい方は、おろしにんにく・生姜・ごま油をタレに足してください。',
        en: 'For a stronger sauce, add more grated garlic, ginger and sesame oil.'
      }
    }
  ],

  /* uses は分量バーに出す「その手順で使うもの」。
     手順の文章に出てこない材料は書かない。バーと本文が食い違うと手が止まる。 */
  steps: [
    {
      ja: 'お米2合を洗い、ざるに上げて水気を切ります。',
      en: 'Rinse 2 cups of rice, drain in a sieve and let the water run off.',
      usesJa: 'お米 2合（300g）', usesEn: 'Rice 2 cups (300g)'
    },
    {
      ja: '鍋にお米、水400ml、濃口醤油 大さじ2、おろし生姜 小さじ1、おろしにんにく 小さじ1、ごま油 大さじ1を入れて、軽く混ぜます。',
      en: 'In a pot, combine the rice, 400ml water, 2 tbsp soy sauce, 1 tsp grated ginger, 1 tsp grated garlic and 1 tbsp sesame oil, then stir lightly.',
      usesJa: '水 400ml ／ 醤油 大さじ2 ／ 生姜 小さじ1 ／ にんにく 小さじ1 ／ ごま油 大さじ1',
      usesEn: 'Water 400ml / Soy 2 tbsp / Ginger 1 tsp / Garlic 1 tsp / Sesame oil 1 tbsp'
    },
    {
      ja: '鶏もも肉をお米の上にのせ、長ネギの先の部分も一緒にのせます。',
      en: 'Lay the chicken thigh on top of the rice and add the green tip of the leek.',
      usesJa: '鶏もも肉 1枚 ／ 長ネギの先 適量', usesEn: 'Chicken thigh 1 piece / Leek tip to taste'
    },
    {
      ja: '蓋をして中火にかけ、沸いてきたら弱火で炊きます。',
      en: 'Cover and bring to a boil over medium heat, then turn the heat down to low.',
      usesJa: '中火 → 沸いたら弱火 23分', usesEn: 'Medium, then low for 23 min',
      wait: { ja: '弱火のまま 23分', en: '23 min on low', long: true }
    },
    {
      ja: '火を止めて、蓋をしたまま蒸らします。',
      en: 'Turn off the heat and let it steam with the lid on.',
      usesJa: '火を止めて 3〜5分', usesEn: 'Heat off, 3–5 min',
      wait: { ja: '蒸らし 3〜5分', en: 'rest 3–5 min', long: false }
    },
    {
      ja: '蒸らしている間にネギダレを作ります。長ネギ1/2本を細かく刻み、濃口醤油・酢・砂糖 各大さじ2と混ぜます。',
      en: 'While it rests, make the sauce: finely chop 1/2 leek and mix with 2 tbsp each of soy sauce, vinegar and sugar.',
      usesJa: '長ネギ 1/2本 ／ 醤油・酢・砂糖 各大さじ2', usesEn: 'Leek 1/2 / Soy, vinegar, sugar 2 tbsp each'
    },
    {
      ja: '鶏肉を取り出して食べやすく切り、長ネギの先は取り除きます。ご飯をさっくり混ぜて盛り付け、鶏肉をのせてネギダレをかけます。',
      en: 'Take out the chicken and cut it into bite-size pieces, remove the leek tip, fluff the rice, then serve with the chicken and the sauce.',
      usesJa: '盛り付け', usesEn: 'Serving'
    }
  ],

  tips: [
    { ja: '濃い味が好きな方は、おろし生姜・にんにくを増量。', en: 'Want it bolder? Increase the grated ginger and garlic.' },
    { ja: '炊く前に塩を1〜2振りしても味が締まります。', en: '1–2 shakes of salt before cooking tightens the flavour.' },
    { ja: '大葉、いりごまなどの薬味は載せても混ぜてもおいしいです。', en: 'Perilla leaves and toasted sesame work either on top or mixed in.' }
  ],

  /* 検索用の構造化データ。手順と時間がそろっているので出す */
  jsonld: { cookTime: 'PT23M', totalTime: 'PT28M', yield: '2-3 servings', category: '主食', cuisine: '日本料理' }
};
