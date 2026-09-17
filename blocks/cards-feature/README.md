# cards-feature

Editorial promo cards ("Our latest and greatest"). Dark rounded tiles with an
eyebrow, heading, image, and link. Each card's width is author-controlled, so a
row can be 50/25/25, 40/30/30, 75/25, equal thirds, etc.

## Authoring model (`container-items`)

Add **Feature Card** children. Each card has:

- **Image** — the card image (rendered at a fixed 16:9 ratio, cover-cropped so it
  never stretches or distorts regardless of the card's width).
- **Text** (richtext) — eyebrow label, heading, and a "Learn more" link.
- **Card Width** — how wide the card is in its row: Full (100%), Three-quarters
  (75%), Two-thirds (66%), Half (50%), Wide (40%), Third (33%, default), Narrow
  (30%), Quarter (25%).

## Layout

Cards flow left-to-right and wrap. Set the widths in a row so they sum to ~100%:

| Row | Card widths |
|---|---|
| 50 / 25 / 25 | Half, Quarter, Quarter |
| 25 / 25 / 50 | Quarter, Quarter, Half |
| 40 / 30 / 30 | Wide, Narrow, Narrow |
| 75 / 25 | Three-quarters, Quarter |
| Equal thirds | Third, Third, Third |

On mobile every card is full width (stacked).

## Files

- `cards-feature.js` — builds the card list, applies each card's width class.
- `cards-feature.css` — flex-wrap layout, per-width `flex-basis`, 16:9 cover images.
- `_cards-feature.json` — Universal Editor definition and item model (incl. Card Width).
