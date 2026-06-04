/* Cherry Creek Treatment Center — Main JS */

/* ── Mobile nav open / close ── */
const mobileBtn   = document.querySelector('.mobile-menu-btn');
const mobileNav   = document.querySelector('.mobile-nav');
const mobileClose = document.querySelector('.mobile-nav-close');

mobileBtn   && mobileBtn.addEventListener('click',  () => mobileNav.classList.add('open'));
mobileClose && mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
mobileNav   && mobileNav.addEventListener('click', e => {
  if (e.target === mobileNav) mobileNav.classList.remove('open');
});

/* ── Mobile nav accordion (Programs / Services) ── */
document.querySelectorAll('.mob-nav-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const sub    = btn.nextElementSibling;
    const isOpen = sub.classList.contains('open');
    document.querySelectorAll('.mob-nav-sub').forEach(s => s.classList.remove('open'));
    document.querySelectorAll('.mob-nav-toggle').forEach(b => b.classList.remove('open'));
    if (!isOpen) {
      sub.classList.add('open');
      btn.classList.add('open');
    }
  });
});

/* ── Active nav link highlight ── */
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
});

/* ── Sticky nav shadow ── */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (!navbar) return;
  navbar.style.boxShadow = window.scrollY > 10
    ? '0 4px 20px rgba(0,0,0,.12)'
    : '0 2px 12px rgba(0,0,0,.07)';
}, { passive: true });

/* ── Testimonial dots ── */
document.querySelectorAll('.t-dot').forEach((dot, _i, dots) => {
  dot.addEventListener('click', () => {
    dots.forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });
});

/* ── AOS (Animate On Scroll) — auto-tag + init ── */
if (typeof AOS !== 'undefined') {
  /* Map of selector → [animation, per-sibling stagger ms] */
  const aosRules = [
    ['.section-header',      'fade-up',     0  ],
    ['.info-card',           'fade-up',     90 ],
    ['.service-card',        'fade-up',     80 ],
    ['.team-card',           'fade-up',     80 ],
    ['.t-card',              'fade-up',     100],
    ['.blog-featured',       'fade-right',  0  ],
    ['.blog-card',           'fade-left',   80 ],
    ['.bp-card',             'fade-up',     80 ],
    ['.prog-card',           'fade-up',     100],
    ['.value-card',          'fade-up',     80 ],
    ['.ci-item',             'fade-right',  80 ],
    ['.ins-logo-card',       'zoom-in',     60 ],
    ['.sidebar-card',        'fade-up',     0  ],
    ['.prog-feature',        'fade-right',  60 ],
    ['.teen-highlight',      'fade-right',  60 ],
    ['.about-feature',       'fade-up',     60 ],
    ['.about-image',         'fade-right',  0  ],
    ['.about-content',       'fade-left',   0  ],
    ['.mission-content',     'fade-left',   0  ],
    ['.sd-content',          'fade-left',   0  ],
    ['.sd-image',            'fade-right',  0  ],
    ['.prog-detail-content', 'fade-left',   0  ],
    ['.prog-detail-image',   'fade-right',  0  ],
    ['.contact-info',        'fade-right',  0  ],
    ['.contact-form-wrap',   'fade-left',   0  ],
    ['.stats-bar .stat-item','zoom-in',     80 ],
    ['.ts-step',             'fade-up',     60 ],
  ];

  aosRules.forEach(([selector, anim, stagger]) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      if (el.hasAttribute('data-aos')) return;
      el.setAttribute('data-aos', anim);
      if (stagger > 0) el.setAttribute('data-aos-delay', String(i * stagger));
    });
  });

  AOS.init({
    duration: 620,
    easing:   'ease-out-cubic',
    once:     true,
    offset:   60,
  });
}

/* ── Hero headline word morph ── */
const morphEl = document.getElementById('morphWord');
if (morphEl) {
  const words = ['Strength', 'Healing', 'Hope', 'Recovery', 'Freedom'];
  let idx = 0;
  setInterval(() => {
    morphEl.classList.add('is-hiding');
    setTimeout(() => {
      idx = (idx + 1) % words.length;
      morphEl.textContent = words[idx];
      morphEl.classList.remove('is-hiding');
    }, 380);
  }, 2800);
}

/* ── Service pathway timeline ── */
const tsWrap  = document.querySelector('.service-timeline');
const tsSteps = document.querySelectorAll('.ts-step');

if (tsWrap && tsSteps.length) {
  const activate = step => {
    tsSteps.forEach(s => {
      s.classList.remove('ts-active', 'ts-dim');
      if (s !== step) s.classList.add('ts-dim');
    });
    step.classList.add('ts-active');
  };
  const reset = () => tsSteps.forEach(s => s.classList.remove('ts-active', 'ts-dim'));

  /* hover (desktop) */
  tsSteps.forEach(step => step.addEventListener('mouseenter', () => activate(step)));
  tsWrap.addEventListener('mouseleave', reset);

  /* click / tap (mobile toggle) */
  tsSteps.forEach(step => step.addEventListener('click', () => {
    if (step.classList.contains('ts-active')) reset();
    else activate(step);
  }));
}

/* ── Contact form ── */
const contactForm = document.getElementById('contactForm');
contactForm && contactForm.addEventListener('submit', e => {
  e.preventDefault();
  const btn = contactForm.querySelector('.form-submit');
  btn.innerHTML = 'Message Sent! ✓';
  btn.style.background = '#2a6e1c';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = 'Send Message &amp; Request Callback <i class="fa-solid fa-arrow-right"></i>';
    btn.style.background = '';
    btn.disabled = false;
    contactForm.reset();
  }, 4000);
});

/* ── Animated counters ── */
function animateCount(el) {
  const target   = parseFloat(el.dataset.target);
  const suffix   = el.dataset.suffix || '';
  const duration = 1900;
  const start    = performance.now();

  (function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); /* ease-out-cubic */
    const value    = target * eased;
    el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  })(start);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCount(e.target); counterObs.unobserve(e.target); }
  });
}, { threshold: 0.55 });

document.querySelectorAll('[data-target]').forEach(c => counterObs.observe(c));
