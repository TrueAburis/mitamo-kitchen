(function () {
  var root = document.documentElement;
  var buttons = document.querySelectorAll('[data-set-lang]');

  function apply(lang) {
    root.setAttribute('data-lang', lang);
    root.lang = lang;
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i].dataset.setLang === lang ? 'true' : 'false');
    }
    try { localStorage.setItem('mk-lang', lang); } catch (e) {}
  }

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () { apply(this.dataset.setLang); });
  }

  apply(root.getAttribute('data-lang'));
})();

/* ヘッダーの実測高さを --headh に入れる。分量バーがこの真下に貼り付く */
(function () {
  var head = document.querySelector('.masthead');
  if (!head) return;
  function setH() {
    document.documentElement.style.setProperty('--headh', Math.round(head.getBoundingClientRect().height) + 'px');
  }
  setH();
  if (window.ResizeObserver) { new ResizeObserver(setH).observe(head); }
  else { window.addEventListener('resize', setH); }
})();

/* 材料の開閉。広い画面では常に開いているので、ボタン自体を CSS で隠している */
(function () {
  var bar = document.getElementById('qty');
  if (!bar) return;
  var btn = bar.querySelector('.qty-toggle');
  btn.addEventListener('click', function () {
    var open = bar.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

/* いま読んでいる手順で使う分量を、バーに出し続ける。このサイトの核 */
(function () {
  var bar = document.getElementById('qty');
  if (!bar) return;
  var peekJa = bar.querySelector('.qty-peek .t-ja');
  var peekEn = bar.querySelector('.qty-peek .t-en');
  var stepTag = bar.querySelector('.qty-step');
  var steps = [].slice.call(document.querySelectorAll('.steps li'));
  if (!steps.length || !peekJa) return;

  var defJa = peekJa.textContent, defEn = peekEn.textContent;
  var queued = false;

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
      peekJa.textContent = defJa;
      peekEn.textContent = defEn;
      stepTag.textContent = '';
    }
  }

  window.addEventListener('scroll', function () {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
