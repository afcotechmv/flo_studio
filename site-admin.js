/* =========================================================
   FLO Studio — site-admin.js
   The "Website" area of the admin portal. Lets the signed-in
   administrator edit what visitors see on the public site.

   Built so far: Hero, Classes, FLO Kids, Our Story, The Team, Page Order.
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
    { key: 'classes', label: 'Classes',             built: true },
    { key: 'kids',   label: 'FLO Kids',            built: true },
    { key: 'story',  label: 'Our Story',           built: true },
    { key: 'team',   label: 'The Team',            built: true },
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
    if (key === 'classes' || key === 'kids') return renderClasses();
    if (key === 'story') return renderStory();
    if (key === 'team') return renderTeam();
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

  /* ── Classes editor ─────────────────────────────────── */
  var MAX_CARDS = 24;

  // Classes and FLO Kids are edited by the same screens; this table holds
  // what differs between them.
  var COLL = {
    classes: {
      key: 'classes', folder: 'classes', previewClass: 'wsite-class-preview',
      render: function (c) { return FLO.classCardHTML(c); },
      noun: 'class', title: 'Classes', nameLabel: 'Class name',
      desc: 'The class cards shown under \u201CWhat we offer\u201D on the public page. ' +
            'These are the marketing cards; the booking schedule is managed separately under Classes in the main menu.',
      metaLabel: 'Hover details', metaHint: 'One per line (up to 8).',
      previewHint: 'Shown as it appears when a visitor hovers over the card.',
      hasHighlight: true,
      fresh: { name: 'New class', price: 'MVR 1,000', meta: ['50 min session'] }
    },
    kids: {
      key: 'kids', folder: 'kids', previewClass: 'wsite-kids-preview',
      render: function (c) { return FLO.kidsCardHTML(c); },
      noun: 'kids class', title: 'FLO Kids', nameLabel: 'Class name',
      desc: 'The FLO Kids section of the public page: its heading and the cards for girls aged 5\u201312.',
      metaLabel: 'Tags', metaHint: 'Small pill labels, one per line (up to 8), e.g. Ages 5\u201312.',
      previewHint: 'Shown as it appears on the public page.',
      hasHighlight: false,
      fresh: { name: 'New kids class', price: 'MVR 1,000', meta: ['Ages 5\u201312'] }
    }
  };
  function cfg() { return COLL[activeTab]; }

  function newCard() {
    var f = cfg().fresh;
    return {
      id: FLO.newId('c'), icon: '', name: f.name, type: '', desc: '', price: f.price,
      meta: f.meta.slice(), slotsLabel: 'Available slots', slots: [],
      buttonLabel: 'Join Class', buttonLink: '#', waitlist: false, highlight: false, hidden: false
    };
  }

  function ensureClassesDraft() {
    if (!draft || draft.__tab !== activeTab) {
      draft = {
        __tab: activeTab, view: 'list', editId: null,
        header: FLO.clone(FLO.website[cfg().key].header),
        cards: FLO.clone(FLO.website[cfg().key].cards)
      };
    }
  }

  function findCard(id) {
    return draft.cards.filter(function (c) { return c.id === id; })[0];
  }

  function renderClasses() {
    ensureClassesDraft();
    if (draft.view === 'edit' && findCard(draft.editId)) return renderClassEditor();
    draft.view = 'list';
    draft.editId = null;
    renderClassList();
  }

  function thumbHTML(c) {
    var url = FLO.safeImageUrl(c.icon);
    return url
      ? '<img class="wsite-crow-thumb" src="' + esc(url) + '" alt="">'
      : '<span class="wsite-crow-thumb wsite-crow-thumb--ph">' + esc((c.name || '?').charAt(0).toUpperCase()) + '</span>';
  }

  function renderClassList() {
    var h = draft.header;
    var rows = draft.cards.map(function (c, i) {
      var last = i === draft.cards.length - 1;
      var badges =
        (cfg().hasHighlight && c.highlight ? '<span class="wsite-badge wsite-badge--accent">Highlighted</span>' : '') +
        (c.waitlist ? '<span class="wsite-badge">Waitlist button</span>' : '') +
        (c.hidden ? '<span class="wsite-badge">Hidden</span>' : '');
      return '<li class="wsite-crow' + (c.hidden ? ' is-hidden' : '') + '" data-id="' + esc(c.id) + '">' +
        thumbHTML(c) +
        '<span class="wsite-crow-main">' +
          '<span class="wsite-crow-name">' + esc(c.name) + '</span>' +
          '<span class="wsite-crow-type">' + esc(c.type) + '</span>' +
          (badges ? '<span class="wsite-badges">' + badges + '</span>' : '') +
        '</span>' +
        '<span class="wsite-crow-btns">' +
          '<button type="button" class="wsite-move" data-act="up" aria-label="Move ' + esc(c.name) + ' up"' + (i === 0 ? ' disabled' : '') + '>\u25B2</button>' +
          '<button type="button" class="wsite-move" data-act="down" aria-label="Move ' + esc(c.name) + ' down"' + (last ? ' disabled' : '') + '>\u25BC</button>' +
          '<button type="button" class="wsite-small" data-act="edit">Edit</button>' +
          '<button type="button" class="wsite-small" data-act="dup"' + (draft.cards.length >= MAX_CARDS ? ' disabled' : '') + '>Duplicate</button>' +
          '<button type="button" class="wsite-small wsite-small--danger" data-act="del">Delete</button>' +
        '</span>' +
      '</li>';
    }).join('');

    panel.innerHTML =
      '<div class="portal-section wsite-card">' +
        '<h3 class="portal-section-title">' + esc(cfg().title) + '</h3>' +
        '<p class="portal-section-desc">' + esc(cfg().desc) + '</p>' +

        '<h4 class="wsite-subhead">Section heading</h4>' +
        '<div class="wsite-three">' +
          field('Small label', 'Small text above the title.', '<input type="text" class="admin-panel-input" id="wc-label" maxlength="80" value="' + esc(h.label) + '">') +
          field('Title', 'The main heading.', '<input type="text" class="admin-panel-input" id="wc-title" maxlength="120" value="' + esc(h.title) + '">') +
          field('Sub-text', 'Line breaks are kept.', '<textarea class="admin-panel-input" id="wc-sub" rows="2" maxlength="300">' + esc(h.sub) + '</textarea>') +
        '</div>' +

        '<div class="wsite-subhead-row">' +
          '<h4 class="wsite-subhead">Cards (' + draft.cards.length + ')</h4>' +
          '<button type="button" class="btn-admin-add" id="wc-add"' + (draft.cards.length >= MAX_CARDS ? ' disabled' : '') + '>+ Add ' + esc(cfg().noun) + '</button>' +
        '</div>' +
        (rows
          ? '<ul class="wsite-clist">' + rows + '</ul>'
          : '<p class="admin-empty-note">No cards yet. Use \u201CAdd ' + esc(cfg().noun) + '\u201D to create one.</p>') +
        actions('wc') +
      '</div>';

    wireClassList();
  }

  function wireClassList() {
    var statusEl = panel.querySelector('#wc-status');
    function touch() { dirty = true; setStatus(statusEl, ''); }

    panel.querySelector('#wc-label').addEventListener('input', function (e) { draft.header.label = e.target.value; touch(); });
    panel.querySelector('#wc-title').addEventListener('input', function (e) { draft.header.title = e.target.value; touch(); });
    panel.querySelector('#wc-sub').addEventListener('input', function (e) { draft.header.sub = e.target.value; touch(); });

    panel.querySelector('#wc-add').addEventListener('click', function () {
      var c = newCard();
      draft.cards.push(c);
      draft.view = 'edit';
      draft.editId = c.id;
      dirty = true;
      renderClassEditor();
    });

    var listEl = panel.querySelector('.wsite-clist');
    if (listEl) {
      listEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-act]');
        if (!btn || btn.disabled) return;
        var row = btn.closest('[data-id]');
        var id = row && row.getAttribute('data-id');
        var i = draft.cards.map(function (c) { return c.id; }).indexOf(id);
        if (i < 0) return;
        var act = btn.getAttribute('data-act');

        if (act === 'edit') {
          draft.view = 'edit';
          draft.editId = id;
          renderClassEditor();
        } else if (act === 'up' || act === 'down') {
          var j = act === 'up' ? i - 1 : i + 1;
          if (j < 0 || j >= draft.cards.length) return;
          var tmp = draft.cards[i]; draft.cards[i] = draft.cards[j]; draft.cards[j] = tmp;
          dirty = true;
          renderClassList();
        } else if (act === 'dup') {
          var copy = FLO.clone(draft.cards[i]);
          copy.id = FLO.newId('c');
          copy.name = (copy.name + ' (copy)').slice(0, 60);
          draft.cards.splice(i + 1, 0, copy);
          dirty = true;
          renderClassList();
        } else if (act === 'del') {
          if (!window.confirm('Delete \u201C' + draft.cards[i].name + '\u201D? It is removed from the public page when you press Save changes.')) return;
          draft.cards.splice(i, 1);
          dirty = true;
          renderClassList();
        }
      });
    }

    panel.querySelector('#wc-discard').addEventListener('click', function () {
      if (dirty && !window.confirm('Discard your unsaved changes?')) return;
      draft = null;
      dirty = false;
      renderClasses();
    });
    panel.querySelector('#wc-save').addEventListener('click', function (e) { saveClasses(e.currentTarget, statusEl); });
  }

  function classPreviewCard(c) {
    var pc = FLO.clone(c);
    pc.slots = pc.slots.filter(function (s) { return s.text.trim(); });
    pc.buttonLink = '#';
    return pc;
  }

  function renderClassEditor() {
    var c = findCard(draft.editId);
    if (!c) { draft.view = 'list'; return renderClassList(); }
    var hasIcon = !!FLO.safeImageUrl(c.icon);

    var slotRows = c.slots.map(function (s, i) {
      return '<div class="wsite-slot-row" data-i="' + i + '">' +
        '<input type="text" class="admin-panel-input" data-slot-text maxlength="60" aria-label="Slot ' + (i + 1) + ' text" value="' + esc(s.text) + '" placeholder="e.g. Sun \u00B7 6:00 AM">' +
        '<select class="admin-panel-select" data-slot-status aria-label="Slot ' + (i + 1) + ' status">' +
          '<option value="available"' + (s.status !== 'full' ? ' selected' : '') + '>Available</option>' +
          '<option value="full"' + (s.status === 'full' ? ' selected' : '') + '>Full</option>' +
        '</select>' +
        '<button type="button" class="wsite-small wsite-small--danger" data-slot-del>Remove</button>' +
      '</div>';
    }).join('');

    panel.innerHTML =
      '<div class="portal-section wsite-card">' +
        '<p class="wsite-back"><button type="button" class="wsite-link-btn" id="wce-back">\u2190 Back to ' + esc(cfg().title) + '</button></p>' +
        '<h3 class="portal-section-title">Edit ' + esc(cfg().noun) + '</h3>' +
        '<div class="wsite-grid">' +
          '<div class="wsite-form">' +
            '<div class="wsite-two">' +
              field(cfg().nameLabel, '', '<input type="text" class="admin-panel-input" id="wce-name" maxlength="60" value="' + esc(c.name) + '">') +
              field('Style', 'Shown in small capitals, e.g. Vinyasa Yoga.', '<input type="text" class="admin-panel-input" id="wce-type" maxlength="80" value="' + esc(c.type) + '">') +
            '</div>' +
            field('Description', '', '<textarea class="admin-panel-input" id="wce-desc" rows="3" maxlength="400">' + esc(c.desc) + '</textarea>') +

            '<div class="wsite-field">' +
              '<label class="wsite-label">Icon</label>' +
              '<p class="wsite-hint">A square PNG with a transparent background works best. It is reduced automatically.</p>' +
              (hasIcon ? '<img class="wsite-icon-thumb" src="' + esc(FLO.safeImageUrl(c.icon)) + '" alt="Current icon">' : '') +
              '<div class="wsite-row">' +
                '<label class="btn-admin-add wsite-upload">' + (hasIcon ? 'Replace icon' : 'Upload icon') +
                  '<input type="file" id="wce-file" accept="image/png,image/jpeg,image/webp" hidden>' +
                '</label>' +
                (hasIcon ? '<button type="button" class="wsite-link-btn" id="wce-rmicon">Remove icon</button>' : '') +
              '</div>' +
            '</div>' +

            '<div class="wsite-two">' +
              field('Price', activeTab === 'classes' ? 'Shown when the card is hovered.' : '', '<input type="text" class="admin-panel-input" id="wce-price" maxlength="40" value="' + esc(c.price) + '">') +
              field(cfg().metaLabel, cfg().metaHint, '<textarea class="admin-panel-input" id="wce-meta" rows="3" maxlength="500">' + esc(c.meta.join('\n')) + '</textarea>') +
            '</div>' +

            '<div class="wsite-field">' +
              '<label class="wsite-label" for="wce-slotslabel">Time slots</label>' +
              '<p class="wsite-hint">Shown on the card as written. Mark a slot Full to show it greyed out.</p>' +
              '<input type="text" class="admin-panel-input" id="wce-slotslabel" maxlength="60" value="' + esc(c.slotsLabel) + '" placeholder="Heading, e.g. Available slots">' +
              '<div class="wsite-slots" id="wce-slots">' + slotRows + '</div>' +
              '<button type="button" class="wsite-small" id="wce-addslot"' + (c.slots.length >= 12 ? ' disabled' : '') + '>+ Add slot</button>' +
            '</div>' +

            '<div class="wsite-two">' +
              field('Button text', 'Leave empty to hide the button.', '<input type="text" class="admin-panel-input" id="wce-btn" maxlength="40" value="' + esc(c.buttonLabel) + '">') +
              field('Button link', 'e.g. # or https://\u2026', '<input type="text" class="admin-panel-input" id="wce-link" maxlength="300" value="' + esc(c.buttonLink) + '">') +
            '</div>' +

            '<div class="wsite-checks">' +
              '<label><input type="checkbox" id="wce-waitlist"' + (c.waitlist ? ' checked' : '') + '> Style the button as a waitlist button</label>' +
              (cfg().hasHighlight
                ? '<label><input type="checkbox" id="wce-highlight"' + (c.highlight ? ' checked' : '') + '> Highlight this card (tangerine, white icon)</label>'
                : '') +
              '<label><input type="checkbox" id="wce-hidden"' + (c.hidden ? ' checked' : '') + '> Hide this ' + esc(cfg().noun) + ' from the public page</label>' +
            '</div>' +
          '</div>' +

          '<div class="wsite-preview-wrap">' +
            '<p class="wsite-label">Preview</p>' +
            '<p class="wsite-hint">' + esc(cfg().previewHint) + '</p>' +
            '<div class="' + cfg().previewClass + '" id="wce-preview"></div>' +
          '</div>' +
        '</div>' +

        '<div class="wsite-actions">' +
          '<button type="button" class="btn-admin-primary" id="wce-save">Save changes</button>' +
          '<button type="button" class="wsite-link-btn" id="wce-done">Back to ' + esc(cfg().title) + '</button>' +
          '<button type="button" class="wsite-link-btn wsite-link-btn--danger" id="wce-delete">Delete this ' + esc(cfg().noun) + '</button>' +
          '<span class="wsite-status" id="wce-status" role="status"></span>' +
        '</div>' +
      '</div>';

    updateClassPreview(c);
    wireClassEditor(c);
  }

  function updateClassPreview(c) {
    var box = panel.querySelector('#wce-preview');
    if (box) box.innerHTML = cfg().render(classPreviewCard(c));
  }

  function wireClassEditor(c) {
    var statusEl = panel.querySelector('#wce-status');
    function touch() { dirty = true; setStatus(statusEl, ''); updateClassPreview(c); }
    function bind(id, fn) { panel.querySelector(id).addEventListener('input', function (e) { fn(e.target.value); touch(); }); }

    bind('#wce-name', function (v) { c.name = v; });
    bind('#wce-type', function (v) { c.type = v; });
    bind('#wce-desc', function (v) { c.desc = v; });
    bind('#wce-price', function (v) { c.price = v; });
    bind('#wce-meta', function (v) {
      c.meta = v.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).slice(0, 8);
    });
    bind('#wce-slotslabel', function (v) { c.slotsLabel = v; });
    bind('#wce-btn', function (v) { c.buttonLabel = v; });
    bind('#wce-link', function (v) { c.buttonLink = v; });
    panel.querySelector('#wce-waitlist').addEventListener('change', function (e) { c.waitlist = e.target.checked; touch(); });
    var hl = panel.querySelector('#wce-highlight');
    if (hl) hl.addEventListener('change', function (e) { c.highlight = e.target.checked; touch(); });
    panel.querySelector('#wce-hidden').addEventListener('change', function (e) { c.hidden = e.target.checked; touch(); });

    // Slots
    var slotsEl = panel.querySelector('#wce-slots');
    function slotIndex(el) { return parseInt(el.closest('[data-i]').getAttribute('data-i'), 10); }
    slotsEl.addEventListener('input', function (e) {
      if (!e.target.matches('[data-slot-text]')) return;
      c.slots[slotIndex(e.target)].text = e.target.value;
      touch();
    });
    slotsEl.addEventListener('change', function (e) {
      if (!e.target.matches('[data-slot-status]')) return;
      c.slots[slotIndex(e.target)].status = e.target.value === 'full' ? 'full' : 'available';
      touch();
    });
    slotsEl.addEventListener('click', function (e) {
      var del = e.target.closest('[data-slot-del]');
      if (!del) return;
      c.slots.splice(slotIndex(del), 1);
      dirty = true;
      renderClassEditor();
    });
    panel.querySelector('#wce-addslot').addEventListener('click', function () {
      c.slots.push({ text: '', status: 'available' });
      dirty = true;
      renderClassEditor();
      var inputs = panel.querySelectorAll('[data-slot-text]');
      if (inputs.length) inputs[inputs.length - 1].focus();
    });

    // Icon
    panel.querySelector('#wce-file').addEventListener('change', async function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setStatus(statusEl, 'Uploading icon\u2026', 'busy');
      var res = await FLO.uploadImage(file, cfg().folder, { maxDim: 512, quality: 0.9 });
      if (!res.ok) { setStatus(statusEl, res.error, 'err'); return; }
      c.icon = res.url;
      dirty = true;
      renderClassEditor();
      setStatus(panel.querySelector('#wce-status'), 'Icon uploaded. Press Save changes to publish it.', 'ok');
    });
    var rm = panel.querySelector('#wce-rmicon');
    if (rm) rm.addEventListener('click', function () { c.icon = ''; dirty = true; renderClassEditor(); });

    // Navigation / actions
    function back() { draft.view = 'list'; draft.editId = null; renderClassList(); }
    panel.querySelector('#wce-back').addEventListener('click', back);
    panel.querySelector('#wce-done').addEventListener('click', back);
    panel.querySelector('#wce-delete').addEventListener('click', function () {
      if (!window.confirm('Delete \u201C' + c.name + '\u201D? It is removed from the public page when you press Save changes.')) return;
      draft.cards = draft.cards.filter(function (x) { return x.id !== c.id; });
      dirty = true;
      back();
    });
    panel.querySelector('#wce-save').addEventListener('click', function (e) { saveClasses(e.currentTarget, statusEl); });
  }

  async function saveClasses(btn, statusEl) {
    // Validate
    for (var i = 0; i < draft.cards.length; i++) {
      var c = draft.cards[i];
      if (!String(c.name || '').trim()) {
        setStatus(statusEl, 'Every card needs a name (card ' + (i + 1) + ').', 'err');
        return;
      }
      var link = String(c.buttonLink || '').trim();
      if (c.buttonLabel.trim() && link && !/^(#|https?:\/\/|mailto:|tel:)/i.test(link)) {
        setStatus(statusEl, 'The button link on \u201C' + c.name + '\u201D must start with #, https://, mailto: or tel:.', 'err');
        return;
      }
    }
    var cards = draft.cards.map(function (c) {
      return {
        id: c.id, icon: c.icon, name: c.name.trim(), type: c.type.trim(), desc: c.desc.trim(), price: c.price.trim(),
        meta: c.meta, slotsLabel: c.slotsLabel.trim(),
        slots: c.slots.map(function (s) { return { text: s.text.trim(), status: s.status }; }).filter(function (s) { return s.text; }),
        buttonLabel: c.buttonLabel.trim(), buttonLink: String(c.buttonLink || '').trim() || '#',
        waitlist: c.waitlist, highlight: cfg().hasHighlight && c.highlight, hidden: c.hidden
      };
    });
    btn.disabled = true;
    setStatus(statusEl, 'Saving\u2026', 'busy');
    var next = FLO.clone(FLO.website);
    next[cfg().key] = {
      header: { label: draft.header.label.trim(), title: draft.header.title.trim(), sub: draft.header.sub.trim() },
      cards: cards
    };
    var res = await FLO.saveWebsite(next);
    btn.disabled = false;
    if (!res.ok) { setStatus(statusEl, res.error, 'err'); return; }

    var view = draft.view, editId = draft.editId;
    dirty = false;
    draft = null;
    ensureClassesDraft();
    draft.view = view;
    draft.editId = editId;
    renderClasses();
    setStatus(panel.querySelector('#wc-status') || panel.querySelector('#wce-status'),
      'Saved. The public page is updated.', 'ok');
  }

  /* ── Our Story editor ───────────────────────────────── */
  var MAX_PILLARS = 6, MAX_STATS = 6;

  var AUTO_OPTIONS = [
    { value: '',        label: 'Fixed text' },
    { value: 'classes', label: 'Count of class cards' },
    { value: 'team',    label: 'Count of instructors' }
  ];

  function ensureStoryDraft() {
    if (!draft || draft.__tab !== 'story') {
      draft = { __tab: 'story', d: FLO.clone(FLO.website.story) };
    }
    return draft.d;
  }

  function renderStory() {
    var d = ensureStoryDraft();

    var pillarRows = d.pillars.map(function (p, i) {
      return '<div class="wsite-prow" data-pi="' + i + '">' +
        '<input type="text" class="admin-panel-input wsite-prow-short" data-pf="word" maxlength="30" aria-label="Pillar ' + (i + 1) + ' word" placeholder="Word" value="' + esc(p.word) + '">' +
        '<textarea class="admin-panel-input" data-pf="desc" rows="2" maxlength="400" aria-label="Pillar ' + (i + 1) + ' text" placeholder="Short description">' + esc(p.desc) + '</textarea>' +
        '<span class="wsite-prow-btns">' +
          '<button type="button" class="wsite-move" data-pact="up" aria-label="Move pillar ' + (i + 1) + ' up"' + (i === 0 ? ' disabled' : '') + '>\u25B2</button>' +
          '<button type="button" class="wsite-move" data-pact="down" aria-label="Move pillar ' + (i + 1) + ' down"' + (i === d.pillars.length - 1 ? ' disabled' : '') + '>\u25BC</button>' +
          '<button type="button" class="wsite-small wsite-small--danger" data-pact="del">Delete</button>' +
        '</span>' +
      '</div>';
    }).join('');

    var statRows = d.stats.map(function (x, i) {
      var isAuto = !!x.auto;
      return '<div class="wsite-prow wsite-srow" data-si="' + i + '">' +
        '<input type="text" class="admin-panel-input wsite-prow-short" data-sf="value" maxlength="30" aria-label="Number ' + (i + 1) + ' value" placeholder="' + (isAuto ? 'Automatic' : 'e.g. 100%') + '" value="' + (isAuto ? '' : esc(x.value)) + '"' + (isAuto ? ' disabled' : '') + '>' +
        '<input type="text" class="admin-panel-input" data-sf="label" maxlength="40" aria-label="Number ' + (i + 1) + ' label" placeholder="Label" value="' + esc(x.label) + '">' +
        '<span class="wsite-srow-src">' +
          '<select class="admin-panel-select" data-sf="auto" aria-label="Number ' + (i + 1) + ' source">' +
            AUTO_OPTIONS.map(function (o) { return '<option value="' + o.value + '"' + (o.value === x.auto ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('') +
          '</select>' +
          (isAuto ? '<span class="wsite-hint wsite-srow-now">Currently ' + FLO.autoStat(x.auto, FLO.website) + '</span>' : '') +
        '</span>' +
        '<span class="wsite-prow-btns">' +
          '<button type="button" class="wsite-move" data-sact="up" aria-label="Move number ' + (i + 1) + ' up"' + (i === 0 ? ' disabled' : '') + '>\u25B2</button>' +
          '<button type="button" class="wsite-move" data-sact="down" aria-label="Move number ' + (i + 1) + ' down"' + (i === d.stats.length - 1 ? ' disabled' : '') + '>\u25BC</button>' +
          '<button type="button" class="wsite-small wsite-small--danger" data-sact="del">Delete</button>' +
        '</span>' +
      '</div>';
    }).join('');

    panel.innerHTML =
      '<div class="portal-section wsite-card">' +
        '<h3 class="portal-section-title">Our Story</h3>' +
        '<p class="portal-section-desc">The \u201COur story\u201D section: the text, the pillars (Feel \u00B7 Look \u00B7 Own) and the row of numbers beneath.</p>' +

        '<h4 class="wsite-subhead">Text</h4>' +
        '<div class="wsite-form">' +
        '<div class="wsite-two">' +
          field('Small label', 'Small text above the title.', '<input type="text" class="admin-panel-input" id="ws-label" maxlength="80" value="' + esc(d.label) + '">') +
          field('Title', 'One line per row.', '<textarea class="admin-panel-input" id="ws-title" rows="2" maxlength="200">' + esc(d.titleLines.join('\n')) + '</textarea>') +
        '</div>' +
        field('Paragraphs', 'Leave a blank line between paragraphs (up to 8).',
          '<textarea class="admin-panel-input" id="ws-paras" rows="7" maxlength="6000">' + esc(d.paragraphs.join('\n\n')) + '</textarea>') +
        '<div class="wsite-two">' +
          field('Button text', 'Leave empty to hide the button.', '<input type="text" class="admin-panel-input" id="ws-btn" maxlength="40" value="' + esc(d.buttonLabel) + '">') +
          field('Button link', 'e.g. #instructors or https://\u2026', '<input type="text" class="admin-panel-input" id="ws-link" maxlength="300" value="' + esc(d.buttonLink) + '">') +
        '</div>' +
        field('Closing line', 'Optional. Shown in italics, centred, under the pillars (e.g. \u201C\u2014 FLO is that place.\u201D).',
          '<input type="text" class="admin-panel-input" id="ws-closing" maxlength="200" value="' + esc(d.closing) + '">') +
        '</div>' +

        '<div class="wsite-subhead-row"><h4 class="wsite-subhead">Pillars (' + d.pillars.length + ')</h4>' +
          '<button type="button" class="btn-admin-add" id="ws-addpillar"' + (d.pillars.length >= MAX_PILLARS ? ' disabled' : '') + '>+ Add pillar</button></div>' +
        (pillarRows || '<p class="admin-empty-note">No pillars.</p>') +

        '<div class="wsite-subhead-row"><h4 class="wsite-subhead">Numbers (' + d.stats.length + ')</h4>' +
          '<button type="button" class="btn-admin-add" id="ws-addstat"' + (d.stats.length >= MAX_STATS ? ' disabled' : '') + '>+ Add number</button></div>' +
        '<p class="wsite-hint">Each number is either fixed text or counted automatically from the cards on the page.</p>' +
        (statRows || '<p class="admin-empty-note">No numbers.</p>') +

        '<h4 class="wsite-subhead">Preview</h4>' +
        '<div class="wsite-about-preview" id="ws-preview"></div>' +

        actions('ws') +
      '</div>';

    updateStoryPreview();
    wireStory();
  }

  function updateStoryPreview() {
    var box = panel.querySelector('#ws-preview');
    if (!box) return;
    var d = FLO.clone(draft.d);
    d.buttonLink = '#';
    box.innerHTML = FLO.storyHTML(d, FLO.website);
  }

  function wireStory() {
    var d = draft.d;
    var statusEl = panel.querySelector('#ws-status');
    function touch() { dirty = true; setStatus(statusEl, ''); updateStoryPreview(); }
    function bind(id, fn) { panel.querySelector(id).addEventListener('input', function (e) { fn(e.target.value); touch(); }); }
    function move(arr, i, dir) {
      var j = dir === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length) return false;
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      return true;
    }

    bind('#ws-label', function (v) { d.label = v; });
    bind('#ws-title', function (v) { d.titleLines = v.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean); });
    bind('#ws-paras', function (v) { d.paragraphs = v.split(/\r?\n\s*\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean); });
    bind('#ws-btn', function (v) { d.buttonLabel = v; });
    bind('#ws-link', function (v) { d.buttonLink = v; });
    bind('#ws-closing', function (v) { d.closing = v; });

    // Pillars
    panel.querySelectorAll('[data-pi]').forEach(function (row) {
      var i = parseInt(row.getAttribute('data-pi'), 10);
      row.addEventListener('input', function (e) {
        var f = e.target.getAttribute('data-pf');
        if (!f) return;
        d.pillars[i][f] = e.target.value;
        touch();
      });
      row.addEventListener('click', function (e) {
        var b = e.target.closest('[data-pact]');
        if (!b || b.disabled) return;
        var act = b.getAttribute('data-pact');
        if (act === 'del') d.pillars.splice(i, 1);
        else if (!move(d.pillars, i, act)) return;
        dirty = true;
        renderStory();
      });
    });
    panel.querySelector('#ws-addpillar').addEventListener('click', function () {
      d.pillars.push({ word: '', desc: '' });
      dirty = true;
      renderStory();
      var words = panel.querySelectorAll('[data-pf="word"]');
      if (words.length) words[words.length - 1].focus();
    });

    // Numbers
    panel.querySelectorAll('[data-si]').forEach(function (row) {
      var i = parseInt(row.getAttribute('data-si'), 10);
      row.addEventListener('input', function (e) {
        var f = e.target.getAttribute('data-sf');
        if (f !== 'value' && f !== 'label') return;
        d.stats[i][f] = e.target.value;
        touch();
      });
      row.addEventListener('change', function (e) {
        if (e.target.getAttribute('data-sf') !== 'auto') return;
        d.stats[i].auto = e.target.value;
        dirty = true;
        renderStory();
      });
      row.addEventListener('click', function (e) {
        var b = e.target.closest('[data-sact]');
        if (!b || b.disabled) return;
        var act = b.getAttribute('data-sact');
        if (act === 'del') d.stats.splice(i, 1);
        else if (!move(d.stats, i, act)) return;
        dirty = true;
        renderStory();
      });
    });
    panel.querySelector('#ws-addstat').addEventListener('click', function () {
      d.stats.push({ value: '', label: '', auto: '' });
      dirty = true;
      renderStory();
      var vals = panel.querySelectorAll('[data-sf="value"]');
      if (vals.length) vals[vals.length - 1].focus();
    });

    panel.querySelector('#ws-discard').addEventListener('click', function () {
      if (dirty && !window.confirm('Discard your unsaved changes?')) return;
      draft = null;
      dirty = false;
      renderStory();
    });

    panel.querySelector('#ws-save').addEventListener('click', async function (e) {
      var btn = e.currentTarget;
      var link = String(d.buttonLink || '').trim();
      if (d.buttonLabel.trim() && link && !/^(#|https?:\/\/|mailto:|tel:)/i.test(link)) {
        setStatus(statusEl, 'The button link must start with #, https://, mailto: or tel:.', 'err');
        return;
      }
      for (var k = 0; k < d.stats.length; k++) {
        var x = d.stats[k];
        if (!x.auto && !x.value.trim() && x.label.trim()) {
          setStatus(statusEl, 'Number ' + (k + 1) + ' (\u201C' + x.label.trim() + '\u201D) needs a value or an automatic source.', 'err');
          return;
        }
      }
      var story = {
        label: d.label.trim(),
        titleLines: d.titleLines.slice(),
        paragraphs: d.paragraphs.slice(),
        buttonLabel: d.buttonLabel.trim(),
        buttonLink: link || '#',
        pillars: d.pillars.map(function (p) { return { word: p.word.trim(), desc: p.desc.trim() }; })
                          .filter(function (p) { return p.word || p.desc; }),
        stats: d.stats.map(function (x) { return { value: x.auto ? '' : x.value.trim(), label: x.label.trim(), auto: x.auto || '' }; })
                      .filter(function (x) { return x.value || x.label || x.auto; }),
        closing: d.closing.trim()
      };
      btn.disabled = true;
      setStatus(statusEl, 'Saving\u2026', 'busy');
      var next = FLO.clone(FLO.website);
      next.story = story;
      var res = await FLO.saveWebsite(next);
      btn.disabled = false;
      if (!res.ok) { setStatus(statusEl, res.error, 'err'); return; }
      dirty = false;
      draft = null;
      renderStory();
      setStatus(panel.querySelector('#ws-status'), 'Saved. The public page is updated.', 'ok');
    });
  }

  /* ── The Team editor ────────────────────────────────── */
  var MAX_TEAM = 30, MAX_TAGS = 10;

  function newMember() {
    return { id: FLO.newId('t'), photo: '', name: 'New team member', role: '', bio: '', tags: [],
             focus: 'center', counts: true, hidden: false };
  }

  function ensureTeamDraft() {
    if (!draft || draft.__tab !== 'team') {
      draft = { __tab: 'team', view: 'list', editId: null,
                header: FLO.clone(FLO.website.team.header), cards: FLO.clone(FLO.website.team.cards) };
    }
  }
  function findMember(id) { return draft.cards.filter(function (c) { return c.id === id; })[0]; }

  function renderTeam() {
    ensureTeamDraft();
    if (draft.view === 'edit' && findMember(draft.editId)) return renderMemberEditor();
    draft.view = 'list';
    draft.editId = null;
    renderTeamList();
  }

  function memberThumb(c) {
    var url = FLO.safeImageUrl(c.photo);
    return url
      ? '<img class="wsite-crow-thumb wsite-crow-thumb--photo" src="' + esc(url) + '" alt="">'
      : '<span class="wsite-crow-thumb wsite-crow-thumb--ph">' + esc((c.name || '?').charAt(0).toUpperCase()) + '</span>';
  }

  function renderTeamList() {
    var h = draft.header;
    var rows = draft.cards.map(function (c, i) {
      var last = i === draft.cards.length - 1;
      var badges = (c.hidden ? '<span class="wsite-badge">Hidden</span>' : '') +
                   (!c.counts ? '<span class="wsite-badge">Not counted</span>' : '');
      var sub = [c.role, c.tags.map(function (t) { return t.text; }).join(' \u00B7 ')].filter(Boolean).join(' \u2014 ');
      return '<li class="wsite-crow' + (c.hidden ? ' is-hidden' : '') + '" data-id="' + esc(c.id) + '">' +
        memberThumb(c) +
        '<span class="wsite-crow-main">' +
          '<span class="wsite-crow-name">' + esc(c.name) + '</span>' +
          '<span class="wsite-crow-type">' + esc(sub) + '</span>' +
          (badges ? '<span class="wsite-badges">' + badges + '</span>' : '') +
        '</span>' +
        '<span class="wsite-crow-btns">' +
          '<button type="button" class="wsite-move" data-act="up" aria-label="Move ' + esc(c.name) + ' up"' + (i === 0 ? ' disabled' : '') + '>\u25B2</button>' +
          '<button type="button" class="wsite-move" data-act="down" aria-label="Move ' + esc(c.name) + ' down"' + (last ? ' disabled' : '') + '>\u25BC</button>' +
          '<button type="button" class="wsite-small" data-act="edit">Edit</button>' +
          '<button type="button" class="wsite-small" data-act="dup"' + (draft.cards.length >= MAX_TEAM ? ' disabled' : '') + '>Duplicate</button>' +
          '<button type="button" class="wsite-small wsite-small--danger" data-act="del">Delete</button>' +
        '</span>' +
      '</li>';
    }).join('');

    panel.innerHTML =
      '<div class="portal-section wsite-card">' +
        '<h3 class="portal-section-title">The Team</h3>' +
        '<p class="portal-section-desc">The team cards on the public page. This is the public display only; instructor accounts and the schedule are managed separately in the main menu.</p>' +
        '<h4 class="wsite-subhead">Section heading</h4>' +
        '<div class="wsite-three">' +
          field('Small label', 'Small text above the title.', '<input type="text" class="admin-panel-input" id="wc-label" maxlength="80" value="' + esc(h.label) + '">') +
          field('Title', 'The main heading.', '<input type="text" class="admin-panel-input" id="wc-title" maxlength="120" value="' + esc(h.title) + '">') +
          field('Sub-text', 'Line breaks are kept.', '<textarea class="admin-panel-input" id="wc-sub" rows="2" maxlength="300">' + esc(h.sub) + '</textarea>') +
        '</div>' +
        '<div class="wsite-subhead-row">' +
          '<h4 class="wsite-subhead">Team members (' + draft.cards.length + ')</h4>' +
          '<button type="button" class="btn-admin-add" id="wc-add"' + (draft.cards.length >= MAX_TEAM ? ' disabled' : '') + '>+ Add team member</button>' +
        '</div>' +
        (rows ? '<ul class="wsite-clist">' + rows + '</ul>' : '<p class="admin-empty-note">No team members yet.</p>') +
        actions('wc') +
      '</div>';
    wireTeamList();
  }

  function wireTeamList() {
    var statusEl = panel.querySelector('#wc-status');
    function touch() { dirty = true; setStatus(statusEl, ''); }
    panel.querySelector('#wc-label').addEventListener('input', function (e) { draft.header.label = e.target.value; touch(); });
    panel.querySelector('#wc-title').addEventListener('input', function (e) { draft.header.title = e.target.value; touch(); });
    panel.querySelector('#wc-sub').addEventListener('input', function (e) { draft.header.sub = e.target.value; touch(); });

    panel.querySelector('#wc-add').addEventListener('click', function () {
      var m = newMember();
      draft.cards.push(m);
      draft.view = 'edit';
      draft.editId = m.id;
      dirty = true;
      renderMemberEditor();
    });

    var listEl = panel.querySelector('.wsite-clist');
    if (listEl) {
      listEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-act]');
        if (!btn || btn.disabled) return;
        var row = btn.closest('[data-id]');
        var id = row && row.getAttribute('data-id');
        var i = draft.cards.map(function (c) { return c.id; }).indexOf(id);
        if (i < 0) return;
        var act = btn.getAttribute('data-act');
        if (act === 'edit') {
          draft.view = 'edit'; draft.editId = id; renderMemberEditor();
        } else if (act === 'up' || act === 'down') {
          var j = act === 'up' ? i - 1 : i + 1;
          if (j < 0 || j >= draft.cards.length) return;
          var tmp = draft.cards[i]; draft.cards[i] = draft.cards[j]; draft.cards[j] = tmp;
          dirty = true; renderTeamList();
        } else if (act === 'dup') {
          var copy = FLO.clone(draft.cards[i]);
          copy.id = FLO.newId('t');
          copy.name = (copy.name + ' (copy)').slice(0, 60);
          draft.cards.splice(i + 1, 0, copy);
          dirty = true; renderTeamList();
        } else if (act === 'del') {
          if (!window.confirm('Delete \u201C' + draft.cards[i].name + '\u201D? They are removed from the public page when you press Save changes.')) return;
          draft.cards.splice(i, 1);
          dirty = true; renderTeamList();
        }
      });
    }
    panel.querySelector('#wc-discard').addEventListener('click', function () {
      if (dirty && !window.confirm('Discard your unsaved changes?')) return;
      draft = null; dirty = false; renderTeam();
    });
    panel.querySelector('#wc-save').addEventListener('click', function (e) { saveTeam(e.currentTarget, statusEl); });
  }

  function renderMemberEditor() {
    var c = findMember(draft.editId);
    if (!c) { draft.view = 'list'; return renderTeamList(); }
    var photoUrl = FLO.safeImageUrl(c.photo);
    var pos = c.focus === 'top' ? 'center top' : c.focus === 'bottom' ? 'center bottom' : 'center';

    var tagRows = c.tags.map(function (t, i) {
      return '<div class="wsite-slot-row" data-ti="' + i + '">' +
        '<input type="text" class="admin-panel-input" data-tag-text maxlength="40" aria-label="Tag ' + (i + 1) + ' text" placeholder="e.g. Flow" value="' + esc(t.text) + '">' +
        '<select class="admin-panel-select" data-tag-style aria-label="Tag ' + (i + 1) + ' style">' +
          '<option value=""' + (t.style !== 'accent' ? ' selected' : '') + '>Standard (teal)</option>' +
          '<option value="accent"' + (t.style === 'accent' ? ' selected' : '') + '>Accent (tangerine)</option>' +
        '</select>' +
        '<button type="button" class="wsite-small wsite-small--danger" data-tag-del>Remove</button>' +
      '</div>';
    }).join('');

    panel.innerHTML =
      '<div class="portal-section wsite-card">' +
        '<p class="wsite-back"><button type="button" class="wsite-link-btn" id="wce-back">\u2190 Back to The Team</button></p>' +
        '<h3 class="portal-section-title">Edit team member</h3>' +
        '<div class="wsite-grid">' +
          '<div class="wsite-form">' +
            '<div class="wsite-two">' +
              field('Name', 'As shown on the card.', '<input type="text" class="admin-panel-input" id="wce-name" maxlength="60" value="' + esc(c.name) + '">') +
              field('Role', 'Shown under the name. Optional.', '<input type="text" class="admin-panel-input" id="wce-role" maxlength="80" value="' + esc(c.role) + '">') +
            '</div>' +
            field('Bio', 'Shown over the photo when a visitor hovers over the card.', '<textarea class="admin-panel-input" id="wce-bio" rows="4" maxlength="400">' + esc(c.bio) + '</textarea>') +

            '<div class="wsite-field">' +
              '<label class="wsite-label">Photo</label>' +
              '<p class="wsite-hint">Photos are cropped to a wide frame on the page. Large images are reduced automatically.</p>' +
              (photoUrl ? '<img class="wsite-photo-thumb" src="' + esc(photoUrl) + '" alt="Current photo" style="object-position:' + pos + '">' : '') +
              '<div class="wsite-row">' +
                '<label class="btn-admin-add wsite-upload">' + (photoUrl ? 'Replace photo' : 'Upload photo') +
                  '<input type="file" id="wce-file" accept="image/png,image/jpeg,image/webp" hidden>' +
                '</label>' +
                (photoUrl ? '<button type="button" class="wsite-link-btn" id="wce-rmphoto">Remove photo</button>' : '') +
              '</div>' +
            '</div>' +
            '<div class="wsite-field">' +
              '<label class="wsite-label" for="wce-focus">Photo focus</label>' +
              '<p class="wsite-hint">Which part of the photo stays in view when it is cropped. Use Top for portrait photos so faces are not cut off.</p>' +
              '<select class="admin-panel-select" id="wce-focus">' +
                '<option value="center"' + (c.focus === 'center' ? ' selected' : '') + '>Centre</option>' +
                '<option value="top"' + (c.focus === 'top' ? ' selected' : '') + '>Top</option>' +
                '<option value="bottom"' + (c.focus === 'bottom' ? ' selected' : '') + '>Bottom</option>' +
              '</select>' +
            '</div>' +

            '<div class="wsite-field">' +
              '<label class="wsite-label">Tags</label>' +
              '<p class="wsite-hint">Small labels under the name, usually the classes this person teaches (up to 10).</p>' +
              '<div class="wsite-slots" id="wce-tags">' + tagRows + '</div>' +
              '<button type="button" class="wsite-small" id="wce-addtag"' + (c.tags.length >= MAX_TAGS ? ' disabled' : '') + '>+ Add tag</button>' +
            '</div>' +

            '<div class="wsite-checks">' +
              '<label><input type="checkbox" id="wce-counts"' + (c.counts ? ' checked' : '') + '> Count as an instructor in the numbers row (Our Story)</label>' +
              '<label><input type="checkbox" id="wce-hidden"' + (c.hidden ? ' checked' : '') + '> Hide this person from the public page</label>' +
            '</div>' +
          '</div>' +
          '<div class="wsite-preview-wrap">' +
            '<p class="wsite-label">Preview</p>' +
            '<p class="wsite-hint">Hover over the card to see the bio, as visitors do.</p>' +
            '<div class="wsite-team-preview" id="wce-preview"></div>' +
          '</div>' +
        '</div>' +
        '<div class="wsite-actions">' +
          '<button type="button" class="btn-admin-primary" id="wce-save">Save changes</button>' +
          '<button type="button" class="wsite-link-btn" id="wce-done">Back to The Team</button>' +
          '<button type="button" class="wsite-link-btn wsite-link-btn--danger" id="wce-delete">Delete this person</button>' +
          '<span class="wsite-status" id="wce-status" role="status"></span>' +
        '</div>' +
      '</div>';

    updateMemberPreview(c);
    wireMemberEditor(c);
  }

  function updateMemberPreview(c) {
    var box = panel.querySelector('#wce-preview');
    if (!box) return;
    var pc = FLO.clone(c);
    pc.tags = pc.tags.filter(function (t) { return t.text.trim(); });
    box.innerHTML = FLO.teamCardHTML(pc);
  }

  function wireMemberEditor(c) {
    var statusEl = panel.querySelector('#wce-status');
    function touch() { dirty = true; setStatus(statusEl, ''); updateMemberPreview(c); }
    function bind(id, fn) { panel.querySelector(id).addEventListener('input', function (e) { fn(e.target.value); touch(); }); }
    bind('#wce-name', function (v) { c.name = v; });
    bind('#wce-role', function (v) { c.role = v; });
    bind('#wce-bio', function (v) { c.bio = v; });
    panel.querySelector('#wce-focus').addEventListener('change', function (e) {
      c.focus = e.target.value; dirty = true; renderMemberEditor();
    });
    panel.querySelector('#wce-counts').addEventListener('change', function (e) { c.counts = e.target.checked; touch(); });
    panel.querySelector('#wce-hidden').addEventListener('change', function (e) { c.hidden = e.target.checked; touch(); });

    // Tags
    var tagsEl = panel.querySelector('#wce-tags');
    function tagIndex(el) { return parseInt(el.closest('[data-ti]').getAttribute('data-ti'), 10); }
    tagsEl.addEventListener('input', function (e) {
      if (!e.target.matches('[data-tag-text]')) return;
      c.tags[tagIndex(e.target)].text = e.target.value; touch();
    });
    tagsEl.addEventListener('change', function (e) {
      if (!e.target.matches('[data-tag-style]')) return;
      c.tags[tagIndex(e.target)].style = e.target.value === 'accent' ? 'accent' : ''; touch();
    });
    tagsEl.addEventListener('click', function (e) {
      var del = e.target.closest('[data-tag-del]');
      if (!del) return;
      c.tags.splice(tagIndex(del), 1); dirty = true; renderMemberEditor();
    });
    panel.querySelector('#wce-addtag').addEventListener('click', function () {
      c.tags.push({ text: '', style: '' }); dirty = true; renderMemberEditor();
      var inputs = panel.querySelectorAll('[data-tag-text]');
      if (inputs.length) inputs[inputs.length - 1].focus();
    });

    // Photo
    panel.querySelector('#wce-file').addEventListener('change', async function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setStatus(statusEl, 'Uploading photo\u2026', 'busy');
      var res = await FLO.uploadImage(file, 'team', { maxDim: 900, quality: 0.85 });
      if (!res.ok) { setStatus(statusEl, res.error, 'err'); return; }
      c.photo = res.url; dirty = true; renderMemberEditor();
      setStatus(panel.querySelector('#wce-status'), 'Photo uploaded. Press Save changes to publish it.', 'ok');
    });
    var rm = panel.querySelector('#wce-rmphoto');
    if (rm) rm.addEventListener('click', function () { c.photo = ''; dirty = true; renderMemberEditor(); });

    function back() { draft.view = 'list'; draft.editId = null; renderTeamList(); }
    panel.querySelector('#wce-back').addEventListener('click', back);
    panel.querySelector('#wce-done').addEventListener('click', back);
    panel.querySelector('#wce-delete').addEventListener('click', function () {
      if (!window.confirm('Delete \u201C' + c.name + '\u201D? They are removed from the public page when you press Save changes.')) return;
      draft.cards = draft.cards.filter(function (x) { return x.id !== c.id; });
      dirty = true; back();
    });
    panel.querySelector('#wce-save').addEventListener('click', function (e) { saveTeam(e.currentTarget, statusEl); });
  }

  async function saveTeam(btn, statusEl) {
    for (var i = 0; i < draft.cards.length; i++) {
      if (!String(draft.cards[i].name || '').trim()) {
        setStatus(statusEl, 'Every team member needs a name (card ' + (i + 1) + ').', 'err');
        return;
      }
    }
    var cards = draft.cards.map(function (c) {
      return {
        id: c.id, photo: c.photo, name: c.name.trim(), role: c.role.trim(), bio: c.bio.trim(),
        tags: c.tags.map(function (t) { return { text: t.text.trim(), style: t.style }; })
                    .filter(function (t) { return t.text; }),
        focus: c.focus, counts: c.counts, hidden: c.hidden
      };
    });
    btn.disabled = true;
    setStatus(statusEl, 'Saving\u2026', 'busy');
    var next = FLO.clone(FLO.website);
    next.team = {
      header: { label: draft.header.label.trim(), title: draft.header.title.trim(), sub: draft.header.sub.trim() },
      cards: cards
    };
    var res = await FLO.saveWebsite(next);
    btn.disabled = false;
    if (!res.ok) { setStatus(statusEl, res.error, 'err'); return; }
    var view = draft.view, editId = draft.editId;
    dirty = false;
    draft = null;
    ensureTeamDraft();
    draft.view = view;
    draft.editId = editId;
    renderTeam();
    setStatus(panel.querySelector('#wc-status') || panel.querySelector('#wce-status'), 'Saved. The public page is updated.', 'ok');
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
