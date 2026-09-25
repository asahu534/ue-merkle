# EDS Upskilling Assignment: Edge Delivery Services with Universal Editor, DA.live and Google Drive

> **Audience:** Developers moving onto AEM Edge Delivery Services (EDS) projects
> **Format:** Individual or pairs · 6 modules plus a capstone · about 6 weeks at 6–8 hrs/week
> **Edition:** TRAINER (contains §15 answer key and troubleshooting root causes). Share `eds-upskilling-assignment-trainee.md` with trainees.
> **Outcome:** Trainees can build, author, migrate, tune and ship a production-grade EDS site on all three authoring surfaces

---

## 0. How to Use This Document

- Everything here comes from work we have already shipped on the Merkle EDS project: Universal Editor models, the columns layout variants, cards-feature per-card widths, accordion, blog-list driven by the query index, client-side search with type-ahead, section styles, header/footer hover effects, and the content importer.
- **Trainees must not use client content.** All exercises use a made-up brand, **"Summit Outdoor Co."** (outdoor gear and trip guides). The Merkle repo is kept for trainers as a **reference implementation and answer key** (see §15).
- Every module has **Tasks**, **Deliverables** and **Acceptance Criteria**. A module counts as done only when every criterion passes.

---

## 1. Learning Objectives

By the end, a trainee can:

1. Explain the EDS architecture: GitHub code, content source, the Code Sync app, preview and live, CDN, and three-phase loading.
2. Design **content models** that authors find easy to use, and pick the right one of the **four canonical block patterns**.
3. Build blocks in vanilla JS and CSS that are scoped, responsive, accessible and fast (Lighthouse 100).
4. Model components for **Universal Editor** (definitions, models, filters, containers, `classes` variants).
5. Author the same content in **DA.live** and **Google Docs/Sheets** with document-based authoring.
6. Build **data-driven blocks** from the query index, spreadsheets/JSON and **third-party REST APIs**.
7. Build global chrome: header/nav, footer, fragments, design tokens, fonts and icons.
8. **Migrate** pages from a legacy site with import scripts (parsers and transformers), and ingest them for UE.
9. Run a professional delivery workflow: branch previews, PRs with preview links, PageSpeed checks, preview/publish, and debugging.

---

## 2. Prerequisites and Environment Setup

### 2.1 Skills
- HTML5, modern CSS (Grid, Flexbox, custom properties), ES6+ JavaScript, Git and GitHub, basic Node/npm.

### 2.2 Accounts and Access (trainer provisions)
| Item | Purpose |
|---|---|
| GitHub org for training + the **AEM Code Sync** GitHub App installed | Code hosting and sync to EDS |
| AEM as a Cloud Service **author sandbox** with Universal Editor | Track A (UE / xwalk) |
| **DA.live** org (`da.live/#/<org>/<repo>`) | Track B (DA) |
| Shared **Google Drive** folder, shared with the EDS service account (see aem.live docs) | Track C (Google Docs) |
| AEM Sidekick browser extension | Preview/publish from docs |
| Node LTS, `npm i -g @adobe/aem-cli` | Local dev (`aem up`) |

### 2.3 Important Constraint: One Content Source per Site
A single EDS site (repo) points to **one** content source through `fstab.yaml` or the config service. So each trainee creates **three repos**:

| Track | Repo template | Content source |
|---|---|---|
| A: Universal Editor | `adobe-rnd/aem-boilerplate-xwalk` | AEM author (`/content/<site>`) |
| B: DA.live | `adobe/aem-boilerplate` | `https://content.da.live/<org>/<repo>/` |
| C: Google Drive | `adobe/aem-boilerplate` | Google Drive folder URL |

**Tip:** Build blocks once in Track B, then port them to Track C (same code, different authoring). Track A needs extra modeling work (`_<block>.json`), which is where most of the learning happens.

