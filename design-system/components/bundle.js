/* @ds-bundle: {"format":4,"namespace":"Arcana","components":[{"name":"Icon"},{"name":"Button"},{"name":"TextField"},{"name":"Tag"},{"name":"SegmentedControl"},{"name":"Switch"},{"name":"Divider"},{"name":"AppNav"},{"name":"TarotCard"},{"name":"CardTile"},{"name":"Spread"},{"name":"FeaturedCard"},{"name":"ProgressMeter"},{"name":"MeaningPanel"},{"name":"JournalEntry"},{"name":"Notice"},{"name":"Flashcard"},{"name":"CardBack"},{"name":"NightSky"},{"name":"Sparkles"},{"name":"ShuffleDeck"},{"name":"CardFan"},{"name":"ReadingRitual"}]} */
(function () {
  var React = window.React, h = React.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }

  /* ---------- Icon: a small hand-drawn-feeling line set (1.6 stroke, round caps) ---------- */
  var PATHS = {
    home: 'M3.5 10.5 12 4l8.5 6.5M6 9v10.5h4.5V15h3v4.5H18V9',
    library: 'M5 4.5h4v15H5zM10.5 4.5h4v15h-4zM16 5.2l3.4-.9 3.1 14.6-3.4.8z',
    reading: 'M4 6.5h5v11H4zM9.5 5h5v14h-5zM15 6.5h5v11h-5z',
    study: 'M3 8.5 12 4.5l9 4-9 4-9-4zM7 10.5v4.2c0 1.4 2.2 2.8 5 2.8s5-1.4 5-2.8v-4.2M21 8.5v5',
    journal: 'M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6zM6 3.5v17M9.5 8h5.5M9.5 11.5h5.5',
    settings: 'M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6',
    search: 'M10.5 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM15 15l5 5',
    plus: 'M12 5v14M5 12h14',
    check: 'M5 12.5l4.2 4L19 7',
    arrow: 'M5 12h14M13.5 6.5 19 12l-5.5 5.5',
    shuffle: 'M4 7h3.5c4 0 5 10 9 10H20M4 17h3.5c1.6 0 2.7-1.6 3.6-3.5M14 10c.8-1.6 1.6-3 3-3H20M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5',
    bookmark: 'M7 4h10v16l-5-3.5L7 20z',
    pen: 'M15.5 4.5l4 4L9 19H5v-4zM13.5 6.5l4 4',
    turn: 'M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4',
    info: 'M12 3.8a8.2 8.2 0 1 0 0 16.4 8.2 8.2 0 0 0 0-16.4zM12 11v5M12 7.8v.4',
    x: 'M6 6l12 12M18 6 6 18'
  };
  function Icon(p) {
    var d = PATHS[p.name] || PATHS.info;
    return h('svg', { className: cx('ar-icon', p.className), viewBox: '0 0 24 24', width: p.size || 20, height: p.size || 20, 'aria-hidden': p.label ? undefined : true, role: p.label ? 'img' : undefined, 'aria-label': p.label },
      d.split('M').filter(Boolean).map(function (s, i) { return h('path', { key: i, d: 'M' + s }); }));
  }

  /* ---------- Button ---------- */
  function Button(p) {
    var rest = omit(p, ['variant', 'size', 'icon', 'iconAfter', 'className', 'children']);
    return h('button', Object.assign({ type: 'button' }, rest, { className: cx('ar-btn', 'ar-btn-' + (p.variant || 'secondary'), p.size === 'sm' && 'ar-btn-sm', p.className) }),
      p.icon ? h(Icon, { name: p.icon, size: 18 }) : null, p.children, p.iconAfter ? h(Icon, { name: p.iconAfter, size: 18 }) : null);
  }

  /* ---------- TextField ---------- */
  var uid = 0;
  function TextField(p) {
    var ref = React.useRef(null); if (!ref.current) ref.current = p.id || 'ar-f' + (++uid);
    var id = ref.current, hintId = id + '-hint';
    var rest = omit(p, ['label', 'hint', 'multiline', 'id', 'className']);
    var ctl = h(p.multiline ? 'textarea' : 'input', Object.assign({ id: id, className: 'ar-input', rows: p.multiline ? (p.rows || 5) : undefined, 'aria-describedby': p.hint ? hintId : undefined }, rest));
    return h('div', { className: cx('ar-field', p.className) }, h('label', { htmlFor: id }, p.label), ctl, p.hint ? h('span', { id: hintId, className: 'ar-hint' }, p.hint) : null);
  }

  /* ---------- Tag (static label, or a filter chip when onClick / selected is given) ---------- */
  function Tag(p) {
    var chip = p.onClick !== undefined || p.selected !== undefined;
    if (chip) return h('button', { type: 'button', className: cx('ar-tag', p.className), 'aria-pressed': !!p.selected, onClick: p.onClick }, p.selected ? h(Icon, { name: 'check', size: 16 }) : null, p.children);
    return h('span', { className: cx('ar-tag', p.tone && p.tone !== 'neutral' && 'ar-tag-' + p.tone, p.className) }, p.children);
  }

  /* ---------- SegmentedControl ---------- */
  function SegmentedControl(p) {
    var st = React.useState(p.defaultValue || (p.options[0] && p.options[0].value)), val = p.value !== undefined ? p.value : st[0];
    function pick(v) { st[1](v); if (p.onChange) p.onChange(v); }
    return h('div', { className: 'ar-seg', role: 'radiogroup', 'aria-label': p.label },
      p.options.map(function (o) { return h('button', { key: o.value, type: 'button', role: 'radio', 'aria-checked': o.value === val, onClick: function () { pick(o.value); } }, o.label); }));
  }

  /* ---------- Switch (a settings row) ---------- */
  function Switch(p) {
    var st = React.useState(!!p.defaultChecked), on = p.checked !== undefined ? p.checked : st[0];
    var ref = React.useRef(null); if (!ref.current) ref.current = 'ar-s' + (++uid);
    function toggle() { st[1](!on); if (p.onChange) p.onChange(!on); }
    return h('div', { className: 'ar-switch' },
      h('div', { className: 'ar-switch-text' }, h('span', { className: 'ar-switch-label', id: ref.current }, p.label), p.description ? h('span', { className: 'ar-hint' }, p.description) : null),
      h('button', { type: 'button', role: 'switch', 'aria-checked': on, 'aria-labelledby': ref.current, onClick: toggle }));
  }

  /* ---------- Divider: a pencil rule, or a small botanical sprig ---------- */
  function Divider(p) {
    if (p.variant === 'star') return h('div', { className: 'ar-divider ar-divider-sprig ar-divider-star', role: 'separator' },
      h('svg', { viewBox: '0 0 44 18', fill: 'currentColor' }, h('path', { d: star4(22, 9, 8) }), h('path', { d: star4(9, 9, 3) }), h('path', { d: star4(35, 9, 3) })));
    if (p.variant === 'sprig') return h('div', { className: 'ar-divider ar-divider-sprig', role: 'separator' },
      h('svg', { viewBox: '0 0 44 18', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' },
        h('path', { d: 'M4 12c8-1 22-1 36-4' }), h('path', { d: 'M12 11.5c-1-3 1-6 4-7-.5 3-1.8 5.5-4 7zM20 11c1-3.5 4-5.5 7-5.5-1 3-3.5 5-7 5.5zM27 10c-2-2.5-2-5.5 0-7.5 1.5 2.5 1.5 5 0 7.5zM16 11.8c1.5 2 4 3 6.5 2.5-1.6-1.8-4-2.6-6.5-2.5z' })));
    return h('div', { className: 'ar-divider', role: 'separator' },
      h('svg', { viewBox: '0 0 400 8', preserveAspectRatio: 'none', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' },
        h('path', { d: 'M1 4.5c40-1.2 80 .8 130-.4s90-1 140 .3 90-.6 128-.2' })));
  }

  /* ---------- AppNav ---------- */
  var NAV = [['home', 'Home', 'home'], ['library', 'Card library', 'library'], ['reading', 'Reading room', 'reading'], ['study', 'Study', 'study'], ['journal', 'Journal', 'journal'], ['settings', 'Settings', 'settings']];
  function AppNav(p) {
    var items = p.items || NAV.map(function (n) { return { id: n[0], label: n[1], icon: n[2], href: '#' + n[0] }; });
    var bottom = p.orientation === 'bottom';
    return h('nav', { className: cx('ar-nav', bottom && 'ar-nav-bottom', p.className), 'aria-label': 'Main' },
      h('div', { className: 'ar-nav-brand' }, 'Arcana', h('span', null, '.')),
      items.map(function (it) {
        return h('a', { key: it.id, href: it.href || '#', 'aria-current': it.id === p.active ? 'page' : undefined, onClick: p.onNavigate ? function (e) { e.preventDefault(); p.onNavigate(it.id); } : undefined },
          h(Icon, { name: it.icon || it.id }), h('span', null, bottom && it.shortLabel ? it.shortLabel : it.label));
      }));
  }

  /* ---------- TarotCard ---------- */
  function TarotCard(p) {
    var down = !!p.faceDown, interactive = !!p.onClick;
    var prev = React.useRef(down), rv = React.useState(false);
    React.useEffect(function () {
      if (prev.current && !down && !prefersReducedMotion()) { rv[1](true); var t = setTimeout(function () { rv[1](false); }, 1400); prev.current = down; return function () { clearTimeout(t); }; }
      prev.current = down;
    }, [down]);
    var face = p.src
      ? h('img', { src: p.src, alt: down ? '' : (p.name || '') + (p.reversed ? ' (reversed)' : ''), loading: 'lazy', draggable: false })
      : h('div', { className: 'ar-tc-ph', 'aria-hidden': true }, h('b', null, p.numeral || ''),
          h('svg', { viewBox: '0 0 40 40', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 }, h('circle', { cx: 20, cy: 20, r: 12 }), h('path', { d: 'M4 26c10-2 22-2 32 0' })),
          h('span', null, p.name || ''));
    var inner = h('div', { className: 'ar-tc-inner' },
      h('div', { className: 'ar-tc-face' }, face, rv[0] ? h('span', { className: 'ar-tc-shine', 'aria-hidden': true }) : null),
      h('div', { className: 'ar-tc-back', 'aria-hidden': true }, h(CardBack, null)));
    var caption = p.showName && !down ? h('div', { className: 'ar-tc-caption' }, h('span', { className: 'ar-tc-name' }, p.name), p.reversed ? h('span', { className: 'ar-tc-rev' }, 'Reversed') : null) : null;
    var cls = cx('ar-tc', 'ar-tc-' + (p.size || 'md'), down && 'is-down', rv[0] && 'is-revealing', p.reversed && 'is-reversed', p.selected && 'is-selected', p.className);
    var label = down ? (p.label || 'Face-down card — select to reveal') : undefined;
    return interactive
      ? h('button', { type: 'button', className: cls, onClick: p.onClick, 'aria-label': label, 'aria-pressed': p.selected !== undefined ? !!p.selected : undefined, style: p.style }, inner, rv[0] ? h(Sparkles, { count: 14 }) : null, caption)
      : h('div', { className: cls, role: down ? 'img' : undefined, 'aria-label': label, style: p.style }, inner, rv[0] ? h(Sparkles, { count: 14 }) : null, caption);
  }

  /* ---------- CardTile: one card in the library grid ---------- */
  function CardTile(p) {
    return h('a', { className: 'ar-tile', href: p.href || '#' },
      h(TarotCard, { src: p.src, name: p.name, numeral: p.numeral }),
      h('div', { className: 'ar-stack', style: { gap: 4 } },
        h('span', { className: 'ar-tile-meta' }, p.meta),
        h('span', { className: 'ar-tile-name' }, p.name),
        p.keywords ? h('div', { className: 'ar-tile-keys' }, p.keywords.map(function (k) { return h(Tag, { key: k }, k); })) : null));
  }

  /* ---------- Spread: three-card or Celtic Cross, with numbered positions ---------- */
  var THREE = [['Past', 'What shaped this'], ['Present', 'Where you stand'], ['Future', 'Where it leans']];
  var CELTIC = [['Present', 'The heart of the matter'], ['Challenge', 'What crosses you'], ['Foundation', 'What lies beneath'], ['Recent past', 'What is passing'], ['Possibility', 'What could be'], ['Near future', 'What comes next'], ['Self', 'How you meet it'], ['Surroundings', 'People and places around you'], ['Hopes and fears', 'What you carry'], ['Outcome', 'Where this is heading']];
  function Spread(p) {
    var celtic = p.type === 'celtic', pos = p.positions || (celtic ? CELTIC : THREE), cards = p.cards || [];
    function slot(i) {
      var c = cards[i] || {}, revealed = c.revealed !== false && !!c.name;
      return h('div', { key: i, className: cx('ar-slot', 'c' + (i + 1)) },
        h('span', { className: 'ar-num', 'aria-hidden': true }, i + 1),
        h(TarotCard, { src: c.src, name: c.name, reversed: c.reversed, faceDown: !revealed, selected: p.current === i, onClick: p.onCardClick ? function () { p.onCardClick(i); } : undefined, label: 'Position ' + (i + 1) + ', ' + pos[i][0] + (revealed ? ': ' + c.name : ' — select to reveal') }),
        !celtic ? h('div', { className: 'ar-slot-label' }, h('span', { className: 'ar-overline' }, (i + 1) + ' · ' + pos[i][1]), h('span', { className: 'ar-slot-pos' }, pos[i][0]), revealed ? h('span', { className: 'ar-hint' }, c.name + (c.reversed ? ', reversed' : '')) : null) : null);
    }
    if (!celtic) return h('div', { className: 'ar-spread-three' }, pos.map(function (_, i) { return slot(i); }));
    return h('div', { className: 'ar-spread' },
      h('div', { className: 'ar-celtic' }, h('div', { className: 'ar-cross' }, [0, 1, 2, 3, 4, 5].map(slot)), h('div', { className: 'ar-staff' }, [6, 7, 8, 9].map(slot))),
      p.legend === false ? null : h('ol', { className: 'ar-legend', 'aria-label': 'Positions' }, pos.map(function (ps, i) {
        var c = cards[i] || {}, revealed = c.revealed !== false && !!c.name;
        return h('li', { key: i, className: p.current === i ? 'is-current' : undefined }, h('b', null, i + 1), h('span', null, ps[0], h('small', null, revealed ? c.name + (c.reversed ? ' · reversed' : '') : ps[1])));
      })));
  }

  /* ---------- FeaturedCard: the Home hero ---------- */
  function FeaturedCard(p) {
    return h('section', { className: 'ar-feature', 'aria-label': p.eyebrow || 'Card of the day' },
      h(NightSky, { as: 'div', className: 'ar-window', stars: 22, seed: 5 }, h(TarotCard, { src: p.src, name: p.name, size: 'lg', reversed: p.reversed })),
      h('div', { className: 'ar-feature-body' },
        h('span', { className: 'ar-overline' }, p.eyebrow || 'Card of the day'),
        h('h2', { className: 'ar-feature-name' }, p.name),
        p.keywords ? h('div', { className: 'ar-tile-keys' }, p.keywords.map(function (k) { return h(Tag, { key: k, tone: 'terracotta' }, k); })) : null,
        p.summary ? h('p', { style: { margin: 0, fontSize: 17, lineHeight: '28px' } }, p.summary) : null,
        p.prompt ? h('p', { className: 'ar-prompt' }, p.prompt) : null,
        p.actions ? h('div', { className: 'ar-row', style: { marginTop: 8 } }, p.actions) : null));
  }

  /* ---------- ProgressMeter ---------- */
  function ProgressMeter(p) {
    var max = p.max || 100, v = Math.max(0, Math.min(max, p.value || 0));
    return h('div', { className: 'ar-progress' },
      h('div', { className: 'ar-progress-head' }, h('span', null, p.label), h('span', null, p.caption || (v + ' of ' + max))),
      h('div', { className: 'ar-progress-track', role: 'progressbar', 'aria-label': p.label, 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': v },
        h('div', { className: 'ar-progress-fill', style: { width: (v / max * 100) + '%' } })));
  }

  /* ---------- MeaningPanel: Card Detail reference block ---------- */
  function MeaningPanel(p) {
    return h('div', { className: 'ar-meaning' },
      p.keywords ? h('div', { className: 'ar-tile-keys' }, p.keywords.map(function (k) { return h(Tag, { key: k }, k); })) : null,
      h('section', null, h('h3', null, h(Icon, { name: 'arrow', size: 18, className: 'ar-up' }), 'Upright'), h('p', null, p.upright)),
      p.reversed ? h('section', { className: 'ar-meaning-rev' }, h('h3', null, h(Icon, { name: 'arrow', size: 18 }), 'Reversed'), h('p', null, p.reversed)) : null,
      p.symbolism ? h('section', null, h('h3', null, 'Symbolism'), h('p', null, p.symbolism)) : null);
  }

  /* ---------- JournalEntry ---------- */
  function JournalEntry(p) {
    return h('a', { className: 'ar-entry', href: p.href || '#' },
      h('div', { className: 'ar-entry-date' }, h('b', null, p.day), h('span', null, p.month)),
      h('div', { className: 'ar-entry-body' },
        h('span', { className: 'ar-overline' }, p.spread),
        h('span', { className: 'ar-entry-title' }, p.title),
        p.excerpt ? h('span', { className: 'ar-entry-text' }, p.excerpt) : null,
        p.tags ? h('div', { className: 'ar-tile-keys', style: { marginTop: 4 } }, p.tags.map(function (t) { return h(Tag, { key: t, tone: 'rose' }, t); })) : null),
      p.cards ? h('div', { className: 'ar-entry-cards', 'aria-hidden': true }, p.cards.map(function (src, i) { return h('img', { key: i, src: src, alt: '' }); })) : null);
  }

  /* ---------- Notice: inline feedback after draw / save ---------- */
  function Notice(p) {
    var tone = p.tone || 'success';
    return h('div', { className: cx('ar-notice', 'ar-notice-' + tone), role: 'status' },
      h(Icon, { name: tone === 'success' ? 'check' : 'info' }),
      h('div', { className: 'ar-notice-body' }, p.title ? h('span', { className: 'ar-notice-title' }, p.title) : null, p.children ? h('span', null, p.children) : null),
      p.action ? h('div', { className: 'ar-notice-action' }, p.action) : null);
  }

  /* ---------- Flashcard: Study ---------- */
  function Flashcard(p) {
    var st = React.useState(!!p.defaultFlipped), on = p.flipped !== undefined ? p.flipped : st[0];
    function flip() { st[1](!on); if (p.onFlip) p.onFlip(!on); }
    return h('button', { type: 'button', className: cx('ar-flash', on && 'is-flipped'), onClick: flip, 'aria-label': on ? 'Answer shown. Select to see the question.' : 'Select to reveal the answer.' },
      h('div', { className: 'ar-flash-inner' },
        h('div', { className: 'ar-flash-side', 'aria-hidden': on }, h('span', { className: 'ar-overline' }, p.eyebrow || 'Question'), h('span', { className: 'ar-flash-q' }, p.front), h('span', { className: 'ar-flash-hint' }, h(Icon, { name: 'turn', size: 16 }), 'Tap to turn over')),
        h('div', { className: 'ar-flash-side ar-flash-back', 'aria-hidden': !on }, h('span', { className: 'ar-overline' }, 'Answer'), h('span', { className: 'ar-flash-a' }, p.back), h('span', { className: 'ar-flash-hint' }, h(Icon, { name: 'turn', size: 16 }), 'Tap to turn back'))));
  }


  /* ================= Storybook magic: helpers ================= */
  function prefersReducedMotion() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function seeded(seed) { var a = seed >>> 0; return function () { a = (a + 0x6d2b79f5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function star4(x, y, r) { var q = r * 0.18; return 'M' + x + ' ' + (y - r) + 'Q' + (x + q) + ' ' + (y - q) + ' ' + (x + r) + ' ' + y + 'Q' + (x + q) + ' ' + (y + q) + ' ' + x + ' ' + (y + r) + 'Q' + (x - q) + ' ' + (y + q) + ' ' + (x - r) + ' ' + y + 'Q' + (x - q) + ' ' + (y - q) + ' ' + x + ' ' + (y - r) + 'Z'; }

  /* ---------- CardBack: midnight + gold storybook line art (vertically symmetric, so reversals never show from the back) ---------- */
  function CardBack(p) {
    var cx0 = 142, cy0 = 255, rays = [];
    for (var i = 0; i < 16; i++) { var a = i * Math.PI / 8, r1 = 34, r2 = i % 2 ? 44 : 52; rays.push(h('line', { key: i, x1: cx0 + Math.cos(a) * r1, y1: cy0 + Math.sin(a) * r1, x2: cx0 + Math.cos(a) * r2, y2: cy0 + Math.sin(a) * r2 })); }
    var corner = function (x, y, sx, sy, k) { return h('path', { key: k, d: 'M' + x + ' ' + (y + sy * 30) + 'Q' + x + ' ' + y + ' ' + (x + sx * 30) + ' ' + y + 'M' + (x + sx * 8) + ' ' + (y + sy * 8) + 'm-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' }); };
    return h('svg', { className: cx('ar-cardback', p.className), viewBox: '0 0 284 511', preserveAspectRatio: 'none', 'aria-hidden': true },
      h('g', { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4 },
        h('rect', { x: 14, y: 14, width: 256, height: 483, rx: 8 }),
        h('rect', { x: 22, y: 22, width: 240, height: 467, rx: 5, strokeOpacity: 0.55, strokeWidth: 0.8 }),
        corner(32, 32, 1, 1, 'a'), corner(252, 32, -1, 1, 'b'), corner(32, 479, 1, -1, 'c'), corner(252, 479, -1, -1, 'd'),
        h('circle', { cx: cx0, cy: cy0, r: 70, strokeOpacity: 0.5, strokeWidth: 0.8 }),
        h('circle', { cx: cx0, cy: cy0, r: 26 }),
        h('g', { strokeLinecap: 'round' }, rays),
        h('path', { d: 'M142 120v40M142 350v40', strokeOpacity: 0.6, strokeWidth: 0.8 })),
      h('g', { fill: 'currentColor' },
        h('path', { d: 'M150 236a20 20 0 1 0 0 38a24 24 0 1 1 0 -38z', fillOpacity: 0.95 }),
        h('path', { d: star4(142, 100, 16) }), h('path', { d: star4(142, 411, 16) }),
        h('path', { d: star4(96, 140, 5) }), h('path', { d: star4(188, 140, 5) }), h('path', { d: star4(96, 371, 5) }), h('path', { d: star4(188, 371, 5) }),
        h('circle', { cx: 70, cy: 255, r: 2 }), h('circle', { cx: 214, cy: 255, r: 2 }), h('circle', { cx: 116, cy: 182, r: 1.4 }), h('circle', { cx: 168, cy: 182, r: 1.4 }), h('circle', { cx: 116, cy: 329, r: 1.4 }), h('circle', { cx: 168, cy: 329, r: 1.4 })));
  }

  /* ---------- NightSky: midnight surface with candle glow and twinkling stars ---------- */
  function NightSky(p) {
    var stars = React.useMemo(function () {
      var r = seeded(p.seed || 7), n = p.stars || 36, out = [];
      for (var i = 0; i < n; i++) out.push({ x: r() * 100, y: r() * 100, s: r() < 0.22 ? 'spark' : 'dot', z: 0.6 + r() * 1.1, d: (r() * 6).toFixed(2), t: (3 + r() * 4).toFixed(2) });
      return out;
    }, [p.seed, p.stars]);
    return h(p.as || 'section', { className: cx('ar-night', p.className), style: p.style, 'aria-label': p.label },
      h('div', { className: 'ar-sky', 'aria-hidden': true }, stars.map(function (st, i) {
        var style = { left: st.x + '%', top: st.y + '%', '--z': st.z, animationDelay: st.d + 's', animationDuration: st.t + 's' };
        return st.s === 'spark'
          ? h('svg', { key: i, className: 'ar-star ar-star-spark', viewBox: '0 0 20 20', style: style }, h('path', { d: star4(10, 10, 9), fill: 'currentColor' }))
          : h('span', { key: i, className: 'ar-star', style: style });
      })),
      h('div', { className: 'ar-night-body' }, p.children));
  }

  /* ---------- Sparkles: a one-shot burst of gold dust (decorative) ---------- */
  function Sparkles(p) {
    var bits = React.useMemo(function () {
      var r = seeded(p.seed || 3), n = p.count || 12, out = [];
      for (var i = 0; i < n; i++) { var a = (i / n) * Math.PI * 2 + r() * 0.4, d = 40 + r() * 70; out.push({ x: Math.cos(a) * d, y: Math.sin(a) * d - 20, s: 4 + r() * 7, dl: r() * 0.25 }); }
      return out;
    }, [p.count, p.seed]);
    if (prefersReducedMotion()) return null;
    return h('span', { className: 'ar-sparkles', 'aria-hidden': true }, bits.map(function (b, i) {
      return h('svg', { key: i, viewBox: '0 0 20 20', style: { '--x': b.x + 'px', '--y': b.y + 'px', width: b.s, height: b.s, animationDelay: b.dl + 's' } }, h('path', { d: star4(10, 10, 9), fill: 'currentColor' }));
    }));
  }

  /* ---------- ShuffleDeck: a stacked deck that riffles while `shuffling` ---------- */
  function ShuffleDeck(p) {
    var n = p.count || 14, cards = [];
    for (var i = 0; i < n; i++) cards.push(h('div', { key: i, className: 'ar-deck-card', style: { '--i': i, '--side': i % 2 ? 1 : -1, '--d': ((i % 2) * 0.07 + Math.floor(i / 2) * 0.045).toFixed(3) + 's', zIndex: i } }, h(CardBack, null)));
    return h('div', { className: cx('ar-deck', p.shuffling && 'is-shuffling', p.className), style: p.width ? { '--dw': p.width + 'px' } : undefined, role: 'img', 'aria-label': p.shuffling ? 'The deck is being shuffled' : 'A shuffled deck, face down' },
      cards, p.shuffling ? h('span', { className: 'ar-dust', 'aria-hidden': true }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (k) { return h('i', { key: k, style: { '--k': k } }); })) : null);
  }

  /* ---------- CardFan: face-down cards spread in an arc to choose from ---------- */
  function CardFan(p) {
    var n = p.count || 21, spread = p.spread || 80, items = [];
    for (var i = 0; i < n; i++) {
      var a = n === 1 ? 0 : -spread / 2 + (spread * i) / (n - 1), taken = p.taken && p.taken.indexOf(i) >= 0;
      items.push(h('button', { key: i, type: 'button', className: cx('ar-fan-card', taken && 'is-taken'), style: { '--a': a + 'deg', '--i': i }, disabled: taken || p.disabled, 'data-fan-index': i, 'aria-label': 'Choose card ' + (i + 1) + ' of ' + n, onClick: function (e) { if (p.onPick) p.onPick(Number(e.currentTarget.getAttribute('data-fan-index')), e.currentTarget); } }, h(CardBack, null)));
    }
    return h('div', { className: cx('ar-fan', p.className), style: p.cardWidth ? { '--fw': p.cardWidth + 'px' } : undefined, role: 'group', 'aria-label': p.label || 'Choose from the fanned deck' }, items);
  }

  /* ---------- ReadingRitual: shuffle → cut → fan → choose → place → reveal ---------- */
  var RITUAL_COPY = {
    idle: 'Hold your question in mind, then shuffle the deck.',
    shuffling: 'Shuffling the deck…',
    cut: 'Cut the deck: choose one of the three piles.',
    fan: function (k, n) { return 'Choose ' + n + (n === 1 ? ' card' : ' cards') + ' from the fan · ' + k + ' of ' + n + ' chosen'; },
    reveal: 'Turn each card over when you are ready.',
    done: function (n) { return n === 1 ? 'Your card is revealed.' : 'All ' + n + ' cards are revealed.'; }
  };
  function ReadingRitual(p) {
    var celtic = p.layout === 'celtic';
    var positions = p.positions || (celtic ? CELTIC : p.cards && p.cards.length === 1 ? [['Your card', 'What to notice today']] : THREE);
    var need = positions.length, reduced = prefersReducedMotion();
    var st = React.useState(p.initialStep || 'idle'), step = st[0], setStep = st[1];
    var pk = React.useState([]), picked = pk[0], setPicked = pk[1];         // fan indexes, in order chosen
    var fl = React.useState(null), fly = fl[0], setFly = fl[1];               // card in flight
    var rv = React.useState([]), revealed = rv[0], setRevealed = rv[1];
    var cutPile = React.useState(-1);
    var root = React.useRef(null), slots = React.useRef([]), flyEl = React.useRef(null);
    var placed = picked.length - (fly ? 1 : 0);

    function shuffle() {
      setPicked([]); setRevealed([]); setFly(null); cutPile[1](-1);
      setStep('shuffling');
      setTimeout(function () { setStep('cut'); }, reduced ? 0 : 2700);
    }
    function cut(i) { cutPile[1](i); setTimeout(function () { setStep('fan'); }, reduced ? 0 : 750); }
    function pick(index, el) {
      if (fly || picked.length >= need) return;
      var slotIndex = picked.length, target = slots.current[slotIndex];
      var next = picked.concat([index]);
      if (reduced || !root.current || !target) { setPicked(next); if (next.length === need) setStep('reveal'); return; }
      var R = root.current.getBoundingClientRect(), a = el.getBoundingClientRect(), b = target.getBoundingClientRect();
      var angle = parseFloat(el.style.getPropertyValue('--a')) || 0;
      setPicked(next);
      setFly({ slot: slotIndex, x: a.left - R.left + a.width / 2, y: a.top - R.top + a.height / 2, w: el.offsetWidth, tx: b.left - R.left + b.width / 2, ty: b.top - R.top + b.height / 2, tw: target.offsetWidth, angle: angle, rotateTo: celtic && slotIndex === 1 ? 90 : 0 });
    }
    React.useLayoutEffect(function () {
      if (!fly || !flyEl.current) return;
      var el = flyEl.current, raf = requestAnimationFrame(function () { requestAnimationFrame(function () {
        el.style.transform = 'translate(' + (fly.tx - fly.x) + 'px,' + (fly.ty - fly.y) + 'px) rotate(' + fly.rotateTo + 'deg) scale(' + (fly.tw / fly.w) + ')';
      }); });
      return function () { cancelAnimationFrame(raf); };
    }, [fly]);
    function landed() { setFly(null); if (picked.length === need) setStep('reveal'); }
    function reveal(i) {
      if (revealed.indexOf(i) >= 0) return;
      var next = revealed.concat([i]); setRevealed(next);
      if (next.length === need) { setTimeout(function () { setStep('done'); if (p.onComplete) p.onComplete(); }, reduced ? 0 : 900); }
    }

    function slot(i) {
      var filled = i < placed, c = (p.cards || [])[i] || {}, isUp = revealed.indexOf(i) >= 0;
      return h('div', { key: i, className: cx('ar-rslot', 'c' + (i + 1), filled && 'is-filled'), ref: function (el) { slots.current[i] = el; } },
        h('span', { className: 'ar-num', 'aria-hidden': true }, i + 1),
        filled
          ? h(TarotCard, { src: c.src, name: c.name, reversed: c.reversed, faceDown: !isUp, onClick: step === 'reveal' && !isUp ? function () { reveal(i); } : undefined, label: 'Position ' + (i + 1) + ', ' + positions[i][0] + ' — select to turn over' })
          : h('div', { className: 'ar-rslot-empty', 'aria-hidden': true }),
        !celtic ? h('div', { className: 'ar-rslot-label' },
          h('span', { className: 'ar-overline' }, (i + 1) + ' · ' + positions[i][1]),
          h('span', { className: 'ar-rslot-pos' }, positions[i][0]),
          h('span', { className: cx('ar-rslot-card', isUp && 'is-shown') }, isUp ? c.name + (c.reversed ? ' · reversed' : '') : ' ')) : null);
    }
    var layoutEl = celtic
      ? h('div', { className: 'ar-spread ar-ritual-celtic-wrap' }, h('div', { className: 'ar-celtic ar-ritual-celtic' }, h('div', { className: 'ar-cross' }, [0, 1, 2, 3, 4, 5].map(slot)), h('div', { className: 'ar-staff' }, [6, 7, 8, 9].map(slot))),
          h('ol', { className: 'ar-legend', 'aria-label': 'Positions' }, positions.map(function (ps, i) { var c = (p.cards || [])[i] || {}, up = revealed.indexOf(i) >= 0; return h('li', { key: i, className: up ? 'is-shown' : undefined }, h('b', null, i + 1), h('span', null, ps[0], h('small', null, up ? c.name + (c.reversed ? ' · reversed' : '') : ps[1]))); })))
      : h('div', { className: cx('ar-ritual-row', need === 1 && 'is-single') }, positions.map(function (_, i) { return slot(i); }));
    var copy = step === 'fan' ? RITUAL_COPY.fan(picked.length, need) : step === 'done' ? RITUAL_COPY.done(need) : RITUAL_COPY[step];
    var stage = null;
    if (step === 'idle' || step === 'shuffling') stage = h('div', { className: 'ar-stage' }, h(ShuffleDeck, { shuffling: step === 'shuffling' }));
    else if (step === 'cut') stage = h('div', { className: 'ar-stage ar-cut', role: 'group', 'aria-label': 'Choose a pile' }, [0, 1, 2].map(function (k) {
      return h('button', { key: k, type: 'button', className: cx('ar-pile', 'ar-pile-' + k, cutPile[0] === k && 'is-chosen', cutPile[0] >= 0 && cutPile[0] !== k && 'is-gathered'), onClick: function () { if (cutPile[0] < 0) cut(k); }, 'aria-label': 'Pile ' + (k + 1) },
        [0, 1, 2, 3].map(function (j) { return h('div', { key: j, className: 'ar-pile-card', style: { '--j': j } }, h(CardBack, null)); }));
    }));
    else if (step === 'fan') stage = h('div', { className: 'ar-stage ar-stage-fan' }, h(CardFan, { count: p.fanCount || 21, taken: picked, onPick: pick, disabled: !!fly }));

    return h(NightSky, { className: cx('ar-ritual', 'is-' + step, p.className), seed: p.seed || 11, stars: 46, label: 'Reading table' },
      h('div', { className: 'ar-ritual-root', ref: root },
        h('header', { className: 'ar-ritual-head' },
          p.question ? h('h2', { className: 'ar-ritual-q' }, p.question) : null,
          h('p', { className: 'ar-ritual-copy', 'aria-live': 'polite' }, copy)),
        stage,
        h('div', { className: 'ar-ritual-spread' }, layoutEl),
        h('div', { className: 'ar-ritual-actions' },
          step === 'idle' ? h(Button, { variant: 'gold', icon: 'shuffle', onClick: shuffle }, 'Shuffle the deck') : null,
          step === 'done' ? h(F, null, h(Button, { variant: 'night', icon: 'shuffle', onClick: shuffle }, 'Shuffle again'), h(Button, { variant: 'gold', icon: 'bookmark', onClick: p.onSave }, 'Save reading')) : null),
        fly ? h('div', { className: 'ar-fly', ref: flyEl, onTransitionEnd: landed, style: { left: fly.x - fly.w / 2, top: fly.y - fly.w * 0.9, width: fly.w, transform: 'rotate(' + fly.angle + 'deg)' } }, h('div', { className: 'ar-fly-inner' }, h(CardBack, null))) : null));
  }
  var F = React.Fragment;

  window.Arcana = Object.assign(window.Arcana || {}, { Icon: Icon, Button: Button, TextField: TextField, Tag: Tag, SegmentedControl: SegmentedControl, Switch: Switch, Divider: Divider, AppNav: AppNav, TarotCard: TarotCard, CardTile: CardTile, Spread: Spread, FeaturedCard: FeaturedCard, ProgressMeter: ProgressMeter, MeaningPanel: MeaningPanel, JournalEntry: JournalEntry, Notice: Notice, Flashcard: Flashcard, CardBack: CardBack, NightSky: NightSky, Sparkles: Sparkles, ShuffleDeck: ShuffleDeck, CardFan: CardFan, ReadingRitual: ReadingRitual });
})();
