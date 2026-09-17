import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// How many result cards to reveal per page / "Load more" click.
const PAGE_SIZE = 12;

// Recognised facet group names (used to parse the per-item tags field).
// Order here is the order the groups appear in the filter panel.
const FACET_GROUPS = ['Content Type', 'Industries', 'Capabilities', 'Partners', 'Country'];

/**
 * Parse a free-text tags string into a map of facet group -> values.
 * Expected authoring format (one item):
 *   "Content Type: Blog Post; Industries: Retail, Healthcare; Partners: Adobe"
 * Groups are separated by ";", values within a group by ",".
 * @param {string} raw The raw tags text
 * @returns {Object<string,string[]>} group name -> array of values
 */
function parseTags(raw) {
  const map = {};
  if (!raw) return map;
  raw.split(';').forEach((chunk) => {
    const idx = chunk.indexOf(':');
    if (idx === -1) return;
    const group = chunk.slice(0, idx).trim();
    const match = FACET_GROUPS.find((g) => g.toLowerCase() === group.toLowerCase());
    if (!match) return;
    const values = chunk.slice(idx + 1)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    if (values.length) map[match] = (map[match] || []).concat(values);
  });
  return map;
}

/**
 * Determine whether a given cell holds the facet tags (vs. the visible text).
 * @param {Element} cell A candidate content cell
 * @returns {boolean} true if the cell text looks like a facet tag list
 */
function looksLikeTags(cell) {
  const text = cell.textContent.trim();
  if (!text.includes(':')) return false;
  return FACET_GROUPS.some((g) => new RegExp(`${g}\\s*:`, 'i').test(text));
}

/**
 * Build one result card from an authored block row.
 * @param {Element} row The source row (block child)
 * @returns {{el: Element, tags: Object<string,string[]>}} card element + parsed tags
 */
function buildCard(row) {
  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture, img'));
  const contentCells = cells.filter((c) => c !== imageCell && c.textContent.trim());
  const tagsCell = contentCells.find(looksLikeTags);
  const textCell = contentCells.find((c) => c !== tagsCell);

  const card = document.createElement('li');
  card.classList.add('content-filter-card');
  moveInstrumentation(row, card);

  if (imageCell) {
    imageCell.classList.add('content-filter-card-image');
    card.append(imageCell);
  }

  const body = document.createElement('div');
  body.classList.add('content-filter-card-body');
  if (textCell) {
    while (textCell.firstChild) body.append(textCell.firstChild);
  }
  card.append(body);

  // The first paragraph is the content-type label (eyebrow); mark it for styling
  // and to seed the Content Type facet.
  const firstP = body.querySelector('p');
  if (firstP && !firstP.querySelector('a')) firstP.classList.add('content-filter-card-label');

  // Make the whole tile clickable: use the CTA's href for a full-cover overlay
  // link, matching the source (which lays a title-link over the whole tile). The
  // visible "Read more" link is kept for affordance but the overlay drives clicks.
  const cta = body.querySelector('a[href]');
  const heading = body.querySelector('h1, h2, h3, h4');
  if (cta) {
    const overlay = document.createElement('a');
    overlay.className = 'content-filter-card-link';
    overlay.href = cta.getAttribute('href');
    overlay.setAttribute('aria-label', heading ? heading.textContent.trim() : 'Read more');
    card.append(overlay);
  }

  const tags = parseTags(tagsCell ? tagsCell.textContent : '');
  // The visible content-type label doubles as a "Content Type" facet value.
  const label = body.querySelector('.content-filter-card-label, [class*="eyebrow"]');
  if (label && !tags['Content Type']) {
    tags['Content Type'] = [label.textContent.trim()];
  }
  card.dataset.tags = JSON.stringify(tags);

  return { el: card, tags };
}

/**
 * Build the facet panel from the union of tags across all cards.
 * @param {Array<Object<string,string[]>>} allTags parsed tags per card
 * @param {Function} onChange callback invoked whenever the selection changes
 * @returns {{panel: Element, getSelection: Function, clear: Function}} panel API
 */
