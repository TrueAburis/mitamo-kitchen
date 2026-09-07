/* キャプションの日英対訳表。**人が書く側のファイル。**

   何のためにあるか：
   Instagram のキャプションに付いている英文に、意味がずれている箇所がある。
   一番まずいのは、材料名を英語圏の別の商品として読ませてしまう類の間違いで、
   店頭でパッケージと照合するという、このサイトを英語で読む人の一番の目的を
   そのまま壊してしまう。だから「おかしい」で終わらせず、
   **日本語・投稿された英語・直した英語・直した理由**を1件ずつ残す。

   みたもさんに共有するのは、ここから組み立てた docs/phrasebook.html。
   node tools/build-phrasebook.ts で書き出す。

   書き方の約束：
   ・posted は投稿されたままを写す。直さない。直したものは fixed に書く
   ・fixed が null は「投稿のままでよい」の意味。why も null にする
   ・訳が思いつかない・判断がつかないものは fixed を null にして
     verdict を 'watch'、why に「何が分からないか」を書く。
     それらしい英語で埋めない（CLAUDE.md「推測で埋めない」）
   ・投稿に英語が無かった箇所は posted を null にする。空文字にしない */


/** ok=そのままでよい / fix=直す / watch=判断がつかない・保留 */
export type Verdict = 'ok' | 'fix' | 'watch';

/** キャプションのどの部分か。表示の並び順にも使う */
export type Where = 'title' | 'lead' | 'tip' | 'group' | 'ingredient' | 'note';

export type Line = {
  where: Where;
  ja: string;
  /** 投稿された英語。英語が無かった箇所は null */
  posted: string | null;
  /** 直した英語。posted のままでよければ null */
  fixed: string | null;
  /** なぜ直したか。みたもさんが読む文章なので日本語で、1〜2文 */
  why: string | null;
  verdict: Verdict;
};

export type Post = {
  /** サイトのレシピと同じ slug。まだページが無い回は投稿の識別名でよい */
  slug: string;
  titleJa: string;
  /** キャプションの出どころ。tools/fixtures/ のファイル名か、投稿URL */
  source: string;
  /** タイアップの回。サイトへの自動掲載から外れるので、その旨を画面に出す */
  pr?: boolean;
  /** 対訳が無い回に添える説明。省略したら決まり文句が出る */
  note?: string;
  lines: Line[];
};

/** 何度も出てくる言い回しの定訳。ここが対訳表の本体で、
 *  投稿ごとの表は「その定訳がどこで必要になったか」の裏づけ。 */
export type Term = {
  ja: string;
  /** これを使う、という英語 */
  en: string;
  /** 使わない英語。実際に投稿で使われたものを入れる。
   *  部分一致で数えるので、"we" のような短い語は入れない（sweet に当たってしまう）。
   *  そういうものは投稿から引いた一節をそのまま入れる。 */
  avoid: string[];
  why: string;
  /** 省略したら「材料と部位の名前」。言い回し・料理名のほうだけ 'phrase' と書く */
  kind?: 'ingredient' | 'phrase';
};


export const TERMS: Term[] = [
  {
    ja: '薄口醤油',
    en: 'usukuchi soy sauce (lighter in color, saltier)',
    avoid: ['light soy sauce'],
    why: '英語で light と付くと「減塩」と読まれる。薄口は濃口より塩分が高いので、意味が逆になる。色が薄いだけだと分かる書き方にする。'
  },
  {
    ja: '濃口醤油',
    en: 'koikuchi soy sauce (the standard Japanese soy sauce)',
    avoid: ['dark soy sauce'],
    why: 'dark soy sauce は中国の老抽（とろみのある甘い別物）を指す。海外の売り場でその瓶を買われると、味が別の料理になる。'
  },
  {
    ja: '出汁ガラ',
    en: 'the spent kombu and bonito (the solids left after straining)',
    avoid: ['After removing the dashi stock', 'remove the dashi stock'],
    why: '「出汁ガラを引き上げる」を the dashi stock を取り除く、と訳すと、取っておくべき出汁のほうを捨てる指示になる。作れなくなる種類の間違い。',
    kind: 'phrase'
  },
  {
    ja: '出汁',
    en: 'dashi',
    avoid: ['broth', 'soup stock'],
    why: 'dashi はすでに英語で通じる語で、このチャンネルの中心でもある。broth に置き換えると鶏ガラスープと区別がつかなくなり、検索でも拾われない。'
  },
  {
    ja: '昆布',
    en: 'kombu (dried kelp)',
    avoid: ['kombu seaweed', 'Kombu (kelp)', 'Kelp'],
    why: '8回の投稿に出てきて、書き方が5通りになっている（kombu seaweed / Kombu (dried kelp) / Kombu (kelp) / Kelp / kelp）。seaweed だと海苔やわかめの棚を探すことになり、kelp だけでは商品名として探せない。kombu を主にして dried kelp を添えれば売り場にたどり着ける。サイトの材料辞書もこの表記にそろえてある。'
  },
  {
    ja: '粗熱が取れたら',
    en: 'once it has cooled to just warm',
    avoid: ['once it has cooled down'],
    why: 'cooled down だと冷蔵庫まで冷やしてよいと読める。粗熱は「湯気が引いて、まだほんのり温かい」ところなので、仕上がりが変わる。',
    kind: 'phrase'
  },
  {
    ja: 'ザラメ糖',
    en: 'zarame (coarse raw sugar)',
    avoid: ['Coarse sugar (Zarame)'],
    why: '間違いではないが、主と従が逆。商品名として探すのは zarame のほうなので、日本語名を先に出す。'
  },
  {
    ja: '南蛮漬け',
    en: 'nanbanzuke (fried, then marinated in sweet vinegar)',
    avoid: ['marinated fried dish'],
    why: '料理名は残す。何をした料理かを括弧で一度だけ添えれば、以降は nanbanzuke で通じる。',
    kind: 'phrase'
  },
  {
    ja: 'しんなり / しゃきしゃき',
    en: 'softened / still crisp',
    avoid: ['tender and soft'],
    why: '食感の対比が南蛮漬けの選択肢そのものなので、一般語ではなく、対になる語で書く。',
    kind: 'phrase'
  },
  {
    ja: '長ネギ',
    en: 'negi (Japanese long onion)',
    avoid: ['leek'],
    why: 'leek（ポロねぎ）は別の野菜で、太さも甘みも火の通り方も違う。鴨蕎麦の回は、材料表では Long green onion (negi) と正しく書けているのに、タイトルだけ Leek になっていた。なお青ネギ・小葱は green onion / scallion でよい。長ネギと青ネギが同じ英語になると、鯖そばの回のように両方が入っている回で見分けがつかなくなる。'
  },
  {
    ja: '鴨ロース / 合鴨ロース',
    en: 'duck breast',
    avoid: ['duck loin', 'magret', 'roast duck'],
    why: '英語に duck loin という部位の売り方は無い。magret はフォアグラ用の品種の胸肉を指す別物で、roast duck は焼いた出来合いのもの。買ってほしいのは生の胸肉なので duck breast。合鴨なら (aigamo) と添える。'
  },
  {
    ja: 'チャーシュー',
    en: 'chashu (braised pork)',
    avoid: ['char siu (roast pork)'],
    why: '中国の叉焼（char siu）は焼くもの。この回は煮汁が出るとおり煮ているので、作り方そのものが変わってしまう。日本のチャーシューは chashu で通っている。',
    kind: 'phrase'
  },
  {
    ja: '〜ブロック（かたまり肉）',
    en: 'in one piece',
    avoid: ['Pork shoulder block'],
    why: 'block は和製英語で、英語の肉売り場では通じない。500g pork shoulder, in one piece のように書けば、切り分けずに買うことが伝わる。'
  },
  {
    ja: 'カルビ',
    en: 'beef short rib (kalbi)',
    avoid: ['Beef Ribs', 'beef ribs'],
    why: '英語の beef ribs は骨付きの大きなあばら肉（BBQで長時間焼くもの）で、焼肉のカルビとは切り方も焼き方も違う。kalbi は韓国焼肉の語として英語圏でも通じる。'
  },
  {
    ja: '新玉ねぎ',
    en: 'new-season onion (sweet and mild)',
    avoid: ['new onions'],
    why: 'new onions は英語として通じない。甘くて水分が多い、出はじめの玉ねぎだと分かる書き方にする。'
  },
  {
    ja: '合（米）',
    en: 'go (the 180ml rice-cooker cup)',
    avoid: ['2 cups (300g)'],
    why: '1合は180mlで、英語の1カップ（240ml）とは別。2 cups と書くと約370gになり、300g という数字と食い違う。300g rice (2 go) のように、gを主にして合を添えると誤解が起きない。'
  },
  {
    ja: '生（の）',
    en: 'raw',
    avoid: ['fresh octopus'],
    why: '日本語の「生」は raw。fresh は「新鮮」で別の意味になる。タコ飯の回は、書き出しで fresh octopus と書きながら、本文では raw octopus と書いていて、同じ投稿の中で食い違っていた。この回は「茹でダコではなく生タコ」が話の中心なので、raw でないと成立しない。',
    kind: 'phrase'
  },
  {
    ja: '甘辛',
    en: 'sweet-savory (soy and sugar)',
    avoid: ['Sweet and Spicy', 'sweet and spicy'],
    why: '甘辛の「辛」は塩気のことで、辛さではない。spicy と書くと唐辛子の辛い料理を期待される。カルビの回は豆板醤が小さじ1入っているので少し辛みはあるが、それは「甘辛」の意味ではないので、辛さに触れたいなら別に書く。',
    kind: 'phrase'
  },
  {
    ja: 'きび砂糖',
    en: 'kibizato (unrefined cane sugar)',
    avoid: ['brown sugar'],
    why: '英語の brown sugar は、精製した砂糖に糖蜜を戻したもので、味も色も強い。きび砂糖はサトウキビの風味が残る、もっと穏やかな砂糖。置き換えるとスープの甘さの質が変わる。'
  },
  {
    ja: '柚子胡椒',
    en: 'yuzu kosho (yuzu and chili paste)',
    avoid: ['Yuzu pepper'],
    why: '柚子胡椒に胡椒（pepper）は入っていない。青唐辛子と柚子の皮と塩を練ったもの。Yuzu pepper だと胡椒味を想像されるうえ、売り場でも探せない。'
  },
  {
    ja: '鯖節',
    en: 'sababushi (dried mackerel flakes)',
    avoid: [],
    why: '鰹節が bonito flakes なら、鯖節は日本語名を主にして dried mackerel flakes を添える。この回は鯖節そのものが話の中心なので、商品名として探せる形にしておきたい。'
  },
  {
    ja: '大葉',
    en: 'shiso (perilla leaves)',
    avoid: [],
    why: '鶏ネギ飯の回は perilla leaves、鰤の漬け丼の回は shiso leaves と2通りになっている。売り場のパックには shiso と書かれていることが多いので、shiso を主にして perilla を添える。'
  },
  {
    ja: '赤しゃり',
    en: 'akashari (sushi rice made with red vinegar)',
    avoid: ['Red Rice'],
    why: '英語の red rice は赤米という別の米を指す。赤しゃりは白い米を赤酢で調味したもので、米そのものは赤くない。',
    kind: 'phrase'
  },
  {
    ja: '漬け（漬け丼・漬けダレ）',
    en: 'marinated / marinade',
    avoid: ['Pickled Yellowtail', 'pickled rice bowl', 'Maru Sauce'],
    why: '魚の「漬け」は醤油に浸けることなので marinated。pickled は酢や塩水で保存する漬物のことで、別の料理になる。鰤の2回は、同じ「漬け」がいっぽうで Pickled、いっぽうで Marinated と割れていた。なお野菜の甘酢漬けは pickled でよい。',
    kind: 'phrase'
  },
  {
    ja: '一人称は I にそろえる',
    en: 'I',
    avoid: ['We marinated', "we've made", 'we used'],
    why: '作っているのは1人なので、英語では I。カルビとステーキ丼の回で We になっていて、ステーキ丼は1つの文の中で we と I が混ざっている。読み手には「チームで作っているのか、1人なのか」が分からなくなる。',
    kind: 'phrase'
  }
];


