// Default results revealed per page / "Load more" click.
const DEFAULT_PAGE_SIZE = 6;
// Default number of type-ahead suggestions.
const DEFAULT_SUGGESTION_LIMIT = 6;
// Debounce for the type-ahead (ms).
const INPUT_DEBOUNCE = 150;

// Columns searched for full-text matches. keywords is a default EDS index
// column; title/description are always present.
const TEXT_FIELDS = ['title', 'description', 'keywords'];
// Facet panel is built from the query-index `keywords` column (a default EDS
// index column, so no helix-query.yaml is needed).
const FACET_KEY = 'keywords';
const FACET_HEADING = 'Filter by';

/**
 * Read the single-value config fields the block model renders as rows.
 * @param {Element} block the block element
 * @returns {{heading:string, placeholder:string, trending:string[],
 *   pageSize:number, suggestionLimit:number}}
 */
function readConfig(block) {
  const rows = [...block.children];
  const value = (i) => (rows[i] ? rows[i].textContent.trim() : '');

  const heading = value(0);
  const placeholder = value(1) || 'What can we help you search for?';
  const trending = value(2)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const pageSize = parseInt(value(3), 10) || DEFAULT_PAGE_SIZE;

  return {
    heading, placeholder, trending, pageSize, suggestionLimit: DEFAULT_SUGGESTION_LIMIT,
  };
}

/**
 * Split a query-index cell into trimmed values (comma-separated).
 * @param {string} raw the raw cell value
 * @returns {string[]} values
 */
function splitValues(raw) {
  if (!raw) return [];
  return String(raw).split(',').map((v) => v.trim()).filter(Boolean);
}

/**
 * Fetch every row of /query-index.json (handles pagination via limit/offset).
 * @returns {Promise<Array<object>>} all index rows
 */
async function fetchIndex() {
  const rows = [];
  const limit = 500;
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(`/query-index.json?limit=${limit}&offset=${offset}`);
    if (!resp.ok) break;
    // eslint-disable-next-line no-await-in-loop
    const json = await resp.json();
    total = json.total ?? (json.data ? json.data.length : 0);
    rows.push(...(json.data || []));
    if (!json.data || json.data.length === 0) break;
    offset += limit;
  }
  return rows;
}

// Cache each row's searchable haystack so it is computed only once.
const haystackCache = new WeakMap();

/**
 * Build the searchable haystack for a row (lower-cased concatenation of the
 * text fields). Cached per row.
 * @param {object} row the index row
 * @returns {string} the lower-cased haystack
 */
function haystack(row) {
  let hay = haystackCache.get(row);
  if (hay === undefined) {
    hay = TEXT_FIELDS.map((f) => row[f] || '').join(' ').toLowerCase();
    haystackCache.set(row, hay);
  }
  return hay;
}

/**
 * Case-insensitive multi-token AND match: every whitespace-separated token in
 * the query must appear somewhere in the row's text fields.
 * @param {object} row the index row
 * @param {string[]} tokens lower-cased query tokens
 * @returns {boolean} true if all tokens match
 */
function matchesQuery(row, tokens) {
  if (!tokens.length) return false;
  const hay = haystack(row);
  return tokens.every((t) => hay.includes(t));
}

/**
 * Does a row satisfy the current keyword selection? OR across selected values.
 * @param {object} row the index row
 * @param {string[]} selected selected keyword values
 * @returns {boolean} true if the row matches (or nothing is selected)
 */
function matchesFacets(row, selected) {
  if (!selected.length) return true;
  const rowValues = splitValues(row[FACET_KEY]);
  return selected.some((v) => rowValues.includes(v));
}

/**
 * Build one result tile from a query-index row.
 * @param {object} row the index row
 * @returns {Element} the <li> tile
 */
function buildCard(row) {
  const card = document.createElement('li');
  card.classList.add('search-result');

  const body = document.createElement('div');
  body.classList.add('search-result-body');

  const h = document.createElement('p');
  h.classList.add('search-result-title');
  h.textContent = row.title || row.path;
  body.append(h);

  if (row.description) {
    const d = document.createElement('p');
    d.classList.add('search-result-desc');
    d.textContent = row.description;
    body.append(d);
  }

  card.append(body);

  // Full-tile clickable overlay.
  const overlay = document.createElement('a');
  overlay.className = 'search-result-link';
  overlay.href = row.path;
  overlay.setAttribute('aria-label', row.title || 'View page');
  card.append(overlay);

  return card;
}

