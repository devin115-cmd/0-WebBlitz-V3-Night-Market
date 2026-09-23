import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { startAurora } from './aurora';
import { setupCatalogue } from './catalogue';
import { motion } from './state';

gsap.registerPlugin(ScrollTrigger);

interface Runtime {
  pause: string; resume: string; pauseLabel: string; resumeLabel: string;
  menuOpen: string; menuClose: string;
  results: { zero: string; one: string; other: string };
  numberTag: string;
}

const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document) => scope.querySelector<T>(selector);
const $$ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document) => [...scope.querySelectorAll<T>(selector)];
const runtime = JSON.parse($('#wb-runtime')?.textContent || '{}') as Runtime;

function setupMotionToggle() {
  const button = $<HTMLButtonElement>('[data-motion-toggle]');
  const text = $('[data-motion-text]');
  if (!button || !text) return;
  const render = () => {
    const paused = motion.paused || motion.reduced;
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? runtime.resumeLabel : runtime.pauseLabel);
    button.disabled = motion.reduced;
    const label = paused ? runtime.resume : runtime.pause;
    if (text.textContent !== label) text.textContent = label;
  };
  button.addEventListener('click', () => motion.setPaused(!motion.paused));
  motion.subscribe(render);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', render);
  button.hidden = false;
}

function setupMenu() {
  const menu = $<HTMLDetailsElement>('[data-menu]');
  const summary = menu?.querySelector('summary');
  if (!menu || !summary) return;
  const sync = () => summary.setAttribute('aria-label', menu.open ? runtime.menuClose : runtime.menuOpen);
  menu.addEventListener('toggle', sync);
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
  });
  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target as Node)) menu.open = false;
  });
  sync();
}

function setupFrames() {
  $$<HTMLImageElement>('[data-frame] img').forEach((image) => {
    const fail = () => {
      const frame = image.closest('[data-frame]');
      frame?.classList.add('is-broken');
      frame?.querySelector<HTMLElement>('.frame__fail')?.removeAttribute('hidden');
    };
    if (image.complete && image.naturalWidth === 0 && image.currentSrc) fail();
    image.addEventListener('error', fail, { once: true });
  });
}

/** The page background drifts between night market and daylight as each section takes the stage. */
function setupTheme() {
  const sections = $$('.section[data-theme]');
  if (!sections.length) return;
  root.classList.add('theme-live');
  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) document.body.dataset.theme = section.dataset.theme; },
    });
  });
}

function setupNav() {
  const nav = $('[data-nav]');
  const menu = $<HTMLDetailsElement>('[data-menu]');
  const pill = $('[data-nav-pill]');
  if (!nav) return;
  let lastY = window.scrollY;
  let queued = false;
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 6) return;
      nav.classList.toggle('is-hidden', y > lastY && y > 480 && !menu?.open && !nav.contains(document.activeElement));
      lastY = y;
    });
  }, { passive: true });
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
  const links = $$<HTMLAnchorElement>('[data-section-link]');
  const movePill = (link?: HTMLAnchorElement) => {
    if (!pill) return;
    if (!link) { pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
  };
  $$('[data-section][id]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        const link = links.find((item) => item.dataset.sectionLink === section.id);
        if (!link) return;
        if (self.isActive) {
          links.forEach((item) => { if (item !== link && item.getAttribute('aria-current') === 'location') item.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'location');
          movePill(link);
        } else if (link.getAttribute('aria-current') === 'location') {
          link.removeAttribute('aria-current');
          movePill(links.find((item) => item.getAttribute('aria-current')) || undefined);
        }
      },
    });
  });
  movePill(links.find((item) => item.getAttribute('aria-current') === 'page'));
}

function setupProgress() {
  const bar = $('[data-progress]');
  if (!bar) return;
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  update();
}

