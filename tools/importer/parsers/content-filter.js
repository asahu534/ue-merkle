/* eslint-disable */
/* global WebImporter */
/**
 * Parser for content-filter. Base: cards (container block).
 * Source: https://www.merkle.com/en/merkle-now.html and /en/work.html
 * Model: blocks/content-filter/_content-filter.json
 *   item fields: image, imageAlt (collapsed), text, tags
 *
 * Container block: first row is the block name; every subsequent row is one
 * result card with three columns:
 *   1. image (<!-- field:image -->)  — usually empty (listing cards have no image)
 *   2. text  (<!-- field:text -->)   — content-type label + title + "Read more" link
 *   3. tags  (<!-- field:tags -->)   — facet tags, e.g. "Content Type: Blog Post"
 *
 * The source masonry results (`li.masonry-result-item`) are query-index driven and
 * only the first page is statically rendered. Each rendered item exposes a subtitle
 * (content-type label), a title, and a link — but NO image and no per-facet metadata.
 * We therefore seed the Content Type facet from the subtitle; authors can enrich the
 * other facets (Industries/Capabilities/Partners/Country) in Universal Editor.
 */

function fieldCell(document, fieldName, nodes) {
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${fieldName} `));
  (Array.isArray(nodes) ? nodes : [nodes]).forEach((n) => {
    if (n) frag.appendChild(n);
  });
  return frag;
}

// Title-case a raw content-type label ("PLAYBOOK" -> "Playbook").
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function parse(element, { document, url }) {
  const items = Array.from(element.querySelectorAll('li.masonry-result-item'));
  const cells = [];

  // On the /work archive the subtitle is a CLIENT name (not a content type) and
  // every entry is a case study; on other archives (Merkle Now) the subtitle IS
  // the content-type label. Seed the Content Type facet accordingly.
  const isWork = /\/work(\.html|\/|$)/i.test(url || '');

  items.forEach((item) => {
    const subtitle = item.querySelector('.masonry-result-item-subtitle');
    const title = item.querySelector('.masonry-result-item-title, h1, h2, h3, h4');
    // The listing CTA — a bare "Read more" link. Prefer it, else fall back to the
    // title link. Read the href only; the visible text is normalised below so a
    // hydrated link that also contains the title doesn't duplicate the heading.
    const linkEl = item.querySelector('.masonry-result-item-link')
      || item.querySelector('.masonry-result-item-title-link, a[href]');
    const img = item.querySelector('picture img, img');

    if (!title && !subtitle && !linkEl) return;

    const label = subtitle ? toTitleCase(subtitle.textContent.trim()) : '';

    const textNodes = [];
    if (subtitle) {
      const p = document.createElement('p');
      p.textContent = label;
      textNodes.push(p);
    }
    if (title) {
      const h = document.createElement('h3');
      h.textContent = title.textContent.trim();
      textNodes.push(h);
    }
    if (linkEl && linkEl.getAttribute('href')) {
      const a = document.createElement('a');
      a.setAttribute('href', linkEl.getAttribute('href'));
      a.textContent = 'Read more';
      textNodes.push(a);
    }

    // Facet tags: seed the Content Type facet.
    const contentType = isWork ? 'Case Study' : label;
    const tags = document.createElement('p');
    tags.textContent = contentType ? `Content Type: ${contentType}` : '';

    const imageContent = img ? (img.closest('picture') || img) : null;

    cells.push([
      imageContent ? fieldCell(document, 'image', imageContent) : fieldCell(document, 'image', null),
      textNodes.length ? fieldCell(document, 'text', textNodes) : fieldCell(document, 'text', null),
      fieldCell(document, 'tags', tags),
    ]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'content-filter', cells });
  element.replaceWith(block);
}
