/* レシピのメタデータ。全ページがここを読んで一覧・検索・並び替え・ガチャを作る。
   レシピ本文（分量と手順）は各レシピのHTMLにあり、ここには入れない。

   このファイルは、あとで GitHub Actions が Instagram の数値を
   自動で書き換える対象になる。手で編集するときは形を崩さないこと。

   likes / comments / views が null のものは、まだ取得できていないという意味。
   0 と null は違う。0 と書くと「いいねが0件」という嘘になる。 */

window.RECIPES = [
  {
    slug: "tori-mune-nasu-nanbanzuke",
    ja: { title: "鶏むね肉と茄子の南蛮漬け", lead: "いつもは魚で作る南蛮漬けを、鶏むね肉で。" },
    en: { title: "Chicken Breast and Eggplant Nanban-zuke", lead: "Nanban-zuke, usually made with fish, made with chicken instead." },
    tags: ["chicken", "vegetable", "fried", "pickled"],
    image: "images/tori-mune-nasu-nanbanzuke.jpg",
    posted: "2026-09-06",
    instagram: "https://www.instagram.com/reel/DcaOmyvRcAI/",
    likes: null,
    comments: null,
    views: null,
    ready: false          // 手順がまだ入っていない
  },
  {
    slug: "tori-negi-meshi",
    ja: { title: "鶏ネギ飯", lead: "鶏の脂と醤油だけで、米が主役になります。" },
    en: { title: "Chicken and Green Onion Rice", lead: "Just chicken fat and soy sauce, and the rice becomes the star." },
    tags: ["chicken", "rice", "onepot"],
    image: "images/tori-negi-meshi.jpg",
    posted: "2026-09-02",
    instagram: null,
    likes: null,
    comments: null,
    views: null,
    ready: true
  }
];

/* タグの名前と軸。レシピ側は英数字のキーだけを持ち、表示名はここで一元管理する。
   キーを増やしたら必ずここにも日英と軸を足すこと。

   軸を4つに分けているのは、探す人の頭の中がこの順で動くため。
   「鶏肉が余っている」（食材）→「今日は揚げ物の気分」（形式）
   →「弁当に入れたい」（場面）→「15分しかない」（時間）。
   材料の分類だけでは、最後の3つに答えられない。 */
window.TAGS = {
  /* 食材：材料欄から自動で付けられる。ほぼ間違えない */
  chicken:   { ja: "鶏肉",     en: "Chicken",        axis: "food" },
  pork:      { ja: "豚肉",     en: "Pork",           axis: "food" },
  beef:      { ja: "牛肉",     en: "Beef",           axis: "food" },
  seafood:   { ja: "魚介",     en: "Seafood",        axis: "food" },
  egg:       { ja: "卵",       en: "Egg",            axis: "food" },
  vegetable: { ja: "野菜",     en: "Vegetables",     axis: "food" },
  tofu:      { ja: "豆腐・大豆", en: "Tofu and soy",  axis: "food" },

  /* 形式：料理名と材料から判定できる */
  rice:      { ja: "ごはんもの", en: "Rice dishes",   axis: "form" },
  noodle:    { ja: "麺",       en: "Noodles",        axis: "form" },
  soup:      { ja: "汁もの",   en: "Soups",          axis: "form" },
  fried:     { ja: "揚げもの", en: "Fried",          axis: "form" },
  pickled:   { ja: "漬けもの", en: "Pickled",        axis: "form" },
  onepot:    { ja: "一鍋",     en: "One pot",        axis: "form" },

  /* 場面：ハッシュタグと本文のことばから拾う */
  easy:      { ja: "お手軽",   en: "Easy",           axis: "scene" },
  makeahead: { ja: "作り置き", en: "Make ahead",     axis: "scene" },
  bento:     { ja: "お弁当",   en: "Bento",          axis: "scene" },
  snack:     { ja: "おつまみ", en: "With drinks",    axis: "scene" },

  /* 時間：キャプションに手順と時間が書かれれば自動で付く */
  min15:     { ja: "15分以内", en: "Under 15 min",   axis: "time" },
  min30:     { ja: "30分以内", en: "Under 30 min",   axis: "time" }
};

/* 軸の見出し */
window.TAG_AXES = {
  food:  { ja: "食材",   en: "Ingredient" },
  form:  { ja: "料理の形", en: "Type" },
  scene: { ja: "場面",   en: "Occasion" },
  time:  { ja: "時間",   en: "Time" }
};

/* 何件そろったらタグを画面に出すか。
   1件しか出ないタグを押させると、押した人をがっかりさせるだけなので伏せておく。
   データとしては持っているので、件数がそろえば自動で表に出る。 */
window.TAG_MIN = 3;
