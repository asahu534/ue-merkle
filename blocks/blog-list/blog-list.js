// Default number of cards to reveal per page / "Load more" click.
const DEFAULT_PAGE_SIZE = 12;

// Facet groups, keyed by the query-index column that carries the value.
// label = panel heading; key = property on each query-index row.
const FACET_GROUPS = [
  { label: 'Content Type', key: 'content-type' },
  { label: 'Industries', key: 'industry' },
  { label: 'Capabilities', key: 'capability' },
  { label: 'Partners', key: 'partner' },
  { label: 'Country', key: 'country' },
];

// Sort options: value -> { label, compare }.
const SORTS = {
  newest: { label: 'Newest first', compare: (a, b) => (b.lastModified || 0) - (a.lastModified || 0) },
  oldest: { label: 'Oldest first', compare: (a, b) => (a.lastModified || 0) - (b.lastModified || 0) },
  'title-asc': { label: 'Title (A–Z)', compare: (a, b) => a.title.localeCompare(b.title) },
  'title-desc': { label: 'Title (Z–A)', compare: (a, b) => b.title.localeCompare(a.title) },
};

/**
 * Read the single-value config fields the block model renders as rows.
 * The parent-page cell (aem-content) renders as an anchor whose href is the
 * clean delivery path (/merkle-now) but whose text is the AEM content path
 * (/content/universal-editor-merkle/merkle-now). The query index uses the clean
 * path on EDS hosts and the content path on the author instance, so we keep both
 * as candidate parents and match a descendant against either — that's what makes
 * the list populate in Universal Editor on author as well as on EDS preview.
 * @param {Element} block the block element
 * @returns {{parents:string[], heading:string, defaultSort:string, pageSize:number}}
 */
function readConfig(block) {
  const rows = [...block.children];
  const value = (i) => (rows[i] ? rows[i].textContent.trim() : '');
  const linkAt = (i) => (rows[i] ? rows[i].querySelector('a') : null);

  const parentLink = linkAt(0);
  const parents = [];
  if (parentLink) {
    if (parentLink.getAttribute('href')) parents.push(parentLink.getAttribute('href'));
    if (parentLink.textContent.trim()) parents.push(parentLink.textContent.trim());
  } else if (value(0)) {
    parents.push(value(0));
  }

  const heading = value(1);
  const defaultSort = value(2) || 'newest';
  const pageSize = parseInt(value(3), 10) || DEFAULT_PAGE_SIZE;

  return {
    parents, heading, defaultSort, pageSize,
  };
}

// AEM content-root prefixes to strip so author paths
// (/content/<site>/merkle-now) compare equal to EDS delivery paths
// (/merkle-now). Any "/content/<something>" leading segment pair is removed.
const CONTENT_ROOT_RE = /^\/content\/[^/]+/;

/**
 * Normalise a path to its clean, comparable form: strip origin, any AEM
 * content-root prefix (/content/<site>), trailing slash, and .html extension.
 * This makes parent and row paths comparable across environments — the query
 * index uses clean paths on EDS hosts and /content/<site>/... on author.
 * @param {string} raw the raw path or URL
 * @returns {string} a clean root-relative path with no trailing slash
 */