function setupProcess() {
  const device = $('[data-device]');
  const steps = $$('[data-step]');
  if (!device || !steps.length) return;
  const small = window.matchMedia('(max-width: 959px)');
  const activate = (index: number) => {
    if (!small.matches) device.dataset.stage = String(index);
    steps.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex === index));
  };
  activate(0);
  steps.forEach((step, index) => {
    ScrollTrigger.create({ trigger: step, start: 'top 62%', end: 'bottom 62%', onToggle: (self) => { if (self.isActive) activate(index); } });
  });

  // On phones the device sits inline, so it cycles on its own while visible instead of following scroll.
  let timer = 0;
  let visible = false;
  let stage = 0;
  const cycle = () => {
    window.clearInterval(timer);
    timer = 0;
    if (!small.matches) return;
    if (!motion.ambient) { device.dataset.stage = '2'; return; }
    if (!visible) return;
    timer = window.setInterval(() => { stage = (stage + 1) % 3; device.dataset.stage = String(stage); }, 2600);
  };
  new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting ?? false; cycle(); }).observe(device);
  small.addEventListener('change', () => { if (!small.matches) activate(Math.max(0, steps.findIndex((step) => step.classList.contains('is-active')))); cycle(); });
  motion.subscribe(cycle);
}

function setupMarquee(active: boolean) {
  const marquee = $('[data-marquee]');
  if (!marquee) return () => {};
  const tracks = $$('.marquee__track', marquee);
  const animations = tracks.flatMap((track) => track.getAnimations());
  if (!active) return () => {};
  let reset = gsap.delayedCall(0, () => {});
  const trigger = ScrollTrigger.create({
    trigger: marquee,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const velocity = self.getVelocity();
      const rate = 1 + Math.min(Math.abs(velocity) / 350, 4);
      animations.forEach((animation) => animation.updatePlaybackRate(rate));
      gsap.to(tracks, { '--skew': `${gsap.utils.clamp(-10, 10, velocity / -160)}deg`, duration: 0.35, overwrite: true });
      reset.kill();
      reset = gsap.delayedCall(0.18, () => {
        animations.forEach((animation) => animation.updatePlaybackRate(1));
        gsap.to(tracks, { '--skew': '0deg', duration: 0.8, ease: 'power3.out', overwrite: true });
      });
    },
  });
  return () => { trigger.kill(); reset.kill(); animations.forEach((animation) => animation.updatePlaybackRate(1)); };
}

function heroIntro(onDone: () => void) {
  const hero = $('[data-hero]');
  root.classList.add('motion-ready');
  if (!hero) { onDone(); return; }
  const timeline = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: onDone });
  timeline
    .fromTo($$('[data-split] .w > span', hero), { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.25, stagger: 0.07 }, 0.1)
    .fromTo($$('[data-fan] .frame', hero), { y: 160, opacity: 0, rotation: (index: number) => [-14, 14, 6][index] ?? 0, scale: 0.9 },
      { y: 0, opacity: 1, rotation: 0, scale: 1, duration: 1.7, stagger: 0.14 }, 0.25)
    .fromTo($$('[data-intro]', hero), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08 }, 0.45);
}

function heroScroll(desktop: boolean) {
  const hero = $('[data-hero]');
  if (!hero) return;
  const frames = $$('[data-fan] .frame', hero);
  const spread = desktop ? 1 : 0.5;
  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.7 } })
    .to(frames[0] ?? {}, { x: -90 * spread, y: 70, rotation: -14, ease: 'none' }, 0)
    .to(frames[1] ?? {}, { x: 110 * spread, y: -50, rotation: 13, ease: 'none' }, 0)
    .to(frames[2] ?? {}, { y: -90, scale: 1.08, ease: 'none' }, 0)
    .to($('[data-hero-copy]', hero) ?? {}, { y: -80, opacity: 0.15, ease: 'none' }, 0)
    .to($('[data-lanterns]', hero) ?? {}, { y: -160, ease: 'none' }, 0)
    .to($('[data-aurora]', hero) ?? {}, { opacity: 0.3, ease: 'none' }, 0);
}

