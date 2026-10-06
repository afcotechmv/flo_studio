/* =========================================================
   FLO Studio — site-config.js
   Connection to Supabase plus the small helper layer used by
   the public site (read) and the Website admin editor (write).

   The key below is a PUBLISHABLE key. It is designed to sit in
   public browser code. What protects the content is the set of
   Row Level Security policies created by flo_supabase_setup.sql:
   anyone may read, only emails listed in admin_roles may write.

   NEVER put a secret key, a service_role key or the database
   password in this file.
   ========================================================= */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://aacquxvvxybjkwjsjqwc.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_yH9gEPwtqjp2H1-AK4CJPA_nkpVtNTV';
  var BUCKET = 'site-images';

  var FLO = (window.FLO = window.FLO || {});

  /* ── Client ─────────────────────────────────────────── */
  FLO.sb = null;
  try {
    if (window.supabase && window.supabase.createClient) {
      FLO.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
      console.warn('FLO: Supabase library did not load; site will use built-in content.');
    }
  } catch (err) {
    console.warn('FLO: could not start Supabase client.', err);
  }

  /* ── Small utilities ────────────────────────────────── */
  FLO.esc = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Only allow links that are safe to place in an href.
  FLO.safeHref = function (value) {
    var v = String(value || '').trim();
    if (/^(#|https?:\/\/|mailto:|tel:)/i.test(v)) return v;
    return '#';
  };

  // Only allow image addresses that are safe to place in a src / url().
  FLO.safeImageUrl = function (value) {
    var v = String(value || '').trim();
    if (/^https:\/\/[^\s"'()<>]+$/i.test(v)) return v;
    if (/^images\/[A-Za-z0-9_\-./]+$/.test(v)) return v;
    return '';
  };

  FLO.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  /* ── Settings (key / value table) ───────────────────── */
  FLO.settings = {
    get: async function (key) {
      if (!FLO.sb) return { ok: false, value: null, error: 'offline' };
      try {
        var res = await FLO.sb.from('site_settings').select('value').eq('key', key).maybeSingle();
        if (res.error) return { ok: false, value: null, error: res.error.message };
        return { ok: true, value: res.data ? res.data.value : null };
      } catch (err) {
        return { ok: false, value: null, error: String(err && err.message || err) };
      }
    },
    set: async function (key, value) {
      if (!FLO.sb) return { ok: false, error: 'The service could not be reached. Please reload and try again.' };
      try {
        var res = await FLO.sb
          .from('site_settings')
          .upsert({ key: key, value: value, updated_at: new Date().toISOString() });
        if (res.error) {
          var code = res.error.code || '';
          if (code === '42501' || /row-level security/i.test(res.error.message || '')) {
            return {
              ok: false,
              error: 'Not permitted. Sign out and in again, and make sure this account is listed in admin_roles.'
            };
          }
          return { ok: false, error: res.error.message };
        }
        return { ok: true };
      } catch (err) {
        return { ok: false, error: String(err && err.message || err) };
      }
    }
  };

  /* ── Admin authentication ───────────────────────────── */
  FLO.adminLogin = async function (email, password) {
    if (!FLO.sb) {
      return { ok: false, message: 'The admin service could not be loaded. Check your internet connection and reload the page.' };
    }
    var res;
    try {
      res = await FLO.sb.auth.signInWithPassword({ email: email, password: password });
    } catch (err) {
      return { ok: false, message: 'Could not reach the server. Please try again.' };
    }
    if (res.error) {
      var msg = String(res.error.message || '');
      if (res.error.status === 400 || /invalid login credentials/i.test(msg)) {
        return { ok: false, message: 'Incorrect email or password.' };
      }
      return { ok: false, message: 'Could not reach the server. Please try again.' };
    }
    // The signed-in account must be listed in admin_roles. The policy lets
    // a user read only their own row, so this returns one row or none.
    var role = await FLO.sb.from('admin_roles').select('email').maybeSingle();
    if (role.error || !role.data) {
      try { await FLO.sb.auth.signOut(); } catch (e) { /* ignore */ }
      return { ok: false, message: 'This account is not set up as a FLO administrator.' };
    }
    return { ok: true, email: role.data.email };
  };

  FLO.signOut = async function () {
    if (!FLO.sb) return;
    try { await FLO.sb.auth.signOut(); } catch (e) { /* ignore */ }
  };

  /* ── Image upload (with in-browser compression) ─────── */
  function loadBitmap(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('That file is not a readable image.')); };
      img.src = url;
    });
  }

  // Resize so the longest side is at most maxDim. PNG stays PNG so
  // transparency (class icons) is preserved; everything else becomes JPEG.
  async function compress(file, maxDim, quality) {
    if (file.type === 'image/gif') return { blob: file, ext: 'gif', type: 'image/gif' };
    var img = await loadBitmap(file);
    var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    var w = Math.max(1, Math.round(img.width * scale));
    var h = Math.max(1, Math.round(img.height * scale));
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    var keepPng = file.type === 'image/png';
    var outType = keepPng ? 'image/png' : 'image/jpeg';
    var blob = await new Promise(function (resolve) {
      canvas.toBlob(resolve, outType, quality);
    });
    if (!blob) throw new Error('Could not process that image.');
    return { blob: blob, ext: keepPng ? 'png' : 'jpg', type: outType };
  }

  /**
   * Upload an image to the site-images bucket.
   * folder: e.g. 'hero', 'classes', 'team', 'events'
   * opts:   { maxDim: 1600, quality: 0.85 }
   * Returns { ok, url, path } or { ok:false, error }.
   */
  FLO.uploadImage = async function (file, folder, opts) {
    opts = opts || {};
    if (!FLO.sb) return { ok: false, error: 'The service could not be reached.' };
    if (!file || !/^image\/(png|jpe?g|webp|gif)$/i.test(file.type || '')) {
      return { ok: false, error: 'Please choose a PNG, JPG, WebP or GIF image.' };
    }
    try {
      var out = await compress(file, opts.maxDim || 1600, opts.quality || 0.85);
      if (out.blob.size > 5 * 1024 * 1024) {
        return { ok: false, error: 'That image is still over 5 MB after compression. Please choose a smaller one.' };
      }
      var path = folder + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + out.ext;
      var up = await FLO.sb.storage.from(BUCKET).upload(path, out.blob, {
        cacheControl: '31536000',
        contentType: out.type,
        upsert: false
      });
      if (up.error) {
        if (/row-level security|not allowed|unauthorized/i.test(up.error.message || '')) {
          return { ok: false, error: 'Upload not permitted. Sign out and in again with the admin account.' };
        }
        return { ok: false, error: up.error.message };
      }
      var pub = FLO.sb.storage.from(BUCKET).getPublicUrl(path);
      return { ok: true, url: pub.data.publicUrl, path: path };
    } catch (err) {
      return { ok: false, error: String(err && err.message || err) };
    }
  };
})();
