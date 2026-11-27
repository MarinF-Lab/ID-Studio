'use strict';
// ID Studio — escenas, transiciones por capas e interacciones. Datos en projects.js
(() => {
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const EASE_OUT = 'cubic-bezier(.16,1,.3,1)', EASE_IN = 'cubic-bezier(.55,0,.75,.2)';

class Spring {
  constructor(v = 0, k = 140, c = 20) { this.x = v; this.t = v; this.v = 0; this.k = k; this.c = c; }
  step(dt) { if (!(dt > 0)) return this.x; let n = Math.min(24, Math.ceil(dt * 240)); const h = dt / n; while (n-- > 0) { const f = -this.k * (this.x - this.t) - this.c * this.v; this.v += f * h; this.x += this.v * h; } return this.x; }
}
// Bucle por escena: corre solo mientras la escena está activa y la pestaña visible
function makeLoop(tick) {
  let raf = 0, last = 0, on = false;
  const frame = now => { const dt = clamp((now - last) / 1000 || 0, 0, .05); last = now; tick(dt, now / 1000); raf = requestAnimationFrame(frame); };
  return {
    start() { if (on) return; on = true; last = performance.now(); raf = requestAnimationFrame(frame); },
    stop() { on = false; cancelAnimationFrame(raf); },
    get on() { return on; }
  };
}
// Transición de un grupo de capas (salida o entrada) según profundidad
function leaveLayers(els, dir, dist = 1) {
  els.forEach(el => {
    const z = parseFloat(el.dataset.z || .5);
    el.getAnimations().forEach(a => a.cancel());
    el.animate([{transform: 'translate3d(0,0,0)', opacity: 1}, {transform: `translate3d(0,${-dir * (50 + 190 * z) * dist}px,0)`, opacity: 0}],
      {duration: REDUCED ? 180 : 520 + z * 160, easing: REDUCED ? 'linear' : EASE_IN, fill: 'forwards'});
  });
}
function enterLayers(els, dir, base = 260, dist = 1) {
  els.forEach(el => {
    const z = parseFloat(el.dataset.z || .5);
    el.getAnimations().forEach(a => a.cancel());
    el.animate([{transform: `translate3d(0,${dir * (70 + 230 * z) * dist}px,0)`, opacity: 0}, {transform: 'translate3d(0,0,0)', opacity: 1}],
      {duration: REDUCED ? 220 : 980, delay: REDUCED ? 120 : base + z * 120, easing: REDUCED ? 'linear' : EASE_OUT, fill: 'backwards'});
  });
}
function fitScale(box, w0, max = 1) { const fit = () => box.style.setProperty('--s', Math.min(max, box.clientWidth / w0)); new ResizeObserver(fit).observe(box); fit(); }

/* ═══ Escenas ═══ */
const scenes = [...document.querySelectorAll('.scene')].map(el => ({el, inner: el.querySelector('.inner'), name: el.dataset.name, hash: el.dataset.hash, enter() {}, leave() {}}));
let cur = 0, busy = false;
function updateChrome() {
  document.querySelectorAll('[data-go]').forEach(b => { if (b.closest('.nav-links') || b.closest('.dots')) b.setAttribute('aria-current', String(+b.dataset.go === cur)); });
  $('progress').style.width = ((cur + 1) / scenes.length * 100) + '%';
  $('hudN').textContent = String(cur + 1).padStart(2, '0'); $('hudName').textContent = scenes[cur].name;
}
function go(to) {
  to = clamp(to, 0, scenes.length - 1);
  if (busy || to === cur) return;
  const from = scenes[cur], next = scenes[to], dir = to > cur ? 1 : -1;
  busy = true;
  from.leave();
  leaveLayers([...from.el.querySelectorAll('.t')], dir);
  next.el.hidden = false; next.inner.scrollTop = 0;
  from.el.classList.remove('active'); next.el.classList.add('active');
  enterLayers([...next.el.querySelectorAll('.t')], dir);
  cur = to; updateChrome();
  try { history.replaceState(null, '', '#' + next.hash); } catch {}
  next.enter();
  setTimeout(() => { from.el.hidden = true; from.el.querySelectorAll('.t').forEach(e => e.getAnimations().forEach(a => a.cancel())); }, REDUCED ? 260 : 820);
  setTimeout(() => { busy = false; }, REDUCED ? 300 : 950);
}
window.goScene = go;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]'); if (!b) return;
  e.preventDefault(); go(+b.dataset.go);
});