### 2.4 Setup Tasks (Module 0, about 3 hrs)
- [ ] Create the three repos from the templates; install Code Sync on each.
- [ ] Configure the content source for each track; confirm `https://main--<repo>--<owner>.aem.page/` renders.
- [ ] Run `npm install`, then `aem up` locally; open `http://localhost:3000`.
- [ ] Create a feature branch; confirm `https://<branch>--<repo>--<owner>.aem.page/` works.
- [ ] Read: *Anatomy of a Project*, *Markup, Sections, Blocks*, *Keeping it 100*, *David's Model* (links in §12).

**Acceptance:** All three sites preview on `main` and on a feature branch. The trainee can explain in their own words why the hostname contains the repo and owner, and how a custom domain changes that.

---

## 3. Module 1: Content Modeling and the Four Canonical Block Patterns (Week 1)

Build **at least one block of each pattern**, in **every track** (Doc-based: B/C, UE: A).

### 3.1 Pattern Reference

| Pattern | What it is | Doc-authoring shape | UE (xwalk) shape | Summit example to build |
|---|---|---|---|---|
| **Standalone** | One unique thing, no repetition | Block table with fixed cells (image, heading, text, CTA) | Simple block + one model | **`promo-banner`**: background image, eyebrow, heading, text, CTA, with variants `(dark)` and `(centered)` |
| **Collection** | Repeating items of the same shape | One row per item | **Container** block + **item** model + filter | **`trip-cards`**: image, title, duration, price, link per card. Also **`faq`** (accordion) |
| **Configuration** | Key/value settings that drive behavior; content comes from elsewhere | 2-column key/value table, read with `readBlockConfig()` | Model fields rendered as rows (select, number, aem-content) | **`article-list`**: parent path, sort, page size, show filters |
| **Auto-blocked** | Built by code from ordinary content; the author never inserts a block | Author writes plain content | Use with care: auto blocks aren't UE components | **Auto hero** (H1 + first image → `hero`) and **auto fragment** (link to `/fragments/*` → inline fragment) in `buildAutoBlocks()` |

### 3.2 Tasks
- [ ] Before coding, write a **content contract** for each block (the table the author fills in), and document why you chose that pattern.
- [ ] Build `promo-banner` (standalone) with two variants driven by classes: `dark`, `centered`.
- [ ] Build `trip-cards` (collection), mobile-first grid: 1 column, then 2 at 600px, then 3 at 900px. The whole card is clickable.
- [ ] Build `faq` (collection) as an accessible accordion: `button` plus `aria-expanded`/`aria-controls`, keyboard operable, plus/minus icon.
- [ ] Build `article-list` (configuration). It reads its config and renders children of a parent path from the query index (Module 4 extends it).
- [ ] Add auto-blocking in `scripts.js > buildAutoBlocks()`:
  - an auto hero when the first section starts with a picture followed by an H1
  - auto fragments for links to `/fragments/...`
- [ ] Make every block handle **missing or extra fields gracefully**: no JS errors and no empty broken markup.

### 3.3 Acceptance Criteria
- Each block has `blocks/<name>/<name>.js`, `<name>.css` and `README.md` (purpose, content contract, variants, screenshots).
- All CSS selectors are scoped to `.<blockname>`; no `-container`/`-wrapper` class names are invented.
- `npm run lint` passes.
- A `drafts/` test page exists per block (`aem up --html-folder drafts`).
- The trainee can explain, verbally, when to use a configuration block versus section metadata versus page metadata.

---

## 4. Module 2: Universal Editor Modeling, Track A (Week 2)

