Let me check the current block inventory and prior analysis artifacts to build an accurate plan.Both key sections have more than one viable existing block, and `blog-list` (query-index driven) can't be produced by the importer — those choices change the plan materially. Let me confirm.# Migrate `merkle-now` Using Existing Blocks

## Goal
Re-migrate **https://www.merkle.com/en/merkle-now.html** into the xwalk project using only blocks that already exist — no new blocks. Produce the content page via the bundled importer (never hand-written), then add the query-index `blog-list` block afterward in the editor.

## Blocks I will use

| Page section | Block | Notes |
|---|---|---|
| Header (logo, nav, language, search, Contact CTA) | `header` fragment | Reused as-is (already deployed) |
| Hero intro — "Merkle Now" heading + tagline | **default content** (title + text) | Plain centered text; no block needed |
| Featured content gallery (6 tiles: image + label + title + Read more) | **`column-control`** | Two rows: `layout-40-30-30` (wide first) + `layout-25-25-50` (wide last), reproducing the source's mixed-width masonry. Each column = image + eyebrow + heading + link (default content). Confirmed. |
| "Find something specific" — heading + intro paragraph | **default content** (title + text) | Importer produces the intro text only |
| "Find something specific" — faceted archive | **`blog-list`** *(added in editor, not imported)* | query-index-driven (parent page → descendants). Importer can't author it; you set its Parent Page in Universal Editor after import. |
| Footer (links, social, dentsu) | `footer` fragment | Reused as-is |

**No new blocks.** The importer wiring already targets `column-control` for the featured section and default content for the two text sections (verified in `page-templates.json` / `import-merkle-now.js`).

## Importer pipeline (already in place, will be re-run)
- Parser: `tools/importer/parsers/column-control.js` (6 featured tiles → two `column-control` blocks, alternating wide-first/wide-last).
- Transformers: `merkle-cleanup` (strip header/footer/cookie/tracking), `merkle-dm-images` (Scene7 → DAM paths), `merkle-sections` (section breaks + metadata).
- Script: `tools/importer/import-merkle-now.js` → bundle → `run-bulk-import.js` → `content/en/merkle-now.plain.html`.

## Approach
1. Confirm the `merkle-now` template/import script reflect the decisions (featured → `column-control`; "Find something specific" → default-content intro only, no imported block).
2. Re-bundle `import-merkle-now.js` and run `run-bulk-import.js` for the merkle-now URL.
3. Verify the generated `content/en/merkle-now.plain.html`: hero text, two `column-control` rows (40/30/30 + 25/25/50) with DAM images, and the "Find something specific" intro text.
4. Preview render at `/content/en/merkle-now`; check column ratios and that header/footer render.
5. Lint; report the DAM-upload + editor-authoring follow-ups.

## Checklist

### 1. Confirm importer config
- [ ] Verify `merkle-now` template in `page-templates.json`: featured section → `column-control`; hero + "Find something specific" → default content (`title`, `text`); no `blog-list`/`content-filter` block
- [ ] Verify `import-merkle-now.js` parser registry + section mapping match (column-control only)

### 2. Run the import
- [ ] Re-bundle `tools/importer/import-merkle-now.js` → `.bundle.js`
- [ ] Run `run-bulk-import.js` with `urls-merkle-now.txt` (`--force`) to regenerate `content/en/merkle-now.plain.html`

### 3. Verify output
- [ ] Hero: "Merkle Now" heading + tagline as default content
- [ ] Featured: two `column-control` blocks — `layout-40-30-30` then `layout-25-25-50` — each column with image + label + title + Read more
- [ ] Images are DAM references (`/content/dam/universal-editor-merkle/…`), not external Scene7 URLs
- [ ] "Find something specific": heading + intro paragraph present (no imported archive block)

### 4. Preview & lint
- [ ] Preview `/content/en/merkle-now`: hero, both column-control rows at correct ratios (≈40/30/30, ≈25/25/50), header + footer intact
- [ ] `npm run lint` passes

### 5. Follow-ups (report to user)
- [ ] Note DAM image upload requirement (staged under `migration-work/dam-upload/`) for tiles to render
- [ ] Note that `blog-list` must be added + pointed at a parent page in Universal Editor after ingest (importer can't author a query-index block)

## Notes
- **All existing blocks** — nothing new is built. Featured = `column-control`; text sections = default content; archive = `blog-list` (added in-editor).
- Content HTML is produced only by the bundled importer, never hand-edited.
- The imported page will not contain the `blog-list` archive — that's an authored, query-index block added in the editor per the confirmed decision.
- Local `/query-index.json` currently has few pages, so the `blog-list` archive will only populate once child pages + metadata exist and the index is rebuilt.
- **Execution requires Execute mode** — this plan makes no file changes yet.
