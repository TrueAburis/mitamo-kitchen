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

(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.CaptionParser = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {

  /* 全角スペースと全角数字を、比較しやすい形にそろえる。
     表示用の文字列は元のまま使うので、ここでは判定用にだけ使う。 */
  function normalize(s) {
    return s
      .replace(/\r\n?/g, '\n')
      .replace(/ /g, ' ')
      .replace(/　/g, ' ');
  }

  function toHalfDigits(s) {
    return s.replace(/[０-９]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xfee0);
    });
  }

  var hasDigit = /[0-9０-９]/;

  /* 日本語の助詞が入っている行は、材料ではなく注意書きとみなす。
     例：「出汁ガラを引き上げ後」は材料欄の中にあるが材料ではない。 */
  var JA_NOTE = /[をはがにへでとの]\s*$|を|してから|した後|引き上げ|後$/;

  /* 英語の単位。「1 chicken thigh」のように分量が先に来る回があるため、
     先頭の数字＋単位をまとめて分量として切り出す。 */
  var EN_UNITS = '(?:g|kg|ml|l|cm|tablespoons?|teaspoons?|tbsp|tsp|pinch(?:es)?|cloves?|sheets?|pieces?|cups?)';

  function parseIngredientLine(raw) {
    var line = normalize(raw).trim();
    if (!line) { return null; }

    /* 英語：括弧に分量が入っている回。例「Yellow bell pepper (1/4)」 */
    var paren = line.match(/^(.+?)\s*\(([^()]*[0-9][^()]*)\)\s*$/);
    if (paren) {
      return { name: paren[1].trim(), qty: paren[2].trim(), kind: 'item' };
    }

    /* 英語：分量が先に来る回。例「2 tablespoons mirin」「700ml water」 */
    var enFirst = line.match(new RegExp('^([0-9]+(?:\\.[0-9]+)?(?:\\s*/\\s*[0-9]+)?\\s*' + EN_UNITS + '?)\\s+(.+)$', 'i'));
    if (enFirst && /^[A-Za-z]/.test(enFirst[2])) {
      return { name: enFirst[2].trim(), qty: enFirst[1].trim(), kind: 'item' };
    }

    /* 日本語：名前のあとに分量。数字が出てくる最初の位置で切る。
       例「長ネギ 1本分 大体 50g」→ 名前=長ネギ / 分量=1本分 大体 50g */
    var m = line.match(/^(\S.*?)\s+([0-9０-９].*)$/);
    if (m) {
      return { name: m[1].trim(), qty: m[2].trim(), kind: 'item' };
    }

    /* 「大さじ2」「二つまみ」のように、数字の前に単位語が来る回 */
    var jaUnit = line.match(/^(\S.*?)\s+((?:大さじ|小さじ|少々|適量|ひとつまみ|二つまみ|一つまみ).*)$/);
    if (jaUnit) {
      return { name: jaUnit[1].trim(), qty: jaUnit[2].trim(), kind: 'item' };
    }

    /* ここまでで分量が取れなかった行。
       助詞が入っていれば注意書き、そうでなければ「分量が書かれていない材料」。 */
    if (JA_NOTE.test(line) || (/^[A-Za-z]/.test(line) && line.split(/\s+/).length >= 4 && !hasDigit.test(line))) {
      return { text: line, kind: 'note' };
    }
    return { name: line, qty: null, kind: 'item' };
  }

  /* 材料のかたまりを、☆グループ☆ ごとに分ける */
  function parseIngredientBlock(lines) {
    var groups = [{ name: null, items: [], notes: [] }];
    lines.forEach(function (raw) {
      var line = normalize(raw).trim();
      if (!line) { return; }

      var g = line.match(/^[☆★]\s*(.+?)\s*[☆★]$/);
      if (g) {
        groups.push({ name: g[1].trim(), items: [], notes: [] });
        return;
      }

      var parsed = parseIngredientLine(line);
      if (!parsed) { return; }
      if (parsed.kind === 'note') { groups[groups.length - 1].notes.push(parsed.text); }
      else { groups[groups.length - 1].items.push(parsed); }
    });
    return groups.filter(function (g) { return g.items.length || g.notes.length; });
  }

  function parse(caption) {
    var text = normalize(caption || '');
    var lines = text.split('\n');
    var warnings = [];

    /* ハッシュタグは末尾にまとまっている。行ごと取り除く */
    var hashtags = [];
    var body = [];
    lines.forEach(function (line) {
      var t = line.trim();
      if (t && /^#/.test(t) && !/\s(?!#)/.test(t.replace(/#\S+/g, '').trim())) {
        (t.match(/#[^\s#]+/g) || []).forEach(function (h) { hashtags.push(h.slice(1)); });
      } else {
        body.push(line);
      }
    });

    function findIndex(re) {
      for (var i = 0; i < body.length; i++) { if (re.test(body[i].trim())) { return i; } }
      return -1;
    }

    var iTitleJa = findIndex(/^【.+】$/);
    var iRecipeJa = findIndex(/^【\s*レシピ\s*】$/);
    var iTitleEn = -1, iRecipeEn = -1;
    for (var i = 0; i < body.length; i++) {
      var t = body[i].trim();
      if (iTitleEn < 0 && /^\[.+\]$/.test(t) && !/^\[\s*Recipe\s*\]$/i.test(t) && (iRecipeJa < 0 || i < iRecipeJa)) { iTitleEn = i; }
      if (iRecipeEn < 0 && /^\[\s*Recipe\s*\]$/i.test(t)) { iRecipeEn = i; }
    }

    if (iTitleJa < 0) { warnings.push('日本語タイトル【】が見つからない'); }
    if (iRecipeJa < 0) { warnings.push('【レシピ】が見つからない。材料を取り出せない'); }
    if (iTitleEn < 0) { warnings.push('英語タイトルが無い'); }
    if (iRecipeEn < 0) { warnings.push('英語の材料が無い'); }

    var titleJa = iTitleJa >= 0 ? body[iTitleJa].trim().replace(/^【|】$/g, '') : null;
    var titleEn = iTitleEn >= 0 ? body[iTitleEn].trim().replace(/^\[|\]$/g, '') : null;

    function slice(from, to) {
      if (from < 0) { return []; }
      return body.slice(from, to < 0 ? body.length : to);
    }

    /* リード文。空行で区切られた段落のうち、最初のひとかたまりだけを使う。
       全部入れると長すぎてカードに載らないため。 */
    function firstParagraph(arr) {
      var out = [];
      for (var j = 0; j < arr.length; j++) {
        var t = arr[j].trim();
        if (!t) { if (out.length) { break; } else { continue; } }
        out.push(t);
      }
      return out.length ? out.join(' ') : null;
    }

    var leadJaEnd = iTitleEn >= 0 ? iTitleEn : iRecipeJa;
    var leadJa = firstParagraph(slice(iTitleJa + 1, leadJaEnd));
    var leadEn = iTitleEn >= 0 ? firstParagraph(slice(iTitleEn + 1, iRecipeJa)) : null;

    var ingJaEnd = iRecipeEn >= 0 ? iRecipeEn : -1;
    var groupsJa = iRecipeJa >= 0 ? parseIngredientBlock(slice(iRecipeJa + 1, ingJaEnd)) : [];
    var groupsEn = iRecipeEn >= 0 ? parseIngredientBlock(slice(iRecipeEn + 1, -1)) : [];

    var noQty = [];
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
    var steps = [];
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
      groupsJa: groupsJa,
      groupsEn: groupsEn,
      steps: steps,
      hashtags: hashtags,
      isPR: isPR,
      warnings: warnings
    };
  }

  return { parse: parse, parseIngredientLine: parseIngredientLine, normalize: normalize };
}));
