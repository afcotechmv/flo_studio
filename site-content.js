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
    { key: 'classes',     label: 'Classes & FLO Kids',  els: ['#classes'],     nav: '#classes' },
    { key: 'about',       label: 'Our Story',           els: ['#about'],       nav: '#about' },
    { key: 'instructors', label: 'The Team',            els: ['#instructors'] },
    { key: 'workshops',   label: 'Workshops & Events',  els: ['#workshops'] }
  ];

  /* ── Defaults (identical to the original hard-coded page) ── */
  FLO.DEFAULTS = {
    version: 1,
    order: ['hero', 'classes', 'about', 'instructors', 'workshops'],
    hidden: {},
    hero: {
      tagline: 'Feel \u00B7 Look \u00B7 Own \u00B7 Mal\u00E9, Maldives',
      titleLines: ['Feel good.', 'Look strong.', 'Own your journey.'],
      subtitle: 'A women-only studio for movement, strength,\nand mental wellbeing.',
      buttonLabel: 'View Classes',
      buttonLink: '#classes',
      backgroundImage: '',
      imageFade: 0.55
    }
  };

  /* ── Merge saved settings over the defaults ─────────── */
  function normalizeOrder(stored) {
    var known = FLO.SECTIONS.map(function (s) { return s.key; });
    var out = [];
    (Array.isArray(stored) ? stored : []).forEach(function (k) {
      if (known.indexOf(k) !== -1 && out.indexOf(k) === -1) out.push(k);
    });
    known.forEach(function (k) { if (out.indexOf(k) === -1) out.push(k); });
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
    return d;
  };

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

  FLO.applyWebsite = function (w) {
    try {
      applyOrderAndVisibility(w);
      applyHero(w);
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