/* ---- 推奨テンプレート ----

   いただいた20回のキャプションから、崩れやすい箇所と、
   取り込みが実際に失敗した箇所を洗い出して作った型。

   目印の行（【レシピ】[Recipe] など）は、いま動いているものを変えていない。
   動いている目印を変えると、過去の投稿を取り込み直せなくなるため。
   新しく足したのは【作り方】と [Steps] の2つだけ。 */

export const TEMPLATE = `【日本語のタイトル】

料理の紹介（1段落。タイトルとのあいだに空行を1つ）

コツ（1段落）

コツ（1段落）

【レシピ】
材料名 分量
材料名 分量

☆タレの名前☆
材料名 分量

【作り方】
1. 手順
2. 手順

[English Title]

Intro (the same paragraph as above)

Tip

Tip

[Recipe]
qty ingredient
qty ingredient

☆Sauce name☆
qty ingredient

[Steps]
1. step
2. step

#料理 #cooking #food #みたもっちゃんねる`;

export const TEMPLATE_RULES: { title: string; body: string }[] = [
  {
    title: 'タイトルのあとに、空行を1つ入れる',
    body: 'Instagram はキャプションの1行目をアカウント名と同じ行に並べて表示するので、タイトルが本文の書き出しにくっついて見えます。あいだに空行を1つ入れると、タイトルが見出しとして立ちます。タコ飯の回だけこの形になっていて、20回のうちで一番読みやすくなっていました。取り込みには影響しません（空行があっても書き出しは正しく拾えることを確認しました）。'
  },
  {
    title: '目印の行は、その文字だけにする',
    body: '【レシピ】【作り方】[Recipe] [Steps] の4つは、行にその文字だけを書いてください。人数や補足は次の行に。いま2回、これで取り込みが壊れています。ラーメンの回は [Recipe] のうしろに材料が続いていたため、英語の材料が丸ごと取り込めず、英語の行が日本語の材料表に混ざりました。鯖そばの回は【レシピ】2人前 と [Recipe] Serves 2 の両方が同じ行だったので、日本語の材料も英語の材料も、どちらも1品も取り込めませんでした（どちらも実際に試して確認しました）。'
  },
  {
    title: '日本語をひとまとめ、そのあと英語をひとまとめ',
    body: '日本語の読者も英語の読者も、途中で別の言語をまたがずに読めます。いまの取り込みもこの形に合わせてあります。ブロックごとに英語を挟む形（タイトル→タイトル英→本文→本文英…）にもできますが、その場合はこちら側の取り込みを直します。どちらがよいか決めていただければ合わせます。'
  },
  {
    title: '段落の数を、日本語と英語でそろえる',
    body: '1段落目がサイトの書き出し、2段落目からが「コツ」の欄になります。順番で日英を突き合わせるので、日本語3段落・英語2段落だと、コツと英文の対応が1つずれます。段落は空行で区切ってください。'
  },
  {
    title: '材料は1行1品。日本語は「名前 分量」、英語は「分量 名前」',
    body: 'コロンで区切る書き方（Water: 1 L）は避けてください。材料名に「:」が残り、分量のない Long green onion (negi) が材料ではなく注記として扱われて、表から落ちます（鴨蕎麦の回で確認しました）。素麺の回の 700ml water の形が、いちばん確実です。'
  },
  {
    title: 'タレの見出しは、かならず ☆ で囲む',
    body: '☆タレ☆ の形だけがタレの見出しとして認識されます。ステーキ丼の回の 〜ソース〜 は認識されず、「〜ソース〜」という名前の材料として表に並んでしまいます（確認しました）。英語側にも同じ位置に ☆Sauce☆ を置いてください。'
  },
  {
    title: '分量は、書けないものを埋めない',
    body: '分からない分量は空欄のままで大丈夫です。適当な数字で埋めると、そのまま公開されてしまいます。なお「塩で味を調節」のような書き方は、材料ではなく注意書きとして扱われます。分量の欄に出したいときは「塩 適量」と書いてください。'
  },
  {
    title: '手順は1行1手順、行頭に番号',
    body: 'いただいた20回とも、キャプションに手順がありませんでした。手順が入ると、このサイトが本来やりたいこと（動画を見たあと、分量を見ながら作る）が成立します。Google のレシピ検索に出せるようになるのも、手順がそろってからです。待ち時間は「30分」のように数字で書いていただけると、サイトが時間の目盛りとして出せます。'
  },
  {
    title: 'アスタリスクは使わない',
    body: '*Nanban-zuke* と書いても Instagram では斜体にならず、* がそのまま出ます。強調したい語は、括弧で説明を添えるだけにしてください。日本語の ※ を英語側で * に置き換えるのも避けてください（鶏ネギ飯の回がこの形でした）。英語では Note: と書くのが自然です。'
  },
  {
    title: 'ハッシュタグは最後の行に。タイアップの回は #PR を',
    body: 'ハッシュタグは最後にまとめてください。タイアップの回は #PR を必ず付けてください。サイトの自動掲載から外す判定に使っています。契約の範囲が案件ごとに違うので、載せると決めた回だけ手で足す作りにしてあります。'
  }
];