### 4.1 Concepts to Master
- `component-definition.json`, `component-models.json` and `component-filters.json` are **generated** from `blocks/*/_<block>.json` and `models/*.json` by `npm run build:json`. Never edit the aggregates by hand.
- Resource types: `core/franklin/components/block/v1/block`, `…/block/item`, `…/columns/v1/columns`, `…/section/v1/section`, `…/text`, `…/title`, `…/image`, `…/button`.
- Field types: `text`, `richtext`, `reference` (image), `aem-content` (page picker), `select`, `multiselect`, `number`, `boolean`.
- **Field hinting and collapsing:** `image` + `imageAlt`, `link` + `linkText`/`linkTitle`/`linkType`, and `_`-prefixed element grouping.
- **`classes` field:** its value becomes CSS classes on the block. This is how variants work in UE.
- **Filters:** which children a container or section may hold.
- `editor-support.js` redecorates on edits. Use `moveInstrumentation()` when you restructure DOM so the `data-aue-*` attributes survive and elements stay editable.

### 4.2 Tasks
- [ ] Write `_promo-banner.json`, `_trip-cards.json` (container + item + filter), `_faq.json` (container + item) and `_article-list.json` (config fields).
- [ ] Extend **Columns** with a **Layout** `select` (`classes`): Equal (default), 75-25, 25-75, 40-30-30, 50-25-25, 25-25-50, 25-50-25. CSS changes the widths; images must never distort (`object-fit`/`aspect-ratio`).
- [ ] Add a per-item **Width** select to `trip-cards` (for example `cardw-50`, `cardw-25`), so a row can be 50-25-25.
- [ ] Extend the **Section** model's `style` multiselect with **Highlight**, **Centered** and **Dark** (`theme-dark`) and style them globally.
- [ ] Add an **Alignment** select (Left/Center/Right) to the Title and Text models.
- [ ] Update the section filter so the new blocks can be added.
- [ ] Author a full **Summit home page** in UE with every block, and verify live editing: redecoration happens and fields stay editable after DOM changes.

### 4.3 Acceptance Criteria
- `npm run build:json && npm run lint` pass, including the xwalk ESLint rules (such as **max 4 cells** per block).
- Every block can be added, edited, reordered and deleted in UE with no console errors.
- The trainee knows the **Columns naming rule**: a columns-type block name must start with "Columns", or UE fails with `Cannot read properties of undefined (reading 'modelId')`.

---

## 5. Module 3: Document-Based Authoring in DA.live and Google Drive, Tracks B and C (Week 2)

### 5.1 Tasks: DA.live
- [ ] Author the same Summit home page in **DA.live** with block tables. Variants use the heading syntax: `Promo Banner (dark, centered)`.
- [ ] Use **Section Metadata** (`Style | dark`) and a **Metadata** block (title, description, image, keywords).
- [ ] Set up a **DA block library** so authors can insert your blocks from a picker.
- [ ] Create a **DA sheet** (for example `/data/trips`) and confirm the JSON at `/data/trips.json`.
- [ ] Preview and publish with Sidekick and the DA UI; confirm the `.aem.page` and `.aem.live` outputs.

### 5.2 Tasks: Google Drive
- [ ] Author the same page as a **Google Doc** (tables become blocks, `---` becomes a section break).
- [ ] Create Google Sheets for **`placeholders`** (i18n strings), **`redirects`**, bulk **`metadata`** and **`query-index`**.
- [ ] Use `fetchPlaceholders()` in a block, for example to supply the "Load more" label.
- [ ] Preview and publish via Sidekick; confirm a redirect works.

### 5.3 Acceptance Criteria
- The same block JS/CSS renders identically in B and C, with **zero code changes** between them.
- The trainee can explain, verbally, how the markup of a document table maps to the block DOM (`block > div(row) > div(cell)`) and why the **content contract** must not change once pages exist.

---

## 6. Module 4: Dynamic and Data-Driven Blocks (Week 3)

### 6.1 Query Index Listing (extend `article-list`)
- [ ] Configure the query index: `helix-query.yaml` or the config service for doc projects; the `query-index` sheet for Drive.
- [ ] Add at least one custom column, for example `category` from `<meta name="category">`. Note that hyphenated meta names become camelCase in the index.
- [ ] Render descendants of the configured parent. Add **Sort** (Newest, Oldest, Title A–Z, Title Z–A), **Load more** paging, and **keyword/category facets** (OR within a facet).
- [ ] Hide the Filters UI when there are no facet values. Handle "No pages found".
- [ ] **UE-specific:** normalise author paths (`/content/<site>/…`) against EDS paths (`/…`) so the list fills on the author instance too.

