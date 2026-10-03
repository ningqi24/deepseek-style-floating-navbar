/**
 * 演示页的多语言词条。组件本体（glass-navbar.css / .js）不含任何文案，不受影响。
 * 页面用 data-i18n / data-i18n-aria / data-i18n-html 引用 key。
 * scripts/check.mjs 会校验中英两侧的 key 完全对齐。
 */
window.GNAV_I18N = {
  zh: {
    'meta.title': '悬浮玻璃胶囊导航栏 · 滚动时弹簧收窄 | glass-navbar',
    'meta.desc': '零依赖的悬浮玻璃胶囊导航栏：滚动时横向内缩、纵向变薄，磨砂玻璃淡入。尺寸变化由弹簧积分驱动，纯 HTML + CSS + JS，无需构建。',

    'nav.quickstart': '快速开始',
    'nav.why': '原理',
    'nav.knobs': '实时调节',
    'nav.params': '参数',
    'nav.api': 'API',
    'nav.compat': '兼容性',

    'aria.github': '在 GitHub 上查看源码',
    'aria.theme': '切换明暗',
    'aria.menu': '菜单',
    'aria.lang': '语言',

    'hero.title': '悬浮玻璃胶囊导航栏',
    'hero.sub': '滚动时横向内缩、纵向变薄，磨砂玻璃淡入。两个文件，零依赖，无构建。',
    'hero.github': '在 GitHub 上查看',
    'hero.copy': '复制引入代码',
    'hero.copied': '已复制',
    'hero.demo': '在线演示',

    'qs.p1': '类名固定三层，中间层 <code>gnav__bar</code> 是胶囊本体。外层设了 <code>pointer-events: none</code>，只有胶囊吃点击，胶囊以外的区域不会挡住底下内容。',
    'qs.p2': '脚本会自动初始化页面上所有 <code>.gnav</code>，不需要写初始化代码。',
    'qs.p3': '设计数值全是 CSS 变量，改 <code>glass-navbar.css</code> 或在自己的样式里覆盖即可，不用碰 JS。',

    'why.p1': '<code>width</code>、<code>padding</code>、<code>height</code> 走 CSS 过渡，本质是「固定时长 + 缓动曲线」。你滚到一半往回滚，它会硬生生掉头 —— 过渡每帧只关心进度，不关心当前速度。',
    'why.p2': '弹簧反过来积分。目标值中途翻转时，它会从当前位置带着当前速度继续走，所以连续上下滚动是连贯的。默认 <code>k = 180</code>、<code>c = 28</code>、<code>m = 1</code>；临界阻尼为 <code>2√(k·m) ≈ 26.8</code>，取 28 略过阻尼：不回弹，收束平滑。',
    'why.li1': '单步时长夹在 1/30 秒内，切回标签页或掉帧时积分不会炸',
    'why.li2': '位移与速度都收敛后吸附到目标并停掉 requestAnimationFrame，静止时零开销',
    'why.li3': '窗口缩放时直接落值，不会看到一段无意义的收放动画',
    'why.li4': '滚动时不读 getComputedStyle，令牌只在初始化和缩放时读一次并缓存',
    'why.li5': 'prefers-reduced-motion 下完全不做动画，直接落值',

    'knobs.p': '拖动滑块即时生效，下方是对应的 CSS，可直接拷走。',

    'knob.inset.n': '滚动后左右各内缩多少。相对容器计算，不是绝对宽度。',
    'knob.innerh.n': '滚动后的胶囊内容高度。调小更紧凑。',
    'knob.pady.n': '滚动后的纵向内边距。',
    'knob.blur.n': '磨砂玻璃模糊半径，0 即纯色背景。',
    'knob.surface.n': '玻璃底色不透明度（浅色主题）。',

    'params.p': '全部在 <code>glass-navbar.css</code> 里以 CSS 变量定义，在 <code>.gnav</code> 上覆盖即可。',
    'params.data.p': '物理参数用 data 属性或 JS 选项覆盖。',
    'tbl.var': '变量 / 属性',
    'tbl.default': '默认值',
    'tbl.desc': '说明',

    'var.inset.d': '滚动后左右各内缩多少',
    'var.insetmin.d': '内缩的最小容器宽度（无单位数字），窄于此值自动不内缩',
    'var.top.d': '容器顶部留白（未滚动 / 滚动后）',
    'var.pady.d': '胶囊纵向内边距',
    'var.innerh.d': '胶囊内容高度',
    'var.padlr.d': '滚动后内容左右内缩，避免贴到圆角',
    'var.maxw.d': '容器最大宽度',
    'var.sidegap.d': '容器距视口左右边缘的留白',
    'var.radius.d': '胶囊圆角',
    'var.blur.d': '磨砂玻璃模糊半径',
    'var.saturate.d': '磨砂玻璃饱和度增强',
    'var.surface.d': '玻璃底色',
    'var.border.d': '玻璃描边',
    'var.shadow.d': '胶囊投影',
    'var.glassdur.d': '玻璃淡入时长（外观走 CSS 过渡，尺寸走弹簧）',
    'var.threshold.d': '触发收窄的滚动距离（px）',
    'var.stiffness.d': '劲度系数 k，越大越快',
    'var.damping.d': '阻尼系数 c，越小越容易回弹',
    'var.mass.d': '质量 m',

    'api.p': '引了脚本就会自动初始化，一般不用手写。需要精细控制时：',

    'compat.p': 'Chrome / Edge 88+、Safari 15.4+、Firefox 103+。不支持 <code>backdrop-filter</code> 时自动退化为纯色背景（@supports 兜底），功能不受影响。深色模式跟随系统，也可用 <code>[data-theme="dark"]</code> 或 <code>.gnav--dark</code> / <code>.gnav--light</code> 强制指定。开启系统「减弱动态效果」后尺寸变化不再有动画。',

    'foot.license': 'MIT 许可 · 零依赖纯前端组件',
    'foot.disclaimer': '名称中的 deepseek-style 仅表示设计参照来源。本项目为独立实现，与 DeepSeek 无任何关联、未获其授权，不含其任何代码、素材或商标。',
  },

  en: {
    'meta.title': 'Floating glass navbar · spring-animated scroll shrink | glass-navbar',
    'meta.desc': 'A zero-dependency floating glass navbar that shrinks horizontally and thins vertically on scroll, with frosted glass fading in. The size transition is driven by an integrated spring. Pure HTML + CSS + JS, no build step.',

    'nav.quickstart': 'Quick start',
    'nav.why': 'How it works',
    'nav.knobs': 'Playground',
    'nav.params': 'Options',
    'nav.api': 'API',
    'nav.compat': 'Compatibility',

    'aria.github': 'View source on GitHub',
    'aria.theme': 'Toggle theme',
    'aria.menu': 'Menu',
    'aria.lang': 'Language',

    'hero.title': 'Floating glass navbar',
    'hero.sub': 'Shrinks horizontally and thins vertically on scroll, with frosted glass fading in. Two files, no dependencies, no build step.',
    'hero.github': 'View on GitHub',
    'hero.copy': 'Copy the snippet',
    'hero.copied': 'Copied',
    'hero.demo': 'Live demo',

    'qs.p1': 'Three fixed class layers; the middle one, <code>gnav__bar</code>, is the pill itself. The outer wrapper uses <code>pointer-events: none</code> so only the pill is clickable — the area around it never blocks the page underneath.',
    'qs.p2': 'The script initialises every <code>.gnav</code> on the page automatically. No init code needed.',
    'qs.p3': 'Every design value is a CSS custom property. Override them in <code>glass-navbar.css</code> or your own stylesheet — no need to touch the JS.',

    'why.p1': 'Animating <code>width</code>, <code>padding</code> or <code>height</code> with a CSS transition is a fixed duration plus an easing curve. Scroll back up mid-animation and it snaps direction — the transition only tracks progress, not current velocity.',
    'why.p2': 'A spring integrates instead. When the target flips mid-flight it carries its current velocity, so scrolling up and down repeatedly stays continuous. Defaults are <code>k = 180</code>, <code>c = 28</code>, <code>m = 1</code>; critical damping is <code>2√(k·m) ≈ 26.8</code>, so 28 is slightly overdamped: no bounce, smooth settle.',
    'why.li1': 'Integration step capped at 1/30s so returning to the tab never blows up',
    'why.li2': 'Snaps to the target and stops the rAF loop once position and velocity converge — zero cost at rest',
    'why.li3': 'On resize it settles instantly instead of playing a pointless animation',
    'why.li4': 'getComputedStyle is read once on init and on resize, never inside the scroll handler',
    'why.li5': 'No animation at all under prefers-reduced-motion — values are applied directly',

    'knobs.p': 'Drag a slider to change the navbar live. The matching CSS is generated below.',

    'knob.inset.n': 'How far the pill insets on each side once scrolled. Relative to the container, not a fixed width.',
    'knob.innerh.n': 'Pill content height while scrolled. Smaller is tighter.',
    'knob.pady.n': 'Vertical padding while scrolled.',
    'knob.blur.n': 'Frosted-glass blur radius. 0 gives a flat background.',
    'knob.surface.n': 'Glass fill opacity (light theme).',

    'params.p': 'All defined as CSS custom properties in <code>glass-navbar.css</code>; override them on <code>.gnav</code>.',
    'params.data.p': 'Physics parameters go through data attributes or JS options.',
    'tbl.var': 'Property',
    'tbl.default': 'Default',
    'tbl.desc': 'Description',

    'var.inset.d': 'How far the pill insets on each side once scrolled',
    'var.insetmin.d': 'Minimum container width for insetting (unitless); below it the pill does not inset',
    'var.top.d': 'Wrapper top padding (idle / scrolled)',
    'var.pady.d': 'Pill vertical padding',
    'var.innerh.d': 'Pill content height',
    'var.padlr.d': 'Content inset once scrolled, keeps text off the rounded corners',
    'var.maxw.d': 'Maximum wrapper width',
    'var.sidegap.d': 'Gap between the wrapper and the viewport edges',
    'var.radius.d': 'Pill corner radius',
    'var.blur.d': 'Frosted-glass blur radius',
    'var.saturate.d': 'Frosted-glass saturation boost',
    'var.surface.d': 'Glass fill',
    'var.border.d': 'Glass border',
    'var.shadow.d': 'Pill shadow',
    'var.glassdur.d': 'Glass fade duration (appearance transitions, size springs)',
    'var.threshold.d': 'Scroll distance that triggers the shrink (px)',
    'var.stiffness.d': 'Spring stiffness k — higher is faster',
    'var.damping.d': 'Damping c — lower bounces more',
    'var.mass.d': 'Mass m',

    'api.p': 'Including the script auto-initialises everything; you rarely need this. For fine control:',

    'compat.p': 'Chrome / Edge 88+, Safari 15.4+, Firefox 103+. Without <code>backdrop-filter</code> support it degrades to a flat background via @supports — behaviour is unaffected. Dark mode follows the system, or force it with <code>[data-theme="dark"]</code> / <code>.gnav--dark</code> / <code>.gnav--light</code>. Under prefers-reduced-motion the size change is applied instantly.',

    'foot.license': 'MIT licensed · zero-dependency front-end component',
    'foot.disclaimer': 'The "deepseek-style" in the name refers to the design reference only. This project is an independent implementation, not affiliated with or endorsed by DeepSeek, and contains none of their code, assets or trademarks.',
  },
};

/** 把指定语言应用到当前文档。 */
window.gnavApplyLang = function (lang) {
  var dict = window.GNAV_I18N || {};
  var table = dict[lang] || dict.zh || {};
  var fallback = dict.zh || {};

  document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var v = table[el.getAttribute('data-i18n')] || fallback[el.getAttribute('data-i18n')];
    if (typeof v === 'string') el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
    var v = table[el.getAttribute('data-i18n-html')] || fallback[el.getAttribute('data-i18n-html')];
    if (typeof v === 'string') el.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
    var v = table[el.getAttribute('data-i18n-aria')] || fallback[el.getAttribute('data-i18n-aria')];
    if (typeof v === 'string') el.setAttribute('aria-label', v);
  });

  var t = table['meta.title'] || fallback['meta.title'];
  if (t) document.title = t;
  var d = table['meta.desc'] || fallback['meta.desc'];
  var meta = document.querySelector('meta[name="description"]');
  if (d && meta) meta.setAttribute('content', d);
};
