import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function scrollByCard(block, direction) {
  const track = block.querySelector('.carousel-cases-slides');
  const firstCard = track.querySelector('.carousel-cases-slide');
  if (!firstCard) return;
  const gap = parseInt(getComputedStyle(track).columnGap, 10) || 0;
  const step = firstCard.getBoundingClientRect().width + gap;
  track.scrollBy({ left: step * direction, behavior: 'smooth' });
}

/** Disable prev/next at the start/end of the track (as on the source site). */
function updateNavState(block) {
  const track = block.querySelector('.carousel-cases-slides');
  const prev = block.querySelector('.slide-prev');
  const next = block.querySelector('.slide-next');
  if (!track || !prev || !next) return;
  prev.disabled = track.scrollLeft <= 1;
  next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
}

function createCard(row, index) {
  const card = document.createElement('li');
  card.classList.add('carousel-cases-slide');
  card.dataset.slideIndex = index;

  row.querySelectorAll(':scope > div').forEach((column) => {
    if (column.children.length === 1 && column.querySelector('picture')) {
      column.className = 'carousel-cases-slide-image';
    } else {
      column.className = 'carousel-cases-slide-content';
    }
    card.append(column);
  });

  return card;
}

/**
 * The optional Intro field renders as the first row: a single cell with no
 * picture. Card rows always have an image cell plus a text cell.
 * @param {Element} row first block row
 * @returns {boolean}
 */
function isIntroRow(row) {
  const cells = row ? [...row.children] : [];
  return cells.length === 1 && !cells[0].querySelector('picture');
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  let intro = null;
  if (isIntroRow(rows[0])) {
    const introRow = rows.shift();
    if (introRow.textContent.trim()) {
      intro = document.createElement('div');
      intro.className = 'carousel-cases-intro';
      moveInstrumentation(introRow, intro);
      intro.append(...introRow.firstElementChild.childNodes);
    }
    introRow.remove();
  }

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-cases-slides-container');

  const track = document.createElement('ul');
  track.classList.add('carousel-cases-slides');

  rows.forEach((row, idx) => {
    const card = createCard(row, idx);
    moveInstrumentation(row, card);
    track.append(card);
    row.remove();
  });

  track.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  container.append(track);
  block.textContent = '';

  if (intro) {
    block.classList.add('has-intro');
    block.append(intro);
    const heading = intro.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      heading.id = heading.id || `carousel-cases-heading-${Math.random().toString(36).slice(2, 8)}`;
      block.setAttribute('aria-labelledby', heading.id);
    }
  }
  block.append(container);

  if (rows.length > 1) {
    const nav = document.createElement('div');
    nav.classList.add('carousel-cases-navigation-buttons');
    nav.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous"></button>
      <button type="button" class="slide-next" aria-label="Next"></button>
    `;
    // With an intro (and default arrow position) the arrows sit under it.
    const inIntro = intro && !block.classList.contains('arrowsright')
      && !block.classList.contains('arrowssides');
    (inIntro ? intro : block).append(nav);
    nav.querySelector('.slide-prev').addEventListener('click', () => scrollByCard(block, -1));
    nav.querySelector('.slide-next').addEventListener('click', () => scrollByCard(block, 1));
    track.addEventListener('scroll', () => updateNavState(block), { passive: true });
    // Sections are hidden while loading (zero width), so re-check once the
    // track gets its real size, and on any later resize.
    new ResizeObserver(() => updateNavState(block)).observe(track);
  }
}