### 6.2 Client-Side Search Block
- [ ] Build a `search` block over `/query-index.json`, with **no page refresh**:
  - type-ahead suggestions (debounced, ↑/↓/Enter/Esc, `role="listbox"`)
  - multi-token AND match across title, description and keywords
  - keyword facets, a live result count, and Load more (hidden when there are ≤ page-size results)
  - Trending Topics chips in the empty state; clearing the input returns to the initial state
  - the filter sidebar hides when the query returns nothing
  - `?q=` kept in sync with `history.replaceState`, and restored on load
- [ ] **Discussion item:** why we did **not** call the legacy site's `search.suggestions.js` endpoint. Cover CORS, suggestions pointing to off-site paths, and third-party coupling.

### 6.3 Spreadsheet-Driven Block
- [ ] `trip-finder`: reads `/data/trips.json` (DA sheet or Google Sheet) and renders filterable cards. Support multi-sheet JSON (`?sheet=`, `:names`).

### 6.4 Third-Party REST API Block
- [ ] `trail-weather`: the author configures a location (lat/long or a select). The block calls a **public, CORS-enabled, keyless API** (for example Open-Meteo) and renders a 3-day forecast.
- [ ] Required behaviors:
  - **Loading** (skeleton), **error** (friendly message plus retry) and **empty** states
  - `AbortController` timeout; no layout shift (reserve height)
  - session caching of responses (for example `sessionStorage` with a TTL)
  - lazy fetch only when the block is near the viewport (`IntersectionObserver`)
- [ ] **Security exercise (write-up):** design how you would call an API that **requires a secret key**. Never ship the key client-side; use an edge worker or serverless proxy, apply rate limiting, and restrict allowed origins.
- [ ] **Stretch:** a `stock-ticker` or `news-feed` block that uses a proxy you deploy.

### 6.5 Acceptance Criteria
- All dynamic blocks work on `localhost`, `.aem.page` and (Track A) the author instance.
- No uncaught promise rejections; network failures are handled and visible to the user.
- The Lighthouse performance score stays ≥ 95 with the dynamic blocks on the page.

---

## 7. Module 5: Global Experience, Theming and Chrome (Week 4)

- [ ] **Design tokens:** create a `brand.css` with colors, type scale and spacing; mobile-first heading sizes with desktop overrides at 900px.
- [ ] **Fonts:** self-host a web font plus a fallback font with `size-adjust` to avoid CLS; load it outside the LCP path.
- [ ] **Header/nav** from the `nav` fragment: brand, sections, tools (language, search, CTA). Needs a keyboard-accessible hamburger, `aria-expanded`, Esc to close, and a mobile/desktop split at 900px.
- [ ] **Hover and interaction polish:** nav links get an animated underline (a `::before` that wipes from `scaleX(0)` to `scaleX(1)`, with transform-origin flipping from right to left, over 0.25s). Footer links get the same effect in a secondary color. Tiles get a subtle background-darken transition.
- [ ] **Footer** from the `footer` fragment: link columns, social icons (`:icon-name:` syntax, SVGs in `/icons`), legal text.
- [ ] **Fragments:** a reusable CTA fragment embedded on three pages.
- [ ] **404** page and `head.html` hygiene.

**Acceptance:** Header and footer look and behave correctly at 375px, 768px and 1440px; the keyboard-only walkthrough passes; there is no CLS from fonts or header.

---

## 8. Module 6: Performance, Accessibility, SEO and Operations (Week 4)

