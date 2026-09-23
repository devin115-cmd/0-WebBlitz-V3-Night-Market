type Listener = (ambient: boolean) => void;

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set<Listener>();
let paused = readPaused();

function readPaused(): boolean {
  try { return window.sessionStorage.getItem('wb-motion') === 'paused'; } catch { return false; }
}

function emit() {
  document.documentElement.classList.toggle('motion-paused', paused);
  listeners.forEach((listener) => listener(motion.ambient));
}

/** One source of truth for decorative motion: the visible toggle, reduced-motion preference and tab visibility. */
export const motion = {
  get reduced() { return reducedQuery.matches; },
  get paused() { return paused; },
  get ambient() { return !paused && !reducedQuery.matches && !document.hidden; },
  setPaused(value: boolean) {
    paused = value;
    try { window.sessionStorage.setItem('wb-motion', value ? 'paused' : 'running'); } catch { /* storage unavailable */ }
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    listener(motion.ambient);
    return () => listeners.delete(listener);
  },
};

reducedQuery.addEventListener('change', emit);
document.addEventListener('visibilitychange', emit);
emit();
