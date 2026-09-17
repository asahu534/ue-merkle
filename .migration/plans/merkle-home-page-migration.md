# Rename `content-filter` → `blog-list` (query-index driven)

## Goal
Rename the existing `content-filter` block to **`blog-list`** and change its data source: instead of author-entered result items, it accepts a **parent page** (page picker) and lists **all descendant pages** of that parent, fetched at render time from `/query-index.json`. This mirrors the earlier `article-list` pattern. **The UI is unchanged** — same Filters panel, clickable tiles, result count, and Load more — plus a new **Sort** control (Newest first / Title A–Z, etc.).

## Confirmed decisions
- **Facets** come from **page metadata** — extra properties indexed in `helix-query.yaml` (e.g. content-type, industry, capability, partner, country) and read from `/query-index.json` rows. Groups with no data are hidden.
- **Scope**: list **all descendants** of the selected parent path (`<parent>/**`, excluding the parent itself).
- **Sort**: a sort control with options **Newest first** (by `lastModified` desc), **Oldest first** (`lastModified` asc), **Title (A–Z)**, **Title (Z–A)**. Default: Newest first.

## Current state (verified)
- `content-filter` is committed (`blocks/content-filter/` — js/css/`_content-filter.json`/metadata/README; parser `tools/importer/parsers/content-filter.js`), registered in `models/_section.json` and the aggregated component JSON.
- No `article-list` block exists in the repo (referenced only as a conceptual precedent).
- `/query-index.json` already configured in `helix-query.yaml` (indices: `pages`, include `/**`; `lastModified` already selected). `aem-content` is the page-picker component (used in cta-buttons, fragment, video-centered).
- The old `content-filter` derived facets from an authored **Facet Tags** text field and built tiles from authored item rows — that item model is being replaced by query-index data.
- The `merkle-now` page/content was deleted by the user; the `column-control` importer wiring referenced it. Not in scope here except to avoid leaving dangling references.

## Plan

### A. Rename the block `content-filter` → `blog-list`
- Move `blocks/content-filter/` → `blocks/blog-list/`; rename `content-filter.js` → `blog-list.js`, `content-filter.css` → `blog-list.css`, `_content-filter.json` → `_blog-list.json`.
- Rename all CSS classes `content-filter-*` → `blog-list-*` (js + css in lockstep).
- Update definition/model/filter ids and titles (`content-filter`→`blog-list`, `Content Filter`→`Blog List`).
- Update `metadata.json` and `README.md`.
- Update `models/_section.json`: replace `content-filter` with `blog-list`; run `npm run build:json`.
- Remove the now-obsolete `tools/importer/parsers/content-filter.js` (and any `content-filter` reference in importer scripts/templates), since results are no longer author-imported.

### B. New model — parent page instead of item children
- `_blog-list.json` becomes a **single block** (no child items):
  - `parent` — `aem-content` page picker (required) — the parent whose descendants are listed.
  - `heading` — text (optional) — panel heading (e.g. "Find something specific").
  - `defaultSort` — select (optional) — the initial sort (Newest first / Oldest first / Title A–Z / Title Z–A); default Newest first.
  - Optional: `pageSize` (number, default 12) for the Load-more increment.
- Drop the `content-filter-item` component/model/filter entirely.

### C. JS — fetch descendants from query-index
- On decorate: read the parent path from the picker value; `fetch('/query-index.json')` (paginated via `limit`/`offset` if needed).
- Filter rows to descendants of the parent path (`row.path.startsWith(parent + '/')`, excluding the parent).
- Map each row → a tile (title, image from row, "Read more" link to `row.path`, eyebrow from a metadata property); reuse the **existing UI markup/classes** (renamed) so look-and-feel is identical.
- Build facet groups from indexed metadata properties on the rows (union of values, hidden if empty).
- **Sort control**: render a `<select>` in the toolbar (Newest first / Oldest first / Title A–Z / Title Z–A), initialised from `defaultSort`; re-sort the filtered rows on change before rendering (uses `lastModified` numeric and `title` string compares).
- Keep the same in-browser filter/Load-more/count behavior; graceful fallback when the fetch fails or JS is off (render nothing or a message — no author items to fall back to).

### D. Index config for facets + sort
- Extend `helix-query.yaml` `pages` index with the metadata properties needed for facets (e.g. `content-type`, `industry`, `capability`, `partner`, `country`, plus `title`, `image`, `description`) so `/query-index.json` exposes them.
- Confirm `lastModified` remains selected (already present) so Newest/Oldest sorting has data.
- Note: facets only populate once child pages carry that metadata and the index is (re)built by the pipeline.

### E. Verify
- `npm run lint` (ESLint + stylelint) clean for `blocks/blog-list/`.
- `npm run build:json`; confirm `blog-list` present in `component-definition/models/filters.json` and `_section.json`.
- Grep the repo for any lingering `content-filter` references.
- Preview: point the block at a parent page and confirm descendants render as tiles, Filters/Load more/count work, sort control reorders correctly, and the UI matches the previous design.

## Checklist

### 1. Rename & scaffold
- [ ] Move `blocks/content-filter/` → `blocks/blog-list/` and rename js/css/json/README/metadata files
- [ ] Rename all `content-filter*` CSS classes and JS references to `blog-list*`
- [ ] Update block definition/model/filter ids + titles to `blog-list` / `Blog List`
- [ ] Update `blocks/blog-list/metadata.json` and `README.md` to describe the parent-page/query-index behavior + sort

### 2. New authoring model
- [ ] Rewrite `_blog-list.json` as a single block with a `parent` (`aem-content` page picker), optional `heading`, `defaultSort` select, optional `pageSize`
- [ ] Remove the `content-filter-item` component/model and the container→item filter
- [ ] Update `models/_section.json`: swap `content-filter` → `blog-list`; run `npm run build:json`

### 3. JS: query-index data source
- [ ] Read parent path from the picker; fetch `/query-index.json` (handle pagination)
- [ ] Filter to all descendants of the parent path (exclude the parent itself)
- [ ] Render each row as a tile reusing the existing (renamed) UI markup/classes
- [ ] Build facet groups from indexed metadata properties (hide empty groups); keep Filters/Show All/Apply/Load more/count behavior
- [ ] Add a **Sort** `<select>` (Newest first / Oldest first / Title A–Z / Title Z–A), init from `defaultSort`, re-sort on change
- [ ] Graceful handling when fetch fails or parent unset

### 4. Index config
- [ ] Extend `helix-query.yaml` `pages` index with facet + display properties (content-type, industry, capability, partner, country, title, image, description)
- [ ] Confirm `lastModified` stays selected for Newest/Oldest sorting

### 5. Cleanup & verify
- [ ] Delete `tools/importer/parsers/content-filter.js`; remove `content-filter` references from importer scripts/`page-templates.json`
- [ ] Grep for and resolve any remaining `content-filter` references across the repo
- [ ] `npm run lint` passes for `blocks/blog-list/`
- [ ] `npm run build:json`; verify `blog-list` in aggregated JSON + `_section.json`
- [ ] Preview: set a parent page, confirm descendants list as tiles with working facets/sort/Load more/count and unchanged UI

## Notes
- **UI is unchanged** apart from the added **Sort** control — the data source (author items → query-index descendants) and model (item children → parent-page picker) change.
- Sorting: Newest/Oldest use `lastModified` from the index; Title A–Z/Z–A use `title`.
- Facets depend on child pages carrying metadata and the query index being rebuilt; until then the Filters panel may show few/no groups.
- Content is no longer author-imported for this block, so the old importer parser is removed.
- **Execution requires Execute mode** — this plan makes no file changes yet.
