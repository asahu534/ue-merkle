/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon. Base: cards (container block).
 * Source: https://www.merkle.com/
 * Model: blocks/cards-icon/_cards-icon.json (item fields: image, text)
 *
 * Container block: first row is the block name; every subsequent row is one card
 * with two columns:
 *   1. image (<!-- field:image -->) — the icon
 *   2. text  (<!-- field:text -->)  — heading + description
 *
 * IMPORTANT: the instance selector `.container.responsivegrid.text-left` matches
 * each individual icon card (a grid column), and there are several sibling cards.
 * A cards block must gather all of them into ONE table. So on the first sibling
 * we consolidate every sibling card into a single block and detach the rest;
 * later invocations receive detached nodes and bail.
 *
 * Scene7/DM note: icons are Scene7 <img> tags; the DM transformer rewrites them
 * to carrier anchors AFTER parsers run, so we place the natural <img> here.
 */

const CARD_SELECTOR = '.container.responsivegrid.text-left';

function fieldCell(document, fieldName, nodes) {
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${fieldName} `));
  (Array.isArray(nodes) ? nodes : [nodes]).forEach((n) => {
    if (n) frag.appendChild(n);
  });
  return frag;
}

function buildRow(document, card) {
  const img = card.querySelector('.cmp-image img, img.cmp-image__image, img');
  const textEl = card.querySelector('.cmp-text, .text .cmp-text, .text');

  const imageContent = img ? (img.closest('picture') || img) : null;

  // Text cell: heading + description (grab the rich-text container's children).
  const textNodes = [];
  if (textEl) {
    Array.from(textEl.children).forEach((child) => textNodes.push(child));
    if (textNodes.length === 0 && textEl.textContent.trim()) textNodes.push(textEl);
  }

  return [
    imageContent ? fieldCell(document, 'image', imageContent) : '',
    textNodes.length ? fieldCell(document, 'text', textNodes) : '',
  ];
}

export default function parse(element, { document }) {
  // Later invocations get detached nodes (siblings we already consumed) — bail.
  if (!element.parentElement) return;

  // Gather every sibling icon card in DOM order.
  const siblings = Array.from(element.parentElement.children)
    .filter((c) => c.matches && c.matches(CARD_SELECTOR));

  // Only the first sibling builds the consolidated block.
  if (siblings[0] !== element) return;

  const cells = siblings.map((card) => buildRow(document, card)).filter(Boolean);

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', cells });
  element.replaceWith(block);

  // Detach the remaining sibling cards so they don't produce duplicate blocks.
  siblings.slice(1).forEach((card) => card.remove());
}
