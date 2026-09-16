I'll analyze the two source pages and the existing blocks to build a migration plan. Let me gather the necessary information.Let me examine the existing blocks' capabilities to map reuse accurately.Both pages are "listing/index" pages that share a nearly identical structure, and most of it maps cleanly onto existing blocks. The one genuine architectural decision is how to handle the interactive **filter + dynamically-loaded results** section (the live site fetches/filters content via JS), which no existing block covers. Let me get your call on that before finalizing the plan.# Migrate "Merkle Now" & "Work" Pages — Block Reuse Plan

## Goal
Migrate two Merkle listing pages into the xwalk project, maximizing reuse of the blocks already built for the home page:
- **Merkle Now** — https://www.merkle.com/en/merkle-now.html
- **Work** — https://www.merkle.com/en/work.html

Both pages share the same skeleton: **Hero intro → Featured content carousel → "Find something specific" faceted filter + results grid → Footer**. The header/footer fragments and most section blocks already exist; the one net-new piece is an interactive filter block.

## Block Reuse Map (verified against existing blocks)

| Page section | Existing block | Reuse decision |
|---|---|---|
| Header (logo, nav, language, search, Contact CTA) | `header` fragment | **Reuse as-is** (already deployed) |
| Footer (links, social, dentsu) | `footer` fragment | **Reuse as-is** |
| Hero title + tagline (text intro, no image) | default content (title + text) — *not* `carousel-hero` (these are simple text heros, not full-bleed image rotators) | **Reuse default content**; style via section |
| Featured content carousel (image + label + title + "Read more"/"Read case") | `carousel-cases` (container-items: bg image + label + title + link) | **Reuse as-is** (confirmed) |
| "Find something specific" + facets + results grid + Load more | *none exists* | **Build new `content-filter` block** (confirmed) |
| Results cards (fallback / initial render) | `cards-feature` markup pattern | Rendered by the new filter block's item template |

**No changes needed** to `carousel-hero`, `cards-icon`, `video-centered`, `cta-buttons` for these pages (they stay available but aren't required here).

## New Block: `content-filter`
An authorable, client-side faceted filter + paginated results grid. Since there is no live backend feed in EDS, the block reads its result items from **authored content** (each result card = image + type/label + title + link + facet tags), filters them in-browser by the selected facets, and reveals more via "Load more".

- **Model (`container-items`)**:
  - *Container filter*: heading (e.g. "Find something specific"), page-size (Load-more increment), facet-group config.
  - *Item model*: image (asset reference), content-type, title, description, link, and facet fields (Content Type, Industries, Capabilities, Partners, Country) as tag/multiselect.
- **JS**: build facet checkbox groups from the union of item tags; filter on change; "Show All"/"Apply"/"Load more" controls; update result count; graceful no-JS fallback (all cards visible).
- **CSS**: filter bar + responsive results grid (mobile-first, 600/900/1200 breakpoints), dark/light theme via section.
- Register in `models/_section.json` filters and run `npm run build:json`.

## Approach
1. Run page analysis on both URLs to capture DOM, sections, and the exact facet lists → add both to `tools/importer/page-templates.json` as new templates (`merkle-now`, `work`), reusing existing block instances where selectors match.
2. Build the `content-filter` block (js/css/`_content-filter.json`/metadata/README) and register it in the section filter.
3. Generate importer parsers/transformers for the new templates + the new block; reuse existing parsers for `carousel-cases`.
4. Run the bundled import script to produce the two content HTML pages (never hand-write content).
5. Verify in preview; lint; stage DAM images.

## Checklist

### 1. Analysis & template config
- [ ] Analyze `merkle-now.html` — capture sections, selectors, featured-carousel items, and the full facet taxonomy (Content Type / Industries / Capabilities / Partners / Country)
- [ ] Analyze `work.html` — capture sections, case-study carousel items, and its facet taxonomy (Partners / Country / Capabilities / Industries)
- [ ] Add `merkle-now` and `work` templates to `tools/importer/page-templates.json`, mapping: hero→default content, featured→`carousel-cases`, filter→`content-filter`
- [ ] Validate the template schema

### 2. Reuse verification (no-code-change blocks)
- [ ] Confirm `carousel-cases` markup/model covers both the "Merkle Now" featured cards and the "Work" case-study cards (label + title + "Read more"/"Read case" + image) — reuse as-is
- [ ] Confirm hero intros are plain title+text default content (no new block needed)
- [ ] Confirm `header`/`footer` fragments render on both pages unchanged

### 3. Build the `content-filter` block (net-new)
- [ ] Create `blocks/content-filter/content-filter.js` — build facet groups from item tags, in-browser filtering, Show All / Apply / Load more, result count, no-JS fallback
- [ ] Create `blocks/content-filter/content-filter.css` — filter bar + responsive results grid, mobile-first w/ 600/900/1200 breakpoints, block-scoped selectors
- [ ] Create `blocks/content-filter/_content-filter.json` — container filter (heading, page size) + item model (image reference, content-type, title, description, link, facet tags)
- [ ] Create `blocks/content-filter/metadata.json` + `README.md`
- [ ] Register `content-filter` in `models/_section.json` filters; run `npm run build:json`

### 4. Import content
- [ ] Generate/adjust importer parsers for the new templates (reuse `carousel-cases` parser; add `content-filter`)
- [ ] Generate transformers (cleanup / sections / Dynamic Media) for both pages
- [ ] Run the bundled import script (`run-bulk-import.js`) to produce the two content pages — do NOT hand-edit content HTML
- [ ] Stage any new page images/logos for DAM upload under `migration-work/dam-upload/`

### 5. Verify
- [ ] `npm run lint` (ESLint + stylelint) passes for the new block
- [ ] Preview both pages: hero, featured `carousel-cases` rotator, and `content-filter` (facets toggle, Load more works, count updates), header + footer intact
- [ ] Check responsive layout at mobile / 900 / 1200 and confirm no-JS fallback shows all cards
- [ ] Confirm images are authorable (asset-reference fields, not hardcoded)

## Notes
- Featured carousels reuse `carousel-cases` **unchanged** — the only new block is `content-filter`.
- `content-filter` is client-side over **authored** items (no live backend feed exists in EDS); facets are derived from item tags.
- Content HTML is produced only via the bundled import script, never hand-written.
- **Execution requires Execute mode** — this plan does not modify files yet.

Also — a heads-up unrelated to the plan: a **modern-web-guidance** plugin is available (keeps CSS/JS practices current) that could help while building the new `content-filter` block. Want me to enable it before we start?
