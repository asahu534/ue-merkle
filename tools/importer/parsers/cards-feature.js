/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base: cards (container block).
 * Source: https://www.merkle.com/
 * Model: blocks/cards-feature/_cards-feature.json (item fields: image, text)
 *
 * Container block: first row is the block name; every subsequent row is one card
 * with two columns:
 *   1. image (<!-- field:image -->)
 *   2. text  (<!-- field:text -->) — pretitle + heading + CTA link
 *
 * Each card is wrapped in an <a class="mer-clickabkle-wrapper" href>; the visible
 * CTA is a <span class="mer-link-text">. We rebuild that as a real anchor using
 * the wrapper href so the link survives.
 *
 * Scene7/DM note: card images are Scene7 <img> tags; the DM transformer rewrites
 * them to carrier anchors AFTER parsers run, so we place the natural <img> here.
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
  const cards = Array.from(element.querySelectorAll('li.cmp-list__item, .featuredcard'))
    // De-dupe: if both the <li> and inner .featuredcard match, keep the <li>.
    .filter((el, i, arr) => !arr.some((other) => other !== el && other.contains(el)));

  const cells = [];

  cards.forEach((card) => {
    const img = card.querySelector('.cmp-teaser__image img, img.cmp-image__image, picture img, img');

    const pretitle = card.querySelector('.cmp-teaser__pretitle');
    const title = card.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
    const description = card.querySelector('.cmp-teaser__description');

    // CTA: prefer an existing anchor; otherwise rebuild from the clickable
    // wrapper href + the visible "Learn more" span text.
    let cta = card.querySelector('.mer-teaser__action-container a, a.cmp-teaser__action-link');
    if (!cta) {
      const wrapper = card.querySelector('a.mer-clickabkle-wrapper, a[href]');
      const linkText = card.querySelector('.mer-link-text, .mer-teaser__action-container span, .mer-teaser__action-container');
      if (wrapper && wrapper.getAttribute('href')) {
        cta = document.createElement('a');
        cta.setAttribute('href', wrapper.getAttribute('href'));
        cta.textContent = (linkText ? linkText.textContent : wrapper.textContent).trim();
      }
    }

    if (!img && !title && !pretitle && !description && !cta) return;

    const textNodes = [];
    if (pretitle) textNodes.push(pretitle);
    if (title) textNodes.push(title);
    if (description) textNodes.push(description);
    if (cta) textNodes.push(cta);

    const imageContent = img ? (img.closest('picture') || img) : null;

    cells.push([
      imageContent ? fieldCell(document, 'image', imageContent) : '',
      textNodes.length ? fieldCell(document, 'text', textNodes) : '',
    ]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
