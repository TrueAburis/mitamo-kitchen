/* レシピの一覧情報。**人が書く側の元データ。**
 *
 * ここから `recipes.js`（ブラウザが読むファイル）が組み立てられる。
 * `recipes.js` は書き出されるものなので、直接編集しないこと。上書きされる。
 *
 * いいね数などの数値はここに書かない。Instagram から取り込んだものが
 * data/instagram.json に入り、組み立てのときに合流する。
 * 人が書く情報と機械が書く情報を混ぜないのは、
 * 機械にコメント付きのファイルを書き換えさせないため。 */

export type Recipe = {
  slug: string;
  ja: { title: string; lead: string };
  en: { title: string; lead: string };
  tags: string[];
  image: string;
  /* YYYY-MM-DD。新しい順の並びに使う。
   * **投稿日が分からない回は null。** 適当な日付で埋めると、
   * 画面に出る日付が嘘になるうえ、並び順まで嘘になる。
   * null の回は日付を出さず、日付のある回より後ろに並ぶ。 */
  posted: string | null;
  instagram: string | null; /* 投稿のURL。あればレシピページに動画が入る */
  ready: boolean;           /* 手順が入っていれば true */
};

export const RECIPES: Recipe[] = [
  {
    slug: 'hiyashi-tori-katsuo-somen',
    ja: { title: '冷やし鶏鰹出汁さっぱり素麺', lead: '冷たくてさっぱりした、優しい味の冷やし素麺。鶏と鰹で出汁を取ります。' },
    en: { title: 'Chilled Somen in Chicken and Bonito Dashi', lead: 'Chilled somen in a light, gentle dashi drawn from chicken and bonito.' },
    tags: ['chicken', 'noodle'],
    image: 'images/hiyashi-tori-katsuo-somen.jpg',
    posted: '2026-09-06',
    instagram: null,
    ready: false
  },
  {
    slug: 'tori-mune-nasu-nanbanzuke',
    ja: { title: '鶏むね肉と茄子の南蛮漬け', lead: 'いつもは魚で作る南蛮漬けを、鶏むね肉で。' },
    en: { title: 'Chicken Breast and Eggplant Nanbanzuke', lead: 'Nanbanzuke, usually made with fish, made with chicken instead.' },
    tags: ['chicken', 'vegetable', 'fried', 'pickled'],
    image: 'images/tori-mune-nasu-nanbanzuke.jpg',
    posted: '2026-09-06',
    instagram: 'https://www.instagram.com/reel/DcaOmyvRcAI/',
    ready: false
  },
  {
    slug: 'tori-negi-meshi',
    ja: { title: '鶏ネギ飯', lead: '鶏の脂と醤油だけで、米が主役になります。' },
    en: { title: 'Chicken and Negi Rice', lead: 'Just chicken fat and soy sauce, and the rice becomes the star.' },
    tags: ['chicken', 'rice', 'onepot'],
    image: 'images/tori-negi-meshi.jpg',
    posted: '2026-09-02',
    instagram: null,
    ready: true
  },

  /* ここから下は、みたもさんから渡された過去のキャプション（対訳表の20件）を
     起こしたもの。投稿日が分からないので posted は null。
     日付が分かれば入れるだけで、新しい順の並びに乗る。 */
  {
    slug: 'kamo-negi-soba',
    ja: { title: '鴨ネギ蕎麦', lead: '出汁から鴨葱蕎麦を作ってみました' },
    en: { title: 'Duck and Negi Soba', lead: 'I made duck and negi soba from scratch, starting with the dashi.' },
    tags: ['noodle'],
    image: 'images/kamo-negi-soba.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'chashu-ramen',
    ja: { title: 'チャーシューラーメン', lead: 'チャ―シューを作る過程で出来た煮汁や漬けダレを使ってラーメンを作ってみました' },
    en: { title: 'Chashu Ramen', lead: 'I made ramen with the braising liquid and marinade left over from making chashu (braised pork).' },
    tags: ['pork', 'noodle'],
    image: 'images/chashu-ramen.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'gyu-karubi-tare',
    ja: { title: '牛カルビ 甘辛たれ漬け', lead: '黒毛和牛カルビを甘辛いタレにつけて、すき焼き風焼き肉にしてみました！ 下味なので、漬けた後に焼き肉のたれで食べてもおいしいです！' },
    en: { title: 'Sweet-Savory Marinated Beef Short Rib (Kalbi)', lead: 'I marinated Japanese Black wagyu short rib in a sweet-savory sauce, for a sukiyaki-flavored yakiniku. This is a marinade rather than a dipping sauce, so it is also good with yakiniku sauce after grilling.' },
    tags: ['beef', 'pickled'],
    image: 'images/gyu-karubi-tare.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'tako-meshi',
    ja: { title: 'タコ飯とタコの唐揚げ', lead: '生のタコが珍しく売ってあったので、買ってたこ飯で豪快に使ってみました！' },
    en: { title: 'Octopus Rice and Deep-Fried Octopus', lead: 'Raw octopus is not something you see on sale very often, so when I found some I bought it and used it generously for octopus rice.' },
    tags: ['seafood', 'rice', 'fried'],
    image: 'images/tako-meshi.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'wagyu-sirloin-don',
    ja: { title: '和牛サーロインステーキ丼', lead: '今回はステーキをどんぶりにしました！ 今回使った和牛サーロインは脂が多く、自分自身もここまで多い脂は苦手なので、丼にして新玉ねぎや、玉ねぎとリンゴのソースでさっぱり仕上げました！ ニンニクチップと合わせて食べるとさらにおいしいです！！' },
    en: { title: 'Wagyu Sirloin Steak Rice Bowl', lead: 'This time I made steak into a rice bowl. The wagyu sirloin I used was very fatty, and I am not keen on that much fat myself, so I served it over rice and finished it with new-season onion and an onion-and-apple sauce to lighten it. It\'s even more delicious when eaten with garlic chips!' },
    tags: ['beef', 'rice'],
    image: 'images/wagyu-sirloin-don.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'ebi-cream-pasta',
    ja: { title: 'エビクリームパスタ', lead: '今回はパスタに挑戦！ いつものレシピより濃厚に仕上げました！ 味は少し強めに作ってます！' },
    en: { title: 'Shrimp Cream Pasta', lead: 'This time I\'m trying my hand at pasta! I made it richer than my usual recipe! I made it a little stronger in flavor!' },
    tags: ['seafood', 'noodle'],
    image: 'images/ebi-cream-pasta.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'kinoko-shoga-soup',
    ja: { title: 'キノコと鶏むね肉の和風生姜スープ', lead: 'まだまだ寒い時期なので、温まるスープ作りました！ 薄味で作ってあるので、最後に塩で調節してください！' },
    en: { title: 'Japanese-Style Ginger Soup with Mushrooms and Chicken Breast', lead: 'It\'s still cold out, so I made a warming soup! It\'s lightly seasoned, so adjust the seasoning with salt at the end!' },
    tags: ['chicken', 'soup'],
    image: 'images/kinoko-shoga-soup.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'gyusuji-daikon',
    ja: { title: '牛筋大根', lead: '牛筋と大根はとても相性がよく、一緒に煮るととてもおいしい惣菜になります！ 圧力鍋があればもっと早く、簡単にできます' },
    en: { title: 'Simmered Beef Tendon and Daikon', lead: 'Beef tendon and daikon radish go incredibly well together, making a delicious side dish when simmered together! If you have a pressure cooker, this will be even faster and easier.' },
    tags: ['beef', 'vegetable'],
    image: 'images/gyusuji-daikon.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'saba-dashi-tori-soba',
    ja: { title: '鯖出汁鶏そば', lead: '今回は鯖節で出汁を取って、そばにしてみました！ 鯖節は特に出汁の味が強めで味を感じやすく、あまり調味料を入れなくてもおいしい出汁として飲めるところがとても好きで、おすすめです！ 特にうどんの出汁にも合うと思います！ あまり鯖節だけで売ってるところもないかもですが、その場合はサバやイワシ、マグロなどいろんなものが混ざってるものがおすすめです' },
    en: { title: 'Chicken Soba in Mackerel Dashi', lead: 'This time, I made soba noodles using dashi stock made with mackerel flakes! Mackerel flakes have a particularly strong dashi flavor that\'s easy to detect, and I really love that they can be enjoyed as a delicious dashi without adding much seasoning, so I recommend them! I think they go especially well with udon noodle dashi! Sababushi on its own can be hard to find. If you can\'t get it, a blend of mackerel, sardine and tuna works well.' },
    tags: ['chicken', 'noodle', 'seafood'],
    image: 'images/saba-dashi-tori-soba.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'buri-zuke-ochazuke',
    ja: { title: '鰤漬け丼のお茶漬け', lead: 'おなかの脂がのっている部分を使って、漬け丼のお茶漬けにしました。 脂の旨味をしっかり感じながら、あっさりと食べられるのでお勧めです！' },
    en: { title: 'Marinated Yellowtail Ochazuke', lead: 'I used the fatty belly to make a marinated yellowtail bowl, then poured dashi over it. It\'s recommended because it\'s light and delicious while still allowing you to fully enjoy the umami of the fat!' },
    tags: ['seafood', 'rice', 'pickled'],
    image: 'images/buri-zuke-ochazuke.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'buri-zuke-don',
    ja: { title: '鰤の漬け丼', lead: '久しぶりに鰤を使いました！ 最近は天然よりも養殖のほうが脂がのっていておいしいですね' },
    en: { title: 'Marinated Yellowtail Rice Bowl', lead: 'It\'s been a while since I last used yellowtail!' },
    tags: ['seafood', 'rice', 'pickled'],
    image: 'images/buri-zuke-don.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'niboshi-shoyu-ramen',
    ja: { title: '煮干しと鶏出汁の醤油ラーメン', lead: '寒い時期なので、生姜や柚子の皮を入れてもおいしいと思います！ 煮干しを焼きあごにしたりと、出汁のアレンジもやりやすいと思います！' },
    en: { title: 'Shoyu Ramen in Niboshi and Chicken Dashi', lead: 'Since it\'s cold out, adding ginger or yuzu peel would be delicious! You can vary the dashi easily, for example by swapping the niboshi for grilled flying fish (yaki-ago).' },
    tags: ['chicken', 'seafood', 'noodle'],
    image: 'images/niboshi-shoyu-ramen.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'chutoro-sushi',
    ja: { title: '中とろ寿司', lead: 'あけましておめでとうごさいます! 12月の後半は少し病気をしていて、あまり動画を出せませんでした・・・ もう全快しているので、これからガンガン動画出します！' },
    en: { title: 'Chutoro Sushi (medium fatty tuna)', lead: 'Happy New Year! I was a little sick in the latter half of December, so I wasn\'t able to upload many videos... I\'m fully recovered now, so I\'ll be uploading videos as soon as possible!' },
    tags: ['rice', 'seafood'],
    image: 'images/chutoro-sushi.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
  {
    slug: 'chicken-katsu-amazu',
    ja: { title: 'チキンカツの甘酢', lead: '鶏肉は塩を少し強めに振って、おすすめは3時間以上置いておくことです そうすることで、しっかり下味がついて、ジューシーに仕上がります！' },
    en: { title: 'Chicken Katsu with Sweet Vinegar Sauce', lead: 'Sprinkle a little salt on the chicken and let it sit for at least 3 hours. This will allow the seasoning to infuse and make it juicy!' },
    tags: ['chicken', 'egg'],
    image: 'images/chicken-katsu-amazu.jpg',
    posted: null,
    instagram: null,
    ready: false
  },
];

/* タグの名前と軸。レシピ側は英数字のキーだけを持ち、表示名はここで一元管理する。
   キーを増やしたら必ずここにも日英と軸を足すこと。

   軸を4つに分けているのは、探す人の頭の中がこの順で動くため。
   「鶏肉が余っている」（食材）→「今日は揚げ物の気分」（形式）
   →「弁当に入れたい」（場面）→「15分しかない」（時間）。
   材料の分類だけでは、最後の3つに答えられない。 */
export const TAGS: Record<string, { ja: string; en: string; axis: string }> = {
  /* 食材：材料欄から自動で付けられる。ほぼ間違えない */
  chicken:   { ja: '鶏肉',       en: 'Chicken',        axis: 'food' },
  pork:      { ja: '豚肉',       en: 'Pork',           axis: 'food' },
  beef:      { ja: '牛肉',       en: 'Beef',           axis: 'food' },
  seafood:   { ja: '魚介',       en: 'Seafood',        axis: 'food' },
  egg:       { ja: '卵',         en: 'Egg',            axis: 'food' },
  vegetable: { ja: '野菜',       en: 'Vegetables',     axis: 'food' },
  tofu:      { ja: '豆腐・大豆', en: 'Tofu and soy',   axis: 'food' },

  /* 形式：料理名と材料から判定できる */
  rice:      { ja: 'ごはんもの', en: 'Rice dishes',    axis: 'form' },
  noodle:    { ja: '麺',         en: 'Noodles',        axis: 'form' },
  soup:      { ja: '汁もの',     en: 'Soups',          axis: 'form' },
  fried:     { ja: '揚げもの',   en: 'Fried',          axis: 'form' },
  pickled:   { ja: '漬けもの',   en: 'Pickled',        axis: 'form' },
  onepot:    { ja: '一鍋',       en: 'One pot',        axis: 'form' },

  /* 場面：ハッシュタグと本文のことばから拾う */
  easy:      { ja: 'お手軽',     en: 'Easy',           axis: 'scene' },
  makeahead: { ja: '作り置き',   en: 'Make ahead',     axis: 'scene' },
  bento:     { ja: 'お弁当',     en: 'Bento',          axis: 'scene' },
  snack:     { ja: 'おつまみ',   en: 'With drinks',    axis: 'scene' },

  /* 時間：キャプションに手順と時間が書かれれば自動で付く */
  min15:     { ja: '15分以内',   en: 'Under 15 min',   axis: 'time' },
  min30:     { ja: '30分以内',   en: 'Under 30 min',   axis: 'time' }
};

export const TAG_AXES: Record<string, { ja: string; en: string }> = {
  food:  { ja: '食材',     en: 'Ingredient' },
  form:  { ja: '料理の形', en: 'Type' },
  scene: { ja: '場面',     en: 'Occasion' },
  time:  { ja: '時間',     en: 'Time' }
};

/* 何件そろったらタグを画面に出すか。
   1件しか出ないタグを押させると、押した人をがっかりさせるだけなので伏せておく。
   データとしては持っているので、件数がそろえば自動で表に出る。 */
export const TAG_MIN = 3;
