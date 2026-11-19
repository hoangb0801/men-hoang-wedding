/**
 * Dynamic Config Loader & DOM Binder (Pure Vanilla JS, zero-build)
 * Merges window.WEDDING_CONFIG with DEFAULT_CONFIG, resolves ?kinhmoi= guest personalization,
 * builds dynamic calendar / ICS / album / ceremonies / schedule / gifts / dresscode / RSVP questions,
 * and exposes window.WeddingConfig = { get(), getGuestName() }.
 */
(function (win, doc) {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  var DEFAULT_CONFIG = {
    meta: {
      title: 'Minh Hoàng & Trần Mến',
      description: 'Trân trọng kính mời bạn đến chung vui cùng chúng tôi trong ngày trọng đại!',
      lang: 'vi'
    },
    couple: {
      brideShort: 'Minh Hoàng',
      groomShort: 'Trần Mến',
      brideFull: 'Minh Hoàng',
      groomFull: 'Trần Mến',
      monogram: 'HM',
      displayOrder: 'bride-first',
      greetingPrefix: 'Trân trọng kính mời:',
      defaultGuestName: 'Quý khách',
      quote: 'Love makes\neverything beautiful.',
      coverPhoto: './assets/photos/cover.png'
    },
    families: {
      sectionTitle: 'Thông tin lễ cưới',
      prelude: 'Hai mái nhà, một gia đình',
      welcomeLine: 'Chúng tôi rất hân hạnh được đón tiếp bạn trong ngày vui của gia đình.',
      brideSide: {
        title: 'Nhà trai',
        father: 'Ông: Bùi Ngọc Ánh',
        mother: 'Bà: Đào Thị Sen',
        address: 'Khu 5 , Tứ Trưng, Vĩnh Tường, Vĩnh Phúc'
      },
      groomSide: {
        title: 'Nhà gái',
        father: 'Ông: Trần Văn Hải',
        mother: 'Bà: Bùi Thị Lên',
        address: '02 ngách 12 ngõ 563 Thọ Sơn, Đại Nghĩa, Mỹ Đức, Hà Nội'
      }
    },
    announce: {
      eyebrow: 'Kính mời tham dự tiệc chung vui của gia đình chúng tôi',
      day: '27',
      monthYear: 'tháng 11 năm 2026',
      timeText: 'Vào lúc 16:00, Thứ Sáu',
      lunarDate: '( Tức ngày 19 tháng 10 năm Bính Ngọ )',
      receptionTime: 'Đón khách: 16:00',
      venueName: '',
      address: 'Gần cổng chợ Rưng, Khu 5 , Tứ Trưng, Vĩnh Tường, Vĩnh Phúc',
      mapLabel: 'Chỉ đường',
      mapUrl: 'https://maps.app.goo.gl/4ki7YdR6wDFitKFh7'
    },
    ceremonies: [
      {
        title: 'Lễ thành hôn (nhà trai)',
        timeText: '11:05 · Thứ Bảy, 28 tháng 11, 2026',
        address: 'Khu 5 , Tứ Trưng, Vĩnh Tường, Vĩnh Phúc',
        note: 'Ngày chung đôi của chúng mình ❤️'
      },
      {
        title: 'Lễ vu quy (nhà gái)',
        timeText: '08:00 · Thứ Bảy, 28 tháng 11, 2026',
        address: '02 ngách 12 ngõ 563 Thọ Sơn, Đại Nghĩa, Mỹ Đức, HN',
        note: 'Ngày chung đôi của chúng mình ❤️'
      }
    ],
    countdown: {
      targetIso: '2026-11-28T08:00:00+07:00',
      targetTimeLabel: 'Đếm ngược tới ngày cưới'
    },
    calendar: {
      year: 2026,
      month: 11,
      highlightDay: 28,
      weekStartsOn: 'CN',
      googleEvent: {
        title: 'Đám cưới Minh Hoàng & Trần Mến',
        startUtc: '20261128T010000Z',
        endUtc: '20261128T040000Z',
        details: '',
        location: 'Khu 5 , Tứ Trưng, Vĩnh Tường, Vĩnh Phúc'
      },
      icsFileName: 'Đám cưới Minh Hoàng & Trần Mến.ics'
    },
    schedule: {
      enabled: false,
      title: 'Lịch trình buổi lễ',
      items: [
        {
          time: '08:00',
          title: 'Lễ vu quy (nhà gái)',
          description: 'Làm lễ gia tiên tại tư gia nhà gái'
        },
        {
          time: '11:05',
          title: 'Lễ thành hôn (nhà trai)',
          description: 'Đón dâu và cử hành lễ thành hôn tại nhà trai'
        },
        {
          time: '16:00',
          title: 'Đón khách',
          description: 'Chụp ảnh lưu niệm cùng gia đình và bạn bè'
        },
        {
          time: '17:30',
          title: 'Tiệc mừng',
          description: 'Khai tiệc chung vui cùng hai gia đình'
        }
      ]
    },
    story: {
      enabled: false,
      eyebrow: 'Câu chuyện của chúng tôi',
      headline: 'Và những ngày sau,\nvẫn cùng nhau.',
      body: 'Từ những lần gặp gỡ tình cờ, đến một hành trình đầy yêu thương. Cảm ơn vì đã luôn ở đây, cùng nhau viết tiếp những chương mới.',
      portraitPhoto: './assets/photos/anh-cuoi-can-canh.avif',
      snapshotPhoto: './assets/photos/anh-cuoi-tung-hoa.avif',
      linkLabel: 'Chi tiết'
    },
    album: {
      title: 'Album ảnh cưới',
      caption: 'Những khoảnh khắc chúng mình muốn giữ mãi.',
      photos: [
        { src: './assets/photos/gallery-01.png', alt: 'Ảnh cưới 1' },
        { src: './assets/photos/gallery-02.png', alt: 'Ảnh cưới 2' },
        { src: './assets/photos/gallery-03.png', alt: 'Ảnh cưới 3' },
        { src: './assets/photos/gallery-04.png', alt: 'Ảnh cưới 4' },
        { src: './assets/photos/gallery-05.png', alt: 'Ảnh cưới 5' },
        { src: './assets/photos/gallery-06.png', alt: 'Ảnh cưới 6' },
        { src: './assets/photos/gallery-07.png', alt: 'Ảnh cưới 7' },
        { src: './assets/photos/gallery-08.png', alt: 'Ảnh cưới 8' },
        { src: './assets/photos/gallery-09.png', alt: 'Ảnh cưới 9' },
        { src: './assets/photos/gallery-10.png', alt: 'Ảnh cưới 10' },
        { src: './assets/photos/gallery-11.png', alt: 'Ảnh cưới 11' },
        { src: './assets/photos/gallery-12.png', alt: 'Ảnh cưới 12' },
        { src: './assets/photos/gallery-13.png', alt: 'Ảnh cưới 13' },
        { src: './assets/photos/gallery-14.png', alt: 'Ảnh cưới 14' },
        { src: './assets/photos/gallery-15.png', alt: 'Ảnh cưới 15' },
        { src: './assets/photos/gallery-16.png', alt: 'Ảnh cưới 16' }
      ]
    },
    guestbook: {
      enabled: true,
      title: 'Sổ lưu bút',
      subtitle: 'Để lại một lời chúc cho cô dâu chú rể nhé.',
      namePlaceholder: 'Nhập tên của bạn*',
      messagePlaceholder: 'Nhập lời chúc của bạn*',
      submitLabel: 'Gửi lời chúc',
      suggestLabel: 'Gợi ý một lời chúc',
      suggestedWishes: [
        'Chúc hai bạn trăm năm hạnh phúc, mãi yêu thương như ngày đầu!',
        'Chúc hai bạn luôn nắm tay nhau qua mọi chặng đường.',
        'Mừng ngày trọng đại! Chúc hai bạn cười nhiều hơn giận, yêu nhiều hơn mỗi ngày.',
        'Chúc gia đình nhỏ luôn ấm áp, bình an và tràn đầy tiếng cười.'
      ],
      sampleWishes: [
        {
          id: 'sample-1',
          name: 'Okela',
          relation: 'Bạn thân chú rể',
          message: 'Chúc 2 bạn mãi yêu nhau, đầu bạc răng long!',
          createdAt: '2026-11-04T13:44:00+07:00'
        }
      ]
    },
    rsvp: {
      enabled: true,
      title: 'Xác nhận tham dự',
      intro: 'Cô dâu chú rể rất mong được đón bạn. Hãy cho chúng mình biết bạn có đến được không nhé.',
      namePlaceholder: 'Nhập tên của bạn*',
      attendYesLabel: 'Mình sẽ đến',
      attendNoLabel: 'Rất tiếc, mình không đến được',
      submitLabel: 'Gửi xác nhận',
      customQuestions: []
    },
    gifts: {
      enabled: false,
      title: 'Hộp mừng cưới',
      subtitle: 'Nếu không tới dự được, bạn có thể gửi lời chúc qua đây.',
      accounts: [
        {
          id: 'groom',
          roleLabel: 'Chú rể',
          bankName: 'Vietcombank',
          accountHolder: 'BUI MINH HOANG',
          accountNumber: '0123456789',
          qrImage: './assets/qr/groom-qr.png',
          vietQrBankBin: '',
          addInfo: 'Mung cuoi Minh Hoang & Tran Men'
        },
        {
          id: 'bride',
          roleLabel: 'Cô dâu',
          bankName: 'Vietcombank',
          accountHolder: 'TRAN THI MEN',
          accountNumber: '9876543210',
          qrImage: './assets/qr/bride-qr.png',
          vietQrBankBin: '',
          addInfo: 'Mung cuoi Minh Hoang & Tran Men'
        }
      ]
    },
    dressCode: {
      enabled: false,
      title: 'Dresscode',
      description: 'Sắc đỏ rượu vang, ngà và kem',
      colors: [
        { name: 'Đỏ rượu vang', hex: '#6d1a24' },
        { name: 'Ngà ấm', hex: '#e9dfd1' },
        { name: 'Kem giấy dó', hex: '#f8f3ec' }
      ]
    },
    keepsake: {
      photo: './assets/photos/keepsake.png',
      caption: 'A lifetime\nof love, in every detail.'
    },
    closing: {
      scriptTitle: 'Thank you',
      message: 'Cảm ơn bạn đã đến và cùng chúng mình viết nên một phần thật đẹp trong ngày đặc biệt này.',
      dateText: '27.11.2026'
    },
    music: {
      enabled: true,
      src: './assets/audio/ido911.mp3',
      volume: 0.3,
      startSec: 0,
      endSec: 0,
      label: 'I Do - 911'
    },
    behavior: {
      enableGateOpening: true,
      autoScroll: true,
      enableFallingPetals: true,
      guestQueryParam: 'kinhmoi'
    },
    googleSheets: {
      scriptUrl: '',
      timeoutMs: 10000,
      fallbackToDemo: true,
      demoNotice: 'Chế độ xem trước (Demo): Dữ liệu đang lưu tạm trên trình duyệt này. Xem HUONG_DAN_CAI_DAT.md để kết nối Google Sheets thực tế.'
    }
  };

  function isPlainObject(val) {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
  }

  function cloneValue(val) {
    if (Array.isArray(val)) {
      return val.map(cloneValue);
    }
    if (isPlainObject(val)) {
      var copy = {};
      Object.keys(val).forEach(function (key) {
        copy[key] = cloneValue(val[key]);
      });
      return copy;
    }
    return val;
  }

  function deepMerge(defaults, overrides) {
    var result = cloneValue(defaults);
    if (!isPlainObject(overrides)) return result;
    Object.keys(overrides).forEach(function (key) {
      var val = overrides[key];
      if (val === undefined || val === null) return;
      if (Array.isArray(val)) {
        result[key] = cloneValue(val);
      } else if (isPlainObject(val) && isPlainObject(result[key])) {
        result[key] = deepMerge(result[key], val);
      } else {
        result[key] = cloneValue(val);
      }
    });
    return result;
  }

  function str(val) {
    return val === undefined || val === null ? '' : String(val);
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function noBreak(text) {
    return str(text).trim().replace(/\s+/g, '\u00A0');
  }

  function sanitizeUrl(raw) {
    var url = str(raw).replace(/[\u0000-\u001F\u007F]/g, '').trim();
    if (!url) return '';
    if (/^\/\/|^\/\\|^\\\\/.test(url)) return '';
    if (/^(\.\/|\.\.\/|\/)/.test(url)) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (/^data:image\/(png|jpeg|jpg|webp|avif|gif|svg\+xml);/i.test(url)) return url;
    if (/^data:text\/calendar;/i.test(url)) return url;
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return url;
    return '';
  }

  function sanitizeColor(raw) {
    var c = str(raw).trim();
    if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(c)) {
      return c;
    }
    return '#6d1a24';
  }

  function sanitizeGuestName(raw) {
    if (typeof raw !== 'string') return '';
    return raw
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
  }

  function deriveMonogram(couple) {
    var b = str(couple.brideShort).trim();
    var g = str(couple.groomShort).trim();
    var bChar = b ? b.split(/\s+/).pop().charAt(0).toUpperCase() : '';
    var gChar = g ? g.split(/\s+/).pop().charAt(0).toUpperCase() : '';
    return (bChar + gChar) || 'MH';
  }

  function resolveGiftQr(acc) {
    var qr = sanitizeUrl(acc.qrImage);
    var bin = str(acc.vietQrBankBin).trim();
    var num = str(acc.accountNumber).trim();
    if (bin && num && !qr) {
      return 'https://img.vietqr.io/image/' +
        encodeURIComponent(bin) + '-' + encodeURIComponent(num) +
        '-qr_only.png?addInfo=' + encodeURIComponent(str(acc.addInfo)) +
        '&accountName=' + encodeURIComponent(str(acc.accountHolder));
    }
    if (qr) return qr;
    return '';
  }

  function normalizeConfig(raw, merged) {
    var rawFam = isPlainObject(raw) && isPlainObject(raw.families) ? raw.families : null;
    if (rawFam) {
      if (rawFam.brideSide === null || rawFam.brideSide === false) {
        merged.families.brideSide = null;
      }
      if (rawFam.groomSide === null || rawFam.groomSide === false) {
        merged.families.groomSide = null;
      }
    }

    merged.couple.displayOrder = merged.couple.displayOrder === 'groom-first' ? 'groom-first' : 'bride-first';
    merged.couple.monogram = str(merged.couple.monogram).trim() || deriveMonogram(merged.couple);

    var y = Number(merged.calendar.year);
    merged.calendar.year = Number.isInteger(y) && y >= 1900 && y <= 2200 ? y : 2026;
    var m = Number(merged.calendar.month);
    merged.calendar.month = Number.isInteger(m) && m >= 1 && m <= 12 ? m : 11;
    var hd = Number(merged.calendar.highlightDay);
    merged.calendar.highlightDay = Number.isInteger(hd) ? hd : 28;
    merged.calendar.weekStartsOn = merged.calendar.weekStartsOn === 'T2' ? 'T2' : 'CN';

    var vol = Number(merged.music.volume);
    merged.music.volume = isFinite(vol) ? Math.min(1, Math.max(0, vol)) : 0.3;
    var sSec = Number(merged.music.startSec);
    merged.music.startSec = isFinite(sSec) && sSec >= 0 ? sSec : 0;
    var eSec = Number(merged.music.endSec);
    merged.music.endSec = isFinite(eSec) && eSec > merged.music.startSec ? eSec : 0;

    merged.behavior.guestQueryParam = str(merged.behavior.guestQueryParam).trim() || 'kinhmoi';

    if (!Array.isArray(merged.ceremonies)) merged.ceremonies = [];
    if (!Array.isArray(merged.schedule.items)) merged.schedule.items = [];
    if (!Array.isArray(merged.album.photos)) merged.album.photos = [];
    if (!Array.isArray(merged.guestbook.suggestedWishes)) merged.guestbook.suggestedWishes = [];
    if (!Array.isArray(merged.guestbook.sampleWishes)) merged.guestbook.sampleWishes = [];
    if (!Array.isArray(merged.rsvp.customQuestions)) merged.rsvp.customQuestions = [];
    if (!Array.isArray(merged.dressCode.colors)) merged.dressCode.colors = [];

    if (!Array.isArray(merged.gifts.accounts)) {
      merged.gifts.accounts = [];
    } else {
      merged.gifts.accounts = merged.gifts.accounts
        .filter(function (a) { return isPlainObject(a); })
        .map(function (acc) {
          var copy = cloneValue(acc);
          copy.resolvedQr = resolveGiftQr(copy);
          return copy;
        });
    }

    return merged;
  }

  function readQueryParam(paramName) {
    var search = win.location && win.location.search ? win.location.search : '';
    if (!search) return '';
    try {
      if (typeof URLSearchParams === 'function') {
        var val = new URLSearchParams(search).get(paramName);
        return typeof val === 'string' ? val : '';
      }
    } catch (_) { }
    var query = search.charAt(0) === '?' ? search.slice(1) : search;
    var parts = query.split('&');
    for (var i = 0; i < parts.length; i++) {
      var eq = parts[i].indexOf('=');
      var k = eq === -1 ? parts[i] : parts[i].slice(0, eq);
      var v = eq === -1 ? '' : parts[i].slice(eq + 1);
      try {
        if (decodeURIComponent(k.replace(/\+/g, ' ')) === paramName) {
          return decodeURIComponent(v.replace(/\+/g, ' '));
        }
      } catch (_) { }
    }
    return '';
  }

  function createSvgEl(tag, attrs) {
    var el = doc.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        el.setAttribute(k, attrs[k]);
      });
    }
    return el;
  }

  function createHeartSvg() {
    var svg = createSvgEl('svg', {
      width: '24',
      height: '24',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
      'data-calendar-heart': 'true'
    });
    svg.appendChild(createSvgEl('path', {
      d: 'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5'
    }));
    return svg;
  }

  function renderCalendarTable(tableEl, calCfg) {
    if (!tableEl) return;
    var year = calCfg.year;
    var month = calCfg.month;
    var highlightDay = calCfg.highlightDay;
    var weekStartsOn = calCfg.weekStartsOn === 'T2' ? 'T2' : 'CN';
    var headers = weekStartsOn === 'T2'
      ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
      : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    var firstDow = new Date(year, month - 1, 1).getDay();
    var leading = weekStartsOn === 'T2' ? (firstDow + 6) % 7 : firstDow;
    var daysInMonth = new Date(year, month, 0).getDate();
    var totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;

    while (tableEl.firstChild) {
      tableEl.removeChild(tableEl.firstChild);
    }

    var caption = doc.createElement('caption');
    caption.textContent = 'tháng ' + month + ' năm ' + year;
    tableEl.appendChild(caption);

    var thead = doc.createElement('thead');
    var headRow = doc.createElement('tr');
    headers.forEach(function (label) {
      var th = doc.createElement('th');
      th.setAttribute('scope', 'col');
      th.textContent = label;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    tableEl.appendChild(thead);

    var tbody = doc.createElement('tbody');
    var currentRow = null;
    for (var cell = 0; cell < totalCells; cell++) {
      if (cell % 7 === 0) {
        currentRow = doc.createElement('tr');
        tbody.appendChild(currentRow);
      }
      var td = doc.createElement('td');
      var dayNum = cell - leading + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        var emptySpan = doc.createElement('span');
        emptySpan.className = 'sr-only';
        emptySpan.textContent = '\u00A0';
        td.appendChild(emptySpan);
      } else if (dayNum === highlightDay) {
        var wrap = doc.createElement('span');
        wrap.appendChild(createHeartSvg());
        var daySpan = doc.createElement('span');
        daySpan.setAttribute('data-calendar-wedding-day', 'true');
        daySpan.className = 'tabular-nums';
        daySpan.textContent = String(dayNum);
        wrap.appendChild(daySpan);
        var srSpan = doc.createElement('span');
        srSpan.className = 'sr-only';
        srSpan.textContent = 'Ngày cưới';
        wrap.appendChild(srSpan);
        td.appendChild(wrap);
      } else {
        var span = doc.createElement('span');
        span.textContent = String(dayNum);
        td.appendChild(span);
      }
      currentRow.appendChild(td);
    }
    tableEl.appendChild(tbody);
  }

  function escapeIcs(text) {
    return str(text)
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }

  function buildIcsDataUri(calCfg) {
    var ge = calCfg.googleEvent || {};
    var summary = str(ge.title) || 'Đám cưới';
    var dtStart = str(ge.startUtc) || (String(calCfg.year) + pad2(calCfg.month) + pad2(calCfg.highlightDay) + 'T010000Z');
    var dtEnd = str(ge.endUtc) || dtStart;
    var uid = 'songhy-v4-do-burgundy-' + calCfg.year + '-' + pad2(calCfg.month) + '-' + pad2(calCfg.highlightDay) + '@songhy';
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Song Hy//Wedding Invitation//VI',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + dtStart,
      'DTSTART:' + dtStart,
      'DTEND:' + dtEnd,
      'SUMMARY:' + escapeIcs(summary)
    ];
    if (str(ge.details).trim()) {
      lines.push('DESCRIPTION:' + escapeIcs(ge.details));
    }
    if (str(ge.location).trim()) {
      lines.push('LOCATION:' + escapeIcs(ge.location));
    }
    lines.push('END:VEVENT', 'END:VCALENDAR');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'));
  }

  function renderPartnerNames(container, first, second, useSpacesAroundAmp) {
    if (!container) return;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    var s1 = doc.createElement('span');
    s1.setAttribute('data-v4-name', '');
    s1.textContent = noBreak(first);

    var amp = doc.createElement('i');
    amp.textContent = '&';

    var s2 = doc.createElement('span');
    s2.setAttribute('data-v4-name', '');
    s2.textContent = noBreak(second);

    container.appendChild(s1);
    if (useSpacesAroundAmp) container.appendChild(doc.createTextNode(' '));
    container.appendChild(amp);
    if (useSpacesAroundAmp) container.appendChild(doc.createTextNode(' '));
    container.appendChild(s2);
  }

  function bindPhotoContainer(photoBox, src, altText) {
    if (!photoBox) return;
    var img = photoBox.querySelector('img');
    var cleanSrc = sanitizeUrl(src);
    if (!cleanSrc || !img) {
      photoBox.setAttribute('data-v4-empty', '1');
      if (img) {
        img.hidden = true;
        img.removeAttribute('src');
      }
      return;
    }
    photoBox.setAttribute('data-v4-empty', '0');
    img.hidden = false;
    img.alt = str(altText);
    img.onerror = function () {
      photoBox.setAttribute('data-v4-empty', '1');
      img.hidden = true;
    };
    if (img.getAttribute('src') !== cleanSrc) {
      img.src = cleanSrc;
    }
  }

  function formatWishDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ' · ' +
      pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  function applyDomBindings(cfg, guestName, hasCustomGuest) {
    // 1. Document meta
    var isGroomFirst = cfg.couple.displayOrder === 'groom-first';
    var firstShort = isGroomFirst ? cfg.couple.groomShort : cfg.couple.brideShort;
    var secondShort = isGroomFirst ? cfg.couple.brideShort : cfg.couple.groomShort;
    var firstFull = isGroomFirst ? (cfg.couple.groomFull || cfg.couple.groomShort) : (cfg.couple.brideFull || cfg.couple.brideShort);
    var secondFull = isGroomFirst ? (cfg.couple.brideFull || cfg.couple.brideShort) : (cfg.couple.groomFull || cfg.couple.groomShort);
    var pairAlt = str(firstShort).trim() + ' & ' + str(secondShort).trim();

    doc.title = str(cfg.meta.title).trim() || pairAlt;
    if (str(cfg.meta.lang).trim()) {
      doc.documentElement.lang = str(cfg.meta.lang).trim();
    }
    var metaDesc = doc.querySelector('meta[name="description"]');
    if (!metaDesc && doc.head) {
      metaDesc = doc.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      doc.head.appendChild(metaDesc);
    }
    if (metaDesc) {
      metaDesc.setAttribute('content', str(cfg.meta.description));
    }

    // 2. Guest personalization (?kinhmoi=)
    var prefixRaw = str(cfg.couple.greetingPrefix || 'Trân trọng kính mời:').trim();
    var prefixNoColon = prefixRaw.replace(/:\s*$/, '');
    var prefixWithColon = prefixRaw ? (/:$/.test(prefixRaw) ? prefixRaw : prefixRaw + ':') : '';

    var gateGreeting = doc.getElementById('v4g-greeting');
    if (gateGreeting) {
      while (gateGreeting.firstChild) {
        gateGreeting.removeChild(gateGreeting.firstChild);
      }
      var labelSpan = doc.createElement('span');
      if (hasCustomGuest) {
        labelSpan.className = 'gate-greeting-label gate-guest-greeting';
        var pSpan = doc.createElement('span');
        pSpan.textContent = (prefixWithColon || prefixRaw) + ' ';
        var gSpan = doc.createElement('span');
        gSpan.textContent = guestName;
        labelSpan.appendChild(pSpan);
        labelSpan.appendChild(gSpan);
      } else {
        labelSpan.className = 'gate-greeting-label';
        labelSpan.textContent = prefixRaw ? (prefixRaw + ' ' + guestName) : guestName;
      }
      gateGreeting.appendChild(labelSpan);
    }

    var coverGreeting = doc.querySelector('.cover-greeting');
    if (coverGreeting) {
      if (hasCustomGuest) {
        coverGreeting.textContent = prefixWithColon ? (prefixWithColon + ' ' + guestName) : guestName;
      } else {
        coverGreeting.textContent = prefixNoColon || 'Trân trọng kính mời';
      }
    }

    // 3. Couple names, envelope card, monograms, cover photo, quote
    renderPartnerNames(doc.querySelector('.cover-names'), firstShort, secondShort, false);
    renderPartnerNames(doc.querySelector('#v4-announce .announce-names'), firstFull, secondFull, true);
    renderPartnerNames(doc.querySelector('.closing .closing-names'), firstShort, secondShort, true);

    var cardFirst = doc.querySelector('.env-card [data-v4-card-first]');
    var cardSecond = doc.querySelector('.env-card [data-v4-card-second]');
    var cardScripts = doc.querySelectorAll('.env-card .art-script');
    if (cardFirst) cardFirst.textContent = str(firstShort).trim();
    else if (cardScripts[0]) cardScripts[0].textContent = str(firstShort).trim();
    if (cardSecond) cardSecond.textContent = str(secondShort).trim();
    else if (cardScripts[2]) cardScripts[2].textContent = str(secondShort).trim();

    var cardDate = doc.querySelector('.env-card [data-v4-card-date], .env-card .art-numerals');
    if (cardDate) cardDate.textContent = str(cfg.closing.dateText);

    var monograms = doc.querySelectorAll('[data-v4-monogram], .seal-monogram text, .stationery-monogram');
    for (var mi = 0; mi < monograms.length; mi++) {
      monograms[mi].textContent = cfg.couple.monogram;
    }

    var coverPhotoSrc = sanitizeUrl(cfg.couple.coverPhoto) ||
      (cfg.album.photos[0] ? sanitizeUrl(cfg.album.photos[0].src) : '');
    bindPhotoContainer(doc.querySelector('.env-polaroid .photo'), coverPhotoSrc, pairAlt);

    var quoteEl = doc.querySelector('.families .love-quote');
    if (quoteEl) {
      quoteEl.textContent = str(cfg.couple.quote);
      quoteEl.hidden = !str(cfg.couple.quote).trim();
    }

    // 4. Families
    var famTitle = doc.querySelector('.families .chapter-title');
    if (famTitle) famTitle.textContent = str(cfg.families.sectionTitle);

    var famPrelude = doc.querySelector('.families .family-prelude');
    if (famPrelude) {
      famPrelude.textContent = str(cfg.families.prelude);
      famPrelude.hidden = !str(cfg.families.prelude).trim();
    }

    var famGrid = doc.querySelector('.families .family-grid');
    if (famGrid) {
      var sides = [];
      if (isPlainObject(cfg.families.brideSide)) {
        var bs = cfg.families.brideSide;
        if (str(bs.title).trim() || str(bs.father).trim() || str(bs.mother).trim() || str(bs.address).trim()) {
          sides.push({ key: 'bride', data: bs });
        }
      }
      if (isPlainObject(cfg.families.groomSide)) {
        var gs = cfg.families.groomSide;
        if (str(gs.title).trim() || str(gs.father).trim() || str(gs.mother).trim() || str(gs.address).trim()) {
          sides.push({ key: 'groom', data: gs });
        }
      }
      while (famGrid.firstChild) {
        famGrid.removeChild(famGrid.firstChild);
      }
      famGrid.setAttribute('data-count', String(sides.length));
      famGrid.hidden = sides.length === 0;
      sides.forEach(function (entry, idx) {
        var sideDiv = doc.createElement('div');
        sideDiv.className = 'family-side';
        sideDiv.setAttribute('data-shown', 'false');
        sideDiv.setAttribute('data-family', entry.key);
        if (idx === 1) {
          sideDiv.style.transitionDelay = '120ms';
        }
        if (str(entry.data.title).trim()) {
          var h3 = doc.createElement('h3');
          h3.textContent = str(entry.data.title);
          sideDiv.appendChild(h3);
        }
        if (str(entry.data.father).trim()) {
          var pf = doc.createElement('p');
          pf.className = 'family-parent';
          pf.textContent = noBreak(entry.data.father);
          sideDiv.appendChild(pf);
        }
        if (str(entry.data.mother).trim()) {
          var pm = doc.createElement('p');
          pm.className = 'family-parent';
          pm.textContent = noBreak(entry.data.mother);
          sideDiv.appendChild(pm);
        }
        if (str(entry.data.address).trim()) {
          var pa = doc.createElement('p');
          pa.className = 'family-address';
          pa.textContent = str(entry.data.address);
          sideDiv.appendChild(pa);
        }
        famGrid.appendChild(sideDiv);
      });
    }

    var famWelcome = doc.querySelector('.families .welcome-line');
    if (famWelcome) {
      famWelcome.textContent = str(cfg.families.welcomeLine);
      famWelcome.hidden = !str(cfg.families.welcomeLine).trim();
    }

    // 5. Story (optional)
    var storySection = doc.querySelector('section.story, [data-section="story"]');
    if (storySection) {
      storySection.hidden = !cfg.story.enabled;
      var storyEyebrow = storySection.querySelector('.eyebrow');
      if (storyEyebrow) storyEyebrow.textContent = str(cfg.story.eyebrow);
      var storyHeadline = storySection.querySelector('.story-headline');
      if (storyHeadline) storyHeadline.textContent = str(cfg.story.headline);
      var storyBody = storySection.querySelector('.story-message');
      if (storyBody) storyBody.textContent = str(cfg.story.body);
      var storyLinkLabel = storySection.querySelector('[data-v4-story-link]');
      if (storyLinkLabel) storyLinkLabel.textContent = str(cfg.story.linkLabel) || 'Chi tiết';
      var storyMonth = storySection.querySelector('.stationery-month');
      if (storyMonth) storyMonth.textContent = 'Tháng ' + cfg.calendar.month + ' ' + cfg.calendar.year;
      renderCalendarTable(storySection.querySelector('[data-v4-mini-calendar], .stationery-calendar table'), cfg.calendar);
      if (cfg.story.enabled) {
        bindPhotoContainer(storySection.querySelector('.stationery-portrait'), cfg.story.portraitPhoto, pairAlt);
        bindPhotoContainer(storySection.querySelector('.stationery-snapshot'), cfg.story.snapshotPhoto, pairAlt);
      }
    }

    // 6. Announce & Ceremonies
    var ann = doc.getElementById('v4-announce');
    if (ann) {
      var annEyebrow = ann.querySelector('.eyebrow');
      if (annEyebrow) annEyebrow.textContent = str(cfg.announce.eyebrow);
      var annDay = ann.querySelector('.date-day');
      if (annDay) annDay.textContent = str(cfg.announce.day);
      var annMonth = ann.querySelector('.date-month');
      if (annMonth) annMonth.textContent = str(cfg.announce.monthYear);
      var annTime = ann.querySelector('.date-time');
      if (annTime) {
        annTime.textContent = str(cfg.announce.timeText);
        annTime.hidden = !str(cfg.announce.timeText).trim();
      }
      var annLunar = ann.querySelector('[data-v4-lunar]');
      if (annLunar) {
        annLunar.textContent = str(cfg.announce.lunarDate);
        annLunar.hidden = !str(cfg.announce.lunarDate).trim();
      }
      var annRec = ann.querySelector('[data-v4-reception]');
      if (annRec) {
        annRec.textContent = str(cfg.announce.receptionTime);
        annRec.hidden = !str(cfg.announce.receptionTime).trim();
      }

      var vLabel = ann.querySelector('.venue-label');
      var vName = ann.querySelector('.venue-name');
      var vAddr = ann.querySelector('.venue-address');
      var venueText = str(cfg.announce.venueName).trim();
      var addrText = str(cfg.announce.address).trim();
      if (vLabel) {
        vLabel.textContent = '';
        vLabel.hidden = true;
      }
      if (venueText) {
        if (vName) {
          vName.textContent = venueText;
          vName.hidden = false;
        }
        if (vAddr) {
          vAddr.textContent = addrText;
          vAddr.hidden = !addrText;
        }
      } else {
        if (vName) {
          vName.textContent = addrText;
          vName.hidden = !addrText;
        }
        if (vAddr) {
          vAddr.textContent = '';
          vAddr.hidden = true;
        }
      }

      var mapBtn = ann.querySelector('[data-v4-map-link], .venue a.outline-button');
      if (mapBtn) {
        var mapSpan = mapBtn.querySelector('span');
        if (mapSpan) mapSpan.textContent = str(cfg.announce.mapLabel).trim() || 'Chỉ đường';
        var cleanMapUrl = sanitizeUrl(cfg.announce.mapUrl);
        if (cleanMapUrl) {
          mapBtn.href = cleanMapUrl;
          mapBtn.hidden = false;
        } else {
          mapBtn.removeAttribute('href');
          mapBtn.hidden = true;
        }
      }

      var ceremoniesWrap = ann.querySelector('.ceremonies');
      var ceremoniesList = ann.querySelector('[data-v4-ceremonies], .ceremony-list');
      if (ceremoniesWrap && ceremoniesList) {
        while (ceremoniesList.firstChild) {
          ceremoniesList.removeChild(ceremoniesList.firstChild);
        }
        if (!cfg.ceremonies.length) {
          ceremoniesWrap.hidden = true;
        } else {
          ceremoniesWrap.hidden = false;
          cfg.ceremonies.forEach(function (c) {
            if (!isPlainObject(c)) return;
            var li = doc.createElement('li');
            li.className = 'ceremony';
            if (str(c.title).trim()) {
              var h3 = doc.createElement('h3');
              h3.textContent = str(c.title);
              li.appendChild(h3);
            }
            if (str(c.timeText).trim()) {
              var pw = doc.createElement('p');
              pw.className = 'ceremony-when';
              pw.textContent = str(c.timeText);
              li.appendChild(pw);
            }
            if (str(c.address).trim()) {
              var pa = doc.createElement('p');
              pa.textContent = str(c.address);
              li.appendChild(pa);
            }
            if (str(c.note).trim()) {
              var pn = doc.createElement('p');
              pn.className = 'ceremony-note';
              pn.textContent = str(c.note);
              li.appendChild(pn);
            }
            ceremoniesList.appendChild(li);
          });
        }
      }
    }

    // 7. Countdown, Calendar & Save-the-date
    var cdEyebrow = doc.querySelector('.countdown .eyebrow');
    if (cdEyebrow) cdEyebrow.textContent = str(cfg.countdown.targetTimeLabel);
    var cdEl = doc.querySelector('[data-v4-countdown]');
    if (cdEl) cdEl.setAttribute('data-v4-countdown', str(cfg.countdown.targetIso));

    renderCalendarTable(doc.querySelector('.countdown table'), cfg.calendar);

    var gcalLink = doc.querySelector('.calendar-actions [data-v4-gcal]');
    if (gcalLink) {
      var ge = cfg.calendar.googleEvent || {};
      var gcalUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
        '&text=' + encodeURIComponent(str(ge.title) || 'Đám cưới') +
        '&dates=' + encodeURIComponent(str(ge.startUtc) + '/' + str(ge.endUtc)) +
        (str(ge.details).trim() ? '&details=' + encodeURIComponent(str(ge.details)) : '') +
        (str(ge.location).trim() ? '&location=' + encodeURIComponent(str(ge.location)) : '');
      gcalLink.href = gcalUrl;
    }

    var icsLink = doc.querySelector('.calendar-actions [data-v4-ics]');
    if (icsLink) {
      icsLink.href = buildIcsDataUri(cfg.calendar);
      icsLink.setAttribute('download', str(cfg.calendar.icsFileName).trim() || 'wedding.ics');
    }

    // 8. Schedule (optional)
    var schedSection = doc.querySelector('[data-section="schedule"], .schedule-chapter');
    if (schedSection) {
      var schedTitle = schedSection.querySelector('[data-v4-schedule-title], .eyebrow');
      if (schedTitle) schedTitle.textContent = str(cfg.schedule.title);
      var schedList = schedSection.querySelector('[data-v4-schedule-list], .schedule-list');
      if (schedList) {
        while (schedList.firstChild) {
          schedList.removeChild(schedList.firstChild);
        }
        var validItems = cfg.schedule.items.filter(function (it) { return isPlainObject(it); });
        if (!cfg.schedule.enabled || !validItems.length) {
          schedSection.hidden = true;
        } else {
          schedSection.hidden = false;
          validItems.forEach(function (item, idx) {
            var li = doc.createElement('li');
            li.className = 'schedule-item';
            li.style.setProperty('--vd-i', String(idx));

            var dot = doc.createElement('span');
            dot.className = 'schedule-dot';
            dot.setAttribute('aria-hidden', 'true');
            li.appendChild(dot);

            var textWrap = doc.createElement('div');
            textWrap.className = 'schedule-text';
            var inner = doc.createElement('div');

            var timeEl = doc.createElement('time');
            timeEl.textContent = str(item.time);
            inner.appendChild(timeEl);

            var titleP = doc.createElement('p');
            titleP.textContent = str(item.title);
            inner.appendChild(titleP);

            if (str(item.description).trim()) {
              var descP = doc.createElement('p');
              descP.className = 'schedule-desc';
              descP.textContent = str(item.description);
              inner.appendChild(descP);
            }

            textWrap.appendChild(inner);
            li.appendChild(textWrap);
            schedList.appendChild(li);
          });
        }
      }
    }

    // 9. Album
    var albumSection = doc.querySelector('section.album, [data-section="album"]');
    if (albumSection) {
      var albumTitle = albumSection.querySelector('.album-heading .chapter-title');
      if (albumTitle) albumTitle.textContent = str(cfg.album.title);
      var albumCaption = albumSection.querySelector('.album-caption');
      if (albumCaption) {
        albumCaption.textContent = str(cfg.album.caption);
        albumCaption.hidden = !str(cfg.album.caption).trim();
      }
      var albumRail = albumSection.querySelector('[data-v4-album] ul.album-rail');
      var albumMount = albumSection.querySelector('.album-mount');
      if (albumRail) {
        albumRail.setAttribute('aria-label', str(cfg.album.title) || 'Album ảnh cưới');
        var validPhotos = cfg.album.photos.filter(function (p) {
          return isPlainObject(p) && sanitizeUrl(p.src);
        });
        while (albumRail.firstChild) {
          albumRail.removeChild(albumRail.firstChild);
        }
        if (albumMount) albumMount.hidden = validPhotos.length === 0;
        validPhotos.forEach(function (photo, i) {
          var cleanSrc = sanitizeUrl(photo.src);
          var li = doc.createElement('li');
          li.className = 'album-slide';
          li.setAttribute('data-selected', i === 0 ? 'true' : 'false');

          var btn = doc.createElement('button');
          btn.type = 'button';
          btn.className = 'album-photo-btn';
          btn.setAttribute('aria-label', 'Xem ảnh ' + (i + 1));
          btn.setAttribute('data-v4-photo', String(i));

          var frame = doc.createElement('div');
          frame.className = 'photo album-photo';
          frame.setAttribute('data-v4-empty', '0');

          var img = doc.createElement('img');
          img.alt = str(photo.alt).trim() || ('Ảnh cưới ' + (i + 1));
          img.loading = i < 2 ? 'eager' : 'lazy';
          img.decoding = 'async';
          img.src = cleanSrc;
          img.onerror = function () {
            frame.setAttribute('data-v4-empty', '1');
          };

          frame.appendChild(img);
          btn.appendChild(frame);
          li.appendChild(btn);
          albumRail.appendChild(li);
        });
      }
    }

    // 10. Guestbook
    var gbSection = doc.querySelector('section.wishes-chapter, [data-section="guestbook"]');
    if (gbSection) {
      gbSection.hidden = !cfg.guestbook.enabled;
      var gbTitle = gbSection.querySelector('.chapter-title');
      if (gbTitle) gbTitle.textContent = str(cfg.guestbook.title);
      var gbSub = gbSection.querySelector('.intro');
      if (gbSub) gbSub.textContent = str(cfg.guestbook.subtitle);
      var gbForm = doc.getElementById('v4-guestbook-form');
      if (gbForm) {
        var gbName = gbForm.querySelector('[name="name"]');
        if (gbName) gbName.placeholder = str(cfg.guestbook.namePlaceholder);
        var gbMsg = gbForm.querySelector('[name="message"]');
        if (gbMsg) gbMsg.placeholder = str(cfg.guestbook.messagePlaceholder);
        var gbSuggest = gbForm.querySelector('[data-v4-suggest]');
        if (gbSuggest) {
          var sLabel = str(cfg.guestbook.suggestLabel) || 'Gợi ý một lời chúc';
          gbSuggest.setAttribute('aria-label', sLabel);
          gbSuggest.title = sLabel;
          gbSuggest.hidden = !cfg.guestbook.suggestedWishes.length;
        }
        var gbSubmit = gbForm.querySelector('[type="submit"]');
        if (gbSubmit) gbSubmit.textContent = str(cfg.guestbook.submitLabel) || 'Gửi lời chúc';
      }
      var gbList = doc.getElementById('v4-guestbook-list');
      if (gbList) {
        while (gbList.firstChild) {
          gbList.removeChild(gbList.firstChild);
        }
        var samples = cfg.guestbook.sampleWishes.filter(function (w) { return isPlainObject(w); });
        gbList.hidden = samples.length === 0;
        samples.forEach(function (w) {
          var li = doc.createElement('li');
          var top = doc.createElement('div');
          var author = doc.createElement('p');
          author.textContent = str(w.name) + (str(w.relation).trim() ? ' · ' + str(w.relation).trim() : '');
          var time = doc.createElement('time');
          time.textContent = formatWishDate(w.createdAt);
          top.appendChild(author);
          top.appendChild(time);
          var body = doc.createElement('p');
          body.textContent = str(w.message);
          li.appendChild(top);
          li.appendChild(body);
          gbList.appendChild(li);
        });
      }
    }

    // 11. RSVP
    var rsvpSection = doc.querySelector('section.rsvp-chapter, [data-section="rsvp"]');
    if (rsvpSection) {
      rsvpSection.hidden = !cfg.rsvp.enabled;
      var rsvpTitle = rsvpSection.querySelector('.chapter-title');
      if (rsvpTitle) rsvpTitle.textContent = str(cfg.rsvp.title);
      var rsvpIntro = rsvpSection.querySelector('.intro');
      if (rsvpIntro) rsvpIntro.textContent = str(cfg.rsvp.intro);
      var rsvpForm = doc.getElementById('v4-rsvp-form');
      if (rsvpForm) {
        var rsvpName = rsvpForm.querySelector('[name="name"]');
        if (rsvpName) rsvpName.placeholder = str(cfg.rsvp.namePlaceholder);
        var yesBtn = rsvpForm.querySelector('[data-v4-attend] [data-value="yes"]');
        if (yesBtn) yesBtn.textContent = str(cfg.rsvp.attendYesLabel);
        var noBtn = rsvpForm.querySelector('[data-v4-attend] [data-value="no"]');
        if (noBtn) noBtn.textContent = str(cfg.rsvp.attendNoLabel);
        var rsvpSubmit = rsvpForm.querySelector('[type="submit"]');
        if (rsvpSubmit) rsvpSubmit.textContent = str(cfg.rsvp.submitLabel) || 'Gửi xác nhận';

        var qMount = rsvpForm.querySelector('[data-v4-custom-questions], [data-v4-questions]');
        var oldQs = rsvpForm.querySelectorAll('[data-v4-question]');
        for (var qi = 0; qi < oldQs.length; qi++) {
          if (oldQs[qi].parentNode) oldQs[qi].parentNode.removeChild(oldQs[qi]);
        }
        if (qMount) {
          while (qMount.firstChild) {
            qMount.removeChild(qMount.firstChild);
          }
          cfg.rsvp.customQuestions.forEach(function (q, idx) {
            if (!isPlainObject(q)) return;
            var qId = str(q.id).trim() || ('q_' + idx);
            var qLabel = str(q.label).trim();
            if (!qLabel) return;

            var wrap = doc.createElement('div');
            wrap.setAttribute('data-v4-question', qId);

            if (Array.isArray(q.options) && q.options.length) {
              var span = doc.createElement('span');
              span.id = 'rsvp-q-' + qId;
              span.textContent = qLabel;
              wrap.appendChild(span);

              var rg = doc.createElement('div');
              rg.setAttribute('role', 'radiogroup');
              rg.setAttribute('aria-labelledby', 'rsvp-q-' + qId);

              q.options.forEach(function (opt) {
                var optText = str(opt).trim();
                if (!optText) return;
                var rb = doc.createElement('button');
                rb.type = 'button';
                rb.setAttribute('role', 'radio');
                rb.setAttribute('aria-checked', 'false');
                rb.setAttribute('data-value', optText);
                rb.textContent = optText;
                rg.appendChild(rb);
              });
              wrap.appendChild(rg);
            } else {
              var lbl = doc.createElement('label');
              lbl.setAttribute('for', 'rsvp-q-in-' + qId);
              lbl.textContent = qLabel;
              var inp = doc.createElement('input');
              inp.id = 'rsvp-q-in-' + qId;
              inp.type = 'text';
              inp.name = 'q_' + qId;
              wrap.appendChild(lbl);
              wrap.appendChild(inp);
            }

            qMount.appendChild(wrap);
          });
        }
      }
    }

    // 12. Gifts & Dresscode (.guest-velvet)
    var guestVelvet = doc.querySelector('.guest-velvet, [data-section="guest-velvet"]');
    var giftsSection = doc.querySelector('section.gifts, [data-section="gifts"]');
    var dressSection = doc.querySelector('section.dress-code, [data-section="dressCode"]');
    var showGifts = Boolean(cfg.gifts.enabled);
    var showDress = Boolean(cfg.dressCode.enabled);

    if (guestVelvet) guestVelvet.hidden = !(showGifts || showDress);
    if (giftsSection) {
      giftsSection.hidden = !showGifts;
      var giftTitle = giftsSection.querySelector('.chapter-title');
      if (giftTitle) giftTitle.textContent = str(cfg.gifts.title);
      var giftSub = giftsSection.querySelector('.intro');
      if (giftSub) giftSub.textContent = str(cfg.gifts.subtitle);
      var giftAccounts = giftsSection.querySelector('[data-v4-gift-accounts], .gift-accounts');
      if (giftAccounts) {
        while (giftAccounts.firstChild) {
          giftAccounts.removeChild(giftAccounts.firstChild);
        }
        cfg.gifts.accounts.forEach(function (acc, i) {
          var card = doc.createElement('div');
          card.className = 'gift-account';

          var roleP = doc.createElement('p');
          roleP.className = 'gift-account-label';
          roleP.textContent = str(acc.roleLabel);
          card.appendChild(roleP);

          var envBtn = doc.createElement('button');
          envBtn.type = 'button';
          envBtn.className = 'gift-envelope';
          envBtn.setAttribute('data-v4-gift', String(i));
          envBtn.setAttribute('aria-label', 'Mở phong bì mừng cưới của ' + str(acc.roleLabel));
          envBtn.style.setProperty('--tilt', i % 2 === 0 ? '-6deg' : '5deg');
          envBtn.style.setProperty('--gift-envelope-ratio', '600 / 560');

          var sheet = doc.createElement('span');
          sheet.className = 'gift-sheet';

          var imgClosed = doc.createElement('img');
          imgClosed.alt = '';
          imgClosed.loading = 'lazy';
          imgClosed.decoding = 'async';
          imgClosed.className = 'gift-face gift-face-closed';
          imgClosed.src = './assets/decor/envelope-closed.avif';

          var imgOpen = doc.createElement('img');
          imgOpen.alt = '';
          imgOpen.loading = 'lazy';
          imgOpen.decoding = 'async';
          imgOpen.className = 'gift-face gift-face-open';
          imgOpen.src = './assets/decor/envelope-open.avif';

          sheet.appendChild(imgClosed);
          sheet.appendChild(imgOpen);

          var shadow = doc.createElement('span');
          shadow.className = 'gift-contact';
          shadow.setAttribute('aria-hidden', 'true');

          envBtn.appendChild(sheet);
          envBtn.appendChild(shadow);
          card.appendChild(envBtn);
          giftAccounts.appendChild(card);
        });
      }
    }

    if (dressSection) {
      dressSection.hidden = !showDress;
      var dcTitle = dressSection.querySelector('h2');
      if (dcTitle) dcTitle.textContent = str(cfg.dressCode.title);
      var dcDesc = dressSection.querySelector('p');
      if (dcDesc) dcDesc.textContent = str(cfg.dressCode.description);
      var dcList = dressSection.querySelector('ul.dress-swatches');
      if (dcList) {
        while (dcList.firstChild) {
          dcList.removeChild(dcList.firstChild);
        }
        cfg.dressCode.colors.forEach(function (c) {
          if (!isPlainObject(c)) return;
          var safeHex = sanitizeColor(c.hex);
          var cName = str(c.name).trim();
          var li = doc.createElement('li');
          var sw = doc.createElement('span');
          sw.className = 'dress-swatch';
          sw.setAttribute('data-dress-code-swatch', 'true');
          sw.setAttribute('role', 'img');
          sw.setAttribute('aria-label', cName ? (cName + ' (' + safeHex + ')') : ('Tông màu ' + safeHex));
          sw.title = cName || safeHex;
          sw.style.backgroundColor = safeHex;
          li.appendChild(sw);
          dcList.appendChild(li);
        });
      }
    }

    // 13. Keepsake & Closing
    bindPhotoContainer(doc.querySelector('.keepsake-photo'), cfg.keepsake.photo, pairAlt);
    var ksText = doc.querySelector('.keepsake-text');
    if (ksText) ksText.textContent = str(cfg.keepsake.caption);

    var clScript = doc.querySelector('.closing .thank-script');
    if (clScript) clScript.textContent = str(cfg.closing.scriptTitle);
    var clMsg = doc.querySelector('.closing .closing-message');
    if (clMsg) clMsg.textContent = str(cfg.closing.message);
    var clDate = doc.querySelector('.closing .closing-date');
    if (clDate) clDate.textContent = str(cfg.closing.dateText);

    // 14. Music
    var player = doc.querySelector('.music-player');
    if (player) {
      var audio = player.querySelector('audio');
      var mBtn = player.querySelector('.music-button');
      var cleanAudioSrc = sanitizeUrl(cfg.music.src);
      if (!cfg.music.enabled || !cleanAudioSrc) {
        player.hidden = true;
        player.setAttribute('data-playing', 'false');
        if (audio) {
          audio.removeAttribute('src');
        }
      } else {
        player.hidden = false;
        if (audio) {
          if (audio.getAttribute('src') !== cleanAudioSrc) {
            audio.src = cleanAudioSrc;
          }
          audio.volume = cfg.music.volume;
        }
        if (mBtn) {
          var mLabel = str(cfg.music.label).trim();
          var ariaTxt = mLabel ? ('Bật nhạc nền: ' + mLabel) : 'Bật nhạc nền';
          mBtn.setAttribute('aria-label', ariaTxt);
          mBtn.title = ariaTxt;
          if (mLabel) mBtn.setAttribute('data-music-label', mLabel);
        }
      }
    }

    // 15. Behavior (gate opening toggle)
    doc.documentElement.dataset.gateOpening = String(Boolean(cfg.behavior.enableGateOpening));
    if (!cfg.behavior.enableGateOpening) {
      var gateCover = doc.querySelector('.opening-cover');
      if (gateCover && gateCover.parentNode) {
        gateCover.parentNode.removeChild(gateCover);
      }
      var content = doc.querySelector('.opening-content');
      if (content) {
        content.setAttribute('data-opening-phase', 'open');
        content.removeAttribute('aria-hidden');
        content.removeAttribute('inert');
      }
      var scenes = doc.querySelectorAll('[data-envelope-scene], .envelope-scene');
      for (var si = 0; si < scenes.length; si++) {
        scenes[si].setAttribute('data-moving', 'true');
      }
    }
  }

  var rawUserConfig = isPlainObject(win.WEDDING_CONFIG) ? win.WEDDING_CONFIG : {};
  var mergedConfig = deepMerge(DEFAULT_CONFIG, rawUserConfig);
  var resolvedConfig = normalizeConfig(rawUserConfig, mergedConfig);

  var rawGuest = readQueryParam(resolvedConfig.behavior.guestQueryParam);
  var sanitizedGuest = sanitizeGuestName(rawGuest);
  var hasCustomGuest = sanitizedGuest.length > 0;
  var resolvedGuestName = hasCustomGuest
    ? sanitizedGuest
    : (sanitizeGuestName(resolvedConfig.couple.defaultGuestName) || 'Quý khách');

  win.WeddingConfig = {
    get: function () {
      return resolvedConfig;
    },
    getGuestName: function () {
      return resolvedGuestName;
    }
  };

  function runBind() {
    applyDomBindings(resolvedConfig, resolvedGuestName, hasCustomGuest);
    try {
      doc.dispatchEvent(new CustomEvent('wedding:config-ready', {
        detail: { config: resolvedConfig, guestName: resolvedGuestName }
      }));
    } catch (_) { }
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', runBind);
  } else {
    runBind();
  }
})(window, document);
