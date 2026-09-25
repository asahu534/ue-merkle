/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the "Our growing family" acquisitions accordion.
 * Source: https://www.merkle.com/en/about-us/history.html (.accordion.panelcontainer)
 * Block: blocks/accordion/ (container block)
 *
 * Accordion table convention: 2 columns, multiple rows. Row 1 is the block name.
 * Each subsequent row is one accordion item as 2 cells:
 *   1. title cell   (<!-- field:title -->)   — the clickable heading (.cmp-accordion__title)
 *   2. content cell (<!-- field:content -->) — the panel body (.cmp-accordion__panel)
 */

function fieldCell(document, fieldName, nodes) {
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${fieldName} `));
  (Array.isArray(nodes) ? nodes : [nodes]).forEach((n) => {
    if (n) frag.appendChild(n);
  });
  return frag;
}

export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-accordion__item'));
  const cells = [];

  items.forEach((item) => {
    const titleEl = item.querySelector('.cmp-accordion__title');
    const panel = item.querySelector('.cmp-accordion__panel');

    const title = titleEl ? titleEl.textContent.trim() : '';

    // Panel body: prefer the inner text component; fall back to the panel itself.
    const bodySrc = (panel && panel.querySelector('.cmp-text')) || panel;
    const contentNodes = [];
    if (bodySrc) {
      [...bodySrc.childNodes].forEach((n) => contentNodes.push(n.cloneNode(true)));
    }

    if (!title && contentNodes.length === 0) return;

    const titleP = document.createElement('p');
    titleP.textContent = title;

    cells.push([
      fieldCell(document, 'title', titleP),
      contentNodes.length ? fieldCell(document, 'content', contentNodes) : fieldCell(document, 'content', null),
    ]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
