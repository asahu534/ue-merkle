/**
 * Columns Control — a columns container with an author-selectable ratio
 * (50/50, 75/25, 25/75, 40/30/30, 50/25/25, 25/25/50, 25/25/25/25) that can hold
 * other blocks or default content in each column. The chosen ratio arrives as a
 * `layout-*` class on the block (from the model's Layout select); the CSS drives
 * the actual column widths.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const cols = [...row.children];
  block.classList.add(`columns-control-${cols.length}-cols`);

  // Flag columns whose only content is an image so CSS can treat them as media.
  [...block.children].forEach((r) => {
    [...r.children].forEach((col) => {
      col.classList.add('columns-control-col');
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          col.classList.add('columns-control-img-col');
        }
      }
    });
  });
}