/** 記入例。鴨ネギ蕎麦を、テンプレートの形と定訳で書き直したもの */
export const EXAMPLE = `【鴨ネギ蕎麦】

出汁から鴨葱蕎麦を作ってみました

和風出汁、鴨、ネギ、そして蕎麦の風味は相性がよく、1杯にまとめることでおいしさが倍増します！

今はなかなか鴨ロースを売っている場所がありませんが、もし手に入れることができたら試してみてください

【レシピ】
水 1L
昆布 10g
鰹節 20g

みりん 100ml
濃口醤油 大さじ2
薄口醤油 大さじ3
生姜スライス 10g
塩 適量

合鴨ロース 1枚
長ネギ
小葱
七味唐辛子 お好みで

【作り方】
1.
2.

[Duck and Negi Soba]

I made duck and negi soba from scratch, starting with the dashi.

The dashi, the duck, the negi and the soba all suit each other, and in one bowl they add up to more than the parts.

Duck breast can be hard to find these days, but if you can get hold of some, please give it a try.

[Recipe]
1L water
10g kombu (dried kelp)
20g bonito flakes

100ml mirin
2 tbsp koikuchi soy sauce (the standard Japanese soy sauce)
3 tbsp usukuchi soy sauce (lighter in color, saltier)
10g sliced ginger
salt, to taste

1 duck breast (aigamo)
negi (Japanese long onion)
thinly sliced scallions
shichimi togarashi, optional

[Steps]
1.
2.

#料理 #cooking #food #みたもっちゃんねる`;

/** 記入例で、あえて空けたところの説明 */
export const EXAMPLE_NOTES: string[] = [
  '【作り方】と [Steps] は枠だけにしてあります。この回はキャプションに手順が無かったので、こちらで書き足していません。',
  '「鴨もタイミングはいつでもいいので、切った後は再度塩を振りましょう」の1文は、意味を確認したいので入れていません（下の「聞きたいこと」）。',
  '「塩で味を調節」だけ「塩 適量」に書き換えました。分量の無かった長ネギと小葱は、分量が分からないので空欄のままにしてあります。こちらで数字を作らないためです。'
];


/** みたもさんに聞きたいこと。答えが返ったら消して、対訳のほうに反映する */
export const ASKS: { q: string; note: string }[] = [
  {
    q: 'エビクリームパスタの回の「パナメ海老」は、「バナメイエビ」でしょうか。',
    note: '英語では prawns と書かれていて、品種の情報が落ちています。バナメイであれば vannamei と書けます。'
  },
  {
    q: '牛筋大根の「余った出汁」は、引いた和風だしの残りでしょうか。牛筋を煮た煮汁のほうでしょうか。',
    note: 'ラーメンに使うという話なので煮汁かとも思いましたが、決めずに置いてあります。英語では leftover dashi と the braising liquid で書き分けます。'
  },
  {
    q: 'タコ飯の回の「ほんだじ」は、「ほんだし」の打ち間違いでしょうか。',
    note: '英語側は Hondashi (dashi granules) と正しく書けています。日本語のほうがサイトの材料名になるので、直してよいか教えてください。'
  },
  {
    q: '鴨蕎麦の「鴨もタイミングはいつでもいいので、切った後は再度塩を振りましょう」は、どちらの意味でしょうか。',
    note: '英文は「鴨はいつ鍋に入れてもよい」と読めますが、日本語は「塩を振るタイミングはいつでもよい」とも読めます（「再度」とあるので後者かと思っています）。作り方が変わる箇所なので、こちらで決めずに置いてあります。'
  },
  {
    q: '南蛮漬けの「和風だし 100ml」は、市販の顆粒だしですか。それとも同じ回で引いた出汁を取り分けたものですか。',
    note: '前者なら instant dashi、後者なら the dashi from above と書き分けます。いまはどちらとも決めずに置いてあります。'
  },
  {
    q: '南蛮漬けの鶏むね肉は、何gくらいでしたか。',
    note: 'キャプションに分量が無かったので、日本語も英語も空欄のままにしてあります。'
  },
  {
    q: '英文は、みたもさんが書かれていますか。翻訳にかけたものでしょうか。',
    note: '翻訳にかけているなら、上の定訳をそのまま貼れる形にしてお渡しします。手で書かれているなら、直すのは言い回しだけで済みます。'
  }
];


/** 更新履歴。みたもさんが前に見たときから何が変わったかだけを書く */
export const LOG: { date: string; text: string }[] = [
  {
    date: '2026-09-07',
    text: 'パスタ・生姜スープ・牛筋大根・鯖そば・鰤2回・煮干しラーメン・中とろ寿司・チキンカツ・カニ玉うどんの10回分を追加。定訳が25件に。いちばん下に、見終わったキャプションの一覧を足した'
  },
  {
    date: '2026-09-07',
    text: '照り焼き・牛カルビ・タコ飯・ステーキ丼・鶏ネギ飯の5回分を追加。定訳が19件に。テンプレートに「タイトルの後ろに空行」「タレの見出しは ☆ で囲む」を足した。あわせて、すでにサイトに載っている英語（leek・2 cups・light soy sauce など）を定訳に合わせて直した'
  },
  {
    date: '2026-09-07',
    text: '「推奨テンプレート」の節を追加。次からのキャプションの型と、鴨ネギ蕎麦を書き直した記入例を載せた'
  },
  {
    date: '2026-09-07',
    text: '鴨ネギ蕎麦とチャーシューラーメンの2回分を追加。定訳を4件足した（長ネギ・鴨ロース・チャーシュー・ブロック肉）'
  },
  {
    date: '2026-09-07',
    text: '対訳表を作成。素麺と南蛮漬けの2回分を突き合わせ、定訳9件をまとめた'
  }
];


