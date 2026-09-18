# Drive blog-list Facets from `keywords`; Hide Filters When Empty

## Your questions answered
- **Will `meta[name="keywords"]` work?** Yes. `keywords` is a **default query-index column** (already in `/query-index.json`, no `helix-query.yaml` needed) — so the EDS Configuration Service owns the index and the redundant file can go.
- **"Panel stays empty" — how to fix?** Per your choice: **hide the Filters button/panel entirely when there are no keyword values** across the listed pages. The section then shows just the Sort control + the results list — no empty control.

## What changes

Rework blog-list facets to be built from the `keywords` column, with the Filters UI conditional on there being values.

- **Facet source:** each row's `row.keywords` (comma-separated, e.g. `"Blog Post, Retail, Adobe"`), split into individual values.
- **Facet options:** sorted, de-duped union of all keyword values across the descendant rows — one panel of keyword checkboxes (per your earlier choice).
- **Selection matching:** a page matches if its keyword set contains **any** selected value (OR). Same in-browser filter; count + sort unchanged.
- **Empty handling (the fix):** if the union of keyword values is empty, **do not render the Filters toggle or the panel at all** — the toolbar shows only Sort + count, and the full list renders below. (No "no filters" message; the control is simply absent.)

## Current state (verified)
- `blocks/blog-list/blog-list.js`: `FACET_GROUPS` = 5 hardcoded columns; per-column checkbox groups; `matches()` = OR-within / AND-across; card label reads `row.contentType`. The Filters toggle is always rendered regardless of whether any group has data.
- `helix-query.yaml` (uncommitted) adds the 5 custom columns — not needed with the `keywords` approach; remove it.

## Design decisions folded in
- **Single keyword facet panel** (per prior answer: "use the values available in keywords as facets").
- **Hide the whole Filters control when no keywords** (this turn's answer) — build the facet set first; only create/append the Filters toggle + panel if it's non-empty.
- **Card eyebrow label:** use the first `keywords` value (or omit if none), replacing the `row.contentType` reference.
- **Panel heading:** neutral (e.g. "Filter by"), since keywords mix types.

## Checklist

### 1. Rework facet logic to use `keywords`
- [ ] Build the facet value set from `row.keywords` (comma-split, trimmed, de-duped, sorted) across descendant rows
- [ ] Replace the 5-group panel with one keyword checkbox group; update `matches()` to pass a row if its keywords include any selected value (OR); remove multi-column AND logic
- [ ] Update the card eyebrow to use the first `keywords` value (omit if empty), replacing `row.contentType`

### 2. Hide Filters when empty (the fix)
- [ ] Only render the Filters toggle **and** the panel when the keyword value set is non-empty
- [ ] When empty: toolbar shows Sort + count only; results list still renders; no empty panel or toggle
- [ ] Ensure filter/sort/Load-more still wire up correctly in both the with-filters and no-filters paths

### 3. Drop the redundant index config
- [ ] Delete `helix-query.yaml` (config service owns the index; `keywords` is a default column)
- [ ] Grep for `helix-query` / `contentType` / `industry` / `capability` / `partner` / `country` and remove any now-dead references

### 4. Verify
- [ ] Fetch deployed `/query-index.json`; confirm `keywords` present; note sample values on `/merkle-now/*`
- [ ] Rows WITH keywords → Filters button + panel list each distinct keyword; selecting filters (OR); count updates
- [ ] Rows WITHOUT keywords → **no Filters button/panel**; Sort + list still render
- [ ] Sort + Load more unaffected in both paths; `npm run lint` passes

### 5. Hand off (no auto-commit)
- [ ] Report the facet rework, empty-state hide, and `helix-query.yaml` deletion; leave staging/commit/push to the user

## Notes
- **Aligns with your config-service goal:** `keywords` is built-in, so no `helix-query.yaml` and no custom index columns.
- **Empty-state fix:** the Filters control is conditionally rendered — absent entirely when the listed pages carry no keywords, so authors never see a dead, empty panel.
- **Trade-off:** a single flat keyword facet (no separate Content Type / Industry / Partner groups) — the direct consequence of sourcing facets from one comma-separated column.
- Facets still depend on `/merkle-now/*` pages carrying `<meta name="keywords">` and being published; until then, Filters is hidden (by design) and the list shows all descendants.
- Per your standing preference, I will **not commit or push** — changes left in the working tree.
- **Execution requires Execute mode** — this plan makes no file changes yet.
