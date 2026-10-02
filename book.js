(() => {
  'use strict';
  const pages = window.BOOK_PAGES;
  const image = document.getElementById('page-image');
  const book = document.getElementById('book');
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  const picker = document.getElementById('page-picker');
  const dots = document.getElementById('dots');
  const grid = document.getElementById('page-grid');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = -1;
  let animation;
  const parsePage = () => {
    const match = location.hash.match(/^#page=(\d+)$/);
    return match ? Math.max(0, Math.min(pages.length - 1, Number(match[1]) - 1)) : 0;
  };
  pages.forEach((page, index) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `${index + 1}: ${page.title}`);
    dot.title = page.title;
    dot.addEventListener('click', () => go(index));
    dots.append(dot);
    const thumbnail = document.createElement('button');
    thumbnail.className = 'thumbnail';
    const preview = document.createElement('img');
    preview.src = page.src; preview.alt = ''; preview.loading = 'lazy';
    preview.width = page.width; preview.height = page.height;
    thumbnail.append(preview, `${String(index + 1).padStart(2, '0')} · ${page.title}`);
    thumbnail.addEventListener('click', () => { go(index); picker.close(); });
    grid.append(thumbnail);
  });
  function show(index) {
    if (index === current) return;
    const old = current;
    current = index;
    const page = pages[current];
    image.src = page.src;
    image.alt = page.title;
    document.getElementById('page-title').textContent = page.title;
    document.getElementById('counter').textContent = `${String(current + 1).padStart(2, '0')} / ${pages.length}`;
    document.getElementById('announcement').textContent = `${page.title}, page ${current + 1} of ${pages.length}`;
    previous.disabled = current === 0;
    next.disabled = current === pages.length - 1;
    [...dots.children, ...grid.children].forEach((button, i) => {
      if (i % pages.length === current) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    animation?.cancel();
    if (old >= 0 && !reducedMotion.matches) {
      const direction = current > old ? 1 : -1;
      animation = book.animate([
        { transform: `rotateY(${direction * 12}deg) translateX(${direction * 8}px)`, opacity: .65 },
        { transform: 'rotateY(0deg) translateX(0px)', opacity: 1 }
      ], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    [current - 1, current + 1].filter(i => i >= 0 && i < pages.length).forEach(i => {
      const preload = new Image(); preload.src = pages[i].src;
    });
  }
  function go(index) {
    const bounded = Math.max(0, Math.min(pages.length - 1, index));
    if (bounded === current) return;
    history.replaceState(null, '', `#page=${bounded + 1}`);
    show(bounded);
  }
  previous.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  document.getElementById('browse').addEventListener('click', () => picker.showModal());
  document.getElementById('close-picker').addEventListener('click', () => picker.close());
  picker.addEventListener('click', event => {
    const rect = picker.getBoundingClientRect();
    if (event.target === picker && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) picker.close();
  });
  window.addEventListener('hashchange', () => show(parsePage()));
  document.addEventListener('keydown', event => {
    if (picker.open || event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    const actions = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: pages.length - 1 };
    if (event.key in actions) { event.preventDefault(); go(actions[event.key]); }
  });
  let start;
  book.addEventListener('pointerdown', event => {
    if (!event.isPrimary) return;
    start = { x: event.clientX, y: event.clientY, id: event.pointerId };
    book.setPointerCapture(event.pointerId);
  });
  book.addEventListener('pointerup', event => {
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) go(current + (dx < 0 ? 1 : -1));
  });
  book.addEventListener('pointercancel', () => { start = null; });
  show(parsePage());
})();
