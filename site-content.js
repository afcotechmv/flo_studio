/* =========================================================
   FLO Studio — site-content.js
   The content layer for the public website.

   - FLO.DEFAULTS mirrors what the public page showed before the
     admin Website editor existed, so an empty database changes
     nothing visually.
   - Saved settings (Supabase key "website") are merged over the
     defaults and applied to the page: section order, visibility
     and the hero text/image.
   - The last good copy is cached in the browser so the page does
     not flash its defaults on repeat visits, and so the site still
     looks right if the database cannot be reached.

   Stage 1 covers: page order, section visibility, hero.
   Further sections are added here in later stages.
   ========================================================= */
(function () {
  'use strict';

  var FLO = (window.FLO = window.FLO || {});
  var CACHE_KEY = 'flo_website_cache_v1';

  /* ── Reorderable sections ───────────────────────────── */
  // els: elements that belong to the section and move together.
  // nav: navbar link (if any) that points at the section.
  FLO.SECTIONS = [
    { key: 'hero',        label: 'Hero & event banner', els: ['.hero', '.event-banner'] },
    { key: 'classes',     label: 'Classes',             els: ['#classes'],     nav: '#classes' },
    { key: 'kids',        label: 'FLO Kids',            els: ['#kids'] },
    { key: 'about',       label: 'Our Story',           els: ['#about'],       nav: '#about' },
    { key: 'instructors', label: 'The Team',            els: ['#instructors'] },
    { key: 'workshops',   label: 'Workshops & Events',  els: ['#workshops'] }
  ];

  /* ── Defaults (identical to the original hard-coded page) ── */
  FLO.DEFAULTS = {
    version: 1,
    order: ['hero', 'classes', 'kids', 'about', 'instructors', 'workshops'],
    hidden: {},
    hero: {
      tagline: 'Feel \u00B7 Look \u00B7 Own \u00B7 Mal\u00E9, Maldives',
      titleLines: ['Feel good.', 'Look strong.', 'Own your journey.'],
      subtitle: 'A women-only studio for movement, strength,\nand mental wellbeing.',
      buttonLabel: 'View Classes',
      buttonLink: '#classes',
      backgroundImage: '',
      imageFade: 0.55
    },
    classes: {
      "header": {
        "label": "What we offer",
        "title": "Find your flow.",
        "sub": "Nine ways to move, breathe, and grow — at your own pace."
      },
      "cards": [
        {
          "id": "class-flow",
          "icon": "images/class-icons/flow.png",
          "name": "Flow",
          "type": "Vinyasa Yoga",
          "desc": "Movement, breath, flexibility, and balance. A continuous flow that connects body and mind.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "All levels welcome",
            "Mats provided"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Sun · 6:00 AM",
              "status": "available"
            },
            {
              "text": "Mon · 7:00 AM",
              "status": "available"
            },
            {
              "text": "Wed · 5:30 PM",
              "status": "available"
            },
            {
              "text": "Thu · 6:30 PM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "class-pulse",
          "icon": "images/class-icons/pulse.png",
          "name": "Pulse",
          "type": "Barre",
          "desc": "Ballet and yoga-inspired movements to tone, strengthen, and improve posture.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "All levels welcome",
            "Equipment provided"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Sun · 8:00 AM",
              "status": "available"
            },
            {
              "text": "Tue · 6:00 PM",
              "status": "full"
            },
            {
              "text": "Thu · 8:00 AM",
              "status": "full"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": true,
          "hidden": false
        },
        {
          "id": "class-soar",
          "icon": "images/class-icons/soar.png",
          "name": "Soar",
          "type": "Aerial Hammock",
          "desc": "Deep stretching, strength, and decompression — suspended in the air with confidence.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "Beginners welcome",
            "Hammock provided"
          ],
          "slotsLabel": "No slots available",
          "slots": [
            {
              "text": "Sun · 9:00 AM · Full",
              "status": "full"
            },
            {
              "text": "Tue · 5:00 PM · Full",
              "status": "full"
            },
            {
              "text": "Thu · 9:00 AM · Full",
              "status": "full"
            }
          ],
          "buttonLabel": "Join Waitlist",
          "buttonLink": "#",
          "waitlist": true,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "class-sculpt",
          "icon": "images/class-icons/sculpt.png",
          "name": "Sculpt",
          "type": "Mat Pilates",
          "desc": "Correct posture, strengthen the core, and improve body alignment on the mat.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "All levels welcome",
            "Mats provided"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Mon · 9:00 AM",
              "status": "available"
            },
            {
              "text": "Wed · 7:00 AM",
              "status": "full"
            },
            {
              "text": "Fri · 6:00 PM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "class-reform",
          "icon": "images/class-icons/reform.png",
          "name": "Reform",
          "type": "Reformer Pilates",
          "desc": "Build strength, control, and alignment using a reformer bed.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "All levels welcome",
            "Reformer bed included"
          ],
          "slotsLabel": "No slots available",
          "slots": [
            {
              "text": "Mon · 6:00 AM · Full",
              "status": "full"
            },
            {
              "text": "Wed · 6:00 AM · Full",
              "status": "full"
            },
            {
              "text": "Fri · 7:00 AM · Full",
              "status": "full"
            },
            {
              "text": "Sun · 5:30 PM · Full",
              "status": "full"
            }
          ],
          "buttonLabel": "Join Waitlist",
          "buttonLink": "#",
          "waitlist": true,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "class-reboot",
          "icon": "images/class-icons/reboot.png",
          "name": "ReBoot",
          "type": "Indoor Bootcamp",
          "desc": "High-intensity workout targeted for weight loss and stamina. Push your limits.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "Intermediate level",
            "Equipment provided"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Tue · 6:00 AM",
              "status": "available"
            },
            {
              "text": "Thu · 6:00 AM",
              "status": "available"
            },
            {
              "text": "Sat · 7:00 AM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": true,
          "hidden": false
        },
        {
          "id": "class-transform",
          "icon": "images/class-icons/transform.png",
          "name": "Transform",
          "type": "Cadillac Pilates",
          "desc": "Strength, resistance, posture correction, and alignment on a reformer with tower.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "Intermediate level",
            "Cadillac bed included"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Tue · 9:00 AM",
              "status": "full"
            },
            {
              "text": "Thu · 5:30 PM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "class-connect",
          "icon": "images/class-icons/connect.png",
          "name": "Connect",
          "type": "Partner Stretch",
          "desc": "Thai yoga bodywork and partner yoga for deep tissue stretch, flexibility, and relaxation.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "Bring a partner",
            "Props provided"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Wed · 6:00 PM",
              "status": "available"
            },
            {
              "text": "Fri · 5:00 PM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "class-reset",
          "icon": "images/class-icons/reset.png",
          "name": "Reset",
          "type": "Meditation & Breathwork",
          "desc": "Calm and relax the mind and body through meditation and breathing practices.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "All levels welcome",
            "Mats provided"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Sun · 7:00 AM",
              "status": "available"
            },
            {
              "text": "Mon · 8:00 PM",
              "status": "available"
            },
            {
              "text": "Wed · 8:00 PM",
              "status": "available"
            },
            {
              "text": "Fri · 8:00 AM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": false,
          "hidden": false
        }
      ]
    },
    kids: {
      "header": {
        "label": "For little ones",
        "title": "FLO Kids",
        "sub": "Introducing girls aged 5–12 to movement, confidence,\nand the joy of being in their body."
      },
      "cards": [
        {
          "id": "kids-fly",
          "icon": "images/class-icons/fly.png",
          "name": "Fly",
          "type": "Aerial for Girls",
          "desc": "A fun, safe introduction to aerial movement using hammocks. Builds strength, confidence, and coordination in a playful environment.",
          "price": "MVR 1,000",
          "meta": [
            "Ages 5–12",
            "Hammock provided",
            "Beginners welcome"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Sat · 9:00 AM",
              "status": "available"
            },
            {
              "text": "Sun · 10:00 AM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "kids-fusion",
          "icon": "images/class-icons/fusion.png",
          "name": "Fusion",
          "type": "Ballet & Aerial",
          "desc": "A blend of classical ballet and aerial movement designed to build grace, posture, flexibility, and fearlessness in young girls.",
          "price": "MVR 1,000",
          "meta": [
            "Ages 5–12",
            "Equipment provided",
            "All levels"
          ],
          "slotsLabel": "No slots available",
          "slots": [
            {
              "text": "Sat · 11:00 AM · Full",
              "status": "full"
            },
            {
              "text": "Sun · 12:00 PM · Full",
              "status": "full"
            }
          ],
          "buttonLabel": "Join Waitlist",
          "buttonLink": "#",
          "waitlist": true,
          "highlight": false,
          "hidden": false
        }
      ]
    }
  };

  /* ── Merge saved settings over the defaults ─────────── */
  function normalizeOrder(stored) {
    var known = FLO.SECTIONS.map(function (s) { return s.key; });
    var out = [];
    (Array.isArray(stored) ? stored : []).forEach(function (k) {
      if (known.indexOf(k) !== -1 && out.indexOf(k) === -1) out.push(k);
    });
    // A section added after a layout was saved goes right after the section
    // that precedes it in the default order (e.g. FLO Kids follows Classes).
    var defaults = FLO.DEFAULTS.order;
    known.forEach(function (k) {
      if (out.indexOf(k) !== -1) return;
      var at = out.length;
      for (var i = defaults.indexOf(k) - 1; i >= 0; i--) {
        var pos = out.indexOf(defaults[i]);
        if (pos !== -1) { at = pos + 1; break; }
      }
      out.splice(at, 0, k);
    });
    return out;
  }

  function clamp01(n, fallback) {
    n = parseFloat(n);
    if (isNaN(n)) return fallback;
    return Math.min(0.95, Math.max(0, n));
  }

  FLO.mergeWebsite = function (stored) {
    var d = FLO.clone(FLO.DEFAULTS);
    if (!stored || typeof stored !== 'object') return d;

    d.order = normalizeOrder(stored.order);

    d.hidden = {};
    if (stored.hidden && typeof stored.hidden === 'object') {
      FLO.SECTIONS.forEach(function (s) { if (stored.hidden[s.key] === true) d.hidden[s.key] = true; });
    }

    if (stored.hero && typeof stored.hero === 'object') {
      var h = stored.hero;
      var dh = d.hero;
      if (typeof h.tagline === 'string') dh.tagline = h.tagline;
      if (Array.isArray(h.titleLines)) {
        var lines = h.titleLines
          .map(function (l) { return String(l == null ? '' : l).trim(); })
          .filter(Boolean)
          .slice(0, 6);
        if (lines.length) dh.titleLines = lines;
      }
      if (typeof h.subtitle === 'string') dh.subtitle = h.subtitle;
      if (typeof h.buttonLabel === 'string') dh.buttonLabel = h.buttonLabel;
      if (typeof h.buttonLink === 'string') dh.buttonLink = h.buttonLink;
      if (typeof h.backgroundImage === 'string') dh.backgroundImage = h.backgroundImage;
      dh.imageFade = clamp01(h.imageFade, dh.imageFade);
    }
    mergeCollection(stored, d, 'classes');
    mergeCollection(stored, d, 'kids');
    return d;
  };

  /* ── Classes: merge / validate ──────────────────────── */
  function str(v, max, fallback) {
    return typeof v === 'string' ? v.slice(0, max) : fallback;
  }
  function list(v) { return Array.isArray(v) ? v : []; }

  FLO.newId = function (prefix) {
    return (prefix || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  function mergeCard(c) {
    if (!c || typeof c !== 'object') return null;
    var name = str(c.name, 60, '').trim();
    if (!name) return null;
    return {
      id: str(c.id, 40, '') || FLO.newId('c'),
      icon: str(c.icon, 400, ''),
      name: name,
      type: str(c.type, 80, ''),
      desc: str(c.desc, 400, ''),
      price: str(c.price, 40, ''),
      meta: list(c.meta).map(function (m) { return String(m == null ? '' : m).trim().slice(0, 80); })
                        .filter(Boolean).slice(0, 8),
      slotsLabel: str(c.slotsLabel, 60, ''),
      slots: list(c.slots).map(function (s) {
        return { text: String(s && s.text != null ? s.text : '').trim().slice(0, 60),
                 status: s && s.status === 'full' ? 'full' : 'available' };
      }).filter(function (s) { return s.text; }).slice(0, 12),
      buttonLabel: str(c.buttonLabel, 40, ''),
      buttonLink: str(c.buttonLink, 300, '#') || '#',
      waitlist: c.waitlist === true,
      highlight: c.highlight === true,
      hidden: c.hidden === true
    };
  }

  // Classes and FLO Kids share one shape: a heading plus a list of cards.
  function mergeCollection(stored, d, key) {
    var sc = stored[key];
    if (!sc || typeof sc !== 'object') return;
    var target = d[key];
    if (sc.header && typeof sc.header === 'object') {
      target.header.label = str(sc.header.label, 80, target.header.label);
      target.header.title = str(sc.header.title, 120, target.header.title);
      target.header.sub = str(sc.header.sub, 300, target.header.sub);
    }
    if (Array.isArray(sc.cards)) {
      var seen = {};
      target.cards = sc.cards.map(mergeCard).filter(function (c) {
        if (!c || seen[c.id]) return false;
        seen[c.id] = true;
        return true;
      }).slice(0, 24);
    }
  }

  /* ── Hero rendering (shared by page and admin preview) ── */
  FLO.heroHTML = function (h) {
    var esc = FLO.esc;
    var html = '';
    if (h.tagline) html += '<p class="hero-tagline">' + esc(h.tagline) + '</p>';
    if (h.titleLines && h.titleLines.length) {
      var last = h.titleLines.length - 1;
      html += '<h1 class="hero-title">' +
        h.titleLines.map(function (line, i) {
          return i === last ? '<span>' + esc(line) + '</span>' : esc(line);
        }).join('<br>') +
        '</h1>';
    }
    if (h.subtitle) html += '<p class="hero-sub">' + esc(h.subtitle).replace(/\r?\n/g, '<br>') + '</p>';
    if (h.buttonLabel) {
      html += '<a href="' + esc(FLO.safeHref(h.buttonLink)) + '" class="btn">' + esc(h.buttonLabel) + '</a>';
    }
    return html;
  };

  // Returns { backgroundImage, backgroundSize, backgroundPosition } for the hero.
  FLO.heroBackground = function (h) {
    var url = FLO.safeImageUrl(h.backgroundImage);
    if (!url) return { backgroundImage: '', backgroundSize: '', backgroundPosition: '' };
    var a = clamp01(h.imageFade, 0.55);
    var wash = 'linear-gradient(rgba(250,250,248,' + a + '), rgba(250,250,248,' + a + '))';
    return {
      backgroundImage: wash + ', url("' + url + '")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  };

  /* ── Class card rendering (shared by page and admin preview) ── */
  FLO.classCardHTML = function (c) {
    var esc = FLO.esc;
    var icon = FLO.safeImageUrl(c.icon);
    var iconHTML = icon
      ? '<img src="' + esc(icon) + '" alt="' + esc(c.name) + '" class="class-icon-img" />'
      : '<span class="class-icon-ph" aria-hidden="true">' + esc((c.name || '?').charAt(0).toUpperCase()) + '</span>';

    var hover = '';
    if (c.price) hover += '<p class="class-price">' + esc(c.price) + '</p>';
    if (c.meta && c.meta.length) {
      hover += '<ul class="class-meta">' + c.meta.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>';
    }
    if ((c.slots && c.slots.length) || c.slotsLabel) {
      hover += '<div class="class-slots">';
      if (c.slotsLabel) hover += '<p class="slots-label">' + esc(c.slotsLabel) + '</p>';
      (c.slots || []).forEach(function (s) {
        // Available slots on a highlighted (tangerine) card use the light style.
        var cls = s.status === 'full' ? 'full' : 'available' + (c.highlight ? ' slot-light' : '');
        // The trailing newline matters: browsers render the whitespace between
        // inline chips as a small gap, exactly as the original hand-written markup did.
        hover += '<div class="slot ' + cls + '">' + esc(s.text) + '</div>\n';
      });
      hover += '</div>';
    }
    if (c.buttonLabel) {
      hover += '<a href="' + esc(FLO.safeHref(c.buttonLink)) + '" class="btn btn-card' +
        (c.waitlist ? ' btn-waitlist' : '') + '">' + esc(c.buttonLabel) + '</a>';
    }

    return '<div class="class-card' + (c.highlight ? ' highlight-card' : '') + '">' +
      '<div class="card-inner">' +
        '<div class="card-lottie-wrap">' + iconHTML + '</div>' +
        '<div class="card-content">' +
          '<h3>' + esc(c.name) + '</h3>' +
          (c.type ? '<p class="class-type">' + esc(c.type) + '</p>' : '') +
          (c.desc ? '<p class="class-desc">' + esc(c.desc) + '</p>' : '') +
          (hover ? '<div class="card-hover-info">' + hover + '</div>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  };

  /* ── FLO Kids card rendering ────────────────────────── */
  FLO.kidsCardHTML = function (c) {
    var esc = FLO.esc;
    var icon = FLO.safeImageUrl(c.icon);
    var iconHTML = icon
      ? '<img src="' + esc(icon) + '" alt="' + esc(c.name) + '" class="kids-icon-img" />'
      : '<span class="kids-icon-ph" aria-hidden="true">' + esc((c.name || '?').charAt(0).toUpperCase()) + '</span>';

    var html = '<div class="kids-card">' +
      '<div class="kids-icon">' + iconHTML + '</div>' +
      '<div class="kids-content">' +
        '<h3>' + esc(c.name) + '</h3>' +
        (c.type ? '<p class="kids-type">' + esc(c.type) + '</p>' : '') +
        (c.desc ? '<p class="kids-desc">' + esc(c.desc) + '</p>' : '');
    if (c.meta && c.meta.length) {
      html += '<div class="kids-meta">' +
        c.meta.map(function (t) { return '<span class="kids-tag">' + esc(t) + '</span>'; }).join('') + '</div>';
    }
    if (c.price) html += '<p class="kids-price">' + esc(c.price) + '</p>';
    if ((c.slots && c.slots.length) || c.slotsLabel) {
      html += '<div class="class-slots">';
      if (c.slotsLabel) html += '<p class="slots-label">' + esc(c.slotsLabel) + '</p>';
      (c.slots || []).forEach(function (s) {
        html += '<div class="slot ' + (s.status === 'full' ? 'full' : 'available') + '">' + esc(s.text) + '</div>\n';
      });
      html += '</div>';
    }
    if (c.buttonLabel) {
      html += '<a href="' + esc(FLO.safeHref(c.buttonLink)) + '" class="btn btn-card' +
        (c.waitlist ? ' btn-waitlist' : '') + '" style="margin-top:16px;">' + esc(c.buttonLabel) + '</a>';
    }
    return html + '</div></div>';
  };

  /* ── Apply to the page ──────────────────────────────── */
  function applyOrderAndVisibility(w) {
    var footer = document.querySelector('footer.footer');
    if (!footer || !footer.parentNode) return;

    w.order.forEach(function (key) {
      var def = FLO.SECTIONS.filter(function (s) { return s.key === key; })[0];
      if (!def) return;
      def.els.forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) footer.parentNode.insertBefore(el, footer);
      });
    });

    FLO.SECTIONS.forEach(function (def) {
      var hide = w.hidden[def.key] === true;
      def.els.forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) el.classList.toggle('site-hidden', hide);
      });
      if (def.nav) {
        var link = document.querySelector('.nav-links a[href="' + def.nav + '"]');
        if (link && link.parentElement) link.parentElement.classList.toggle('site-hidden', hide);
      }
    });
  }

  function applyHero(w) {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var content = hero.querySelector('.hero-content');
    if (content) content.innerHTML = FLO.heroHTML(w.hero);
    var bg = FLO.heroBackground(w.hero);
    hero.style.backgroundImage = bg.backgroundImage;
    hero.style.backgroundSize = bg.backgroundSize;
    hero.style.backgroundPosition = bg.backgroundPosition;
  }

  function applyClasses(w) {
    var sec = document.querySelector('#classes');
    if (!sec) return;
    var hdr = sec.querySelector('.section-header');
    if (hdr) {
      var h = w.classes.header;
      var label = hdr.querySelector('.section-label');
      var title = hdr.querySelector('.section-title');
      var sub = hdr.querySelector('.section-sub');
      if (label) label.textContent = h.label;
      if (title) title.textContent = h.title;
      if (sub) sub.innerHTML = FLO.esc(h.sub).replace(/\r?\n/g, '<br>');
    }
    var grid = sec.querySelector('.classes-grid');
    if (grid) {
      grid.innerHTML = w.classes.cards
        .filter(function (c) { return !c.hidden; })
        .map(FLO.classCardHTML)
        .join('');
    }
  }

  function applyKids(w) {
    var sec = document.querySelector('#kids');
    if (!sec) return;
    var hdr = sec.querySelector('.kids-header');
    if (hdr) {
      var h = w.kids.header;
      var label = hdr.querySelector('.section-label');
      var title = hdr.querySelector('.section-title');
      var sub = hdr.querySelector('.section-sub');
      if (label) label.textContent = h.label;
      if (title) title.textContent = h.title;
      if (sub) sub.innerHTML = FLO.esc(h.sub).replace(/\r?\n/g, '<br>');
    }
    var grid = sec.querySelector('.kids-grid');
    if (grid) {
      grid.innerHTML = w.kids.cards
        .filter(function (c) { return !c.hidden; })
        .map(FLO.kidsCardHTML)
        .join('');
    }
  }

  FLO.applyWebsite = function (w) {
    try {
      applyOrderAndVisibility(w);
      applyHero(w);
      applyClasses(w);
      applyKids(w);
    } catch (err) {
      console.error('FLO: could not apply website content.', err);
    }
  };

  /* ── Cache ──────────────────────────────────────────── */
  function readCache() {
    try {
      var raw = window.localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function writeCache(value) {
    try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  /* ── Load / save ────────────────────────────────────── */
  FLO.website = FLO.mergeWebsite(readCache());

  // useCache: apply the cached copy immediately (public page load).
  // The admin editor passes false so it always edits fresh server data.
  FLO.loadWebsite = async function (useCache) {
    if (useCache !== false) {
      var cached = readCache();
      if (cached) {
        FLO.website = FLO.mergeWebsite(cached);
        FLO.applyWebsite(FLO.website);
      }
    }
    var res = await FLO.settings.get('website');
    if (res.ok) {
      FLO.website = FLO.mergeWebsite(res.value);
      writeCache(res.value);
      FLO.applyWebsite(FLO.website);
    }
    return { ok: res.ok, error: res.error };
  };

  FLO.saveWebsite = async function (next) {
    var merged = FLO.mergeWebsite(next);
    var res = await FLO.settings.set('website', merged);
    if (!res.ok) return res;
    FLO.website = merged;
    writeCache(merged);
    FLO.applyWebsite(merged);
    return { ok: true };
  };

  /* ── Start ──────────────────────────────────────────── */
  FLO.loadWebsite(true);
})();