### 8.1 Tasks
- [ ] **Three-phase loading:** show which code runs in eager, lazy and delayed. Move martech or analytics placeholders to `delayed.js`.
- [ ] **LCP:** the first-section image is eager and optimized (`createOptimizedPicture`); everything else is lazy.
- [ ] Run **PageSpeed Insights** on the branch preview URL and fix issues until mobile and desktop both score **100**.
- [ ] **Accessibility (WCAG 2.1 AA):** correct heading hierarchy, alt text, focus-visible styles, color contrast, ARIA on interactive blocks (accordion, search, carousel, nav). Test with a screen reader (VoiceOver/NVDA) and axe.
- [ ] **SEO:** title and description per page, OG image, canonical, `robots`, sitemap config, and a `redirects` sheet for legacy URLs.
- [ ] **Localization:** create `/fr/` versions of two pages, locale-specific `placeholders`, and a language switcher in the header.
- [ ] **RUM / operational telemetry:** explain what `sampleRUM` collects and where to view it.
- [ ] **Security:** confirm there are no secrets in the repo; use `.hlxignore` for internal files (for example `docs/`, `tools/`, `drafts/`).

### 8.2 Acceptance Criteria
- PSI 100/100 (or documented, justified exceptions) on home, a listing page and an article page.
- Zero critical axe violations.
- The sitemap and redirects are verified on `.aem.live`.

---

## 9. Module 7: Content Migration and Import (Week 5)

**Scenario:** migrate three pages from a public demo or legacy site that the trainer supplies, or use a static mock of "Summit" legacy pages the trainer hosts.

### 9.1 Tasks
- [ ] **Analyze the page:** identify sections, default content versus blocks, and block variants. Produce a page-template mapping (block → DOM selectors).
- [ ] Write an **import script** (`tools/importer/import-<template>.js`) containing:
  - **parsers**, one per block, that convert a source DOM fragment into a block table (cells matching your content contract)
  - **transformers**: cleanup (remove cookie banners, nav, footer), section breaks plus Section Metadata, and image URL rewrites (for example a DAM/CDN mapping)
  - **path mapping**, for example `/en/about-us/history` → `/about-us`
- [ ] **Bundle and run a bulk import** over a URL list; review the per-page report and the content-completeness score.
- [ ] **Decide what not to import:** for example, server-rendered search scaffolding that the EDS block regenerates client-side. Document every intentional drop.
- [ ] **Track A:** convert the output to **JCR** (via `@adobe/helix-md2jcr` or a content package) and ingest it into the author sandbox. Verify blocks resolve to the right models.
- [ ] **Tracks B/C:** upload the output to DA (`admin.da.live` source API) or paste it into Docs; then preview.

### 9.2 Known Traps to Discover and Document
- Lazy-loaded images whose real `src` only appears after the transform runs.
- Scene7/DM image URLs with template placeholders (`wid={.width}`) that break `new URL()`.
- Block tables are `<table>` elements during the transform; class selectors only apply after the markdown→HTML step, so use marker attributes.
- Low completeness scores can be **expected**. Explain why.

### 9.3 Acceptance Criteria
- All three pages import with no manual HTML edits. Re-running the importer is repeatable and gives the same output.
- The imported pages render correctly with your blocks, and images resolve.

---

## 10. Module 8: Delivery Workflow and Troubleshooting Lab (Week 5)

### 10.1 Delivery Workflow
- [ ] Feature branch, then PR. The PR description **must** include a `https://<branch>--<repo>--<owner>.aem.page/<path>` link that demonstrates the change.
- [ ] `gh pr checks`: Code Sync, lint and performance all pass.
- [ ] Peer code review, using a checklist: scoping, a11y, no dependencies, handles missing fields, README present.
- [ ] Preview then publish; cache behavior; how to **roll back** (revert the commit, or unpublish).
- [ ] Use the **Admin API** for status, preview and publish of a page (read the docs; no secrets in scripts).

### 10.2 Troubleshooting Lab (the trainer provides a "broken" branch)
Each bug is a real issue we hit. The trainee finds the root cause, fixes it and writes a 3-line post-mortem.

