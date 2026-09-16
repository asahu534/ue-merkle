import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * CTA Buttons block — a row of call-to-action buttons.
 * Each child row is one button (an `<a>`). The button style is determined by,
 * in priority order:
 *   1. an explicit style token in a second cell (primary | secondary), or
 *   2. a `button--primary` / `button--secondary` class already on the link, or
 *   3. a sensible default: the first button is primary, the rest secondary
 *      (matching the source design).
 * Button appearance is inherited from the global button styles in styles.css.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const list = document.createElement('div');
  list.className = 'cta-buttons-list';

  const rows = [...block.children];
  rows.forEach((row, index) => {
    const link = row.querySelector('a');
    if (!link) {
      row.remove();
      return;
    }

    const cells = [...row.children];
    const styleCell = cells[1] ? cells[1].textContent.trim().toLowerCase() : '';
    let variant;
    if (styleCell === 'primary' || styleCell === 'secondary') {
      variant = styleCell;
    } else if (link.classList.contains('secondary')) {
      variant = 'secondary';
    } else if (link.classList.contains('primary')) {
      variant = 'primary';
    } else {
      variant = index === 0 ? 'primary' : 'secondary';
    }

    link.className = '';
    link.classList.add('button', variant);
    const wrapper = document.createElement('p');
    wrapper.className = 'button-wrapper';
    moveInstrumentation(row, wrapper);
    wrapper.append(link);
    list.append(wrapper);
    row.remove();
  });

  block.textContent = '';
  block.append(list);
}