// Rueda / trackpad: un gesto = una escena (ignora la inercia que sigue)
const canScroll = (el, dy) => dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2;
let acc = 0, lastWheel = 0, tail = false;
addEventListener('wheel', e => {
  if (e.ctrlKey) return;
  const now = performance.now(), gap = now - lastWheel; lastWheel = now;
  if (e.target.closest('textarea')) return;
  if (canScroll(scenes[cur].inner, e.deltaY)) { acc = 0; return; }
  if (busy || (tail && gap < 220)) { acc = 0; return; }
  tail = false;
  acc += e.deltaY;
  if (Math.abs(acc) > 45) { const d = Math.sign(acc); acc = 0; tail = true; go(cur + d); }
}, {passive: true});
// Deslizar en pantallas táctiles
let ty0 = null, tx0 = 0, atEdge = {up: false, down: false};
addEventListener('touchstart', e => { const t = e.touches[0]; ty0 = t.clientY; tx0 = t.clientX; const i = scenes[cur].inner; atEdge = {up: !canScroll(i, -1), down: !canScroll(i, 1)}; }, {passive: true});
addEventListener('touchend', e => {
  if (ty0 === null) return; const t = e.changedTouches[0]; const dy = ty0 - t.clientY, dx = tx0 - t.clientX; ty0 = null;
  if (Math.abs(dy) < 70 || Math.abs(dx) > Math.abs(dy)) return;
  if (e.target.closest('.track,.arc')) { if (Math.abs(dx) > 30) return; }
  if (dy > 0 && atEdge.down) go(cur + 1); else if (dy < 0 && atEdge.up) go(cur - 1);
}, {passive: true});
// Teclado
addEventListener('keydown', e => {
  if (e.target.closest('input,textarea,select,[role="slider"]')) return;
  if (e.altKey || e.metaKey || e.ctrlKey) return;
  const i = scenes[cur].inner;
  const page = Math.max(120, i.clientHeight * .7);
  if (['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.target.closest('button,a'))) { e.preventDefault(); if (canScroll(i, 1)) i.scrollBy({top: page, behavior: REDUCED ? 'auto' : 'smooth'}); else go(cur + 1); }
  else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); if (canScroll(i, -1)) i.scrollBy({top: -page, behavior: REDUCED ? 'auto' : 'smooth'}); else go(cur - 1); }
  else if (e.key === 'Home') go(0); else if (e.key === 'End') go(scenes.length - 1);
});
function fromHash() { const h = location.hash.slice(1); const i = scenes.findIndex(s => s.hash === h); return i; }
addEventListener('hashchange', () => { const i = fromHash(); if (i >= 0) go(i); });