| # | Symptom | Root cause to find |
|---|---|---|
| 1 | UE: `Cannot read properties of undefined (reading 'modelId')` | Columns-type block not named "Columns…" |
| 2 | Listing shows "No pages found" on author but works on `.aem.page` | Author index uses `/content/<site>/…` paths; normalise them |
| 3 | Facet panel is empty | Meta name `content-type` is indexed as `contentType`, or the index column is missing |
| 4 | "Load more" visible even with 3 results | Global `.button { display:inline-flex }` overrides `[hidden]` |
| 5 | Third-party API fails only in production | CORS / missing `Access-Control-Allow-Origin`; mixed content |
| 6 | Lint fails: too many cells | xwalk `max-cells` rule; redesign the model |
| 7 | Layout jumps when fonts load | No fallback font with `size-adjust` |
| 8 | UE fields stop being editable after the block decorates | Missing `moveInstrumentation()` |
| 9 | Stylelint `no-descending-specificity` error | Base selectors ordered after positional overrides |
| 10 | Screenshot shows a blank page in tests | `body{display:none}` until `.appear`; loader not run |

---

## 11. Capstone: The "Summit Outdoor Co." Mini-Site (Week 6)

Choose **one primary track** (A, B or C). Build a site with:

| Page | Must include |
|---|---|
| Home | Auto hero, `promo-banner`, `trip-cards` (with a 50-25-25 row), Columns layout variant, a `theme-dark` section |
| Trips listing | `article-list` with facets, sort and load more |
| Trip detail (×3) | Metadata, keywords, `faq` accordion, `trail-weather` (REST API) |
| Search | `search` block with type-ahead and URL state |
| About | Migrated via the import script (Module 7) |
| Global | Header/nav, footer, fragments, 404, FR localization of home |

**Deliver:**
- a repo link and preview/live URLs
- README per block
- an architecture note (one page)
- a PSI report
- an axe report
- a 10-minute recorded demo, including one **authoring demo** in the chosen editor

---

## 12. Evaluation Rubric (100 points)

| Area | Points | What "excellent" looks like |
|---|---|---|
| Functionality | 25 | Every block works on every environment; edge cases handled |
| Content modeling and authoring UX | 20 | Right pattern per block, intuitive fields and variants, stable contracts |
| Code quality | 15 | Lint clean, scoped CSS, no dependencies, readable, matches boilerplate idioms |
| Performance | 10 | PSI 100, no CLS, correct loading phases |
| Accessibility | 10 | Keyboard and screen reader OK, AA contrast, correct ARIA |
| Migration | 10 | Repeatable import, documented intentional drops |
| Delivery and debugging | 5 | Clean PRs with preview links; troubleshooting post-mortems |
| Documentation and demo | 5 | Clear READMEs, architecture note, confident demo |

**Pass:** ≥ 70 · **Project-ready:** ≥ 85, with no area below 50%.

---

## 13. Knowledge Check (Oral or Written)

1. Why can't you rename the `*.aem.page` hostname without renaming the repo, and what is the production alternative?
2. Standalone vs collection vs configuration vs auto-blocked: give one example of each and one misuse of each.
3. Why should auto-blocking be used sparingly in Universal Editor projects?
4. What does `npm run build:json` generate, and why must you never hand-edit its outputs?
5. How does a `classes` field differ from a Section `style` field?
6. What are the three loading phases, and where do analytics belong?
7. How does a document table become block DOM? What breaks if you change the contract?
8. How do you use an API that requires a secret key from an EDS block?
9. Why can a query-index-driven block behave differently on author than on `.aem.page`?
10. What is `moveInstrumentation()` for?
11. When is a low import completeness score acceptable?
12. How do you keep internal files (docs, tools) from being served publicly?

---

## 14. Reference Resources

