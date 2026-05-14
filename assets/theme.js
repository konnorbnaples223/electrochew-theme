/* ElectroChew theme.js — animations, parallax, cursor effects */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Header scroll shadow ── */
  var header = document.getElementById('ec-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── Mobile menu toggle ── */
  var toggle = document.getElementById('ec-mobile-toggle');
  var mobileNav = document.getElementById('ec-mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      var spans = toggle.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else {
        spans.forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }

  /* ── General scroll-reveal (.ec-anim) ── */
  var animObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        animObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.ec-anim').forEach(function (el) { animObs.observe(el); });

  /* ── Hero v3: cursor parallax + product tilt ── */
  initHeroEffects();

  /* ── Background parallax on scroll ── */
  initScrollParallax();

  /* ── Smooth section fade-up (stagger) ── */
  initSectionReveal();

});

/* ────────────────────────────────────────────────────────────── */
/* Hero cursor parallax + 3D product tilt                        */
/* ────────────────────────────────────────────────────────────── */
function initHeroEffects() {
  var hero = document.querySelector('.ec-hv3');
  if (!hero) return;

  var floats = hero.querySelectorAll('[data-hero-float]');
  var tiltEl = hero.querySelector('[data-tilt]');
  var bgImg = hero.querySelector('.ec-hv3-bg-img');

  var mx = 0, my = 0;
  var cx = 0.5, cy = 0.5;
  var rafId = null;
  var rect = hero.getBoundingClientRect();

  /* Re-measure on resize */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { rect = hero.getBoundingClientRect(); }, 150);
  }, { passive: true });

  hero.addEventListener('mousemove', function (e) {
    rect = hero.getBoundingClientRect();
    mx = (e.clientX - rect.left) / rect.width;
    my = (e.clientY - rect.top) / rect.height;
    if (!rafId) rafId = requestAnimationFrame(applyEffects);
  }, { passive: true });

  hero.addEventListener('mouseleave', function () {
    /* Smoothly reset on leave */
    mx = 0.5; my = 0.5;
    if (!rafId) rafId = requestAnimationFrame(applyEffects);
  }, { passive: true });

  function applyEffects() {
    rafId = null;

    /* Ease toward target */
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;

    var dx = cx - 0.5; /* -0.5 to 0.5 */
    var dy = cy - 0.5;

    /* Floating element parallax */
    floats.forEach(function (fl) {
      var speed = parseFloat(fl.getAttribute('data-hero-float')) || 0.02;
      var tx = dx * speed * rect.width;
      var ty = dy * speed * rect.height;
      fl.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
    });

    /* Product 3D tilt */
    if (tiltEl) {
      var tiltX = dy * -18; /* pitch */
      var tiltY = dx * 22;  /* yaw */
      tiltEl.style.transform =
        'perspective(900px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
    }

    /* Background subtle counter-shift */
    if (bgImg) {
      bgImg.style.transform =
        'translate(' + (dx * -18) + 'px, ' + (dy * -10) + 'px) scale(1.04)';
    }

    /* Keep animating if not settled */
    if (Math.abs(cx - mx) > 0.001 || Math.abs(cy - my) > 0.001) {
      rafId = requestAnimationFrame(applyEffects);
    }
  }
}

/* ────────────────────────────────────────────────────────────── */
/* Scroll-based parallax for bg images on panels                 */
/* ────────────────────────────────────────────────────────────── */
function initScrollParallax() {
  var panels = document.querySelectorAll('[data-parallax-panel]');
  if (!panels.length) return;

  function onScroll() {
    panels.forEach(function (panel) {
      var img = panel.querySelector('.ec-vf-img, .ec-hv3-bg-img');
      if (!img) return;
      var rect = panel.getBoundingClientRect();
      var progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      var shift = (progress - 0.5) * 80; /* px movement */
      img.style.transform = 'translateY(' + shift + 'px) scale(1.15)';
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ────────────────────────────────────────────────────────────── */
/* Stagger reveal for sections as they enter viewport            */
/* ────────────────────────────────────────────────────────────── */
function initSectionReveal() {
  /* Additional stagger classes beyond ec-anim */
  var staggerItems = document.querySelectorAll('.ec-ben-card, .ec-hiw-step, .ec-vf-text-inner > *');
  if (!staggerItems.length) return;

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

  staggerItems.forEach(function (el) {
    if (!el.classList.contains('ec-anim')) {
      el.classList.add('ec-anim');
      obs.observe(el);
    }
  });
}
