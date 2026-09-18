import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Accordion — a list of collapsible panels. Each authored row is one item with
 * a title cell (the clickable header) and a content cell (the revealed body).
 * Built as accessible button + region pairs; multiple panels may be open.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const titleCell = cells[0];
    const contentCell = cells[1];

    const item = document.createElement('div');
    item.classList.add('accordion-item');
    moveInstrumentation(row, item);

    const id = `accordion-panel-${i}`;

    // Header button toggles the panel.
    const header = document.createElement('h3');
    header.classList.add('accordion-item-header');
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('accordion-item-button');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', id);

    const label = document.createElement('span');
    label.classList.add('accordion-item-button-label');
    label.textContent = titleCell ? titleCell.textContent.trim() : '';

    const icon = document.createElement('span');
    icon.classList.add('accordion-item-button-icon');
    icon.setAttribute('aria-hidden', 'true');

    button.append(label, icon);
    header.append(button);

    // Panel body.
    const panel = document.createElement('div');
    panel.classList.add('accordion-item-panel');
    panel.id = id;
    panel.hidden = true;
    if (contentCell) {
      while (contentCell.firstChild) panel.append(contentCell.firstChild);
    }

    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });

    item.append(header, panel);
    block.append(item);
  });
}
