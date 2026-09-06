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
  posted: string;           /* YYYY-MM-DD。新しい順の並びに使う */
  instagram: string | null; /* 投稿のURL。あればレシピページに動画が入る */
  ready: boolean;           /* 手順が入っていれば true */
};

export const RECIPES: Recipe[] = [
  {
    slug: 'hiyashi-tori-katsuo-somen',
    ja: { title: '冷やし鶏鰹出汁さっぱり素麺', lead: '冷たくてさっぱりした、優しい味の冷やし素麺。鶏と鰹で出汁を取ります。' },
    en: { title: 'Chilled Chicken and Bonito Broth Somen Noodles', lead: 'Chilled somen with a refreshing, gentle broth made from chicken and bonito.' },
    tags: ['chicken', 'noodle'],
    image: 'images/hiyashi-tori-katsuo-somen.jpg',
    posted: '2026-09-06',
    instagram: null,
    ready: false
  },
  {
    slug: 'tori-mune-nasu-nanbanzuke',
    ja: { title: '鶏むね肉と茄子の南蛮漬け', lead: 'いつもは魚で作る南蛮漬けを、鶏むね肉で。' },
    en: { title: 'Chicken Breast and Eggplant Nanban-zuke', lead: 'Nanban-zuke, usually made with fish, made with chicken instead.' },
    tags: ['chicken', 'vegetable', 'fried', 'pickled'],
    image: 'images/tori-mune-nasu-nanbanzuke.jpg',
    posted: '2026-09-06',
    instagram: 'https://www.instagram.com/reel/DcaOmyvRcAI/',
    ready: false
  },
  {
    slug: 'tori-negi-meshi',
    ja: { title: '鶏ネギ飯', lead: '鶏の脂と醤油だけで、米が主役になります。' },
    en: { title: 'Chicken and Green Onion Rice', lead: 'Just chicken fat and soy sauce, and the rice becomes the star.' },
    tags: ['chicken', 'rice', 'onepot'],
    image: 'images/tori-negi-meshi.jpg',
    posted: '2026-09-02',
    instagram: null,
    ready: true
  }
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
