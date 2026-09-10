# Merkle Home Page Migration Plan

## Objective
Migrate the home page from `https://www.merkle.com/` into this AEM Edge Delivery Services (Universal Editor / crosswalk) project, producing authorable content that renders correctly in the local preview and is ready to publish to the configured AEMaaCS content source.

## Source & Target
- **Source URL:** `https://www.merkle.com/` (home page)
- **Project type:** `xwalk` (Universal Editor, based on `aem-boilerplate-xwalk`)
- **Preview org/site:** `asahu534` / `ue-merkle`
- **AEM site path:** `/content/universal-editor-merkle`
- **Assets folder:** `/content/dam/universal-editor-merkle`
- **Available blocks today:** `cards`, `columns`, `footer`, `fragment`, `header`, `hero`

## Approach
Use the site-migration workflow for a **single-page migration**:
1. Scrape the source home page (HTML, metadata, images) — with bot-protection fallback if needed.
2. Analyze page structure → sections, content sequences, and needed block variants.
3. Reconcile required blocks against the existing block palette; design/generate any missing block variants and their styling.
4. Build import infrastructure (page template, block parsers, page transformers).
5. Run the bundled import script to generate content (never hand-write content HTML).
6. Preview locally, visually critique against the original, and iterate.
7. Prepare for publish to the AEMaaCS content source.

## Checklist

### Phase 1 — Scrape & Analyze
- [ ] Scrape `https://www.merkle.com/` (capture cleaned HTML, metadata, and images), using the Bright Data fallback if the site blocks scraping
- [ ] Analyze page structure: identify sections, content sequences, and candidate block variants
- [ ] Produce analysis artifacts (structure JSON, screenshots, cleaned HTML)

### Phase 2 — Block Reconciliation
- [ ] Compare required variants against existing blocks (`cards`, `columns`, `hero`, `header`, `footer`, `fragment`)
- [ ] Reuse existing blocks where similarity is high; name any missing block variants
- [ ] Generate code for missing blocks and migrate their design/CSS from the source
- [ ] Run `npm run build:json` after any block model changes; run `npm run lint`

### Phase 3 — Import Infrastructure
- [ ] Create/confirm the page template for the home page
- [ ] Add DOM selector mappings for each block variant
- [ ] Generate block parsers and page transformers
- [ ] Assemble the bundled import script

### Phase 4 — Import & Preview
- [ ] Run the bulk import script to generate content (no manual content HTML)
- [ ] Start local dev server and open the imported page in the preview
- [ ] Verify sections, blocks, images, and metadata render correctly

### Phase 5 — Validate & Iterate
- [ ] Visually critique the imported page against the original merkle.com home page
- [ ] Fix content-completeness and styling divergences; re-import as needed
- [ ] Confirm header and footer migration scope (decide whether to instrument nav/footer now or separately)

### Phase 6 — Publish Prep
- [ ] Confirm target content path aligns with `/content/universal-editor-merkle`
- [ ] Upload/publish the page to the AEMaaCS content source
- [ ] Sanity-check the published page in preview

## Open Questions
- Should this migration include **header and footer** instrumentation from merkle.com, or home-page body content only for now?
- Is the home page the only page in scope, or the first of a larger site migration (affects how reusable the block variants should be)?

## Notes
- Content HTML will be generated via the project's bundled import script, never hand-authored.
- Execution requires **Execute mode** — this plan does not run any migration steps yet.

Before I finalize scope, two quick decisions:# Merkle Home Page Migration Plan

## Objective
Migrate the home page from `https://www.merkle.com/` into this AEM Edge Delivery Services (Universal Editor / crosswalk) project — including header and footer — producing authorable content that renders correctly in the local preview and is ready to publish to the configured AEMaaCS content source. Block variants will be designed for **reuse across future pages**, since this is the first of a larger site migration.

## Source & Target
- **Source URL:** `https://www.merkle.com/` (home page)
- **Project type:** `xwalk` (Universal Editor, based on `aem-boilerplate-xwalk`)
- **Preview org/site:** `asahu534` / `ue-merkle`
- **AEM site path:** `/content/universal-editor-merkle`
- **Assets folder:** `/content/dam/universal-editor-merkle`
- **Available blocks today:** `cards`, `columns`, `footer`, `fragment`, `header`, `hero`

## Decisions (confirmed)
- **Scope:** Full page — includes header/navigation and footer instrumentation.
- **Site scope:** First of many pages — block variants must be designed to be reusable across the site.

## Approach
Single-page migration as the foundation of a multi-page site migration:
1. Scrape the source home page (HTML, metadata, images) — with bot-protection fallback if needed.
2. Analyze page structure → sections, content sequences, and needed block variants.
3. Reconcile required blocks against the existing palette; design/generate missing, **reusable** block variants and their styling.
4. Instrument header/navigation and footer from the source.
5. Build import infrastructure (page template, block parsers, page transformers).
6. Run the bundled import script to generate content (never hand-write content HTML).
7. Preview locally, visually critique against the original, and iterate.
8. Prepare for publish to the AEMaaCS content source.

## Checklist

### Phase 1 — Scrape & Analyze
- [ ] Scrape `https://www.merkle.com/` (cleaned HTML, metadata, images), using Bright Data fallback if blocked
- [ ] Analyze page structure: identify sections, content sequences, and candidate block variants
- [ ] Produce analysis artifacts (structure JSON, screenshots, cleaned HTML)

### Phase 2 — Block Reconciliation (reusable variants)
- [ ] Compare required variants against existing blocks (`cards`, `columns`, `hero`, `header`, `footer`, `fragment`)
- [ ] Reuse existing blocks where similarity is high; name any missing block variants with future pages in mind
- [ ] Generate code for missing blocks and migrate their design/CSS from the source
- [ ] Run `npm run build:json` after model changes; run `npm run lint`

### Phase 3 — Header & Footer
- [ ] Instrument the header/navigation from merkle.com (desktop, mobile, and any megamenu behavior)
- [ ] Migrate the footer from merkle.com (sections, links, appearance)
- [ ] Validate header/footer structure against the source

### Phase 4 — Import Infrastructure
- [ ] Create/confirm the home page template
- [ ] Add DOM selector mappings for each block variant
- [ ] Generate block parsers and page transformers
- [ ] Assemble the bundled import script

### Phase 5 — Import & Preview
- [ ] Run the bulk import script to generate content (no manual content HTML)
- [ ] Start local dev server and open the imported page in the preview
- [ ] Verify sections, blocks, images, metadata, header, and footer render correctly

### Phase 6 — Validate & Iterate
- [ ] Visually critique the imported page against the original merkle.com home page
- [ ] Fix content-completeness and styling divergences; re-import as needed

### Phase 7 — Publish Prep
- [ ] Confirm target content path aligns with `/content/universal-editor-merkle`
- [ ] Upload/publish the page to the AEMaaCS content source
- [ ] Sanity-check the published page in preview

## Notes
- Content HTML will be generated via the project's bundled import script, never hand-authored.
- Block variants will be built for reuse, anticipating additional pages in the site migration.
- Execution requires **Execute mode** — this plan does not run any migration steps yet.