/* ═══ 1 · Inicio: capas + terminal interactiva ═══ */
{
  const box = $('stageBox'), stage = $('stage');
  fitScale(box, 620);
  const layers = [...stage.querySelectorAll('.layer')].map((el, i) => ({el, d: parseFloat(el.dataset.depth), rot: parseFloat(el.dataset.rot || 0), ph: i * 1.7, x: new Spring(0, 90, 16), y: new Spring(0, 90, 16)}));
  const tiltX = new Spring(0, 60, 14), tiltY = new Spring(0, 60, 14);
  const ptr = {x: 0, y: 0};
  if (FINE) addEventListener('pointermove', e => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = e.clientY / innerHeight * 2 - 1; }, {passive: true});
  const loop = makeLoop((dt, t) => {
    tiltX.t = -ptr.y * 4; tiltY.t = ptr.x * 6; tiltX.step(dt); tiltY.step(dt);
    stage.style.transform = `translate(-50%,-50%) scale(var(--s,1)) rotateX(${tiltX.x}deg) rotateY(${tiltY.x}deg)`;
    layers.forEach(L => {
      L.x.t = ptr.x * 22 * L.d; L.y.t = ptr.y * 16 * L.d + Math.sin(t * .7 + L.ph) * 5 * L.d;
      L.x.step(dt); L.y.step(dt);
      L.el.style.transform = `translate3d(${L.x.x.toFixed(2)}px,${L.y.x.toFixed(2)}px,0) rotate(${L.rot}deg)`;
    });
  });
  layers.forEach(L => { L.el.style.transform = `rotate(${L.rot}deg)`; });

  // Terminal
  const out = $('termOut'), input = $('termIn');
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const lines = [];
  const print = (html) => { lines.push(html); while (lines.length > 8) lines.shift(); out.innerHTML = lines.join('\n'); };
  const INTRO = [['p', '$ id-studio deploy --all'], ['ok', '✓ carnets         online'], ['ok', '✓ asistencia      online'], ['warn', '◐ id-contable     beta'], ['dim', 'escribe "ayuda" para ver comandos']];
  let introTimer = null, userTook = false;
  function playIntro() {
    if (REDUCED) { INTRO.forEach(([c, s]) => print(`<span class="${c}">${esc(s)}</span>`)); return; }
    let li = 0, ci = 0; lines.length = 0;
    const tickType = () => {
      if (userTook || li >= INTRO.length) return;
      const [c, s] = INTRO[li]; ci++;
      const partial = `<span class="${c}">${esc(s.slice(0, ci))}</span>`;
      if (ci === 1) lines.push(partial); else lines[lines.length - 1] = partial;
      out.innerHTML = lines.join('\n');
      if (ci >= s.length) { li++; ci = 0; introTimer = setTimeout(tickType, 260); } else introTimer = setTimeout(tickType, 34);
    };
    introTimer = setTimeout(tickType, 700);
  }
  const CMDS = {
    ayuda: () => { print('<span class="dim">comandos:</span> inicio · servicios · portafolio · proceso · contacto · proyectos · limpiar'); },
    help: () => CMDS.ayuda(),
    inicio: () => print('<span class="ok">✓ ya estás en inicio</span>'),
    servicios: () => nav(1, 'servicios'),
    portafolio: () => nav(2, 'portafolio'),
    proyectos: () => { print('<span class="ok">9 en producción · 2 beta · 1 en desarrollo</span>'); print('<span class="dim">escribe "portafolio" para verlos</span>'); },
    proceso: () => nav(3, 'proceso'),
    contacto: () => nav(4, 'contacto'),
    limpiar: () => { lines.length = 0; out.innerHTML = ''; },
    clear: () => CMDS.limpiar(),
  };
  function nav(i, name) { print(`<span class="ok">→ abriendo ${name}…</span>`); setTimeout(() => go(i), 420); }
  function run(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    userTook = true; clearTimeout(introTimer);
    print(`<span class="p">$</span> ${esc(cmd)}`);
    (CMDS[cmd] || (() => print(`<span class="warn">comando no encontrado: ${esc(cmd)}</span> · escribe <span class="p">ayuda</span>`)))();
  }
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(input.value); input.value = ''; } });
  $('termCard').addEventListener('click', () => input.focus({preventScroll: true}));
  document.querySelectorAll('[data-cmd]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.cmd === 'ayuda') { input.focus({preventScroll: true}); }
    // escribe el comando letra por letra y lo ejecuta
    const c = b.dataset.cmd; let i = 0; input.value = '';
    if (REDUCED) return run(c);
    const typeIt = () => { input.value = c.slice(0, ++i); if (i < c.length) setTimeout(typeIt, 55); else setTimeout(() => { run(c); input.value = ''; }, 180); };
    typeIt();
  }));
  playIntro();
  scenes[0].enter = () => { if (!REDUCED) loop.start(); };
  scenes[0].leave = () => loop.stop();
}

