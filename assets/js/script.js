/* Vivek Kulkarni portfolio - interactions
   Part 1: motion and navigation (vanilla JS, no dependencies, runs even if jQuery fails to load)
   Part 2: links, year and contact form (jQuery) */

/* ---- Links taken from your resume. Empty strings stay as inactive placeholders. ---- */
const LINKS = {
  linkedin: 'https://www.linkedin.com/in/vivek-kulkarni-6a478b268/',
  github: 'https://github.com/Vivekk3105',
  gameZoneLive: 'https://games-zone-online.netlify.app/',
  gameZoneCode: 'https://github.com/Vivekk3105/game-zone-website',
  estatoLive: 'https://real-estasto.netlify.app/',
  estatoCode: 'https://github.com/Vivekk3105/estato-real-estate-website',
  aiResumeCode: 'https://github.com/Vivekk3105/ai-resume-analyzer',
  aiEmailCode: 'https://github.com/Vivekk3105/ai-email-assistant',
  certMern: 'https://drive.google.com/file/d/1rqBp6LPMHP4ngbVQWUTvaWzfu8wmEfNw/view?usp=drive_link',
  certMl: 'https://drive.google.com/file/d/1PuuI2N-k7RGLT7I9xqOFUf7-hg0Z2Q-G/view?usp=drive_link',
  certSocial: 'https://drive.google.com/file/d/1I6I7J0XKO6SP8kJBIaxJQxoIGTcWkuf5/view?usp=drive_link'
};
const CONTACT_EMAIL = 'kulkarnivivek8840@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* =====================================================================
   PART 1: MOTION + NAVIGATION (vanilla)
   ===================================================================== */
(function () {
  'use strict';
  const root = document.documentElement;
  try {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktop = window.matchMedia('(min-width: 992px)');
    const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
    const STAGGER = 0.09;

    /* ---------- 1. Scroll reveals (play once) ----------*/

    $$('.reveal-group').forEach(group => {
      const kids = Array.prototype.filter.call(group.children, el => !el.classList.contains('accent-line') && !el.classList.contains('tl-marker'));
      kids.forEach((el, i) => el.style.setProperty('--n', i));
      const parentGroup = group.parentElement && group.parentElement.closest('.reveal-group');
      if (parentGroup) {
        const idx = parseFloat(group.style.getPropertyValue('--n')) || 0;
        group.style.setProperty('--base', (idx * STAGGER + 0.1).toFixed(2) + 's');
        $$('.reveal', group).forEach(el => { if (el.parentElement === group) el.style.setProperty('--base', (idx * STAGGER + 0.1).toFixed(2) + 's'); });
      }
    });

    const topLevel = [];
    $$('.reveal-group, .reveal, .reveal-img').forEach(el => {
      if (el.parentElement && el.parentElement.closest('.reveal-group')) return;
      const node = el.classList.contains('reveal-img') ? el.parentElement : el;
      if (topLevel.indexOf(node) === -1) topLevel.push(node);
    });
    const showAll = () => $$('.reveal-group, .reveal, .reveal-img').forEach(el => el.classList.add('in'));

    if (reduce || !('IntersectionObserver' in window)) {
      showAll();
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          const el = en.target;
          el.classList.add('in');
          $$('.reveal-img', el).forEach(f => f.classList.add('in'));
          $$('.reveal-group', el).forEach(g => g.classList.add('in')); // nested groups play with their parent
          obs.unobserve(el);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      topLevel.forEach(el => io.observe(el));
    }

    /* ---------- 2. Active project (accent line + frame) ---------- */

    const projects = $$('.project');
    if (projects.length && 'IntersectionObserver' in window && !reduce) {
      const po = new IntersectionObserver(entries => {
        entries.forEach(en => en.target.classList.toggle('is-active', en.isIntersecting));
      }, { rootMargin: '-38% 0px -38% 0px' });
      projects.forEach(p => po.observe(p));
    } else {
      projects.forEach(p => p.classList.add('is-active'));
    }

    /* ---------- 3. Track which project previews are on screen (for gentle parallax) ---------- */

    const shots = $$('.shot');
    const visibleShots = new Set();
    if ('IntersectionObserver' in window && !reduce) {
      const so = new IntersectionObserver(entries => {
        entries.forEach(en => en.isIntersecting ? visibleShots.add(en.target) : visibleShots.delete(en.target));
        onScroll();
      }, { rootMargin: '10% 0px 10% 0px' });
      shots.forEach(s => so.observe(s));
    }

    /* ---------- 4. One rAF-throttled, passive scroll handler ---------- */

    const nav = document.getElementById('siteNav');
    const toTop = document.getElementById('toTop');
    const bar = nav && nav.querySelector('.scroll-progress');
    const steps = document.querySelector('.steps');
    let ticking = false;

    function update() {
      const y = window.scrollY || window.pageYOffset;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (nav) nav.classList.toggle('scrolled', y > 10);
      root.classList.toggle('is-scrolled', y > 80);
      if (toTop) toTop.classList.toggle('show', y > 600);
      if (bar) bar.style.transform = 'scaleX(' + Math.min(1, y / max).toFixed(4) + ')';
      if (steps) {
        const r = steps.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
        steps.style.setProperty('--prog', p.toFixed(3));
      }
      // Parallax: image drifts at most +/-10px against the scroll, large screens only
      if (!reduce && desktop.matches) {
        visibleShots.forEach(fig => {
          const r = fig.getBoundingClientRect();
          const p = (r.top + r.height / 2 - window.innerHeight / 2) / (window.innerHeight / 2 + r.height / 2);
          const img = fig.querySelector('img, .cover-art');
          if (img) img.style.setProperty('--py', (Math.max(-1, Math.min(1, p)) * -10).toFixed(1) + 'px');
        });
      }
      ticking = false;
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    /* ---------- 5. In-page links: smooth scroll, move focus, close mobile menu ---------- */

    const collapseEl = document.getElementById('mainNav');
    function closeMenu() {
      if (collapseEl && collapseEl.classList.contains('show') && window.bootstrap) {
        const inst = window.bootstrap.Collapse.getInstance(collapseEl) || new window.bootstrap.Collapse(collapseEl, { toggle: false });
        inst.hide();
      }
    }
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.classList.contains('is-placeholder')) return;
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); // honours scroll-padding-top
      if (history.pushState) history.pushState(null, '', id);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      closeMenu();
    });
    if (toTop) toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      const brand = document.querySelector('.navbar-brand'); if (brand) brand.focus({ preventScroll: true });
    });

    /* ---------- 6. Mobile menu state + staggered links + Escape ---------- */

    if (collapseEl && nav) {
      $$('.nav-item', collapseEl).forEach((li, i) => li.style.setProperty('--k', i));
      collapseEl.addEventListener('show.bs.collapse', () => nav.classList.add('menu-open'));
      collapseEl.addEventListener('hide.bs.collapse', () => nav.classList.remove('menu-open'));
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && collapseEl.classList.contains('show')) {
          closeMenu();
          const t = nav.querySelector('.navbar-toggler'); if (t) t.focus();
        }
      });
    }

    /* ---------- 7. Sliding nav indicator (desktop) ---------- */

    const list = nav && nav.querySelector('.navbar-nav');
    if (list && collapseEl) {
      const links = $$('.nav-link', list);
      const ind = document.createElement('span');          // lives in the menu wrapper, not inside the <ul>
      ind.className = 'nav-indicator'; ind.setAttribute('aria-hidden', 'true');
      collapseEl.appendChild(ind);
      const active = () => links.find(l => l.classList.contains('active'));
      function place(el) {
        if (!el || !desktop.matches) { ind.style.opacity = 0; return; }
        const cs = getComputedStyle(el), box = collapseEl.getBoundingClientRect(), r = el.getBoundingClientRect();
        const pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
        ind.style.top = (r.bottom - box.top - 6) + 'px';
        ind.style.transform = 'translateX(' + (r.left - box.left + pl) + 'px) scaleX(' + Math.max(1, r.width - pl - pr) + ')';
        ind.style.opacity = 1;
      }
      const settle = () => place(active());
      links.forEach(l => {
        ['mouseenter', 'focus'].forEach(ev => l.addEventListener(ev, () => place(l)));
        ['mouseleave', 'blur'].forEach(ev => l.addEventListener(ev, settle));
      });
      new MutationObserver(settle).observe(list, { attributes: true, subtree: true, attributeFilter: ['class'] });
      window.addEventListener('resize', settle, { passive: true });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
      settle();
      requestAnimationFrame(() => requestAnimationFrame(() => { ind.classList.add('ready'); }));
      root.classList.add('nav-ind');
    }
  } catch (err) {
    root.classList.remove('js'); // fail open: show everything
    if (window.console) console.error('Motion layer disabled:', err);
  }
})();

