/* このファイルは書き出されたものです。直接編集しないでください。上書きされます。
   人が書く元データ … data/recipes.ts
   取り込んだ数値   … data/instagram.json
   書き出し         … npm run build

   likes などが null は「まだ取り込めていない」の意味。
   0 と null は違う。0 と書くと「いいねが0件」という嘘になる。 */

window.RECIPES = [
  {
    "slug": "hiyashi-tori-katsuo-somen",
    "ja": {
      "title": "冷やし鶏鰹出汁さっぱり素麺",
      "lead": "冷たくてさっぱりした、優しい味の冷やし素麺。鶏と鰹で出汁を取ります。"
    },
    "en": {
      "title": "Chilled Chicken and Bonito Broth Somen Noodles",
      "lead": "Chilled somen with a refreshing, gentle broth made from chicken and bonito."
    },
    "tags": [
      "chicken",
      "noodle"
    ],
    "image": "images/hiyashi-tori-katsuo-somen.jpg",
    "posted": "2026-09-06",
    "instagram": null,
    "ready": false,
    "likes": null,
    "comments": null,
    "views": null,
    "fetchedAt": null
  },
  {
    "slug": "tori-mune-nasu-nanbanzuke",
    "ja": {
      "title": "鶏むね肉と茄子の南蛮漬け",
      "lead": "いつもは魚で作る南蛮漬けを、鶏むね肉で。"
    },
    "en": {
      "title": "Chicken Breast and Eggplant Nanban-zuke",
      "lead": "Nanban-zuke, usually made with fish, made with chicken instead."
    },
    "tags": [
      "chicken",
      "vegetable",
      "fried",
      "pickled"
    ],
    "image": "images/tori-mune-nasu-nanbanzuke.jpg",
    "posted": "2026-09-06",
    "instagram": "https://www.instagram.com/reel/DcaOmyvRcAI/",
    "ready": false,
    "likes": null,
    "comments": null,
    "views": null,
    "fetchedAt": null
  },
  {
    "slug": "tori-negi-meshi",
    "ja": {
      "title": "鶏ネギ飯",
      "lead": "鶏の脂と醤油だけで、米が主役になります。"
    },
    "en": {
      "title": "Chicken and Green Onion Rice",
      "lead": "Just chicken fat and soy sauce, and the rice becomes the star."
    },
    "tags": [
      "chicken",
      "rice",
      "onepot"
    ],
    "image": "images/tori-negi-meshi.jpg",
    "posted": "2026-09-02",
    "instagram": null,
    "ready": true,
    "likes": null,
    "comments": null,
    "views": null,
    "fetchedAt": null
  }
];

window.TAGS = {
  "chicken": {
    "ja": "鶏肉",
    "en": "Chicken",
    "axis": "food"
  },
  "pork": {
    "ja": "豚肉",
    "en": "Pork",
    "axis": "food"
  },
  "beef": {
    "ja": "牛肉",
    "en": "Beef",
    "axis": "food"
  },
  "seafood": {
    "ja": "魚介",
    "en": "Seafood",
    "axis": "food"
  },
  "egg": {
    "ja": "卵",
    "en": "Egg",
    "axis": "food"
  },
  "vegetable": {
    "ja": "野菜",
    "en": "Vegetables",
    "axis": "food"
  },
  "tofu": {
    "ja": "豆腐・大豆",
    "en": "Tofu and soy",
    "axis": "food"
  },
  "rice": {
    "ja": "ごはんもの",
    "en": "Rice dishes",
    "axis": "form"
  },
  "noodle": {
    "ja": "麺",
    "en": "Noodles",
    "axis": "form"
  },
  "soup": {
    "ja": "汁もの",
    "en": "Soups",
    "axis": "form"
  },
  "fried": {
    "ja": "揚げもの",
    "en": "Fried",
    "axis": "form"
  },
  "pickled": {
    "ja": "漬けもの",
    "en": "Pickled",
    "axis": "form"
  },
  "onepot": {
    "ja": "一鍋",
    "en": "One pot",
    "axis": "form"
  },
  "easy": {
    "ja": "お手軽",
    "en": "Easy",
    "axis": "scene"
  },
  "makeahead": {
    "ja": "作り置き",
    "en": "Make ahead",
    "axis": "scene"
  },
  "bento": {
    "ja": "お弁当",
    "en": "Bento",
    "axis": "scene"
  },
  "snack": {
    "ja": "おつまみ",
    "en": "With drinks",
    "axis": "scene"
  },
  "min15": {
    "ja": "15分以内",
    "en": "Under 15 min",
    "axis": "time"
  },
  "min30": {
    "ja": "30分以内",
    "en": "Under 30 min",
    "axis": "time"
  }
};

window.TAG_AXES = {
  "food": {
    "ja": "食材",
    "en": "Ingredient"
  },
  "form": {
    "ja": "料理の形",
    "en": "Type"
  },
  "scene": {
    "ja": "場面",
    "en": "Occasion"
  },
  "time": {
    "ja": "時間",
    "en": "Time"
  }
};

window.TAG_MIN = 3;