function buildFilterPanel(allTags, onChange) {
  // Collect the sorted set of values used by items, per group.
  const groups = new Map();
  FACET_GROUPS.forEach((group) => {
    const values = new Set();
    allTags.forEach((tags) => (tags[group] || []).forEach((v) => values.add(v)));
    if (values.size) groups.set(group, [...values].sort((a, b) => a.localeCompare(b)));
  });

  const panel = document.createElement('div');
  panel.classList.add('content-filter-panel');
  panel.hidden = true;

  const groupsWrap = document.createElement('div');
  groupsWrap.classList.add('content-filter-groups');

  groups.forEach((values, group) => {
    const fieldset = document.createElement('fieldset');
    fieldset.classList.add('content-filter-group');
    const legend = document.createElement('legend');
    legend.classList.add('content-filter-group-title');
    legend.textContent = group;
    fieldset.append(legend);

    const list = document.createElement('div');
    list.classList.add('content-filter-options');
    values.forEach((value) => {
      const id = `cf-${group}-${value}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      const wrap = document.createElement('label');
      wrap.classList.add('content-filter-option');
      wrap.setAttribute('for', id);
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = id;
      input.dataset.group = group;
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
  actions.classList.add('content-filter-actions');
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.classList.add('content-filter-clear');
  clearBtn.textContent = 'Show All';
  const applyBtn = document.createElement('button');
  applyBtn.type = 'button';
  applyBtn.classList.add('content-filter-apply', 'button', 'primary');
  applyBtn.textContent = 'Apply Filter';
  actions.append(clearBtn, applyBtn);

  panel.append(groupsWrap, actions);

  const getSelection = () => {
    const sel = {};
    panel.querySelectorAll('input:checked').forEach((input) => {
      const { group } = input.dataset;
      sel[group] = (sel[group] || []).concat(input.value);
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
 * Does a card's tags satisfy the current selection?
 * AND across groups, OR within a group.
 * @param {Object<string,string[]>} tags card tags
 * @param {Object<string,string[]>} selection selected values per group
 * @returns {boolean} true if the card matches
 */
function matches(tags, selection) {
  return Object.entries(selection).every(([group, values]) => {
    const cardValues = tags[group] || [];
    return values.some((v) => cardValues.includes(v));
  });
}

/**
 * loads and decorates the content-filter block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const cards = rows.map(buildCard);
  const allTags = cards.map((c) => c.tags);

  block.textContent = '';

  // Toolbar: FILTERS toggle + live result count
  const toolbar = document.createElement('div');
  toolbar.classList.add('content-filter-toolbar');
  const filtersToggle = document.createElement('button');
  filtersToggle.type = 'button';
  filtersToggle.classList.add('content-filter-toggle');
  filtersToggle.setAttribute('aria-expanded', 'false');
  filtersToggle.textContent = 'Filters';
  const count = document.createElement('p');
  count.classList.add('content-filter-count');
  toolbar.append(filtersToggle, count);

  // Results grid
  const results = document.createElement('ul');
  results.classList.add('content-filter-results');
  cards.forEach((c) => results.append(c.el));

  // Load more
  const loadMore = document.createElement('button');
  loadMore.type = 'button';
  loadMore.classList.add('content-filter-load-more', 'button');
  loadMore.textContent = 'Load more';

  let visibleLimit = PAGE_SIZE;
  let filterPanel;

  const render = () => {
    const selection = filterPanel.getSelection();
    const visible = cards.filter((c) => matches(c.tags, selection));
    visible.forEach((c, i) => { c.el.hidden = i >= visibleLimit; });
    cards.filter((c) => !visible.includes(c)).forEach((c) => { c.el.hidden = true; });
    const shown = Math.min(visible.length, visibleLimit);
    count.textContent = `Showing ${shown} of ${visible.length}`;
    loadMore.hidden = visibleLimit >= visible.length;
  };

  filterPanel = buildFilterPanel(allTags, () => {
    visibleLimit = PAGE_SIZE;
    render();
  });

  filtersToggle.addEventListener('click', () => {
    const open = filterPanel.panel.hidden;
    filterPanel.panel.hidden = !open;
    filtersToggle.setAttribute('aria-expanded', String(open));
  });

  loadMore.addEventListener('click', () => {
    visibleLimit += PAGE_SIZE;
    render();
  });

  block.append(toolbar, filterPanel.panel, results, loadMore);

  // Optimise any authored images.
  results.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  render();
}
