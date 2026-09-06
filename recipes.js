/* レシピのメタデータ。全ページがここを読んで一覧・検索・並び替えをする。
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
    tags: ["chicken", "vegetable", "fried"],
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
    tags: ["rice", "chicken", "onepot"],
    image: "images/tori-negi-meshi.jpg",
    posted: "2026-09-02",
    instagram: null,
    likes: null,
    comments: null,
    views: null,
    ready: true
  }
];

/* タグの名前。レシピ側は英数字のキーだけを持ち、表示名はここで一元管理する。
   キーを増やしたら必ずここにも日英を足すこと。 */
window.TAGS = {
  rice:      { ja: "ごはん",   en: "Rice" },
  chicken:   { ja: "鶏肉",     en: "Chicken" },
  vegetable: { ja: "野菜",     en: "Vegetables" },
  fried:     { ja: "揚げもの", en: "Fried" },
  onepot:    { ja: "一鍋",     en: "One pot" }
};
