# EDS Upskilling Assignment: Edge Delivery Services with Universal Editor, DA.live and Google Drive

- **Audience:** Developers moving onto AEM Edge Delivery Services (EDS) projects
- **Outcome:** Trainees can build, author, migrate EDS site on all three authoring surfaces

---

## 0. How to Use This Document

- Every exercise is modelled on features we have shipped on real EDS projects: Universal Editor models, column layout variants, per-card widths, accordions, query-index listings, client-side search with type-ahead, section styles, header/footer hover effects, and content import.
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
8. Migrate pages from a legacy site with import scripts (parsers and transformers), and ingest them for UE.
9. Run a professional delivery workflow: branch previews, PRs with preview links, PageSpeed checks, preview/publish, and debugging.

---

## 2. Module 0:Prerequisites and Environment Setup

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
A single EDS site (repo) points to **one** content source through `fstab.yaml` or the config service. So each trainee creates **two repos**:

| Track | Repo template | Content source |
|---|---|---|
| A: Universal Editor | `adobe-rnd/aem-boilerplate-xwalk` | AEM author (`/content/<site>`) |
| B: DA.live | `adobe/aem-boilerplate` | `https://content.da.live/<org>/<repo>/` |
| C: Google Drive | `adobe/aem-boilerplate` | Google Drive folder URL |

**Tip:** Build blocks once in Track B, then port them to Track C (same code, different authoring). Track A needs extra modeling work (`_<block>.json`), which is where most of the learning happens.

### 2.4 Setup Tasks (Module 0, about 3 hrs)
- [ ] Create the two repos from the templates; install Code Sync on each.
- [ ] Configure the content source for each track; confirm `https://main--<repo>--<owner>.aem.page/` renders.
- [ ] Run `npm install`, then `aem up` locally; open `http://localhost:3000`.
- [ ] Create a feature branch; confirm `https://<branch>--<repo>--<owner>.aem.page/` works.
- [ ] Read: *Anatomy of a Project*, *Markup, Sections, Blocks*, *Keeping it 100*, *David's Model* (links in §12).

**Acceptance:** All two sites preview on `main` and on a feature branch.

---

## 3. Module 1: Content Modeling and the Four Canonical Block Patterns (Week 1)

Build **at least one block of each pattern**, in **every track** (Doc-based: B/C, UE: A).

### 3.1 Pattern Reference

| Pattern | What it is | Doc-authoring shape | UE (xwalk) shape | Summit example to build |
|---|---|---|---|---|
| **Standalone** | One unique thing, no repetition | Block table with fixed cells (image, heading, text, CTA) | Simple block + one model | **`promo-banner`**: background image, eyebrow, heading, text, CTA, with variants `(dark)` and `(centered)` |
| **Collection** | Repeating items of the same shape | One row per item | **Container** block + **item** model + filter | **`trip-cards`**: image, title, duration, price, link per card. Also **`faq`** (accordion) |
| **Configuration** | Key/value settings that drive behavior; content comes from elsewhere | 2-column key/value table, read with `readBlockConfig()` | Model fields rendered as rows (select, number, aem-content) | **`article-list`**: parent path, sort, page size, show filters |
| **Auto-blocked** | Built by code from ordinary content; the author never inserts a block | Author writes plain content | Use with care: auto blocks aren't UE components | **Auto hero** (H1 + first image → `hero`) |

### 3.2 Tasks
- [ ] Build `promo-banner` (standalone) with two variants driven by classes: `dark`, `centered`.
- [ ] Build `trip-cards` (collection), mobile-first grid: 1 column, then 2 at 600px, then 3 at 900px. The whole card is clickable.
- [ ] Build `faq` (collection) as an accessible accordion: `button` plus `aria-expanded`/`aria-controls`, keyboard operable, plus/minus icon.
- [ ] Build `article-list` (configuration). It reads its config and renders children of a parent path from the query index (Module 4 extends it).
- [ ] Add auto-blocking in `scripts.js > buildAutoBlocks()`:
  - an auto hero when the first section starts with a picture followed by an H1
- [ ] Make every block handle **missing or extra fields gracefully**: no JS errors and no empty broken markup.

### 3.3 Acceptance Criteria
- Each block has `blocks/<name>/<name>.js`, `<name>.css` and `README.md` (purpose, content contract, variants, screenshots).
- All CSS selectors are scoped to `.<blockname>`; no `-container`/`-wrapper` class names are invented.
- `npm run lint` passes.
- The trainee can explain, verbally, when to use a configuration block versus section metadata versus page metadata.

---
## 4. Module 2: Document-Based Authoring in DA.live and Google Drive, Tracks B and C (Week 2 and 3)

### 4.1 Tasks: DA.live
- [ ] Author the same Summit home page in **DA.live** with block tables. Variants use the heading syntax: `Promo Banner (dark, centered)`.
- [ ] Use **Section Metadata** (`Style | dark`) and a **Metadata** block (title, description, image, keywords).
- [ ] Set up a **DA block library** so authors can insert your blocks from a picker.
- [ ] Create a **DA sheet** (for example `/data/trips`) and confirm the JSON at `/data/trips.json`.
- [ ] Preview and publish with Sidekick and the DA UI; confirm the `.aem.page` and `.aem.live` outputs.

### 4.2 Tasks: Google Drive
- [ ] Author the same page as a **Google Doc** (tables become blocks, `---` becomes a section break).
- [ ] Create Google Sheets for **`placeholders`** (i18n strings), **`redirects`**, bulk **`metadata`** and **`query-index`**. 
- [ ] Use `fetchPlaceholders()` in a block, for example to supply the "Load more" label.
- [ ] Preview and publish via Sidekick; confirm a redirect works.

