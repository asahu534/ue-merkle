Let me inspect how default content (title/text) and sections are modeled to plan the alignment feature accurately.# Add Text Alignment — Section-level + per Title/Text block

## Goal
Let authors center (or left/right-align) the "Merkle Now" heading and its supporting paragraph — the way rich-text alignment works in traditional AEM. Provide alignment at **two levels**, per your choice:
- **Section-level** — a "Centered" style on the Section so all default content in it aligns, and
- **Per-block** — an **Alignment** select on the **Title** and **Text** components so an individual heading/paragraph can be aligned or override the section.

## Current state (verified)
- **Section** (`models/_section.json`): `style` is a `multiselect` with one option (`Highlight`) → applied as a section CSS class. Easy to add `Centered`.
- **Title** (`models/_title.json`): has `title` + `titleType` fields, resourceType `title/v1/title`. No alignment field.
- **Text** (`models/_text.json`): resourceType `text/v1/text`, **`models: []`** — the core Text component has **no model**, so there's no properties panel to add an Alignment field to yet. Adding per-text alignment requires giving Text a model with a `classes`/alignment field.
- Alignment must render via CSS: xwalk applies a model field named `classes` as CSS classes on the component; section `style` values already render as classes on the `.section`.

## Design

### A. Section-level "Centered"
- Add a `Centered` option (value `centered`) to the Section `style` multiselect (`_section.json`).
- CSS (global `styles/styles.css` or section styles): `.section.centered` → center its default-content text (headings, paragraphs, and center block content like buttons where appropriate).

### B. Per-block Alignment on Title
- Add an `alignment` field to the `title` model as a `classes`-backed select: Left (default/empty), Center (`align-center`), Right (`align-right`). Rendered as a class on the title element.
- CSS: `.align-center { text-align: center; }`, `.align-right { text-align: right; }` (shared, reusable classes).

### C. Per-block Alignment on Text (requires giving Text a model)
- Text currently has no model. Add a `text` model with a `classes` alignment select (same Left/Center/Right options) and wire the definition's template to `model: "text"`.
- Verify the core `text/v1/text` resourceType accepts a model with a `classes` field so alignment renders as a class on the text wrapper. (If the platform doesn't support a model on core Text, fall back to section-level centering for text — flagged below.)

### D. Shared alignment CSS
- Define reusable `.align-center` / `.align-right` (and implicit left default) once (in `styles/styles.css`), used by both Title and Text classes, plus the `.section.centered` rule for the section-level path.

### E. Verify + build
- `npm run build:json`; `npm run lint`.
- Preview: a section set to Centered centers the "Merkle Now" title + paragraph; a Title/Text with Alignment=Center centers independently; left/right work; default (unset) stays left.

## Open considerations (flagged)
- **Core Text has no model today.** Adding one (`model: "text"` + `classes` field) is the way to expose per-text alignment in Universal Editor. This is a change to a core default-content component — low risk, but it means Text gains a properties panel where it had none. If you'd rather not modify core Text, the section-level "Centered" alone will still center the text (since it centers all default content in the section).
- **Precedence:** per-block alignment (on Title/Text) overrides the section default via normal CSS (component class is more specific than the section rule) — so a centered section can still contain a left-aligned block if desired.
- This is authoring/design only — no importer or content regeneration involved; existing pages are unaffected unless an author sets the new options.

## Checklist

### 1. Section-level Centered
- [ ] Add `Centered` (value `centered`) to the Section `style` multiselect in `models/_section.json`
- [ ] Add `.section.centered` rule (center default-content text) — in `styles/styles.css`

### 2. Title alignment
- [ ] Add an `alignment` select (Left `''` / Center `align-center` / Right `align-right`) to the `title` model as a `classes`-backed field in `models/_title.json`

### 3. Text alignment (give Text a model)
- [ ] Add a `text` model with a `classes` alignment select to `models/_text.json`; set the Text definition template `model: "text"`
- [ ] Verify core `text/v1/text` renders the `classes` field as a class; if unsupported, note fallback to section-level centering for text

### 4. Shared CSS
- [ ] Add reusable `.align-center` / `.align-right` rules (left = default) in `styles/styles.css`, used by Title/Text alignment classes

### 5. Build, verify, docs
- [ ] `npm run build:json`; confirm `centered` in section style, `alignment` in title model, `text` model present
- [ ] `npm run lint` passes
- [ ] Preview: section Centered centers title+text; per-block Center/Right/Left work and override the section; default stays left
- [ ] Note usage in any relevant README/metadata

### 6. Hand off (no auto-commit)
- [ ] Report changes; leave staging/commit/push to the user

## Notes
- Two levels of control as requested: **Section "Centered"** (whole-section) **and per-block Alignment** on Title/Text (rich-text-style, overrides section).
- Adding per-text alignment means giving the core **Text** component a model for the first time — flagged so it's a conscious change; section-level centering is the no-core-change fallback if preferred.
- Alignment renders purely via CSS classes (xwalk `classes` field / section `style`), consistent with how `Highlight` already works.
- Per your standing preference, I will **not commit or push** — changes left in the working tree.
- **Execution requires Execute mode** — this plan makes no file changes yet.
