/* =========================================================
   FLO Studio - studio data (rooms, tracks, instructors, classes,
   class times), stored in Supabase.

   How it fits together
   - data.js still defines the in-memory arrays (rooms, tracks,
     instructors, classes, classSlots, programs, programSlots) that the
     portals use. This
     file replaces their contents with the real rows from Supabase
     and keeps them in step when the administrator makes changes.
   - Public read: anyone may read the public columns. The result is
     cached in the browser so the page renders at once on a repeat visit.
   - Admin write: after an administrator signs in, the full data
     (including private instructor details) is loaded and every change
     is saved automatically a moment after it is made.
   - If Supabase cannot be reached, nothing is replaced and the page
     keeps working on the built-in sample data.

   Depends on: site-config.js (FLO.sb, FLO.esc). Loaded before
   site-content.js so the website can draw its class cards from here.
   ========================================================= */
(function () {
  'use strict';

  var FLO = (window.FLO = window.FLO || {});
  var CACHE_KEY = 'flo_studio_cache_v1';
  var SAVE_DELAY = 900;

  var S = (FLO.studio = {
    live: false,        // real rows (or a cached copy of them) are in the arrays
    progLive: false,    // the same, for programs (needs flo_stage3_programs.sql)
    canWrite: false,    // administrator data loaded; changes are saved
    error: ''           // last load or save problem, in words
  });

  /* ── Constants and helpers ──────────────────────────── */
  var WEEK_WEB = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];   // client-facing order
  var DAYS_ALL = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  var ID_RE = /^[a-z0-9][a-z0-9-]{0,59}$/;

  function esc(v) { return FLO.esc ? FLO.esc(v) : String(v == null ? '' : v); }

  // The arrays defined (as const) in data.js. Read lazily so a missing
  // data.js is a clear failure rather than a crash at load time.
  function D() {
    return {
      rooms: rooms, tracks: tracks, instructors: instructors,
      classes: classes, classSlots: classSlots,
      programs: typeof programs !== 'undefined' ? programs : [],
      programSlots: typeof programSlots !== 'undefined' ? programSlots : []
    };
  }
  function replaceAll(arr, items) {
    arr.length = 0;
    for (var i = 0; i < items.length; i++) arr.push(items[i]);
  }
  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function fmt12(t) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(t || '');
    if (!m) return t || '';
    var h = parseInt(m[1], 10);
    var ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + m[2] + ' ' + ap;
  }
  function mins(t) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(t || '');
    return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 0;
  }
  // The screens write these values into the page as HTML. The database refuses
  // the characters < > " in text fields; they are also removed here, so that
  // nothing read from the database can ever be mistaken for markup.
  function clean(v) { return String(v == null ? '' : v).replace(/[<>"]/g, ''); }
  var BAD_CHARS = /[<>"]/;
  function emit() {
    try { document.dispatchEvent(new CustomEvent('flo:studio')); } catch (e) { /* old browsers */ }
  }
  function saySlug(text, fallback) {
    var s = String(text || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return s || fallback;
  }
  S.slug = saySlug;
  S.fmt12 = fmt12;

  /* ── Rows <-> in-memory shapes ──────────────────────── */
  function okId(r) { return ID_RE.test(String(r && r.id || '')); }

  function toMemory(R, priv) {
    var roomName = {};
    R.rooms = R.rooms.filter(okId);
    R.tracks = R.tracks.filter(okId);
    R.instructors = R.instructors.filter(okId);
    R.classes = R.classes.filter(okId);
    R.class_slots = R.class_slots.filter(okId);
    R.rooms.forEach(function (r) { roomName[r.id] = clean(r.name); });
    var privBy = {};
    (priv || []).forEach(function (p) { privBy[p.instructor_id] = p; });

    var out = {
      rooms: R.rooms.map(function (r) { return { id: r.id, name: clean(r.name) }; }),
      tracks: R.tracks.map(function (t) {
        return { id: t.id, name: clean(t.name), label: clean(t.label),
                 days: (t.days || []).filter(function (d) { return DAYS_ALL.indexOf(d) > -1; }) };
      }),
      instructors: R.instructors.map(function (i) {
        var p = privBy[i.id] || {};
        return {
          id: i.id, name: clean(i.name), nickname: clean(i.nickname || i.name), bio: clean(i.bio),
          status: ['active', 'on-leave', 'inactive'].indexOf(i.status) > -1 ? i.status : 'active',
          phone: clean(p.phone), dob: clean(p.dob),
          qualifications: clean(p.qualifications), experience: clean(p.experience)
        };
      }),
      classes: R.classes.map(function (c) {
        return {
          id: c.id, name: clean(c.name), audience: c.audience === 'kids' ? 'kids' : 'adult', type: clean(c.type),
          colorKey: ['teal', 'tangerine', 'pink', 'lavender', 'skyblue'].indexOf(c.color_key) > -1 ? c.color_key : 'teal',
          fixed: c.fixed === true, durationMin: c.duration_min, maxSize: c.max_size == null ? null : c.max_size,
          priceMvr: c.price_mvr == null ? null : c.price_mvr,
          room: c.room_id && roomName[c.room_id] ? roomName[c.room_id] : '',
          active: c.active !== false, showOnWebsite: c.show_on_website !== false
        };
      }),
      classSlots: R.class_slots.filter(function (s) {
        return DAYS_ALL.indexOf(s.day) > -1 && /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(s.time || '');
      }).map(function (s) {
        return {
          id: s.id, classId: s.class_id, day: s.day, time: s.time,
          instructorId: s.instructor_id || '', assistingInstructorId: s.assisting_instructor_id || undefined,
          dayOptionGroup: s.day_option_group ? clean(s.day_option_group) : undefined,
          active: s.active !== false, full: s.is_full === true
        };
      })
    };
    // Programs are optional: absent until flo_stage3_programs.sql has been run.
    if (R.programs && R.program_slots) {
      var classOk = {};
      out.classes.forEach(function (c) { classOk[c.id] = true; });
      var progs = R.programs.filter(okId);
      var progOk = {};
      progs.forEach(function (p) { progOk[p.id] = true; });
      out.programs = progs.map(function (p) {
        return {
          id: p.id, name: clean(p.name), description: clean(p.description),
          priceRf: p.price_mvr == null ? 0 : p.price_mvr,
          billingPeriod: ['month', 'term', 'year'].indexOf(p.billing_period) > -1 ? p.billing_period : 'month',
          classIds: (p.class_ids || []).filter(function (id) { return classOk[id]; }),
          active: p.active !== false, showOnWebsite: p.show_on_website !== false
        };
      });
      out.programSlots = R.program_slots.filter(function (s) {
        return okId(s) && progOk[s.program_id] && classOk[s.class_id] && DAYS_ALL.indexOf(s.day) > -1 &&
          /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(s.time || '');
      }).map(function (s) {
        var m = {
          id: s.id, programId: s.program_id, classId: s.class_id, day: s.day, time: s.time,
          instructorId: s.instructor_id || '', assistingInstructorId: s.assisting_instructor_id || undefined,
          active: s.active !== false, full: s.is_full === true
        };
        if (s.day_option_group) m.trackLabel = clean(s.day_option_group);
        return m;
      });
    }
    return out;
  }

  function applyMemory(m) {
    var d = D();
    replaceAll(d.rooms, m.rooms);
    replaceAll(d.tracks, m.tracks);
    replaceAll(d.instructors, m.instructors);
    replaceAll(d.classes, m.classes);
    replaceAll(d.classSlots, m.classSlots);
    if (m.programs && m.programSlots) {
      replaceAll(d.programs, m.programs);
      replaceAll(d.programSlots, m.programSlots);
      S.progLive = true;
    }
  }

  // Current in-memory arrays as database rows, plus any problems found.
  function buildRows() {
    var d = D();
    var problems = [];
    var roomId = {};
    d.rooms.forEach(function (r) { roomId[r.name] = r.id; });
    var instrIds = {};
    d.instructors.forEach(function (i) { instrIds[i.id] = true; });
    var classIds = {};
    d.classes.forEach(function (c) { classIds[c.id] = true; });

    function checkId(kind, id) {
      if (!ID_RE.test(String(id || ''))) problems.push(kind + ' "' + id + '" has an identifier that cannot be saved.');
    }
    function toInt(v, fallback) {
      var n = parseInt(v, 10);
      return isNaN(n) ? fallback : n;
    }

    function checkText(kind, who, pairs) {
      pairs.forEach(function (p) {
        if (BAD_CHARS.test(String(p[1] == null ? '' : p[1]))) {
          problems.push(kind + ' \u201C' + clean(who) + '\u201D: ' + p[0] + ' may not contain the characters < > or ".');
        }
      });
    }

    var rows = { rooms: [], tracks: [], instructors: [], instructor_private: [], classes: [], class_slots: [], programs: [], program_slots: [] };

    d.rooms.forEach(function (r) {
      checkId('Room', r.id);
      checkText('Room', r.name, [['the name', r.name]]);
      rows.rooms.push({ id: r.id, name: String(r.name || '').trim() });
    });
    d.tracks.forEach(function (t) {
      checkId('Track', t.id);
      checkText('Track', t.name, [['the name', t.name], ['the label', t.label]]);
      rows.tracks.push({ id: t.id, name: String(t.name || '').trim(), label: String(t.label || '').trim(), days: (t.days || []).slice() });
    });
    d.instructors.forEach(function (i) {
      checkId('Instructor', i.id);
      checkText('Instructor', i.name, [['the name', i.name], ['the nickname', i.nickname], ['the bio', i.bio], ['the phone', i.phone],
        ['the date of birth', i.dob], ['the qualifications', i.qualifications], ['the experience', i.experience]]);
      rows.instructors.push({
        id: i.id, name: String(i.name || '').trim(), nickname: String(i.nickname || i.name || '').trim(),
        bio: String(i.bio || ''), status: i.status || 'active'
      });
      rows.instructor_private.push({
        instructor_id: i.id, phone: String(i.phone || ''), dob: String(i.dob || ''),
        qualifications: String(i.qualifications || ''),
        experience: String(i.experience || '')
      });
    });
    d.classes.forEach(function (c) {
      checkId('Class', c.id);
      checkText('Class', c.name, [['the name', c.name], ['the type', c.type]]);
      var price = (c.priceMvr === null || c.priceMvr === undefined || c.priceMvr === '') ? null : toInt(c.priceMvr, null);
      rows.classes.push({
        id: c.id, name: String(c.name || '').trim(), audience: c.audience === 'kids' ? 'kids' : 'adult',
        type: String(c.type || ''), color_key: c.colorKey || 'teal', fixed: c.fixed === true,
        duration_min: toInt(c.durationMin, 50), max_size: c.maxSize ? toInt(c.maxSize, null) : null,
        price_mvr: price, room_id: roomId[c.room] || null, active: c.active !== false,
        show_on_website: c.showOnWebsite !== false
      });
    });
    d.classSlots.forEach(function (s) {
      if (!classIds[s.classId]) return;           // its class was removed; the database drops these too
      checkId('Class time', s.id);
      rows.class_slots.push({
        id: s.id, class_id: s.classId, day: s.day, time: s.time,
        instructor_id: s.instructorId && instrIds[s.instructorId] ? s.instructorId : null,
        assisting_instructor_id: s.assistingInstructorId && instrIds[s.assistingInstructorId] ? s.assistingInstructorId : null,
        day_option_group: s.dayOptionGroup || null, active: s.active !== false, is_full: s.full === true
      });
    });
    if (S.progLive) {
      var progIds = {};
      d.programs.forEach(function (p) {
        progIds[p.id] = true;
        checkId('Program', p.id);
        checkText('Program', p.name, [['the name', p.name], ['the description', p.description]]);
        rows.programs.push({
          id: p.id, name: String(p.name || '').trim(), description: String(p.description || ''),
          price_mvr: Math.max(0, toInt(p.priceRf, 0)),
          billing_period: ['month', 'term', 'year'].indexOf(p.billingPeriod) > -1 ? p.billingPeriod : 'month',
          class_ids: (p.classIds || []).filter(function (id) { return classIds[id]; }),
          active: p.active !== false, show_on_website: p.showOnWebsite !== false
        });
      });
      d.programSlots.forEach(function (s) {
        if (!progIds[s.programId] || !classIds[s.classId]) return;   // its program or class was removed
        checkId('Program session', s.id);
        checkText('Program session', s.id, [['the track', s.trackLabel]]);
        rows.program_slots.push({
          id: s.id, program_id: s.programId, class_id: s.classId, day: s.day, time: s.time,
          instructor_id: s.instructorId && instrIds[s.instructorId] ? s.instructorId : null,
          assisting_instructor_id: s.assistingInstructorId && instrIds[s.assistingInstructorId] ? s.assistingInstructorId : null,
          day_option_group: s.trackLabel || s.dayOptionGroup || null, active: s.active !== false, is_full: s.full === true
        });
      });
    }
    return { rows: rows, problems: problems };
  }

  /* ── Loading ────────────────────────────────────────── */
  var COLS = {
    rooms: 'id,name',
    tracks: 'id,name,label,days',
    instructors: 'id,name,nickname,bio,status',
    classes: 'id,name,audience,type,color_key,fixed,duration_min,max_size,price_mvr,room_id,active,show_on_website',
    class_slots: 'id,class_id,day,time,instructor_id,assisting_instructor_id,day_option_group,active,is_full',
    programs: 'id,name,description,price_mvr,billing_period,class_ids,active,show_on_website',
    program_slots: 'id,program_id,class_id,day,time,instructor_id,assisting_instructor_id,day_option_group,active,is_full'
  };
  var ORDER = ['rooms', 'tracks', 'instructors', 'classes', 'class_slots'];
  var PROG_ORDER = ['programs', 'program_slots'];

  function friendlyError(err) {
    var code = err && (err.code || '');
    var msg = String((err && err.message) || err || '');
    if (code === 'PGRST205' || code === '42P01' || /does not exist|schema cache/i.test(msg)) {
      return 'The studio tables are not set up yet. Run flo_stage2_studio.sql in the Supabase SQL Editor.';
    }
    return 'Could not reach the studio data (' + msg + ').';
  }

  async function fetchAll(withPrivate) {
    var calls = ORDER.map(function (t) {
      return FLO.sb.from(t).select(COLS[t]).order('seq', { ascending: true }).limit(2000);
    });
    if (withPrivate) {
      calls.push(FLO.sb.from('instructor_private')
        .select('instructor_id,phone,dob,qualifications,experience').limit(2000));
    }
    // Programs are fetched on their own: if their tables do not exist yet
    // (stage 3 not run) the rest still loads and programs keep the sample data.
    var progCalls = PROG_ORDER.map(function (t) {
      return FLO.sb.from(t).select(COLS[t]).order('seq', { ascending: true }).limit(2000);
    });
    var res = await Promise.all(calls);
    var pres = await Promise.all(progCalls);
    for (var i = 0; i < res.length; i++) if (res[i].error) throw res[i].error;
    var R = {};
    ORDER.forEach(function (t, i) { R[t] = res[i].data || []; });
    var progErr = pres[0].error || pres[1].error;
    if (progErr) {
      var pm = String(progErr.message || '');
      var missing = progErr.code === 'PGRST205' || progErr.code === '42P01' || /does not exist|schema cache/i.test(pm);
      if (!missing) throw progErr;
      S.programsMissing = true;
    } else {
      R.programs = pres[0].data || [];
      R.program_slots = pres[1].data || [];
      S.programsMissing = false;
    }
    return { R: R, priv: withPrivate ? (res[ORDER.length].data || []) : [] };
  }

  function readCache() {
    try {
      var raw = window.localStorage.getItem(CACHE_KEY);
      var m = raw ? JSON.parse(raw) : null;
      if (m && Array.isArray(m.rooms) && Array.isArray(m.classes) && Array.isArray(m.classSlots) &&
          Array.isArray(m.instructors) && Array.isArray(m.tracks)) return m;
    } catch (e) { /* ignore */ }
    return null;
  }
  function writeCache(m) {
    // Public columns only. Private instructor details are never cached.
    var safe = {
      rooms: m.rooms, tracks: m.tracks, classes: m.classes, classSlots: m.classSlots,
      programs: m.programs, programSlots: m.programSlots,
      instructors: m.instructors.map(function (i) {
        return { id: i.id, name: i.name, nickname: i.nickname, bio: i.bio, status: i.status,
                 phone: '', dob: '', qualifications: '', experience: '' };
      })
    };
    try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(safe)); } catch (e) { /* ignore */ }
  }

  // Public (or signed-in non-admin) load.
  S.load = async function () {
    if (!FLO.sb || S.canWrite) return { ok: S.canWrite };
    try {
      var got = await fetchAll(false);
      // An administrator may have signed in while this was loading; never
      // overwrite the full copy (with private details) with the public one.
      if (S.canWrite || adminBusy) return { ok: true };
      var m = toMemory(got.R, []);
      applyMemory(m);
      writeCache(m);
      S.live = true;
      S.error = '';
      emit();
      return { ok: true };
    } catch (err) {
      S.error = friendlyError(err);
      console.warn('FLO studio:', S.error);
      return { ok: false, error: S.error };
    }
  };

  // After an administrator signs in: load everything and start saving changes.
  var adminBusy = false;
  S.enterAdmin = async function () {
    S.canWrite = false;
    adminBusy = true;
    setSync('busy', 'Loading studio data…');
    if (!FLO.sb) { adminBusy = false; setSync('err', 'Studio data is not connected. Changes to classes, instructors, rooms and tracks will not be saved.'); return { ok: false }; }
    try {
      var got = await fetchAll(true);
      var m = toMemory(got.R, got.priv);
      applyMemory(m);
      S.live = true;
      S.error = '';
      takeSnapshot();
      S.canWrite = true;
      adminBusy = false;
      setSync('idle', '');
      if (S.programsMissing) {
        setSync('err', 'Programs are not stored yet. Run flo_stage3_programs.sql in Supabase; until then changes to programs will not be saved.');
      }
      emit();
      return { ok: true };
    } catch (err) {
      adminBusy = false;
      S.error = friendlyError(err);
      setSync('err', S.error + ' Changes to classes, instructors, rooms and tracks will not be saved until this is fixed.', true);
      return { ok: false, error: S.error };
    }
  };

  /* ── Saving (administrator only) ────────────────────── */
  var TABLES = ['rooms', 'tracks', 'instructors', 'instructor_private', 'classes', 'class_slots', 'programs', 'program_slots'];
  var KEY = { instructor_private: 'instructor_id' };
  function keyOf(t) { return KEY[t] || 'id'; }
  var snapshot = {};
  var timer = null, running = null, again = false;

  function snapshotFrom(rows) {
    var snap = {};
    TABLES.forEach(function (t) {
      snap[t] = {};
      rows[t].forEach(function (r) { snap[t][r[keyOf(t)]] = JSON.stringify(r); });
    });
    return snap;
  }
  function takeSnapshot() { snapshot = snapshotFrom(buildRows().rows); }

  function plan(rows) {
    var out = { up: {}, del: {}, n: 0 };
    TABLES.forEach(function (t) {
      var k = keyOf(t), cur = {}, up = [], del = [];
      rows[t].forEach(function (r) { cur[r[k]] = r; });
      Object.keys(cur).forEach(function (id) {
        if (snapshot[t][id] !== JSON.stringify(cur[id])) up.push(cur[id]);
      });
      Object.keys(snapshot[t] || {}).forEach(function (id) { if (!cur[id]) del.push(id); });
      out.up[t] = up; out.del[t] = del; out.n += up.length + del.length;
    });
    return out;
  }

  S.hasUnsaved = function () {
    if (!S.canWrite) return false;
    try { return plan(buildRows().rows).n > 0; } catch (e) { return false; }
  };

  async function runSync() {
    var built = buildRows();
    if (built.problems.length) {
      setSync('err', built.problems[0] + ' Not saved.', true);
      return { ok: false };
    }
    var p = plan(built.rows);
    if (p.n === 0) { return { ok: true, nothing: true }; }
    setSync('busy', 'Saving…');

    var i, t, res, chunk;
    for (i = 0; i < TABLES.length; i++) {                     // inserts and updates, parents first
      t = TABLES[i];
      for (var a = 0; a < p.up[t].length; a += 200) {
        chunk = p.up[t].slice(a, a + 200);
        res = await FLO.sb.from(t).upsert(chunk, { onConflict: keyOf(t) });
        if (res.error) return fail(t, res.error);
      }
      p.up[t].forEach(function (r) { snapshot[t][r[keyOf(t)]] = JSON.stringify(r); });
    }
    for (i = TABLES.length - 1; i >= 0; i--) {                // removals, children first
      t = TABLES[i];
      for (var b = 0; b < p.del[t].length; b += 100) {
        chunk = p.del[t].slice(b, b + 100);
        res = await FLO.sb.from(t).delete().in(keyOf(t), chunk);
        if (res.error) return fail(t, res.error);
      }
      p.del[t].forEach(function (id) { delete snapshot[t][id]; });
    }
    setSync('ok', 'Saved');
    return { ok: true };
  }

  function fail(table, error) {
    var msg = String((error && error.message) || error);
    var what = { rooms: 'a room', tracks: 'a track', instructors: 'an instructor', instructor_private: 'instructor details',
                 classes: 'a class', class_slots: 'a class time', programs: 'a program', program_slots: 'a program session' }[table] || table;
    if (/duplicate key|unique/i.test(msg)) msg = 'Two entries share a name or time that must be unique.';
    else if (/violates check/i.test(msg)) msg = 'A value is outside the allowed range.';
    else if (/row-level security|permission denied/i.test(msg)) msg = 'This account is not allowed to change studio data. Sign in again as the administrator.';
    setSync('err', 'Could not save ' + what + ': ' + msg, true);
    return { ok: false, error: msg };
  }

  S.syncNow = function () {
    if (!S.canWrite) return Promise.resolve({ ok: false });
    if (running) { again = true; return running; }
    running = runSync().then(function (r) {
      running = null;
      if (again) { again = false; return S.syncNow(); }
      return r;
    }, function (err) {
      running = null;
      setSync('err', 'Could not save: ' + String(err && err.message || err), true);
      return { ok: false };
    });
    return running;
  };

  // Called after anything that may have changed the data.
  S.touch = function () {
    if (!S.canWrite) return;
    clearTimeout(timer);
    timer = setTimeout(S.syncNow, SAVE_DELAY);
  };

  // The administrator's screens change the arrays directly, so any click or
  // change inside the admin portal may have altered something. The diff
  // against the last saved copy is cheap and sends nothing when nothing changed.
  function onActivity(e) {
    if (!S.canWrite) return;
    var t = e.target;
    if (t && t.closest && (t.closest('#adminPortal') || t.closest('#studioScheduleModal') ||
        t.closest('.modal-overlay'))) S.touch();
  }
  // Capture phase: the screens redraw themselves inside their own click
  // handlers, which detaches the clicked element before a bubbling listener runs.
  document.addEventListener('click', onActivity, true);
  document.addEventListener('change', onActivity, true);

  window.addEventListener('beforeunload', function (e) {
    if (S.hasUnsaved() || running) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ── Save status pill ───────────────────────────────── */
  var pill = null, pillTimer = null;
  function setSync(state, text, retry) {
    if (!document.body) return;
    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'studioSync';
      pill.className = 'studio-sync';
      pill.setAttribute('role', 'status');
      pill.setAttribute('aria-live', 'polite');
      pill.hidden = true;
      document.body.appendChild(pill);
      pill.addEventListener('click', function (e) {
        if (e.target.closest('[data-sync-retry]')) { S.syncNow(); }
      });
    }
    clearTimeout(pillTimer);
    if (state === 'idle' || !text) { pill.hidden = true; return; }
    pill.hidden = false;
    pill.className = 'studio-sync studio-sync--' + state;
    pill.innerHTML = '<span>' + esc(text) + '</span>' +
      (retry ? ' <button type="button" data-sync-retry>Try again</button>' : '');
    if (state === 'ok') pillTimer = setTimeout(function () { pill.hidden = true; }, 2500);
  }

  /* ── What the public sees: class times and cards ────── */
  function activeSlots(classId) {
    var list = D().classSlots.filter(function (s) { return s.classId === classId && s.active !== false; });
    list.sort(function (a, b) {
      return WEEK_WEB.indexOf(a.day) - WEEK_WEB.indexOf(b.day) || a.time.localeCompare(b.time);
    });
    return list;
  }

  S.deriveSlots = function (cls) {
    var slots = activeSlots(cls.id).map(function (s) {
      return { text: s.day + ' · ' + fmt12(s.time), status: s.full ? 'full' : 'available' };
    });
    var open = slots.filter(function (s) { return s.status !== 'full'; }).length;
    var label = !slots.length ? 'Schedule coming soon' : (open ? 'Available slots' : 'No slots available');
    return { slots: slots.slice(0, 12), label: label, allFull: slots.length > 0 && open === 0 };
  };

  // The class a website card is tied to, or null for a card written by hand.
  // 'gone' means the card names a class that no longer exists.
  S.linkFor = function (card) {
    var list = D().classes;
    if (card.classId) {
      var c = byId(list, card.classId);
      return c || 'gone';
    }
    var nm = String(card.name || '').trim().toLowerCase();
    if (!nm) return null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].audience === 'adult' && String(list[i].name).trim().toLowerCase() === nm) return list[i];
    }
    return null;
  };

  function offered(c) { return c.active !== false && c.showOnWebsite !== false && c.audience === 'adult'; }

  // Facts that live on the class row and are therefore never typed twice:
  // name, style, duration, price and times.
  var DURATION_LINE = /^\s*\d+\s*(min|mins|minute|minutes)\b/i;
  S.durationLine = function (cls) { return cls.durationMin ? cls.durationMin + ' min session' : ''; };
  S.priceText = function (cls) {
    return cls.priceMvr === null || cls.priceMvr === undefined || cls.priceMvr === '' ? '' : 'MVR ' + Number(cls.priceMvr).toLocaleString('en-US') + ' / month';
  };
  // The card's own hover lines without any duration line (that one is automatic).
  S.extraMeta = function (meta) {
    return (meta || []).filter(function (l) { return !DURATION_LINE.test(l); });
  };

  function mergeCardWithClass(card, cls) {
    var d = S.deriveSlots(cls);
    var m = {};
    Object.keys(card).forEach(function (k) { m[k] = card[k]; });
    m.classId = cls.id;
    m.name = cls.name;
    m.type = cls.type || '';
    m.price = S.priceText(cls);
    var dur = S.durationLine(cls);
    m.meta = (dur ? [dur] : []).concat(S.extraMeta(card.meta)).slice(0, 8);
    m.slots = d.slots;
    m.slotsLabel = d.label;
    m.waitlist = card.waitlist === true || d.allFull;
    if (d.allFull && card.buttonLabel === 'Join Class') m.buttonLabel = 'Join Waitlist';
    return m;
  }

  S.resolveCard = function (card) {
    if (!S.live) return card;
    var l = S.linkFor(card);
    return l && l !== 'gone' ? mergeCardWithClass(card, l) : card;
  };

  function autoCard(cls) {
    var d = S.deriveSlots(cls);
    return {
      id: 'auto-' + cls.id, classId: cls.id, icon: '', name: cls.name, type: cls.type || '', desc: '', price: S.priceText(cls),
      meta: cls.durationMin ? [S.durationLine(cls)] : [], slotsLabel: d.label, slots: d.slots,
      buttonLabel: d.allFull ? 'Join Waitlist' : 'Join Class', buttonLink: '#', waitlist: d.allFull,
      highlight: cls.colorKey === 'tangerine', hidden: false, groupId: '', auto: true
    };
  }

  // Adult classes that are live but have no website card of their own.
  S.unlisted = function (cards) {
    if (!S.live) return [];
    var claimed = {};
    cards.forEach(function (c) {
      var l = S.linkFor(c);
      if (l && l !== 'gone') claimed[l.id] = true;
    });
    return D().classes.filter(function (c) { return offered(c) && !claimed[c.id]; });
  };

  // Website content with the class cards tied to the real schedule.
  S.resolveWebsite = function (w) {
    if (!S.live || !w || !w.classes) return w;
    var cards = [], claimed = {};
    w.classes.cards.forEach(function (card) {
      var l = S.linkFor(card);
      if (!l) { cards.push(card); return; }                    // written by hand
      if (l === 'gone') return;                                // its class was deleted
      claimed[l.id] = true;
      if (!offered(l)) return;                                 // switched off or inactive
      cards.push(mergeCardWithClass(card, l));
    });
    D().classes.forEach(function (c) {
      if (offered(c) && !claimed[c.id]) cards.push(autoCard(c));
    });
    var cl = {};
    Object.keys(w.classes).forEach(function (k) { cl[k] = w.classes[k]; });
    cl.cards = cards;
    var out = {};
    Object.keys(w).forEach(function (k) { out[k] = w[k]; });
    out.classes = cl;
    if (S.progLive && w.kids && w.kids.cards) out.kids = resolveKids(w);
    return out;
  };

  /* ── Programs (FLO Kids) ────────────────────────────── */
  // Facts that live on the program row are never typed twice: name, price,
  // the styles of its classes, and its weekly sessions.
  var LEGACY_PROGRAM = { 'kids-fly': 'kids-aerial-only', 'kids-fusion': 'kids-fusion' };
  var PERIOD = { month: 'month', term: 'term', year: 'year' };

  // The program a FLO Kids card is tied to, or null for a card written by hand.
  // 'gone' means the card names a program that no longer exists.
  S.programLinkFor = function (card) {
    if (!S.progLive) return null;
    var list = D().programs;
    if (card.programId) return byId(list, card.programId) || 'gone';
    var hit = LEGACY_PROGRAM[card.id] ? byId(list, LEGACY_PROGRAM[card.id]) : null;
    if (hit) return hit;
    var nm = String(card.name || '').trim().toLowerCase();
    if (!nm) return null;
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].name).trim().toLowerCase() === nm) return list[i];
    }
    return null;
  };

  function programOffered(p) { return p.active !== false && p.showOnWebsite !== false; }

  S.programPriceText = function (p) {
    var n = Number(p.priceRf);
    return !n ? '' : 'MVR ' + n.toLocaleString('en-US') + ' / ' + (PERIOD[p.billingPeriod] || 'month');
  };

  S.programClasses = function (p) {
    var d = D();
    return (p.classIds || []).map(function (id) { return byId(d.classes, id); }).filter(Boolean);
  };

  // "Ballet & Aerial": the styles of the classes in the program.
  S.programType = function (p) {
    var seen = [];
    S.programClasses(p).forEach(function (c) {
      var t = c.type || c.name;
      if (t && seen.indexOf(t) < 0) seen.push(t);
    });
    return seen.join(' & ');
  };

  S.programSlotsOf = function (p) {
    var order = (p.classIds || []);
    var list = D().programSlots.filter(function (s) { return s.programId === p.id && s.active !== false; });
    list.sort(function (a, b) {
      return WEEK_WEB.indexOf(a.day) - WEEK_WEB.indexOf(b.day) || a.time.localeCompare(b.time) ||
        order.indexOf(a.classId) - order.indexOf(b.classId);
    });
    return list;
  };

  S.deriveProgramSlots = function (p) {
    var multi = S.programClasses(p).length > 1;
    var d = D();
    var slots = S.programSlotsOf(p).map(function (s) {
      var c = byId(d.classes, s.classId);
      return { text: (multi && c ? c.name + ' · ' : '') + s.day + ' · ' + fmt12(s.time), status: s.full ? 'full' : 'available' };
    });
    var open = slots.filter(function (x) { return x.status !== 'full'; }).length;
    var label = !slots.length ? 'Schedule coming soon' : (open ? 'Available slots' : 'No slots available');
    return { slots: slots.slice(0, 12), label: label, allFull: slots.length > 0 && open === 0 };
  };

  function mergeKidsCard(card, p) {
    var d = S.deriveProgramSlots(p);
    var m = {};
    Object.keys(card).forEach(function (k) { m[k] = card[k]; });
    m.programId = p.id;
    m.name = p.name;
    m.type = S.programType(p);
    m.price = S.programPriceText(p);
    m.slots = d.slots;
    m.slotsLabel = d.label;
    m.waitlist = card.waitlist === true || d.allFull;
    if (d.allFull && card.buttonLabel === 'Join Class') m.buttonLabel = 'Join Waitlist';
    return m;
  }

  S.resolveKidsCard = function (card) {
    var l = S.programLinkFor(card);
    return l && l !== 'gone' ? mergeKidsCard(card, l) : card;
  };

  function autoKidsCard(p) {
    var d = S.deriveProgramSlots(p);
    return {
      id: 'auto-' + p.id, programId: p.id, icon: '', name: p.name, type: S.programType(p), desc: p.description || '',
      price: S.programPriceText(p), meta: [], slotsLabel: d.label, slots: d.slots,
      buttonLabel: d.allFull ? 'Join Waitlist' : 'Join Class', buttonLink: '#', waitlist: d.allFull,
      highlight: false, hidden: false, auto: true
    };
  }

  S.programs = function () { return S.progLive ? D().programs : []; };

  // Programs that are live but have no FLO Kids card of their own.
  S.unlistedPrograms = function (cards) {
    if (!S.progLive) return [];
    var claimed = {};
    cards.forEach(function (c) {
      var l = S.programLinkFor(c);
      if (l && l !== 'gone') claimed[l.id] = true;
    });
    return D().programs.filter(function (p) { return programOffered(p) && !claimed[p.id]; });
  };

  function resolveKids(w) {
    var cards = [], claimed = {};
    w.kids.cards.forEach(function (card) {
      var l = S.programLinkFor(card);
      if (!l) { cards.push(card); return; }
      if (l === 'gone') return;
      claimed[l.id] = true;
      if (!programOffered(l)) return;
      cards.push(mergeKidsCard(card, l));
    });
    D().programs.forEach(function (p) {
      if (programOffered(p) && !claimed[p.id]) cards.push(autoKidsCard(p));
    });
    var k = {};
    Object.keys(w.kids).forEach(function (key) { k[key] = w.kids[key]; });
    k.cards = cards;
    return k;
  }

  /* ── Client program picker ─────────────────────────── */
  // Programs the client portal offers: live programs that have a class.
  S.pickerPrograms = function () {
    return D().programs.filter(function (p) { return p.active !== false && S.programClasses(p).length; });
  };

  // How many sessions of each class a child attends in a week, worked out
  // from the program's tracks: sessions of the class divided by the number
  // of tracks (a session with no track counts as its own track).
  function trackKey(s) { return s.trackLabel || s.dayOptionGroup || s.id; }

  S.programIncludes = function (p) {
    var slots = S.programSlotsOf(p);
    var keys = {};
    slots.forEach(function (s) { keys[trackKey(s)] = true; });
    var nKeys = Math.max(1, Object.keys(keys).length);
    return S.programClasses(p).map(function (c) {
      var n = slots.filter(function (s) { return s.classId === c.id; }).length;
      var per = Math.max(1, Math.round(n / nKeys));
      return per + ' ' + c.name + ' session' + (per > 1 ? 's' : '') + ' / week';
    });
  };

  // The choices a client has when joining a program: one per track.
  S.programOptions = function (p) {
    var d = D();
    var groups = [], by = {};
    S.programSlotsOf(p).slice().sort(function (a, b) {
      return D().programSlots.indexOf(a) - D().programSlots.indexOf(b);
    }).forEach(function (s) {
      var k = trackKey(s);
      if (!by[k]) { by[k] = { key: k, slots: [] }; groups.push(by[k]); }
      by[k].slots.push(s);
    });
    var classes = S.programClasses(p);
    var multi = classes.length > 1;
    return groups.map(function (g) {
      var title = [], meta = [];
      classes.forEach(function (c) {
        var mine = g.slots.filter(function (s) { return s.classId === c.id; });
        if (!mine.length) return;
        var days = mine.map(function (s) { return s.day; }).join(' + ');
        var times = [];
        mine.forEach(function (s) { var t = fmt12(s.time); if (times.indexOf(t) < 0) times.push(t); });
        var who = [];
        mine.forEach(function (s) {
          var i = byId(d.instructors, s.instructorId);
          if (i && who.indexOf(i.name) < 0) who.push(i.name);
        });
        title.push(multi ? days + ' ' + (c.type || c.name) : days + ' · ' + times.join(', '));
        meta.push((multi ? (c.type || c.name) + ' ' : (c.type || c.name) + ' · ') + (multi ? times.join(', ') : '') +
          (who.length ? (multi ? ' ' : '') + 'with ' + who.join(', ') : ''));
      });
      return {
        key: g.key, title: title.join(' · '), meta: meta.join(' · '),
        full: g.slots.some(function (s) { return s.full === true; })
      };
    });
  };

  /* ── Client enrolment timetable ─────────────────────── */
  // Returns the inside of the .timetable grid and the number of day columns.
  S.timetableHTML = function () {
    var d = D();
    var items = [];
    d.classSlots.forEach(function (s) {
      var c = byId(d.classes, s.classId);
      if (!c || c.active === false || c.audience !== 'adult' || s.active === false) return;
      items.push({ s: s, c: c });
    });
    var days = WEEK_WEB.filter(function (day) { return items.some(function (x) { return x.s.day === day; }); });
    if (!days.length) return { html: '', days: 0 };
    var times = [];
    items.forEach(function (x) { if (times.indexOf(x.s.time) < 0) times.push(x.s.time); });
    times.sort();

    var h = '<div class="tt-cell tt-corner"></div>';
    days.forEach(function (day) { h += '<div class="tt-cell tt-head">' + esc(day) + '</div>'; });
    times.forEach(function (time) {
      h += '<div class="tt-cell tt-time">' + esc(fmt12(time)) + '</div>';
      days.forEach(function (day) {
        var here = items.filter(function (x) { return x.s.day === day && x.s.time === time; });
        if (!here.length) { h += '<div class="tt-cell tt-empty">—</div>'; return; }
        h += '<div class="tt-cell">' + here.map(function (x) {
          var full = x.s.full === true;
          var price = x.c.priceMvr == null ? 0 : x.c.priceMvr;
          return '<button class="tt-slot ' + (full ? 'full' : 'available') +
              (x.c.colorKey === 'tangerine' ? ' tt-slot--intensity' : '') + '"' +
            ' data-class="' + esc(x.c.name) + '" data-day="' + esc(day) + '" data-time="' + esc(fmt12(time)) + '"' +
            ' data-price="' + esc(price) + '" data-spots=""' + (full ? ' disabled' : '') + '>' +
            '<span class="tt-slot-name">' + esc(x.c.name) + '</span>' +
            '<span class="tt-slot-meta">' + (full ? 'Full' : 'Open') + '</span></button>';
        }).join('') + '</div>';
      });
    });
    return { html: h, days: days.length };
  };

  /* ── Schedule editor for one class (administrator) ──── */
  var modal = null, currentClass = null;

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'studioScheduleModal';
    modal.innerHTML =
      '<div class="modal-box modal-box--wide">' +
        '<button class="modal-close" type="button" data-ss-close aria-label="Close">✕</button>' +
        '<div class="modal-logo" id="ssTitle">Schedule</div>' +
        '<p class="modal-tagline" id="ssSub"></p>' +
        '<div class="studio-sched" id="ssList"></div>' +
        '<div class="studio-sched-add">' +
          '<p class="studio-sched-addlabel">Add a time</p>' +
          '<div class="studio-sched-row" id="ssAddRow"></div>' +
        '</div>' +
        '<p class="child-form-note" id="ssNote" role="alert"></p>' +
        '<p class="studio-sched-foot">Changes are saved automatically. A time that clashes with another class in the same room, or with the same instructor, is refused.</p>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-ss-close]')) closeSchedule();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('modal-open')) closeSchedule();
    });
    return modal;
  }

  function closeSchedule() {
    if (modal) modal.classList.remove('modal-open');
    currentClass = null;
    emit();                                   // lists elsewhere show the new counts
    S.touch();
  }

  function instrOptions(selected) {
    var d = D();
    var opts = '<option value="">No instructor yet</option>';
    d.instructors.forEach(function (i) {
      if (i.status === 'inactive' && i.id !== selected) return;
      opts += '<option value="' + esc(i.id) + '"' + (i.id === selected ? ' selected' : '') + '>' +
        esc(i.name) + (i.status === 'on-leave' ? ' (on leave)' : '') + (i.status === 'inactive' ? ' (inactive)' : '') + '</option>';
    });
    return opts;
  }
  function dayOptions(selected) {
    return DAYS_ALL.map(function (day) {
      return '<option value="' + day + '"' + (day === selected ? ' selected' : '') + '>' + day + '</option>';
    }).join('');
  }

  // Describes the first clash, or '' when the time is free.
  S.clash = function (cand, ignoreId) {
    var d = D();
    var cls = byId(d.classes, cand.classId);
    if (!cls) return '';
    var start = mins(cand.time), end = start + (cls.durationMin || 50);
    var all = d.classSlots.concat(d.programSlots);
    for (var i = 0; i < all.length; i++) {
      var o = all[i];
      if (o.id === ignoreId || o.active === false || o.day !== cand.day) continue;
      if (o.classId === cand.classId && o.time === cand.time && o.programId === undefined) {
        return 'This class already runs on ' + cand.day + ' at ' + fmt12(cand.time) + '.';
      }
      var oc = byId(d.classes, o.classId);
      if (!oc || oc.active === false) continue;
      var os = mins(o.time), oe = os + (oc.durationMin || 50);
      if (!(start < oe && os < end)) continue;
      if (cand.instructorId && o.instructorId === cand.instructorId) {
        var ins = byId(d.instructors, cand.instructorId);
        return (ins ? ins.name : 'This instructor') + ' already teaches ' + oc.name + ' on ' + o.day + ' at ' + fmt12(o.time) + '.';
      }
      if (cls.room && oc.room === cls.room) {
        return cls.room + ' is already used by ' + oc.name + ' on ' + o.day + ' at ' + fmt12(o.time) + '.';
      }
    }
    return '';
  };

  function newSlotId(cls, day, time) {
    var d = D();
    var base = (cls.id + '-' + day.toLowerCase() + '-' + time.replace(':', '')).slice(0, 78);
    var id = base, n = 2;
    while (byId(d.classSlots, id)) { id = base + '-' + n; n++; }
    return id;
  }

  function note(text) {
    var el = document.getElementById('ssNote');
    if (el) el.textContent = text || '';
  }

  function renderSchedule() {
    var d = D();
    var cls = byId(d.classes, currentClass);
    if (!cls) { closeSchedule(); return; }
    document.getElementById('ssTitle').textContent = 'Schedule: ' + cls.name;
    document.getElementById('ssSub').textContent =
      (cls.room ? cls.room : 'No room set') + ' · ' + (cls.durationMin || 50) + ' min';

    var slots = d.classSlots.filter(function (s) { return s.classId === cls.id; });
    slots.sort(function (a, b) {
      return DAYS_ALL.indexOf(a.day) - DAYS_ALL.indexOf(b.day) || a.time.localeCompare(b.time);
    });
    var list = document.getElementById('ssList');
    list.innerHTML = slots.length ? slots.map(function (s) {
      return '<div class="studio-sched-row' + (s.active === false ? ' is-off' : '') + '" data-sid="' + esc(s.id) + '">' +
        '<select class="settings-select" data-f="day" aria-label="Day">' + dayOptions(s.day) + '</select>' +
        '<input type="time" class="studio-sched-time" data-f="time" step="300" aria-label="Start time" value="' + esc(s.time) + '">' +
        '<select class="settings-select" data-f="instructorId" aria-label="Instructor">' + instrOptions(s.instructorId) + '</select>' +
        '<div class="studio-sched-tail">' +
          '<label class="studio-sched-check"><input type="checkbox" data-f="full"' + (s.full ? ' checked' : '') + '> Full</label>' +
          '<label class="studio-sched-check"><input type="checkbox" data-f="active"' + (s.active !== false ? ' checked' : '') + '> Running</label>' +
          '<button type="button" class="wsite-small wsite-small--danger" data-del>Remove</button>' +
        '</div>' +
      '</div>';
    }).join('') : '<p class="admin-empty-note">No times yet. Add the first one below; this class appears on the website once it has a time.</p>';

    var firstInstr = '';
    var addRow = document.getElementById('ssAddRow');
    addRow.innerHTML =
      '<select class="settings-select" id="ssAddDay" aria-label="Day">' + dayOptions('Sat') + '</select>' +
      '<input type="time" class="studio-sched-time" id="ssAddTime" step="300" aria-label="Start time" value="08:00">' +
      '<select class="settings-select" id="ssAddInstr" aria-label="Instructor">' + instrOptions(firstInstr) + '</select>' +
      '<button type="button" class="btn-admin-primary" id="ssAddBtn">Add time</button>';

    document.getElementById('ssAddBtn').onclick = function () {
      var day = document.getElementById('ssAddDay').value;
      var time = document.getElementById('ssAddTime').value;
      var instr = document.getElementById('ssAddInstr').value;
      if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) { note('Please choose a start time.'); return; }
      var cand = { classId: cls.id, day: day, time: time, instructorId: instr };
      var why = S.clash(cand, null);
      if (why) { note(why); return; }
      D().classSlots.push({
        id: newSlotId(cls, day, time), classId: cls.id, day: day, time: time,
        instructorId: instr, active: true, full: false
      });
      note('');
      renderSchedule();
      S.touch();
    };
  }

  function wireScheduleList() {
    var list = document.getElementById('ssList');
    list.addEventListener('change', function (e) {
      var f = e.target.getAttribute('data-f');
      var row = e.target.closest('[data-sid]');
      if (!f || !row) return;
      var s = byId(D().classSlots, row.getAttribute('data-sid'));
      if (!s) return;
      if (f === 'full') { s.full = e.target.checked; note(''); S.touch(); return; }
      if (f === 'active') {
        if (e.target.checked) {
          var why0 = S.clash({ classId: s.classId, day: s.day, time: s.time, instructorId: s.instructorId }, s.id);
          if (why0) { note(why0); renderSchedule(); return; }
        }
        s.active = e.target.checked; note(''); renderSchedule(); S.touch(); return;
      }

      var cand = { classId: s.classId, day: s.day, time: s.time, instructorId: s.instructorId };
      cand[f] = e.target.value;
      if (f === 'time' && !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(cand.time)) { note('Please choose a start time.'); renderSchedule(); return; }
      var why = s.active === false ? '' : S.clash(cand, s.id);
      if (why) { note(why); renderSchedule(); return; }
      if (f === 'day' || f === 'time') {
        // The slot keeps its identifier; only day and time change.
        var dup = D().classSlots.some(function (o) { return o !== s && o.classId === s.classId && o.day === cand.day && o.time === cand.time; });
        if (dup) { note('This class already runs on ' + cand.day + ' at ' + fmt12(cand.time) + '.'); renderSchedule(); return; }
      }
      s[f] = cand[f];
      note('');
      renderSchedule();
      S.touch();
    });
    list.addEventListener('click', function (e) {
      var del = e.target.closest('[data-del]');
      if (!del) return;
      var row = del.closest('[data-sid]');
      var s = byId(D().classSlots, row.getAttribute('data-sid'));
      if (!s) return;
      if (!window.confirm('Remove ' + s.day + ' ' + fmt12(s.time) + '?')) return;
      var arr = D().classSlots;
      arr.splice(arr.indexOf(s), 1);
      note('');
      renderSchedule();
      S.touch();
    });
  }

  S.openSchedule = function (classId) {
    ensureModal();
    if (!modal.__wired) { wireScheduleList(); modal.__wired = true; }
    currentClass = classId;
    note('');
    renderSchedule();
    modal.classList.add('modal-open');
  };

  // Adult classes, for the Website editor's "Linked class" list.
  S.adultClasses = function () {
    return D().classes.filter(function (c) { return c.audience === 'adult'; });
  };

  S.slotCount = function (classId) {
    return D().classSlots.filter(function (s) { return s.classId === classId && s.active !== false; }).length;
  };

  /* ── Start: show the cached copy at once, then refresh ─ */
  (function start() {
    try {
      var cached = readCache();
      if (cached) {
        applyMemory(cached);
        S.live = true;
      }
    } catch (e) { /* keep the built-in sample data */ }
    S.load();
  })();
})();
