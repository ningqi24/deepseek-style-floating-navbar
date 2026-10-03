/*!
 * glass-navbar.js —— 悬浮玻璃胶囊导航栏（滚动时弹簧收窄 / 变薄）
 * 零依赖，不需要构建步骤。
 *
 * 行为：未滚动时胶囊贴边、占满容器、完全透明；滚过阈值后同时做三件事
 *   ① 横向内缩（--gnav-inset）浮起来
 *   ② 纵向变薄（--gnav-pad-y / --gnav-inner-h 各收一档）
 *   ③ 磨砂玻璃淡入（由 CSS 负责，见 .gnav.is-scrolled .gnav__bar）
 *
 * 为什么用弹簧积分而不是 CSS transition：
 *   width / padding / height 走 CSS 过渡是"匀速收束 + 固定时长"，看着机械；
 *   弹簧会带着当前速度继续走，所以连续上下滚动时手感是连续、液态的。
 *   默认 stiffness 180 / damping 28 / mass 1，其中 c = 28 ≈ 2·√(k·m) = 2·√180 ≈ 26.8，
 *   刚好在临界阻尼稍过一点：不回弹、平滑收束。
 *
 * 用法：
 *   <script src="glass-navbar.js"></script>   // 自动初始化页面里所有 .gnav
 *   或
 *   const nav = new GlassNavbar(document.querySelector('.gnav'), { threshold: 120 });
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GlassNavbar = api.GlassNavbar;
  if (root.document) {
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', function () { api.GlassNavbar.initAll(); });
    } else {
      api.GlassNavbar.initAll();
    }
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var DEFAULTS = {
    threshold: 80,      // 触发收窄的滚动距离（px），可用 data-gnav-threshold 覆盖
    stiffness: 180,     // 弹簧劲度系数 k
    damping: 28,        // 阻尼系数 c（≈ 临界阻尼 2√(k·m)）
    mass: 1,            // 质量 m
    autoInit: true,
  };

  var REST_VALUE = 0.05;      // 位移收敛阈值
  var REST_VELOCITY = 0.05;   // 速度收敛阈值
  var MAX_STEP = 1 / 30;      // 单步最大时长，掉帧或切回标签页时防止积分炸掉

  function num(value, fallback) {
    var v = parseFloat(value);
    return isFinite(v) ? v : fallback;
  }

  function GlassNavbar(element, options) {
    if (!(this instanceof GlassNavbar)) return new GlassNavbar(element, options);
    var el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) throw new Error('[glass-navbar] 找不到元素');
    var bar = el.querySelector('.gnav__bar');
    var inner = el.querySelector('.gnav__inner');
    if (!bar || !inner) throw new Error('[glass-navbar] 结构不对，需要 .gnav > .gnav__bar > .gnav__inner');

    var opts = {};
    for (var k in DEFAULTS) if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) opts[k] = DEFAULTS[k];
    for (var o in options) if (Object.prototype.hasOwnProperty.call(options, o)) opts[o] = options[o];

    // 允许用 data-* 覆盖
    var attrOpts = {
      threshold: num(el.getAttribute('data-gnav-threshold'), null),
      stiffness: num(el.getAttribute('data-gnav-stiffness'), null),
      damping: num(el.getAttribute('data-gnav-damping'), null),
      mass: num(el.getAttribute('data-gnav-mass'), null),
    };
    for (var a in attrOpts) if (attrOpts[a] !== null) opts[a] = attrOpts[a];

    this.el = el;
    this.bar = bar;
    this.inner = inner;
    this.options = opts;

    // 参与弹簧动画的数值属性，以及各自的落值方式
    this._spec = [
      { key: 'maxWidth', apply: function (v) { bar.style.maxWidth = v + 'px'; } },
      { key: 'padL', apply: function (v) { bar.style.paddingLeft = v + 'px'; } },
      { key: 'padR', apply: function (v) { bar.style.paddingRight = v + 'px'; } },
      { key: 'padY', apply: function (v) { bar.style.paddingTop = v + 'px'; bar.style.paddingBottom = v + 'px'; } },
      { key: 'innerH', apply: function (v) { inner.style.height = v + 'px'; } },
      { key: 'topPad', apply: function (v) { el.style.paddingTop = v + 'px'; } },
    ];

    this._current = {};
    this._target = {};
    this._velocity = {};
    this._tokens = null;
    this._raf = 0;
    this._lastTime = 0;
    this._resizeTimer = 0;
    this._destroyed = false;

    var self = this;
    this._onScroll = function () { self.update(); };
    this._onResize = function () {
      clearTimeout(self._resizeTimer);
      self._resizeTimer = setTimeout(function () {
        self._tokens = null;
        self.update();
        self.settle();
      }, 120);
    };
    this._onReduceChange = function () { self.update(); };
    this._reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    window.addEventListener('scroll', this._onScroll, { passive: true });
    window.addEventListener('resize', this._onResize, { passive: true });
    window.addEventListener('orientationchange', this._onResize, { passive: true });
    if (this._reduceQuery.addEventListener) {
      this._reduceQuery.addEventListener('change', this._onReduceChange);
    }

    this.update();
    this.settle();   // 首帧不做进场动画，直接落在正确状态
  }

  /** 从 CSS 变量读取设计数值（只在初始化与缩放时读，滚动时不读，避免反复计算样式） */
  GlassNavbar.prototype._readTokens = function () {
    var cs = getComputedStyle(this.el);
    var get = function (name, fallback) { return num(cs.getPropertyValue(name), fallback); };
    return {
      top: get('--gnav-top', 8),
      topOn: get('--gnav-top-on', 5),
      padY: get('--gnav-pad-y', 4),
      padYOn: get('--gnav-pad-y-on', 2),
      innerH: get('--gnav-inner-h', 48),
      innerHOn: get('--gnav-inner-h-on', 42),
      inset: get('--gnav-inset', 80),
      insetMin: get('--gnav-inset-min', 720),
      padLOn: get('--gnav-pad-l-on', 18),
      padROn: get('--gnav-pad-r-on', 12),
    };
  };

  /** 依据滚动位置与容器宽度算出目标值，并切换玻璃状态类 */
  GlassNavbar.prototype.update = function () {
    if (this._destroyed) return;
    if (!this._tokens) this._tokens = this._readTokens();
    var t = this._tokens;

    var scrolled = window.pageYOffset > this.options.threshold;
    if (scrolled !== this.isScrolled) {
      this.isScrolled = scrolled;
      if (scrolled) this.el.classList.add('is-scrolled');
      else this.el.classList.remove('is-scrolled');
    }

    var avail = this.el.clientWidth;
    var inset = t.inset > 0 && avail > t.insetMin ? t.inset : 0;

    this._target.maxWidth = scrolled ? avail - inset : avail;
    this._target.padL = scrolled ? t.padLOn : 0;
    this._target.padR = scrolled ? t.padROn : 0;
    this._target.padY = scrolled ? t.padYOn : t.padY;
    this._target.innerH = scrolled ? t.innerHOn : t.innerH;
    this._target.topPad = scrolled ? t.topOn : t.top;

    this._start();
  };

  GlassNavbar.prototype._paint = function () {
    for (var i = 0; i < this._spec.length; i++) {
      this._spec[i].apply(this._current[this._spec[i].key]);
    }
  };

  /** 不做动画，直接落到目标值（初始化、缩放、reduced-motion 时用） */
  GlassNavbar.prototype.settle = function () {
    for (var i = 0; i < this._spec.length; i++) {
      var k = this._spec[i].key;
      this._current[k] = this._target[k];
      this._velocity[k] = 0;
    }
    cancelAnimationFrame(this._raf);
    this._raf = 0;
    this._paint();
  };

  GlassNavbar.prototype._start = function () {
    if (this._reduceQuery.matches) { this.settle(); return; }
    if (this._raf || this._destroyed) return;
    this._lastTime = performance.now();
    var self = this;
    this._raf = requestAnimationFrame(function (now) { self._tick(now); });
  };

  GlassNavbar.prototype._tick = function (now) {
    var dt = (now - this._lastTime) / 1000;
    this._lastTime = now;
    if (!isFinite(dt) || dt <= 0) dt = 1 / 60;
    if (dt > MAX_STEP) dt = MAX_STEP;

    var k = this.options.stiffness;
    var c = this.options.damping;
    var m = this.options.mass;
    var settled = true;

    for (var i = 0; i < this._spec.length; i++) {
      var key = this._spec[i].key;
      var x = this._current[key];
      var v = this._velocity[key];
      var goal = this._target[key];
      var a = (-k * (x - goal) - c * v) / m;
      v += a * dt;
      x += v * dt;
      if (Math.abs(x - goal) < REST_VALUE && Math.abs(v) < REST_VELOCITY) { x = goal; v = 0; }
      else settled = false;
      this._current[key] = x;
      this._velocity[key] = v;
    }

    this._paint();

    if (settled) { this._raf = 0; return; }
    var self = this;
    this._raf = requestAnimationFrame(function (n) { self._tick(n); });
  };

  /** 移除实例，清掉内联样式与监听器 */
  GlassNavbar.prototype.destroy = function () {
    this._destroyed = true;
    cancelAnimationFrame(this._raf);
    clearTimeout(this._resizeTimer);
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('orientationchange', this._onResize);
    if (this._reduceQuery.removeEventListener) {
      this._reduceQuery.removeEventListener('change', this._onReduceChange);
    }
    for (var i = 0; i < this._spec.length; i++) {
      // 内联值是 JS 写的，清掉即可回到 CSS 定义的初始外观
      var key = this._spec[i].key;
      if (key === 'maxWidth') this.bar.style.maxWidth = '';
      else if (key === 'padL') this.bar.style.paddingLeft = '';
      else if (key === 'padR') this.bar.style.paddingRight = '';
      else if (key === 'padY') { this.bar.style.paddingTop = ''; this.bar.style.paddingBottom = ''; }
      else if (key === 'innerH') this.inner.style.height = '';
      else if (key === 'topPad') this.el.style.paddingTop = '';
    }
    this.el.classList.remove('is-scrolled');
    var idx = GlassNavbar.instances.indexOf(this);
    if (idx !== -1) GlassNavbar.instances.splice(idx, 1);
  };

  GlassNavbar.instances = [];

  /** 初始化页面上所有 .gnav（已初始化过的会跳过） */
  GlassNavbar.initAll = function (context) {
    var scope = context || document;
    var nodes = scope.querySelectorAll('.gnav');
    var made = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.__glassNavbar) continue;
      el.__glassNavbar = new GlassNavbar(el);
      GlassNavbar.instances.push(el.__glassNavbar);
      made.push(el.__glassNavbar);
    }
    return made;
  };

  return { GlassNavbar: GlassNavbar };
});
