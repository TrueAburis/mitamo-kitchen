/* Instagram のキャプションを読んで、サイトに必要な形に直す。

   ブラウザ（tools/test.html）でも、GitHub Actions の Node でも同じコードを動かす。
   外部ライブラリは使わない。

   実際の投稿3本（tools/fixtures/）から分かっている前提：
   ・【タイトル】と【レシピ】は3本とも同じ形で入っている
   ・英語のタイトル・本文・材料は「無い回がある」
   ・☆グループ☆ は「無い回がある」
   ・手順はどの回にも書かれていない
   ・材料の行は形が揺れる（分量なし、全角スペース、補足つき、注意書きの混入）

   だから、取れなかったものは null にして warnings に理由を残す。
   推測で埋めない。空欄のまま公開されるほうが、間違ったレシピが出るよりましなので。 */


/* ---- 型 ----
   ブラウザ用の UMD 包みは外した。tools/ は Node からしか使わないため。
   Node 24 は TypeScript をそのまま実行できるので、ビルドは要らない。 */

/** 材料1件。qty が null は「キャプションに分量が書かれていなかった」の意味。
 *  0 や空文字と混同しないよう、null のまま扱うこと。 */
export type Ingredient = { name: string; qty: string | null; kind: 'item' };

/** 材料欄に混ざる注意書き。「出汁ガラを引き上げ後」のような行 */
export type IngredientNote = { text: string; kind: 'note' };

/** ☆で囲まれたグループ。name が null は無名の最初のかたまり */
export type Group = { name: string | null; items: Ingredient[]; notes: string[] };

