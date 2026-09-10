/* eslint-disable */
/* global WebImporter */
/**
 * Parser for video-centered. Base: video (simple block).
 * Source: https://www.merkle.com/
 * Model: blocks/video-centered/_video-centered.json
 *   fields: uri (aem-content video), classes (skipped), placeholder_image (reference),
 *           placeholder_imageAlt (collapsed into image alt)
 *
 * Library structure: 1 column, 3 rows —
 *   Row 1: block name
 *   Row 2: video source (<!-- field:uri -->) — link to the video file
 *   Row 3: optional poster/placeholder image (<!-- field:placeholder_image -->)
 *
 * Note: `classes` and collapsed `*Alt` fields get no hints (hinting rules 3 & 5a).
 *
 * Scene7/DM note: the poster image here is a local downloaded asset (./images/...),
 * not a Scene7 URL, so it stays a plain <img>. If it were a DM URL, the DM
 * transformer would rewrite it after parsers run — no parser change needed.
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
  // Video source URL — from <video><source> or a <video src>.
  const source = element.querySelector('video source[src], source.cmp-video-source, video[src]');
  const videoUrl = source
    ? (source.getAttribute('src') || source.getAttribute('data-src'))
    : null;

  // Poster / placeholder image (the controls overlay <img>).
  const poster = element.querySelector('.cmp-video__player__controls img, img');

  const cells = [];

  // Row 2: video URI as a link.
  if (videoUrl) {
    const link = document.createElement('a');
    link.setAttribute('href', videoUrl);
    link.textContent = videoUrl;
    cells.push([fieldCell(document, 'uri', link)]);
  } else {
    cells.push(['']);
  }

  // Row 3: poster image (optional).
  if (poster) {
    cells.push([fieldCell(document, 'placeholder_image', poster)]);
  }

  // Empty-block guard.
  if (!videoUrl && !poster) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'video-centered', cells });
  element.replaceWith(block);
}
