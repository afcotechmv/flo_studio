/* =========================================================
   FLO Studio — site-admin.js
   The "Website" area of the admin portal. Lets the signed-in
   administrator edit what visitors see on the public site.

   Stage 1: Hero editor and Page Order (order + visibility).
   The other tabs are listed so the final structure is visible;
   each is switched on in a later stage.

   Every change is made on a draft copy and only goes live when
   the administrator presses Save. All text is escaped before it
   is written into the page.
   ========================================================= */
(function () {
  'use strict';

  var FLO = (window.FLO = window.FLO || {});
  var esc = function (v) { return FLO.esc(v); };

  var TABS = [
    { key: 'hero',   label: 'Hero',                built: true },
    { key: 'classes', label: 'Classes' },
    { key: 'kids',   label: 'FLO Kids' },
    { key: 'story',  label: 'Our Story' },
    { key: 'team',   label: 'The Team' },
    { key: 'events', label: 'Workshops & Events' },
    { key: 'footer', label: 'Footer' },
    { key: 'order',  label: 'Page Order',          built: true }
  ];

  var root = null;         // #aview-website
  var panel = null;        // panel container
  var activeTab = 'hero';
  var dirty = false;
  var draft = null;        // working copy for the active tab

  /* ── Helpers ────────────────────────────────────────── */
  function setStatus(el, msg, kind) {
    if (!el) return;
    el.textContent = msg || '';
    el.className = 'wsite-status' + (kind ? ' wsite-status--' + kind : '');
  }

  function confirmLeave() {
    if (!dirty) return true;
    return window.confirm('You have unsaved changes on this tab. Discard them?');
  }

  /* ── Shell ──────────────────────────────────────────── */
  function buildShell() {
    root.innerHTML =
      '<div class="portal-view-header">' +
        '<h2>Website</h2>' +
        '<p class="portal-view-sub">Edit what visitors see on the public site. Changes go live when you press Save.</p>' +
      '</div>' +
      '<div class="admin-section-toolbar">' +
        '<div class="admin-audience-tabs wsite-tabs" id="wsiteTabs">' +
          TABS.map(function (t) {
            return '<button type="button" class="admin-audience-tab' +
              (t.built ? '' : ' is-pending') + '" data-wtab="' + t.key + '">' + esc(t.label) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div id="wsiteNotice"></div>' +
      '<div id="wsitePanel"></div>';

    panel = root.querySelector('#wsitePanel');

    root.querySelector('#wsiteTabs').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-wtab]');
      if (!btn) return;
      var key = btn.getAttribute('data-wtab');
      if (key === activeTab) return;
      if (!confirmLeave()) return;
      showTab(key);
    });
  }

  function markTabs() {
    root.querySelectorAll('[data-wtab]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-wtab') === activeTab);
    });
  }

  function showTab(key) {
    activeTab = key;
    dirty = false;
    markTabs();
    if (key === 'hero') return renderHero();
    if (key === 'order') return renderOrder();
    renderPending(key);
  }

  function renderPending(key) {
    var tab = TABS.filter(function (t) { return t.key === key; })[0];
    panel.innerHTML =
      '<div class="portal-section wsite-card">' +
        '<h3 class="portal-section-title">' + esc(tab ? tab.label : '') + '</h3>' +
        '<p class="portal-section-desc">This editor is part of a later build stage. Until then, ' +
        'this part of the public site keeps showing its current content.</p>' +
      '</div>';
  }

  /* ── Hero editor ────────────────────────────────────── */
  function renderHero() {
    if (!draft || draft.__tab !== 'hero') {
      draft = FLO.clone(FLO.website.hero);
      draft.__tab = 'hero';
    }
    var h = draft;
    var hasImage = !!FLO.safeImageUrl(h.backgroundImage);

    panel.innerHTML =
      '<div class="portal-section wsite-card">' +
        '<h3 class="portal-section-title">Hero</h3>' +
        '<p class="portal-section-desc">The first thing visitors see at the top of the page.</p>' +
        '<div class="wsite-grid">' +
          '<div class="wsite-form">' +
            field('Tagline', 'Small text above the headline.',
              '<input type="text" class="admin-panel-input" id="wh-tagline" maxlength="120" value="' + esc(h.tagline) + '">') +
            field('Headline', 'One line per row. The last line is shown in tangerine.',
              '<textarea class="admin-panel-input" id="wh-title" rows="4" maxlength="200">' + esc(h.titleLines.join('\n')) + '</textarea>') +
            field('Sub-text', 'Line breaks are kept.',
              '<textarea class="admin-panel-input" id="wh-sub" rows="3" maxlength="300">' + esc(h.subtitle) + '</textarea>') +
            '<div class="wsite-two">' +
              field('Button text', 'Leave empty to hide the button.',
                '<input type="text" class="admin-panel-input" id="wh-btn" maxlength="40" value="' + esc(h.buttonLabel) + '">') +
              field('Button link', 'e.g. #classes or https://\u2026',
                '<input type="text" class="admin-panel-input" id="wh-link" maxlength="300" value="' + esc(h.buttonLink) + '">') +
            '</div>' +
            '<div class="wsite-field">' +
              '<label class="wsite-label">Background image</label>' +
              '<p class="wsite-hint">Optional. A wide landscape photo works best. Large images are reduced automatically.</p>' +
              (hasImage ? '<img class="wsite-thumb" src="' + esc(FLO.safeImageUrl(h.backgroundImage)) + '" alt="Current hero background">' : '') +
              '<div class="wsite-row">' +
                '<label class="btn-admin-add wsite-upload">' + (hasImage ? 'Replace image' : 'Upload image') +
                  '<input type="file" id="wh-file" accept="image/png,image/jpeg,image/webp" hidden>' +
                '</label>' +
                (hasImage ? '<button type="button" class="wsite-link-btn" id="wh-remove">Remove image</button>' : '') +
              '</div>' +
            '</div>' +
            (hasImage
              ? '<div class="wsite-field"><label class="wsite-label" for="wh-fade">Image fade: <span id="wh-fade-val">' +
                  Math.round(h.imageFade * 100) + '%</span></label>' +
                '<p class="wsite-hint">A light wash over the photo so the dark text stays readable.</p>' +
                '<input type="range" id="wh-fade" min="0" max="90" step="5" value="' + Math.round(h.imageFade * 100) + '"></div>'
              : '') +
          '</div>' +
          '<div class="wsite-preview-wrap">' +
            '<p class="wsite-label">Preview</p>' +
            '<div class="wsite-hero-preview" id="wh-preview"><div class="hero-content" id="wh-preview-content"></div></div>' +
          '</div>' +
        '</div>' +
        actions('wh') +
      '</div>';

    updateHeroPreview();
    wireHero();
  }

  function field(label, hint, control) {
    // Tie the label to its control through the control's id.
    var m = /\sid="([^"]+)"/.exec(control);
    return '<div class="wsite-field"><label class="wsite-label"' + (m ? ' for="' + m[1] + '"' : '') + '>' + esc(label) + '</label>' +
      (hint ? '<p class="wsite-hint">' + esc(hint) + '</p>' : '') + control + '</div>';
  }

  function actions(prefix) {
    return '<div class="wsite-actions">' +
      '<button type="button" class="btn-admin-primary" id="' + prefix + '-save">Save changes</button>' +
      '<button type="button" class="wsite-link-btn" id="' + prefix + '-discard">Discard changes</button>' +
      '<span class="wsite-status" id="' + prefix + '-status" role="status"></span>' +
    '</div>';
  }

  function updateHeroPreview() {
    var box = panel.querySelector('#wh-preview');
    var content = panel.querySelector('#wh-preview-content');
    if (!box || !content) return;
    var preview = {
      tagline: draft.tagline,
      titleLines: draft.titleLines,
      subtitle: draft.subtitle,
      buttonLabel: draft.buttonLabel,
      buttonLink: '#',
      backgroundImage: draft.backgroundImage,
      imageFade: draft.imageFade
    };
    content.innerHTML = FLO.heroHTML(preview);
    var bg = FLO.heroBackground(preview);
    box.style.backgroundImage = bg.backgroundImage;
    box.style.backgroundSize = bg.backgroundSize;
    box.style.backgroundPosition = bg.backgroundPosition;
  }

  function wireHero() {
    var statusEl = panel.querySelector('#wh-status');
    function touch() { dirty = true; setStatus(statusEl, ''); updateHeroPreview(); }

    panel.querySelector('#wh-tagline').addEventListener('input', function (e) { draft.tagline = e.target.value; touch(); });
    panel.querySelector('#wh-title').addEventListener('input', function (e) {
      draft.titleLines = e.target.value.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
      touch();
    });
    panel.querySelector('#wh-sub').addEventListener('input', function (e) { draft.subtitle = e.target.value; touch(); });
    panel.querySelector('#wh-btn').addEventListener('input', function (e) { draft.buttonLabel = e.target.value; touch(); });
    panel.querySelector('#wh-link').addEventListener('input', function (e) { draft.buttonLink = e.target.value; touch(); });

    var fade = panel.querySelector('#wh-fade');
    if (fade) {
      fade.addEventListener('input', function (e) {
        draft.imageFade = parseInt(e.target.value, 10) / 100;
        panel.querySelector('#wh-fade-val').textContent = e.target.value + '%';
        touch();
      });
    }

    panel.querySelector('#wh-file').addEventListener('change', async function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setStatus(statusEl, 'Uploading image\u2026', 'busy');
      var res = await FLO.uploadImage(file, 'hero', { maxDim: 2000, quality: 0.82 });
      if (!res.ok) { setStatus(statusEl, res.error, 'err'); return; }
      draft.backgroundImage = res.url;
      dirty = true;
      renderHero();
      setStatus(panel.querySelector('#wh-status'), 'Image uploaded. Press Save changes to publish it.', 'ok');
    });

    var rm = panel.querySelector('#wh-remove');
    if (rm) {
      rm.addEventListener('click', function () {
        draft.backgroundImage = '';
        dirty = true;
        renderHero();
      });
    }

    panel.querySelector('#wh-discard').addEventListener('click', function () {
      if (dirty && !window.confirm('Discard your unsaved changes?')) return;
      draft = null;
      dirty = false;
      renderHero();
    });

    panel.querySelector('#wh-save').addEventListener('click', async function (e) {
      var btn = e.currentTarget;
      if (!draft.titleLines.length) { setStatus(statusEl, 'The headline cannot be empty.', 'err'); return; }
      var link = String(draft.buttonLink || '').trim();
      if (draft.buttonLabel.trim() && link && !/^(#|https?:\/\/|mailto:|tel:)/i.test(link)) {
        setStatus(statusEl, 'The button link must start with #, https://, mailto: or tel:.', 'err');
        return;
      }
      var hero = {
        tagline: draft.tagline.trim(),
        titleLines: draft.titleLines.slice(),
        subtitle: draft.subtitle.trim(),
        buttonLabel: draft.buttonLabel.trim(),
        buttonLink: link || '#',
        backgroundImage: draft.backgroundImage,
        imageFade: draft.imageFade
      };
      btn.disabled = true;
      setStatus(statusEl, 'Saving\u2026', 'busy');
      var next = FLO.clone(FLO.website);
      next.hero = hero;
      var res = await FLO.saveWebsite(next);
      btn.disabled = false;
      if (!res.ok) { setStatus(statusEl, res.error, 'err'); return; }
      dirty = false;
      draft = null;
      renderHero();
      setStatus(panel.querySelector('#wh-status'), 'Saved. The public page is updated.', 'ok');
    });
  }

  /* ── Page order & visibility ────────────────────────── */
  function renderOrder() {
    if (!draft || draft.__tab !== 'order') {
      draft = { __tab: 'order', order: FLO.website.order.slice(), hidden: FLO.clone(FLO.website.hidden) };
    }
    var rows = draft.order.map(function (key, i) {
      var def = FLO.SECTIONS.filter(function (s) { return s.key === key; })[0];
      if (!def) return '';
      var last = i === draft.order.length - 1;
      return '<li class="wsite-order-row" data-key="' + esc(key) + '">' +
        '<span class="wsite-order-num">' + (i + 1) + '</span>' +
        '<span class="wsite-order-label">' + esc(def.label) + '</span>' +
        '<label class="wsite-visible"><input type="checkbox" data-vis="' + esc(key) + '"' +
          (draft.hidden[key] ? '' : ' checked') + '> Visible</label>' +
        '<span class="wsite-order-btns">' +
          '<button type="button" class="wsite-move" data-move="up" data-key="' + esc(key) + '" aria-label="Move ' + esc(def.label) + ' up"' + (i === 0 ? ' disabled' : '') + '>\u25B2</button>' +
          '<button type="button" class="wsite-move" data-move="down" data-key="' + esc(key) + '" aria-label="Move ' + esc(def.label) + ' down"' + (last ? ' disabled' : '') + '>\u25BC</button>' +
        '</span>' +
      '</li>';
    }).join('');

    panel.innerHTML =
      '<div class="portal-section wsite-card">' +
        '<h3 class="portal-section-title">Page Order</h3>' +
        '<p class="portal-section-desc">Use the arrows to change the order of the sections on the public page, and untick a section to hide it. ' +
        'The footer always stays at the bottom.</p>' +
        '<ol class="wsite-order-list">' + rows +
          '<li class="wsite-order-row wsite-order-row--fixed"><span class="wsite-order-num">\u2013</span>' +
          '<span class="wsite-order-label">Footer (always last)</span></li>' +
        '</ol>' +
        actions('wo') +
        '<p class="wsite-reset"><button type="button" class="wsite-link-btn" id="wo-reset">Reset to the default order</button></p>' +
      '</div>';

    wireOrder();
  }

  function wireOrder() {
    var statusEl = panel.querySelector('#wo-status');

    panel.querySelector('.wsite-order-list').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-move]');
      if (!btn || btn.disabled) return;
      var key = btn.getAttribute('data-key');
      var i = draft.order.indexOf(key);
      var j = btn.getAttribute('data-move') === 'up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= draft.order.length) return;
      var tmp = draft.order[i];
      draft.order[i] = draft.order[j];
      draft.order[j] = tmp;
      dirty = true;
      renderOrder();
    });

    panel.querySelector('.wsite-order-list').addEventListener('change', function (e) {
      var box = e.target.closest('[data-vis]');
      if (!box) return;
      var key = box.getAttribute('data-vis');
      if (box.checked) delete draft.hidden[key]; else draft.hidden[key] = true;
      dirty = true;
      setStatus(statusEl, '');
    });

    panel.querySelector('#wo-reset').addEventListener('click', function () {
      draft.order = FLO.DEFAULTS.order.slice();
      draft.hidden = {};
      dirty = true;
      renderOrder();
    });

    panel.querySelector('#wo-discard').addEventListener('click', function () {
      if (dirty && !window.confirm('Discard your unsaved changes?')) return;
      draft = null;
      dirty = false;
      renderOrder();
    });

    panel.querySelector('#wo-save').addEventListener('click', async function (e) {
      var btn = e.currentTarget;
      var visibleCount = draft.order.filter(function (k) { return !draft.hidden[k]; }).length;
      if (!visibleCount) { setStatus(statusEl, 'At least one section must stay visible.', 'err'); return; }
      btn.disabled = true;
      setStatus(statusEl, 'Saving\u2026', 'busy');
      var next = FLO.clone(FLO.website);
      next.order = draft.order.slice();
      next.hidden = FLO.clone(draft.hidden);
      var res = await FLO.saveWebsite(next);
      btn.disabled = false;
      if (!res.ok) { setStatus(statusEl, res.error, 'err'); return; }
      dirty = false;
      draft = null;
      renderOrder();
      setStatus(panel.querySelector('#wo-status'), 'Saved. The public page is updated.', 'ok');
    });
  }

  /* ── Open the Website area ──────────────────────────── */
  async function open() {
    if (!root) return;
    if (!panel) buildShell();
    var notice = root.querySelector('#wsiteNotice');
    notice.innerHTML = '';
    panel.innerHTML = '<p class="admin-empty-note">Loading the latest saved content\u2026</p>';
    var res = await FLO.loadWebsite(false);
    if (!res.ok) {
      notice.innerHTML = '<p class="wsite-banner">Could not load the latest saved content. ' +
        'You are seeing the last known copy; saving may fail until the connection returns.</p>';
    }
    draft = null;
    showTab(activeTab);
  }

  function init() {
    root = document.getElementById('aview-website');
    if (!root) return;
    var link = document.querySelector('.admin-sidebar-link[data-aview="website"]');
    if (link) link.addEventListener('click', open);
  }

  FLO.adminWebsite = { open: open };
  init();
})();
