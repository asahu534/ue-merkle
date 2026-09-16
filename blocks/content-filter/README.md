# Content Filter

A faceted, client-side content archive. Authors add result cards (each with an
optional image, a content-type label, a title, a "Read more" link, and a set of
facet tags). The block builds a filter panel from the union of tags across all
cards, filters the grid in-browser, and paginates the results with a "Load more"
button.

## Why client-side

Edge Delivery Services has no live backend feed for this section. Instead of a
query index, the listing items are **authored content**. Facets are derived from
the tags on those items, so the filter panel always matches the content present.

## Authoring model (container + items)

- **Content Filter** (container) — insert the block, then add **Filter Item**
  children.
- **Filter Item**:
  - **Image** (optional) — asset reference for the card thumbnail.
  - **Image Alt** — alt text for the image.
  - **Text** (richtext) — the content-type label, the title (heading), and a
    "Read more" link, e.g.

    ```
    Blog Post
    ## Retail's AI Window Is Open
    [Read more](/en/merkle-now/articles-blogs/…)
    ```

  - **Facet Tags** (text) — semicolon-separated groups, comma-separated values:

    ```
    Content Type: Blog Post; Industries: Retail & Consumer Goods; Partners: Adobe
    ```

    Supported groups: `Content Type`, `Industries`, `Capabilities`, `Partners`,
    `Country`. Any value present on at least one item appears as a checkbox in
    that group. The visible content-type label is automatically treated as a
    `Content Type` value if the tags omit one.

## Behaviour

- **Filters** toggle opens/closes the facet panel.
- Checking options filters the grid (AND across groups, OR within a group).
- **Show All** clears the selection; **Apply Filter** closes the panel.
- Result count ("Showing X of Y") updates live.
- **Load more** reveals the next page (12 cards) of the current result set.
- With JavaScript disabled the raw cards render as a plain list (graceful
  fallback).

## Files

- `content-filter.js` — decoration, tag parsing, filtering, pagination.
- `content-filter.css` — toolbar, filter panel, responsive card grid.
- `_content-filter.json` — Universal Editor component definition, model, filter.
