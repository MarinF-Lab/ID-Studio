'use strict';

// ── Theme (aplicar ANTES del primer render para evitar flash) ──
(function applyTheme() {
  const saved  = localStorage.getItem('idw-theme');
  const system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', saved || system);
})();

function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('idw-theme', next);
}

// Seguir el tema del sistema si el usuario no ha elegido manualmente
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('idw-theme')) {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  }
});

// ── Section order ──
const SECTIONS = ['inicio', 'servicios', 'portafolio', 'nosotros', 'contacto'];
let currentSection = 'inicio';
let isTransitioning = false;

// ── Navigate to a section ──
function navigateTo(id, pushState = true) {
  if (!SECTIONS.includes(id) || (id === currentSection && !isTransitioning === false)) return;
  if (id === currentSection) return;

  isTransitioning = true;

  const leaving = document.getElementById(currentSection);
  const entering = document.getElementById(id);

  if (leaving) leaving.classList.remove('active');
  if (entering) {
    entering.classList.add('active');
    entering.scrollTop = 0;
  }

  currentSection = id;
  updateDots(id);
  updateNavLinks(id);

  if (pushState) {
    history.pushState({ section: id }, '', '#' + id);
  }

  // Re-trigger animate-item transitions each time section opens
  if (entering) {
    const items = entering.querySelectorAll('.animate-item');
    items.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
    });
    // Small delay so the section is visible before animating items
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        items.forEach(el => {
          el.style.opacity = '';
          el.style.transform = '';
        });
      });
    });
  }

  // Special: animate terminal on "nosotros"
  if (id === 'nosotros') animateTerminal();

  // Special: start counters on "inicio"
  if (id === 'inicio') startCounters();

  if (window.heroParticlesSync) window.heroParticlesSync();

  setTimeout(() => { isTransitioning = false; }, 420);
}
window.navigateTo = navigateTo;

// ── Update side dots ──
function updateDots(id) {
  document.querySelectorAll('.side-dots .dot').forEach(d => {
    d.classList.toggle('dot-active', d.dataset.target === id);
  });
}

// ── Update navbar links ──
function updateNavLinks(id) {
  document.querySelectorAll('.nav-links a[data-target]').forEach(a => {
    a.classList.toggle('nav-active', a.dataset.target === id);
  });
}

// ── Bind all navigation triggers ──
function bindNav() {
  // All elements with data-target
  document.querySelectorAll('[data-target]').forEach(el => {
    const tag = el.tagName.toLowerCase();
    // Skip nav-logo anchor (handled separately)
    el.addEventListener('click', e => {
      const target = el.dataset.target;
      if (SECTIONS.includes(target)) {
        e.preventDefault();
        navigateTo(target);
        // Close mobile menu
        document.getElementById('navLinks').classList.remove('open');
      }
    });
  });
}

// ── Mobile burger ──
document.getElementById('navBurger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

// ── Theme toggle button ──
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// ── Browser back/forward ──
window.addEventListener('popstate', e => {
  const id = (e.state && e.state.section) || 'inicio';
  navigateTo(id, false);
});

// ── Keyboard navigation ──
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  const idx = SECTIONS.indexOf(currentSection);
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault();
    if (idx < SECTIONS.length - 1) navigateTo(SECTIONS[idx + 1]);
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    if (idx > 0) navigateTo(SECTIONS[idx - 1]);
  }
});

