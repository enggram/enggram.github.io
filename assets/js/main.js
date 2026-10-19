/* =========================================================
   S. Ram Kumar — portfolio interactions
   Mobile menu, scroll spy, scroll progress, reveal on scroll.
   ========================================================= */
(function () {
  'use strict';

  var nav = document.getElementById('siteNav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var progress = document.getElementById('scrollProgress');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- current year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobile menu ---------- */
  function closeMenu() {
    if (!links || !toggle) return;
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
  }

  function openMenu() {
    links.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('menu-open');
  }

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      if (links.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    // close after picking a destination
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    // esc closes, focus returns to the button
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    // clicking outside closes
    document.addEventListener('click', function (e) {
      if (!links.classList.contains('is-open')) return;
      if (nav.contains(e.target)) return;
      closeMenu();
    });

    // reset state when crossing back to desktop width
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  /* ---------- nav shadow + scroll progress ---------- */
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (nav) nav.classList.toggle('is-scrolled', y > 8);

    if (progress) {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      var pct = scrollable > 0 ? (y / scrollable) * 100 : 0;
      progress.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  onScroll();

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- scroll spy ---------- */
  var navAnchors = links
    ? Array.prototype.slice.call(links.querySelectorAll('a[href^="#"]'))
    : [];
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    navAnchors.forEach(function (a) {
      var match = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', match);
      if (match) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  if (sections.length && 'IntersectionObserver' in window) {
    var visible = {};

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting
          ? entry.intersectionRatio
          : 0;
      });

      var best = null;
      var bestRatio = 0;
      sections.forEach(function (s) {
        var r = visible[s.id] || 0;
        if (r > bestRatio) { bestRatio = r; best = s.id; }
      });

      if (best) setActive(best);
      else if (window.scrollY < 120) setActive('');
    }, {
      rootMargin: '-' + (nav ? nav.offsetHeight + 10 : 78) + 'px 0px -45% 0px',
      threshold: [0, 0.15, 0.4, 0.75, 1]
    });

    sections.forEach(function (s) { spy.observe(s); });
  }
})();
