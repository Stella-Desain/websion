(function () {
  'use strict';

  window.WebsionNavigation = {
    mount: function (options) {
      var settings = options || {};
      var root = document.documentElement;
      var frame = 0;
      var active = false;
      var media = window.matchMedia('(prefers-reduced-motion: reduce)');
      var clamp = function (value, min, max) { return Math.max(min, Math.min(max, value)); };
      var maxY = function () { return Math.max(0, document.scrollingElement.scrollHeight - window.innerHeight); };
      var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      var position = function (target) {
        var margin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
        return clamp(window.scrollY + target.getBoundingClientRect().top - margin, 0, maxY());
      };
      var resetNudge = function () {
        root.removeAttribute('data-anchor-edge');
        root.style.removeProperty('--anchor-nudge');
      };
      var stop = function () {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        resetNudge();
        if (active && settings.afterScroll) settings.afterScroll();
        active = false;
      };
      var focusTarget = function (target) {
        var temporary = !target.hasAttribute('tabindex');
        if (temporary) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        if (temporary) target.removeAttribute('tabindex');
      };
      var navigate = function (target, hash) {
        stop();
        if (settings.beforeScroll) settings.beforeScroll();
        active = true;
        var start = window.scrollY;
        var end = position(target);
        if (window.location.hash !== hash) window.history.pushState(null, '', hash);
        var finish = function () {
          resetNudge();
          window.scrollTo({ top: position(target), behavior: 'instant' });
          focusTarget(target);
          stop();
        };
        if (media.matches || Math.abs(end - start) < 2) { finish(); return; }

        var direction = end > start ? 1 : -1;
        var recoil = 28;
        var opposite = clamp(start - direction * recoil, 0, maxY());
        var missing = recoil - Math.abs(opposite - start);
        // At a page boundary, nudge just the visible section, keeping the fixed menu still.
        if (missing > 0) root.setAttribute('data-anchor-edge', direction > 0 ? 'top' : 'bottom');
        var started = window.performance.now();
        var anticipation = 200;
        var travel = clamp(Math.abs(end - start) * 0.16, 700, 1600);
        var tick = function (now) {
          var elapsed = now - started;
          var nudge;
          if (elapsed < anticipation) {
            var back = ease(clamp(elapsed / anticipation, 0, 1));
            window.scrollTo({ top: start + (opposite - start) * back, behavior: 'instant' });
            nudge = direction * missing * back;
          } else {
            var progress = clamp((elapsed - anticipation) / travel, 0, 1);
            window.scrollTo({ top: opposite + (end - opposite) * ease(progress), behavior: 'instant' });
            nudge = direction * missing * (1 - ease(clamp((elapsed - anticipation) / 180, 0, 1)));
            if (progress === 1) { finish(); return; }
          }
          if (missing > 0) root.style.setProperty('--anchor-nudge', nudge.toFixed(3) + 'px');
          frame = window.requestAnimationFrame(tick);
        };
        frame = window.requestAnimationFrame(tick);
      };
      var click = function (event) {
        if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        var link = event.target.closest && event.target.closest('a[href]');
        if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
        var url;
        try { url = new URL(link.href, window.location.href); } catch (error) { return; }
        if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search || !url.hash) return;
        var id;
        try { id = decodeURIComponent(url.hash.slice(1)); } catch (error) { return; }
        var target = document.getElementById(id);
        if (!target) return;
        event.preventDefault();
        navigate(target, url.hash);
      };
      var key = function (event) {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].indexOf(event.key) !== -1) stop();
      };
      var motionChange = function () { if (media.matches) stop(); };
      document.addEventListener('click', click);
      window.addEventListener('wheel', stop, { capture: true, passive: true });
      window.addEventListener('touchstart', stop, { passive: true });
      window.addEventListener('pointerdown', stop, { passive: true });
      window.addEventListener('keydown', key);
      window.addEventListener('resize', stop);
      window.addEventListener('popstate', stop);
      window.addEventListener('hashchange', stop);
      media.addEventListener('change', motionChange);
      return {
        destroy: function () {
          stop();
          document.removeEventListener('click', click);
          window.removeEventListener('wheel', stop, true);
          window.removeEventListener('touchstart', stop);
          window.removeEventListener('pointerdown', stop);
          window.removeEventListener('keydown', key);
          window.removeEventListener('resize', stop);
          window.removeEventListener('popstate', stop);
          window.removeEventListener('hashchange', stop);
          media.removeEventListener('change', motionChange);
        }
      };
    }
  };
}());
