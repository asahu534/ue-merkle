/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the site search experience.
 * Source: https://www.merkle.com/en/search.html (.sitesearch)
 * Block: blocks/search/ (this project's custom standalone model block)
 *
 * NOTE: this project ships its OWN `search` block (blocks/search/), which is
 * config-driven — results, type-ahead suggestions, and keyword facets are all
 * produced client-side from /query-index.json. It is NOT the generic
 * block-collection search block (whose table is a single query-index URL). So
 * the emitted row/cell structure MUST match blocks/search/search.js, which reads
 * its model fields row-by-row:
 *   1. Heading           (empty — the source shows no visible page heading)
 *   2. Placeholder       (the input's placeholder text)
 *   3. Trending Topics   (comma-separated chip labels)
 *   4. Results Per Page  (source shows 6)
 */

const DEFAULT_PLACEHOLDER = 'What can we help you search for?';
const DEFAULT_PAGE_SIZE = '6';

export default function parse(element, { document }) {
  // Placeholder text from the source input, if present.
  const input = element.querySelector('input[type="search"], .cmp-sitesearch__input');
  const placeholder = (input && input.getAttribute('placeholder')) || DEFAULT_PLACEHOLDER;

  // Trending topic chip labels from the source list. On merkle.com these are
  // rendered as `.cmp-sitesearch__suggestion-item` list items; fall back to any
  // list item text if the class ever changes.
  const topicEls = element.querySelectorAll('.cmp-sitesearch__suggestion-item, .cmp-sitesearch__trending-item');
  const topics = [...(topicEls.length ? topicEls : element.querySelectorAll('li'))]
    .map((el) => el.textContent.trim())
    .filter(Boolean);
  // De-dupe while preserving order.
  const trending = [...new Set(topics)].join(', ');

  const cell = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  };

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Search',
    cells: [
      [cell('')], // Heading
      [cell(placeholder)], // Placeholder
      [cell(trending)], // Trending Topics
      [cell(DEFAULT_PAGE_SIZE)], // Results Per Page
    ],
  });

  // Mark the generated block so the import script can keep ONLY it and drop the
  // source page's server-rendered filter/results scaffolding (which lives
  // outside .sitesearch). createBlock returns a <table>, so a `.search` class
  // selector would not match at transform time — the marker attribute does.
  block.setAttribute('data-search-block', '1');

  element.replaceWith(block);
}
