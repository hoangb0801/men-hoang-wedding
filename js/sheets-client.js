/**
 * Google Sheets Client & Demo Fallback (Pure Vanilla JS, zero-build)
 * Compatible with both file:// and http(s):// without ES modules.
 * Exposes window.WeddingSheets = { isConfigured, loadWishes, submitWish, submitRsvp }.
 */
(function (win) {
  'use strict';

  var STORAGE_WISHES = 'thiep_cuoi_demo_wishes';
  var STORAGE_RSVP = 'thiep_cuoi_demo_rsvp';
  var DEFAULT_TIMEOUT_MS = 10000;
  var DEFAULT_WISH_LIMIT = 100;
  var memoryWishes = [];
  var memoryRsvp = [];

  function safeText(v) {
    return v === undefined || v === null ? '' : String(v);
  }

  function getConfig() {
    if (win.WeddingConfig && typeof win.WeddingConfig.get === 'function') {
      return win.WeddingConfig.get() || {};
    }
    return win.WEDDING_CONFIG || {};
  }

  function getSheetsSettings() {
    var cfg = getConfig();
    var gs = (cfg && cfg.googleSheets && typeof cfg.googleSheets === 'object') ? cfg.googleSheets : {};
    var scriptUrl = safeText(gs.scriptUrl).trim();
    var t = Number(gs.timeoutMs);
    var timeoutMs = (isFinite(t) && t > 0) ? t : DEFAULT_TIMEOUT_MS;
    var fallbackToDemo = gs.fallbackToDemo !== false;
    return {
      scriptUrl: scriptUrl,
      timeoutMs: timeoutMs,
      fallbackToDemo: fallbackToDemo
    };
  }

  function isValidScriptUrl(rawUrl) {
    var url = safeText(rawUrl).trim();
    if (!url) return false;
    if (/YOUR_|EXAMPLE|<[^>]*>/i.test(url)) return false;
    if (/[<> \t\r\n]/.test(url)) return false;
    if (!/^https?:\/\//i.test(url)) return false;

    if (typeof win.URL === 'function') {
      try {
        var parsed = new win.URL(url);
        return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname);
      } catch (_) {
        return false;
      }
    }
    return /^https?:\/\/[^/?#]+/i.test(url);
  }

  function isConfigured() {
    try {
      return isValidScriptUrl(getSheetsSettings().scriptUrl);
    } catch (_) {
      return false;
    }
  }

  function readStorage(key, fallbackArr) {
    try {
      if (!win.localStorage) return fallbackArr.slice();
      var raw = win.localStorage.getItem(key);
      if (!raw) return fallbackArr.slice();
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallbackArr.slice();
    } catch (_) {
      return fallbackArr.slice();
    }
  }

  function writeStorage(key, arr) {
    try {
      if (win.localStorage) {
        win.localStorage.setItem(key, JSON.stringify(arr));
      }
    } catch (_) {}
  }

  function normalizeWish(w, fallbackId) {
    if (!w || typeof w !== 'object') return null;
    var id = safeText(w.id).trim() || safeText(fallbackId).trim();
    var name = safeText(w.name || w.guest_name).trim();
    var relation = safeText(w.relation).trim();
    var message = safeText(w.message).trim();
    var createdAt = safeText(w.createdAt || w.created_at).trim();
    if (!name && !message) return null;
    return {
      id: id,
      name: name,
      relation: relation,
      message: message,
      createdAt: createdAt
    };
  }

  function getSampleWishes() {
    var cfg = getConfig();
    var gbList = (cfg.guestbook && Array.isArray(cfg.guestbook.sampleWishes)) ? cfg.guestbook.sampleWishes : [];
    var legacyList = Array.isArray(cfg.wishes) ? cfg.wishes : [];
    var combinedRaw = gbList.concat(legacyList);
    var out = [];
    for (var i = 0; i < combinedRaw.length; i++) {
      var item = normalizeWish(combinedRaw[i], 'sample-' + i);
      if (item) out.push(item);
    }
    return out;
  }

  function mergeAndSortWishes(items) {
    var seen = Object.create(null);
    var combined = [];
    for (var i = 0; i < items.length; i++) {
      var norm = normalizeWish(items[i], 'wish-' + i);
      if (!norm) continue;
      var key = norm.id || (norm.name + '|' + norm.message);
      if (seen[key]) continue;
      seen[key] = true;
      combined.push(norm);
    }
    combined.sort(function (a, b) {
      var ta = Date.parse(a.createdAt || '');
      var tb = Date.parse(b.createdAt || '');
      var na = isFinite(ta) ? ta : 0;
      var nb = isFinite(tb) ? tb : 0;
      return nb - na;
    });
    return combined;
  }

  function getDemoWishes() {
    var stored = readStorage(STORAGE_WISHES, memoryWishes);
    var samples = getSampleWishes();
    return mergeAndSortWishes(stored.concat(samples));
  }

  function buildWishesUrl(scriptUrl) {
    if (typeof win.URL === 'function') {
      var u = new win.URL(scriptUrl);
      u.searchParams.set('action', 'wishes');
      u.searchParams.set('limit', String(DEFAULT_WISH_LIMIT));
      return u.toString();
    }
    var sep = scriptUrl.indexOf('?') === -1 ? '?' : '&';
    return scriptUrl + sep + 'action=wishes&limit=' + DEFAULT_WISH_LIMIT;
  }

  function fetchJsonWithTimeout(url, options, timeoutMs) {
    if (typeof win.fetch !== 'function') {
      return Promise.resolve({
        ok: false,
        errorType: 'unsupported',
        error: 'Trình duyệt không hỗ trợ gửi yêu cầu mạng.'
      });
    }

    var controller = (typeof win.AbortController === 'function') ? new win.AbortController() : null;
    var timedOut = false;
    var timer = 0;

    if (controller) {
      options.signal = controller.signal;
      timer = win.setTimeout(function () {
        timedOut = true;
        try {
          controller.abort();
        } catch (_) {}
      }, timeoutMs);
    }

    function clearTimer() {
      if (timer) {
        win.clearTimeout(timer);
        timer = 0;
      }
    }

    return win.fetch(url, options).then(function (res) {
      return res.text().then(function (text) {
        clearTimer();
        var data = null;
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (_) {
            data = null;
          }
        }
        if (!res.ok) {
          var httpMsg = (data && typeof data === 'object' && (data.message || data.error))
            ? safeText(data.message || data.error).trim()
            : 'Không thể kết nối tới Google Sheets lúc này, bạn thử lại nhé.';
          return {
            ok: false,
            status: res.status,
            data: data,
            errorType: 'http',
            error: httpMsg
          };
        }
        if (!data || typeof data !== 'object') {
          return {
            ok: false,
            status: res.status,
            data: null,
            errorType: 'parse',
            error: 'Phản hồi từ Google Sheets không hợp lệ.'
          };
        }
        return {
          ok: true,
          status: res.status,
          data: data
        };
      });
    }).catch(function (err) {
      clearTimer();
      var isTimeout = timedOut || (err && err.name === 'AbortError');
      return {
        ok: false,
        errorType: isTimeout ? 'timeout' : 'network',
        error: isTimeout
          ? 'Kết nối tới Google Sheets bị quá thời gian, bạn thử lại nhé.'
          : 'Không thể kết nối tới Google Sheets lúc này, bạn thử lại nhé.'
      };
    });
  }

  function coerceAttending(raw) {
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'number') return raw !== 0;
    var s = safeText(raw).trim().toLowerCase();
    if (s === 'false' || s === 'no' || s === '0' || s === 'không' || s === 'khong' || s === 'không tham dự') {
      return false;
    }
    return true;
  }

  function loadWishes() {
    var settings = getSheetsSettings();
    if (!isValidScriptUrl(settings.scriptUrl)) {
      return Promise.resolve({
        ok: true,
        mode: 'demo',
        wishes: getDemoWishes()
      });
    }

    var url = buildWishesUrl(settings.scriptUrl);
    return fetchJsonWithTimeout(url, {
      method: 'GET',
      redirect: 'follow'
    }, settings.timeoutMs).then(function (result) {
      if (result.ok && result.data && result.data.ok === true && Array.isArray(result.data.wishes)) {
        return {
          ok: true,
          mode: 'sheets',
          wishes: mergeAndSortWishes(result.data.wishes)
        };
      }

      var errMsg = (result.data && typeof result.data === 'object' && (result.data.message || result.data.error))
        ? safeText(result.data.message || result.data.error).trim()
        : (result.error || 'Không thể tải lời chúc từ Google Sheets.');

      if (settings.fallbackToDemo) {
        return {
          ok: false,
          mode: 'demo',
          wishes: getDemoWishes(),
          error: errMsg
        };
      }
      return {
        ok: false,
        mode: 'sheets',
        wishes: [],
        error: errMsg
      };
    });
  }

  function submitWish(payload) {
    var p = (payload && typeof payload === 'object') ? payload : {};
    var name = safeText(p.name).trim();
    var relation = safeText(p.relation).trim();
    var message = safeText(p.message).trim();
    var website = safeText(p.website).trim();

    var settings = getSheetsSettings();
    var configured = isValidScriptUrl(settings.scriptUrl);
    var mode = configured ? 'sheets' : 'demo';

    if (website !== '') {
      return Promise.resolve({
        ok: true,
        mode: mode,
        wish: null,
        message: 'Cảm ơn bạn! Lời chúc đã được gửi tới cô dâu chú rể.'
      });
    }

    if (!name || !message) {
      return Promise.resolve({
        ok: false,
        mode: mode,
        message: 'Bạn nhập tên và lời chúc giúp chúng mình nhé.'
      });
    }

    if (!configured) {
      var demoWish = {
        id: 'demo-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: name,
        relation: relation,
        message: message,
        createdAt: new Date().toISOString()
      };
      var current = readStorage(STORAGE_WISHES, memoryWishes);
      current.unshift(demoWish);
      memoryWishes = current.slice();
      writeStorage(STORAGE_WISHES, current);
      return Promise.resolve({
        ok: true,
        mode: 'demo',
        wish: demoWish,
        message: 'Cảm ơn bạn! Lời chúc đã được gửi tới cô dâu chú rể.'
      });
    }

    var bodyStr = JSON.stringify({
      action: 'wish',
      name: name,
      relation: relation,
      message: message,
      website: ''
    });

    return fetchJsonWithTimeout(settings.scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      redirect: 'follow',
      body: bodyStr
    }, settings.timeoutMs).then(function (result) {
      if (result.ok && result.data && result.data.ok === true) {
        var returnedWish = normalizeWish(result.data.wish, 'sheet-' + Date.now()) || {
          id: 'sheet-' + Date.now(),
          name: name,
          relation: relation,
          message: message,
          createdAt: new Date().toISOString()
        };
        return {
          ok: true,
          mode: 'sheets',
          wish: returnedWish,
          message: safeText(result.data.message).trim() || 'Cảm ơn bạn! Lời chúc đã được gửi tới cô dâu chú rể.'
        };
      }

      var errMsg = (result.data && typeof result.data === 'object' && (result.data.message || result.data.error))
        ? safeText(result.data.message || result.data.error).trim()
        : (result.error || 'Chưa gửi được, bạn thử lại nhé.');

      return {
        ok: false,
        mode: 'sheets',
        message: errMsg
      };
    });
  }

  function submitRsvp(payload) {
    var p = (payload && typeof payload === 'object') ? payload : {};
    var name = safeText(p.name).trim();
    var website = safeText(p.website).trim();
    var hasAttending = p.attending !== undefined && p.attending !== null && safeText(p.attending).trim() !== '';

    var settings = getSheetsSettings();
    var configured = isValidScriptUrl(settings.scriptUrl);
    var mode = configured ? 'sheets' : 'demo';

    if (website !== '') {
      return Promise.resolve({
        ok: true,
        mode: mode,
        message: 'Cảm ơn bạn! Xác nhận của bạn đã được ghi nhận.'
      });
    }

    if (!name || !hasAttending) {
      return Promise.resolve({
        ok: false,
        mode: mode,
        message: 'Vui lòng nhập tên và chọn trạng thái tham dự.'
      });
    }

    var attendingBool = coerceAttending(p.attending);
    var phone = safeText(p.phone).trim();
    var side = safeText(p.side).trim();
    var guests = safeText(p.guests).trim();
    var note = safeText(p.note).trim();
    var answers = (p.answers && typeof p.answers === 'object' && !Array.isArray(p.answers)) ? p.answers : {};

    if (!configured) {
      var rec = {
        name: name,
        attending: attendingBool,
        phone: phone,
        side: side,
        guests: guests,
        note: note,
        answers: answers,
        createdAt: new Date().toISOString()
      };
      var current = readStorage(STORAGE_RSVP, memoryRsvp);
      current.push(rec);
      memoryRsvp = current.slice();
      writeStorage(STORAGE_RSVP, current);
      return Promise.resolve({
        ok: true,
        mode: 'demo',
        message: attendingBool
          ? 'Cảm ơn bạn! Hẹn gặp bạn trong ngày vui.'
          : 'Cảm ơn bạn đã báo cho chúng mình.'
      });
    }

    var bodyStr = JSON.stringify({
      action: 'rsvp',
      name: name,
      attending: attendingBool,
      phone: phone,
      side: side,
      guests: guests,
      note: note,
      answers: answers,
      website: ''
    });

    return fetchJsonWithTimeout(settings.scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      redirect: 'follow',
      body: bodyStr
    }, settings.timeoutMs).then(function (result) {
      if (result.ok && result.data && result.data.ok === true) {
        return {
          ok: true,
          mode: 'sheets',
          message: safeText(result.data.message).trim() || (
            attendingBool
              ? 'Cảm ơn bạn! Hẹn gặp bạn trong ngày vui.'
              : 'Cảm ơn bạn đã báo cho chúng mình.'
          )
        };
      }

      var errMsg = (result.data && typeof result.data === 'object' && (result.data.message || result.data.error))
        ? safeText(result.data.message || result.data.error).trim()
        : (result.error || 'Chưa gửi được, bạn thử lại nhé.');

      return {
        ok: false,
        mode: 'sheets',
        message: errMsg
      };
    });
  }

  win.WeddingSheets = {
    isConfigured: isConfigured,
    loadWishes: loadWishes,
    submitWish: submitWish,
    submitRsvp: submitRsvp
  };
})(window);
