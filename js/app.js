/**
 * Interactive UI Engine for Song Hỷ Wedding Invitation (Pure Vanilla JS, zero-build)
 * Modules: Gate-fold opening, envelope scene, parallax, falling petals, fitNames,
 * scroll reveal, auto-scroll, countdown, 3D coverflow album & lightbox, gift QR modal,
 * floating music equalizer, guestbook & RSVP forms with window.WeddingSheets boundary.
 */
(function (win, doc) {
  'use strict';

  if (win.__weddingAppInit) return;
  win.__weddingAppInit = true;

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var STORAGE_WISHES = 'thiep_cuoi_demo_wishes';
  var STORAGE_RSVP = 'thiep_cuoi_demo_rsvp';

  var DEFAULT_SUGGESTED_WISHES = [
    'Chúc hai bạn trăm năm hạnh phúc, mãi yêu thương như ngày đầu!',
    'Chúc hai bạn luôn nắm tay nhau qua mọi chặng đường.',
    'Mừng ngày trọng đại! Chúc hai bạn cười nhiều hơn giận, yêu nhiều hơn mỗi ngày.',
    'Chúc gia đình nhỏ luôn ấm áp, bình an và tràn đầy tiếng cười.'
  ];

  function getConfig() {
    if (win.WeddingConfig && typeof win.WeddingConfig.get === 'function') {
      return win.WeddingConfig.get() || {};
    }
    return win.WEDDING_CONFIG || {};
  }

  function prefersReducedMotion() {
    return !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function safeText(v) {
    return v == null ? '' : String(v);
  }

  function sanitizeUrl(raw) {
    var url = safeText(raw).replace(/[\u0000-\u001F\u007F]/g, '').trim();
    if (!url) return '';
    if (/^\/\/|^\/\\|^\\\\/.test(url)) return '';
    if (/^(\.\/|\.\.\/|\/)/.test(url)) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (/^data:image\/(png|jpeg|jpg|webp|avif|gif|svg\+xml);/i.test(url)) return url;
    if (/^data:text\/calendar;/i.test(url)) return url;
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return url;
    return '';
  }

  function createCloseSvg() {
    var svg = doc.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var p1 = doc.createElementNS(SVG_NS, 'path');
    p1.setAttribute('d', 'M18 6 6 18');
    var p2 = doc.createElementNS(SVG_NS, 'path');
    p2.setAttribute('d', 'm6 6 12 12');
    svg.appendChild(p1);
    svg.appendChild(p2);
    return svg;
  }

  /* ------------------------------------------------------------------------
     Module: Shared Modal Controller (#v4-dialog-root)
     ------------------------------------------------------------------------ */
  var activeModalClose = null;

  function isFocusableVisible(el) {
    if (!el || el.disabled) return false;
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false;
    return true;
  }

  function closeDialog() {
    if (typeof activeModalClose === 'function') {
      activeModalClose();
    }
  }

  function openDialog(dialogNode, opts) {
    var root = doc.getElementById('v4-dialog-root');
    if (!root || !dialogNode) return;
    closeDialog();
    stopAutoScroll();

    var options = opts || {};
    var lastFocus = doc.activeElement;

    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }

    var backdrop = doc.createElement('div');
    backdrop.className = 'v4-backdrop';
    backdrop.setAttribute('data-v4-close', '');

    root.appendChild(backdrop);
    root.appendChild(dialogNode);

    function handleCleanup() {
      doc.removeEventListener('keydown', onModalKey);
      while (root.firstChild) {
        root.removeChild(root.firstChild);
      }
      activeModalClose = null;
      if (typeof options.onClose === 'function') {
        options.onClose();
      }
      if (lastFocus && typeof lastFocus.focus === 'function' && doc.contains(lastFocus)) {
        try {
          lastFocus.focus();
        } catch (_) {}
      }
    }

    activeModalClose = handleCleanup;

    var closeEls = root.querySelectorAll('[data-v4-close]');
    for (var i = 0; i < closeEls.length; i++) {
      closeEls[i].addEventListener('click', function () {
        closeDialog();
      });
    }

    function onModalKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog();
        return;
      }
      if (typeof options.onStep === 'function') {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          options.onStep(1);
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          options.onStep(-1);
          return;
        }
      }
      if (e.key === 'Tab') {
        var nodes = dialogNode.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        var focusables = [];
        for (var j = 0; j < nodes.length; j++) {
          if (isFocusableVisible(nodes[j])) focusables.push(nodes[j]);
        }
        if (!focusables.length) {
          e.preventDefault();
          return;
        }
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && (doc.activeElement === first || !dialogNode.contains(doc.activeElement))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (doc.activeElement === last || !dialogNode.contains(doc.activeElement))) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    doc.addEventListener('keydown', onModalKey);

    var initialFocusTarget = dialogNode.querySelector('button:not([disabled]), a[href], input:not([disabled])') || dialogNode;
    if (!dialogNode.hasAttribute('tabindex')) {
      dialogNode.setAttribute('tabindex', '-1');
    }
    try {
      initialFocusTarget.focus();
    } catch (_) {}
  }

  /* ------------------------------------------------------------------------
     Module: Envelope Scene, fitNames, Parallax, Reveal, Auto-Scroll, Petals
     ------------------------------------------------------------------------ */
  function moveEnvelopeScenes() {
    var scenes = doc.querySelectorAll('[data-envelope-scene], .envelope-scene');
    for (var i = 0; i < scenes.length; i++) {
      scenes[i].setAttribute('data-moving', 'true');
    }
  }

  function fitNames() {
    if (typeof Map !== 'function') return;
    var groups = new Map();
    var spans = doc.querySelectorAll('[data-v4-name]');
    for (var i = 0; i < spans.length; i++) {
      var s = spans[i];
      var p = s.parentElement;
      if (!p) continue;
      if (!s.hasAttribute('data-miu-name-scaled')) {
        s.style.removeProperty('font-size');
      }
      if (!s.hasAttribute('data-miu-name-scaled') || !s.hasAttribute('data-v4-base')) {
        var computedPx = parseFloat(win.getComputedStyle(s).fontSize);
        if (isFinite(computedPx) && computedPx > 0) {
          s.setAttribute('data-v4-base', String(computedPx));
        }
      }
      var base = Number(s.getAttribute('data-v4-base'));
      if (!isFinite(base) || base <= 0) continue;
      s.style.setProperty('font-size', base + 'px', 'important');
      var cs = win.getComputedStyle(p);
      var avail = p.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      var box = typeof p.closest === 'function' ? p.closest('.chapter, .closing, .cover, .invitation') : null;
      if (box) {
        var bcs = win.getComputedStyle(box);
        var boxAvail = box.clientWidth - (parseFloat(bcs.paddingLeft) || 0) - (parseFloat(bcs.paddingRight) || 0);
        if (boxAvail > 0) {
          avail = avail > 0 ? Math.min(avail, boxAvail) : boxAvail;
        }
      }
      var w = s.offsetWidth;
      var g = groups.get(p) || { spans: [], k: 1 };
      g.spans.push(s);
      if (w > avail && avail > 0) {
        g.k = Math.min(g.k, (avail / w) * 0.98);
      }
      groups.set(p, g);
    }
    groups.forEach(function (g) {
      if (g.k < 1) {
        g.spans.forEach(function (s) {
          var scaled = (Number(s.getAttribute('data-v4-base')) * g.k).toFixed(2);
          s.style.setProperty('font-size', scaled + 'px', 'important');
        });
      }
    });
  }

  var revealObserver = null;
  var revealScrollBound = false;
  var revealScrollRaf = 0;

  function checkRevealPositions() {
    revealScrollRaf = 0;
    var els = doc.querySelectorAll('[data-shown="false"]');
    if (!els.length) return false;
    var vh = win.innerHeight || 800;
    var remainingVisible = 0;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.top < vh * 0.95) {
        el.setAttribute('data-shown', 'true');
        if (revealObserver) revealObserver.unobserve(el);
      } else {
        remainingVisible++;
      }
    }
    return remainingVisible > 0;
  }

  function onRevealScroll() {
    if (revealScrollRaf) return;
    revealScrollRaf = win.requestAnimationFrame(function () {
      var hasMore = checkRevealPositions();
      if (!hasMore && revealScrollBound) {
        win.removeEventListener('scroll', onRevealScroll);
        revealScrollBound = false;
      }
    });
  }

  function reveal() {
    var els = doc.querySelectorAll('[data-shown="false"]');
    if (!els.length) return;

    if (typeof IntersectionObserver !== 'function') {
      for (var i = 0; i < els.length; i++) {
        els[i].setAttribute('data-shown', 'true');
      }
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        var curVh = win.innerHeight || 800;
        for (var j = 0; j < entries.length; j++) {
          var en = entries[j];
          if (en.isIntersecting || en.boundingClientRect.top < curVh * 0.95) {
            en.target.setAttribute('data-shown', 'true');
            revealObserver.unobserve(en.target);
          }
        }
      }, { rootMargin: '0px 0px -8% 0px', threshold: [0.02, 0.08] });
    }

    var vh = win.innerHeight || 800;
    var observedCount = 0;
    for (var k = 0; k < els.length; k++) {
      var el = els[k];
      var rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        continue;
      }
      if (rect.top < vh * 0.95) {
        el.setAttribute('data-shown', 'true');
      } else {
        revealObserver.observe(el);
        observedCount++;
      }
    }

    if (observedCount > 0 && !revealScrollBound) {
      revealScrollBound = true;
      win.addEventListener('scroll', onRevealScroll, { passive: true });
    }
  }

  var autoScrollStopped = false;
  var autoScrollRaf = 0;

  function stopAutoScroll() {
    autoScrollStopped = true;
    if (autoScrollRaf) {
      win.cancelAnimationFrame(autoScrollRaf);
      autoScrollRaf = 0;
    }
  }

  function startAutoScroll() {
    var cfg = getConfig();
    if (!cfg.behavior || cfg.behavior.autoScroll !== true) return;
    if (prefersReducedMotion() || autoScrollStopped) return;

    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (evName) {
      win.addEventListener(evName, stopAutoScroll, { passive: true, once: true });
    });

    function step() {
      if (autoScrollStopped) return;
      win.scrollBy(0, 1);
      if (win.innerHeight + win.scrollY < doc.documentElement.scrollHeight - 2) {
        autoScrollRaf = win.requestAnimationFrame(step);
      } else {
        stopAutoScroll();
      }
    }

    if (!autoScrollRaf) {
      autoScrollRaf = win.requestAnimationFrame(step);
    }
  }

  function startPetals() {
    var cfg = getConfig();
    if (!cfg.behavior || cfg.behavior.enableFallingPetals !== true) return;
    if (prefersReducedMotion()) return;
    if (doc.querySelector('.v4-petals')) return;

    var container = doc.createElement('div');
    container.className = 'v4-petals';
    container.setAttribute('aria-hidden', 'true');

    var presets = [
      { left: '7%', size: '16px', opacity: '0.52', dur: '14s', delay: '-3s', drift: '28px' },
      { left: '16%', size: '19px', opacity: '0.46', dur: '17s', delay: '-9s', drift: '-30px' },
      { left: '25%', size: '15px', opacity: '0.58', dur: '13s', delay: '-6s', drift: '24px' },
      { left: '35%', size: '21px', opacity: '0.44', dur: '18s', delay: '-12s', drift: '-34px' },
      { left: '46%', size: '16px', opacity: '0.50', dur: '15s', delay: '-2s', drift: '32px' },
      { left: '56%', size: '18px', opacity: '0.48', dur: '16s', delay: '-14s', drift: '-26px' },
      { left: '66%', size: '14px', opacity: '0.60', dur: '12.5s', delay: '-5s', drift: '36px' },
      { left: '75%', size: '20px', opacity: '0.45', dur: '19s', delay: '-10s', drift: '-28px' },
      { left: '84%', size: '17px', opacity: '0.55', dur: '14.5s', delay: '-7s', drift: '22px' },
      { left: '91%', size: '15px', opacity: '0.48', dur: '16.5s', delay: '-1s', drift: '-24px' }
    ];

    presets.forEach(function (p) {
      var img = doc.createElement('img');
      img.className = 'v4-petal';
      img.src = './assets/decor/petal.avif';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.style.left = p.left;
      img.style.setProperty('--petal-size', p.size);
      img.style.setProperty('--petal-opacity', p.opacity);
      img.style.setProperty('--petal-duration', p.dur);
      img.style.setProperty('--petal-delay', p.delay);
      img.style.setProperty('--petal-drift', p.drift);
      container.appendChild(img);
    });

    var mountTarget = doc.querySelector('.invitation') || doc.body;
    mountTarget.appendChild(container);

    doc.addEventListener('visibilitychange', function () {
      var imgs = container.querySelectorAll('.v4-petal');
      var state = doc.hidden ? 'paused' : 'running';
      for (var i = 0; i < imgs.length; i++) {
        imgs[i].style.animationPlayState = state;
      }
    });
  }

  function initParallax() {
    var depthEls = [].slice.call(doc.querySelectorAll('[data-depth]'));
    if (!depthEls.length || prefersReducedMotion()) return;
    var rafId = 0;

    function updateParallax() {
      rafId = 0;
      if (prefersReducedMotion()) return;
      var vh = win.innerHeight || 800;
      for (var i = 0; i < depthEls.length; i++) {
        var el = depthEls[i];
        var depth = parseFloat(el.getAttribute('data-depth')) || 0;
        if (!depth) continue;
        var rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        if (rect.bottom < -160 || rect.top > vh + 160) continue;
        var center = rect.top + rect.height / 2;
        var norm = Math.max(-1, Math.min(1, (center - vh / 2) / vh));
        var offset = Math.round(norm * depth * 100) / 100;
        el.style.setProperty('--depth-y', offset + 'px');
      }
    }

    function scheduleParallax() {
      if (!rafId) {
        rafId = win.requestAnimationFrame(updateParallax);
      }
    }

    win.addEventListener('scroll', scheduleParallax, { passive: true });
    win.addEventListener('resize', scheduleParallax, { passive: true });
    updateParallax();
  }

  /* ------------------------------------------------------------------------
     Module: Floating Music Equalizer
     ------------------------------------------------------------------------ */
  function initMusicPlayer() {
    var cfg = getConfig();
    var player = doc.querySelector('.music-player');
    var audio = player && player.querySelector('audio');
    var musicBtn = player && player.querySelector('.music-button');

    if (!player || !audio || !musicBtn) {
      return { playMusic: function () {} };
    }

    if (cfg.music && cfg.music.enabled === false) {
      player.hidden = true;
      return { playMusic: function () {} };
    }

    var volume = (cfg.music && typeof cfg.music.volume === 'number')
      ? Math.max(0, Math.min(1, cfg.music.volume))
      : 0.3;
    var startSecRaw = cfg.music ? Number(cfg.music.startSec) : 0;
    var startSec = isFinite(startSecRaw) && startSecRaw > 0 ? startSecRaw : 0;
    var endSecRaw = cfg.music ? Number(cfg.music.endSec) : 0;
    var endSec = isFinite(endSecRaw) && endSecRaw > startSec ? endSecRaw : 0;
    var songLabel = (cfg.music && safeText(cfg.music.label).trim()) || '';

    function setPlaying(on) {
      player.setAttribute('data-playing', on ? 'true' : 'false');
      musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      var baseText = on ? 'Tắt nhạc nền' : 'Bật nhạc nền';
      var fullLabel = songLabel ? (baseText + ': ' + songLabel) : baseText;
      musicBtn.setAttribute('aria-label', fullLabel);
      musicBtn.title = fullLabel;
    }

    function playMusic() {
      if (cfg.music && cfg.music.enabled === false) return;
      audio.volume = volume;
      var targetStart = startSec;
      if (isFinite(audio.duration) && audio.duration > 0 && targetStart >= audio.duration) {
        targetStart = 0;
      }
      if (targetStart > 0 && audio.currentTime < targetStart) {
        try {
          audio.currentTime = targetStart;
        } catch (_) {}
      }
      try {
        var p = audio.play();
        if (p && typeof p.then === 'function') {
          p.then(function () {
            setPlaying(true);
          }, function () {
            setPlaying(false);
          });
        } else {
          setPlaying(true);
        }
      } catch (_) {
        setPlaying(false);
      }
    }

    audio.addEventListener('play', function () { setPlaying(true); });
    audio.addEventListener('pause', function () { setPlaying(false); });
    audio.addEventListener('ended', function () { setPlaying(false); });

    if (endSec > startSec) {
      audio.addEventListener('timeupdate', function () {
        var dur = audio.duration;
        if (isFinite(dur) && dur > 0 && startSec >= dur) return;
        var loopStart = isFinite(dur) && dur > 0 ? Math.min(startSec, Math.max(0, dur - 0.1)) : startSec;
        var loopEnd = isFinite(dur) && dur > 0 ? Math.min(endSec, dur) : endSec;
        if (loopEnd <= loopStart) return;
        if (audio.currentTime >= loopEnd) {
          audio.currentTime = loopStart;
        }
      });
    }

    musicBtn.addEventListener('click', function () {
      if (audio.paused) {
        playMusic();
      } else {
        audio.pause();
        setPlaying(false);
      }
    });

    if (typeof win.__miuPlayOnFirstGesture !== 'function') {
      win.__miuPlayOnFirstGesture = function (targetAudio, playFn) {
        var events = ['pointerup', 'touchend', 'click', 'keydown'];
        var timer = 0;

        function cleanup() {
          if (timer) {
            win.clearTimeout(timer);
            timer = 0;
          }
          events.forEach(function (ev) {
            doc.removeEventListener(ev, onGesture, true);
          });
        }

        function onGesture() {
          if (timer) win.clearTimeout(timer);
          timer = win.setTimeout(function () {
            if (targetAudio && targetAudio.paused) {
              playFn();
            }
          }, 250);
        }

        if (targetAudio) {
          targetAudio.addEventListener('play', cleanup, { once: true });
        }
        events.forEach(function (ev) {
          doc.addEventListener(ev, onGesture, { capture: true, passive: true });
        });
        playFn();
      };
    }

    var pausedByVisibility = false;
    function onHide() {
      if (!audio.paused) {
        audio.pause();
        pausedByVisibility = true;
        setPlaying(false);
      }
    }
    function onShow() {
      if (pausedByVisibility && !doc.hidden) {
        pausedByVisibility = false;
        playMusic();
      }
    }

    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) onHide();
      else onShow();
    });
    win.addEventListener('pagehide', onHide);
    win.addEventListener('pageshow', function (e) {
      if (e.persisted) onShow();
    });

    return {
      audio: audio,
      playMusic: playMusic
    };
  }

  /* ------------------------------------------------------------------------
     Module: 3D Gate-Fold Opening
     ------------------------------------------------------------------------ */
  function initGateOpening(musicCtrl) {
    var cfg = getConfig();
    var root = doc.querySelector('[data-gate-opening-root]');
    var gateCover = (root && root.querySelector('.opening-cover')) || doc.querySelector('.opening-cover');
    var content = (root && root.querySelector('.opening-content')) || doc.querySelector('.opening-content');
    var gateBtn = doc.getElementById('invite-open-btn');
    var stage = gateBtn && gateBtn.querySelector('.gate-stage');
    var target = content && content.querySelector('[data-gate-opening-cover]');

    var gateEnabled = !(cfg.behavior && cfg.behavior.enableGateOpening === false);

    function finishOpen() {
      if (content) {
        content.setAttribute('data-opening-phase', 'open');
        content.removeAttribute('aria-hidden');
        content.removeAttribute('inert');
      }
      if (gateCover && gateCover.parentNode) {
        gateCover.parentNode.removeChild(gateCover);
      }
      moveEnvelopeScenes();
      fitNames();
      reveal();
      startPetals();
      if (cfg.behavior && cfg.behavior.autoScroll === true) {
        startAutoScroll();
      }
    }

    if (!gateEnabled || !gateBtn || !content) {
      if (gateCover && gateCover.parentNode) {
        gateCover.parentNode.removeChild(gateCover);
      }
      if (content) {
        content.setAttribute('data-opening-phase', 'open');
        content.removeAttribute('aria-hidden');
        content.removeAttribute('inert');
      }
      moveEnvelopeScenes();
      fitNames();
      reveal();
      startPetals();
      if (cfg.behavior && cfg.behavior.autoScroll === true) {
        win.setTimeout(startAutoScroll, 800);
      }
      if ((!cfg.music || cfg.music.enabled !== false) && !cfg.expired && musicCtrl.audio) {
        win.__miuPlayOnFirstGesture(musicCtrl.audio, musicCtrl.playMusic);
      }
      return;
    }

    // Initial closed state
    gateCover.setAttribute('data-opening-phase', 'closed');
    content.setAttribute('data-opening-phase', 'closed');
    content.setAttribute('aria-hidden', 'true');
    content.setAttribute('inert', '');

    gateBtn.addEventListener('click', function (ev) {
      if (cfg.expired) {
        ev.preventDefault();
        var ov = doc.getElementById('v4-expired');
        if (ov) ov.style.display = 'flex';
        return;
      }

      if (gateBtn.getAttribute('data-untying') === 'true') return;

      if (stage && target && root) {
        var i = stage.getBoundingClientRect();
        var l = target.getBoundingClientRect();
        var o = gateBtn.getBoundingClientRect();
        var r = i.width / (l.width || 1);
        var vars = {
          '--gate-opening-cover-x': (i.left - l.left) + 'px',
          '--gate-opening-cover-y': (i.top - l.top) + 'px',
          '--gate-opening-cover-scale': String(r),
          '--gate-opening-camera-scale': String(1 / (r || 1)),
          '--gate-opening-window-left': (i.left - o.left) + 'px',
          '--gate-opening-window-top': (i.top - o.top) + 'px',
          '--gate-opening-window-right': (i.right - o.left) + 'px',
          '--gate-opening-window-bottom': (i.bottom - o.top) + 'px'
        };
        Object.keys(vars).forEach(function (k) {
          root.style.setProperty(k, vars[k]);
        });
      }

      gateBtn.setAttribute('data-untying', 'true');
      gateBtn.disabled = true;
      gateCover.setAttribute('data-opening-phase', 'opening');
      gateCover.setAttribute('inert', '');

      content.setAttribute('data-opening-phase', 'opening');
      content.removeAttribute('aria-hidden');
      content.removeAttribute('inert');

      moveEnvelopeScenes();
      if (!cfg.music || cfg.music.enabled !== false) {
        musicCtrl.playMusic();
      }

      var duration = prefersReducedMotion() ? 200 : 7000;
      win.setTimeout(finishOpen, duration);
    });
  }

  /* ------------------------------------------------------------------------
     Module: Live 1-Second Countdown
     ------------------------------------------------------------------------ */
  function initCountdown() {
    var cfg = getConfig();
    var cd = doc.querySelector('[data-v4-countdown]');
    if (!cd) return;
    var isoStr = cd.getAttribute('data-v4-countdown') || (cfg.countdown && cfg.countdown.targetIso) || '';
    var dds = cd.querySelectorAll('dd');
    if (!dds.length) return;

    function setZero() {
      for (var i = 0; i < dds.length; i++) {
        dds[i].textContent = '00';
      }
    }

    var targetMs = new Date(isoStr).getTime();
    if (!isFinite(targetMs)) {
      setZero();
      return;
    }

    function tick() {
      var ms = Math.max(0, targetMs - Date.now());
      var vals = [
        Math.floor(ms / 864e5),
        Math.floor(ms / 36e5) % 24,
        Math.floor(ms / 6e4) % 60,
        Math.floor(ms / 1e3) % 60
      ];
      for (var i = 0; i < 4 && i < dds.length; i++) {
        dds[i].textContent = i === 0 && vals[0] >= 100 ? String(vals[0]) : pad2(vals[i]);
      }
    }

    tick();
    win.setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------------
     Module: 3D Coverflow Album & Lightbox
     ------------------------------------------------------------------------ */
  function initAlbumAndLightbox() {
    var cfg = getConfig();
    var album = doc.querySelector('[data-v4-album]');
    if (!album) return;

    var rail = album.querySelector('ul');
    var slides = rail ? [].slice.call(rail.children) : [];
    if (!rail || !slides.length) return;

    var prevBtn = album.querySelector('[data-v4-nav="-1"]');
    var nextBtn = album.querySelector('[data-v4-nav="1"]');

    var photos = (cfg.album && Array.isArray(cfg.album.photos) && cfg.album.photos.length)
      ? cfg.album.photos.map(function (p, idx) {
          var cleanSrc = p ? sanitizeUrl(p.src) : '';
          return cleanSrc ? {
            src: cleanSrc,
            alt: safeText(p.alt) || ('Ảnh cưới ' + (idx + 1))
          } : null;
        }).filter(Boolean)
      : slides.map(function (s, idx) {
          var img = s.querySelector('img');
          var cleanSrc = img ? sanitizeUrl(img.getAttribute('src') || img.currentSrc || '') : '';
          return cleanSrc ? {
            src: cleanSrc,
            alt: img ? (img.alt || ('Ảnh cưới ' + (idx + 1))) : ('Ảnh cưới ' + (idx + 1))
          } : null;
        }).filter(Boolean);

    var current = 0;
    var scrollRaf = 0;
    var programmaticTargetIdx = -1;
    var programmaticTargetLeft = 0;
    var programmaticUntil = 0;
    var programmaticTimer = 0;

    function clearProgrammatic() {
      programmaticTargetIdx = -1;
      if (programmaticTimer) {
        win.clearTimeout(programmaticTimer);
        programmaticTimer = 0;
      }
    }

    function select(idx) {
      current = Math.max(0, Math.min(slides.length - 1, idx));
      for (var i = 0; i < slides.length; i++) {
        slides[i].setAttribute('data-selected', i === current ? 'true' : 'false');
      }
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === slides.length - 1;
    }

    function go(idx) {
      select(idx);
      var s = slides[current];
      if (!s) return;
      var maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
      var targetLeft = Math.max(0, Math.min(maxScroll, s.offsetLeft - (rail.clientWidth - s.clientWidth) / 2));
      var useSmooth = !prefersReducedMotion() && typeof rail.scrollTo === 'function';
      if (useSmooth && Math.abs(rail.scrollLeft - targetLeft) > 2) {
        programmaticTargetIdx = current;
        programmaticTargetLeft = targetLeft;
        programmaticUntil = Date.now() + 900;
        if (programmaticTimer) win.clearTimeout(programmaticTimer);
        programmaticTimer = win.setTimeout(function () {
          programmaticTimer = 0;
          programmaticTargetIdx = -1;
        }, 950);
      } else {
        clearProgrammatic();
      }
      if (typeof rail.scrollTo === 'function') {
        rail.scrollTo({
          left: targetLeft,
          behavior: useSmooth ? 'smooth' : 'auto'
        });
      } else {
        rail.scrollLeft = targetLeft;
      }
    }

    select(0);

    rail.addEventListener('wheel', clearProgrammatic, { passive: true });
    rail.addEventListener('touchstart', clearProgrammatic, { passive: true });
    rail.addEventListener('scrollend', function () {
      if (programmaticTargetIdx !== -1 && Math.abs(rail.scrollLeft - programmaticTargetLeft) <= 2) {
        clearProgrammatic();
      }
    }, { passive: true });

    rail.addEventListener('scroll', function () {
      if (scrollRaf) win.cancelAnimationFrame(scrollRaf);
      scrollRaf = win.requestAnimationFrame(function () {
        scrollRaf = 0;
        if (programmaticTargetIdx !== -1) {
          if (Math.abs(rail.scrollLeft - programmaticTargetLeft) <= 2 || Date.now() > programmaticUntil) {
            clearProgrammatic();
          } else {
            return;
          }
        }
        var mid = rail.scrollLeft + rail.clientWidth / 2;
        var best = 0;
        var bestDist = Infinity;
        for (var i = 0; i < slides.length; i++) {
          var s = slides[i];
          var d = Math.abs(s.offsetLeft + s.clientWidth / 2 - mid);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        }
        if (best !== current) {
          select(best);
        }
      });
    }, { passive: true });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        go(current - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        go(current + 1);
      });
    }

    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(current - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(current + 1);
      }
    });

    function openLightbox(startIdx) {
      if (!photos.length) return;
      var idx = Math.max(0, Math.min(photos.length - 1, startIdx));

      var lb = doc.createElement('div');
      lb.className = 'v4-lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', 'Xem ảnh');

      var img = doc.createElement('img');
      img.alt = 'Ảnh cưới';

      var row = doc.createElement('div');
      row.className = 'v4-row';

      var btnPrev = doc.createElement('button');
      btnPrev.type = 'button';
      btnPrev.setAttribute('data-v4-step', '-1');
      btnPrev.setAttribute('aria-label', 'Ảnh trước');
      btnPrev.textContent = '‹';

      var counter = doc.createElement('p');

      var btnNext = doc.createElement('button');
      btnNext.type = 'button';
      btnNext.setAttribute('data-v4-step', '1');
      btnNext.setAttribute('aria-label', 'Ảnh sau');
      btnNext.textContent = '›';

      row.appendChild(btnPrev);
      row.appendChild(counter);
      row.appendChild(btnNext);

      var btnClose = doc.createElement('button');
      btnClose.type = 'button';
      btnClose.className = 'v4-close';
      btnClose.setAttribute('aria-label', 'Đóng ảnh');
      btnClose.setAttribute('data-v4-close', '');
      btnClose.textContent = '✕';

      lb.appendChild(img);
      lb.appendChild(row);
      lb.appendChild(btnClose);

      function renderPhoto() {
        var item = photos[idx] || {};
        img.src = sanitizeUrl(item.src);
        img.alt = safeText(item.alt) || ('Ảnh cưới ' + (idx + 1));
        counter.textContent = (idx + 1) + '/' + photos.length;
      }

      function stepPhoto(delta) {
        idx = (idx + delta + photos.length) % photos.length;
        renderPhoto();
      }

      btnPrev.addEventListener('click', function () { stepPhoto(-1); });
      btnNext.addEventListener('click', function () { stepPhoto(1); });

      renderPhoto();
      openDialog(lb, { onStep: stepPhoto });
    }

    var photoBtns = album.querySelectorAll('[data-v4-photo]');
    for (var b = 0; b < photoBtns.length; b++) {
      photoBtns[b].addEventListener('click', function () {
        var idx = Number(this.getAttribute('data-v4-photo'));
        if (!isFinite(idx)) return;
        if (idx !== current) {
          go(idx);
          return;
        }
        openLightbox(idx);
      });
    }
  }

  /* ------------------------------------------------------------------------
     Module: Gift Box Envelopes & QR Modal
     ------------------------------------------------------------------------ */
  function resolveGiftQrUrls(g) {
    var defaultFallback = './assets/qr/' + (g.id === 'bride' ? 'bride-qr.png' : 'groom-qr.png');
    var cleanQrImage = sanitizeUrl(g.qrImage);
    var cleanResolved = sanitizeUrl(g.resolvedQr);
    var localFallback = cleanQrImage || defaultFallback;
    if (g.vietQrBankBin && g.accountNumber) {
      var vietQr = 'https://img.vietqr.io/image/' +
        encodeURIComponent(safeText(g.vietQrBankBin).trim()) + '-' +
        encodeURIComponent(safeText(g.accountNumber).trim()) + '-qr_only.png' +
        '?addInfo=' + encodeURIComponent(safeText(g.addInfo)) +
        '&accountName=' + encodeURIComponent(safeText(g.accountHolder));
      return { primary: vietQr, fallback: localFallback };
    }
    return {
      primary: cleanResolved || cleanQrImage || localFallback,
      fallback: localFallback
    };
  }

  function isIosOrInAppBrowser() {
    var ua = (win.navigator && win.navigator.userAgent) || '';
    var isIos = /iPad|iPhone|iPod/i.test(ua) || (win.navigator && win.navigator.platform === 'MacIntel' && win.navigator.maxTouchPoints > 1);
    var isInApp = /Zalo|FBAN|FBAV|Messenger|Instagram|Line/i.test(ua);
    return isIos || isInApp;
  }

  function openQrSaveOverlay(src, titleText) {
    var overlay = doc.createElement('div');
    overlay.className = 'v4-dialog surface-glass-strong gift-theme gift-dialog';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Lưu mã QR');
    overlay.setAttribute('data-v4-qr-overlay', 'true');

    var heading = doc.createElement('h2');
    heading.className = 'gift-dialog-title';
    heading.textContent = titleText || 'Lưu mã QR';

    var frame = doc.createElement('div');
    frame.className = 'gift-qr-frame';
    var img = doc.createElement('img');
    img.className = 'gift-qr-code v4-qr';
    img.width = 256;
    img.height = 256;
    img.alt = 'Mã QR';
    img.src = sanitizeUrl(src);
    frame.appendChild(img);

    var hint = doc.createElement('p');
    hint.className = 'gift-account-number';
    hint.textContent = 'Nhấn giữ vào mã QR rồi chọn “Lưu ảnh” để lưu về máy';

    var actions = doc.createElement('div');
    actions.className = 'gift-dialog-actions';
    var closeBtn = doc.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'gift-copy-btn';
    closeBtn.setAttribute('data-v4-close', '');
    closeBtn.textContent = 'Đóng';
    actions.appendChild(closeBtn);

    overlay.appendChild(heading);
    overlay.appendChild(frame);
    overlay.appendChild(hint);
    overlay.appendChild(actions);

    openDialog(overlay);
  }

  function toPngBlob(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      if (!/^file:/i.test(win.location.protocol)) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = function () {
        try {
          var w = img.naturalWidth || 800;
          var h = img.naturalHeight || w;
          var s = Math.min(4, Math.max(1, 1024 / Math.max(w, h)));
          var pad = Math.round(24 * s);
          var canvas = doc.createElement('canvas');
          canvas.width = Math.round(w * s) + pad * 2;
          canvas.height = Math.round(h * s) + pad * 2;
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, pad, pad, Math.round(w * s), Math.round(h * s));
          canvas.toBlob(function (blob) {
            if (blob) resolve(blob);
            else reject(new Error('Canvas export failed'));
          }, 'image/png');
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = function () {
        reject(new Error('Image load failed'));
      };
      img.src = src;
    });
  }

  function triggerBlobOrUrlDownload(href, filename, revokeAfter) {
    var a = doc.createElement('a');
    a.href = href;
    a.download = filename;
    a.style.display = 'none';
    doc.body.appendChild(a);
    a.click();
    doc.body.removeChild(a);
    if (revokeAfter) {
      win.setTimeout(function () {
        try {
          URL.revokeObjectURL(href);
        } catch (_) {}
      }, 60000);
    }
  }

  function initGifts() {
    var cfg = getConfig();
    var btns = doc.querySelectorAll('.gifts [data-v4-gift]');
    if (!btns.length) return;

    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        var btn = this;
        var idx = Number(btn.getAttribute('data-v4-gift'));
        var accounts = (cfg.gifts && Array.isArray(cfg.gifts.accounts)) ? cfg.gifts.accounts : [];
        var g = accounts[idx];
        if (!g) return;

        btn.setAttribute('data-opening', 'true');

        var rect = btn.getBoundingClientRect();
        var dx = Math.round((rect.left + rect.width / 2) - (win.innerWidth / 2));
        var dy = Math.round((rect.top + rect.height / 2) - (win.innerHeight / 2));

        var dialog = doc.createElement('div');
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-label', safeText(g.roleLabel) || 'Hộp mừng cưới');
        dialog.setAttribute('data-gift-motion', 'paper');
        dialog.className = 'v4-dialog surface-glass-strong gift-theme gift-dialog';
        dialog.style.setProperty('--gift-reveal-x', dx + 'px');
        dialog.style.setProperty('--gift-reveal-y', dy + 'px');

        var ornament = doc.createElement('span');
        ornament.className = 'gift-dialog-ornament';
        ornament.setAttribute('aria-hidden', 'true');
        dialog.appendChild(ornament);

        var title = doc.createElement('h2');
        title.className = 'gift-dialog-title';
        title.textContent = safeText(g.roleLabel);
        dialog.appendChild(title);

        var urls = resolveGiftQrUrls(g);

        var qrFrame = doc.createElement('div');
        qrFrame.className = 'gift-qr-frame';
        qrFrame.setAttribute('aria-label', 'Mã QR chuyển khoản ' + safeText(g.roleLabel));

        var qrImg = doc.createElement('img');
        qrImg.className = 'gift-qr-code v4-qr';
        qrImg.width = 256;
        qrImg.height = 256;
        qrImg.alt = 'Mã QR ' + safeText(g.roleLabel);

        var details = doc.createElement('div');
        details.className = 'gift-account-details';

        var bankP = doc.createElement('p');
        bankP.className = 'gift-bank-name';
        bankP.textContent = safeText(g.bankName);

        var holderP = doc.createElement('p');
        holderP.className = 'gift-account-name';
        holderP.textContent = safeText(g.accountHolder);

        var numP = doc.createElement('p');
        numP.className = 'gift-account-number';
        var numLabel = doc.createElement('span');
        numLabel.textContent = 'Số tài khoản';
        var numStrong = doc.createElement('strong');
        numStrong.textContent = safeText(g.accountNumber);
        numP.appendChild(numLabel);
        numP.appendChild(numStrong);

        details.appendChild(bankP);
        details.appendChild(holderP);
        details.appendChild(numP);

        var actions = doc.createElement('div');
        actions.className = 'gift-dialog-actions';

        var copyBtn = doc.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'gift-copy-btn';
        copyBtn.setAttribute('data-v4-copy', '');
        copyBtn.textContent = 'Copy số tài khoản';

        var downloadLink = doc.createElement('a');
        downloadLink.className = 'gift-copy-btn';
        downloadLink.setAttribute('data-v4-download-qr', '');
        downloadLink.setAttribute('download', 'qr-' + (safeText(g.id).trim() || 'mung-cuoi') + '.png');
        downloadLink.href = urls.primary || urls.fallback || '#';
        downloadLink.textContent = 'Tải mã QR';

        qrImg.addEventListener('error', function () {
          if (!qrImg.dataset.qrFallback && urls.fallback && qrImg.getAttribute('src') !== urls.fallback) {
            qrImg.dataset.qrFallback = '1';
            qrImg.src = urls.fallback;
            downloadLink.href = urls.fallback;
          } else {
            qrFrame.hidden = true;
          }
        });

        if (urls.primary) {
          qrImg.src = urls.primary;
        } else {
          qrFrame.hidden = true;
        }
        qrFrame.appendChild(qrImg);
        dialog.appendChild(qrFrame);
        dialog.appendChild(details);

        copyBtn.addEventListener('click', function () {
          var acct = safeText(g.accountNumber);
          function markCopied() {
            copyBtn.textContent = 'Đã copy';
          }
          function fallbackCopy() {
            try {
              var ta = doc.createElement('textarea');
              ta.value = acct;
              ta.setAttribute('readonly', '');
              ta.style.position = 'fixed';
              ta.style.left = '-9999px';
              doc.body.appendChild(ta);
              ta.select();
              doc.execCommand('copy');
              doc.body.removeChild(ta);
              try { copyBtn.focus(); } catch (_) {}
              markCopied();
            } catch (_) {
              markCopied();
            }
          }
          if (win.navigator && win.navigator.clipboard && typeof win.navigator.clipboard.writeText === 'function') {
            win.navigator.clipboard.writeText(acct).then(markCopied, fallbackCopy);
          } else {
            fallbackCopy();
          }
        });

        downloadLink.addEventListener('click', function (e) {
          e.preventDefault();
          var activeSrc = sanitizeUrl(qrImg.getAttribute('src') || qrImg.currentSrc || urls.fallback) || urls.fallback;
          if (!activeSrc) return;
          var filename = 'qr-' + (safeText(g.id).trim() || 'mung-cuoi') + '.png';
          var canvasSrc = activeSrc.replace(/^(https?:\/\/img\.vietqr\.io\/image\/[^?#]+)\.(?:png|jpe?g)(?=[?#]|$)/i, '$1.svg');

          if (/^file:/i.test(win.location.protocol)) {
            if (/^(?:data|blob):/i.test(activeSrc)) {
              triggerBlobOrUrlDownload(activeSrc, filename, false);
            } else {
              openQrSaveOverlay(activeSrc, safeText(g.roleLabel));
            }
            return;
          }

          toPngBlob(canvasSrc).then(function (blob) {
            if (isIosOrInAppBrowser()) {
              if (win.navigator && typeof win.navigator.share === 'function' && typeof File === 'function') {
                var file = new File([blob], filename, { type: 'image/png' });
                if (!win.navigator.canShare || win.navigator.canShare({ files: [file] })) {
                  win.navigator.share({ files: [file], title: safeText(g.roleLabel) }).catch(function () {
                    openQrSaveOverlay(activeSrc, safeText(g.roleLabel));
                  });
                  return;
                }
              }
              openQrSaveOverlay(activeSrc, safeText(g.roleLabel));
              return;
            }
            var objUrl = URL.createObjectURL(blob);
            triggerBlobOrUrlDownload(objUrl, filename, true);
          }).catch(function () {
            if (!/^https?:/i.test(activeSrc) && !isIosOrInAppBrowser()) {
              triggerBlobOrUrlDownload(activeSrc, filename, false);
            } else {
              openQrSaveOverlay(activeSrc, safeText(g.roleLabel));
            }
          });
        });

        actions.appendChild(copyBtn);
        actions.appendChild(downloadLink);
        dialog.appendChild(actions);

        var closeBtn = doc.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'v4-close';
        closeBtn.setAttribute('aria-label', 'Đóng');
        closeBtn.setAttribute('data-v4-close', '');
        closeBtn.appendChild(createCloseSvg());
        dialog.appendChild(closeBtn);

        openDialog(dialog, {
          onClose: function () {
            btn.removeAttribute('data-opening');
          }
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     Module: Guestbook & RSVP + window.WeddingSheets Boundary
     ------------------------------------------------------------------------ */
  var memoryWishes = [];
  var memoryRsvp = [];

  function readStorage(key, fallbackArr) {
    try {
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
      win.localStorage.setItem(key, JSON.stringify(arr));
    } catch (_) {}
  }

  function createDemoClient(cfg) {
    function getSampleWishes() {
      var list = (cfg.guestbook && Array.isArray(cfg.guestbook.sampleWishes)) ? cfg.guestbook.sampleWishes : [];
      return list.filter(function (w) { return w && typeof w === 'object'; }).map(function (w, i) {
        return {
          id: safeText(w.id || ('sample-' + i)),
          name: safeText(w.name),
          relation: safeText(w.relation),
          message: safeText(w.message),
          createdAt: safeText(w.createdAt)
        };
      });
    }

    return {
      isConfigured: function () {
        return false;
      },
      loadWishes: function () {
        var stored = readStorage(STORAGE_WISHES, memoryWishes);
        var samples = getSampleWishes();
        var seen = Object.create(null);
        var combined = [];
        stored.concat(samples).forEach(function (w) {
          if (!w || typeof w !== 'object') return;
          var key = safeText(w.id) || (safeText(w.name) + '|' + safeText(w.message));
          if (seen[key]) return;
          seen[key] = true;
          combined.push(w);
        });
        combined.sort(function (a, b) {
          var ta = Date.parse(a.createdAt || a.created_at || '') || 0;
          var tb = Date.parse(b.createdAt || b.created_at || '') || 0;
          return tb - ta;
        });
        return Promise.resolve({ ok: true, mode: 'demo', wishes: combined });
      },
      submitWish: function (payload) {
        if (payload && safeText(payload.website).trim()) {
          return Promise.resolve({
            ok: true,
            mode: 'demo',
            wish: null,
            message: 'Cảm ơn bạn! Lời chúc đã được gửi tới cô dâu chú rể.'
          });
        }
        var wish = {
          id: 'demo-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          name: safeText(payload && payload.name).trim(),
          relation: safeText(payload && payload.relation).trim(),
          message: safeText(payload && payload.message).trim(),
          createdAt: new Date().toISOString()
        };
        var current = readStorage(STORAGE_WISHES, memoryWishes);
        current.unshift(wish);
        memoryWishes = current.slice();
        writeStorage(STORAGE_WISHES, current);
        return Promise.resolve({
          ok: true,
          mode: 'demo',
          wish: wish,
          message: 'Cảm ơn bạn! Lời chúc đã được gửi tới cô dâu chú rể.'
        });
      },
      submitRsvp: function (payload) {
        if (payload && safeText(payload.website).trim()) {
          return Promise.resolve({ ok: true, mode: 'demo', message: 'Cảm ơn bạn!' });
        }
        var rec = {
          name: safeText(payload && payload.name).trim(),
          attending: Boolean(payload && payload.attending),
          phone: safeText(payload && payload.phone).trim(),
          side: safeText(payload && payload.side).trim(),
          guests: safeText(payload && payload.guests).trim(),
          note: safeText(payload && payload.note).trim(),
          answers: (payload && payload.answers) || {},
          createdAt: new Date().toISOString()
        };
        var current = readStorage(STORAGE_RSVP, memoryRsvp);
        current.push(rec);
        memoryRsvp = current.slice();
        writeStorage(STORAGE_RSVP, current);
        return Promise.resolve({
          ok: true,
          mode: 'demo',
          message: rec.attending
            ? 'Cảm ơn bạn! Hẹn gặp bạn trong ngày vui.'
            : 'Cảm ơn bạn đã báo cho chúng mình.'
        });
      }
    };
  }

  function getSheetsClient() {
    if (typeof win.WeddingSheets !== 'undefined' && win.WeddingSheets) {
      return win.WeddingSheets;
    }
    return createDemoClient(getConfig());
  }

  function setStatus(form, msg, state) {
    if (!form) return;
    var p = form.querySelector('[data-v4-status]');
    if (!p) return;
    p.hidden = !msg;
    p.textContent = msg || '';
    if (state) {
      p.setAttribute('data-state', state);
    } else {
      p.removeAttribute('data-state');
    }
  }

  function initRadioGroup(group, onChange) {
    if (!group) return;
    var btns = [].slice.call(group.querySelectorAll('[role="radio"]'));
    if (!btns.length) return;

    function selectRadio(btn) {
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute('aria-checked', btns[i] === btn ? 'true' : 'false');
      }
      group.setAttribute('data-value', btn.getAttribute('data-value') || '');
      group.removeAttribute('aria-invalid');
      if (typeof onChange === 'function') onChange(btn);
    }

    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        selectRadio(this);
      });
    }

    group.addEventListener('keydown', function (e) {
      var idx = btns.indexOf(doc.activeElement);
      if (idx === -1) idx = 0;
      var nextIdx = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIdx = (idx + 1) % btns.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIdx = (idx - 1 + btns.length) % btns.length;
      }
      if (nextIdx !== -1) {
        e.preventDefault();
        selectRadio(btns[nextIdx]);
        btns[nextIdx].focus();
      }
    });
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ' · ' +
      pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  function initFormsAndDemoNotice() {
    var cfg = getConfig();
    var client = getSheetsClient();

    var isDemoMode = typeof client.isConfigured !== 'function' || !client.isConfigured();
    var demoNoticeText = (cfg.googleSheets && safeText(cfg.googleSheets.demoNotice).trim()) || '';
    var noticeEls = doc.querySelectorAll('[data-v4-demo-notice]');
    for (var ni = 0; ni < noticeEls.length; ni++) {
      if (isDemoMode && demoNoticeText) {
        noticeEls[ni].textContent = demoNoticeText;
        noticeEls[ni].hidden = false;
      } else {
        noticeEls[ni].textContent = '';
        noticeEls[ni].hidden = true;
      }
    }

    // Guestbook
    var gb = doc.getElementById('v4-guestbook-form');
    var list = doc.getElementById('v4-guestbook-list');

    function renderWishes(items) {
      if (!list) return;
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }
      if (!items || !items.length) {
        list.hidden = true;
        return;
      }
      list.hidden = false;
      for (var i = 0; i < items.length; i++) {
        var m = items[i];
        if (!m || typeof m !== 'object') continue;
        var li = doc.createElement('li');
        var top = doc.createElement('div');
        var pName = doc.createElement('p');
        var author = safeText(m.name || m.guest_name).trim();
        var rel = safeText(m.relation).trim();
        pName.textContent = rel ? (author + ' · ' + rel) : author;
        var tEl = doc.createElement('time');
        tEl.textContent = fmtDate(m.createdAt || m.created_at);
        top.appendChild(pName);
        top.appendChild(tEl);

        var pBody = doc.createElement('p');
        pBody.textContent = safeText(m.message);

        li.appendChild(top);
        li.appendChild(pBody);
        list.appendChild(li);
      }
    }

    function refreshWishes() {
      if (!list || typeof client.loadWishes !== 'function') return;
      client.loadWishes().then(function (res) {
        if (res && Array.isArray(res.wishes)) {
          renderWishes(res.wishes);
        }
      }).catch(function () {});
    }

    if (gb) {
      var suggestPool = (cfg.guestbook && Array.isArray(cfg.guestbook.suggestedWishes) && cfg.guestbook.suggestedWishes.length)
        ? cfg.guestbook.suggestedWishes
        : DEFAULT_SUGGESTED_WISHES;
      var suggestIndex = 0;
      var suggestBtn = gb.querySelector('[data-v4-suggest]');
      if (suggestBtn) {
        suggestBtn.addEventListener('click', function () {
          var msgField = gb.elements.message;
          if (!msgField || !suggestPool.length) return;
          msgField.value = safeText(suggestPool[suggestIndex % suggestPool.length]);
          suggestIndex++;
          msgField.removeAttribute('aria-invalid');
        });
      }

      ['name', 'message'].forEach(function (fieldName) {
        var f = gb.elements[fieldName];
        if (f) {
          f.addEventListener('input', function () {
            f.removeAttribute('aria-invalid');
          });
        }
      });

      gb.addEventListener('submit', function (e) {
        e.preventDefault();
        var nameField = gb.elements.name;
        var relField = gb.elements.relation;
        var msgField = gb.elements.message;
        var webField = gb.elements.website;

        var name = nameField ? nameField.value.trim() : '';
        var relation = relField ? relField.value.trim() : '';
        var message = msgField ? msgField.value.trim() : '';
        var website = webField ? webField.value : '';

        if (!name || !message) {
          if (!name && nameField) nameField.setAttribute('aria-invalid', 'true');
          if (!message && msgField) msgField.setAttribute('aria-invalid', 'true');
          var firstInvalid = !name ? nameField : msgField;
          if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
          setStatus(gb, 'Bạn nhập tên và lời chúc giúp chúng mình nhé.', 'error');
          return;
        }

        var submitBtn = gb.querySelector('[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        setStatus(gb, '', '');

        client.submitWish({
          name: name,
          relation: relation,
          message: message,
          website: website
        }).then(function (res) {
          if (submitBtn) submitBtn.disabled = false;
          if (res && res.ok) {
            gb.reset();
            setStatus(gb, 'Cảm ơn bạn! Lời chúc đã được gửi tới cô dâu chú rể.', 'success');
            refreshWishes();
          } else {
            setStatus(gb, (res && (res.message || res.error)) || 'Chưa gửi được, bạn thử lại nhé.', 'error');
          }
        }).catch(function () {
          if (submitBtn) submitBtn.disabled = false;
          setStatus(gb, 'Chưa gửi được, bạn thử lại nhé.', 'error');
        });
      });

      if (list && (!cfg.guestbook || cfg.guestbook.enabled !== false)) {
        refreshWishes();
      }
    }

    // RSVP
    var rsvp = doc.getElementById('v4-rsvp-form');
    if (rsvp) {
      var groups = rsvp.querySelectorAll('[role="radiogroup"]');
      for (var g = 0; g < groups.length; g++) {
        initRadioGroup(groups[g]);
      }

      var rsvpNameField = rsvp.elements.name;
      if (rsvpNameField) {
        rsvpNameField.addEventListener('input', function () {
          rsvpNameField.removeAttribute('aria-invalid');
        });
      }

      rsvp.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = rsvpNameField ? rsvpNameField.value.trim() : '';
        var attendGroup = rsvp.querySelector('[data-v4-attend]');
        var att = attendGroup ? attendGroup.getAttribute('data-value') : '';

        if (!name) {
          if (rsvpNameField) {
            rsvpNameField.setAttribute('aria-invalid', 'true');
            rsvpNameField.focus();
          }
          setStatus(rsvp, 'Bạn nhập tên giúp chúng mình nhé.', 'error');
          return;
        }

        if (!att) {
          if (attendGroup) {
            attendGroup.setAttribute('aria-invalid', 'true');
            var firstRadio = attendGroup.querySelector('[role="radio"]');
            if (firstRadio) firstRadio.focus();
          }
          setStatus(rsvp, 'Bạn chọn có đến được hay không nhé.', 'error');
          return;
        }

        var answers = {};
        var qNodes = rsvp.querySelectorAll('[data-v4-question]');
        for (var qi = 0; qi < qNodes.length; qi++) {
          var q = qNodes[qi];
          var qid = q.getAttribute('data-v4-question');
          if (!qid) continue;
          var qg = q.querySelector('[role="radiogroup"]');
          var qInput = q.querySelector('input, select, textarea');
          answers[qid] = qg ? (qg.getAttribute('data-value') || '') : (qInput ? qInput.value.trim() : '');
        }

        var phone = rsvp.elements.phone ? rsvp.elements.phone.value.trim() : '';
        var side = rsvp.elements.side ? rsvp.elements.side.value.trim() : (answers.side || '');
        var guests = rsvp.elements.guests ? rsvp.elements.guests.value.trim() : (answers.guests || '');
        var note = rsvp.elements.note ? rsvp.elements.note.value.trim() : '';
        var website = rsvp.elements.website ? rsvp.elements.website.value : '';

        var submitBtn = rsvp.querySelector('[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        setStatus(rsvp, '', '');

        client.submitRsvp({
          name: name,
          attending: att === 'yes',
          phone: phone,
          side: side,
          guests: guests,
          note: note,
          answers: answers,
          website: website
        }).then(function (res) {
          if (res && res.ok) {
            if (submitBtn) submitBtn.textContent = 'Đã gửi';
            setStatus(
              rsvp,
              att === 'yes'
                ? 'Cảm ơn bạn! Hẹn gặp bạn trong ngày vui.'
                : 'Cảm ơn bạn đã báo cho chúng mình.',
              'success'
            );
          } else {
            if (submitBtn) submitBtn.disabled = false;
            setStatus(rsvp, (res && (res.message || res.error)) || 'Chưa gửi được, bạn thử lại nhé.', 'error');
          }
        }).catch(function () {
          if (submitBtn) submitBtn.disabled = false;
          setStatus(rsvp, 'Chưa gửi được, bạn thử lại nhé.', 'error');
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function init() {
    var musicCtrl = initMusicPlayer();
    initGateOpening(musicCtrl);
    initParallax();
    initCountdown();
    initAlbumAndLightbox();
    initGifts();
    initFormsAndDemoNotice();

    // Anchor jump reveal & auto-scroll stop
    var anchorLinks = doc.querySelectorAll('a[href^="#"]');
    for (var ai = 0; ai < anchorLinks.length; ai++) {
      anchorLinks[ai].addEventListener('click', function () {
        stopAutoScroll();
        win.setTimeout(reveal, 60);
      });
    }

    if (doc.fonts && doc.fonts.ready && typeof doc.fonts.ready.then === 'function') {
      doc.fonts.ready.then(fitNames, fitNames);
    } else {
      win.setTimeout(fitNames, 0);
    }
    win.addEventListener('resize', fitNames, { passive: true });
    doc.addEventListener('wedding:config-ready', fitNames);
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
