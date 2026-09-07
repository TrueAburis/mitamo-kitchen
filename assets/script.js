/* 全ページ共通。読み込み順は recipes.js → script.js

   言語はページごとに固定されている（/ が日本語、/en/ が英語）。
   切り替えはヘッダーのリンクで、別のURLへ移動する。
   以前のようにJSで表示を切り替えることはしない。 */

(function () {
  var root = document.documentElement;
  var LG = root.lang === 'en' ? 'en' : 'ja';
  var ja = LG === 'ja';

  /* ---------- ヘッダーの高さ。分量バーがこの真下に貼り付く ---------- */
  var head = document.querySelector('.masthead');
  if (head) {
    var setH = function () {
      /* header を貼り付けていない画面幅では、分量バーは画面の一番上でよい */
      var sticky = getComputedStyle(head).position === 'sticky';
      root.style.setProperty('--headh', (sticky ? Math.round(head.getBoundingClientRect().height) : 0) + 'px');
    };
    setH();
    if (window.ResizeObserver) { new ResizeObserver(setH).observe(head); }
    else { window.addEventListener('resize', setH); }
  }

  /* ---------- 材料の開閉 ---------- */
  var bar = document.getElementById('qty');
  if (bar) {
    var btn = bar.querySelector('.qty-toggle');
    btn.addEventListener('click', function () {
      var open = bar.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- いま読んでいる手順の分量をバーに出し続ける。このサイトの核 ---------- */
  (function () {
    if (!bar) { return; }
    var peek = bar.querySelector('.qty-peek');
    var stepTag = bar.querySelector('.qty-step');
    var steps = [].slice.call(document.querySelectorAll('.steps li'));
    if (!steps.length || !peek) { return; }

    var def = peek.textContent;

    /* 「いま読んでいる」とみなす高さ。
       スマホではバーが画面上端に貼り付いて本文を隠すので、そのすぐ下。
       広い画面ではバーは左の列にいて本文を隠さないので、画面の上から3分の1あたり。
       バーの下端を基準にすると、材料が全部見えている広い画面では
       線が画面の下のほうまで下がってしまい、いつも最後の手順が選ばれる。 */
    function readingLine() {
      var r = bar.getBoundingClientRect();
      var coversText = r.width > window.innerWidth * 0.8;
      return coversText ? r.bottom + 24 : window.innerHeight * 0.34;
    }

    function update() {
      var line = readingLine();
      var cur = null, idx = 0;
      /* 線を上に越えた手順のうち、いちばん下のもの＝いま読んでいる手順。
         「まだ画面に残っているか」は見ない。見てしまうと、
         手順を読み終えて次に移っても古い手順が選ばれ続ける。 */
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].getBoundingClientRect().top <= line) { cur = steps[i]; idx = i + 1; }
      }
      if (cur && cur.getAttribute('data-uses')) {
        peek.textContent = cur.getAttribute('data-uses');
        stepTag.textContent = idx;
      } else {
        peek.textContent = def;
        stepTag.textContent = '';
      }
    }
    /* スクロールのたびに直接呼ぶ。

       以前は requestAnimationFrame でまとめていたが、
       **requestAnimationFrame は止められることがある**（裏のタブ、省電力、
       アプリ内ブラウザなど）。止まると、このサイトの核である
       「いま読んでいる手順の分量」が古いまま固まってしまう。
       止まらないほうを選んだ。

       読み取っているのは手順の数だけの位置情報で、
       いちばん多いレシピでも数十件。毎回読んでも重くならない。 */
    window.addEventListener('scroll', update, { passive: true });

    /* 画面の幅が変わると、貼り付き方も線の位置も変わる */
    window.addEventListener('resize', update, { passive: true });

    update();
  })();

  /* ============ ここから下は recipes.js のデータを使う ============ */

  /* 英語で見ているときは、英語ページを作っていない回を外す。
     一覧・検索・タグ・人気順・ガチャ・関連レシピが全部ここを見ているので、
     ここで1回外せば、どこからも 404 へのリンクが出なくなる。
     日本語ページは全件そのまま（日本語は必ずある）。 */
  var DATA = (window.RECIPES || []).filter(function (r) {
    return ja || r.hasEn !== false;
  });
  var TAGS = window.TAGS || {};
  var AXES = window.TAG_AXES || {};
  var TAG_MIN = window.TAG_MIN || 1;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }

  function num(v) { return v == null ? '—' : Number(v).toLocaleString('en-US'); }
  function plural(n) { return n === 1 ? 'recipe' : 'recipes'; }
  function tagName(key) { return TAGS[key] ? TAGS[key][LG] : key; }

  function tagCounts() {
    var c = {};
    DATA.forEach(function (r) { r.tags.forEach(function (t) { c[t] = (c[t] || 0) + 1; }); });
    return c;
  }

  /* レシピ1件のカード。リンクは同じ階層を指すので、
     英語ページのカードは英語ページへ、日本語は日本語へつながる */
  function card(r) {
    var li = el('li', 'card');
    var a = el('a');
    a.href = r.slug + '.html';

    /* TODO: images/ に写真が入ったら figure の中を <img alt="..."> に差し替える */
    var shot = el('figure', 'card-shot');
    shot.appendChild(el('span', null, r.image));
    a.appendChild(shot);

    var h = el('h3', 'card-title', r[LG].title);
    if (ja && r.en.title !== r.ja.title) {
      var sub = el('span', 'en', r.en.title);
      sub.lang = 'en';
      h.appendChild(sub);
    }
    a.appendChild(h);
    a.appendChild(el('p', 'card-lead', r[LG].lead));

    var meta = el('div', 'card-meta');
    meta.appendChild(el('span', null, (ja ? 'いいね ' : 'Likes ') + num(r.likes)));
    if (r.posted) { meta.appendChild(el('span', null, r.posted)); }
    a.appendChild(meta);

    var tags = el('div', 'card-tags');
    r.tags.forEach(function (t) { tags.appendChild(el('span', null, tagName(t))); });
    a.appendChild(tags);

    if (!r.ready) {
      a.appendChild(el('span', 'card-draft', ja ? '手順は準備中' : 'Steps coming'));
    }
    li.appendChild(a);
    return li;
  }

  function byPopular(a, b) {
    /* いいね数が未取得のものは、数値のあるものより後ろに置く */
    if (a.likes == null && b.likes == null) { return byNewest(a, b); }
    if (a.likes == null) { return 1; }
    if (b.likes == null) { return -1; }
    return b.likes - a.likes;
  }
  /* 投稿日が分からない回（posted が null）は、日付のある回より後ろ。
     並べようがないものを新しい側に置くと、一覧の先頭が意味を持たなくなる。 */
  function byNewest(a, b) {
    if (!a.posted && !b.posted) { return 0; }
    if (!a.posted) { return 1; }
    if (!b.posted) { return -1; }
    return b.posted.localeCompare(a.posted);
  }

  /* タグのボタンを軸ごとに並べる。
     件数がそろっていないタグは出さない。1件しか出ないタグを押させると、
     押した人をがっかりさせるだけなので。件数は表に出して期待値を先に見せる。 */
  function buildChips(host, activeTag, onPick) {
    var counts = tagCounts();
    host.innerHTML = '';
    var keys = Object.keys(TAGS).filter(function (k) { return (counts[k] || 0) >= TAG_MIN; });

    if (!keys.length) {
      host.appendChild(el('p', 'chips-empty', ja
        ? 'タグは、同じタグのレシピが ' + TAG_MIN + ' 件そろってから表示します。いまはまだ足りていません。'
        : 'A tag appears once ' + TAG_MIN + ' recipes share it. Not there yet.'));
      return;
    }

    var mk = function (key, label) {
      var b = el('button', 'chip');
      b.type = 'button';
      b.dataset.tag = key;
      b.textContent = label;
      b.setAttribute('aria-pressed', key === activeTag ? 'true' : 'false');
      b.addEventListener('click', function () { onPick(key === activeTag ? '' : key); });
      return b;
    };

    var first = el('div', 'chip-axis');
    first.appendChild(mk('', ja ? 'すべて' : 'All'));
    host.appendChild(first);

    Object.keys(AXES).forEach(function (axis) {
      var inAxis = keys.filter(function (k) { return TAGS[k].axis === axis; });
      if (!inAxis.length) { return; }
      var row = el('div', 'chip-axis');
      row.appendChild(el('span', 'chip-axis-label', AXES[axis][LG]));
      inAxis.forEach(function (k) { row.appendChild(mk(k, tagName(k) + ' ' + counts[k])); });
      host.appendChild(row);
    });
  }

  /* ---------- レシピ一覧ページ ---------- */
  var list = document.getElementById('cards');
  if (list) {
    var params = new URLSearchParams(location.search);
    var state = {
      q: params.get('q') || '',
      tag: params.get('tag') || '',
      sort: params.get('sort') === 'popular' ? 'popular' : 'new'
    };

    var search = document.querySelector('[data-search]');
    if (search) { search.value = state.q; }

    var matches = function (r) {
      if (state.tag && r.tags.indexOf(state.tag) < 0) { return false; }
      if (!state.q) { return true; }
      var q = state.q.toLowerCase();
      var hay = [r.ja.title, r.en.title, r.ja.lead, r.en.lead]
        .concat(r.tags.map(function (t) { return TAGS[t] ? TAGS[t].ja + ' ' + TAGS[t].en : t; }))
        .join(' ').toLowerCase();
      return hay.indexOf(q) > -1;
    };

    var render = function () {
      var rows = DATA.filter(matches).sort(state.sort === 'popular' ? byPopular : byNewest);

      list.innerHTML = '';
      rows.forEach(function (r) { list.appendChild(card(r)); });

      var count = document.getElementById('count');
      if (count) {
        count.innerHTML = '';
        count.appendChild(document.createTextNode(ja ? '該当 ' : 'Showing '));
        count.appendChild(el('b', null, rows.length));
        count.appendChild(document.createTextNode(ja ? ' 件' : ' ' + plural(rows.length)));
      }

      var empty = document.getElementById('empty');
      if (empty) { empty.hidden = rows.length > 0; }

      var chipsHost = document.getElementById('chips');
      if (chipsHost) {
        buildChips(chipsHost, state.tag, function (k) { state.tag = k; render(); });
      }
      document.querySelectorAll('[data-sort]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.sort === state.sort ? 'true' : 'false');
        b.textContent = b.dataset.sort === 'popular'
          ? (ja ? 'いいねが多い順' : 'Most liked')
          : (ja ? '新しい順' : 'Newest');
      });
    };

    document.querySelectorAll('[data-sort]').forEach(function (b) {
      b.addEventListener('click', function () { state.sort = b.dataset.sort; render(); });
    });

    if (search) {
      search.form.addEventListener('submit', function (e) { e.preventDefault(); });
      search.addEventListener('input', function () { state.q = search.value.trim(); render(); });
    }

    render();
  }

  /* ---------- トップの人気のレシピ ---------- */
  var pop = document.getElementById('popular');
  if (pop) {
    DATA.slice().sort(byPopular).slice(0, 3).forEach(function (r) { pop.appendChild(card(r)); });
  }

  /* ---------- レシピガチャ ----------
     重複しないように引く。同じ料理が並んでも献立にならないため。
     そのぶん、引ける数はレシピの数が上限になる。足りないときは正直にそう出す。 */
  var gachaList = document.getElementById('gacha-cards');
  if (gachaList) {
    var gState = { tag: '', pull: 1 };
    var note = document.getElementById('gacha-note');
    var drawn = false;

    var gPool = function () {
      return DATA.filter(function (r) { return !gState.tag || r.tags.indexOf(gState.tag) > -1; });
    };

    var shuffle = function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    };

    var drawNow = function () {
      var p = gPool();
      var n = Math.min(gState.pull, p.length);
      gachaList.innerHTML = '';
      shuffle(p).slice(0, n).forEach(function (r, i) {
        var li = card(r);
        li.classList.add('reveal');
        li.style.animationDelay = (i * 90) + 'ms';
        gachaList.appendChild(li);
      });

      if (!p.length) {
        note.textContent = ja
          ? 'このタグに当てはまるレシピがまだありません。タグを外して引いてみてください。'
          : 'No recipes carry this tag yet. Try clearing the tag.';
      } else if (n < gState.pull) {
        note.textContent = ja
          ? gState.pull + '連を引きましたが、いま引ける対象は ' + p.length + ' 件です。同じ料理は重ねないので ' + n + ' 件だけ出しています。'
          : 'You drew ' + gState.pull + ', but only ' + p.length + ' ' + plural(p.length) + ' available. No duplicates, so here are ' + n + '.';
      } else {
        note.textContent = ja ? n + ' 件出ました。' : n + ' ' + plural(n) + ' drawn.';
      }
      drawn = true;
    };

    function paintGacha() {
      var chipsG = document.getElementById('chips');
      if (chipsG) {
        buildChips(chipsG, gState.tag, function (k) {
          gState.tag = k;
          paintGacha();
          if (drawn) { drawNow(); }
        });
      }
      document.querySelectorAll('[data-pull]').forEach(function (b) {
        b.setAttribute('aria-pressed', parseInt(b.dataset.pull, 10) === gState.pull ? 'true' : 'false');
      });
    }

    document.querySelectorAll('[data-pull]').forEach(function (b) {
      b.addEventListener('click', function () { gState.pull = parseInt(b.dataset.pull, 10); paintGacha(); });
    });
    document.getElementById('draw').addEventListener('click', drawNow);
    paintGacha();
  }

  /* ---------- レシピページの数値・タグ・関連・動画 ---------- */
  var article = document.querySelector('article[id]');
  if (article) {
    var rec = DATA.filter(function (r) { return r.slug === article.id; })[0];

    var figs = document.getElementById('figures');
    if (rec && figs) {
      /* 再生数は insights の追加権限がまだ無く、取りようがない。
         永久に「—」のままの欄を出すと、壊れているように見えるので出さない。
         取れるようになったら戻す。 */
      [[ja ? 'いいね' : 'Likes', rec.likes],
       [ja ? 'コメント' : 'Comments', rec.comments]].forEach(function (pair) {
        var s = el('span', null, pair[0] + ' ');
        s.appendChild(el('b', null, num(pair[1])));
        figs.appendChild(s);
      });
      var tg = el('div', 'card-tags');
      rec.tags.forEach(function (t) {
        var link = el('a', null, tagName(t));
        link.href = 'recipes.html?tag=' + encodeURIComponent(t);
        var w = el('span');
        w.appendChild(link);
        tg.appendChild(w);
      });
      figs.appendChild(tg);
    }

    /* 関連レシピ。タグの重なりが多い順に3件まで。
       重なりが無いものは出さない（無関係なものを並べても押されない） */
    var rel = document.getElementById('related');
    if (rec && rel) {
      var rows = DATA
        .filter(function (r) { return r.slug !== rec.slug; })
        .map(function (r) {
          return { r: r, shared: r.tags.filter(function (t) { return rec.tags.indexOf(t) > -1; }).length };
        })
        .filter(function (x) { return x.shared > 0; })
        .sort(function (a, b) { return b.shared - a.shared || byNewest(a.r, b.r); })
        .slice(0, 3);

      var wrap = rel.closest('.related-wrap');
      if (wrap) { wrap.hidden = rows.length === 0; }
      rows.forEach(function (x) { rel.appendChild(card(x.r)); });
    }

    /* 動画は押されるまで読み込まない。
       Instagram の埋め込みは重く、こちらで軽くする手段がない。
       レシピを読みに来ただけの人（大半）に、その重さを払わせない。 */
    var slot = document.getElementById('video');
    if (rec && slot && rec.instagram) {
      var btn2 = el('button', 'ig-facade');
      btn2.type = 'button';
      btn2.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
        '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/>' +
        '<circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none"/></svg>';
      var label = el('span');
      label.appendChild(el('b', null, ja ? '動画を見る' : 'Watch the video'));
      label.appendChild(el('span', null, ja
        ? '押すと Instagram の投稿を読み込みます'
        : 'Loads the Instagram post when you tap'));
      btn2.appendChild(label);

      btn2.addEventListener('click', function () {
        var f = document.createElement('iframe');
        f.className = 'ig-embed';
        f.src = rec.instagram.replace(/\/?$/, '/') + 'embed/captioned';
        f.title = rec[LG].title + ' / Instagram';
        f.allowFullscreen = true;
        slot.replaceChild(f, btn2);
      });
      slot.appendChild(btn2);
    }

    /* 分量バーが貼り付いた合図。装飾ではなく状態を伝えている */
    var sentinel = document.querySelector('.qty-sentinel');
    if (bar && sentinel && window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        bar.classList.toggle('is-stuck', !entries[0].isIntersecting);
      }, { rootMargin: '-' + (parseInt(getComputedStyle(root).getPropertyValue('--headh'), 10) + 24) + 'px 0px 0px 0px', threshold: 1 }).observe(sentinel);
    }
  }
})();