/* ═══ 2 · Servicios: selector que recompone la escena ═══ */
{
  fitScale($('compoBox'), 580);
  const bars = $('bars'); for (let i = 0; i < 30; i++) { const h = i === 17 ? 62 : 82 + Math.round(Math.abs(Math.sin(i * 1.7)) * 18); bars.insertAdjacentHTML('beforeend', `<i class="${i === 17 ? 'w' : ''}" style="height:${h}%"></i>`); }
  const tabs = [...document.querySelectorAll('.tab')], sets = Object.fromEntries([...document.querySelectorAll('.set')].map(s => [s.dataset.set, s]));
  const COL = {sw: 'var(--signal)', wb: 'var(--violet)', mt: 'var(--online)'};
  let curK = 'sw', switching = false;
  function select(k, focus) {
    if (k === curK || switching) return;
    const idx = tabs.findIndex(t => t.dataset.k === k), prevIdx = tabs.findIndex(t => t.dataset.k === curK), dir = idx > prevIdx ? 1 : -1;
    tabs.forEach(t => { const on = t.dataset.k === k; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    if (focus) tabs[idx].focus();
    $('svcGlow').style.setProperty('--svc', COL[k]);
    const a = sets[curK], b = sets[k]; switching = true;
    const outEls = [...a.children];
    outEls.forEach(el => { const z = +el.dataset.z; el.getAnimations().forEach(x => x.cancel()); el.animate([{transform: 'none', opacity: 1}, {transform: `translate3d(${-dir * (40 + 120 * z)}px,${-10 * z}px,0) rotate(${-dir * 4 * z}deg)`, opacity: 0}], {duration: REDUCED ? 150 : 380 + z * 120, easing: EASE_IN, fill: 'forwards'}); });
    setTimeout(() => {
      a.hidden = true; outEls.forEach(el => el.getAnimations().forEach(x => x.cancel()));
      b.hidden = false;
      [...b.children].forEach(el => { const z = +el.dataset.z; el.animate([{transform: `translate3d(${dir * (60 + 160 * z)}px,${14 * z}px,0) rotate(${dir * 5 * z}deg)`, opacity: 0}, {transform: 'none', opacity: 1}], {duration: REDUCED ? 180 : 900, delay: REDUCED ? 0 : z * 110, easing: EASE_OUT, fill: 'backwards'}); });
      curK = k; switching = false;
    }, REDUCED ? 150 : 420);
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', e => {
      const q = e.target.closest('.quote');
      if (q && t.getAttribute('aria-selected') === 'true') { window.presetWizard?.(q.dataset.quote); go(4); return; }
      select(t.dataset.k);
    });
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select(tabs[(i + 1) % 3].dataset.k, true); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i + 2) % 3].dataset.k, true); }
    });
    t.tabIndex = i === 0 ? 0 : -1;
  });
  // Capas de la composición con parallax suave al cursor
  const compo = $('compo'), cx = new Spring(0, 70, 14), cy = new Spring(0, 70, 14); const ptr = {x: 0, y: 0};
  if (FINE) addEventListener('pointermove', e => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = e.clientY / innerHeight * 2 - 1; }, {passive: true});
  let raf = 0;
  const step = () => { cx.t = ptr.x * 5; cy.t = -ptr.y * 4; cx.step(1 / 60); cy.step(1 / 60); compo.style.transform = `translate(-50%,-50%) scale(var(--s,1)) perspective(1200px) rotateY(${cx.x}deg) rotateX(${cy.x}deg)`; raf = requestAnimationFrame(step); };
  scenes[1].enter = () => { if (!REDUCED && FINE) { cancelAnimationFrame(raf); raf = requestAnimationFrame(step); } };
  scenes[1].leave = () => cancelAnimationFrame(raf);
}

