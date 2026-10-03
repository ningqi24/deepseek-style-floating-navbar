/* demo.js —— 仅演示页使用：明暗切换 / 移动端菜单 / 实时调节旋钮 */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var nav = $('#gnav');

  /* 明暗切换：切换 data-theme，组件会跟着换玻璃配色 */
  var themeBtn = $('#theme-toggle');
  var saved = null;
  try { saved = localStorage.getItem('gnav-demo-theme'); } catch (e) {}
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (themeBtn) themeBtn.textContent = t === 'dark' ? '浅色' : '深色';
    try { localStorage.setItem('gnav-demo-theme', t); } catch (e) {}
  }
  applyTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* 移动端菜单 */
  var burger = $('#burger');
  var menu = $('#demo-nav');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') menu.classList.remove('is-open');
    });
  }

  /* 实时调节：把滑块值写回 .gnav 上的 CSS 变量 */
  var knobs = document.querySelectorAll('[data-var]');
  Array.prototype.forEach.call(knobs, function (input) {
    var name = input.getAttribute('data-var');
    var unit = input.getAttribute('data-unit') || 'px';
    var out = input.parentNode.querySelector('.ctl__val');
    var scale = parseFloat(input.getAttribute('data-scale') || '1');

    function sync() {
      var v = parseFloat(input.value) * scale;
      var text = unit === 'alpha' ? v.toFixed(2) : Math.round(v) + unit;
      if (out) out.textContent = text;
      if (unit === 'alpha') nav.style.setProperty(name, 'hsla(0,0%,100%,' + v + ')');
      else nav.style.setProperty(name, v + unit);
      // 参数改了要重新读取令牌：把实例的缓存清掉再 update
      var inst = window.GlassNavbar && window.GlassNavbar.instances[0];
      if (inst) { inst._tokens = null; inst.update(); inst.settle(); }
    }
    input.addEventListener('input', sync);
    sync();
  });

  /* 复制的代码片段跟着当前参数走 */
  var codeBox = $('#snippet');
  function renderSnippet() {
    if (!codeBox) return;
    var vals = {};
    Array.prototype.forEach.call(knobs, function (i) {
      vals[i.getAttribute('data-var')] = parseFloat(i.value) * parseFloat(i.getAttribute('data-scale') || '1');
    });
    codeBox.innerHTML = '.gnav {\n' +
      '  <b>--gnav-inset</b>: ' + Math.round(vals['--gnav-inset']) + 'px;\n' +
      '  <b>--gnav-inner-h-on</b>: ' + Math.round(vals['--gnav-inner-h-on'] || vals['--gnav-inner-h']) + 'px;\n' +
      '  <b>--gnav-pad-y-on</b>: ' + (vals['--gnav-pad-y-on'] || 2) + 'px;\n' +
      '  <b>--gnav-blur</b>: ' + Math.round(vals['--gnav-blur']) + 'px;\n' +
      '  <b>--gnav-surface</b>: hsla(0, 0%, 100%, ' + (vals['--gnav-surface'] || .45).toFixed(2) + ');\n' +
      '}';
  }
  Array.prototype.forEach.call(knobs, function (i) { i.addEventListener('input', renderSnippet); });
  renderSnippet();
})();
