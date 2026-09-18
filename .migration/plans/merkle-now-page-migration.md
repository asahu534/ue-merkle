# Extend Core Columns with Layout Ratios + Auto-Insert Columns; Remove Columns Control

## Goal
Fold the ratio-layout capability into the **core `columns` block** and delete the separate `columns-control` block. The core Columns block gains a **Layout** dropdown that, when an author picks a ratio, (a) **auto-inserts the matching number of child columns** and (b) **applies per-column widths via CSS**. Equal splits stay native (just add N columns → equal by default), so the ratio list contains only the *unequal* layouts.

## Ratios to support (author-facing Layout dropdown)
- **Default / Equal** (no ratio class — equal widths, native to column count)
- `75 / 25` (2 cols)
- `25 / 75` (2 cols)
- `40 / 30 / 30` (3 cols)
- `50 / 25 / 25` (3 cols)
- `25 / 25 / 50` (3 cols)
- `25 / 50 / 25` (3 cols)

Removed per request: `50/50` and `25/25/25/25` (covered by the equal default at 2 or 4 columns).

## Key technical reality (auto-insert)
- **Per-column CSS widths** from a `layout-*` class: fully native, standard block CSS/JS.
- **Auto-inserting child column nodes when the Layout is selected**: NOT native to the xwalk model — a `select` field only writes a `classes` attribute; it cannot add/remove column nodes. The column count is a structural property of the franklin `columns` component (its numeric **Columns** field is the native lever). To make the Layout dropdown *drive* the count, a **Universal Editor extension** is required: it listens for the Layout field change and sets the `columns` count to the ratio's part-count (2 or 3), so the franklin component inserts the child columns; CSS then applies the widths. This is the custom piece and carries a feasibility/maintenance caveat.

## Current state (verified)
- `blocks/columns/_columns.json`: core Columns, model `columns` has `columns` + `rows` number fields, no `classes`/Layout. Resource type `core/franklin/components/columns/v1/columns`. Its `column` child filter was extended earlier to accept site blocks.
- `blocks/columns-control/`: separate block (title "Columns Control (ratio layouts)", model with `classes` Layout select of 7 options, + `columns-control.css/js`). Registered in `models/_section.json`; referenced by `tools/importer/parsers/columns-control.js`, `import-merkle-now.js`, `page-templates.json`.
- md2jcr captures a `classes` field on a columns block when the model has one, and detects the columns container because the block name is "Columns" (starts with "columns").
- merkle-now JCR currently uses `columns-control` nodes at `layout-40-30-30` + `layout-25-25-50` (both in the kept list).

## Changes

### A. Extend core `columns` block
- **Model** (`blocks/columns/_columns.json`): add a `classes` **Layout** select with the 6 unequal ratios + an "Equal (default)" option (value `""`). Keep `columns` + `rows` count fields. Description: "Pick a width ratio; the column count is set automatically. Leave as Equal for evenly-split columns."
- **CSS** (`blocks/columns/columns.css`): add per-layout width rules scoped to `.columns.layout-*` (mobile-first: stack < 900px; ratios apply ≥ 900px). Equal (no class) keeps the existing `flex: 1` behavior.
- **JS** (`blocks/columns/columns.js`): unchanged for rendering (widths are CSS-driven by the class); verify it still flags image columns.

### B. Auto-insert child columns on Layout select (UE extension)
- Add a small Universal Editor extension (in `scripts/editor-support.js` or a dedicated editor plugin) that, on a Columns block's Layout field change, computes the required count from the ratio (2 for `75-25`/`25-75`; 3 for the three-part ratios; leaves count as-is for Equal) and issues a UE content update to the block's `columns` property so the franklin component inserts/removes child columns. Widths follow from the `layout-*` class via CSS.
- Include a graceful fallback: if the extension can't run, the numeric **Columns** field remains editable so authors can set the count manually (the field description states the matching count per ratio).

