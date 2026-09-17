# Blog List

A faceted, sortable page archive. The author selects a **parent page**; the
block lists **all descendant pages** of that parent (any depth) by reading
`/query-index.json` at render time, then presents them as clickable tiles with a
filter panel, a sort control, a live result count, and a "Load more" button.

## Data source

Rows come from the site's query index (`/query-index.json`). The block keeps
every row whose `path` starts with the selected parent path (excluding the
parent itself). Facets and sort values are read from indexed page metadata, so
the archive stays in sync with the actual published pages — no per-item
authoring.

## Authoring model

Insert **Blog List** and set:

- **Parent Page** (page picker) — the page whose descendants are listed.
- **Heading** (optional) — shown above the list (e.g. "Find something specific").
- **Default Sort** — Newest first / Oldest first / Title (A–Z) / Title (Z–A).
- **Page Size** — how many cards to reveal per "Load more" (default 12).

## Facets

Built from the default `keywords` query-index column — every distinct keyword
across the listed pages becomes one checkbox. For facets to appear, child pages
must carry `<meta name="keywords" content="…">` (comma-separated) and be
published, so the query index (owned by the EDS Configuration Service) exposes
them. When the listed pages carry no keywords, the **Filters** control is hidden
entirely — only Sort and the list are shown.

## Behaviour

- **Filters** toggle opens/closes the keyword facet panel (shown only when the
  listed pages have keywords).
- Checking keywords filters the grid (a page matches if it has any selected
  keyword — OR).
- **Sort** reorders the results (Newest/Oldest use `lastModified`; Title uses
  the page title).
- **Show All** clears the selection; **Apply Filter** closes the panel.
- Result count ("Showing X of Y") updates live.
- **Load more** reveals the next page of the current result set.
- If no parent is set or the fetch fails, a short message is shown.

## Files

- `blog-list.js` — config read, query-index fetch, filtering, sorting, pagination.
- `blog-list.css` — toolbar, sort, filter panel, responsive card grid.
- `_blog-list.json` — Universal Editor component definition and model.
