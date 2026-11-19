/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - THIỆP CƯỚI SONG HỶ (RSVP & SỔ LƯU BÚT)
 * ============================================================================
 * Hướng dẫn triển khai nhanh:
 * 1. Mở Google Sheets -> Tiện ích mở rộng (Extensions) -> Apps Script.
 * 2. Dán toàn bộ nội dung file này vào Code.gs và Lưu (Ctrl+S).
 * 3. Triển khai (Deploy) -> Tùy chọn triển khai mới (New deployment) -> Ứng dụng web (Web app):
 *    - Thực thi dưới dạng (Execute as): Tôi (Me)
 *    - Ai có quyền truy cập (Who has access): Bất kỳ ai (Anyone)
 * 4. Sao chép URL Web App (/exec) và dán vào `googleSheets.scriptUrl` trong `config.js`.
 * ============================================================================
 */

var SCRIPT_VERSION = '1.0';
var SERVICE_NAME = 'thiep-cuoi-sheets';
var RSVP_SHEET_NAME = 'RSVP';
var WISHES_SHEET_NAME = 'Wishes';
var LOCK_TIMEOUT_MS = 10000;
var DEFAULT_WISH_LIMIT = 100;
var MAX_WISH_LIMIT = 200;

var RSVP_HEADERS = ['Timestamp', 'Name', 'Phone', 'Side', 'Attendance', 'Guests', 'Note', 'Answers'];
var WISHES_HEADERS = ['Timestamp', 'Id', 'Name', 'Relation', 'Message', 'Approved'];

function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var rawCallback = params.callback !== undefined && params.callback !== null ? String(params.callback).trim() : '';

  if (rawCallback !== '' && !isValidJsonpCallback_(rawCallback)) {
    return jsonResponse_({
      ok: false,
      error: 'INVALID_CALLBACK',
      message: 'Tham số callback không hợp lệ.'
    });
  }

  var rawAction = params.action !== undefined && params.action !== null ? String(params.action).trim() : '';
  var action = rawAction ? rawAction.toLowerCase() : 'health';

  try {
    if (action === 'health') {
      return respondGet_(handleHealth_(), rawCallback);
    }
    if (action === 'wishes') {
      return respondGet_(handleGetWishes_(params), rawCallback);
    }
    return respondGet_({
      ok: false,
      error: 'INVALID_ACTION',
      message: 'Action không hợp lệ.'
    }, rawCallback);
  } catch (err) {
    return respondGet_({
      ok: false,
      error: 'INTERNAL_ERROR',
      message: 'Không thể xử lý yêu cầu: ' + (err && err.message ? err.message : String(err))
    }, rawCallback);
  }
}

function doPost(e) {
  var parsed = parsePostPayload_(e);
  if (!parsed.ok) {
    return jsonResponse_({
      ok: false,
      error: parsed.error,
      message: parsed.message
    });
  }

  var payload = parsed.data;
  var action = normalizeText_(payload.action, 50).toLowerCase();

  if (action !== 'rsvp' && action !== 'wish') {
    return jsonResponse_({
      ok: false,
      error: 'INVALID_ACTION',
      message: 'Loại yêu cầu (action) phải là "rsvp" hoặc "wish".'
    });
  }

  // Honeypot check: silently ignore bots without acquiring lock or writing rows
  var honeypot = normalizeText_(payload.website, 200);
  if (honeypot !== '') {
    if (action === 'rsvp') {
      return jsonResponse_({
        ok: true,
        type: 'rsvp',
        ignored: true,
        message: 'Cảm ơn bạn! Xác nhận của bạn đã được ghi nhận.',
        createdAt: new Date().toISOString()
      });
    }
    return jsonResponse_({
      ok: true,
      type: 'wish',
      ignored: true,
      wish: null,
      message: 'Cảm ơn bạn! Lời chúc đã được gửi tới cô dâu chú rể.'
    });
  }

  if (action === 'rsvp') {
    return handlePostRsvp_(payload);
  }
  return handlePostWish_(payload);
}

