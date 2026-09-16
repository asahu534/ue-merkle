# Merkle Header — Language Selector, Search Icon & Spacing Refinements

## Context
The prior `language-selector` block work has been discarded. The header is back to its fragment-based state: `blocks/header/header.js` builds the language dropdown (`.nav-lang`), search (`.nav-search`), and Contact Us CTA (`.nav-cta`) from `content/nav.plain.html`. This plan covers three targeted header refinements only — no new block, no re-migration.

## Current State (verified in code)
- `header.js` labels tools list items: nested-list item → `.nav-lang`; contact link → `.nav-cta`; search link → `.nav-search` (currently sets `aria-label="Search"` but leaves the visible **"Search" text**).
- `header.css` desktop language dropdown already renders a chevron via `.nav-lang > a::after` (a CSS border triangle) — but the request is to match merkle.com's caret specifically.
- Desktop tools sit in a flex row; the gap between the last nav link ("Careers") and the tools group comes only from the nav's `gap: 0 32px` — no dedicated separation.
- `.nav-search > a` is styled as uppercase bold text, not an icon.

## Requested Changes
1. **Dropdown icon on the language selector** — render a caret/chevron matching the merkle.com source next to the current language (e.g. `EN ⌄`), flipping when open. Refine the existing `::after` (or swap to an inline SVG glyph) so it visually matches the source.
2. **Gap between "Careers" and the language selector** — add explicit spacing so the tools group is clearly separated from the primary nav's last item (e.g. left margin on `.nav-tools`, or increased gap), on desktop.
3. **Search as a clickable icon** — replace the visible "Search" word with a magnifying-glass icon (inline SVG injected in `header.js`), keeping the link clickable and `aria-label="Search"` for accessibility. Style/size it in `header.css`; add a hover color.

## Scope / Constraints
- Header remains **fragment-based** (no `language-selector` UE block reintroduced).
- Changes limited to `blocks/header/header.js` and `blocks/header/header.css`.
- The search magnifying glass and the language caret are **fixed UI glyphs kept in code**, not authorable content.
- Preserve existing mobile (hamburger drawer) behavior; refinements target the desktop tools row primarily, verified not to break mobile.

## Checklist

### 1. Language selector dropdown icon
- [ ] Inspect merkle.com's caret styling (shape/size/position) for the language toggle
- [ ] Update `.nav-lang > a::after` in `header.css` (or inject an inline caret SVG in `header.js`) to match the source caret
- [ ] Confirm the caret flips/rotates when `aria-expanded="true"`

### 2. Gap between "Careers" and language selector
- [ ] Add explicit separation on desktop (e.g. `margin-left` on `header nav .nav-tools`, or dedicated gap) so tools are clearly offset from the last nav link
- [ ] Verify spacing looks right at 900px+ and does not misalign items on mobile

### 3. Search icon (not the word)
- [ ] Add a magnifying-glass inline SVG constant in `header.js`
- [ ] In the `.nav-search` branch, set `innerHTML` to the SVG and keep `aria-label="Search"`
- [ ] Style `.nav-search > a` + `svg` in `header.css` (size ~22–24px, white, red on hover); remove the uppercase-text rule
- [ ] Ensure hover-color rules keep correct source order (avoid stylelint `no-descending-specificity`)

### 4. Verify
- [ ] `npm run lint` (ESLint on `header.js`, stylelint on `header.css`) passes
- [ ] Preview at desktop width: `EN ⌄` caret, gap after "Careers", magnifying-glass search icon, Contact Us button — all match the merkle.com header
- [ ] Open the language dropdown to confirm caret flip + list still work
- [ ] Confirm mobile hamburger drawer is unaffected

## Notes
- No content re-import or DAM upload is involved; this is header CSS/JS only.
- These are the same three refinements attempted before the discard — reapplied cleanly on the restored fragment-based header.
- Execution requires **Execute mode** — this plan does not modify files yet.
