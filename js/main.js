(function () {
  'use strict';

  /* ── LANGUAGE ─────────────────────────────────────────────── */
  var currentLang = localStorage.getItem('nuvora_lang') || 'en';

  function applyLanguage(lang) {
    var t = window.translations[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-opt]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-opt');
      if (t[key] !== undefined) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) el.setAttribute('placeholder', t[key]);
    });

    document.documentElement.lang = lang;

    var elEn = document.getElementById('lang-en');
    var elEs = document.getElementById('lang-es');
    if (elEn && elEs) {
      elEn.classList.toggle('lang-active', lang === 'en');
      elEs.classList.toggle('lang-active', lang === 'es');
    }

    currentLang = lang;
    localStorage.setItem('nuvora_lang', lang);
  }

  var langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', function () {
      applyLanguage(currentLang === 'en' ? 'es' : 'en');
    });
  }

  /* ── NAV SCROLL STATE ─────────────────────────────────────── */
  var navWrap = document.getElementById('nav-wrap');

  function handleNavScroll() {
    if (!navWrap) return;
    if (window.scrollY > 60) {
      navWrap.classList.add('scrolled');
    } else {
      navWrap.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ── MOBILE OVERLAY MENU ──────────────────────────────────── */
  var hamburger   = document.querySelector('.hamburger');
  var overlay     = document.getElementById('mobile-overlay');
  var mobLinks    = document.querySelectorAll('.mob-link');

  function closeMenu() {
    if (!hamburger || !overlay) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburger && overlay) {
    hamburger.addEventListener('click', function () {
      var isOpen = overlay.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    });

    mobLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ── SMOOTH SCROLL (offset for floating nav) ──────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      var offset = window.innerWidth <= 768 ? 72 : 88;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ── HERO ENTRY ANIMATION ─────────────────────────────────── */
  /* Elements with .reveal-hero animate in on page load */
  function triggerHeroAnimations() {
    var heroEls = document.querySelectorAll('.reveal-hero');
    heroEls.forEach(function (el) {
      /* Small rAF so CSS transition is registered first */
      requestAnimationFrame(function () {
        el.classList.add('in-view');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', triggerHeroAnimations);
  } else {
    /* DOMContentLoaded already fired */
    setTimeout(triggerHeroAnimations, 60);
  }

  /* ── SCROLL REVEAL (IntersectionObserver) ─────────────────── */
  var revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ── ACTIVE NAV LINK (section tracking) ──────────────────── */
  var sections  = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a');

  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navAnchors.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.35, rootMargin: '-80px 0px 0px 0px' });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ── CONTACT FORM VALIDATION ──────────────────────────────── */
  var form = document.getElementById('contact-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      var nameEl    = document.getElementById('form-name');
      var phoneEl   = document.getElementById('form-phone');
      var emailEl   = document.getElementById('form-email');
      var serviceEl = document.getElementById('form-service');
      var msgEl     = document.getElementById('form-message');
      var emailRx   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      var valid     = true;

      var req = currentLang === 'es' ? 'Campo requerido' : 'Required';
      var emailErr = currentLang === 'es' ? 'Correo válido requerido' : 'Valid email required';
      var phoneErr = currentLang === 'es' ? 'Mínimo 10 dígitos' : 'Min. 10 digits required';
      var svcErr   = currentLang === 'es' ? 'Seleccione un servicio' : 'Please select a service';

      if (!nameEl.value.trim())                        { showErr(nameEl,    req);      valid = false; }
      if (phoneEl.value.replace(/\D/g,'').length < 10) { showErr(phoneEl,   phoneErr); valid = false; }
      if (!emailRx.test(emailEl.value.trim()))         { showErr(emailEl,   emailErr); valid = false; }
      if (!serviceEl.value)                            { showErr(serviceEl, svcErr);   valid = false; }
      if (!msgEl.value.trim())                         { showErr(msgEl,     req);      valid = false; }

      if (valid) {
        var submitBtn = form.querySelector('.btn-submit');
        var successEl = document.getElementById('form-success');
        var errorEl   = document.getElementById('form-error');

        if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.6'; }
        if (errorEl)   errorEl.style.display = 'none';

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: new FormData(form)
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
          if (data.success) {
            if (successEl) {
              successEl.style.display = 'block';
              form.reset();
              setTimeout(function () { successEl.style.display = 'none'; }, 7000);
            }
          } else {
            if (errorEl) {
              errorEl.textContent = currentLang === 'es'
                ? 'Error al enviar. Por favor intente de nuevo.'
                : 'Failed to send. Please try again.';
              errorEl.style.display = 'block';
            }
          }
        })
        .catch(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
          if (errorEl) {
            errorEl.textContent = currentLang === 'es'
              ? 'Error de conexión. Por favor intente de nuevo.'
              : 'Connection error. Please try again.';
            errorEl.style.display = 'block';
          }
        });
      }
    });
  }

  function showErr(input, msg) {
    input.classList.add('input-error');
    var span = document.createElement('span');
    span.className = 'field-error';
    span.textContent = msg;
    input.parentNode.appendChild(span);
  }

  function clearErrors() {
    if (!form) return;
    form.querySelectorAll('.field-error').forEach(function (e) { e.remove(); });
    form.querySelectorAll('.input-error').forEach(function (e) { e.classList.remove('input-error'); });
  }

  /* ── BACK TO TOP ──────────────────────────────────────────── */
  var btt = document.getElementById('back-to-top');

  if (btt) {
    window.addEventListener('scroll', function () {
      btt.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── INIT LANGUAGE ────────────────────────────────────────── */
  applyLanguage(currentLang);

})();