function reveals() {
  $$('[data-split]').forEach((heading) => {
    if (heading.closest('[data-hero]')) return;
    gsap.fromTo($$('.w > span', heading), { yPercent: 110 }, {
      yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.05,
      scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
    });
  });
  const batch = (selector: string, from: gsap.TweenVars, stagger = 0.08) => {
    const items = $$(selector);
    if (!items.length) return;
    gsap.set(items, from);
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: (elements) => gsap.to(elements, { y: 0, x: 0, scale: 1, opacity: 1, rotation: 0, duration: 1.1, ease: 'expo.out', stagger, overwrite: true }),
    });
  };
  batch('[data-reveal]', { y: 44, opacity: 0 });
  batch('[data-tile]', { y: 60, scale: 0.94, opacity: 0 }, 0.06);
  batch('[data-grid] [data-card]', { y: 70, opacity: 0 }, 0.07);
}

function counters() {
  const format = new Intl.NumberFormat(runtime.numberTag);
  $$('[data-count]').forEach((element) => {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;
    const state = { value: 0 };
    const final = element.textContent;
    if (element.getBoundingClientRect().top > window.innerHeight) element.textContent = format.format(0);
    ScrollTrigger.create({
      trigger: element,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(state, {
        value: target, duration: target > 100 ? 1.9 : 1.3, ease: 'power3.out',
        onUpdate: () => { element.textContent = format.format(Math.round(state.value)); },
        onComplete: () => { element.textContent = final; },
      }),
    });
  });
}