- aem.live docs: https://www.aem.live/docs/ · Developer tutorial: https://www.aem.live/developer/tutorial
- Markup, sections and blocks: https://www.aem.live/developer/markup-sections-blocks
- Component model definitions (UE): https://www.aem.live/developer/component-model-definitions
- Keeping it 100: https://www.aem.live/developer/keeping-it-100 · David's Model: https://www.aem.live/docs/davidsmodel
- Block Collection: https://www.aem.live/developer/block-collection
- Boilerplates: `adobe/aem-boilerplate`, `adobe-rnd/aem-boilerplate-xwalk` (see its PRs labelled *Example*)
- xwalk ESLint rules: https://github.com/adobe-rnd/eslint-plugin-xwalk
- DA.live docs: https://da.live/docs · Google Drive authoring: aem.live docs, "Authoring with Google Drive"
- Full-text docs search: `curl -s https://www.aem.live/docpages-index.json | jq …`

---

## 15. Trainer Notes and Answer Key (Internal, Do Not Share with Trainees)

These reference implementations live in our internal repo:

| Exercise | Reference in our repo |
|---|---|
| Collection + UE container + `moveInstrumentation` | `blocks/accordion/` |
| Configuration + query index + facets + author/EDS paths + sort | `blocks/blog-list/` |
| Client-side search, type-ahead, URL state, hide-when-empty | `blocks/search/` |
| Layout variants via `classes` | `blocks/columns/` (`_columns.json`, `columns.css`) |
| Per-item width select, full-bleed image overlay | `blocks/cards-feature/` |
| Section styles (Highlight, Centered, Dark) | `models/_section.json`, `styles/styles.css` |
| Title/Text alignment | `models/_title.json`, `models/_text.json` |
| Animated underline hovers | `blocks/header/header.css`, `blocks/footer/footer.css` |
| Import parsers and transformers, path mapping, marker attributes | `tools/importer/` |

- Create the **troubleshooting branch** by re-introducing the 10 bugs from §10.2 into a copy of the reference repo.
- Replace all Merkle content and branding with Summit content before sharing any reference code.

---

## Checklist

### Preparing the Assignment (Trainer)
- [ ] Confirm the defaults: 6-week duration, fictional brand "Summit Outdoor Co.", individual or pair format, pass thresholds
- [x] Save this document as `docs/training/eds-upskilling-assignment.md`, outside served paths, and add `docs/` to `.hlxignore`
- [ ] Optionally export it to PDF for distribution
- [ ] Set up the training GitHub org, install AEM Code Sync, and publish the three template repos (xwalk, DA, Drive)
- [ ] Provision the AEM author sandbox (UE), the DA.live org and the shared Google Drive folder; confirm access for each trainee
- [ ] Prepare a Summit mock legacy site (three pages) for Module 7
- [ ] Build the troubleshooting-lab branch with the 10 seeded bugs
- [ ] Prepare the answer key from the reference blocks (§15), stripped of client content
- [ ] Schedule weekly check-ins, the code-review session and the capstone demo day
- [ ] Share the trainee edition (`eds-upskilling-assignment-trainee.md`, no §15 / root causes) with the training team

### Trainee Submission Checklist
- [ ] Module 0: three repos previewing on `main` and on a feature branch
- [ ] Module 1: four-pattern blocks with READMEs and draft test pages
- [ ] Module 2: UE models, Columns layouts, card widths, section styles, alignment; `build:json` and lint pass
- [ ] Module 3: the same page authored in DA.live and Google Docs; sheets for placeholders, redirects, metadata and data
- [ ] Module 4: listing with facets, search, spreadsheet block, REST API block with loading/error/empty states, secret-key design write-up
- [ ] Module 5: tokens, fonts, header/nav, footer, fragments, hover effects, 404
- [ ] Module 6: PSI 100, axe clean, SEO, sitemap, redirects, FR localization
- [ ] Module 7: repeatable import of three pages (plus JCR ingestion for Track A)
- [ ] Module 8: PRs with preview links; 10 troubleshooting post-mortems
- [ ] Capstone: repo, URLs, reports, architecture note and a 10-minute demo

---
