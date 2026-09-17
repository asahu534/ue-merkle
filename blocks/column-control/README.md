# Column Control

A responsive columns container that lets the author choose the column ratio and
fill each column with default content **or another block**.

## Layout options

Set via the **Layout** field in Universal Editor. Add as many **Column**
children as the ratio has parts:

- **50 / 50** — two equal columns.
- **75 / 25** — wide first column, narrow second. Two columns.
- **25 / 75** — narrow first column, wide second. Two columns.
- **40 / 30 / 30** — a wider first column followed by two equal columns. Three
  columns.
- **50 / 25 / 25** — wide first column, two narrow. Three columns.
- **25 / 25 / 50** — two narrow columns, wide last. Three columns.
- **25 / 25 / 25 / 25** — four equal columns.

On mobile the columns stack; from 900px up they sit side by side in the chosen
ratio.

## Authoring model

- Insert **Column Control**, pick a **Layout**.
- Add **Column** children (two for 50/50, three for 40/30/30).
- Into each column, drop text, images, buttons, titles, or any of the site
  blocks (carousel-hero, cards-feature, cards-icon, video-centered,
  carousel-cases, cta-buttons, blog-list).

The Layout selection is emitted as a `layout-*` class on the block; the CSS uses
it to size the columns. The number of columns you add should match the ratio you
pick.

## Files

- `column-control.js` — flags image-only columns, applies a column-count class.
- `column-control.css` — mobile-stacked → desktop ratio layouts.
- `_column-control.json` — Universal Editor definition, model (Layout select),
  and filter. It reuses the shared `column` child, whose accepted components are
  declared in `blocks/columns/_columns.json`.
