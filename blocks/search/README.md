# Search

A client-side site search block. It fetches `/query-index.json` once and searches
it entirely in the browser, so results, suggestions, and filters all update
**without a page refresh**.

## Features

- **Type-ahead suggestions** while typing (built from the query index — page
  titles/keywords), keyboard-navigable (↑/↓/Enter/Esc).
- **Full-text match** across each page's `title`, `description`, and `keywords`
  (case-insensitive; every typed word must match).
- **Keyword facets** — a filter panel is auto-built from the query index
  `keywords` column (omitted if no pages carry keywords).
- **Trending Topics** chips shown before a search is run; clicking one runs that
  search.
- **Result count**, paginated results ("Load more"), and full-tile clickable
  result cards.
- The active query is reflected in the URL (`?q=`) so a searched page is
  shareable; visiting a `?q=` URL pre-runs the search.

## Authoring fields

| Field | Description |
| --- | --- |
| Heading | Optional heading above the search box. |
| Placeholder | Placeholder text inside the empty search box. |
| Trending Topics | Comma-separated quick-search chips. |
| Results Per Page | Results revealed per "Load more" click (default 6). |
| Suggestion Limit | Max type-ahead suggestions shown (default 6). |

## Notes

- Search quality is bounded by what `/query-index.json` exposes (title,
  description, keywords, path). Body-copy full-text search would need a
  dedicated index.
- All results link to pages on this site; no external services are called.
