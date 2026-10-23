/* One responsive footer movie. Its Websion lettering is already in the pixels. */
(() => {
  'use strict';
  window.WebsionFooter = {
    mount(footer) {
      if (!footer) return null;
      const scene = footer.querySelector('.ws-footer__background');
      const video = scene && scene.querySelector('.ws-footer__video');
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
        footer.dataset.footerVideoReady = 'false';
        footer.dataset.footerVideoError = 'false';
        footer.dataset.footerVideoVariant = mobile.matches ? 'mobile' : 'desktop';
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.src = next;
        video.load();
      };
      const sync = () => {
        selectSource();
        footer.dataset.footerVideoPaused = String(!running());
        if (!running() || !source) { video.pause(); return; }
        const current = generation;
        video.play().catch(() => {
          if (!destroyed && current === generation && running()) footer.dataset.footerVideoPaused = 'true';
        });
      };
      const onPlaying = () => {
        if (!running()) { video.pause(); return; }
        footer.dataset.footerVideoReady = 'true';
        footer.dataset.footerVideoPaused = 'false';
      };
      const onError = () => {
        footer.dataset.footerVideoReady = 'false';
        footer.dataset.footerVideoError = 'true';
        footer.dataset.footerVideoPaused = 'true';
      };
      const onBreakpoint = () => {
        generation++;
        source = '';
        video.pause();
        video.removeAttribute('src');
        video.load();
        footer.dataset.footerVideoReady = 'false';
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
      loadObserver.observe(scene);
      playObserver.observe(scene);
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