function handleHealth_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rsvpSheet = ss.getSheetByName(RSVP_SHEET_NAME);
  var wishesSheet = ss.getSheetByName(WISHES_SHEET_NAME);

  if (!rsvpSheet || !wishesSheet || rsvpSheet.getLastRow() === 0 || wishesSheet.getLastRow() === 0) {
    var lockRes = withScriptLock_(function () {
      rsvpSheet = ensureSheet_(ss, RSVP_SHEET_NAME, RSVP_HEADERS, [3]);
      wishesSheet = ensureSheet_(ss, WISHES_SHEET_NAME, WISHES_HEADERS, []);
      flushSpreadsheet_(ss);
    });
    if (!lockRes.ok) {
      return lockRes.errorPayload;
    }
  }

  return {
    ok: true,
    service: SERVICE_NAME,
    version: SCRIPT_VERSION,
    sheets: {
      rsvp: {
        exists: Boolean(rsvpSheet),
        name: RSVP_SHEET_NAME,
        count: rsvpSheet ? Math.max(0, rsvpSheet.getLastRow() - 1) : 0
      },
      wishes: {
        exists: Boolean(wishesSheet),
        name: WISHES_SHEET_NAME,
        count: wishesSheet ? Math.max(0, wishesSheet.getLastRow() - 1) : 0
      }
    },
    timestamp: new Date().toISOString()
  };
}

function handleGetWishes_(params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(WISHES_SHEET_NAME);

  if (!sheet || sheet.getLastRow() === 0) {
    var lockRes = withScriptLock_(function () {
      sheet = ensureSheet_(ss, WISHES_SHEET_NAME, WISHES_HEADERS, []);
      flushSpreadsheet_(ss);
    });
    if (!lockRes.ok) {
      return lockRes.errorPayload;
    }
  }

  var rawLimit = Number(params.limit);
  var limit = (isFinite(rawLimit) && rawLimit > 0)
    ? Math.min(MAX_WISH_LIMIT, Math.max(1, Math.floor(rawLimit)))
    : DEFAULT_WISH_LIMIT;

  if (!sheet || sheet.getLastRow() <= 1) {
    return { ok: true, wishes: [] };
  }

  var values = sheet.getDataRange().getValues();
  var items = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row || !row.length) continue;

    if (!isWishApproved_(row[5])) continue;

    var createdAt = serializeTimestamp_(row[0]);
    var id = row[1] !== undefined && row[1] !== null ? String(row[1]).trim() : '';
    var name = row[2] !== undefined && row[2] !== null ? String(row[2]).trim() : '';
    var relation = row[3] !== undefined && row[3] !== null ? String(row[3]).trim() : '';
    var message = row[4] !== undefined && row[4] !== null ? String(row[4]).trim() : '';

    if (!name && !message) continue;

    items.push({
      id: id || ('row-' + (i + 1)),
      name: name,
      relation: relation,
      message: message,
      createdAt: createdAt,
      _row: i
    });
  }

  items.sort(function (a, b) {
    var ta = Date.parse(a.createdAt || '');
    var tb = Date.parse(b.createdAt || '');
    var na = isFinite(ta) ? ta : 0;
    var nb = isFinite(tb) ? tb : 0;
    if (nb !== na) return nb - na;
    return b._row - a._row;
  });

  var result = [];
  var count = Math.min(limit, items.length);
  for (var j = 0; j < count; j++) {
    result.push({
      id: items[j].id,
      name: items[j].name,
      relation: items[j].relation,
      message: items[j].message,
      createdAt: items[j].createdAt
    });
  }

  return {
    ok: true,
    wishes: result
  };
}

