/* 全ページ共通。読み込み順は recipes.js → script.js */

(function () {
  var root = document.documentElement;

  /* ---------- 言語 ---------- */
  var langButtons = document.querySelectorAll('[data-set-lang]');

  function lang() { return root.getAttribute('data-lang') === 'en' ? 'en' : 'ja'; }

  function applyLang(next) {
    root.setAttribute('data-lang', next);
    root.lang = next;
    for (var i = 0; i < langButtons.length; i++) {
      langButtons[i].setAttribute('aria-pressed', langButtons[i].dataset.setLang === next ? 'true' : 'false');
    }
    /* 検索欄の説明文はCSSで切り替えられないのでここで入れ替える */
    var boxes = document.querySelectorAll('[data-search]');
    for (var j = 0; j < boxes.length; j++) {
      boxes[j].placeholder = next === 'en' ? boxes[j].dataset.phEn : boxes[j].dataset.phJa;
    }
    try { localStorage.setItem('mk-lang', next); } catch (e) {}
    /* JSで作った部分は自分で描き直してもらう */
    document.dispatchEvent(new CustomEvent('langchange', { detail: next }));
  }

  for (var k = 0; k < langButtons.length; k++) {
    langButtons[k].addEventListener('click', function () { applyLang(this.dataset.setLang); });
  }

  /* ---------- ヘッダーの高さ。分量バーがこの真下に貼り付く ---------- */
  var head = document.querySelector('.masthead');
  if (head) {
    var setH = function () {
      /* header を貼り付けていない画面幅では、分量バーは画面の一番上でよい */
      var sticky = getComputedStyle(head).position === "sticky";
      var h = sticky ? Math.round(head.getBoundingClientRect().height) : 0;
      root.style.setProperty("--headh", h + "px");
    };
    setH();
    if (window.ResizeObserver) { new ResizeObserver(setH).observe(head); }
    else { window.addEventListener('resize', setH); }
  }

  /* ---------- メニューの現在地 ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  var onRecipePage = !!document.querySelector('article[id]');
  document.querySelectorAll('.bar-nav a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href.indexOf('?') > -1 || href.indexOf('#') > -1) return;   /* 人気・タグは別扱い */
    if (href === here || (onRecipePage && href === 'recipes.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });

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
    if (!bar) return;
    var peekJa = bar.querySelector('.qty-peek .t-ja');
    var peekEn = bar.querySelector('.qty-peek .t-en');
    var stepTag = bar.querySelector('.qty-step');
    var steps = [].slice.call(document.querySelectorAll('.steps li'));
    if (!steps.length || !peekJa) return;

    var defJa = peekJa.textContent, defEn = peekEn.textContent, queued = false;

    function update() {
      queued = false;
      var line = bar.getBoundingClientRect().bottom + 48;
      var cur = null, idx = 0;
      for (var i = 0; i < steps.length; i++) {
        var box = steps[i].getBoundingClientRect();
        if (box.top <= line && box.bottom > 0) { cur = steps[i]; idx = i + 1; }
      }
      if (cur) {
        peekJa.textContent = cur.getAttribute('data-uses');
        peekEn.textContent = cur.getAttribute('data-uses-en');
        stepTag.textContent = idx;
      } else {
        peekJa.textContent = defJa; peekEn.textContent = defEn; stepTag.textContent = '';
      }
    }
    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ============ ここから下は recipes.js のデータを使う ============ */
  var DATA = window.RECIPES || [];
  var TAGS = window.TAGS || {};

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }

  function num(v) { return v == null ? '—' : Number(v).toLocaleString('en-US'); }

  /* 英語は1件のとき recipe、それ以外は recipes */
  function plural(n) { return n === 1 ? 'recipe' : 'recipes'; }

  function tagName(key, lg) { return TAGS[key] ? TAGS[key][lg] : key; }

  /* レシピ1件のカード */
  function card(r, lg) {
    var li = el('li', 'card');
    var a = el('a');
    a.href = r.slug + '.html';

    /* TODO: images/ に写真が入ったら figure の中を <img alt="..."> に差し替える */
    var shot = el('figure', 'card-shot');
    shot.appendChild(el('span', null, r.image));
    a.appendChild(shot);

    var h = el('h3', 'card-title', r[lg].title);
    if (lg === 'ja') {
      var sub = el('span', 'en', r.en.title);
      sub.lang = 'en';
      h.appendChild(sub);
    }
    a.appendChild(h);
    a.appendChild(el('p', 'card-lead', r[lg].lead));

    var meta = el('div', 'card-meta');
    meta.appendChild(el('span', null, (lg === 'ja' ? 'いいね ' : 'Likes ') + num(r.likes)));
    meta.appendChild(el('span', null, r.posted));
    a.appendChild(meta);

    var tags = el('div', 'card-tags');
    r.tags.forEach(function (t) { tags.appendChild(el('span', null, tagName(t, lg))); });
    a.appendChild(tags);

    if (!r.ready) {
      a.appendChild(el('span', 'card-draft', lg === 'ja' ? '手順は準備中' : 'Steps coming'));
    }
    li.appendChild(a);
    return li;
  }

  function byPopular(a, b) {
    /* いいね数が未取得のものは、数値のあるものより後ろに置く */
    if (a.likes == null && b.likes == null) { return b.posted.localeCompare(a.posted); }
    if (a.likes == null) { return 1; }
    if (b.likes == null) { return -1; }
    return b.likes - a.likes;
  }

  function byNewest(a, b) { return b.posted.localeCompare(a.posted); }

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
        .concat(r.tags.map(function (t) { return tagName(t, 'ja') + ' ' + tagName(t, 'en'); }))
        .join(' ').toLowerCase();
      return hay.indexOf(q) > -1;
    };

    var render = function () {
      var lg = lang();
      var rows = DATA.filter(matches).sort(state.sort === 'popular' ? byPopular : byNewest);

      list.innerHTML = '';
      rows.forEach(function (r) { list.appendChild(card(r, lg)); });

      var count = document.getElementById('count');
      if (count) {
        count.innerHTML = '';
        count.appendChild(document.createTextNode(lg === 'ja' ? '該当 ' : 'Showing '));
        count.appendChild(el('b', null, rows.length));
        count.appendChild(document.createTextNode(lg === 'ja' ? ' 件' : ' ' + plural(rows.length)));
      }

      var empty = document.getElementById('empty');
      if (empty) { empty.hidden = rows.length > 0; }

      document.querySelectorAll('[data-tag]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.tag === state.tag ? 'true' : 'false');
        b.textContent = b.dataset.tag ? tagName(b.dataset.tag, lg) : (lg === 'ja' ? 'すべて' : 'All');
      });
      document.querySelectorAll('[data-sort]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.sort === state.sort ? 'true' : 'false');
        b.textContent = b.dataset.sort === 'popular'
          ? (lg === 'ja' ? 'いいねが多い順' : 'Most liked')
          : (lg === 'ja' ? '新しい順' : 'Newest');
      });
    };

    /* タグは recipes.js の TAGS の順。「すべて」を先頭に置く */
    var chips = document.getElementById('chips');
    if (chips) {
      [''].concat(Object.keys(TAGS)).forEach(function (key) {
        var b = el('button', 'chip');
        b.type = 'button';
        b.dataset.tag = key;
        b.addEventListener('click', function () {
          state.tag = (state.tag === key) ? '' : key;
          render();
        });
        chips.appendChild(b);
      });
    }

    document.querySelectorAll('[data-sort]').forEach(function (b) {
      b.addEventListener('click', function () { state.sort = b.dataset.sort; render(); });
    });

    if (search) {
      search.form.addEventListener('submit', function (e) { e.preventDefault(); });
      search.addEventListener('input', function () { state.q = search.value.trim(); render(); });
    }

    document.addEventListener('langchange', render);
    render();
  }

  /* ---------- トップの人気のレシピ ---------- */
  var pop = document.getElementById('popular');
  if (pop) {
    var renderPop = function () {
      var lg = lang();
      pop.innerHTML = '';
      DATA.slice().sort(byPopular).slice(0, 3).forEach(function (r) {
        pop.appendChild(card(r, lg));
      });
    };
    document.addEventListener('langchange', renderPop);
    renderPop();
  }

  /* ---------- レシピガチャ ----------
     重複しないように引く。同じ料理が並んでも献立にならないため。
     そのぶん、引ける数はレシピの数が上限になる。足りないときは正直にそう出す。 */
  var gachaList = document.getElementById('gacha-cards');
  if (gachaList) {
    var gState = { tag: '', pull: 1 };
    var note = document.getElementById('gacha-note');

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

    var drawn = false;

    var drawNow = function () {
      var lg = lang();
      var p = gPool();
      var n = Math.min(gState.pull, p.length);
      var picked = shuffle(p).slice(0, n);

      gachaList.innerHTML = '';
      picked.forEach(function (r, i) {
        var li = card(r, lg);
        li.classList.add('reveal');
        li.style.animationDelay = (i * 90) + 'ms';
        gachaList.appendChild(li);
      });

      if (!p.length) {
        note.textContent = lg === 'ja'
          ? 'このタグに当てはまるレシピがまだありません。タグを外して引いてみてください。'
          : 'No recipes carry this tag yet. Try clearing the tag.';
      } else if (n < gState.pull) {
        note.textContent = lg === 'ja'
          ? gState.pull + '連を引きましたが、いま引ける対象は ' + p.length + ' 件です。同じ料理は重ねないので ' + n + ' 件だけ出しています。'
          : 'You drew ' + gState.pull + ', but only ' + p.length + ' ' + plural(p.length) + ' available. No duplicates, so here are ' + n + '.';
      } else {
        note.textContent = lg === 'ja' ? n + ' 件出ました。' : n + ' ' + plural(n) + ' drawn.';
      }
      drawn = true;
    };

    var chipsG = document.getElementById('chips');
    if (chipsG) {
      [''].concat(Object.keys(TAGS)).forEach(function (key) {
        var b = el('button', 'chip');
        b.type = 'button';
        b.dataset.tag = key;
        b.addEventListener('click', function () {
          gState.tag = (gState.tag === key) ? '' : key;
          paintGacha();
          if (drawn) { drawNow(); }
        });
        chipsG.appendChild(b);
      });
    }

    document.querySelectorAll('[data-pull]').forEach(function (b) {
      b.addEventListener('click', function () {
        gState.pull = parseInt(b.dataset.pull, 10);
        paintGacha();
      });
    });

    function paintGacha() {
      var lg = lang();
      document.querySelectorAll('[data-tag]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.tag === gState.tag ? 'true' : 'false');
        b.textContent = b.dataset.tag ? tagName(b.dataset.tag, lg) : (lg === 'ja' ? 'すべて' : 'All');
      });
      document.querySelectorAll('[data-pull]').forEach(function (b) {
        b.setAttribute('aria-pressed', parseInt(b.dataset.pull, 10) === gState.pull ? 'true' : 'false');
      });
    }

    document.getElementById('draw').addEventListener('click', drawNow);
    document.addEventListener('langchange', function () {
      paintGacha();
      if (drawn) { drawNow(); }
    });
    paintGacha();
  }

  /* ---------- レシピページの数値・タグ・動画 ---------- */
  var article = document.querySelector('article[id]');
  if (article) {
    var rec = DATA.filter(function (r) { return r.slug === article.id; })[0];

    var figs = document.getElementById('figures');
    if (rec && figs) {
      var renderFigs = function () {
        var lg = lang();
        figs.innerHTML = '';
        [[lg === 'ja' ? 'いいね' : 'Likes', rec.likes],
         [lg === 'ja' ? 'コメント' : 'Comments', rec.comments],
         [lg === 'ja' ? '再生' : 'Views', rec.views]].forEach(function (pair) {
          var s = el('span', null, pair[0] + ' ');
          s.appendChild(el('b', null, num(pair[1])));
          figs.appendChild(s);
        });
        var tg = el('div', 'card-tags');
        rec.tags.forEach(function (t) {
          var link = el('a', null, tagName(t, lg));
          link.href = 'recipes.html?tag=' + encodeURIComponent(t);
          var w = el('span');
          w.appendChild(link);
          tg.appendChild(w);
        });
        figs.appendChild(tg);
      };
      document.addEventListener('langchange', renderFigs);
      renderFigs();
    }

    var slot = document.getElementById('video');
    if (rec && slot && rec.instagram) {
      var f = document.createElement('iframe');
      f.className = 'ig-embed';
      f.src = rec.instagram.replace(/\/?$/, '/') + 'embed/captioned';
      f.title = rec.ja.title + ' / Instagram';
      f.loading = 'lazy';
      f.allowFullscreen = true;
      slot.appendChild(f);
    }
  }

  applyLang(root.getAttribute('data-lang'));
})();
