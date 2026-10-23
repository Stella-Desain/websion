/* One responsive background video; text and links remain regular HTML. */
(() => {
  'use strict';
  window.WebsionHero = {
    mount(frame) {
      if (!frame) return null;
      const video = frame.querySelector('.hero-video');
      const mobile = window.matchMedia('(max-width: 600px)');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      let visible = false;
      let destroyed = false;
      let generation = 0;
      let source = '';
      const running = () => !destroyed && visible && !document.hidden && !reduced.matches;
      const selectSource = () => {
        const next = mobile.matches ? video.dataset.mobileSrc : video.dataset.desktopSrc;
        if (next === source) return;
        generation++;
        video.pause();
        source = next;
        frame.dataset.heroVideoReady = 'false';
        frame.dataset.heroVideoVariant = mobile.matches ? 'mobile' : 'desktop';
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.src = next;
        video.load();
      };
      const sync = () => {
        frame.dataset.heroVideoPaused = String(!running());
        if (!running()) { video.pause(); return; }
        selectSource();
        const current = generation;
        video.play().catch(() => {
          if (destroyed || current !== generation || !running()) return;
          frame.dataset.heroVideoPaused = 'true';
        });
      };
      const onPlaying = () => {
        if (!running()) { video.pause(); return; }
        frame.dataset.heroVideoReady = 'true';
        frame.dataset.heroVideoPaused = 'false';
      };
      const onError = () => {
        frame.dataset.heroVideoReady = 'false';
        frame.dataset.heroVideoError = 'true';
        frame.dataset.heroVideoPaused = 'true';
      };
      const onBreakpoint = () => {
        generation++;
        source = '';
        video.pause();
        video.removeAttribute('src');
        video.load();
        frame.dataset.heroVideoReady = 'false';
        sync();
      };
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      }, { threshold: 0 });
      video.addEventListener('playing', onPlaying);
      video.addEventListener('error', onError);
      mobile.addEventListener('change', onBreakpoint);
      reduced.addEventListener('change', sync);
      document.addEventListener('visibilitychange', sync);
      observer.observe(frame);
      return {
        destroy() {
          destroyed = true;
          generation++;
          observer.disconnect();
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