export const POSTS: Post[] = [
  {
    slug: 'hiyashi-tori-katsuo-somen',
    titleJa: '冷やし鶏鰹出汁さっぱり素麺',
    source: 'tools/fixtures/somen.txt',
    lines: [
      {
        where: 'title',
        ja: '冷やし鶏鰹出汁さっぱり素麺',
        posted: 'Chilled Chicken and Bonito Broth Somen Noodles',
        fixed: 'Chilled Somen in Chicken and Bonito Dashi',
        why: 'Broth を Dashi に。このチャンネルが出汁の話をしている以上、英語でも dashi と名乗ったほうが伝わるし、検索でも拾われる。',
        verdict: 'fix'
      },
      {
        where: 'lead',
        ja: '熱くなってきたので、冷たくてさっぱりした優しい味の冷やし素麺作りました！',
        posted: "It's getting hot, so I made chilled somen noodles with a refreshing and gentle flavor!",
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'lead',
        ja: '少し薄味なので、もしもっと味が欲しいなって人は、濃口醤油を追加するといいかもです',
        posted: "It's a little lightly seasoned, so if you want more flavor, you might want to add some dark soy sauce.",
        fixed: 'The seasoning is on the light side, so add a splash of koikuchi (regular) soy sauce if you want it stronger.',
        why: 'dark soy sauce は中国の老抽を指してしまう。あわせて a little lightly seasoned は控えめの言い方が二重になっているので1つにした。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '鶏でも出汁を取るので心配な人も多いですが、鶏の脂はそこまで固まらないと思います',
        posted: "Many people are worried because the broth is made with chicken, but I don't think the chicken fat will solidify that much.",
        fixed: "Since the dashi is made partly from chicken, people worry the fat will set as it chills. In my experience it doesn't, not much.",
        why: '英文だと「何が心配なのか」が抜けていて、読む人が推測することになる。冷やすと脂が固まるのでは、という心配だと書いた。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '素麺は表記されている時間よりも短く茹でてます！茹で具合はお好みで！',
        posted: 'I boiled the somen noodles for less time than indicated on the package! Adjust the cooking time to your liking!',
        fixed: 'I cook the somen a little short of the time on the package. Adjust it to your liking.',
        why: '日本語は「いつもそうしている」だが、英語の過去形だとその日1回の話になる。毎回の作り方として読ませたいので現在形にした。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: 'オクラは生でも食べられます。ですが大きく育っていて固いものは、茹でて柔らかくしたほうが食べやすいです',
        posted: 'Okra can be eaten raw. However, if it has grown large and become tough, it is easier to eat after boiling it until tender.',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'ingredient',
        ja: '薄口醤油 50ml',
        posted: '50ml light soy sauce',
        fixed: '50ml usukuchi soy sauce (lighter in color, saltier)',
        why: '定訳のとおり。減塩醤油と取り違えられると、味が決まらないうえに理由も分からない。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '昆布 10g',
        posted: '10g kombu seaweed',
        fixed: '10g kombu (dried kelp)',
        why: 'サイトの材料辞書と表記をそろえた。売り場を間違えないようにする書き方。',
        verdict: 'fix'
      },
      {
        where: 'note',
        ja: '出汁ガラを引き上げ後',
        posted: 'After removing the dashi stock',
        fixed: 'After lifting out the spent kombu and chicken',
        why: 'いま英文は「出汁（液体）を取り除いたあと」と読める。取っておくほうを捨てる指示になっていて、この回でいちばん直すべき箇所。',
        verdict: 'fix'
      },
      {
        where: 'group',
        ja: 'みょうがの甘酢漬け',
        posted: 'Sweet and sour pickled myoga ginger',
        fixed: 'Quick-pickled myoga in sweet vinegar',
        why: 'sweet and sour は酢豚の味付けを連想させる。甘酢漬けは漬け汁の話なので、そう書いたほうが近い。',
        verdict: 'fix'
      }
    ]
  },

  {
    slug: 'tori-mune-nasu-nanbanzuke',
    titleJa: '鶏むね肉と茄子の南蛮漬け',
    source: 'tools/fixtures/nanbanzuke.txt',
    lines: [
      {
        where: 'title',
        ja: '鶏むね肉と茄子の南蛮漬け',
        posted: 'Chicken Breast and Eggplant Nanban-zuke',
        fixed: 'Chicken Breast and Eggplant Nanbanzuke',
        why: '中の横棒を外しただけ。検索されるときは nanbanzuke と続けて打たれることが多いので、表記をひとつに決めておきたい。',
        verdict: 'fix'
      },
      {
        where: 'lead',
        ja: 'いつもは魚で南蛮漬けを作るのですが、今回はお肉でやってみました！',
        posted: 'I usually make *Nanban-zuke* (marinated fried dish) with fish, but this time I decided to try it with meat!',
        fixed: 'I usually make nanbanzuke (fried, then marinated in sweet vinegar) with fish, but this time I tried it with meat.',
        why: 'アスタリスクは Instagram では斜体にならず、* がそのまま出る。あわせて marinated fried dish だと何の料理か分からないので、甘酢に漬けると書いた。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '甘酢のタレは、しんなりした野菜を食べたければ温かいうちに。',
        posted: 'If you prefer the vegetables to be tender and soft, add them to the sweet-and-sour sauce while it is still warm.',
        fixed: 'For softened vegetables, add them to the sweet vinegar while it is still warm.',
        why: '次の文と対になる箇所なので、softened / still crisp で言い分けた。tender and soft は同じ意味を2回言っている。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: 'しゃきしゃきとした食感で食べたければ、タレの粗熱が取れてから入れてください',
        posted: 'If you prefer a crisp texture, wait until the sauce has cooled down before adding them.',
        fixed: 'For a crisp texture, wait until the sauce has cooled to just warm, then add them.',
        why: 'cooled down だと冷蔵庫まで冷やしてよいと読める。粗熱が取れた状態＝まだ温かい、と書き分けた。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: 'また、茄子のちょうどいい揚げ具合は、箸を刺してみて、スッと刺されば引き上げ時です！',
        posted: "As for the eggplant, the perfect frying point is when you can easily pierce it with a chopstick—that's the time to take it out!",
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'ingredient',
        ja: '鶏むね肉',
        posted: 'Chicken breast',
        fixed: null,
        why: '英語は合っている。分量がキャプションに無いので、日英そろって空欄のまま。何gか分かれば両方に足す。',
        verdict: 'watch'
      },
      {
        where: 'ingredient',
        ja: 'ザラメ糖 大さじ２',
        posted: 'Coarse sugar (Zarame) (2 tbsp)',
        fixed: '2 tbsp zarame (coarse raw sugar)',
        why: '探すときの手がかりは zarame のほうなので、日本語名を先に出した。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '薄口醤油 大さじ２',
        posted: 'Light soy sauce (2 tbsp)',
        fixed: '2 tbsp usukuchi soy sauce (lighter in color, saltier)',
        why: '素麺の回と同じ。薄口が2回出てきているので、表記を1つに決めておきたい。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '和風だし 100ml',
        posted: 'Japanese dashi stock (100ml)',
        fixed: null,
        why: '市販の顆粒だしのことか、この回で引いた出汁を取り分けたものかで英語が変わる。前者なら instant dashi、後者なら the dashi from above。どちらか教えてほしい。',
        verdict: 'watch'
      }
    ]
  },

  {
    slug: 'kamo-negi-soba',
    titleJa: '鴨ネギ蕎麦',
    source: 'tools/fixtures/kamo-negi-soba.txt',
    lines: [
      {
        where: 'title',
        ja: '鴨ネギ蕎麦',
        posted: 'Duck and Leek Soba',
        fixed: 'Duck and Negi Soba',
        why: '長ネギは leek（ポロねぎ）ではありません。同じ投稿の材料表では Long green onion (negi) と正しく書けているので、タイトルだけそろえれば済みます。',
        verdict: 'fix'
      },
      {
        where: 'lead',
        ja: '出汁から鴨葱蕎麦を作ってみました',
        posted: 'I tried making duck and leek soba from scratch, starting with the dashi broth.',
        fixed: 'I made duck and negi soba from scratch, starting with the dashi.',
        why: 'dashi broth は「出汁スープ」で意味が重なっています。dashi だけで通じます。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '和風出汁、鴨、ネギ、そして蕎麦の風味は相性がよく、1杯にまとめることでおいしさが倍増します！',
        posted: 'The Japanese-style dashi, duck, leeks, and soba noodles pair beautifully; combining them all in one bowl makes the flavor truly exceptional!',
        fixed: 'The dashi, the duck, the negi and the soba all suit each other, and in one bowl they add up to more than the parts.',
        why: 'pair は2つのものに使う語なので、4つ並べると英語として引っかかります。Japanese-style dashi も「和風の和風出汁」になっています。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '今はなかなか鴨ロースを売っている場所がありませんが、もし手に入れることがてきたら試してみてください',
        posted: 'It can be hard to find duck loin for sale these days, but if you manage to get your hands on some, please give this recipe a try.',
        fixed: 'Duck breast can be hard to find these days, but if you can get hold of some, please give it a try.',
        why: 'duck loin という部位名は英語にありません。ここも材料表では Duck breast と書けているので、本文だけ直せばそろいます。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: 'スープの味は、最後は塩で調節してください。鴨もタイミングはいつでもいいので、切った後は再度塩を振りましょう',
        posted: 'Adjust the final taste of the soup with salt. You can add the duck at any point during cooking, but be sure to sprinkle a little salt on the meat after slicing it.',
        fixed: null,
        why: '英文は「鴨はいつ鍋に入れてもよい」と読めますが、日本語は「塩を振るタイミングはいつでもよい」とも読めます。作り方が変わるので、どちらの意味か教えてください。',
        verdict: 'watch'
      },
      {
        where: 'ingredient',
        ja: '昆布 10g',
        posted: 'Kombu (kelp): 10 g',
        fixed: '10g kombu (dried kelp)',
        why: '昆布の英語が、素麺は kombu seaweed、南蛮漬けは Kombu (dried kelp)、この回は Kombu (kelp)、ラーメンは Kelp と、4回で4通りになっています。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '濃口醤油 大さじ２',
        posted: 'Dark soy sauce: 2 tbsp',
        fixed: '2 tbsp koikuchi soy sauce (the standard Japanese soy sauce)',
        why: '濃口が dark soy sauce と書かれるのは3回目です。この回は薄口と並んでいるので、light と dark が対に見えて、いっそう紛らわしくなっています。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '薄口醤油 大さじ３',
        posted: 'Light soy sauce: 3 tbsp',
        fixed: '3 tbsp usukuchi soy sauce (lighter in color, saltier)',
        why: '同じく3回目。濃口より多い量が入るので、減塩醤油と取り違えられると味が決まりません。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '合鴨ロース 1枚',
        posted: 'Duck breast (magret/roast duck): 1 piece',
        fixed: '1 duck breast (aigamo)',
        why: 'magret はフォアグラ用の品種の胸肉、roast duck は焼いた出来合いのもので、どちらも別物です。合鴨なら aigamo と添えるだけで足ります。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '長ネギ',
        posted: 'Long green onion (negi)',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'ingredient',
        ja: 'お好みで七味唐辛子',
        posted: 'Shichimi togarashi (Japanese seven-spice blend) – optional',
        fixed: null,
        why: null,
        verdict: 'ok'
      }
    ]
  },

  {
    slug: 'chashu-ramen',
    titleJa: 'チャーシューラーメン',
    source: 'tools/fixtures/chashu-ramen.txt',
    lines: [
      {
        where: 'title',
        ja: 'チャーシューラーメン',
        posted: 'Char Siu Ramen',
        fixed: 'Chashu Ramen',
        why: 'char siu は中国の叉焼で、焼いて作るものです。この回は煮ているので、別の料理名になっています。',
        verdict: 'fix'
      },
      {
        where: 'lead',
        ja: 'チャ―シューを作る過程で出来た煮汁や漬けダレを使ってラーメンを作ってみました',
        posted: 'I tried making ramen using the broth and marinade left over from making char siu (roast pork).',
        fixed: 'I made ramen with the braising liquid and marinade left over from making chashu (braised pork).',
        why: '(roast pork)＝焼き豚ですが、この回は煮ています。同じ文の中で「煮汁を使う」と言っているので、英語だけ辻褄が合っていません。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '自分は福岡出身で、甘めの醤油ラーメンは好きですが、関東や関西の人にとっては甘すぎるかもしれません',
        posted: "I'm from Fukuoka, and I like sweet soy sauce ramen, but it might be too sweet for people from the Kanto or Kansai regions.",
        fixed: "I'm from Fukuoka, so I like my soy sauce ramen on the sweet side. It may be too sweet if you're used to Kanto or Kansai (Tokyo, Osaka) seasoning.",
        why: '「甘め」は sweet ではなく on the sweet side です。ここは程度の話なので、断定すると別の料理に聞こえます。関東・関西は海外の人に通じないので、都市名を添えました。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '甘いなと思ったら、醤油と水などを使って調節してください',
        posted: 'If you find it too sweet, adjust the taste by adding soy sauce and water.',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'ingredient',
        ja: '豚肩ロースブロック 500g',
        posted: 'Pork shoulder block 500g',
        fixed: '500g pork shoulder, in one piece',
        why: 'block は和製英語で、英語の肉売り場では通じません。かたまりで買ってほしいことは in one piece で伝わります。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '長ネギ 先の部分',
        posted: 'Green onion, tip',
        fixed: 'the green tops of a negi (Japanese long onion)',
        why: 'tip だけだと「先端を少しだけ」に読めます。使うのは青い部分なので、そう書いたほうが同じものが手に入ります。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '昆布 15g',
        posted: 'Kelp 15g',
        fixed: '15g kombu (dried kelp)',
        why: 'kelp だけだと、売り場で商品名として探せません。4通りある昆布の書き方のうち、これがいちばん見つけにくい形です。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '濃口醤油 200ml',
        posted: 'Dark soy sauce 200ml',
        fixed: '200ml koikuchi soy sauce (the standard Japanese soy sauce)',
        why: '4回目です。この回は200mlと量が多いので、中国の老抽を買われると仕上がりが完全に別物になります。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: 'ザラメ糖 大さじ4',
        posted: 'Coarse sugar 4 tablespoons',
        fixed: '4 tbsp zarame (coarse raw sugar)',
        why: 'この回は zarame という語自体が落ちています。南蛮漬けの回には入っていたので、表記をそろえたいです。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '煮汁 400ml',
        posted: 'Braising liquid 400ml',
        fixed: null,
        why: null,
        verdict: 'ok'
      }
    ]
  },

  {
    slug: 'gyu-karubi-tare',
    titleJa: '牛カルビ 甘辛たれ漬け',
    source: 'tools/fixtures/gyu-karubi-tare.txt',
    lines: [
      {
        where: 'title',
        ja: '牛カルビ 甘辛たれ漬け',
        posted: 'Beef Ribs Marinated in Sweet and Spicy Sauce',
        fixed: 'Sweet-Savory Marinated Beef Short Rib (Kalbi)',
        why: '英語の beef ribs は骨付きの大きなあばら肉で、焼肉のカルビとは別の部位です。甘辛は「甘じょっぱい」で、辛いという意味ではありません。',
        verdict: 'fix'
      },
      {
        where: 'lead',
        ja: '黒毛和牛カルビを甘辛いタレにつけて、すき焼き風焼き肉にしてみました！',
        posted: 'We marinated Japanese Black Wagyu beef ribs in a sweet and spicy sauce to create a sukiyaki-style yakiniku!',
        fixed: 'I marinated Japanese Black wagyu short rib in a sweet-savory sauce, for a sukiyaki-flavored yakiniku.',
        why: '作っているのは1人なので We ではなく I。部位と「甘辛」は上と同じ理由です。',
        verdict: 'fix'
      },
      {
        where: 'lead',
        ja: '下味なので、漬けた後に焼き肉のたれで食べてもおいしいです！',
        posted: "Since it's a pre-seasoning, it's also delicious when eaten with yakiniku sauce after marinating!",
        fixed: 'This is a marinade rather than a dipping sauce, so it is also good with yakiniku sauce after grilling.',
        why: 'pre-seasoning は英語ではほとんど使われません。「焼く前に付ける下味であって、つけダレではない」と書くと伝わります。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '濃口醤油 大さじ２',
        posted: 'Dark soy sauce: 2 tablespoons',
        fixed: '2 tbsp koikuchi soy sauce (the standard Japanese soy sauce)',
        why: '濃口が dark soy sauce と書かれるのは5回目です。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '豆板醤 小さじ１',
        posted: 'Doubanjiang (chili bean paste): 1 teaspoon',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'note',
        ja: 'これに胡麻などを混ぜるのもありです！',
        posted: 'You can also add sesame seeds to this!',
        fixed: null,
        why: null,
        verdict: 'ok'
      }
    ]
  },

  {
    slug: 'tako-meshi',
    titleJa: 'タコ飯とタコの唐揚げ',
    source: 'tools/fixtures/tako-meshi.txt',
    lines: [
      {
        where: 'title',
        ja: 'タコ飯とタコの唐揚げ',
        posted: 'Octopus Rice and Deep-Fried Octopus',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'lead',
        ja: '生のタコが珍しく売ってあったので、買ってたこ飯で豪快に使ってみました！',
        posted: 'I happened to find some fresh octopus for sale, so I bought it and used it generously to make octopus rice!',
        fixed: 'Raw octopus is not something you see on sale very often, so when I found some I bought it and used it generously for octopus rice.',
        why: '「生のタコ」は raw octopus です。fresh は「新鮮」で、日本の売り場に並んでいるのはたいてい茹でダコなので、生であることがこの回の中心の話です。本文では raw octopus と書けているので、書き出しだけ食い違っています。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: 'タコを塩もみするときの塩は、粗塩を使うのが良いです',
        posted: 'It is best to use coarse salt when massaging the octopus.',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'tip',
        ja: '塩もみして洗った後は、キッチンペーパーなどでしっかり水気を切りましょう',
        posted: 'After massaging it with salt and rinsing it off, make sure to pat it thoroughly dry with paper towels.',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'tip',
        ja: 'また、タコを生から調理する場合、水分がかなり出るので、そこを考えながら調理したほうがいいです',
        posted: 'Also, keep in mind that cooking with raw octopus releases a significant amount of moisture.',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'ingredient',
        ja: '薄口醤油 大さじ１',
        posted: 'Light soy sauce: 1 tbsp',
        fixed: '1 tbsp usukuchi soy sauce (lighter in color, saltier)',
        why: '薄口が light soy sauce と書かれるのは4回目です。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: 'ほんだじ 小さじ１',
        posted: 'Hondashi (dashi granules): 1 tsp',
        fixed: null,
        why: '英語のほうは合っています。日本語が「ほんだじ」になっていて、「ほんだし」の打ち間違いだと思います。サイトにもこの名前で載るので、直してよいか教えてください。',
        verdict: 'watch'
      },
      {
        where: 'note',
        ja: '15分だけ漬ける。それ以上は塩辛くなってしまいます',
        posted: 'Marinate for only 15 minutes. Marinating any longer will make it too salty.',
        fixed: null,
        why: null,
        verdict: 'ok'
      }
    ]
  },

  {
    slug: 'wagyu-sirloin-don',
    titleJa: '和牛サーロインステーキ丼',
    source: 'tools/fixtures/wagyu-sirloin-don.txt',
    lines: [
      {
        where: 'title',
        ja: '和牛サーロインステーキ丼',
        posted: 'Wagyu Sirloin Steak Rice Bowl',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'lead',
        ja: '今回はステーキをどんぶりにしました！',
        posted: "This time, we've made steak into a rice bowl!",
        fixed: 'This time I made steak into a rice bowl.',
        why: '作っているのは1人なので I にそろえたいです。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '今回使った和牛サーロインは脂が多く、自分自身もここまで多い脂は苦手なので、丼にして新玉ねぎや、玉ねぎとリンゴのソースでさっぱり仕上げました！',
        posted: 'The Wagyu sirloin we used this time is quite fatty, and I personally don\'t like that much fat, so we made it into a rice bowl and finished it off with new onions and an onion and apple sauce for a refreshing taste!',
        fixed: 'The wagyu sirloin I used was very fatty, and I am not keen on that much fat myself, so I served it over rice and finished it with new-season onion and an onion-and-apple sauce to lighten it.',
        why: '1つの文のなかで we と I が混ざっています。new onions は英語として通じないので、出はじめの甘い玉ねぎだと分かる書き方にしました。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: 'ソースは煮立たせた後に、味を見ながら煮詰める時間や味を調節してください！',
        posted: 'After boiling the sauce, adjust the simmering time and flavor while tasting it!',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'group',
        ja: '～ソース～',
        posted: '~Sauce~',
        fixed: '☆Sauce☆',
        why: 'タレの見出しは ☆ で囲んだものだけが認識されます。〜 で囲むと「〜ソース〜」という名前の材料として表に並んでしまいます（実際に試して確認しました）。日本語側も ☆ソース☆ にしてください。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '玉ねぎ 1個 (大体200g前後)',
        posted: '1 onion (approx. 200g)',
        fixed: null,
        why: null,
        verdict: 'ok'
      }
    ]
  },

  {
    slug: 'tori-negi-meshi',
    titleJa: '鶏ネギ飯',
    source: 'tools/fixtures/tori-negi-meshi.txt',
    lines: [
      {
        where: 'title',
        ja: '鶏ネギ飯',
        posted: 'Chicken and Green Onion Rice',
        fixed: 'Chicken and Negi Rice',
        why: '同じ投稿のなかで、長ネギがタイトルでは Green Onion、材料表では Leek と2通りになっています。negi にそろえたいです。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '※このレシピは大体2～3人前分で作っています',
        posted: '*This recipe is for approximately 2-3 servings.',
        fixed: 'Note: this recipe makes about 2–3 servings.',
        why: '日本語の ※ をそのまま * にすると、英語では注記の印になりません。行頭の * は箇条書きの印に見えます。Note: と書くのが自然です。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '炊く時間は弱火23分、蒸らしが3～5分!',
        posted: 'Cooking time: 23 minutes over low heat, then let it steam for 3-5 minutes!',
        fixed: 'Cook for 23 minutes over low heat, then let it rest, covered, for 3–5 minutes.',
        why: '蒸らしは火を止めて蓋をしたまま置く時間なので、rest, covered と書くと動作が伝わります。なお、この時間の情報はいただいた20回のなかで唯一のもので、とても助かります。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: 'お米 2合(300g)',
        posted: 'Rice: 2 cups (300g)',
        fixed: '300g rice (2 go, the 180ml rice-cooker cup)',
        why: '1合は180mlで、英語の1カップ（240ml）とは別です。2 cups だと約370gになり、併記されている300gと食い違います。gを主にして合を添えると誤解が起きません。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '濃口醤油 大さじ２',
        posted: 'Soy sauce: 2 tablespoons',
        fixed: '2 tbsp koikuchi soy sauce (the standard Japanese soy sauce)',
        why: '同じ濃口醤油が、他の回では dark soy sauce、この回では Soy sauce と2通りになっています。薄口と濃口を使い分けているチャンネルなので、区別が付く書き方に決めたいです。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '長ネギの先の部分',
        posted: 'Tip of a leek',
        fixed: 'the green tops of a negi (Japanese long onion)',
        why: 'ラーメンの回の Green onion, tip と同じ箇所です。leek は別の野菜で、tip だけだと「先端を少しだけ」に読めます。',
        verdict: 'fix'
      },
      {
        where: 'group',
        ja: 'ネギダレ',
        posted: 'Leek Sauce',
        fixed: 'Negi sauce',
        why: '長ネギの定訳にそろえました。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '長ネギ 1/2',
        posted: 'Leek: 1/2',
        fixed: '1/2 negi (Japanese long onion)',
        why: '同上。leek で買うと、太さも甘みも違うものになります。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '※濃ゆくしたい方は、おろしにんにくや生姜、ごま油を追加してタレを作るといいと思います',
        posted: '*If you want a stronger flavor, you can add more grated garlic, ginger, and sesame oil to the sauce.',
        fixed: 'Note: for a stronger sauce, add more grated garlic, ginger and sesame oil.',
        why: '※ の件と同じです。',
        verdict: 'fix'
      }
    ]
  },

  {
    slug: 'ebi-cream-pasta',
    titleJa: 'エビクリームパスタ',
    source: 'tools/fixtures/ebi-cream-pasta.txt',
    lines: [
      {
        where: 'title',
        ja: 'エビクリームパスタ',
        posted: 'Shrimp Cream Pasta',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'ingredient',
        ja: '海老の殻(8匹分。パナメ海老などの頭がなければ10匹分以上)',
        posted: "Shrimp shells (enough for 8 shrimp; more than 10 if you don't have the heads of shrimp, such as prawns)",
        fixed: 'Shells from 8 shrimp (10 or more if using headless shrimp)',
        why: '英文が「頭を持っていないなら」と読めて、条件が伝わりません。頭付きが手に入らないとき、という意味に直しました。あわせて「パナメ海老」は「バナメイエビ」の打ち間違いだと思うので、下の聞きたいことに入れています。',
        verdict: 'fix'
      },
      {
        where: 'note',
        ja: '↑海老の出汁',
        posted: '↑Shrimp broth',
        fixed: '↑ this makes the shrimp stock',
        why: '↑ だけだと、上の3行を指しているのか下を指しているのかが英語では読み取れません。文にすると迷いません。なお海老の殻から取ったものは stock で、鰹と昆布の dashi とは別のものなので、ここは broth/stock のままでよいです。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: 'ケチャップ 大さじ４',
        posted: '4 tablespoons ketchup',
        fixed: null,
        why: null,
        verdict: 'ok'
      }
    ]
  },

  {
    slug: 'kinoko-shoga-soup',
    titleJa: 'キノコと鶏むね肉の和風生姜スープ',
    source: 'tools/fixtures/kinoko-shoga-soup.txt',
    lines: [
      {
        where: 'title',
        ja: 'キノコと鶏むね肉の和風生姜スープ',
        posted: 'Japanese-Style Ginger Soup with Mushrooms and Chicken Breast',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'tip',
        ja: '香ばしく焼いた鶏皮が、すごくいいアクセントになります！',
        posted: 'The fragrant grilled chicken skin adds a wonderful accent!',
        fixed: 'The crisp, well-browned chicken skin is what makes it.',
        why: 'accent は日本語の「アクセント」ほど食べ物に使いません。香ばしく焼いた＝こんがり焼けてパリッとした、と書くと味が想像できます。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '出汁 500ml',
        posted: '500ml dashi stock',
        fixed: '500ml dashi',
        why: 'dashi stock は「出汁スープ」で意味が重なっています。鴨蕎麦の回の dashi broth と同じ形です。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '濃口醤油 大さじ1',
        posted: '1 tablespoon dark soy sauce',
        fixed: '1 tbsp koikuchi soy sauce (the standard Japanese soy sauce)',
        why: '濃口が dark soy sauce と書かれるのは6回目です。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '昆布 6g',
        posted: '6g kelp',
        fixed: '6g kombu (dried kelp)',
        why: '昆布の書き方が5通りになっています。',
        verdict: 'fix'
      }
    ]
  },

  {
    slug: 'gyusuji-daikon',
    titleJa: '牛筋大根',
    source: 'tools/fixtures/gyusuji-daikon.txt',
    lines: [
      {
        where: 'title',
        ja: '牛筋大根',
        posted: 'Beef Tendon and Daikon Radish',
        fixed: 'Simmered Beef Tendon and Daikon',
        why: '英語のタイトルが材料を並べただけで、料理になっていません。煮物だと分かるだけで、何の料理かが伝わります。',
        verdict: 'fix'
      },
      {
        where: 'lead',
        ja: '牛筋と大根はとても相性がよく、一緒に煮るととてもおいしい惣菜になります！',
        posted: 'Beef tendon and daikon radish go incredibly well together, making a delicious side dish when simmered together!',
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'tip',
        ja: '余った出汁は、ラーメンのスープにしたり色々してみてください！',
        posted: 'Try using leftover dashi in various ways, like making ramen soup!',
        fixed: null,
        why: '英語は日本語のとおりです。ただ「余った出汁」が、引いた和風だしの残りなのか、牛筋を煮た煮汁なのか、日本語のほうが2通りに読めます。どちらか教えていただければ、英語も書き分けます。',
        verdict: 'watch'
      },
      {
        where: 'ingredient',
        ja: '濃口醤油 大さじ1',
        posted: '1 tablespoon dark soy sauce',
        fixed: '1 tbsp koikuchi soy sauce (the standard Japanese soy sauce)',
        why: '7回目です。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '昆布 10g',
        posted: '10g kelp',
        fixed: '10g kombu (dried kelp)',
        why: '同上。',
        verdict: 'fix'
      }
    ]
  },

  {
    slug: 'saba-dashi-tori-soba',
    titleJa: '鯖出汁鶏そば',
    source: 'tools/fixtures/saba-dashi-tori-soba.txt',
    lines: [
      {
        where: 'title',
        ja: '鯖出汁鶏そば',
        posted: 'Mackerel Broth Chicken Soba',
        fixed: 'Chicken Soba in Mackerel Dashi',
        why: '出汁は dashi。broth にすると鶏ガラスープと区別がつかなくなり、この回の主役が消えます。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: 'あまり鯖節だけで売ってるところもないかもですが、その場合はサバやイワシ、マグロなどいろんなものが混ざってるものがおすすめです',
        posted: 'You might not find many places that sell just mackerel flakes, but if you do, I recommend a mix of mackerel, sardines, tuna, and other ingredients.',
        fixed: "Sababushi on its own can be hard to find. If you can't get it, a blend of mackerel, sardine and tuna works well.",
        why: '意味が逆になっています。日本語は「単体で売っていない場合は、混合節を」ですが、英語は「もし見つかったら、混ざったものを勧める」と読めて、文の中で矛盾しています。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '長ネギ 1/2',
        posted: '1/2 a long green onion',
        fixed: '1/2 negi (Japanese long onion)',
        why: 'この回は長ネギと青ネギの両方が入っていて、英語ではどちらも green onion になっています。長ネギを negi にすると見分けがつきます。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '濃口醤油 大さじ１',
        posted: '1 tablespoon dark soy sauce',
        fixed: '1 tbsp koikuchi soy sauce (the standard Japanese soy sauce)',
        why: '8回目です。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '薄口醤油 大さじ２',
        posted: '2 tablespoons light soy sauce',
        fixed: '2 tbsp usukuchi soy sauce (lighter in color, saltier)',
        why: '5回目です。この回も濃口と薄口が並んでいます。',
        verdict: 'fix'
      }
    ]
  },

  {
    slug: 'buri-zuke-ochazuke',
    titleJa: '鰤漬け丼のお茶漬け',
    source: 'tools/fixtures/buri-zuke-ochazuke.txt',
    lines: [
      {
        where: 'title',
        ja: '鰤漬け丼のお茶漬け',
        posted: 'Ochazuke with Pickled Yellowtail Rice Bowl',
        fixed: 'Marinated Yellowtail Ochazuke',
        why: '魚の「漬け」は醤油に浸けることなので marinated です。pickled は酢や塩水で漬ける漬物のことで、別の料理になります。次の回では同じ「漬け」を Marinated と書かれているので、2回で割れています。',
        verdict: 'fix'
      },
      {
        where: 'lead',
        ja: 'おなかの脂がのっている部分を使って、漬け丼のお茶漬けにしました。',
        posted: 'I used the fatty parts of the belly to make this pickled rice bowl with ochazuke.',
        fixed: 'I used the fatty belly to make a marinated yellowtail bowl, then poured dashi over it.',
        why: '同じく pickled の件。あわせて、お茶漬けが何なのかが英語では伝わらないので、出汁をかけると書き足しました。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '※出汁をかける際は、ほんのりあったかい程度に温めましょう。',
        posted: "*When pouring the dashi stock over the fish, make sure it's just slightly warm.",
        fixed: 'Note: warm the dashi so it is just barely hot when you pour it over.',
        why: '※ をそのまま * にすると、英語では注記の印になりません。dashi stock の重なりも直しました。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '沸騰させたり、湯気が出るくらいの温度でかけると、魚に火が入ってしまいます',
        posted: "If you pour it over at a boiling point or when it's hot enough to produce steam, the fish will cook.",
        fixed: 'If it is boiling, or hot enough to steam, it will cook the fish.',
        why: 'at a boiling point は英語として不自然です。意味は合っているので、言い方だけ直しました。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '昆布 5g',
        posted: '5g kelp',
        fixed: '5g kombu (dried kelp)',
        why: '同上。',
        verdict: 'fix'
      },
      {
        where: 'group',
        ja: '漬けダレ',
        posted: 'marinade',
        fixed: 'Marinade',
        why: '同じ投稿のなかで ☆Dashi☆ は大文字始まり、☆marinade☆ は小文字始まりになっています。見出しの形はそろえたいです。',
        verdict: 'fix'
      }
    ]
  },

  {
    slug: 'buri-zuke-don',
    titleJa: '鰤の漬け丼',
    source: 'tools/fixtures/buri-zuke-don.txt',
    lines: [
      {
        where: 'title',
        ja: '鰤の漬け丼',
        posted: 'Yellowtail Marinated Rice Bowl',
        fixed: 'Marinated Yellowtail Rice Bowl',
        why: '語順だけ入れ替えました。いまの形だと「鰤を漬けた丼」ではなく「鰤の、漬けられた丼」と読めます。なおこの回の Marinated は正しく、前の回の Pickled のほうが直す側です。',
        verdict: 'fix'
      },
      {
        where: 'group',
        ja: '漬けダレ',
        posted: 'Maru Sauce',
        fixed: 'Marinade',
        why: 'Maru Sauce という英語はありません。おそらく変換の事故だと思います。この回でいちばん目立つ箇所です。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '最近は天然よりも養殖のほうが脂がのっていておいしいですね',
        posted: 'Lately, farmed yellowtail has become more fatty and delicious than wild-caught ones.',
        fixed: 'These days the farmed yellowtail is fattier and better than the wild-caught.',
        why: '意味は合っています。more fatty は fattier のほうが自然、というだけの直しです。',
        verdict: 'fix'
      },
      {
        where: 'note',
        ja: '大葉など使ってもおいしいです',
        posted: 'You can also use shiso leaves, etc.',
        fixed: null,
        why: null,
        verdict: 'ok'
      }
    ]
  },

  {
    slug: 'niboshi-shoyu-ramen',
    titleJa: '煮干しと鶏出汁の醤油ラーメン',
    source: 'tools/fixtures/niboshi-shoyu-ramen.txt',
    lines: [
      {
        where: 'title',
        ja: '煮干しと鶏出汁の醤油ラーメン',
        posted: 'Shoyu Ramen with Dried Niboshi and Chicken Stock',
        fixed: 'Shoyu Ramen in Niboshi and Chicken Dashi',
        why: 'niboshi はそれ自体が「干した小魚」なので、Dried Niboshi は「干した干し煮干し」になります。',
        verdict: 'fix'
      },
      {
        where: 'lead',
        ja: '寒い時期なので、生姜や柚子の皮を入れてもおいしいと思います！',
        posted: "Since it's cold out, adding ginger or yuzu peel would be delicious!",
        fixed: null,
        why: null,
        verdict: 'ok'
      },
      {
        where: 'lead',
        ja: '煮干しを焼きあごにしたりと、出汁のアレンジもやりやすいと思います！',
        posted: 'You can easily change up the broth by substituting grilled flying fish for the dried sardines!',
        fixed: 'You can vary the dashi easily, for example by swapping the niboshi for grilled flying fish (yaki-ago).',
        why: 'ここでの「出汁」は broth（煮出したスープ全般）ではなく、このサイトで dashi と呼んでいるものです。焼きあごも grilled flying fish だけだと通じにくいので、yaki-ago を添えました。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '砂糖 大さじ1/2 (今回使ったのはきび砂糖)',
        posted: '1/2 tablespoon sugar (I used brown sugar)',
        fixed: '1/2 tbsp sugar (I used kibizato, unrefined cane sugar)',
        why: '英語の brown sugar は糖蜜を戻した砂糖で、きび砂糖より味も色も強く出ます。スープの甘さの質が変わります。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '柚子胡椒もおいしいかもです！',
        posted: 'Yuzu pepper might also be delicious!',
        fixed: 'A little yuzu kosho (yuzu and chili paste) is good too.',
        why: '柚子胡椒に胡椒は入っていません。青唐辛子と柚子の皮と塩を練ったものです。Yuzu pepper では売り場でも探せません。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '濃口醤油 100ml',
        posted: '100ml dark soy sauce',
        fixed: '100ml koikuchi soy sauce (the standard Japanese soy sauce)',
        why: '9回目です。この回は100mlと多いので、老抽を買われると真っ黒で甘いスープになります。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '昆布 10g',
        posted: '10g kelp',
        fixed: '10g kombu (dried kelp)',
        why: '同上。',
        verdict: 'fix'
      }
    ]
  },

  {
    slug: 'chutoro-sushi',
    titleJa: '中とろ寿司',
    source: 'tools/fixtures/chutoro-sushi.txt',
    lines: [
      {
        where: 'title',
        ja: '中とろ寿司',
        posted: 'Medium Fatty Tuna Sushi',
        fixed: 'Chutoro Sushi (medium fatty tuna)',
        why: '寿司ダネの名前なので、chutoro を主にしたほうが、寿司を知っている人には早く伝わります。説明は括弧で一度だけ添えれば足ります。',
        verdict: 'fix'
      },
      {
        where: 'lead',
        ja: 'もう全快しているので、これからガンガン動画出します！',
        posted: "I'm fully recovered now, so I'll be uploading videos as soon as possible!",
        fixed: "I'm fully recovered, so there will be plenty of videos from here on.",
        why: '「ガンガン出します」は本数の話ですが、as soon as possible は時期の話になっていて、意味がずれています。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '繊維を意識して切ったのですが、思ったようにうまくいきませんでした',
        posted: "I tried to cut it while keeping the fibers in mind, but it didn't turn out as well as I'd hoped",
        fixed: "I tried to cut with the grain in mind, but it didn't come out the way I wanted.",
        why: '魚や肉の繊維は英語では the grain と言います。fibers だと食物繊維のほうに聞こえます。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '歯切れが悪かったわけではありませんが',
        posted: "It wasn't that it was hard to cut,",
        fixed: "It wasn't unpleasant to bite into,",
        why: '歯切れは食べたときの噛み切れ方のことで、包丁で切りにくいという意味ではありません。',
        verdict: 'fix'
      },
      {
        where: 'group',
        ja: '赤しゃり',
        posted: 'Red Rice (Half of this amount for 1 cup of rice)',
        fixed: 'Akashari — sushi rice with red vinegar (halve everything for 1 go of rice)',
        why: '英語の red rice は赤米という別の米を指します。赤しゃりは白い米を赤酢で調味したもので、米自体は赤くありません。1合は180mlで、英語の1カップではありません。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: '砂糖 大さじ１ 小さじ１',
        posted: '1 tablespoon, 1 teaspoon of sugar',
        fixed: '1 tbsp plus 1 tsp sugar',
        why: 'コンマだと「大さじ1、または小さじ1」の2択に読めます。足すという意味だと分かる書き方にしました。',
        verdict: 'fix'
      },
      {
        where: 'note',
        ja: 'ハッシュタグ #shushi',
        posted: '#shushi',
        fixed: '#sushi',
        why: '綴りが1文字違っていて、このタグからは誰も来られません。#寿司 のほうは効いています。',
        verdict: 'fix'
      }
    ]
  },

  {
    slug: 'chicken-katsu-amazu',
    titleJa: 'チキンカツの甘酢',
    source: 'tools/fixtures/chicken-katsu-amazu.txt',
    lines: [
      {
        where: 'title',
        ja: 'チキンカツの甘酢',
        posted: 'Sweet and Sour Chicken Cutlet',
        fixed: 'Chicken Katsu with Sweet Vinegar Sauce',
        why: 'sweet and sour は中華の酢豚の味を連想させます。甘酢は甘い合わせ酢のことなので、そう書いたほうが近いです。katsu は英語圏でもそのまま通じ、検索もされます。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '鶏肉は塩を少し強めに振って、おすすめは3時間以上置いておくことです',
        posted: 'Sprinkle a little salt on the chicken and let it sit for at least 3 hours.',
        fixed: 'Salt the chicken a little more heavily than you might expect, and ideally leave it for 3 hours or more.',
        why: '「少し強めに」が a little salt になっていて、意味が逆です。ここは塩を効かせることが下味の要なので、弱めに読まれると仕上がりが変わります。',
        verdict: 'fix'
      },
      {
        where: 'ingredient',
        ja: 'パン粉 (食パン1枚分)',
        posted: 'Breadcrumbs (for 1 slice of bread)',
        fixed: 'Breadcrumbs (from 1 slice of white bread)',
        why: 'for だと「食パン1枚のためのパン粉」になります。食パン1枚から作る、という意味に直しました。',
        verdict: 'fix'
      },
      {
        where: 'tip',
        ja: '酸味を活かしたいなら、少し煮詰めた後、粗熱が取れてから入れるといいです',
        posted: 'If you want to bring out the acidity, add it after simmering a little and letting it cool.',
        fixed: 'To keep the sharpness, simmer it a little first, then add the vinegar once it has cooled to just warm.',
        why: 'letting it cool だと冷蔵庫まで冷やしてよいと読めます。粗熱が取れた状態＝まだ温かい、と書き分けました。南蛮漬けの回と同じ箇所です。',
        verdict: 'fix'
      }
    ]
  },

  {
    slug: 'kanitama-udon',
    titleJa: 'ふわふわカニ玉うどん',
    source: 'tools/fixtures/kanitama-udon.txt',
    pr: true,
    note: 'この回はハッシュタグが先頭にあり、タイトルが本文の途中に入っていて、【レシピ】の目印もありません。'
      + 'タイアップの回は先方の指定があると思うので、そのままで問題ありません。'
      + '自動掲載の対象外なので、取り込みにも影響しません。',
    lines: []
  },

  {
    slug: 'dashiuma-teriyaki',
    titleJa: '鶏のだしうま照り焼き',
    source: 'tools/fixtures/dashiuma-teriyaki.txt',
    pr: true,
    lines: []
  },

  {
    slug: 'shoronpo',
    titleJa: '包まない海老小籠包',
    source: 'tools/fixtures/shoronpo.txt',
    pr: true,
    lines: []
  }
];
