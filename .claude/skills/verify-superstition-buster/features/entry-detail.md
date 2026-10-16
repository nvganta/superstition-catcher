## Sub-features

Static curated entry pages at `/superstition/[id]`.

## How to get to it (user POV)

Open `/superstition/<slug>` from search, explore, or home cards.

## Driving it with Playwright

`page.goto('http://127.0.0.1:3000/superstition/' + id)` and assert `page.getByRole('heading', { name: title })`.

## Gotchas

Wave 1 reads `src/data/superstitions.ts`; DB is not required for this path.