### C. Remove `columns-control`
- Delete `blocks/columns-control/` (js/css/json/README/metadata) and `tools/importer/parsers/columns-control.js`.
- Remove `columns-control` from `models/_section.json`; remove its refs from `tools/importer/import-merkle-now.js`, `import-merkle-now.bundle.js` (rebuild), and `page-templates.json`.
- Repoint the merkle-now importer at the core **Columns** block: parser emits `Columns (layout-40-30-30)` / `Columns (layout-25-25-50)`.
- Rebuild aggregated JSON.

### D. Re-import merkle-now + regenerate JCR
- Re-bundle + re-run the merkle-now import so `content/en/merkle-now.plain.html` uses core `columns` with the layout classes.
- Regenerate `migration-work/jcr-content/merkle-now.{md,xml}` (core Columns nodes with `classes="layout-40-30-30"` / `layout-25-25-50`; model resolves to core columns — no injected `columns-control` model/name needed).

### E. Verify, commit, push
- `npm run build:json`; `npm run lint`.
- Preview: 2- and 3-column ratios render correct widths; equal default still works; mobile stacks.
- Commit on `feature/custom-blocks`, push so Code Sync deploys.

## Checklist

### 1. Extend core Columns
- [ ] Add `classes` **Layout** select (Equal default + 75-25, 25-75, 40-30-30, 50-25-25, 25-25-50, 25-50-25) to `blocks/columns/_columns.json` model; keep `columns`/`rows`
- [ ] Add per-layout width rules to `blocks/columns/columns.css` (`.columns.layout-*`), mobile-first; equal (no class) unchanged
- [ ] Verify `blocks/columns/columns.js` still flags image columns and needs no width logic

### 2. Auto-insert extension (UE)
- [ ] Add a Universal Editor extension that maps a Layout selection → required column count and updates the block's `columns` property so child columns auto-insert
- [ ] Keep the numeric **Columns** field as a manual fallback; document the count-per-ratio in its description
- [ ] Verify column widths apply from the `layout-*` class after insert

### 3. Remove columns-control
- [ ] Delete `blocks/columns-control/` and `tools/importer/parsers/columns-control.js`
- [ ] Remove `columns-control` from `models/_section.json`, `import-merkle-now.js`, `page-templates.json`; rebuild bundle
- [ ] Repoint merkle-now featured parser to emit `Columns (layout-…)` (core block)
- [ ] Grep repo for stray `columns-control` refs and resolve

### 4. Re-import + regenerate JCR
- [ ] Re-bundle + re-run `run-bulk-import.js` for merkle-now; confirm core `columns` + `layout-40-30-30`/`layout-25-25-50` in `content/en/merkle-now.plain.html`
- [ ] Regenerate `migration-work/jcr-content/merkle-now.{md,xml}` using core Columns

### 5. Build, lint, preview, ship
- [ ] `npm run build:json`; confirm core `columns` model lists `classes` + `columns` + `rows`; `columns-control` gone from aggregated JSON
- [ ] `npm run lint` passes
- [ ] Preview: 3-col (40/30/30, 25/50/25) and 2-col (75/25) ratios correct; equal default works; mobile stacks
- [ ] Commit on `feature/custom-blocks` and push to origin

## Notes
- **Auto-insert = UE extension.** This is the one non-native piece; the Layout select alone can't restructure columns. The extension syncs the count from the ratio; the numeric Columns field remains as a manual fallback if the extension is unavailable in a given editor context.
- Block stays named **"Columns"**, so md2jcr detects the columns container and captures the `classes` layout — no naming workaround needed, and the earlier `modelId` issue does not recur.
- The merkle-now layouts (40/30/30, 25/25/50) are both in the kept ratio set, so the page migrates cleanly onto the extended core Columns block.
- Modifying the core `columns` block is intentional and site-wide; any existing plain Columns usage keeps working (Equal default = current behavior).
- **Execution requires Execute mode** — this plan makes no file changes yet.
