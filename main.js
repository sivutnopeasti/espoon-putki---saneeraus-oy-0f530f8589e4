/* =============================================
   ESPOON PUTKI & SANEERAUS OY — main.js
   ============================================= */

'use strict';

/* --------------------------------------------------
   1. MOBIILINAVIGAATIO
   navigaatio: liukuu ylhäältä alas max-height-tekniikalla
   -------------------------------------------------- */
(function initNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  function openMenu() {
    navLinks.classList.add('is-open');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Sulje valikko');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Avaa valikko');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Sulje linkkiä klikatessa
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Sulje Escape-näppäimellä
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // Sulje klikatessa ulkopuolelle
  document.addEventListener('click', e => {
    if (
      navLinks.classList.contains('is-open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });
})();


/* --------------------------------------------------
   2. NAV-LINKIT: hover_linkit – data-text attribuutti
   Lisätään jokaiselle nav-linkille data-text jotta
   CSS ::after-pseudoelementti saa oikean tekstin
   -------------------------------------------------- */
(function initNavHoverText() {
  document.querySelectorAll('.nav-link:not(.nav-cta-link)').forEach(link => {
    const text = link.textContent.trim();
    link.setAttribute('data-text', text);
    // Kääri teksti span.link-inner-elementtiin jos ei jo kääritty
    if (!link.querySelector('.link-inner')) {
      link.innerHTML = `<span class="link-inner">${text}</span>`;
      link.setAttribute('data-text', text);
    }
  });
})();


/* --------------------------------------------------
   3. STICKY HEADER – varjo scrollilla
   -------------------------------------------------- */
(function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 20) {
          header.style.boxShadow = '0 4px 24px rgba(0,0,0,0.38)';
        } else {
          header.style.boxShadow = '0 2px 12px rgba(0,0,0,0.25)';
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* --------------------------------------------------
   4. HERO – VAIHTUVA TEKSTI (hero_teksti)
   3 sanaa vaihtuu opacity-häivytyksellä 3s syklissä
   -------------------------------------------------- */
(function initRotatingText() {
  const el = document.querySelector('.hero-rotating-text');
  if (!el) return;

  const words = ['Nopeasti.', 'Huolella.', 'Sovitusti.'];
  let index = 0;

  function rotate() {
    // Häivytä ulos
    el.style.opacity = '0';

    setTimeout(() => {
      index = (index + 1) % words.length;
      el.textContent = words[index];
      // Häivytä sisään
      el.style.opacity = '1';
    }, 500);
  }

  // Varmista alkutila
  el.style.transition = 'opacity 0.5s ease';
  el.style.opacity = '1';
  el.textContent = words[0];

  setInterval(rotate, 3000);
})();


/* --------------------------------------------------
   5. SCROLL REVEAL – IntersectionObserver
   scroll_sisaantulo: translateX -40px→0, opacity 0→1
   -------------------------------------------------- */
(function initScrollReveal() {
  const items = document.querySelectorAll('.scroll-reveal');
  if (!items.length) return;

  // Tarkista reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  items.forEach(el => observer.observe(el));
})();


/* --------------------------------------------------
   6. STATS / EDISTYMISPALKIT (luvut_stats)
   Palkki täyttyy vasemmalta oikealle kun tulee näkyviin.
   Leveys luetaan --target-width CSS-muuttujasta.
   MutationObserver kuuntelee .stat-value muutoksia.
   -------------------------------------------------- */
(function initStatBars() {
  function getTargetWidth(barEl) {
    const raw = barEl.style.getPropertyValue('--target-width');
    if (!raw) return 0;
    return parseInt(raw, 10) || 0;
  }

  function animateBar(barEl) {
    if (!barEl) return;
    const target = getTargetWidth(barEl);
    // Nollaa ensin
    barEl.style.transition = 'none';
    barEl.style.width = '0%';
    // Pakota reflow
    void barEl.offsetWidth;
    // Animoi
    barEl.style.transition = 'width 1.2s ease-out';
    barEl.style.width = target + '%';
  }

  const statItems = document.querySelectorAll('.stat-item');
  if (!statItems.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target.querySelector('.stat-bar');
          if (prefersReduced) {
            if (bar) bar.style.width = getTargetWidth(bar) + '%';
          } else {
            animateBar(bar);
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  statItems.forEach(item => observer.observe(item));

  // MutationObserver: reagoi .stat-value tekstimuutoksiin
  document.querySelectorAll('.stat-value').forEach(v => {
    new MutationObserver(() => {
      const barEl = v.closest('.stat-item')?.querySelector('.stat-bar');
      if (barEl) animateBar(barEl);
    }).observe(v, { childList: true, characterData: true, subtree: true });
  });
})();


/* --------------------------------------------------
   7. FAQ ACCORDION
   Smooth max-height animaatio, + muuttuu × kun auki
   -------------------------------------------------- */
(function initFAQ() {
  const questions = document.querySelectorAll('.faq-question');
  if (!questions.length) return;

  function closeItem(btn) {
    const answerId = btn.getAttribute('aria-controls');
    const answer   = document.getElementById(answerId);
    if (!answer) return;

    btn.setAttribute('aria-expanded', 'false');
    answer.style.maxHeight   = '0';
    answer.style.paddingBottom = '0';

    const icon = btn.querySelector('.faq-icon');
    if (icon) icon.textContent = '+';

    // Palauta hidden kun animaatio valmis
    const onEnd = () => {
      answer.setAttribute('hidden', '');
      answer.removeEventListener('transitionend', onEnd);
    };
    answer.addEventListener('transitionend', onEnd);
  }

  function openItem(btn) {
    const answerId = btn.getAttribute('aria-controls');
    const answer   = document.getElementById(answerId);
    if (!answer) return;

    answer.removeAttribute('hidden');
    btn.setAttribute('aria-expanded', 'true');

    // Pakota reflow ennen animointia
    void answer.offsetHeight;

    answer.style.maxHeight     = answer.scrollHeight + 'px';
    answer.style.paddingBottom = '1.25rem';

    const icon = btn.querySelector('.faq-icon');
    if (icon) icon.textContent = '×';
  }

  questions.forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Sulje kaikki muut
      questions.forEach(other => {
        if (other !== btn && other.getAttribute('aria-expanded') === 'true') {
          closeItem(other);
        }
      });

      // Togglea klikattu
      if (isExpanded) {
        closeItem(btn);
      } else {
        openItem(btn);
      }
    });

    // Keyboard: Enter ja Space
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
})();


/* --------------------------------------------------
   8. YHTEYDENOTTOLOMAKE
   lomake: fokusanimaatio CSS:ssä, validointi + Formspree
   -------------------------------------------------- */
(function initContactForm() {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  function showStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.className   = 'form-status ' + type;
  }

  function clearStatus() {
    if (!status) return;
    status.textContent = '';
    status.className   = 'form-status';
  }

  function validateField(field) {
    if (field.required && field.value.trim() === '') {
      field.classList.add('error');
      return false;
    }
    if (field.type === 'email' && field.value.trim() !== '') {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(field.value.trim())) {
        field.classList.add('error');
        return false;
      }
    }
    field.classList.remove('error');
    return true;
  }

  function validateAll() {
    let valid = true;
    form.querySelectorAll('input, textarea').forEach(field => {
      if (!validateField(field)) valid = false;
    });
    return valid;
  }

  // Reaaliaikainen validointi
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(field);
      clearStatus();
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      showStatus('Täytä pakolliset kentät ennen lähettämistä.', 'error');
      // Vie fokus ensimmäiseen virhekenttään
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    const submitBtn  = form.querySelector('[type="submit"]');
    const origText   = submitBtn.textContent;
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Lähetetään...';
    clearStatus();

    try {
      const res = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        showStatus('Tarjouspyyntö lähetetty. Otamme yhteyttä pian.', 'success');
        form.reset();
        form.querySelectorAll('input, textarea').forEach(f => f.classList.remove('error'));
      } else {
        let msg = 'Lähetys epäonnistui. Soita suoraan tai yritä uudelleen.';
        try {
          const json = await res.json();
          if (json.errors?.length) {
            msg = json.errors.map(err => err.message).join(' ');
          }
        } catch (_) { /* ignore */ }
        showStatus(msg, 'error');
      }
    } catch (_) {
      showStatus('Verkkovirhe. Tarkista yhteys ja yritä uudelleen.', 'error');
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = origText;
    }
  });
})();


/* --------------------------------------------------
   9. SMOOTH SCROLL – ankkurilinkit
   -------------------------------------------------- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Siirrä fokus kohteeseen saavutettavuuden vuoksi
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();