function handlePostRsvp_(payload) {
  var name = normalizeText_(payload.name, 120);
  var rawAttending = (payload.attending !== undefined && payload.attending !== null && String(payload.attending).trim() !== '')
    ? payload.attending
    : payload.attendance;

  if (!name) {
    return jsonResponse_({
      ok: false,
      error: 'VALIDATION_ERROR',
      message: 'Vui lòng nhập tên của bạn.'
    });
  }

  var attParsed = parseAttending_(rawAttending);
  if (!attParsed.valid) {
    return jsonResponse_({
      ok: false,
      error: 'VALIDATION_ERROR',
      message: 'Vui lòng chọn trạng thái tham dự hợp lệ.'
    });
  }

  var parsedAnswers = parseAnswersObject_(payload.answers);
  var phone = normalizeText_(payload.phone, 40);
  var side = normalizeText_(payload.side, 100) || (parsedAnswers && normalizeText_(parsedAnswers.side, 100)) || '';
  var guests = normalizeText_(payload.guests, 100) || (parsedAnswers && normalizeText_(parsedAnswers.guests, 100)) || '';
  var note = normalizeText_(payload.note, 1000);
  var answersText = formatAnswers_(payload.answers, 2000);
  var attendingBool = attParsed.value;
  var attendanceLabel = attendingBool ? 'Có tham dự' : 'Không tham dự';
  var createdAt = new Date().toISOString();

  var lockRes = withScriptLock_(function () {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ensureSheet_(ss, RSVP_SHEET_NAME, RSVP_HEADERS, [3]);
    sheet.appendRow([
      createdAt,
      escapeFormula_(name),
      escapeFormula_(phone),
      escapeFormula_(side),
      attendanceLabel,
      escapeFormula_(guests),
      escapeFormula_(note),
      escapeFormula_(answersText)
    ]);
    flushSpreadsheet_(ss);
  });

  if (!lockRes.ok) {
    return jsonResponse_(lockRes.errorPayload);
  }

  return jsonResponse_({
    ok: true,
    type: 'rsvp',
    attending: attendingBool,
    message: attendingBool
      ? 'Cảm ơn bạn! Hẹn gặp bạn trong ngày vui.'
      : 'Cảm ơn bạn đã báo cho chúng mình.',
    createdAt: createdAt
  });
}

function handlePostWish_(payload) {
  var name = normalizeText_(payload.name, 100);
  var relation = normalizeText_(payload.relation, 100);
  var message = normalizeText_(payload.message, 1000);

  if (!name || !message) {
    return jsonResponse_({
      ok: false,
      error: 'VALIDATION_ERROR',
      message: 'Vui lòng nhập tên và lời chúc của bạn.'
    });
  }

  var wishId = generateWishId_();
  var createdAt = new Date().toISOString();

  var lockRes = withScriptLock_(function () {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ensureSheet_(ss, WISHES_SHEET_NAME, WISHES_HEADERS, []);
    sheet.appendRow([
      createdAt,
      wishId,
      escapeFormula_(name),
      escapeFormula_(relation),
      escapeFormula_(message),
      true
    ]);
    flushSpreadsheet_(ss);
  });

  if (!lockRes.ok) {
    return jsonResponse_(lockRes.errorPayload);
  }

  return jsonResponse_({
    ok: true,
    type: 'wish',
    wish: {
      id: wishId,
      name: name,
      relation: relation,
      message: message,
      createdAt: createdAt
    },
    message: 'Cảm ơn bạn! Lời chúc đã được gửi tới cô dâu chú rể.'
  });
}

/* --------------------------------------------------------------------------
   Helpers: Sheet Creation, Locking, Parsing, Sanitization, Output
   -------------------------------------------------------------------------- */

function withScriptLock_(fn) {
  var lock = (typeof LockService !== 'undefined' && LockService && typeof LockService.getScriptLock === 'function')
    ? LockService.getScriptLock()
    : null;
  var hasLock = false;

  if (lock) {
    hasLock = Boolean(lock.tryLock(LOCK_TIMEOUT_MS));
    if (!hasLock) {
      return {
        ok: false,
        errorPayload: {
          ok: false,
          error: 'SERVER_BUSY',
          message: 'Hệ thống đang bận, vui lòng thử lại sau giây lát.'
        }
      };
    }
  }

  try {
    fn();
    return { ok: true };
  } finally {
    if (lock && hasLock) {
      try {
        lock.releaseLock();
      } catch (_) {}
    }
  }
}

