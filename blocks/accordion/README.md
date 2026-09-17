# Accordion

A stack of collapsible panels. Each item has a **Title** (the header bar you
click) and rich-text **Content** revealed when the item is expanded. Multiple
panels can be open at once.

## Authoring model (`container-items`)

- Insert **Accordion**, then add **Accordion Item** children.
- **Accordion Item**:
  - **Title** — the collapsible header (e.g. a year range like "2021+").
  - **Content** (richtext) — the body shown when the item is expanded.

## Behaviour

- Each header is a button (`aria-expanded` / `aria-controls`) with a chevron
  that rotates when open.
- Clicking a header toggles just that panel; others are unaffected.
- Panels start collapsed.

## Files

- `accordion.js` — builds accessible header/panel pairs, toggle logic.
- `accordion.css` — header bar, chevron, panel styling.
- `_accordion.json` — Universal Editor definition, item model, filter.
