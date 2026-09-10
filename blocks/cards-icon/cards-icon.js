import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Rebuild a Scene7 rendition URL that preserves the source's alpha channel.
 * The source gems are transparent PNGs (fmt=png-alpha); the default optimized
 * pipeline re-encodes them as webp/jpg, flattening transparency to white.
 * Keep all authored params, swap width/format for a png-alpha rendition.
 */
function pngAlphaRendition(src, width) {
  const normalized = src.startsWith('//') ? `https:${src}` : src;
  const qIdx = normalized.indexOf('?');
  const base = qIdx >= 0 ? normalized.slice(0, qIdx) : normalized;
  const query = qIdx >= 0 ? normalized.slice(qIdx + 1) : '';
  const pairs = query.split('&').filter((p) => p && !/^(wid|fmt)=/.test(p));
  pairs.push(`wid=${width}`, 'fmt=png-alpha');
  return `${base}?${pairs.join('&')}`;
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-icon-card-image';
      else div.className = 'cards-icon-card-body';
    });
    ul.append(li);
  });
  // Preserve transparency: force png-alpha renditions on the gem images.
  ul.querySelectorAll('picture').forEach((pic) => {
    const img = pic.querySelector('img');
    if (!img || !img.src) return;
    pic.querySelectorAll('source').forEach((source) => source.remove());
    img.src = pngAlphaRendition(img.src, 750);
    img.loading = 'lazy';
  });
  block.textContent = '';
  block.append(ul);
}