### 4.3 Acceptance Criteria
- The same block JS/CSS renders identically in B and C, with **zero code changes** between them.
- The trainee can explain, verbally, how the markup of a document table maps to the block DOM (`block > div(row) > div(cell)`) and why the **content contract** must not change once pages exist.

---
## 5. Module 3: Universal Editor Modeling, Track A (Week 3 and 4)

### 5.1 Concepts to Master
- `component-definition.json`, `component-models.json` and `component-filters.json` are **generated** from `blocks/*/_<block>.json` and `models/*.json` by `npm run build:json`. Never edit the aggregates by hand.
- Resource types: `core/franklin/components/block/v1/block`, `…/block/item`, `…/columns/v1/columns`, `…/section/v1/section`, `…/text`, `…/title`, `…/image`, `…/button`.
- Field types: `text`, `richtext`, `reference` (image), `aem-content` (page picker), `select`, `multiselect`, `number`, `boolean`.
- **Field hinting and collapsing:** `image` + `imageAlt`, `link` + `linkText`/`linkTitle`/`linkType`, and `_`-prefixed element grouping.
- **`classes` field:** its value becomes CSS classes on the block. This is how variants work in UE.
- **Filters:** which children a container or section may hold.
- `editor-support.js` redecorates on edits. Use `moveInstrumentation()` when you restructure DOM so the `data-aue-*` attributes survive and elements stay editable.

### 5.2 Tasks
Build:
- [ ] `promo-banner` (standalone) with two variants driven by classes: `dark`, `centered`.
- [ ] `trip-cards` (collection), mobile-first grid: 1 column, then 2 at 600px, then 3 at 900px. The whole card is clickable.
- [ ] `faq` (collection) as an accessible accordion: `button` plus `aria-expanded`/`aria-controls`, keyboard operable, plus/minus icon.
- [ ] `article-list`
- [ ] Write `_promo-banner.json`, `_trip-cards.json` (container + item + filter), `_faq.json` (container + item) and `_article-list.json` (config fields).
- [ ] Extend **Columns** with a **Layout** `select` (`classes`): Equal (default), 75-25, 25-75, 40-30-30, 50-25-25, 25-25-50, 25-50-25. CSS changes the widths; images must never distort (`object-fit`/`aspect-ratio`).
- [ ] Add a per-item **Width** select to `trip-cards` (for example `cardw-50`, `cardw-25`), so a row can be 50-25-25.
- [ ] Extend the **Section** model's `style` multiselect with **Highlight**, **Centered** and **Dark** (`theme-dark`) and style them globally.
- [ ] Add an **Alignment** select (Left/Center/Right) to the Title and Text models.
- [ ] Update the section filter so the new blocks can be added.
- [ ] Author a full **Summit home page** in UE with every block, and verify live editing: redecoration happens and fields stay editable after DOM changes.

### 5.3 Acceptance Criteria
- `npm run build:json && npm run lint` pass, including the xwalk ESLint rules (such as **max 4 cells** per block).
- Every block can be added, edited, reordered and deleted in UE with no console errors.
- The trainee knows the **Columns naming rule**: a columns-type block name must start with "Columns", or UE fails with `Cannot read properties of undefined (reading 'modelId')`.

---


## 6. Module 4: Dynamic and Data-Driven Blocks (Week 5 )

### 6.1 Query Index Listing (extend `article-list`)
- [ ] Configure the query index: `helix-query.yaml` or the config service for doc projects; the `query-index` sheet for Drive.
- [ ] Add at least one custom column, for example `category` from `<meta name="category">`. Note that hyphenated meta names become camelCase in the index.
- [ ] Render descendants of the configured parent. Add **Sort** (Newest, Oldest, Title A–Z, Title Z–A), **Load more** paging, and **keyword/category facets** (OR within a facet).
- [ ] Hide the Filters UI when there are no facet values. Handle "No pages found".
- [ ] **UE-specific:** normalise author paths (`/content/<site>/…`) against EDS paths (`/…`) so the list fills on the author instance too.


### 6.4 Third-Party REST API Block
- [ ] `news-listing`: Use any mock API to pull in dynamic data.
- [ ] Render the data in form of a list and a presentable UI. Refer legacy sites for UI.

### 6.5 Acceptance Criteria
- All dynamic blocks work on `localhost`, `.aem.page` and (Track A) the author instance.
- No uncaught promise rejections; network failures are handled and visible to the user.
- The Lighthouse performance score stays ≥ 95 with the dynamic blocks on the page.

---

## 7. Module 5: Delivery Workflow and Troubleshooting Lab (Week 5)

### 7.1 Delivery Workflow
- [ ] Feature branch, then PR. The PR description **must** include a `https://<branch>--<repo>--<owner>.aem.page/<path>` link that demonstrates the change.
- [ ] `gh pr checks`: Code Sync, lint and performance all pass.
- [ ] Peer code review, using a checklist: scoping, a11y, no dependencies, handles missing fields, README present.
- [ ] Preview then publish; cache behavior; how to **roll back** (revert the commit, or unpublish).
- [ ] Use the **Admin API** for status, preview and publish of a page (read the docs; no secrets in scripts).

---

## 8. Reference Resources

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


## Checklist

### Trainee Submission Checklist
- [ ] Module 0: two repos previewing on `main` and on a feature branch
- [ ] Module 1: four-pattern blocks with READMEs and draft test pages
- [ ] Module 2: the same page authored in DA.live and Google Docs; sheets for placeholders, redirects, metadata and data
- [ ] Module 3: UE models, Columns layouts, card widths, section styles, alignment; `build:json` and lint pass
- [ ] Module 4: Dynamic and Data-Driven Blocks , REST API block with loading/error/empty states, secret-key design write-up
- [ ] Module 5: Delivery Workflow - PRs with preview links, repo, URLs.

---
