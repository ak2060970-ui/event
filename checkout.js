/* Per-ticket prices match the fixed amounts on the branded Razorpay pages. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  const heroVideo = document.querySelector('.rr-hero-video video');
  const soundButton = document.querySelector('.rr-video-unmute');
  const soundNote = document.querySelector('.rr-video-sound-note');
  if (heroVideo && soundButton) {
    const syncSound = () => {
      soundButton.hidden = !heroVideo.muted && heroVideo.volume > 0;
      if (soundNote) soundNote.textContent = soundButton.hidden
        ? 'Sound is on. Use the player controls to adjust it.'
        : 'Your browser requires a tap to enable sound.';
    };
    heroVideo.addEventListener('volumechange', syncSound);
    soundButton.addEventListener('click', () => {
      heroVideo.muted = false;
      if (heroVideo.volume === 0) heroVideo.volume = 1;
      heroVideo.play().then(syncSound).catch(() => {
        heroVideo.muted = true;
        syncSound();
      });
    });
    heroVideo.muted = false;
    heroVideo.play().then(syncSound).catch(() => {
      heroVideo.muted = true;
      syncSound();
      heroVideo.play().catch(() => {});
    });
  }
  const config = window.RRPayments;
  if (!config) return;
  const sticky = document.getElementById('rr-sticky');
  const ticketSection = document.getElementById('participate');
  const mobileLayout = matchMedia('(max-width: 767px)');
  const showSticky = () => {
    const bounds = ticketSection?.getBoundingClientRect();
    const viewingTickets = mobileLayout.matches && bounds && bounds.top < innerHeight && bounds.bottom > 0;
    const visible = scrollY >= 500 && !viewingTickets;
    sticky?.classList.toggle('translate-y-full', !visible);
    document.body.classList.toggle('rr-booking-visible', visible);
    if (sticky) sticky.inert = !visible;
  };
  addEventListener('scroll', showSticky, {passive: true});
  addEventListener('resize', showSticky, {passive: true}); showSticky();
  const cards = [...document.querySelectorAll('.rr-pass-card')].map(card => ({
    tier: card.querySelector('h3').textContent.trim().toLowerCase(),
    price: card.querySelector('.rr-pass-price strong, .rr-pass-banner strong'), link: card.querySelector('a')
  })).filter(card => config.passes[card.tier]);
  for (const c of cards) {
    const pass = config.passes[c.tier];
    if (pass.url) c.link.href = pass.url;
    c.link.addEventListener('click', event => {
      if (Date.now() / 1000 >= config.eventEnd) event.preventDefault();
    });
  }
  document.querySelectorAll('a').forEach(link => {
    if (link.textContent.trim() === 'Book My Seat' && !link.closest('.rr-pass-card')) link.href = '#participate';
  });
  function render() {
    const now = Date.now() / 1000;
    const closed = now >= config.eventEnd;
    if (closed) {
      for (const c of cards) {
        c.link.textContent = 'Bookings closed';
        c.link.setAttribute('aria-disabled', 'true');
      }
    }
  }
  render();
  setInterval(render, 60000);
  document.addEventListener('visibilitychange', render);
});
