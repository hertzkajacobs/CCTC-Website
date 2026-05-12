/* Cherry Creek Treatment Center — Main JS */

/* ── Mobile nav ── */
const mobileBtn  = document.querySelector('.mobile-menu-btn');
const mobileNav  = document.querySelector('.mobile-nav');
const mobileClose= document.querySelector('.mobile-nav-close');

mobileBtn && mobileBtn.addEventListener('click', () => mobileNav.classList.add('open'));
mobileClose && mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
mobileNav && mobileNav.addEventListener('click', e => {
  if (e.target === mobileNav) mobileNav.classList.remove('open');
});

/* ── Smooth active nav link ── */
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
});

/* ── Sticky nav shadow ── */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (!navbar) return;
  navbar.style.boxShadow = window.scrollY > 10
    ? '0 4px 20px rgba(0,0,0,.12)'
    : '0 2px 12px rgba(0,0,0,.07)';
});

/* ── Testimonial dots (cosmetic) ── */
const dots = document.querySelectorAll('.t-dot');
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    dots.forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });
});

/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll(
  '.info-card, .service-card, .team-card, .t-card, .blog-featured, .blog-card, .bp-card'
);

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  io.observe(el);
});

/* ── Contact form ── */
const contactForm = document.getElementById('contactForm');
contactForm && contactForm.addEventListener('submit', e => {
  e.preventDefault();
  const btn = contactForm.querySelector('.form-submit');
  btn.textContent = 'Message Sent!';
  btn.style.background = '#2d5418';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Send Message ↗';
    btn.style.background = '';
    btn.disabled = false;
    contactForm.reset();
  }, 4000);
});

/* ── Animated counters ── */
function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counters = document.querySelectorAll('[data-target]');
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCount(e.target); counterObs.unobserve(e.target); }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObs.observe(c));