function ensureSheet_(ss, sheetName, headers, textColumnIndices) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initSheetHeaders_(sheet, headers, textColumnIndices);
    return sheet;
  }
  if (sheet.getLastRow() === 0 && headers && headers.length) {
    initSheetHeaders_(sheet, headers, textColumnIndices);
  }
  return sheet;
}

function initSheetHeaders_(sheet, headers, textColumnIndices) {
  sheet.appendRow(headers);
  if (typeof sheet.setFrozenRows === 'function') {
    sheet.setFrozenRows(1);
  }
  if (typeof sheet.getRange === 'function') {
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    if (headerRange) {
      if (typeof headerRange.setFontWeight === 'function') headerRange.setFontWeight('bold');
      if (typeof headerRange.setBackground === 'function') headerRange.setBackground('#6d1a24');
      if (typeof headerRange.setFontColor === 'function') headerRange.setFontColor('#f6ecdf');
    }
    if (Array.isArray(textColumnIndices) && textColumnIndices.length && typeof sheet.getMaxRows === 'function') {
      var maxRows = sheet.getMaxRows();
      if (maxRows > 1) {
        for (var i = 0; i < textColumnIndices.length; i++) {
          var colRange = sheet.getRange(2, textColumnIndices[i], maxRows - 1, 1);
          if (colRange && typeof colRange.setNumberFormat === 'function') {
            colRange.setNumberFormat('@');
          }
        }
      }
    }
  }
}

function flushSpreadsheet_(ss) {
  if (ss && typeof ss.flush === 'function') {
    ss.flush();
  } else if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp && typeof SpreadsheetApp.flush === 'function') {
    SpreadsheetApp.flush();
  }
}

function parsePostPayload_(e) {
  if (!e) {
    return { ok: false, error: 'EMPTY_BODY', message: 'Không nhận được dữ liệu gửi lên.' };
  }

  var hasPostContents = e.postData && typeof e.postData.contents === 'string' && e.postData.contents.trim() !== '';
  if (hasPostContents) {
    try {
      var json = JSON.parse(e.postData.contents);
      if (json && typeof json === 'object' && !Array.isArray(json)) {
        return { ok: true, data: json };
      }
      return { ok: false, error: 'INVALID_JSON', message: 'Payload JSON phải là một đối tượng.' };
    } catch (jsonErr) {
      // Allow form-urlencoded fallback if e.parameter was populated by GAS
      if (e.parameter && typeof e.parameter === 'object') {
        if (typeof e.parameter.payload === 'string' && e.parameter.payload.trim() !== '') {
          try {
            var nested = JSON.parse(e.parameter.payload);
            if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
              return { ok: true, data: nested };
            }
          } catch (_) {}
        }
        if (e.parameter.action) {
          return { ok: true, data: e.parameter };
        }
      }
      return { ok: false, error: 'INVALID_JSON', message: 'Dữ liệu JSON không hợp lệ.' };
    }
  }

  if (e.parameter && typeof e.parameter === 'object') {
    if (typeof e.parameter.payload === 'string' && e.parameter.payload.trim() !== '') {
      try {
        var paramJson = JSON.parse(e.parameter.payload);
        if (paramJson && typeof paramJson === 'object' && !Array.isArray(paramJson)) {
          return { ok: true, data: paramJson };
        }
      } catch (_) {
        return { ok: false, error: 'INVALID_JSON', message: 'Dữ liệu payload không hợp lệ.' };
      }
    }
    if (Object.keys(e.parameter).length > 0) {
      return { ok: true, data: e.parameter };
    }
  }

  return { ok: false, error: 'EMPTY_BODY', message: 'Không nhận được dữ liệu gửi lên.' };
}

