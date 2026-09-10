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

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

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
  block.append(container);

  if (rows.length > 1) {
    const nav = document.createElement('div');
    nav.classList.add('carousel-cases-navigation-buttons');
    nav.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous"></button>
      <button type="button" class="slide-next" aria-label="Next"></button>
    `;
    block.append(nav);
    nav.querySelector('.slide-prev').addEventListener('click', () => scrollByCard(block, -1));
    nav.querySelector('.slide-next').addEventListener('click', () => scrollByCard(block, 1));
  }
}