/**
 * Collect the sorted, de-duped set of keyword values across all rows.
 * @param {Array<object>} rows the index rows
 * @returns {string[]} keyword values
 */
function collectKeywords(rows) {
  const values = new Set();
  rows.forEach((row) => splitValues(row[FACET_KEY]).forEach((v) => values.add(v)));
  return [...values].sort((a, b) => a.localeCompare(b));
}

/**
 * Build the keyword facet panel. Only called when there is at least one value.
 * @param {string[]} keywords the sorted keyword values
 * @param {Function} onChange callback invoked whenever the selection changes
 * @returns {{panel:Element, getSelection:Function, clear:Function}} panel API
 */
function buildFilterPanel(keywords, onChange) {
  const panel = document.createElement('div');
  panel.classList.add('search-panel');
  panel.hidden = true;

  const fieldset = document.createElement('fieldset');
  fieldset.classList.add('search-group');
  const legend = document.createElement('legend');
  legend.classList.add('search-group-title');
  legend.textContent = FACET_HEADING;
  fieldset.append(legend);

  const list = document.createElement('div');
  list.classList.add('search-options');
  keywords.forEach((value) => {
    const id = `search-kw-${value}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const wrap = document.createElement('label');
    wrap.classList.add('search-option');
    wrap.setAttribute('for', id);
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.value = value;
    input.addEventListener('change', onChange);
    const span = document.createElement('span');
    span.textContent = value;
    wrap.append(input, span);
    list.append(wrap);
  });
  fieldset.append(list);

  const actions = document.createElement('div');
  actions.classList.add('search-actions');
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.classList.add('search-clear-filters');
  clearBtn.textContent = 'Show All';
  actions.append(clearBtn);

  panel.append(fieldset, actions);

  const getSelection = () => [...panel.querySelectorAll('input:checked')].map((input) => input.value);
  const clear = () => {
    panel.querySelectorAll('input:checked').forEach((input) => { input.checked = false; });
  };

  clearBtn.addEventListener('click', () => { clear(); onChange(); });

  return { panel, getSelection, clear };
}

/**
 * loads and decorates the search block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readConfig(block);
  block.textContent = '';

  // Blue hero band holds the heading, search bar, and trending topics — matching
  // the source, where these sit on a deep-navy background and the results/filters
  // render below on white.
  const hero = document.createElement('div');
  hero.classList.add('search-hero');
  const heroInner = document.createElement('div');
  heroInner.classList.add('search-hero-inner');
  hero.append(heroInner);
  block.append(hero);

  // Optional heading.
  if (config.heading) {
    const h = document.createElement('h2');
    h.classList.add('search-heading');
    h.textContent = config.heading;
    heroInner.append(h);
  }

  // --- Search bar (input + suggestions dropdown + clear) ---
  const bar = document.createElement('div');
  bar.classList.add('search-bar');

  const inputWrap = document.createElement('div');
  inputWrap.classList.add('search-input-wrap');

  const input = document.createElement('input');
  input.type = 'search';
  input.classList.add('search-input');
  input.placeholder = config.placeholder;
  input.setAttribute('aria-label', 'Search');
  input.autocomplete = 'off';

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.classList.add('search-clear');
  clearBtn.setAttribute('aria-label', 'Clear search');
  clearBtn.textContent = '×';
  clearBtn.hidden = true;

  const suggestions = document.createElement('ul');
  suggestions.classList.add('search-suggestions');
  suggestions.setAttribute('role', 'listbox');
  suggestions.hidden = true;

  inputWrap.append(input, clearBtn, suggestions);

  const searchBtn = document.createElement('button');
  searchBtn.type = 'button';
  searchBtn.classList.add('search-submit', 'button', 'primary');
  searchBtn.textContent = 'Search';

  bar.append(inputWrap, searchBtn);
  heroInner.append(bar);

  // --- Trending topics (initial/empty state) ---
  let trendingWrap = null;
  if (config.trending.length) {
    trendingWrap = document.createElement('div');
    trendingWrap.classList.add('search-trending');
    const th = document.createElement('h3');
    th.classList.add('search-trending-title');
    th.textContent = 'Trending Topics';
    const chips = document.createElement('ul');
    chips.classList.add('search-chips');
    config.trending.forEach((topic) => {
      const li = document.createElement('li');
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.classList.add('search-chip');
      chip.textContent = topic;
      li.append(chip);
      chips.append(li);
    });
    trendingWrap.append(th, chips);
    heroInner.append(trendingWrap);
  }

  // --- Results layout (sidebar + results) ---
  const layout = document.createElement('div');
  layout.classList.add('search-layout');

  const sidebar = document.createElement('div');
  sidebar.classList.add('search-sidebar');

  const resultsCol = document.createElement('div');
  resultsCol.classList.add('search-results-col');

  const count = document.createElement('p');
  count.classList.add('search-count');

  const results = document.createElement('ul');
  results.classList.add('search-results');

  const loadMore = document.createElement('button');
  loadMore.type = 'button';
  loadMore.classList.add('search-load-more', 'button');
  loadMore.textContent = 'Load more';
  loadMore.hidden = true;

  resultsCol.append(count, results, loadMore);
  layout.append(sidebar, resultsCol);

  // Results/filters render below the hero on a white band.
  const resultsBand = document.createElement('div');
  resultsBand.classList.add('search-results-band');
  resultsBand.append(layout);
  block.append(resultsBand);

  // --- Data ---
  let allRows = [];
  try {
    allRows = (await fetchIndex()).filter((row) => row.path && row.title);
  } catch {
    allRows = [];
  }

  // Build the keyword facet only if the indexed pages carry keywords.
  const keywords = collectKeywords(allRows);
  let filterPanel = null;

  let currentQuery = '';
  let visibleLimit = config.pageSize;

  const tokenize = (q) => q.toLowerCase().split(/\s+/).filter(Boolean);

  const render = () => {
    const tokens = tokenize(currentQuery);
    const selected = filterPanel ? filterPanel.getSelection() : [];
    // Query-only matches drive the sidebar's visibility; the facet-filtered set
    // drives the rendered results.
    const queryMatches = allRows.filter((row) => matchesQuery(row, tokens));
    const filtered = queryMatches.filter((row) => matchesFacets(row, selected));

    // Hide the whole filter sidebar when the query itself returns nothing —
    // there is nothing to filter. It stays visible when a facet selection is
    // what emptied the results, so the user can still adjust or clear it.
    sidebar.hidden = queryMatches.length === 0;

    results.textContent = '';
    filtered.slice(0, visibleLimit).forEach((row) => results.append(buildCard(row)));

    const shown = Math.min(filtered.length, visibleLimit);
    if (filtered.length) {
      count.textContent = `Showing ${shown} of ${filtered.length} results for ‘${currentQuery}’`;
    } else {
      count.textContent = `No results for ‘${currentQuery}’`;
    }
    loadMore.hidden = visibleLimit >= filtered.length;
  };

  // Show results view (hide trending); or restore the trending/empty state.
  const showResults = () => {
    if (trendingWrap) trendingWrap.hidden = true;
    resultsBand.hidden = false;
  };
  const showEmpty = () => {
    resultsBand.hidden = true;
    if (trendingWrap) trendingWrap.hidden = false;
  };

  const hideSuggestions = () => {
    suggestions.hidden = true;
    suggestions.textContent = '';
  };

  // Run a full search for a term (updates input, URL, and results).
  const runSearch = (term) => {
    currentQuery = term.trim();
    input.value = currentQuery;
    clearBtn.hidden = !currentQuery;
    hideSuggestions();
    visibleLimit = config.pageSize;

    const url = new URL(window.location.href);
    if (currentQuery) {
      url.searchParams.set('q', currentQuery);
      showResults();
      render();
    } else {
      url.searchParams.delete('q');
      showEmpty();
    }
    window.history.replaceState({}, '', url);
  };

  // --- Type-ahead suggestions (client-side from query-index) ---
  const renderSuggestions = () => {
    const tokens = tokenize(input.value);
    if (!tokens.length) { hideSuggestions(); return; }
    const matched = allRows
      .filter((row) => matchesQuery(row, tokens))
      .slice(0, config.suggestionLimit);
    suggestions.textContent = '';
    if (!matched.length) { hideSuggestions(); return; }
    matched.forEach((row) => {
      const li = document.createElement('li');
      li.classList.add('search-suggestion');
      li.setAttribute('role', 'option');
      li.tabIndex = -1;
      const label = splitValues(row[FACET_KEY])[0] || '';
      if (label) {
        const eyebrow = document.createElement('span');
        eyebrow.classList.add('search-suggestion-label');
        eyebrow.textContent = label;
        li.append(eyebrow);
      }
      const title = document.createElement('span');
      title.classList.add('search-suggestion-title');
      title.textContent = row.title;
      li.append(title);
      li.addEventListener('mousedown', (e) => {
        // mousedown (not click) so it fires before the input blur hides the list
        e.preventDefault();
        runSearch(row.title);
      });
      suggestions.append(li);
    });
    suggestions.hidden = false;
  };

  // Keyboard navigation within the suggestions dropdown.
  const moveActive = (dir) => {
    const items = [...suggestions.querySelectorAll('.search-suggestion')];
    if (!items.length) return;
    const currentIdx = items.findIndex((el) => el.classList.contains('active'));
    let next = currentIdx + dir;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    items.forEach((el) => el.classList.remove('active'));
    items[next].classList.add('active');
    items[next].scrollIntoView({ block: 'nearest' });
  };

  let debounce;
  input.addEventListener('input', () => {
    clearBtn.hidden = !input.value;
    clearTimeout(debounce);
    // Emptying the field (backspace or the native clear control) returns the
    // block to its initial state: no results shown, trending topics restored.
    if (!input.value.trim()) {
      if (filterPanel) filterPanel.clear();
      runSearch('');
      return;
    }
    debounce = setTimeout(renderSuggestions, INPUT_DEBOUNCE);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === 'Escape') {
      hideSuggestions();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const active = suggestions.querySelector('.search-suggestion.active');
      if (active && !suggestions.hidden) {
        runSearch(active.querySelector('.search-suggestion-title').textContent);
      } else {
        runSearch(input.value);
      }
    }
  });

  input.addEventListener('blur', () => {
    // Delay so a suggestion mousedown can resolve first.
    setTimeout(hideSuggestions, 100);
  });

  searchBtn.addEventListener('click', () => runSearch(input.value));

  clearBtn.addEventListener('click', () => {
    if (filterPanel) filterPanel.clear();
    runSearch('');
    input.focus();
  });

  // Trending chips run a search for their label.
  if (trendingWrap) {
    trendingWrap.querySelectorAll('.search-chip').forEach((chip) => {
      chip.addEventListener('click', () => runSearch(chip.textContent));
    });
  }

  // Build filter panel + toggle when keywords exist.
  if (keywords.length) {
    const filtersToggle = document.createElement('button');
    filtersToggle.type = 'button';
    filtersToggle.classList.add('search-filters-toggle');
    filtersToggle.setAttribute('aria-expanded', 'false');
    filtersToggle.textContent = 'Filters';

    filterPanel = buildFilterPanel(keywords, () => {
      visibleLimit = config.pageSize;
      render();
    });

    filtersToggle.addEventListener('click', () => {
      const open = filterPanel.panel.hidden;
      filterPanel.panel.hidden = !open;
      filtersToggle.setAttribute('aria-expanded', String(open));
    });

    sidebar.append(filtersToggle, filterPanel.panel);
    // On desktop the panel is always visible; CSS controls the toggle display.
    filterPanel.panel.hidden = false;
  }

  loadMore.addEventListener('click', () => {
    visibleLimit += config.pageSize;
    render();
  });

  // Pre-run a search if ?q= is present in the URL.
  const initialQuery = new URL(window.location.href).searchParams.get('q');
  if (initialQuery) {
    runSearch(initialQuery);
  } else {
    showEmpty();
  }
}