/* ═══ 3 · Portafolio: arco con filtros ═══ */
const P = window.PROJECTS || [];
{
  const arc = $('arc');
  const CATS = [['all', 'Todos'], ['gestion', 'Gestión'], ['tiendas', 'Tiendas'], ['apps', 'Apps'], ['webs', 'Webs']];
  $('filters').innerHTML = CATS.map(([k, l]) => `<button aria-pressed="${k === 'all'}" data-k="${k}">${l}<sup>${k === 'all' ? P.length : P.filter(p => p.k === k).length}</sup></button>`).join('');
  const spark = (i, c) => { let d = 'M0 ' + (60 - Math.abs(Math.sin(i)) * 20).toFixed(1); for (let k = 1; k <= 10; k++) d += ` L${k * 30} ${(66 - (Math.abs(Math.sin(k * .9 + i)) * 34 + k * 3)).toFixed(1)}`;
    return `<svg class="spark" viewBox="0 0 300 84" preserveAspectRatio="none"><defs><linearGradient id="pg${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".5"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs><path d="${d} L300 84 L0 84Z" fill="url(#pg${i})"/><path d="${d}" fill="none" stroke="${c}" stroke-width="2.5"/></svg>`; };
  const cardHTML = (p, i) => { const n = k => (i + 3) * (k + 2) * 7 + k * 113;
    return `<div class="glowc"></div><div class="card"><div class="winbar"><i></i><i></i><i></i><span>${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.app</span></div><div class="app" style="--c:${p.color}"><div class="app-side"><div class="logo"></div><span class="on"></span><span></span><span></span><span></span></div><div class="app-main"><div class="app-title">${p.name}</div><div class="app-sub">${p.cat} · panel principal</div><div class="kpis"><div><small>Hoy</small><b>${n(0)}<em>▲4%</em></b></div><div><small>Semana</small><b>${n(1)}</b></div><div><small>Total</small><b>${n(2)}</b></div></div>${spark(i, p.color)}</div></div></div>`; };
  const all = P.map((p, i) => { const el = document.createElement('div'); el.className = 'pcard'; el.style.setProperty('--pc', p.color); el.innerHTML = cardHTML(p, i); el.p = p; return el; });
  let list = all.slice();
  const pos = new Spring(0, 70, 15), hx = new Spring(0, 80, 14), hy = new Spring(0, 80, 14);
  let cw = 420, R = 540, active = -1, dragging = false, lastX = 0, lastT = 0, vel = 0, moved = 0, lastUse = performance.now(), hovered = false;
  const ptr = {x: 0, y: 0};
  function size() { const w = arc.clientWidth; cw = Math.min(420, w * .74); R = Math.min(540, w * .5); arc.style.setProperty('--cw', cw + 'px'); }
  new ResizeObserver(size).observe(arc); size();
  const ST = {live: ['st-live', 'En producción'], beta: ['st-beta', 'Beta'], dev: ['st-dev', 'En desarrollo']};
  let swapT;
  function info(i, instant) {
    const p = list[i].p;
    const apply = () => {
      const [cls, txt] = ST[p.status];
      $('pStatus').className = 'p-status ' + cls; $('pStatusTxt').textContent = txt;
      $('pName').textContent = p.name; $('pDesc').textContent = p.desc;
      $('pStack').textContent = p.cat + ' · ' + p.stack.join(' · ');
      $('pIdx').textContent = String(i + 1).padStart(2, '0'); $('pTot').textContent = list.length;
      const L = $('pLinks'); L.textContent = '';
      if (p.url) { const a = document.createElement('a'); a.className = 'btn btn-primary'; a.href = p.url; a.target = '_blank'; a.rel = 'noopener'; a.innerHTML = 'Ver en vivo <span class="arr">↗</span>'; L.append(a); }
      else { const s = document.createElement('span'); s.className = 'btn btn-ghost'; s.textContent = 'Próximamente'; L.append(s); }
      if (p.repo) { const a = document.createElement('a'); a.className = 'btn btn-ghost'; a.href = p.repo; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Código'; L.append(a); }
      $('pGlow').style.setProperty('--pc', p.color);
      $('pSwap').classList.remove('out');
    };
    clearTimeout(swapT);
    if (instant || REDUCED) return apply();
    $('pSwap').classList.add('out'); swapT = setTimeout(apply, 200);
  }
  const N = () => list.length;
  const wrapIdx = v => ((Math.round(v) % N()) + N()) % N();
  const step = d => { pos.t = Math.round(pos.t) + d; lastUse = performance.now(); };
  function layout() {
    const n = N(), c = pos.x;
    list.forEach((el, j) => {
      let d = j - c; d = ((d % n) + n) % n; if (d > n / 2) d -= n;
      const a = Math.abs(d);
      if (a > 3.4) { el.style.visibility = 'hidden'; return; }
      el.style.visibility = 'visible';
      const ang = d * .42, x = Math.sin(ang) * R, z = -(1 - Math.cos(ang)) * R * 1.25;
      const front = a < .5, tx = front ? hx.x : 0, ty = front ? hy.x : 0;
      el.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${(a * 10).toFixed(1)}px,${z.toFixed(1)}px) rotateY(${(clamp(-d * 26, -62, 62) + tx).toFixed(2)}deg) rotateX(${ty.toFixed(2)}deg) scale(${(1 - Math.min(a, 3) * .06).toFixed(3)})`;
      el.style.opacity = clamp(1 - Math.max(0, a - 1.8) * .75, 0, 1).toFixed(3);
      el.style.filter = `brightness(${(1 - Math.min(a, 2.5) * .2).toFixed(3)})`;
      el.style.zIndex = String(100 - Math.round(a * 10));
      el.classList.toggle('front', front);
    });
    const i = wrapIdx(c);
    if (i !== active) { const first = active === -1; active = i; info(i, first); }
  }
  function setFilter(k) {
    document.querySelectorAll('#filters button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
    list.forEach(el => el.remove());
    list = k === 'all' ? all.slice() : all.filter(el => el.p.k === k);
    pos.x = pos.t = 0; pos.v = 0; active = -1;
    list.forEach((el, j) => { arc.append(el); const c = el.querySelector('.card'); c.getAnimations().forEach(a => a.cancel());
      c.animate([{transform: 'translateY(40px) scale(.96)', opacity: 0}, {transform: 'none', opacity: 1}], {duration: REDUCED ? 150 : 800, delay: REDUCED ? 0 : Math.min(j, 4) * 70, easing: EASE_OUT, fill: 'backwards'}); });
    layout();
  }
  $('filters').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { setFilter(b.dataset.k); lastUse = performance.now(); } });
  $('prevBtn').onclick = () => step(-1);
  $('nextBtn').onclick = () => step(1);
  arc.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } });
  arc.addEventListener('pointerenter', () => hovered = true);
  arc.addEventListener('pointerleave', () => { hovered = false; ptr.x = ptr.y = 0; });
  arc.addEventListener('pointermove', e => {
    const r = arc.getBoundingClientRect(); ptr.x = (e.clientX - r.left) / r.width * 2 - 1; ptr.y = (e.clientY - r.top) / r.height * 2 - 1;
    if (!dragging) return;
    const now = performance.now(), dx = e.clientX - lastX; moved += Math.abs(dx);
    pos.t -= dx / (cw * .85); pos.x = pos.t; pos.v = 0;
    vel = -dx / (cw * .85) / Math.max(.001, (now - lastT) / 1000); lastX = e.clientX; lastT = now;
  });
  arc.addEventListener('pointerdown', e => { if (e.button) return; dragging = true; lastX = e.clientX; lastT = performance.now(); moved = 0; vel = 0; arc.setPointerCapture(e.pointerId); lastUse = performance.now(); });
  const end = e => {
    if (!dragging) return; dragging = false; lastUse = performance.now();
    if (moved < 6) {
      const c = document.elementFromPoint(e.clientX, e.clientY)?.closest('.pcard');
      if (c) { const j = list.indexOf(c), n = N(); let d = j - wrapIdx(pos.t); if (d > n / 2) d -= n; if (d < -n / 2) d += n; if (d) step(d); }
      return;
    }
    pos.t = Math.round(pos.t + clamp(vel * .18, -3, 3)); pos.v = vel * .5;
  };
  arc.addEventListener('pointerup', end); arc.addEventListener('pointercancel', end);
  const loop = makeLoop(dt => {
    if (!dragging && !hovered && N() > 1 && performance.now() - lastUse > 7000) step(1);
    if (!dragging) pos.step(dt);
    hx.t = hovered && FINE ? ptr.x * 7 : 0; hy.t = hovered && FINE ? -ptr.y * 5 : 0; hx.step(dt); hy.step(dt);
    layout();
  });
  setFilter('all');
  scenes[2].enter = () => { lastUse = performance.now(); size(); if (REDUCED) { pos.x = pos.t; layout(); } else loop.start(); };
  scenes[2].leave = () => loop.stop();
  if (REDUCED) { const snap = () => { pos.x = pos.t; layout(); }; ['prevBtn', 'nextBtn'].forEach(id => $(id).addEventListener('click', snap)); arc.addEventListener('keydown', snap); arc.addEventListener('pointerup', snap); }
}

/* ═══ 4 · Proceso: línea de tiempo arrastrable ═══ */
{
  const STEPS = [
    {t: 'Descubrir', d: 'Entendemos tu negocio, tus procesos y qué tiene que resolver el sistema.', items: [['01', 'Reunión inicial', 'Conversamos sobre tu negocio'], ['02', 'Mapa de procesos', 'Cómo trabajas hoy'], ['03', 'Propuesta y alcance', 'Qué haremos y en qué orden']]},
    {t: 'Diseñar', d: 'Prototipos navegables que apruebas antes de escribir una línea de código.', items: [['◧', 'Prototipo navegable', 'Lo pruebas como si fuera real'], ['◐', 'Diseño visual', 'Con tu marca y tus colores'], ['✓', 'Tu aprobación', 'Antes de programar']]},
    {t: 'Construir', d: 'Desarrollo por etapas, con versiones de prueba que puedes usar desde el celular.', items: [['⌁', 'Versiones de prueba', 'Un enlace para probar avances'], ['↻', 'Avances semanales', 'Siempre sabes en qué va'], ['▣', 'Pruebas en tu celular', 'Como lo usará tu equipo']]},
    {t: 'Operar', d: 'Publicamos, monitoreamos y mejoramos. Tu sistema sigue en línea.', items: [['↗', 'Publicación', 'En tu dominio y en la nube'], ['●', 'Monitoreo', 'Detectamos fallas antes que tú'], ['+', 'Mejoras continuas', 'El sistema crece con tu negocio']]}
  ];
  const track = $('track'), handle = $('handle'), fill = $('fill'), deliv = $('deliv');
  const v = new Spring(0, 90, 17); let shown = -1, drag = false;
  const labels = [...$('labels').children];
  function render(idx) {
    const s = STEPS[idx];
    $('procNum').innerHTML = `<b>0</b>${idx + 1}`; $('procTitle').textContent = s.t; $('procDesc').textContent = s.d;
    deliv.innerHTML = s.items.map(([ic, b, sm], k) => `<div class="dcard" data-k="${k}"><i>${ic}</i><div><b>${b}</b><small>${sm}</small></div></div>`).join('');
    labels.forEach((l, k) => l.setAttribute('aria-current', String(k === idx)));
    track.setAttribute('aria-valuenow', idx + 1); track.setAttribute('aria-valuetext', `Etapa ${idx + 1}: ${s.t}`);
    track.querySelectorAll('.stop').forEach((st, k) => st.classList.toggle('on', k <= idx));
    if (!REDUCED) [...deliv.children].forEach((c, k) => c.animate([{transform: 'translate3d(40px,10px,0)', opacity: 0}, {transform: 'none', opacity: 1}], {duration: 700, delay: k * 70, easing: EASE_OUT, fill: 'backwards'}));
  }
  function apply() {
    const x = clamp(v.x, 0, 3), pct = x / 3 * 100;
    handle.style.left = pct + '%'; fill.style.width = pct + '%';
    const idx = Math.round(x);
    if (idx !== shown) { shown = idx; render(idx); }
    const f = x - idx;  // desplazamiento fraccional: las capas se separan según su profundidad
    [...deliv.children].forEach((c, k) => { c.style.translate = `${(-f * (30 + k * 40)).toFixed(1)}px 0`; });
    $('procText').style.translate = `${(-f * 24).toFixed(1)}px 0`;
  }
  const toVal = clientX => { const r = track.getBoundingClientRect(); return clamp((clientX - r.left) / r.width * 3, 0, 3); };
  track.addEventListener('pointerdown', e => { drag = true; track.setPointerCapture(e.pointerId); v.t = toVal(e.clientX); if (REDUCED) { v.x = Math.round(v.t); v.t = v.x; } });
  track.addEventListener('pointermove', e => { if (drag) v.t = toVal(e.clientX); });
  const up = () => { if (!drag) return; drag = false; v.t = Math.round(v.t); };
  track.addEventListener('pointerup', up); track.addEventListener('pointercancel', up);
  track.addEventListener('keydown', e => {
    if (['ArrowRight', 'ArrowUp'].includes(e.key)) { e.preventDefault(); v.t = clamp(Math.round(v.t) + 1, 0, 3); }
    if (['ArrowLeft', 'ArrowDown'].includes(e.key)) { e.preventDefault(); v.t = clamp(Math.round(v.t) - 1, 0, 3); }
    if (REDUCED) { v.x = v.t; apply(); }
  });
  labels.forEach((l, k) => l.addEventListener('click', () => { v.t = k; if (REDUCED) { v.x = k; apply(); } }));
  const loop = makeLoop(dt => { v.step(dt); apply(); });
  render(0); shown = 0; apply();
  scenes[3].enter = () => { if (!REDUCED) loop.start(); };
  scenes[3].leave = () => loop.stop();
}

/* ═══ 5 · Contacto: formulario por pasos ═══ */
{
  const steps = [...document.querySelectorAll('.wstep')], data = {tipo: '', plazo: '', nombre: '', correo: '', mensaje: ''};
  let s = 0;
  const back = $('wBack'), next = $('wNext');
  function valid() {
    if (s === 0) return !!data.tipo;
    if (s === 1) return !!data.plazo;
    if (s === 2) return true;
    return true;
  }
  function chrome() {
    [...$('wSteps').children].forEach((i, k) => i.classList.toggle('on', k <= s));
    $('wCount').textContent = `PASO ${s + 1} DE 4`;
    back.disabled = s === 0;
    next.innerHTML = s === 3 ? 'Copiar resumen' : s === 2 ? 'Revisar <span class="arr">→</span>' : 'Siguiente <span class="arr">→</span>';
    next.disabled = !valid();
  }
  function show(to) {
    const dir = to > s ? 1 : -1, a = steps[s], b = steps[to];
    a.getAnimations().forEach(x => x.cancel());
    if (REDUCED) { a.hidden = true; b.hidden = false; }
    else {
      a.animate([{transform: 'none', opacity: 1}, {transform: `translate3d(${-dir * 50}px,0,0)`, opacity: 0}], {duration: 260, easing: EASE_IN, fill: 'forwards'}).onfinish = () => { a.hidden = true; a.getAnimations().forEach(x => x.cancel()); b.hidden = false;
        b.animate([{transform: `translate3d(${dir * 60}px,0,0)`, opacity: 0}, {transform: 'none', opacity: 1}], {duration: 700, easing: EASE_OUT}); };
    }
    s = to; if (s === 3) summary(); chrome();
  }
  function summary() {
    const rows = [['Necesito', data.tipo], ['Plazo', data.plazo], ['Nombre', data.nombre], ['Correo', data.correo], ['Mensaje', data.mensaje || '—']];
    $('summary').innerHTML = rows.map(([k, v]) => `<div><span>${k}</span><b></b></div>`).join('');
    [...$('summary').children].forEach((d, i) => d.querySelector('b').textContent = rows[i][1]);
  }
  document.querySelectorAll('.opts').forEach(g => g.addEventListener('click', e => {
    const o = e.target.closest('.opt'); if (!o) return;
    g.querySelectorAll('.opt').forEach(x => x.setAttribute('aria-checked', String(x === o)));
    data[g.dataset.field] = o.dataset.v; chrome();
    setTimeout(() => { if (s < 2 && valid()) show(s + 1); }, REDUCED ? 0 : 280);
  }));
  next.addEventListener('click', async () => {
    if (s === 2) {
      data.nombre = $('fName').value.trim(); data.correo = $('fMail').value.trim(); data.mensaje = $('fMsg').value.trim();
      if (!data.nombre || !data.correo || !$('fMail').checkValidity()) { $('wErr').textContent = 'Escribe tu nombre y un correo válido para continuar.'; return; }
      $('wErr').textContent = ''; return show(3);
    }
    if (s === 3) {
      const txt = `Hola ID Studio,\n\nNecesito: ${data.tipo}\nPlazo: ${data.plazo}\nNombre: ${data.nombre}\nCorreo: ${data.correo}\n\n${data.mensaje}`;
      try { await navigator.clipboard.writeText(txt); $('wOk').textContent = 'Resumen copiado. Pégalo en un correo a id.studio.tecserv@gmail.com.'; }
      catch { $('wOk').textContent = 'No se pudo copiar automáticamente. Escríbenos a id.studio.tecserv@gmail.com con estos datos.'; }
      return;
    }
    if (valid()) show(s + 1);
  });
  back.addEventListener('click', () => { if (s > 0) show(s - 1); });
  window.presetWizard = v => {
    const g = document.querySelector('.opts[data-field="tipo"]');
    g.querySelectorAll('.opt').forEach(x => x.setAttribute('aria-checked', String(x.dataset.v === v)));
    data.tipo = v;
    if (s === 0) { steps[0].hidden = true; steps[1].hidden = false; s = 1; chrome(); }
  };
  chrome();
  $('copyMail').addEventListener('click', async e => {
    const t = $('mailTxt').textContent;
    try { await navigator.clipboard.writeText(t); e.target.textContent = 'Copiado'; }
    catch { const r = document.createRange(); r.selectNodeContents($('mailTxt')); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); e.target.textContent = 'Seleccionado'; }
    setTimeout(() => e.target.textContent = 'Copiar', 1800);
  });
  $('year').textContent = new Date().getFullYear();
}

/* ═══ Arranque ═══ */
{
  const start = fromHash();
  if (start > 0) { scenes[0].el.hidden = true; scenes[0].el.classList.remove('active'); scenes[start].el.hidden = false; scenes[start].el.classList.add('active'); cur = start; }
  updateChrome(); scenes[cur].enter();
  if (cur === 0 && !REDUCED) enterLayers([...scenes[0].el.querySelectorAll('.t')], 1, 80, .35);
}
})();