function gallery(desktop: boolean) {
  const rail = $('[data-rail]');
  const track = $('[data-rail-track]');
  if (!rail || !track) return () => {};
  if (!desktop) return () => {};
  rail.classList.add('is-pinned');
  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: { trigger: rail, start: 'center 55%', end: () => `+=${distance() * 0.75}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 1 },
  });
  $$('.card', track).forEach((card) => {
    gsap.fromTo(card, { rotationY: -22, z: -160, opacity: 0.35, transformPerspective: 1400 }, {
      rotationY: 0, z: 0, opacity: 1, ease: 'power2.out',
      scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 100%', end: 'left 58%', scrub: true },
    });
  });
  return () => rail.classList.remove('is-pinned');
}

function processLine() {
  const line = $('[data-steps-line]');
  if (!line) return;
  gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-steps]', start: 'top 62%', end: 'bottom 62%', scrub: 0.5 } });
}

function finale() {
  const section = $('[data-finale]');
  const sun = $('[data-sun]');
  if (!section || !sun) return;
  gsap.fromTo(sun, { scale: 0.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: 0.6 } });
  const word = $('[data-footer-word]');
  if (word) gsap.fromTo(word, { '--fill': '0%' }, { '--fill': '100%', ease: 'none', scrollTrigger: { trigger: word, start: 'top 98%', end: 'bottom 75%', scrub: 0.6 } });
}

function pointerEffects(desktop: boolean) {
  const cleanups: Array<() => void> = [];
  const on = <K extends keyof HTMLElementEventMap>(target: HTMLElement | Window, type: K, handler: (event: HTMLElementEventMap[K]) => void) => {
    target.addEventListener(type, handler as EventListener, { passive: true });
    cleanups.push(() => target.removeEventListener(type, handler as EventListener));
  };

  $$('[data-magnetic]').forEach((button) => {
    const x = gsap.quickTo(button, 'x', { duration: 0.7, ease: 'elastic.out(1, .45)' });
    const y = gsap.quickTo(button, 'y', { duration: 0.7, ease: 'elastic.out(1, .45)' });
    on(button, 'pointermove', (event) => {
      const box = button.getBoundingClientRect();
      x((event.clientX - box.left - box.width / 2) * 0.28);
      y((event.clientY - box.top - box.height / 2) * 0.38);
    });
    on(button, 'pointerleave', () => { x(0); y(0); });
    cleanups.push(() => gsap.set(button, { x: 0, y: 0 }));
  });

  $$('[data-tilt]').forEach((link) => {
    const frame = $('.frame', link);
    if (!frame) return;
    on(link, 'pointermove', (event) => {
      const box = link.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width;
      const py = (event.clientY - box.top) / box.height;
      frame.style.setProperty('--ry', `${(px - 0.5) * 10}deg`);
      frame.style.setProperty('--rx', `${(0.5 - py) * 8}deg`);
      frame.style.setProperty('--gx', `${px * 100}%`);
      frame.style.setProperty('--gy', `${py * 100}%`);
    });
    on(link, 'pointerleave', () => { frame.style.setProperty('--rx', '0deg'); frame.style.setProperty('--ry', '0deg'); });
  });

  const ticket = $('[data-ticket]');
  if (ticket && desktop) {
    const rx = gsap.quickTo(ticket, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(ticket, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    gsap.set(ticket, { transformPerspective: 1200 });
    on(ticket, 'pointermove', (event) => {
      const box = ticket.getBoundingClientRect();
      ry(((event.clientX - box.left) / box.width - 0.5) * 10);
      rx((0.5 - (event.clientY - box.top) / box.height) * 8);
    });
    on(ticket, 'pointerleave', () => { rx(0); ry(0); });
  }

  const hero = $('[data-hero]');
  const fan = $('[data-fan]');
  if (hero && fan && desktop) {
    const fx = gsap.quickTo(fan, 'rotationY', { duration: 1.2, ease: 'power3.out' });
    const fy = gsap.quickTo(fan, 'rotationX', { duration: 1.2, ease: 'power3.out' });
    const lanterns = $$('.lantern', hero).map((lantern) => ({
      depth: Number(lantern.dataset.depth || 0.5),
      x: gsap.quickTo(lantern, 'x', { duration: 1.6, ease: 'power3.out' }),
      y: gsap.quickTo(lantern, 'y', { duration: 1.6, ease: 'power3.out' }),
    }));
    on(hero, 'pointermove', (event) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      fx(nx * 12);
      fy(-ny * 8);
      lanterns.forEach((lantern) => { lantern.x(nx * -90 * lantern.depth); lantern.y(ny * -60 * lantern.depth); });
    });
    cleanups.push(() => gsap.set(fan, { rotationX: 0, rotationY: 0 }));
  }

  const glow = $('[data-cursor]');
  if (glow) {
    const gx = gsap.quickTo(glow, 'x', { duration: 0.9, ease: 'power3.out' });
    const gy = gsap.quickTo(glow, 'y', { duration: 0.9, ease: 'power3.out' });
    on(window, 'pointermove', (event) => { glow.classList.add('is-on'); gx(event.clientX); gy(event.clientY); });
    cleanups.push(() => glow.classList.remove('is-on'));
  }
  return () => cleanups.forEach((cleanup) => cleanup());
}

function init() {
  setupMotionToggle();
  setupMenu();
  setupFrames();
  setupTheme();
  setupNav();
  setupProgress();
  setupProcess();

  const aurora = $<HTMLCanvasElement>('[data-aurora]');
  if (aurora) startAurora(aurora);

  const catalogue = $('[data-catalogue]');
  if (catalogue) {
    setupCatalogue(catalogue, runtime.results, runtime.numberTag, (visible) => {
      ScrollTrigger.refresh();
      if (!motion.reduced) gsap.fromTo(visible.slice(0, 12), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.04, overwrite: true });
    });
  }

  const media = gsap.matchMedia();
  media.add({
    full: '(prefers-reduced-motion: no-preference)',
    desktop: '(min-width: 960px)',
    fine: '(hover: hover) and (pointer: fine)',
  }, (context) => {
    const { full, desktop, fine } = context.conditions as { full: boolean; desktop: boolean; fine: boolean };
    if (!full) {
      root.classList.add('motion-ready');
      gsap.set('[data-steps-line]', { scaleY: 1 });
      return;
    }
    heroIntro(() => heroScroll(desktop));
    reveals();
    counters();
    processLine();
    finale();
    const stopGallery = gallery(desktop);
    const stopMarquee = setupMarquee(true);
    const stopPointer = fine ? pointerEffects(desktop) : () => {};
    ScrollTrigger.sort();
    return () => { stopGallery(); stopMarquee(); stopPointer(); };
  });
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

try {
  init();
} finally {
  root.classList.add('motion-ready');
}
