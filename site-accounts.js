/* =========================================================
   FLO Studio — site-accounts.js
   Accounts for the three kinds of people who use the site.

   - Clients and instructors register themselves. Every new
     account starts as "pending"; only an administrator can
     approve it, and an administrator can remove access again
     at any time (database rules in flo_stage1_accounts.sql).
   - A pending client may sign in and look around, but cannot
     join classes, programs or events. A pending instructor
     cannot sign in at all until approved.
   - The administrator's "Accounts" page lists registrations
     and records those decisions.

   What a person is allowed to do is decided by the database,
   not by this file: this file only shows the right screens.
   ========================================================= */
(function () {
  'use strict';

  var FLO = (window.FLO = window.FLO || {});
  var esc = function (v) { return FLO.esc(v); };
  function $(id) { return document.getElementById(id); }

  var MIN_PASSWORD = 8;
  var POLL_MS = 45000;
  var COLUMNS = 'id,email,full_name,phone,role,status,created_at,decided_at,decided_by';

  FLO.account = null;   // the signed-in client or instructor profile

  /* ── Messages ───────────────────────────────────────── */
  function roleName(role) { return role === 'instructor' ? 'an instructor' : 'a client'; }

  var BLOCKED = {
    rejected: 'This registration was not approved. Please contact the studio.',
    revoked: 'Access to this account has been removed. Please contact the studio.'
  };

  /* ── Registration ───────────────────────────────────── */
  FLO.accountRegister = async function (f) {
    if (!FLO.sb) return { ok: false, message: 'The sign-up service could not be loaded. Check your connection and reload the page.' };

    var name = String(f.name || '').trim();
    var phone = String(f.phone || '').trim();
    var email = String(f.email || '').trim();
    var password = String(f.password || '');
    var role = f.role === 'instructor' ? 'instructor' : 'client';

    if (name.length < 2) return { ok: false, message: 'Please enter your full name.' };
    if (phone.replace(/\D/g, '').length < 7) return { ok: false, message: 'Please enter a phone number the studio can reach you on.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'Please enter a valid email address.' };
    if (password.length < MIN_PASSWORD) return { ok: false, message: 'Please choose a password of at least ' + MIN_PASSWORD + ' characters.' };

    var res;
    try {
      res = await FLO.sb.auth.signUp({
        email: email,
        password: password,
        options: { data: { full_name: name, phone: phone, requested_role: role } }
      });
    } catch (err) {
      return { ok: false, message: 'Could not reach the server. Please try again.' };
    }

    var exists = { ok: false, message: 'An account with this email address already exists. Try signing in.' };
    if (res.error) {
      var msg = String(res.error.message || '');
      if (/already (registered|exists)/i.test(msg)) return exists;
      if (res.error.status === 429 || /rate limit|too many/i.test(msg)) {
        return { ok: false, message: 'Too many attempts. Please wait a few minutes and try again.' };
      }
      if (/password/i.test(msg)) return { ok: false, message: msg };
      return { ok: false, message: 'Could not create the account. Please try again.' };
    }
    var user = res.data && res.data.user;
    // For an address that is already registered, Supabase answers without an
    // error but with no identities.
    if (user && Array.isArray(user.identities) && user.identities.length === 0) return exists;

    var signedIn = !!(res.data && res.data.session);
    if (signedIn) { try { await FLO.sb.auth.signOut(); } catch (e) { /* ignore */ } }
    return { ok: true, role: role, needsEmailConfirm: !signedIn };
  };

  /* ── Sign-in for clients and instructors ────────────── */
  FLO.accountLogin = async function (email, password, tab) {
    if (!FLO.sb) return { ok: false, message: 'The sign-in service could not be loaded. Check your connection and reload the page.' };

    var res;
    try {
      res = await FLO.sb.auth.signInWithPassword({ email: email, password: password });
    } catch (err) {
      return { ok: false, message: 'Could not reach the server. Please try again.' };
    }
    if (res.error) {
      var msg = String(res.error.message || '');
      if (/email not confirmed/i.test(msg)) {
        return { ok: false, message: 'Please confirm your email address using the link we sent you, then sign in.' };
      }
      if (res.error.status === 400 || /invalid login credentials/i.test(msg)) {
        return { ok: false, message: 'Incorrect email or password.' };
      }
      return { ok: false, message: 'Could not reach the server. Please try again.' };
    }

    var p;
    try {
      p = await FLO.sb.from('profiles').select(COLUMNS).eq('id', res.data.user.id).maybeSingle();
    } catch (err) {
      p = { error: err };
    }
    function deny(message) { return FLO.signOut().then(function () { return { ok: false, message: message }; }); }

    if (p.error) return deny('Could not load your account. Please try again.');
    if (!p.data) return deny('No FLO account was found for this email address. Please create an account first.');

    var prof = p.data;
    if (tab && tab !== prof.role) {
      return deny('This account is registered as ' + roleName(prof.role) + '. Please use the ' +
        (prof.role === 'instructor' ? 'Instructor' : 'Client') + ' tab.');
    }
    if (BLOCKED[prof.status]) return deny(BLOCKED[prof.status]);
    if (prof.role === 'instructor' && prof.status !== 'approved') {
      return deny('Your registration is waiting for the studio’s approval. You will be able to sign in as an instructor once it is approved.');
    }

    FLO.account = prof;
    return { ok: true, role: prof.role, profile: prof };
  };

  /* ── After sign-in: names, notices, approval gate ───── */
  function toast(message) {
    var t = $('accountToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'accountToast';
      t.className = 'account-toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { t.classList.remove('is-visible'); }, 5000);
  }

  function portalFor(role) { return $(role === 'instructor' ? 'instructorPortal' : 'clientPortal'); }

  function addBanner(portal, id, text, extraClass) {
    if (!portal || $(id)) return;
    var el = document.createElement('div');
    el.id = id;
    el.className = 'account-banner' + (extraClass ? ' ' + extraClass : '');
    el.textContent = text;
    var body = portal.querySelector('.portal-body');
    portal.insertBefore(el, body);
  }

  function applyAccountState() {
    var a = FLO.account;
    if (!a) return;
    var portal = portalFor(a.role);
    var pending = a.role === 'client' && a.status !== 'approved';
    document.body.classList.toggle('account-pending', pending);

    var banner = $('accountPendingBanner');
    if (pending) {
      addBanner(portal, 'accountPendingBanner',
        'Your account is waiting for the studio’s approval. You can look around, but joining classes, programs and events becomes available once you are approved.',
        'account-banner--pending');
    } else if (banner) {
      banner.remove();
      toast('Your account has been approved. You can now join classes and events.');
    }
  }

  function greeting() {
    // Time of day in the Maldives, whatever the visitor's own timezone.
    var hour = 12;
    try {
      hour = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Indian/Maldives', hour: '2-digit', hour12: false }).format(new Date()), 10);
    } catch (e) { /* keep the default */ }
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  }

  // A real account starts with nothing of its own. The sample client's
  // classes, children and figures are hidden until someone asks to preview
  // them (so the studio can still try out the screens).
  function sampleBanner(portal, on) {
    var el = $('accountSampleBanner');
    if (!el) {
      addBanner(portal, 'accountSampleBanner', '', 'account-banner--sample');
      el = $('accountSampleBanner');
      if (!el) return;
    }
    el.innerHTML = '';
    var text = document.createElement('span');
    text.textContent = on
      ? 'You are previewing example information (a sample client). It is not your own data.'
      : 'This is a new account, so there is nothing here yet. Your classes and children will appear here once they are recorded for you.';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'account-banner-btn';
    btn.textContent = on ? 'Hide example information' : 'Preview example information';
    btn.addEventListener('click', function () {
      portal.classList.toggle('sample-on', !on);
      sampleBanner(portal, !on);
    });
    el.appendChild(text);
    el.appendChild(btn);
  }

  FLO.afterLogin = function (role) {
    if (role === 'admin') {
      FLO.account = null;
      if (FLO.adminAccounts) FLO.adminAccounts.start();
      return;
    }
    var a = FLO.account;
    if (!a) return;
    var portal = portalFor(a.role);
    var shown = a.full_name || a.email;
    var first = (a.full_name || '').trim().split(/\s+/)[0] || shown;

    var nameEl = a.role === 'instructor' ? $('instructorNavName') : portal && portal.querySelector('.portal-nav-user');
    if (nameEl) nameEl.textContent = shown;

    if (a.role === 'client') {
      var hi = $('clientGreeting'); if (hi) hi.textContent = greeting() + ', ' + first + '.';
      var map = { settingsName: a.full_name, settingsEmail: a.email, settingsPhone: a.phone };
      Object.keys(map).forEach(function (id) { var f = $(id); if (f) f.value = map[id] || ''; });
      // Children shown or counted for this account start empty.
      if (typeof children !== 'undefined' && Array.isArray(children)) children.length = 0;
    } else {
      var ig = $('instructorGreeting'); if (ig) ig.textContent = greeting() + ', ' + first + '.';
      var iw = $('instructorWelcome'); if (iw) iw.textContent = 'Welcome, ' + first + '.';
    }

    portal.classList.add('real-account');
    portal.classList.remove('sample-on');
    sampleBanner(portal, false);
    applyAccountState();
    startWatching();
  };

  // A pending client may look but not act: stop the buttons that start an
  // enrolment or a payment. (The database refuses these too, in a later stage.)
  document.addEventListener('click', function (e) {
    var a = FLO.account;
    if (!a || a.role !== 'client' || a.status === 'approved') return;
    var hit = e.target.closest && e.target.closest('#btnEnrol, #btnKidsConfirm, #btnPayNow, .child-enrol-link');
    if (!hit) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    toast('Your account is waiting for the studio’s approval. You can join classes once it is approved.');
  }, true);

  /* ── Notice changes made by the administrator ───────── */
  var watching = false;
  async function refreshAccount() {
    if (!FLO.account || !FLO.sb) return;
    var p;
    try { p = await FLO.sb.from('profiles').select(COLUMNS).eq('id', FLO.account.id).maybeSingle(); }
    catch (e) { return; }
    if (p.error || !p.data) return;

    var before = FLO.account.status;
    FLO.account = p.data;
    var removed = BLOCKED[p.data.status] || (p.data.role === 'instructor' && p.data.status !== 'approved');
    if (removed) {
      await FLO.signOut();
      window.alert('Your access to the FLO portal has been changed by the studio. You have been signed out.');
      window.location.reload();
      return;
    }
    if (before !== p.data.status) applyAccountState();
  }

  function startWatching() {
    if (watching) return;
    watching = true;
    setInterval(refreshAccount, POLL_MS);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) refreshAccount(); });
  }

  /* ── Login window: sign in / create account ─────────── */
  function showRegister(on) {
    var reg = $('registerPanel'), login = $('loginPanel');
    if (!reg || !login) return;
    reg.hidden = !on;
    login.hidden = on;
    $('loginTagline').textContent = on ? 'Create your account.' : 'Welcome back.';
    $('registerHint').textContent = '';
    $('registerHint').classList.remove('login-hint--ok');
    $('loginHint').textContent = '';
  }

  function wireLoginWindow() {
    if (!$('registerPanel')) return;
    $('showRegister').addEventListener('click', function () { showRegister(true); });
    $('showLogin').addEventListener('click', function () { showRegister(false); });
    $('modalClose').addEventListener('click', function () { showRegister(false); });

    function enter(ids, buttonId) {
      ids.forEach(function (id) {
        $(id).addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); $(buttonId).click(); }
        });
      });
    }
    enter(['loginEmail', 'loginPassword'], 'loginSubmit');
    enter(['regName', 'regPhone', 'regEmail', 'regPassword'], 'registerSubmit');

    $('registerSubmit').addEventListener('click', async function () {
      var hint = $('registerHint');
      var btn = $('registerSubmit');
      hint.classList.remove('login-hint--ok');
      hint.textContent = 'Creating your account…';
      btn.disabled = true;
      var picked = document.querySelector('input[name="regRole"]:checked');
      var res = await FLO.accountRegister({
        name: $('regName').value, phone: $('regPhone').value, email: $('regEmail').value,
        password: $('regPassword').value, role: picked ? picked.value : 'client'
      });
      btn.disabled = false;
      if (!res.ok) { hint.textContent = res.message; return; }

      $('regPassword').value = '';
      hint.classList.add('login-hint--ok');
      var next = res.role === 'instructor'
        ? 'Your registration has been received. You will be able to sign in as an instructor once the studio approves it.'
        : 'Your account has been created. You can sign in now; joining classes and events becomes available once the studio approves your account.';
      hint.textContent = res.needsEmailConfirm
        ? 'Almost done. We have emailed you a link: please confirm your address, then sign in. ' + next
        : next;
    });
  }

  /* ── Administrator: the Accounts page ───────────────── */
  var A = {
    root: null, rows: [], filter: 'pending', query: '', loaded: false, timer: null
  };

  var FILTERS = [
    { key: 'pending',     label: 'Pending',      test: function (r) { return r.status === 'pending'; } },
    { key: 'clients',     label: 'Clients',      test: function (r) { return r.status === 'approved' && r.role === 'client'; } },
    { key: 'instructors', label: 'Instructors',  test: function (r) { return r.status === 'approved' && r.role === 'instructor'; } },
    { key: 'removed',     label: 'Removed',      test: function (r) { return r.status === 'revoked' || r.status === 'rejected'; } },
    { key: 'all',         label: 'All',          test: function () { return true; } }
  ];
  var STATUS_LABEL = { pending: 'Pending', approved: 'Approved', revoked: 'Access removed', rejected: 'Rejected' };

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Indian/Maldives' });
    } catch (e) { return ''; }
  }

  function setBadge(count) {
    var b = $('accountsBadge');
    if (!b) return;
    b.textContent = String(count);
    b.hidden = !count;
  }

  async function refreshBadge() {
    if (!FLO.sb) return;
    try {
      var res = await FLO.sb.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending');
      if (!res.error && typeof res.count === 'number') setBadge(res.count);
    } catch (e) { /* ignore */ }
  }

  async function loadRows() {
    var res;
    try { res = await FLO.sb.from('profiles').select(COLUMNS).order('created_at', { ascending: false }); }
    catch (err) { res = { error: err }; }
    if (res.error) return { ok: false, error: String(res.error.message || res.error) };
    A.rows = res.data || [];
    A.loaded = true;
    setBadge(A.rows.filter(FILTERS[0].test).length);
    return { ok: true };
  }

  function buildShell() {
    A.root.innerHTML =
      '<div class="portal-view-header">' +
        '<h2>Accounts</h2>' +
        '<p class="portal-view-sub">People who have registered on the site. Approve a registration to give that person access, and remove access at any time.</p>' +
      '</div>' +
      '<div class="admin-section-toolbar">' +
        '<div class="admin-audience-tabs wsite-tabs" id="accTabs"></div>' +
        '<div class="admin-toolbar-right">' +
          '<input type="search" class="admin-panel-input acc-search" id="accSearch" placeholder="Search name, email or phone" aria-label="Search accounts">' +
          '<button type="button" class="wsite-small" id="accRefresh">Refresh</button>' +
        '</div>' +
      '</div>' +
      '<p class="wsite-status" id="accStatus" role="status"></p>' +
      '<div id="accList"></div>';

    A.root.querySelector('#accTabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-accf]');
      if (!b) return;
      A.filter = b.getAttribute('data-accf');
      render();
    });
    A.root.querySelector('#accSearch').addEventListener('input', function (e) { A.query = e.target.value; renderList(); });
    A.root.querySelector('#accRefresh').addEventListener('click', function () { reload(); });
    A.root.querySelector('#accList').addEventListener('click', onAction);
  }

  function status(msg, kind) {
    var el = A.root && A.root.querySelector('#accStatus');
    if (!el) return;
    el.textContent = msg || '';
    el.className = 'wsite-status' + (kind ? ' wsite-status--' + kind : '');
  }

  function render() {
    var tabs = A.root.querySelector('#accTabs');
    tabs.innerHTML = FILTERS.map(function (f) {
      var n = A.rows.filter(f.test).length;
      return '<button type="button" class="admin-audience-tab' + (f.key === A.filter ? ' active' : '') + '" data-accf="' + f.key + '">' +
        esc(f.label) + ' (' + n + ')</button>';
    }).join('');
    renderList();
  }

  function matches(r) {
    var q = A.query.trim().toLowerCase();
    if (!q) return true;
    return [r.full_name, r.email, r.phone].join(' ').toLowerCase().indexOf(q) !== -1;
  }

  function rowHTML(r) {
    var initial = (r.full_name || r.email || '?').trim().charAt(0).toUpperCase();
    var actions = '';
    if (r.status === 'pending') {
      actions =
        '<select class="admin-panel-select acc-role" data-accrole aria-label="Role for ' + esc(r.full_name || r.email) + '">' +
          '<option value="client"' + (r.role === 'client' ? ' selected' : '') + '>Client</option>' +
          '<option value="instructor"' + (r.role === 'instructor' ? ' selected' : '') + '>Instructor</option>' +
        '</select>' +
        '<button type="button" class="btn-admin-primary acc-btn" data-aact="approve">Approve</button>' +
        '<button type="button" class="wsite-small wsite-small--danger" data-aact="reject">Reject</button>';
    } else if (r.status === 'approved') {
      actions = '<button type="button" class="wsite-small wsite-small--danger" data-aact="revoke">Remove access</button>';
    } else {
      actions = '<button type="button" class="wsite-small" data-aact="reinstate">Reinstate</button>';
    }
    var decided = r.decided_at && r.status !== 'pending'
      ? '<span class="wsite-crow-type">' + esc(STATUS_LABEL[r.status]) + ' ' + esc(fmtDate(r.decided_at)) + (r.decided_by ? ' by ' + esc(r.decided_by) : '') + '</span>'
      : '';
    return '<li class="wsite-crow' + (r.status === 'revoked' || r.status === 'rejected' ? ' is-hidden' : '') + '" data-id="' + esc(r.id) + '">' +
      '<span class="wsite-crow-thumb wsite-crow-thumb--ph" aria-hidden="true">' + esc(initial) + '</span>' +
      '<span class="wsite-crow-main">' +
        '<span class="wsite-crow-name">' + esc(r.full_name || '(no name)') + '</span>' +
        '<span class="wsite-crow-type">' + esc(r.email) + (r.phone ? ' · ' + esc(r.phone) : '') + '</span>' +
        '<span class="wsite-badges">' +
          '<span class="wsite-badge">' + (r.role === 'instructor' ? 'Instructor' : 'Client') + '</span>' +
          '<span class="wsite-badge' + (r.status === 'pending' ? ' wsite-badge--accent' : '') + '">' + esc(STATUS_LABEL[r.status] || r.status) + '</span>' +
          '<span class="wsite-badge">Registered ' + esc(fmtDate(r.created_at)) + '</span>' +
        '</span>' +
        decided +
      '</span>' +
      '<span class="wsite-crow-btns">' + actions + '</span>' +
    '</li>';
  }

  function renderList() {
    var f = FILTERS.filter(function (x) { return x.key === A.filter; })[0] || FILTERS[0];
    var rows = A.rows.filter(f.test).filter(matches);
    var box = A.root.querySelector('#accList');
    if (!rows.length) {
      var none = A.query.trim() ? 'No accounts match your search.'
        : f.key === 'pending' ? 'No registrations are waiting for approval.'
        : 'Nothing to show here.';
      box.innerHTML = '<p class="admin-empty-note">' + esc(none) + '</p>';
      return;
    }
    box.innerHTML = '<ul class="wsite-clist">' + rows.map(rowHTML).join('') + '</ul>';
  }

  var ACTIONS = {
    approve:   { to: 'approved', done: 'Approved.' },
    reject:    { to: 'rejected', done: 'Rejected.',          ask: function (n) { return 'Reject the registration of ' + n + '?'; } },
    revoke:    { to: 'revoked',  done: 'Access removed.',    ask: function (n) { return 'Remove access for ' + n + '? They will be signed out of the portal and can no longer join classes or events.'; } },
    reinstate: { to: 'approved', done: 'Access restored.' }
  };

  async function onAction(e) {
    var btn = e.target.closest('[data-aact]');
    if (!btn || btn.disabled) return;
    var li = btn.closest('[data-id]');
    var id = li && li.getAttribute('data-id');
    var row = A.rows.filter(function (r) { return r.id === id; })[0];
    var def = ACTIONS[btn.getAttribute('data-aact')];
    if (!row || !def) return;

    var name = row.full_name || row.email;
    if (def.ask && !window.confirm(def.ask(name))) return;

    var roleSel = li.querySelector('[data-accrole]');
    var role = roleSel ? roleSel.value : null;

    btn.disabled = true;
    status('Saving…', 'busy');
    var res;
    try { res = await FLO.sb.rpc('admin_set_profile_status', { p_id: id, p_status: def.to, p_role: role }); }
    catch (err) { res = { error: err }; }
    if (res.error) {
      btn.disabled = false;
      status('Could not save: ' + String(res.error.message || res.error), 'err');
      return;
    }
    var again = await loadRows();
    if (!again.ok) { status('Saved, but the list could not be refreshed: ' + again.error, 'err'); return; }
    render();
    status(name + ': ' + def.done, 'ok');
  }

  async function reload() {
    status('Loading…', 'busy');
    var res = await loadRows();
    if (!res.ok) {
      A.root.querySelector('#accList').innerHTML = '';
      status('Could not load accounts: ' + res.error, 'err');
      return;
    }
    status('');
    render();
  }

  function openAccounts() {
    if (!A.root) return;
    if (!A.root.querySelector('#accList')) buildShell();
    reload();
  }

  FLO.adminAccounts = {
    open: openAccounts,
    refreshBadge: refreshBadge,
    start: function () {
      refreshBadge();
      if (!A.timer) A.timer = setInterval(refreshBadge, 60000);
    }
  };

  function init() {
    A.root = $('aview-accounts');
    var link = document.querySelector('.admin-sidebar-link[data-aview="accounts"]');
    if (A.root && link) link.addEventListener('click', openAccounts);
    wireLoginWindow();
  }
  init();
})();
