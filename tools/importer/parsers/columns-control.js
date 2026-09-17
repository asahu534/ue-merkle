/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the merkle-now featured gallery -> columns-control blocks.
 * Source: https://www.merkle.com/en/merkle-now.html (.teasergallerylist.mer-featured-tgl)
 * Block: blocks/columns-control/ (base: Franklin columns)
 *
 * The source renders 6 featured tiles in a masonry where the first tile of row 1
 * is wider and the last tile of row 2 is wider. We reproduce that with two
 * Columns Control blocks:
 *   - row 1 -> "Columns Control (layout-40-30-30)"  (wide first column)
 *   - row 2 -> "Columns Control (layout-25-25-50)"  (wide last column)
 * Each column holds the tile's image + label + title + link as default content,
 * so every field stays editable in Universal Editor.
 *
 * Scene7/DM note: card images are Scene7 <img> tags; the DM transformer rewrites
 * them to DAM paths BEFORE parsers run, so we place the natural <img> here.
 */

// Build one column's content (image, label, title, link) for a source card.
function columnContent(card, document) {
  const img = card.querySelector('.cmp-teaser__image img, img.cmp-image__image, picture img, img');
  const pretitle = card.querySelector('.cmp-teaser__pretitle');
  const title = card.querySelector('.cmp-teaser__title, h1, h2, h3, h4');

  // CTA: prefer an existing anchor; else rebuild from the clickable wrapper href.
  let cta = card.querySelector('.mer-teaser__action-container a, a.cmp-teaser__action-link');
  if (!cta) {
    const wrapper = card.querySelector('a.mer-clickabkle-wrapper, a[href]');
    const linkText = card.querySelector('.mer-link-text, .mer-teaser__action-container span, .mer-teaser__action-container');
    if (wrapper && wrapper.getAttribute('href')) {
      cta = document.createElement('a');
      cta.setAttribute('href', wrapper.getAttribute('href'));
      cta.textContent = (linkText ? linkText.textContent : wrapper.textContent).trim() || 'Read more';
    }
  }

  const frag = document.createDocumentFragment();
  const imageContent = img ? (img.closest('picture') || img) : null;
  if (imageContent) frag.appendChild(imageContent);
  if (pretitle) {
    const p = document.createElement('p');
    p.textContent = pretitle.textContent.trim();
    frag.appendChild(p);
  }
  if (title) {
    const h = document.createElement('h3');
    h.textContent = title.textContent.trim();
    frag.appendChild(h);
  }
  if (cta) frag.appendChild(cta);
  return frag;
}

export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('li.cmp-list__item, .featuredcard'))
    // De-dupe: if both the <li> and inner .featuredcard match, keep the outer <li>.
    .filter((el, i, arr) => !arr.some((other) => other !== el && other.contains(el)));

  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Split tiles into rows of three; each row becomes one Columns Control block.
  // First row is wide-first (40/30/30), alternating rows are wide-last (25/25/50).
  const perRow = 3;
  const blocks = [];
  for (let i = 0; i < cards.length; i += perRow) {
    const rowCards = cards.slice(i, i + perRow);
    const columns = rowCards.map((card) => columnContent(card, document));
    const rowIndex = i / perRow;
    const layout = rowIndex % 2 === 0 ? 'layout-40-30-30' : 'layout-25-25-50';
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'columns-control',
      variants: [layout],
      cells: [columns],
    });
    blocks.push(block);
  }

  element.replaceWith(...blocks);
}
