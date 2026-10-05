// Shared utilities for JKT48 Show Theater

// Canonical generation colors — used across ALL pages
const GEN_COLORS = {
  3: '#ec4899', 6: '#22c55e', 7: '#15803d', 8: '#1e40af',
  9: '#06b6d4', 10: '#38bdf8', 11: '#f97316', 12: '#fde68a',
  13: '#facc15', 14: '#e879f9'
};

// Security: escape HTML to prevent XSS
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Parse WIB (UTC+7) date+time strings into a Date object
function parseWIB(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}+07:00`);
}

// Relative luminance of a #rgb/#rrggbb colour (0 = black, 1 = white).
// Used to pick readable foreground colours on generation-coloured cards.
function colorChannels(hex) {
  let s = String(hex || '').trim().replace('#', '');
  if (s.length === 3) s = s.split('').map(c => c + c).join('');
  if (s.length < 6) return null;
  const r = parseInt(s.slice(0, 2), 16);
  const g = parseInt(s.slice(2, 4), 16);
  const b = parseInt(s.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return [r, g, b].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
}

// True when dark text reads better than white text on the given background.
function isLightColor(hex) {
  const rgb = colorChannels(hex);
  if (!rgb) return true;
  const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  const vsWhite = 1.05 / (lum + 0.05);            // contrast against #fff
  const vsDark = (lum + 0.05) / (0.0086 + 0.05);  // contrast against #12121a
  return vsDark > vsWhite;
}

// Keep --site-header-h in sync with the real header height.
// The layout CSS positions fixed/scroll panels with
// `top: var(--site-header-h, 80px)`, so the value must follow the header.
(function syncSiteHeaderHeight() {
  const update = () => {
    const header = document.querySelector('.main-header') || document.querySelector('header');
    if (!header) return;
    const h = Math.round(header.getBoundingClientRect().height);
    if (h > 0) document.documentElement.style.setProperty('--site-header-h', h + 'px');
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', update);
  } else {
    update();
  }
  window.addEventListener('load', update);
  window.addEventListener('resize', update);
  if ('ResizeObserver' in window) {
    window.addEventListener('DOMContentLoaded', () => {
      const header = document.querySelector('.main-header') || document.querySelector('header');
      if (header) new ResizeObserver(update).observe(header);
    });
  }
})();

// The year footer only reveals once the content is fully scrolled.
// Some pages scroll the window, others scroll an inner panel, so look for
// whichever element actually overflows.
//
// PERHATIAN PERFORMA: fungsi ini dipanggil dari scroll handler, jadi harus
// murah. Elemen di-cache (jangan querySelector tiap frame), dan
// ResizeObserver TIDAK boleh.observe(document.body) — perubahan tinggi
// body akan memicu update -> toggle class -> perubahan tinggi lagi
// (feedback loop) yang membuat halaman "mantal-mantal" saat scroll.
(function footerRevealsAtScrollEnd() {
  const SCROLLERS = ['.right-panel', '.show-right-panel', '.shows-section', '.content'];

  let footer = null;
  let scroller = null;
  let lastState = null;
  let queued = false;

  function resolve() {
    footer = document.querySelector('.detail-footer');
    scroller = null;
    for (const sel of SCROLLERS) {
      const el = document.querySelector(sel);
      if (el && el.scrollHeight - el.clientHeight > 4) { scroller = el; break; }
    }
    if ('ResizeObserver' in window) {
      // observing the inner scroller is safe (its size does not depend on
      // the footer's visibility). Never observe <body> here.
      if (window.__footerRO) window.__footerRO.disconnect();
      const ro = new ResizeObserver(() => schedule());
      ro.observe(document.documentElement);
      window.__footerRO = ro;
    }
  }

  function isAtEnd() {
    if (scroller) {
      return scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 8;
    }
    const doc = document.documentElement;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 0);
    return maxScroll <= 4 || window.scrollY >= maxScroll - 8;
  }

  function apply() {
    if (!footer) return;
    // Sekali footer muncul, ia TIDAK disembunyikan lagi.
    // Sebelumnya state bisa bolak-balik: tinggi halaman berubah sedikit
    // (mis. gambar banner yang selesai dimuat) -> maxScroll berubah ->
    // hitungan "sudah di akhir" berubah -> class toggle -> halaman
    // bergeser lagi. Di HP itu terlihat sebagai halaman yang
    // "mantal-mantal" saat scroll. Latch satu arah menghapus putaran itu.
    if (isAtEnd()) lastState = true;
    else if (lastState === null) lastState = false;
    if (lastState === null) return;
    if (footer.classList.contains('is-visible') !== lastState) {
      footer.classList.toggle('is-visible', lastState);
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    const run = () => { queued = false; apply(); };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run);
    else setTimeout(run, 16);
  }

  function bind() {
    resolve();
    lastState = null;
    apply();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', () => { resolve(); schedule(); });
    window.addEventListener('load', () => { resolve(); schedule(); });
    // footer + lists are injected by the page scripts, so watch for changes
    if ('MutationObserver' in window && document.body) {
      new MutationObserver(() => {
        // re-resolve hanya kalau elemen yang di-cache benar-benar hilang,
        // bukan setiap ada mutasi DOM
        if (!footer || !document.body.contains(footer)) resolve();
        schedule();
      }).observe(document.body, { childList: true, subtree: true });
    }
    if ('ResizeObserver' in window && scroller) {
      const ro = new ResizeObserver(() => schedule());
      SCROLLERS.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) ro.observe(el);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
