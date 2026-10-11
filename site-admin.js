/* =========================================================
   FLO Studio — site-admin.js
   The "Website" area of the admin portal. Lets the signed-in
   administrator edit what visitors see on the public site.

   Built so far: Hero, Classes, FLO Kids, Our Story, The Team, Workshops & Events, Page Order.
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
    { key: 'events', label: 'Workshops & Events',  built: true },
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
    if (key === 'events') return renderEvents();
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

  /* ── Workshops & Events editor ──────────────────────── */
  function ensureEventsDraft() {
    if (!draft || draft.__tab !== 'events') {
      draft = { __tab: 'events', sub: 'upcoming', view: 'list', editId: null, d: FLO.clone(FLO.website.events) };
    }
    return draft.d;
  }
  function evW() { return { events: draft.d }; }            // lets the shared renderers use draft types
  function evFind(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function typeUse(id) {
    var d = draft.d;
    return d.upcoming.filter(function (e) { return e.typeId === id; }).length +
           d.past.filter(function (e) { return e.typeId === id; }).length;
  }
  function typeOptions(selected, allowNone) {
    return (allowNone ? '<option value=""' + (!selected ? ' selected' : '') + '>No type</option>' : '') +
      draft.d.types.map(function (t) {
        return '<option value="' + esc(t.id) + '"' + (t.id === selected ? ' selected' : '') + '>' + esc(t.label) + '</option>';
      }).join('');
  }
  function sortUp(list) {
    return list.slice().sort(function (a, b) { return (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')); });
  }
  function sortPast(list) { return list.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }); }
  function dateLabel(iso) {
    if (!FLO.validDate(iso)) return 'No date';
    var p = FLO.dateParts(iso);
    return p.weekday.slice(0, 3) + ' ' + p.day + ' ' + p.mon + ' ' + p.year;
  }
  function evTypeBadge(id) {
    var t = evFind(draft.d.types, id);
    return t ? '<span class="workshop-badge badge-c-' + esc(t.color) + '">' + esc(t.label) + '</span>' : '';
  }

  function renderEvents() {
    ensureEventsDraft();
    var sub = draft.sub, edit = draft.view === 'edit';
    if (sub === 'settings') return renderEventSettings();
    if (sub === 'past') {
      if (edit && evFind(draft.d.past, draft.editId)) return renderPastEditor();
      draft.view = 'list'; draft.editId = null;
      return renderPastList();
    }
    if (edit && evFind(draft.d.upcoming, draft.editId)) return renderUpcomingEditor();
    draft.sub = 'upcoming'; draft.view = 'list'; draft.editId = null;
    renderUpcomingList();
  }

  function evSubTabs() {
    var d = draft.d;
    var items = [['upcoming', 'Upcoming (' + d.upcoming.length + ')'], ['past', 'Past events (' + d.past.length + ')'], ['settings', 'Settings']];
    return '<div class="admin-audience-tabs wsite-subtabs">' + items.map(function (it) {
      return '<button type="button" class="admin-audience-tab' + (draft.sub === it[0] ? ' active' : '') + '" data-esub="' + it[0] + '">' + esc(it[1]) + '</button>';
    }).join('') + '</div>';
  }
  function wireSubTabs() {
    panel.querySelectorAll('[data-esub]').forEach(function (b) {
      b.addEventListener('click', function () {
        draft.sub = b.getAttribute('data-esub'); draft.view = 'list'; draft.editId = null;
        renderEvents();
      });
    });
  }
  function cardOpen(title, desc) {
    return '<div class="portal-section wsite-card"><h3 class="portal-section-title">' + esc(title) + '</h3>' +
      '<p class="portal-section-desc">' + esc(desc) + '</p>' + evSubTabs();
  }

  /* — Upcoming: list — */
  function renderUpcomingList() {
    var d = draft.d, today = FLO.today();
    var rows = sortUp(d.upcoming).map(function (e) {
      var passed = e.date < today;
      var p = FLO.dateParts(e.date);
      var badges = evTypeBadge(e.typeId) +
        (passed ? '<span class="wsite-badge wsite-badge--accent">Date passed \u2013 not shown</span>' : '') +
        (e.hidden ? '<span class="wsite-badge">Hidden</span>' : '');
      return '<li class="wsite-crow' + (e.hidden || passed ? ' is-hidden' : '') + '" data-id="' + esc(e.id) + '">' +
        '<span class="wsite-datebox"><b>' + p.day + '</b><i>' + p.mon + '</i></span>' +
        '<span class="wsite-crow-main"><span class="wsite-crow-name">' + esc(e.title) + '</span>' +
          '<span class="wsite-crow-type">' + esc(dateLabel(e.date) + (e.time ? ' \u00B7 ' + FLO.fmtTime(e.time) : '') + (e.price ? ' \u00B7 ' + e.price : '')) + '</span>' +
          '<span class="wsite-badges">' + badges + '</span></span>' +
        '<span class="wsite-crow-btns">' +
          '<button type="button" class="wsite-small" data-act="edit">Edit</button>' +
          '<button type="button" class="wsite-small" data-act="dup">Duplicate</button>' +
          '<button type="button" class="wsite-small" data-act="past">Move to past</button>' +
          '<button type="button" class="wsite-small wsite-small--danger" data-act="del">Delete</button>' +
        '</span></li>';
    }).join('');
    panel.innerHTML = cardOpen('Workshops & Events',
        'Events are listed on the public page soonest first. An event disappears from \u201CComing Up\u201D by itself once its date has passed (Maldives time).') +
      '<div class="wsite-subhead-row"><h4 class="wsite-subhead">Upcoming events</h4>' +
        '<button type="button" class="btn-admin-add" id="we-add"' + (d.upcoming.length >= 60 ? ' disabled' : '') + '>+ Add event</button></div>' +
      (rows ? '<ul class="wsite-clist">' + rows + '</ul>'
            : '<p class="admin-empty-note">No upcoming events. The public page will say \u201C' + esc(d.emptyText) + '\u201D.</p>') +
      actions('we') + '</div>';
    wireSubTabs();
    wireEventsCommon();
    panel.querySelector('#we-add').addEventListener('click', function () {
      var e = { id: FLO.newId('e'), typeId: d.types[0].id, date: FLO.today(), time: '', title: 'New event', desc: '',
                duration: '', location: '', spots: '', price: '', buttonLabel: 'Register', buttonLink: '#', hidden: false };
      d.upcoming.push(e); draft.view = 'edit'; draft.editId = e.id; dirty = true;
      renderUpcomingEditor();
    });
    var listEl = panel.querySelector('.wsite-clist');
    if (listEl) listEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var id = btn.closest('[data-id]').getAttribute('data-id');
      var ev = evFind(d.upcoming, id);
      if (!ev) return;
      var act = btn.getAttribute('data-act');
      if (act === 'edit') { draft.view = 'edit'; draft.editId = id; renderUpcomingEditor(); }
      else if (act === 'dup') {
        var copy = FLO.clone(ev); copy.id = FLO.newId('e'); copy.title = (copy.title + ' (copy)').slice(0, 120);
        d.upcoming.push(copy); dirty = true; renderUpcomingList();
      } else if (act === 'past') {
        var post = { id: FLO.newId('p'), typeId: ev.typeId, date: ev.date, title: ev.title, text: ev.desc, images: [], hidden: false };
        d.upcoming = d.upcoming.filter(function (x) { return x.id !== id; });
        d.past.push(post);
        draft.sub = 'past'; draft.view = 'edit'; draft.editId = post.id; dirty = true;
        renderPastEditor();
        setStatus(panel.querySelector('#wp-status'), 'Moved to Past events. Add photos and press Save changes.', 'ok');
      } else if (act === 'del') {
        if (!window.confirm('Delete \u201C' + ev.title + '\u201D? It is removed when you press Save changes.')) return;
        d.upcoming = d.upcoming.filter(function (x) { return x.id !== id; }); dirty = true; renderUpcomingList();
      }
    });
  }

  function wireEventsCommon() {
    var statusEl = panel.querySelector('#we-status');
    var disc = panel.querySelector('#we-discard');
    if (disc) disc.addEventListener('click', function () {
      if (dirty && !window.confirm('Discard your unsaved changes?')) return;
      draft = null; dirty = false; renderEvents();
    });
    var save = panel.querySelector('#we-save');
    if (save) save.addEventListener('click', function (e) { saveEvents(e.currentTarget, statusEl); });
  }

  /* — Upcoming: editor — */
  function renderUpcomingEditor() {
    var d = draft.d, e = evFind(d.upcoming, draft.editId);
    if (!e) { draft.view = 'list'; return renderUpcomingList(); }
    panel.innerHTML =
      '<div class="portal-section wsite-card">' +
        '<p class="wsite-back"><button type="button" class="wsite-link-btn" id="wu-back">\u2190 Back to upcoming events</button></p>' +
        '<h3 class="portal-section-title">Edit event</h3>' +
        '<div class="wsite-grid"><div class="wsite-form">' +
          '<div class="wsite-two">' +
            field('Title', 'As shown on the page.', '<input type="text" class="admin-panel-input" id="wu-title" maxlength="120" value="' + esc(e.title) + '">') +
            field('Type', 'Manage types under Settings.', '<select class="admin-panel-select" id="wu-type">' + typeOptions(e.typeId, false) + '</select>') +
          '</div>' +
          '<div class="wsite-two">' +
            field('Date', 'The weekday is worked out automatically.', '<input type="date" class="admin-panel-input" id="wu-date" value="' + esc(e.date) + '">') +
            field('Start time', 'Optional.', '<input type="time" class="admin-panel-input" id="wu-time" value="' + esc(e.time) + '">') +
          '</div>' +
          field('Description', '', '<textarea class="admin-panel-input" id="wu-desc" rows="4" maxlength="600">' + esc(e.desc) + '</textarea>') +
          '<div class="wsite-two">' +
            field('Duration', 'e.g. 2 hrs, Full day.', '<input type="text" class="admin-panel-input" id="wu-dur" maxlength="40" value="' + esc(e.duration) + '">') +
            field('Location', 'e.g. Studio \u00B7 Mat room.', '<input type="text" class="admin-panel-input" id="wu-loc" maxlength="80" value="' + esc(e.location) + '">') +
          '</div>' +
          '<div class="wsite-two">' +
            field('Availability', 'e.g. 8 spots left, Open. Shown in tangerine.', '<input type="text" class="admin-panel-input" id="wu-spots" maxlength="40" value="' + esc(e.spots) + '">') +
            field('Price', 'e.g. MVR 500, Free.', '<input type="text" class="admin-panel-input" id="wu-price" maxlength="40" value="' + esc(e.price) + '">') +
          '</div>' +
          '<div class="wsite-two">' +
            field('Button text', 'Leave empty to hide the button.', '<input type="text" class="admin-panel-input" id="wu-btn" maxlength="40" value="' + esc(e.buttonLabel) + '">') +
            field('Button link', 'e.g. # or https://\u2026', '<input type="text" class="admin-panel-input" id="wu-link" maxlength="300" value="' + esc(e.buttonLink) + '">') +
          '</div>' +
          '<div class="wsite-checks"><label><input type="checkbox" id="wu-hidden"' + (e.hidden ? ' checked' : '') + '> Hide this event from the public page</label></div>' +
        '</div>' +
        '<div class="wsite-preview-wrap"><p class="wsite-label">Preview</p><div class="wsite-event-preview" id="wu-preview"></div></div></div>' +
        '<div class="wsite-actions">' +
          '<button type="button" class="btn-admin-primary" id="wu-save">Save changes</button>' +
          '<button type="button" class="wsite-link-btn" id="wu-done">Back to upcoming events</button>' +
          '<button type="button" class="wsite-link-btn wsite-link-btn--danger" id="wu-delete">Delete this event</button>' +
          '<span class="wsite-status" id="wu-status" role="status"></span>' +
        '</div></div>';

    var statusEl = panel.querySelector('#wu-status');
    function preview() {
      var box = panel.querySelector('#wu-preview');
      if (!FLO.validDate(e.date)) { box.innerHTML = '<p class="wsite-hint">Choose a date to see the preview.</p>'; return; }
      var pe = FLO.clone(e); pe.buttonLink = '#';
      box.innerHTML = FLO.upcomingItemHTML(pe, evW());
    }
    function touch() { dirty = true; setStatus(statusEl, ''); preview(); }
    function bind(id, key) { panel.querySelector(id).addEventListener('input', function (ev) { e[key] = ev.target.value; touch(); }); }
    bind('#wu-title', 'title'); bind('#wu-date', 'date'); bind('#wu-time', 'time'); bind('#wu-desc', 'desc');
    bind('#wu-dur', 'duration'); bind('#wu-loc', 'location'); bind('#wu-spots', 'spots'); bind('#wu-price', 'price');
    bind('#wu-btn', 'buttonLabel'); bind('#wu-link', 'buttonLink');
    panel.querySelector('#wu-type').addEventListener('change', function (ev) { e.typeId = ev.target.value; touch(); });
    panel.querySelector('#wu-hidden').addEventListener('change', function (ev) { e.hidden = ev.target.checked; touch(); });
    preview();

    function back() { draft.view = 'list'; draft.editId = null; renderUpcomingList(); }
    panel.querySelector('#wu-back').addEventListener('click', back);
    panel.querySelector('#wu-done').addEventListener('click', back);
    panel.querySelector('#wu-delete').addEventListener('click', function () {
      if (!window.confirm('Delete \u201C' + e.title + '\u201D? It is removed when you press Save changes.')) return;
      d.upcoming = d.upcoming.filter(function (x) { return x.id !== e.id; }); dirty = true; back();
    });
    panel.querySelector('#wu-save').addEventListener('click', function (ev) { saveEvents(ev.currentTarget, statusEl); });
  }

  /* — Past events: list — */
  function renderPastList() {
    var d = draft.d;
    var rows = sortPast(d.past).map(function (e) {
      var thumb = e.images.length
        ? '<img class="wsite-crow-thumb wsite-crow-thumb--photo" src="' + esc(FLO.storageUrl(FLO.thumbPath(e.images[0]))) + '" alt="">'
        : '<span class="wsite-crow-thumb wsite-crow-thumb--ph">' + esc((e.title || '?').charAt(0).toUpperCase()) + '</span>';
      return '<li class="wsite-crow' + (e.hidden ? ' is-hidden' : '') + '" data-id="' + esc(e.id) + '">' + thumb +
        '<span class="wsite-crow-main"><span class="wsite-crow-name">' + esc(e.title) + '</span>' +
          '<span class="wsite-crow-type">' + esc(dateLabel(e.date) + ' \u00B7 ' + e.images.length + (e.images.length === 1 ? ' photo' : ' photos')) + '</span>' +
          '<span class="wsite-badges">' + evTypeBadge(e.typeId) + (e.hidden ? '<span class="wsite-badge">Hidden</span>' : '') + '</span></span>' +
        '<span class="wsite-crow-btns">' +
          '<button type="button" class="wsite-small" data-act="edit">Edit</button>' +
          '<button type="button" class="wsite-small" data-act="dup">Duplicate</button>' +
          '<button type="button" class="wsite-small wsite-small--danger" data-act="del">Delete</button>' +
        '</span></li>';
    }).join('');
    panel.innerHTML = cardOpen('Workshops & Events',
        'Past events are shown as posts, most recent first, with their text and photo gallery. Visitors see a \u201CPast Events\u201D tab once at least one is visible.') +
      '<div class="wsite-subhead-row"><h4 class="wsite-subhead">Past events</h4>' +
        '<button type="button" class="btn-admin-add" id="we-addpast"' + (d.past.length >= 60 ? ' disabled' : '') + '>+ Add past event</button></div>' +
      (rows ? '<ul class="wsite-clist">' + rows + '</ul>' : '<p class="admin-empty-note">No past events yet.</p>') +
      actions('we') + '</div>';
    wireSubTabs();
    wireEventsCommon();
    panel.querySelector('#we-addpast').addEventListener('click', function () {
      var p = { id: FLO.newId('p'), typeId: '', date: FLO.today(), title: 'New past event', text: '', images: [], hidden: false };
      d.past.push(p); draft.view = 'edit'; draft.editId = p.id; dirty = true; renderPastEditor();
    });
    var listEl = panel.querySelector('.wsite-clist');
    if (listEl) listEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var id = btn.closest('[data-id]').getAttribute('data-id');
      var ev = evFind(d.past, id);
      if (!ev) return;
      var act = btn.getAttribute('data-act');
      if (act === 'edit') { draft.view = 'edit'; draft.editId = id; renderPastEditor(); }
      else if (act === 'dup') {
        var copy = FLO.clone(ev); copy.id = FLO.newId('p'); copy.title = (copy.title + ' (copy)').slice(0, 120);
        d.past.push(copy); dirty = true; renderPastList();
      } else if (act === 'del') {
        if (!window.confirm('Delete \u201C' + ev.title + '\u201D and its photo list? It is removed when you press Save changes.')) return;
        d.past = d.past.filter(function (x) { return x.id !== id; }); dirty = true; renderPastList();
      }
    });
  }

  /* — Past events: editor — */
  function renderPastEditor() {
    var d = draft.d, e = evFind(d.past, draft.editId);
    if (!e) { draft.view = 'list'; return renderPastList(); }
    var gallery = e.images.map(function (path, i) {
      return '<div class="wsite-gitem" data-gi="' + i + '">' +
        '<img src="' + esc(FLO.storageUrl(FLO.thumbPath(path))) + '" alt="Photo ' + (i + 1) + '">' +
        '<span class="wsite-gbtns">' +
          '<button type="button" class="wsite-gbtn" data-g="left" aria-label="Move photo ' + (i + 1) + ' earlier"' + (i === 0 ? ' disabled' : '') + '>\u25C0</button>' +
          '<button type="button" class="wsite-gbtn" data-g="right" aria-label="Move photo ' + (i + 1) + ' later"' + (i === e.images.length - 1 ? ' disabled' : '') + '>\u25B6</button>' +
          '<button type="button" class="wsite-gbtn wsite-gbtn--del" data-g="del" aria-label="Remove photo ' + (i + 1) + '">\u2715</button>' +
        '</span></div>';
    }).join('');

    panel.innerHTML =
      '<div class="portal-section wsite-card">' +
        '<p class="wsite-back"><button type="button" class="wsite-link-btn" id="wp-back">\u2190 Back to past events</button></p>' +
        '<h3 class="portal-section-title">Edit past event</h3>' +
        '<div class="wsite-grid"><div class="wsite-form">' +
          '<div class="wsite-two">' +
            field('Title', 'As shown on the page.', '<input type="text" class="admin-panel-input" id="wp-title" maxlength="120" value="' + esc(e.title) + '">') +
            field('Type', 'Optional.', '<select class="admin-panel-select" id="wp-type">' + typeOptions(e.typeId, true) + '</select>') +
          '</div>' +
          field('Date', '', '<input type="date" class="admin-panel-input" id="wp-date" value="' + esc(e.date) + '">') +
          field('Text', 'Leave a blank line between paragraphs.', '<textarea class="admin-panel-input" id="wp-text" rows="7" maxlength="4000">' + esc(e.text) + '</textarea>') +
          '<div class="wsite-field"><label class="wsite-label">Photo gallery (' + e.images.length + '/24)</label>' +
            '<p class="wsite-hint">Visitors can click a photo to view it larger. Photos are reduced automatically; you can choose several at once.</p>' +
            (gallery ? '<div class="wsite-gallery" id="wp-gallery">' + gallery + '</div>' : '') +
            '<div class="wsite-row"><label class="btn-admin-add wsite-upload">Add photos' +
              '<input type="file" id="wp-files" accept="image/png,image/jpeg,image/webp" multiple hidden></label>' +
              '<span class="wsite-hint" id="wp-gstatus"></span></div></div>' +
          '<div class="wsite-checks"><label><input type="checkbox" id="wp-hidden"' + (e.hidden ? ' checked' : '') + '> Hide this event from the public page</label></div>' +
        '</div>' +
        '<div class="wsite-preview-wrap"><p class="wsite-label">Preview</p><div class="wsite-past-preview" id="wp-preview"></div></div></div>' +
        '<div class="wsite-actions">' +
          '<button type="button" class="btn-admin-primary" id="wp-save">Save changes</button>' +
          '<button type="button" class="wsite-link-btn" id="wp-done">Back to past events</button>' +
          '<button type="button" class="wsite-link-btn wsite-link-btn--danger" id="wp-delete">Delete this event</button>' +
          '<span class="wsite-status" id="wp-status" role="status"></span>' +
        '</div></div>';

    var statusEl = panel.querySelector('#wp-status');
    function preview() {
      var box = panel.querySelector('#wp-preview');
      if (!FLO.validDate(e.date)) { box.innerHTML = '<p class="wsite-hint">Choose a date to see the preview.</p>'; return; }
      box.innerHTML = FLO.pastEventHTML(e, evW());
    }
    function touch() { dirty = true; setStatus(statusEl, ''); preview(); }
    function bind(id, key) { panel.querySelector(id).addEventListener('input', function (ev) { e[key] = ev.target.value; touch(); }); }
    bind('#wp-title', 'title'); bind('#wp-date', 'date'); bind('#wp-text', 'text');
    panel.querySelector('#wp-type').addEventListener('change', function (ev) { e.typeId = ev.target.value; touch(); });
    panel.querySelector('#wp-hidden').addEventListener('change', function (ev) { e.hidden = ev.target.checked; touch(); });
    preview();

    var gal = panel.querySelector('#wp-gallery');
    if (gal) gal.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-g]');
      if (!b || b.disabled) return;
      var i = parseInt(b.closest('[data-gi]').getAttribute('data-gi'), 10);
      var act = b.getAttribute('data-g');
      if (act === 'del') e.images.splice(i, 1);
      else {
        var j = act === 'left' ? i - 1 : i + 1;
        if (j < 0 || j >= e.images.length) return;
        var t = e.images[i]; e.images[i] = e.images[j]; e.images[j] = t;
      }
      dirty = true; renderPastEditor();
    });

    panel.querySelector('#wp-files').addEventListener('change', async function (ev) {
      var files = Array.prototype.slice.call(ev.target.files || []);
      if (!files.length) return;
      var room = 24 - e.images.length;
      if (room <= 0) { setStatus(statusEl, 'This event already has 24 photos, the maximum.', 'err'); return; }
      var gst = panel.querySelector('#wp-gstatus');
      var added = 0, failed = [];
      for (var k = 0; k < files.length && added < room; k++) {
        gst.textContent = 'Uploading photo ' + (k + 1) + ' of ' + files.length + '\u2026';
        var res = await FLO.uploadImageSet(files[k], 'events');
        if (res.ok) { e.images.push(res.path); added++; } else failed.push(files[k].name + ': ' + res.error);
      }
      if (added) dirty = true;
      var skipped = files.length - added - failed.length;
      renderPastEditor();
      var msg = added + (added === 1 ? ' photo' : ' photos') + ' added.' + (added ? ' Press Save changes to publish.' : '');
      if (skipped > 0) msg += ' ' + skipped + ' skipped (24 photo limit).';
      if (failed.length) msg += ' Failed: ' + failed.join('; ');
      setStatus(panel.querySelector('#wp-status'), msg, failed.length ? 'err' : 'ok');
    });

    function back() { draft.view = 'list'; draft.editId = null; renderPastList(); }
    panel.querySelector('#wp-back').addEventListener('click', back);
    panel.querySelector('#wp-done').addEventListener('click', back);
    panel.querySelector('#wp-delete').addEventListener('click', function () {
      if (!window.confirm('Delete \u201C' + e.title + '\u201D? It is removed when you press Save changes.')) return;
      d.past = d.past.filter(function (x) { return x.id !== e.id; }); dirty = true; back();
    });
    panel.querySelector('#wp-save').addEventListener('click', function (ev) { saveEvents(ev.currentTarget, statusEl); });
  }

  /* — Settings: heading, tabs, banner, event types — */
  var COLOR_LABELS = { teal: 'Teal', purple: 'Purple', gold: 'Gold', tangerine: 'Tangerine', blue: 'Blue', rose: 'Rose', green: 'Green', grey: 'Grey' };

  function renderEventSettings() {
    var d = draft.d, b = d.banner, h = d.header;
    var typeRows = d.types.map(function (t, i) {
      var used = typeUse(t.id);
      return '<div class="wsite-prow wsite-srow" data-ti="' + i + '">' +
        '<input type="text" class="admin-panel-input" data-tf="label" maxlength="30" aria-label="Type ' + (i + 1) + ' name" value="' + esc(t.label) + '">' +
        '<select class="admin-panel-select" data-tf="color" aria-label="Type ' + (i + 1) + ' colour">' +
          FLO.EVENT_COLORS.map(function (c) { return '<option value="' + c + '"' + (c === t.color ? ' selected' : '') + '>' + COLOR_LABELS[c] + '</option>'; }).join('') +
        '</select>' +
        '<span class="workshop-badge badge-c-' + esc(t.color) + '">' + esc(t.label || 'Preview') + '</span>' +
        '<span class="wsite-prow-btns">' +
          (used ? '<span class="wsite-hint wsite-srow-now">Used by ' + used + (used === 1 ? ' event' : ' events') + '</span>'
                : '<button type="button" class="wsite-small wsite-small--danger" data-tact="del">Delete</button>') +
        '</span></div>';
    }).join('');

    panel.innerHTML = cardOpen('Workshops & Events', 'Settings for the whole section: its heading, the tab names, the \u201CComing Up\u201D banner and the event types.') +
      '<h4 class="wsite-subhead">Section heading</h4>' +
      '<div class="wsite-three">' +
        field('Small label', 'Small text above the title.', '<input type="text" class="admin-panel-input" id="wc-label" maxlength="80" value="' + esc(h.label) + '">') +
        field('Title', 'The main heading.', '<input type="text" class="admin-panel-input" id="wc-title" maxlength="120" value="' + esc(h.title) + '">') +
        field('Sub-text', 'Line breaks are kept.', '<textarea class="admin-panel-input" id="wc-sub" rows="2" maxlength="300">' + esc(h.sub) + '</textarea>') +
      '</div>' +
      '<div class="wsite-form"><div class="wsite-three">' +
        field('First tab name', '', '<input type="text" class="admin-panel-input" id="wt-up" maxlength="30" value="' + esc(d.tabLabels.upcoming) + '">') +
        field('Second tab name', 'Shown once there is a visible past event.', '<input type="text" class="admin-panel-input" id="wt-past" maxlength="30" value="' + esc(d.tabLabels.past) + '">') +
        field('Text when there are no upcoming events', '', '<input type="text" class="admin-panel-input" id="wt-empty" maxlength="120" value="' + esc(d.emptyText) + '">') +
      '</div></div>' +

      '<h4 class="wsite-subhead">\u201CComing Up\u201D banner</h4>' +
      '<p class="wsite-hint">The coloured strip under the hero.</p>' +
      '<div class="wsite-checks wsite-radios">' +
        ['auto|Automatic \u2013 announce the next upcoming event (hidden when there is none)', 'custom|Custom text', 'off|Hidden'].map(function (o) {
          var p = o.split('|');
          return '<label><input type="radio" name="wb-mode" value="' + p[0] + '"' + (b.mode === p[0] ? ' checked' : '') + '> ' + esc(p[1]) + '</label>';
        }).join('') +
      '</div>' +
      '<div class="wsite-form"><div class="wsite-three">' +
        field('Badge text', '', '<input type="text" class="admin-panel-input" id="wb-badge" maxlength="30" value="' + esc(b.badge) + '">') +
        field('Custom text', 'Used when \u201CCustom text\u201D is chosen.', '<input type="text" class="admin-panel-input" id="wb-text" maxlength="200" value="' + esc(b.text) + '"' + (b.mode === 'custom' ? '' : ' disabled') + '>') +
        field('Link text', 'Leave empty to hide the link.', '<input type="text" class="admin-panel-input" id="wb-linklabel" maxlength="40" value="' + esc(b.linkLabel) + '">') +
      '</div>' +
      field('Link', 'e.g. #workshops or https://\u2026', '<input type="text" class="admin-panel-input" id="wb-link" maxlength="300" value="' + esc(b.link) + '">') + '</div>' +

      '<div class="wsite-subhead-row"><h4 class="wsite-subhead">Event types (' + d.types.length + ')</h4>' +
        '<button type="button" class="btn-admin-add" id="wt-add"' + (d.types.length >= 12 ? ' disabled' : '') + '>+ Add type</button></div>' +
      '<p class="wsite-hint">Each event has a type, shown as a small coloured badge (for example Workshop or Lunch). A type that is in use cannot be deleted.</p>' +
      typeRows +
      actions('we') + '</div>';

    wireSubTabs();
    wireEventsCommon();
    var statusEl = panel.querySelector('#we-status');
    function touch() { dirty = true; setStatus(statusEl, ''); }
    function bind(id, fn) { panel.querySelector(id).addEventListener('input', function (ev) { fn(ev.target.value); touch(); }); }
    bind('#wc-label', function (v) { h.label = v; }); bind('#wc-title', function (v) { h.title = v; }); bind('#wc-sub', function (v) { h.sub = v; });
    bind('#wt-up', function (v) { d.tabLabels.upcoming = v; }); bind('#wt-past', function (v) { d.tabLabels.past = v; }); bind('#wt-empty', function (v) { d.emptyText = v; });
    bind('#wb-badge', function (v) { b.badge = v; }); bind('#wb-text', function (v) { b.text = v; });
    bind('#wb-linklabel', function (v) { b.linkLabel = v; }); bind('#wb-link', function (v) { b.link = v; });
    panel.querySelectorAll('[name="wb-mode"]').forEach(function (r) {
      r.addEventListener('change', function (ev) {
        b.mode = ev.target.value; dirty = true;
        panel.querySelector('#wb-text').disabled = b.mode !== 'custom';
        setStatus(statusEl, '');
      });
    });
    panel.querySelectorAll('[data-ti]').forEach(function (row) {
      var i = parseInt(row.getAttribute('data-ti'), 10);
      row.addEventListener('input', function (ev) {
        if (ev.target.getAttribute('data-tf') !== 'label') return;
        d.types[i].label = ev.target.value; touch();
        var badge = row.querySelector('.workshop-badge'); badge.textContent = ev.target.value || 'Preview';
      });
      row.addEventListener('change', function (ev) {
        if (ev.target.getAttribute('data-tf') !== 'color') return;
        d.types[i].color = ev.target.value; touch();
        row.querySelector('.workshop-badge').className = 'workshop-badge badge-c-' + ev.target.value;
      });
      row.addEventListener('click', function (ev) {
        var del = ev.target.closest('[data-tact="del"]');
        if (!del) return;
        if (d.types.length <= 1) { setStatus(statusEl, 'At least one event type is needed.', 'err'); return; }
        d.types.splice(i, 1); dirty = true; renderEventSettings();
      });
    });
    panel.querySelector('#wt-add').addEventListener('click', function () {
      d.types.push({ id: FLO.newId('ty'), label: '', color: 'teal' }); dirty = true; renderEventSettings();
      var inputs = panel.querySelectorAll('[data-tf="label"]');
      if (inputs.length) inputs[inputs.length - 1].focus();
    });
  }

  /* — Save (shared by every Events screen) — */
  function evLinkOk(label, link) {
    return !String(label || '').trim() || !String(link || '').trim() || /^(#|https?:\/\/|mailto:|tel:)/i.test(String(link).trim());
  }
  function validateEvents(d) {
    var seen = {};
    for (var i = 0; i < d.types.length; i++) {
      var lab = d.types[i].label.trim();
      if (!lab) return 'Every event type needs a name (type ' + (i + 1) + ').';
      if (seen[lab.toLowerCase()]) return 'Two event types are both called \u201C' + lab + '\u201D.';
      seen[lab.toLowerCase()] = true;
    }
    if (!d.types.length) return 'At least one event type is needed.';
    var ids = {};
    d.types.forEach(function (t) { ids[t.id] = true; });
    for (var u = 0; u < d.upcoming.length; u++) {
      var e = d.upcoming[u];
      if (!e.title.trim()) return 'Every upcoming event needs a title.';
      if (!FLO.validDate(e.date)) return '\u201C' + e.title + '\u201D needs a valid date.';
      if (!ids[e.typeId]) return '\u201C' + e.title + '\u201D needs an event type.';
      if (!evLinkOk(e.buttonLabel, e.buttonLink)) return 'The button link on \u201C' + e.title + '\u201D must start with #, https://, mailto: or tel:.';
    }
    for (var p = 0; p < d.past.length; p++) {
      var q = d.past[p];
      if (!q.title.trim()) return 'Every past event needs a title.';
      if (!FLO.validDate(q.date)) return '\u201C' + q.title + '\u201D needs a valid date.';
    }
    if (d.banner.mode === 'custom' && !d.banner.text.trim()) return 'The banner is set to custom text, but the text is empty.';
    if (!evLinkOk(d.banner.linkLabel, d.banner.link)) return 'The banner link must start with #, https://, mailto: or tel:.';
    if (!d.tabLabels.upcoming.trim() || !d.tabLabels.past.trim()) return 'Both tab names are needed.';
    return null;
  }

  async function saveEvents(btn, statusEl) {
    var d = draft.d;
    var problem = validateEvents(d);
    if (problem) { setStatus(statusEl, problem, 'err'); return; }
    var tr = function (v) { return String(v == null ? '' : v).trim(); };
    var out = {
      header: { label: tr(d.header.label), title: tr(d.header.title), sub: tr(d.header.sub) },
      tabLabels: { upcoming: tr(d.tabLabels.upcoming), past: tr(d.tabLabels.past) },
      emptyText: tr(d.emptyText),
      banner: { mode: d.banner.mode, badge: tr(d.banner.badge), text: tr(d.banner.text), linkLabel: tr(d.banner.linkLabel), link: tr(d.banner.link) || '#' },
      types: d.types.map(function (t) { return { id: t.id, label: tr(t.label), color: t.color }; }),
      upcoming: d.upcoming.map(function (e) {
        return { id: e.id, typeId: e.typeId, date: e.date, time: e.time || '', title: tr(e.title), desc: tr(e.desc),
                 duration: tr(e.duration), location: tr(e.location), spots: tr(e.spots), price: tr(e.price),
                 buttonLabel: tr(e.buttonLabel), buttonLink: tr(e.buttonLink) || '#', hidden: e.hidden };
      }),
      past: d.past.map(function (e) {
        return { id: e.id, typeId: e.typeId, date: e.date, title: tr(e.title), text: tr(e.text), images: e.images.slice(), hidden: e.hidden };
      })
    };
    btn.disabled = true;
    setStatus(statusEl, 'Saving\u2026', 'busy');
    var next = FLO.clone(FLO.website);
    next.events = out;
    var res = await FLO.saveWebsite(next);
    btn.disabled = false;
    if (!res.ok) { setStatus(statusEl, res.error, 'err'); return; }
    var sub = draft.sub, view = draft.view, editId = draft.editId;
    dirty = false;
    draft = null;
    ensureEventsDraft();
    draft.sub = sub; draft.view = view; draft.editId = editId;
    renderEvents();
    setStatus(panel.querySelector('.wsite-status'), 'Saved. The public page is updated.', 'ok');
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
