interface Results { zero: string; one: string; other: string; }

/** Search and category filters for the designs page. Without JavaScript all 40 designs stay listed. */
export function setupCatalogue(root: HTMLElement, results: Results, numberTag: string, onChange: (visible: HTMLElement[]) => void) {
  const form = root.querySelector<HTMLFormElement>('[data-filters]');
  const input = root.querySelector<HTMLInputElement>('[data-search]');
  const status = root.querySelector<HTMLElement>('[data-results]');
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const clears = [...root.querySelectorAll<HTMLButtonElement>('[data-clear]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-grid] [data-card]')];
  if (!form || !input || !status || !empty) return;
  const format = new Intl.NumberFormat(numberTag);
  const params = new URLSearchParams(window.location.search);
  let query = (params.get('q') || '').trim();
  let type = chips.some((chip) => chip.dataset.filter === params.get('type')) ? params.get('type') || '' : '';
  input.value = query;

  const apply = (announce: boolean) => {
    const needle = query.toLocaleLowerCase();
    const visible = cards.filter((card) => {
      const match = (!type || card.dataset.category === type) && (!needle || (card.dataset.search || '').includes(needle));
      card.hidden = !match;
      return match;
    });
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String((chip.dataset.filter || '') === type)));
    const count = visible.length;
    const template = count === 0 ? results.zero : count === 1 ? results.one : results.other;
    const text = template.replace('{count}', format.format(count));
    if (announce || status.textContent !== text) status.textContent = text;
    empty.hidden = count > 0;
    clears.forEach((button) => { button.hidden = !query && !type; });
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    if (type) next.set('type', type);
    const search = next.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`);
    onChange(visible);
  };

  let timer = 0;
  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => { query = input.value.trim(); apply(true); }, 140);
  });
  chips.forEach((chip) => chip.addEventListener('click', () => { type = chip.dataset.filter || ''; apply(true); }));
  clears.forEach((button) => button.addEventListener('click', () => { query = ''; type = ''; input.value = ''; apply(true); input.focus(); }));
  form.hidden = false;
  apply(false);
}
