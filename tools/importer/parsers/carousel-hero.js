/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel (container block).
 * Source: https://www.merkle.com/
 * Model: blocks/carousel-hero/_carousel-hero.json (item fields: image, imageAlt(collapsed), text)
 *
 * Container block: the first row is the block name; every subsequent row is one
 * slide. Each slide row has two columns:
 *   1. image  (<!-- field:image -->) — background image
 *   2. text   (<!-- field:text -->)  — pretitle + heading + description + CTAs
 *
 * Scene7/Dynamic Media note: slide images are Scene7 <img> tags. The DM
 * transformer (afterTransform) rewrites them to carrier anchors AFTER parsers
 * run, so here we just place the natural <img> into the image cell.
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
  // Each carousel item is a slide.
  const slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));

  const cells = [];

  slides.forEach((slide) => {
    // Image (mandatory) — Scene7 <img> inside the teaser image group.
    const img = slide.querySelector('.cmp-teaser__image img, img.cmp-image__image, picture img, img');

    // Text content, in reading order.
    const pretitle = slide.querySelector('.cmp-teaser__pretitle');
    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3');
    const description = slide.querySelector('.cmp-teaser__description');
    const ctas = Array.from(slide.querySelectorAll('.cmp-teaser__action-link, a.cta-primary, a.cta-secondary'));

    // Skip rows that have neither image nor text (e.g. stray markup).
    if (!img && !title && !pretitle && !description && ctas.length === 0) return;

    const textNodes = [];
    if (pretitle) textNodes.push(pretitle);
    if (title) textNodes.push(title);
    if (description) textNodes.push(description);
    ctas.forEach((cta) => textNodes.push(cta));

    const imageContent = img ? (img.closest('picture') || img) : null;

    cells.push([
      imageContent ? fieldCell(document, 'image', imageContent) : '',
      textNodes.length ? fieldCell(document, 'text', textNodes) : '',
    ]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
