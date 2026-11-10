/* Repassa a origem da visita ao checkout e às páginas institucionais.
   Sem cookies, armazenamento persistente ou envio de dados em segundo plano. */
(function (root) {
  'use strict';
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'src', 'sck', 'xcod'];
  function withTracking(destination, search) {
    const url = new URL(destination);
    const incoming = new URLSearchParams(search || '');
    keys.forEach(key => {
      const value = incoming.get(key);
      if (value !== null && value.trim() !== '') url.searchParams.set(key, value);
    });
    return url.href;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { withTracking };
  if (!root.document) return;
  root.document.querySelectorAll('a.checkout, a[data-preserve-tracking]').forEach(link => {
    const destination = new URL(link.getAttribute('href'), root.location.href);
    if (link.classList.contains('checkout')) {
      if (destination.protocol !== 'https:' || destination.hostname !== 'pay.hotmart.com') return;
    } else if (destination.origin !== root.location.origin) return;
    link.href = withTracking(destination.href, root.location.search);
  });
})(typeof window !== 'undefined' ? window : globalThis);