export type Parsed = {
  titleJa: string | null;
  titleEn: string | null;
  leadJa: string | null;
  leadEn: string | null;
  notesJa: string[];
  notesEn: string[];
  groupsJa: Group[];
  groupsEn: Group[];
  /** 【レシピ】の行の後ろに書かれた何人前（「2人前」）。無ければ null */
  servingsJa: string | null;
  /** 同じく [Recipe] の行の後ろ（「Serves 2」）。無ければ null */
  servingsEn: string | null;
  steps: string[];
  hashtags: string[];
  isPR: boolean;
  warnings: string[];
};


  /* 全角スペースと全角数字を、比較しやすい形にそろえる。
     表示用の文字列は元のまま使うので、ここでは判定用にだけ使う。 */
  function normalize(s: string): string {
    return s
      .replace(/\r\n?/g, '\n')
      .replace(/ /g, ' ')
      .replace(/　/g, ' ');
  }

  function toHalfDigits(s: string): string {
    return s.replace(/[０-９]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xfee0);
    });
  }

  var hasDigit = /[0-9０-９]/;

  /* 日本語の助詞が入っている行は、材料ではなく注意書きとみなす。
     例：「出汁ガラを引き上げ後」は材料欄の中にあるが材料ではない。 */
  var JA_NOTE = /[をはがにへでとの]\s*$|を|してから|した後|引き上げ|後$/;

  /* 材料欄に、材料ではない一文が混ざる。
     「15分だけ漬ける。それ以上は塩辛くなってしまいます」「大葉など使ってもおいしいです」など。
     これを材料として並べると、分量欄が空のまま材料表に文章が入り込む。
     文末が「です・ます・ください」等か、途中に句点がある行は注意書きとして扱う。 */
  var JA_SENTENCE = /(です|ます|ください|下さい|でしょう|かも|しれません)[。！!？?]?\s*$|。/;

  /* 英語の単位。「1 chicken thigh」のように分量が先に来る回があるため、
     先頭の数字＋単位をまとめて分量として切り出す。 */
  var EN_UNITS = '(?:g|kg|ml|l|cm|tablespoons?|teaspoons?|tbsp|tsp|pinch(?:es)?|cloves?|sheets?|pieces?|cups?)';

  function parseIngredientLine(raw: string): Ingredient | IngredientNote | null {
    var line = normalize(raw).trim();
    if (!line) { return null; }

    /* 材料ではなく一文だった行。分量の取り出しに入る前に外す。
       ここを通さないと「15分だけ漬ける。…」が分量なしの材料になってしまう。 */
    if (JA_SENTENCE.test(line)) { return { text: line, kind: 'note' }; }

    /* 「↑海老の出汁」のように、前の行を指す矢印が頭に付く回がある。
       名前の一部ではないので落とす。 */
    line = line.replace(/^[↑→⇒]\s*/, '');

    /* 「お好みで七味唐辛子」は、名前の前に分量が来ている形。
       前に出しておくと、名前を辞書で引けるようになる。 */
    var konomi = line.match(/^お好みで\s*(.+)$/);
    if (konomi) {
      return { name: konomi[1].trim(), qty: 'お好み', kind: 'item' };
    }

    /* 日本語の行と英語の行では、分量の置き場所が逆になる。
       日本語は「名前 分量」、英語は「分量 名前」。
       どちらを先に試すかを間違えると、「玉ねぎ 1個（大体200g前後）」の
       名前が「玉ねぎ 1個」になってしまう（英語の括弧の規則に先に当たるため）。
       行の中身を見てから順番を決める。 */
    var isJa = /[ぁ-んァ-ヶ一-龥]/.test(line);

    /* 日本語：名前のあとに分量。数字が出てくる最初の位置で切る。
       例「長ネギ 1本分 大体 50g」→ 名前=長ネギ / 分量=1本分 大体 50g */
    function jaRule(): Ingredient | null {
      /* 「大さじ2」「お好みの量」のように、数字の前に言葉が来る回。
         数字で切る規則より先に試す。「塩 小さじ 1/2」を数字で切ると
         名前が「塩 小さじ」になってしまうため。 */
      var u = line.match(/^(\S.*?)\s+((?:大さじ|小さじ|少々|適量|お好み|ひとつまみ|二つまみ|一つまみ).*)$/);
      if (u) { return { name: u[1].trim(), qty: u[2].trim(), kind: 'item' }; }
      var m = line.match(/^(\S.*?)\s+([0-9０-９].*)$/);
      if (m) { return { name: m[1].trim(), qty: m[2].trim(), kind: 'item' }; }
      return null;
    }

    function enRule(): Ingredient | null {
      /* 括弧に分量が入っている回。例「Yellow bell pepper (1/4)」 */
      var paren = line.match(/^(.+?)\s*\(([^()]*[0-9][^()]*)\)\s*$/);
      if (paren) { return { name: paren[1].trim(), qty: paren[2].trim(), kind: 'item' }; }
      /* 分量が先に来る回。例「2 tablespoons mirin」「700ml water」 */
      var first = line.match(new RegExp('^([0-9]+(?:\\.[0-9]+)?(?:\\s*/\\s*[0-9]+)?\\s*' + EN_UNITS + '?)\\s+(.+)$', 'i'));
      if (first && /^[A-Za-z]/.test(first[2])) {
        return { name: first[2].trim(), qty: first[1].trim(), kind: 'item' };
      }
      return null;
    }

    var hit = isJa ? (jaRule() || enRule()) : (enRule() || jaRule());
    if (hit) { return hit; }

    /* ここまでで分量が取れなかった行。
       助詞が入っていれば注意書き、そうでなければ「分量が書かれていない材料」。 */
    if (JA_NOTE.test(line) || (/^[A-Za-z]/.test(line) && line.split(/\s+/).length >= 4 && !hasDigit.test(line))) {
      return { text: line, kind: 'note' };
    }
    return { name: line, qty: null, kind: 'item' };
  }

  /* 材料のかたまりを、☆グループ☆ ごとに分ける */
  function parseIngredientBlock(lines: string[]): Group[] {
    var groups: Group[] = [{ name: null, items: [], notes: [] }];
    lines.forEach(function (raw) {
      var line = normalize(raw).trim();
      if (!line) { return; }

      /* タレの見出し。☆で囲む形をテンプレートで頼んであるが、
         実際には ～ソース～ と書かれた回もあるので、そちらも見出しとして読む。
         閉じ記号のあとに補足が続く回（☆赤しゃり☆(米1合はこの半分)）もあるため、
         後ろの文字はそのグループの注意書きに回す。 */
      var g = line.match(/^[☆★～〜~]\s*(.+?)\s*[☆★～〜~]\s*(.*)$/);
      if (g) {
        groups.push({ name: g[1].trim(), items: [], notes: [] });
        var rest = g[2].replace(/^[（(]\s*|\s*[）)]$/g, '').trim();
        if (rest) { groups[groups.length - 1].notes.push(rest); }
        return;
      }

      var parsed = parseIngredientLine(line);
      if (!parsed) { return; }
      if (parsed.kind === 'note') { groups[groups.length - 1].notes.push(parsed.text); }
      else { groups[groups.length - 1].items.push(parsed); }
    });
    return groups.filter(function (g) { return g.items.length || g.notes.length; });
  }

  function parse(caption: string): Parsed {
    var text = normalize(caption || '');
    var lines = text.split('\n');
    var warnings = [];

    /* ハッシュタグは末尾にまとまっている。行ごと取り除く */
    var hashtags: string[] = [];
    var body: string[] = [];
    lines.forEach(function (line) {
      var t = line.trim();
      if (t && /^#/.test(t) && !/\s(?!#)/.test(t.replace(/#\S+/g, '').trim())) {
        (t.match(/#[^\s#]+/g) || []).forEach(function (h) { hashtags.push(h.slice(1)); });
      } else {
        body.push(line);
      }
    });

    function findIndex(re: RegExp): number {
      for (var i = 0; i < body.length; i++) { if (re.test(body[i].trim())) { return i; } }
      return -1;
    }

    /* 目印の行に、何人前が書き足されていることがある（「【レシピ】2人前」）。
       目印だけの行にしてほしいとテンプレートには書いたが、
       すでに投稿された回を読めないほうが困るので、後ろの文字は許して拾う。 */
    var RE_RECIPE_JA = /^【\s*レシピ\s*】\s*(.*)$/;
    var RE_RECIPE_EN = /^\[\s*Recipe\s*\]\s*(.*)$/i;

    var iTitleJa = findIndex(/^【.+】$/);
    var iRecipeJa = findIndex(RE_RECIPE_JA);
    var iTitleEn = -1, iRecipeEn = -1;
    for (var i = 0; i < body.length; i++) {
      var t = body[i].trim();
      if (iTitleEn < 0 && /^\[.+\]$/.test(t) && !RE_RECIPE_EN.test(t) && (iRecipeJa < 0 || i < iRecipeJa)) { iTitleEn = i; }
      if (iRecipeEn < 0 && RE_RECIPE_EN.test(t)) { iRecipeEn = i; }
    }

    /* 目印の行の後ろに残った文字。「2人前」「Serves 2」だけを何人前として受け取り、
       それ以外の文字だったら捨てる（推測で埋めない）。 */
    function tail(idx: number, re: RegExp): string {
      if (idx < 0) { return ''; }
      var m = body[idx].trim().match(re);
      return m && m[1] ? m[1].trim() : '';
    }
    var tailJa = tail(iRecipeJa, RE_RECIPE_JA);
    var tailEn = tail(iRecipeEn, RE_RECIPE_EN);
    var servingsJa = /^[0-9０-９]+\s*人前$/.test(tailJa) ? tailJa : null;
    /* 画面の見出しがすでに「Serves」なので、値は人数だけにする。
       そのまま入れると「Serves / Serves 2」と二重になる。 */
    var mServes = tailEn.match(/^Serves\s+([0-9]+)$/i);
    var servingsEn = mServes ? mServes[1] : null;
    if (tailJa && !servingsJa) { warnings.push('【レシピ】の行に「' + tailJa + '」が付いていた。何人前と読めないので捨てた'); }

    if (iTitleJa < 0) { warnings.push('日本語タイトル【】が見つからない'); }
    if (iRecipeJa < 0) { warnings.push('【レシピ】が見つからない。材料を取り出せない'); }
    if (iTitleEn < 0) { warnings.push('英語タイトルが無い'); }
    if (iRecipeEn < 0) { warnings.push('英語の材料が無い'); }

    var titleJa = iTitleJa >= 0 ? body[iTitleJa].trim().replace(/^【|】$/g, '') : null;
    var titleEn = iTitleEn >= 0 ? body[iTitleEn].trim().replace(/^\[|\]$/g, '') : null;

    function slice(from: number, to: number): string[] {
      if (from < 0) { return []; }
      return body.slice(from, to < 0 ? body.length : to);
    }

    /* リード文。空行で区切られた段落のうち、最初のひとかたまりだけを使う。
       全部入れると長すぎてカードに載らないため。 */
    function firstParagraph(arr: string[]): string | null {
      var out = [];
      for (var j = 0; j < arr.length; j++) {
        var t = arr[j].trim();
        if (!t) { if (out.length) { break; } else { continue; } }
        out.push(t);
      }
      return out.length ? out.join(' ') : null;
    }

    /* 2段落目以降。実際の投稿では、ここに「茄子は箸がスッと刺されば引き上げ時」
       のようなコツが書かれている。1段落目（リード文）と分けて拾う。 */
    function restParagraphs(arr: string[]): string[] {
      var paras: string[] = [], cur: string[] = [];
      arr.forEach(function (line) {
        var t = line.trim();
        if (!t) { if (cur.length) { paras.push(cur.join(' ')); cur = []; } }
        else { cur.push(t); }
      });
      if (cur.length) { paras.push(cur.join(' ')); }
      return paras.slice(1);
    }

    var leadJaEnd = iTitleEn >= 0 ? iTitleEn : iRecipeJa;
    var leadJa = firstParagraph(slice(iTitleJa + 1, leadJaEnd));
    var leadEn = iTitleEn >= 0 ? firstParagraph(slice(iTitleEn + 1, iRecipeJa)) : null;
    var notesJa = restParagraphs(slice(iTitleJa + 1, leadJaEnd));
    var notesEn = iTitleEn >= 0 ? restParagraphs(slice(iTitleEn + 1, iRecipeJa)) : [];

    var ingJaEnd = iRecipeEn >= 0 ? iRecipeEn : -1;
    var groupsJa = iRecipeJa >= 0 ? parseIngredientBlock(slice(iRecipeJa + 1, ingJaEnd)) : [];
    var groupsEn = iRecipeEn >= 0 ? parseIngredientBlock(slice(iRecipeEn + 1, -1)) : [];

    var noQty: string[] = [];
    groupsJa.forEach(function (g) {
      g.items.forEach(function (it) { if (!it.qty) { noQty.push(it.name); } });
    });
    if (noQty.length) { warnings.push('分量が書かれていない材料: ' + noQty.join(' / ')); }

    var jaCount = groupsJa.reduce(function (n, g) { return n + g.items.length; }, 0);
    var enCount = groupsEn.reduce(function (n, g) { return n + g.items.length; }, 0);
    if (iRecipeEn >= 0 && jaCount !== enCount) {
      warnings.push('材料の数が日英で違う（日 ' + jaCount + ' / 英 ' + enCount + '）');
    }

    /* 手順は、確認した投稿3本すべてに書かれていなかった。
       将来キャプションに【作り方】が入るようになったら、ここで拾う。 */
    var iSteps = findIndex(/^【\s*(作り方|手順)\s*】$/);
    var steps: string[] = [];
    if (iSteps >= 0) {
      slice(iSteps + 1, iRecipeJa > iSteps ? iRecipeJa : -1).forEach(function (line) {
        var t = normalize(line).trim();
        if (!t) { return; }
        steps.push(toHalfDigits(t).replace(/^[0-9]+[.、)．]\s*/, ''));
      });
    }
    if (!steps.length) { warnings.push('手順がキャプションに無い'); }

    var isPR = hashtags.some(function (h) { return /^(PR|pr|ＰＲ|ad|Ad|AD|sponsored)$/.test(h); });

    return {
      titleJa: titleJa,
      titleEn: titleEn,
      leadJa: leadJa,
      leadEn: leadEn,
      notesJa: notesJa,
      notesEn: notesEn,
      groupsJa: groupsJa,
      groupsEn: groupsEn,
      servingsJa: servingsJa,
      servingsEn: servingsEn,
      steps: steps,
      hashtags: hashtags,
      isPR: isPR,
      warnings: warnings
    };
  }

export { parse, parseIngredientLine, normalize };
