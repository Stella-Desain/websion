(() => {
  'use strict';
  window.WebsionFooterCTA = {
    mount(button) {
      if (!button) return null;
      const label = button.querySelector('.ws-footer__slide-label');
      if (!label) return null;
      const originalLabel = label.textContent;
      let start = 0;
      let startY = 0;
      let distance = 0;
      let dragging = false;
      let dragged = false;
      let opening = false;
      let pointerId = null;
      let suppressClick = false;
      let resetTimer = 0;
      const maximum = () => Math.max(0, button.clientWidth - button.clientHeight);
      const paint = value => {
        distance = Math.max(0, Math.min(maximum(), value));
        button.style.setProperty('--slide-x', `${distance}px`);
      };
      const releasePointer = () => {
        const capturedId = pointerId;
        pointerId = null;
        if (capturedId !== null && button.hasPointerCapture(capturedId)) {
          button.releasePointerCapture(capturedId);
        }
      };
      const reset = () => {
        opening = false;
        dragging = false;
        button.dataset.dragging = 'false';
        button.dataset.opening = 'false';
        label.textContent = originalLabel;
        paint(0);
      };
      const activate = () => {
        if (opening) return;
        opening = true;
        button.dataset.opening = 'true';
        label.textContent = 'Membuka WhatsApp…';
        paint(maximum());
        resetTimer = window.setTimeout(() => {
          resetTimer = 0;
          reset();
        }, 1800);
        window.open(`https://wa.me/${button.dataset.whatsapp}?text=${encodeURIComponent(button.dataset.message)}`, '_blank', 'noopener,noreferrer');
      };
      const down = event => {
        if (opening || dragging || event.button !== 0 || event.isPrimary === false) return;
        dragging = true;
        dragged = false;
        suppressClick = false;
        start = event.clientX;
        startY = event.clientY;
        pointerId = event.pointerId;
        button.dataset.dragging = 'true';
        button.setPointerCapture(pointerId);
      };
      const updatePosition = event => {
        const offset = event.clientX - start;
        if (Math.abs(offset) > 6 || Math.abs(event.clientY - startY) > 6) dragged = true;
        paint(offset);
        label.textContent = distance >= maximum() * .9 ? 'Lepas untuk konsultasi' : originalLabel;
      };
      const move = event => {
        if (!dragging || event.pointerId !== pointerId) return;
        updatePosition(event);
      };
      const up = event => {
        if (!dragging || event.pointerId !== pointerId) return;
        updatePosition(event);
        dragging = false;
        suppressClick = dragged;
        button.dataset.dragging = 'false';
        releasePointer();
        if (maximum() > 0 && distance >= maximum() * .9) activate();
        else reset();
      };
      const cancel = event => {
        if (!dragging || event.pointerId !== pointerId) return;
        dragging = false;
        suppressClick = true;
        releasePointer();
        reset();
      };
      const click = event => {
        event.preventDefault();
        // A drag also produces a click; consume it without opening a second tab.
        // Native keyboard / assistive technology clicks remain available.
        if (suppressClick && event.detail !== 0) {
          suppressClick = false;
          return;
        }
        suppressClick = false;
        activate();
      };
      button.addEventListener('pointerdown', down);
      button.addEventListener('pointermove', move);
      button.addEventListener('pointerup', up);
      button.addEventListener('pointercancel', cancel);
      button.addEventListener('lostpointercapture', cancel);
      button.addEventListener('click', click);
      return {
        destroy() {
          window.clearTimeout(resetTimer);
          resetTimer = 0;
          dragging = false;
          releasePointer();
          suppressClick = false;
          reset();
          button.removeEventListener('pointerdown', down);
          button.removeEventListener('pointermove', move);
          button.removeEventListener('pointerup', up);
          button.removeEventListener('pointercancel', cancel);
          button.removeEventListener('lostpointercapture', cancel);
          button.removeEventListener('click', click);
        }
      };
    }
  };
})();