function normalisePath(raw) {
  if (!raw) return '';
  let path = raw;
  try {
    path = new URL(raw, window.location.origin).pathname;
  } catch {
    /* already a path */
  }
  path = path.replace(/\.html?$/, '').replace(/\/$/, '');
  return path.replace(CONTENT_ROOT_RE, '');
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

/**
 * Build one result tile from a query-index row.
 * @param {object} row the index row
 * @returns {Element} the <li> tile
 */
function buildCard(row) {
  const card = document.createElement('li');
  card.classList.add('blog-list-card');

  const body = document.createElement('div');
  body.classList.add('blog-list-card-body');

  const label = splitValues(row['content-type'])[0] || '';
  if (label) {
    const p = document.createElement('p');
    p.classList.add('blog-list-card-label');
    p.textContent = label;
    body.append(p);
  }

  const h = document.createElement('h3');
  h.textContent = row.title || row.path;
  body.append(h);

  const cta = document.createElement('a');
  cta.href = row.path;
  cta.textContent = 'Read more';
  body.append(cta);

  card.append(body);

  // Full-tile clickable overlay.
  const overlay = document.createElement('a');
  overlay.className = 'blog-list-card-link';
  overlay.href = row.path;
  overlay.setAttribute('aria-label', row.title || 'Read more');
  card.append(overlay);

  return card;
}

/**
 * Build the facet panel from the union of metadata values across all rows.
 * @param {Array<object>} rows the descendant rows
 * @param {Function} onChange callback invoked whenever the selection changes
 * @returns {{panel:Element, getSelection:Function, clear:Function}} panel API
 */
function buildFilterPanel(rows, onChange) {
  const panel = document.createElement('div');
  panel.classList.add('blog-list-panel');
  panel.hidden = true;

  const groupsWrap = document.createElement('div');
  groupsWrap.classList.add('blog-list-groups');

  FACET_GROUPS.forEach(({ label, key }) => {
    const values = new Set();
    rows.forEach((row) => splitValues(row[key]).forEach((v) => values.add(v)));
    if (values.size === 0) return; // hide empty groups

    const fieldset = document.createElement('fieldset');
    fieldset.classList.add('blog-list-group');
    const legend = document.createElement('legend');
    legend.classList.add('blog-list-group-title');
    legend.textContent = label;
    fieldset.append(legend);

    const list = document.createElement('div');
    list.classList.add('blog-list-options');
    [...values].sort((a, b) => a.localeCompare(b)).forEach((value) => {
      const id = `bl-${key}-${value}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      const wrap = document.createElement('label');
      wrap.classList.add('blog-list-option');
      wrap.setAttribute('for', id);
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = id;
      input.dataset.key = key;
      input.value = value;
      input.addEventListener('change', onChange);
      const span = document.createElement('span');
      span.textContent = value;
      wrap.append(input, span);
      list.append(wrap);
    });
    fieldset.append(list);
    groupsWrap.append(fieldset);
  });

  const actions = document.createElement('div');
  actions.classList.add('blog-list-actions');
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.classList.add('blog-list-clear');
  clearBtn.textContent = 'Show All';
  const applyBtn = document.createElement('button');
  applyBtn.type = 'button';
  applyBtn.classList.add('blog-list-apply', 'button', 'primary');
  applyBtn.textContent = 'Apply Filter';
  actions.append(clearBtn, applyBtn);

  panel.append(groupsWrap, actions);

  const getSelection = () => {
    const sel = {};
    panel.querySelectorAll('input:checked').forEach((input) => {
      const { key } = input.dataset;
      sel[key] = (sel[key] || []).concat(input.value);
    });
    return sel;
  };

  const clear = () => {
    panel.querySelectorAll('input:checked').forEach((input) => { input.checked = false; });
  };

  clearBtn.addEventListener('click', () => { clear(); onChange(); });
  applyBtn.addEventListener('click', () => { panel.hidden = true; });

  return { panel, getSelection, clear };
}

/**
 * Does a row satisfy the current selection? AND across groups, OR within a group.
 * @param {object} row the index row
 * @param {Object<string,string[]>} selection selected values per group key
 * @returns {boolean} true if the row matches
 */
function matches(row, selection) {
  return Object.entries(selection).every(([key, values]) => {
    const rowValues = splitValues(row[key]);
    return values.some((v) => rowValues.includes(v));
  });
}

/**
 * loads and decorates the blog-list block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readConfig(block);
  block.textContent = '';

  // Candidate parent paths (clean delivery path + AEM content path), normalised
  // and de-duped. A descendant matches if it lives under ANY candidate.
  const parents = [...new Set(config.parents.map(normalisePath).filter(Boolean))];

  // Optional heading.
  if (config.heading) {
    const h = document.createElement('h2');
    h.textContent = config.heading;
    block.append(h);
  }

  // Toolbar: FILTERS toggle + sort + live count.
  const toolbar = document.createElement('div');
  toolbar.classList.add('blog-list-toolbar');

  const filtersToggle = document.createElement('button');
  filtersToggle.type = 'button';
  filtersToggle.classList.add('blog-list-toggle');
  filtersToggle.setAttribute('aria-expanded', 'false');
  filtersToggle.textContent = 'Filters';

  const sortWrap = document.createElement('label');
  sortWrap.classList.add('blog-list-sort');
  sortWrap.textContent = 'Sort:';
  const sortSelect = document.createElement('select');
  Object.entries(SORTS).forEach(([value, { label }]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    sortSelect.append(opt);
  });
  sortSelect.value = SORTS[config.defaultSort] ? config.defaultSort : 'newest';
  sortWrap.append(sortSelect);

  const count = document.createElement('p');
  count.classList.add('blog-list-count');
  toolbar.append(filtersToggle, sortWrap, count);

  const results = document.createElement('ul');
  results.classList.add('blog-list-results');

  const loadMore = document.createElement('button');
  loadMore.type = 'button';
  loadMore.classList.add('blog-list-load-more', 'button');
  loadMore.textContent = 'Load more';
  loadMore.hidden = true;

  block.append(toolbar, results, loadMore);

  if (!parents.length) {
    const msg = document.createElement('p');
    msg.classList.add('blog-list-empty');
    msg.textContent = 'No parent page configured.';
    block.append(msg);
    return;
  }

  // A row is a descendant if its (normalised) path sits under any candidate
  // parent. Normalising the row path too strips the /content/<site> prefix the
  // author index adds, so it compares equal to the clean parent path.
  const isDescendant = (rawPath) => {
    const path = normalisePath(rawPath);
    return parents.some((p) => path.startsWith(`${p}/`) && path !== p);
  };

  let allRows;
  try {
    const index = await fetchIndex();
    allRows = index.filter((row) => row.path && isDescendant(row.path));
  } catch {
    allRows = [];
  }

  if (allRows.length === 0) {
    const msg = document.createElement('p');
    msg.classList.add('blog-list-empty');
    msg.textContent = 'No pages found.';
    block.append(msg);
    return;
  }

  // Normalise lastModified to a number and ensure a title for sorting.
  allRows.forEach((row) => {
    row.lastModified = parseInt(row.lastModified, 10) || 0;
    row.title = row.title || row.path;
  });

  let visibleLimit = config.pageSize;
  let filterPanel;

  const render = () => {
    const selection = filterPanel.getSelection();
    const filtered = allRows
      .filter((row) => matches(row, selection))
      .sort(SORTS[sortSelect.value].compare);

    results.textContent = '';
    filtered.slice(0, visibleLimit).forEach((row) => results.append(buildCard(row)));

    const shown = Math.min(filtered.length, visibleLimit);
    count.textContent = `Showing ${shown} of ${filtered.length}`;
    loadMore.hidden = visibleLimit >= filtered.length;
  };

  filterPanel = buildFilterPanel(allRows, () => {
    visibleLimit = config.pageSize;
    render();
  });

  filtersToggle.addEventListener('click', () => {
    const open = filterPanel.panel.hidden;
    filterPanel.panel.hidden = !open;
    filtersToggle.setAttribute('aria-expanded', String(open));
  });

  sortSelect.addEventListener('change', () => {
    visibleLimit = config.pageSize;
    render();
  });

  loadMore.addEventListener('click', () => {
    visibleLimit += config.pageSize;
    render();
  });

  // Insert the filter panel just after the toolbar.
  toolbar.after(filterPanel.panel);

  render();
}