/* =====================================================================
   PART 2: LINKS, YEAR, CONTACT FORM (jQuery)
   ===================================================================== */
   
if (window.jQuery) {
  jQuery(function ($) {
    // Apply real URLs; disable links that have none yet
    $('[data-link]').each(function () {
      const url = LINKS[$(this).data('link')];
      if (url) { $(this).attr('href', url); }
      else { $(this).addClass('is-placeholder').attr({ 'aria-disabled': 'true', title: 'Link not added yet' }); }
    });
    $('a.is-placeholder').on('click', e => e.preventDefault());

    $('#year').text(new Date().getFullYear());

    // Contact form: validate, then open the visitor's email app (no backend)
    const $form = $('#contactForm'), $status = $('#formStatus'), emailEl = document.getElementById('cEmail');
    const checkEmail = () => emailEl.setCustomValidity(EMAIL_RE.test(emailEl.value.trim()) ? '' : 'Invalid email');
    function say(kind, html) {
      $status.removeClass('ok err').text('');
      void $status[0].offsetWidth;                 // restart the fade-in each time
      $status.addClass(kind);
      html ? $status.html(html) : null;
    }
    $form.on('submit', function (e) {
      e.preventDefault();
      checkEmail();
      $form.addClass('was-validated');
      if (!this.checkValidity()) {
        say('err'); $status.text('Please fix the highlighted fields and try again.');
        $form.find(':invalid').first().trigger('focus');
        return;
      }
      const body = $('#cMessage').val().trim() + '\n\nFrom: ' + $('#cName').val().trim() + ' (' + emailEl.value.trim() + ')';
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent($('#cSubject').val().trim()) + '&body=' + encodeURIComponent(body);
      say('ok', 'Your email app should now open with this message ready. It has not been sent yet. If nothing opens, email <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a> directly.');
    });
    // Keep the email rule live after the first attempt so the message clears as soon as it is fixed
    $form.find('input,textarea').on('input', function () { if (this === emailEl) checkEmail(); });
  });
}