// ── Counter animation ──
let countersStarted = false;
function startCounters() {
  if (countersStarted) return;
  countersStarted = true;
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = +el.dataset.target;
    const step   = Math.ceil(target / 40);
    let current  = 0;
    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// ── Terminal typing effect ──
let terminalDone = false;
function animateTerminal() {
  if (terminalDone) return;
  terminalDone = true;
  const lines = document.querySelectorAll('.terminal-body .t-line');
  lines.forEach((line, i) => {
    setTimeout(() => { line.style.opacity = '1'; }, 300 + i * 200);
  });
}

// ── Portafolio (datos en projects.js) ──
const ICONS = {
  ledger:  '<path d="M8 6h20a4 4 0 014 4v22H12a4 4 0 01-4-4V6z"/><path d="M14 14h12M14 20h12M14 26h7"/>',
  layers:  '<path d="M20 6l14 7-14 7-14-7 14-7z"/><path d="M6 20l14 7 14-7M6 27l14 7 14-7"/>',
  calendar:'<rect x="6" y="9" width="28" height="25" rx="3"/><path d="M6 16h28M13 5v7M27 5v7M13 23l4 4 8-8"/>',
  id:      '<rect x="5" y="9" width="30" height="22" rx="3"/><circle cx="14" cy="19" r="3.5"/><path d="M9 27c1-3 9-3 10 0M23 16h7M23 21h7"/>',
  chart:   '<path d="M6 34h28"/><path d="M11 28v-8M18 28V14M25 28v-11M32 28V9"/>',
  box:     '<path d="M20 5l14 7v16l-14 7-14-7V12l14-7z"/><path d="M6 12l14 7 14-7M20 19v16"/>',
  flower:  '<circle cx="20" cy="15" r="3"/><path d="M20 12c0-5 6-5 5 0M23 15c5 0 5 6 0 5M20 18c0 5-6 5-5 0M17 15c-5 0-5-6 0-5"/><path d="M20 18v17M20 28c-3-4-8-3-8-3M20 25c3-4 7-3 7-3"/>',
  bag:     '<path d="M9 14h22l-2 20H11L9 14z"/><path d="M15 14v-3a5 5 0 0110 0v3"/>',
  globe:   '<circle cx="20" cy="20" r="14"/><path d="M6 20h28M20 6c4 4 6 9 6 14s-2 10-6 14c-4-4-6-9-6-14s2-10 6-14z"/>',
  palette: '<path d="M20 6a14 14 0 100 28c2 0 3-1.5 3-3 0-2-2-2.5-2-4.5 0-1.5 1-2.5 3-2.5h4c3 0 6-2.5 6-6C34 11 28 6 20 6z"/><circle cx="13" cy="18" r="1.6"/><circle cx="18" cy="12" r="1.6"/><circle cx="25" cy="12" r="1.6"/>',
  gear:    '<circle cx="20" cy="20" r="5"/><path d="M20 5v5M20 30v5M5 20h5M30 20h5M9.4 9.4l3.5 3.5M27.1 27.1l3.5 3.5M9.4 30.6l3.5-3.5M27.1 12.9l3.5-3.5"/>',
};
const STATUS = { live: 'En producción', beta: 'Beta', dev: 'En desarrollo' };

function esc(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function projectCard(p, i) {
  const live = p.url
    ? `<a class="btn-product" href="${esc(p.url)}" target="_blank" rel="noopener">Ver en vivo <span aria-hidden="true">↗</span></a>`
    : `<span class="btn-product btn-coming">Próximamente</span>`;
  const code = p.repo
    ? `<a class="btn-code" href="${esc(p.repo)}" target="_blank" rel="noopener" aria-label="Código de ${esc(p.name)} en GitHub"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 00-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 015.8 0C17.3 4.8 18.3 5.1 18.3 5.1c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0012 .5z"/></svg>Código</a>`
    : '';
  return `
    <article class="product-card animate-item" data-category="${esc(p.category)}" style="--delay:${(i * 0.05).toFixed(2)}s">
      <div class="product-header" style="--card-color:${esc(p.color)}">
        <div class="product-icon-wrap"><svg viewBox="0 0 40 40" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[p.icon] || ICONS.globe}</svg></div>
        <span class="project-status status-${esc(p.status)}">${STATUS[p.status] || ''}</span>
      </div>
      <div class="product-body">
        <span class="project-tagline">${esc(p.tagline)}</span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.description)}</p>
        <div class="product-meta">${p.stack.map(t => `<span class="product-tag">${esc(t)}</span>`).join('')}</div>
      </div>
      <div class="product-footer">${live}${code}</div>
    </article>`;
}

(function renderPortfolio() {
  const grid   = document.getElementById('portfolioGrid');
  const filter = document.getElementById('portfolioFilter');
  const cta    = document.getElementById('portfolioCta');
  const list   = window.PROJECTS || [];
  const cats   = window.PROJECT_CATEGORIES || {};
  if (!grid || !filter) return;

  grid.insertAdjacentHTML('afterbegin', list.map(projectCard).join(''));
  if (cta) { cta.classList.add('animate-item'); cta.style.setProperty('--delay', (list.length * 0.05).toFixed(2) + 's'); }

  const used = Object.keys(cats).filter(k => list.some(p => p.category === k));
  const btn = (key, label, count, active) =>
    `<button class="filter-btn${active ? ' active' : ''}" data-filter="${key}" role="tab" aria-selected="${active}">${label}<span class="filter-count">${count}</span></button>`;
  filter.innerHTML = btn('all', 'Todos', list.length, true) +
    used.map(k => btn(k, cats[k], list.filter(p => p.category === k).length, false)).join('');

  filter.addEventListener('click', e => {
    const b = e.target.closest('.filter-btn');
    if (!b) return;
    filter.querySelectorAll('.filter-btn').forEach(x => {
      const on = x === b;
      x.classList.toggle('active', on);
      x.setAttribute('aria-selected', on);
    });
    const f = b.dataset.filter;
    grid.querySelectorAll('.product-card[data-category]').forEach(card => {
      const c = card.dataset.category;
      card.classList.toggle('hidden', f !== 'all' && c !== f && c !== 'all');
    });
  });
})();

// ── Contact form ──
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled   = true;
  btn.innerHTML  = '<span>Enviando...</span>';
  setTimeout(() => {
    e.target.reset();
    btn.disabled  = false;
    btn.innerHTML = '<span>Enviar mensaje</span><svg viewBox="0 0 20 20" fill="none"><path d="M3 10h14M10 3l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    const success = document.getElementById('formSuccess');
    success.classList.add('visible');
    setTimeout(() => success.classList.remove('visible'), 5000);
  }, 1200);
});

