/* Load one background video for the current viewport, when the process section approaches. */
(() => {
  'use strict';
  window.WebsionProcess = {
    mount(frame) {
      if (!frame) return null;
      const video = frame.querySelector('.mu-video');
      if (!video) return null;
      const mobile = window.matchMedia('(max-width: 600px)');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      let near = false;
      let visible = false;
      let destroyed = false;
      let source = '';
      let generation = 0;
      const running = () => !destroyed && visible && !document.hidden && !reduced.matches;
      const selectSource = () => {
        if (destroyed || !near || document.hidden || reduced.matches) return;
        const next = mobile.matches ? video.dataset.mobileSrc : video.dataset.desktopSrc;
        if (!next || next === source) return;
        generation++;
        video.pause();
        source = next;
        frame.dataset.processVideoReady = 'false';
        frame.dataset.processVideoError = 'false';
        frame.dataset.processVideoVariant = mobile.matches ? 'mobile' : 'desktop';
        video.autoplay = false;
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.src = next;
        video.load();
      };
      const sync = () => {
        selectSource();
        frame.dataset.processVideoPaused = String(!running());
        if (!running() || !source) { video.pause(); return; }
        const current = generation;
        video.play().catch(() => {
          if (destroyed || current !== generation || !running()) return;
          frame.dataset.processVideoPaused = 'true';
        });
      };
      const onPlaying = () => {
        if (!running()) { video.pause(); return; }
        frame.dataset.processVideoReady = 'true';
        frame.dataset.processVideoPaused = 'false';
      };
      const onError = () => {
        frame.dataset.processVideoReady = 'false';
        frame.dataset.processVideoError = 'true';
        frame.dataset.processVideoPaused = 'true';
      };
      const onBreakpoint = () => {
        generation++;
        source = '';
        video.pause();
        video.removeAttribute('src');
        video.load();
        frame.dataset.processVideoReady = 'false';
        sync();
      };
      const loadObserver = new IntersectionObserver(([entry]) => {
        near = entry.isIntersecting;
        sync();
      }, { rootMargin: '200px 0px', threshold: 0 });
      const playObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) near = true;
        sync();
      }, { threshold: 0 });
      video.addEventListener('playing', onPlaying);
      video.addEventListener('error', onError);
      mobile.addEventListener('change', onBreakpoint);
      reduced.addEventListener('change', sync);
      document.addEventListener('visibilitychange', sync);
      loadObserver.observe(frame);
      playObserver.observe(frame);
      return {
        destroy() {
          destroyed = true;
          generation++;
          loadObserver.disconnect();
          playObserver.disconnect();
          video.pause();
          video.removeEventListener('playing', onPlaying);
          video.removeEventListener('error', onError);
          video.removeAttribute('src');
          video.load();
          mobile.removeEventListener('change', onBreakpoint);
          reduced.removeEventListener('change', sync);
          document.removeEventListener('visibilitychange', sync);
        }
      };
    }
  };
})();