function normalizeText_(val, maxLen) {
  if (val === undefined || val === null) return '';
  var s = String(val)
    .replace(/\u0000/g, '')
    .replace(/\r\n/g, '\n')
    .trim();
  if (maxLen && s.length > maxLen) {
    s = s.slice(0, maxLen);
  }
  return s;
}

function escapeFormula_(text) {
  if (text === undefined || text === null) return '';
  var s = String(text);
  if (s === '') return '';
  if (/^[=+\-@\t\r]/.test(s)) {
    return "'" + s;
  }
  return s;
}

function parseAttending_(raw) {
  if (raw === undefined || raw === null) return { valid: false };
  if (typeof raw === 'boolean') return { valid: true, value: raw };
  if (typeof raw === 'number') {
    if (raw === 1) return { valid: true, value: true };
    if (raw === 0) return { valid: true, value: false };
    return { valid: false };
  }
  var s = String(raw).trim().toLowerCase();
  if (!s) return { valid: false };
  if (s === 'true' || s === 'yes' || s === '1' || s === 'có' || s === 'co' || s === 'tham dự') {
    return { valid: true, value: true };
  }
  if (s === 'false' || s === 'no' || s === '0' || s === 'không' || s === 'khong' || s === 'không tham dự') {
    return { valid: true, value: false };
  }
  return { valid: false };
}

function parseAnswersObject_(raw) {
  if (!raw) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    var trimmed = raw.trim();
    if (trimmed.charAt(0) === '{') {
      try {
        var obj = JSON.parse(trimmed);
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
      } catch (_) {}
    }
  }
  return null;
}

function formatAnswers_(raw, maxLen) {
  if (raw === undefined || raw === null || raw === '') return '';
  var val = raw;

  if (typeof val === 'string') {
    var trimmed = val.trim();
    if (!trimmed) return '';
    if (trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[') {
      try {
        val = JSON.parse(trimmed);
      } catch (_) {
        return normalizeText_(trimmed, maxLen);
      }
    } else {
      return normalizeText_(trimmed, maxLen);
    }
  }

  if (Array.isArray(val)) {
    var listParts = [];
    for (var i = 0; i < val.length; i++) {
      var itemStr = normalizeText_(val[i], 500);
      if (itemStr) listParts.push(itemStr);
    }
    return normalizeText_(listParts.join('; '), maxLen);
  }

  if (typeof val === 'object') {
    var keys = Object.keys(val);
    var pairs = [];
    for (var k = 0; k < keys.length; k++) {
      var key = normalizeText_(keys[k], 100);
      var rawV = val[keys[k]];
      var vStr = (rawV && typeof rawV === 'object')
        ? normalizeText_(JSON.stringify(rawV), 500)
        : normalizeText_(rawV, 500);
      if (key && vStr) {
        pairs.push(key + ': ' + vStr);
      }
    }
    return normalizeText_(pairs.join('; '), maxLen);
  }

  return normalizeText_(val, maxLen);
}

function isWishApproved_(val) {
  if (val === undefined || val === null || val === '') return true;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  var s = String(val).trim().toUpperCase();
  return s === '' || s === 'TRUE' || s === 'YES' || s === '1';
}

function serializeTimestamp_(val) {
  if (val === undefined || val === null || val === '') return '';
  if (Object.prototype.toString.call(val) === '[object Date]') {
    return isNaN(val.getTime()) ? '' : val.toISOString();
  }
  return String(val).trim();
}

function generateWishId_() {
  if (typeof Utilities !== 'undefined' && Utilities && typeof Utilities.getUuid === 'function') {
    return 'w-' + Utilities.getUuid();
  }
  return 'w-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
}

function isValidJsonpCallback_(cb) {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]{0,63}$/.test(cb);
}

function respondGet_(data, callbackName) {
  if (callbackName && isValidJsonpCallback_(callbackName)) {
    return ContentService
      .createTextOutput(callbackName + '(' + JSON.stringify(data) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonResponse_(data);
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