// ── Hero: red de partículas ──
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

(function heroParticles() {
  const canvas = document.getElementById('heroCanvas');
  const hero   = document.getElementById('inicio');
  if (!canvas || !hero || REDUCED) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, particles = [], colors = {}, raf = null;
  const mouse = { x: -9999, y: -9999 };

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    colors.a = cs.getPropertyValue('--accent').trim() || '#F95A8A';
    colors.b = cs.getPropertyValue('--globe-blue').trim() || '#8FAFC0';
    colors.light = document.documentElement.getAttribute('data-theme') === 'light';
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, Math.max(28, (w * h) / 16000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.6 + .6,
      c: Math.random() < .35 ? 'a' : 'b',
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    const link = 130, linkSq = link * link, mouseR = 170;
    const alphaBase = colors.light ? .28 : .22;
    for (const p of particles) {
      // atracción suave hacia el cursor
      const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
      const md = Math.hypot(mdx, mdy);
      if (md < mouseR && md > 1) { p.vx += (mdx / md) * .012; p.vy += (mdy / md) * .012; }
      p.vx *= .992; p.vy *= .992;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp < .12) { p.vx += (Math.random() - .5) * .04; p.vy += (Math.random() - .5) * .04; }
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
        if (d2 < linkSq) {
          ctx.globalAlpha = alphaBase * (1 - d2 / linkSq);
          ctx.strokeStyle = colors.b;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      const md = Math.hypot(mouse.x - p.x, mouse.y - p.y);
      if (md < mouseR) {
        ctx.globalAlpha = .5 * (1 - md / mouseR);
        ctx.strokeStyle = colors.a;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    for (const p of particles) {
      ctx.globalAlpha = colors.light ? .6 : .75;
      ctx.fillStyle = colors[p.c];
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  function shouldRun() { return currentSection === 'inicio' && !document.hidden; }
  function start() { if (!raf && shouldRun()) raf = requestAnimationFrame(frame); }
  function stop()  { if (raf) { cancelAnimationFrame(raf); raf = null; } }
  window.heroParticlesSync = () => (shouldRun() ? start() : stop());

  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  document.addEventListener('visibilitychange', window.heroParticlesSync);
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  readColors(); resize(); start();
})();

// ── Hero: isotipo con inclinación 3D ──
(function heroTilt() {
  const box = document.getElementById('heroTilt');
  const area = document.getElementById('inicio');
  if (!box || !area || REDUCED || !FINE_POINTER) return;
  area.addEventListener('pointermove', e => {
    const r = box.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
    const ny = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
    box.style.setProperty('--ry', (Math.max(-1, Math.min(1, nx)) * 12).toFixed(2) + 'deg');
    box.style.setProperty('--rx', (Math.max(-1, Math.min(1, -ny)) * 10).toFixed(2) + 'deg');
  });
  area.addEventListener('pointerleave', () => {
    box.style.setProperty('--rx', '0deg'); box.style.setProperty('--ry', '0deg');
  });
})();

// ── Tarjetas: foco de luz que sigue el cursor ──
if (FINE_POINTER) {
  document.querySelectorAll('.service-card, .product-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
}

// ── Año actual en el pie ──
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Init ──
(function init() {
  bindNav();

  // Read hash on load
  const hash = location.hash.replace('#', '');
  const startSection = SECTIONS.includes(hash) ? hash : 'inicio';

  // Set initial state without transition
  currentSection = startSection;
  const startEl = document.getElementById(startSection);
  if (startEl) startEl.classList.add('active');
  updateDots(startSection);
  updateNavLinks(startSection);
  history.replaceState({ section: startSection }, '', '#' + startSection);

  if (startSection === 'inicio') startCounters();
  if (startSection === 'nosotros') animateTerminal();
  if (window.heroParticlesSync) window.heroParticlesSync();
})();
