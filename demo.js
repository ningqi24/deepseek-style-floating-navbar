/* demo.js —— 仅演示页使用：语言 / 明暗 / 菜单 / 实时调节 / 复制 / 侧栏高亮 */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var gnav = $('#gnav');
  var root = document.documentElement;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  /* --------------------------------------------------------------- 语言 */
  function setLang(lang) {
    var l = lang === 'en' ? 'en' : 'zh';
    root.setAttribute('data-lang', l);
    store('gnav-demo-lang', l);
    if (typeof window.gnavApplyLang === 'function') window.gnavApplyLang(l);
    $$('.lang button').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-lang') === l); });
  }
  $$('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  setLang(root.getAttribute('data-lang') || 'zh');

  /* --------------------------------------------------------------- 明暗 */
  var themeBtn = $('#theme-toggle');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    store('gnav-demo-theme', t);
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!store('gnav-demo-theme')) applyTheme(e.matches ? 'dark' : 'light');
  });

  /* --------------------------------------------------------------- 菜单 */
  var burger = $('#burger');
  var topnav = $('#topnav');
  if (burger && topnav) {
    burger.addEventListener('click', function () {
      var open = topnav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    topnav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { topnav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ----------------------------------------------------------- 实时调节 */
  var knobs = $$('[data-var]');
  var snippet = $('#knob-snippet');

  function knobValue(input) {
    return parseFloat(input.value) * parseFloat(input.getAttribute('data-scale') || '1');
  }

  function renderSnippet() {
    if (!snippet) return;
    var get = function (name, fallback) {
      for (var i = 0; i < knobs.length; i++) if (knobs[i].getAttribute('data-var') === name) return knobValue(knobs[i]);
      return fallback;
    };
    var lines = [
      '.gnav {',
      '  --gnav-inset: ' + Math.round(get('--gnav-inset', 80)) + 'px;',
      '  --gnav-inner-h-on: ' + Math.round(get('--gnav-inner-h-on', 42)) + 'px;',
      '  --gnav-pad-y-on: ' + get('--gnav-pad-y-on', 2) + 'px;',
      '  --gnav-blur: ' + Math.round(get('--gnav-blur', 12)) + 'px;',
      '  --gnav-surface: hsla(0, 0%, 100%, ' + get('--gnav-surface', 0.45).toFixed(2) + ');',
      '}',
    ];
    snippet.textContent = lines.join('\n');
  }

  knobs.forEach(function (input) {
    var name = input.getAttribute('data-var');
    var unit = input.getAttribute('data-unit') || 'px';
    var out = input.parentNode.querySelector('.knob__val');
    var inst = null;

    function sync() {
      var v = knobValue(input);
      if (out) out.textContent = unit === 'alpha' ? v.toFixed(2) : Math.round(v) + unit;
      if (unit === 'alpha') gnav.style.setProperty(name, 'hsla(0, 0%, 100%, ' + v + ')');
      else gnav.style.setProperty(name, v + unit);
      // 组件把令牌缓存在实例里，改动后要让它重读一次
      inst = inst || (window.GlassNavbar && window.GlassNavbar.instances[0]);
      if (inst) { inst._tokens = null; inst.update(); inst.settle(); }
    }
    input.addEventListener('input', function () { sync(); renderSnippet(); });
    sync();
  });
  renderSnippet();

  /* --------------------------------------------------------------- 复制 */
  var copyBtn = $('#copy-install');
  var installEl = $('#install-snippet');
  if (copyBtn && installEl) {
    copyBtn.addEventListener('click', function () {
      var text = installEl.textContent;
      var label = copyBtn.querySelector('span') || copyBtn;
      var done = function () {
        var prev = label.textContent;
        label.textContent = (window.GNAV_I18N && GNAV_I18N[root.getAttribute('data-lang') || 'zh'] || {})['hero.copied'] || '已复制';
        setTimeout(function () { label.textContent = prev; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
  }

  /* ----------------------------------------------------------- 侧栏高亮 */
  var sideLinks = $$('.doc__side a[href^="#"]');
  var sections = sideLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        sideLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-100px 0px -65% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }
})();
