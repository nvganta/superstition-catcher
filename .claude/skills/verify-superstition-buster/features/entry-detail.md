## Sub-features

Entry pages at `/superstition/[id]`, read from the `entries` collection. Sections: the default, why it started, why it stuck, what's changed since, a fresh look (optional), how sure are we (confidence), sources, fun fact (legacy entries).

## How to get to it (user POV)

Open `/superstition/<slug>` from search, explore, a category page, or home cards.

## Driving it with Playwright

`page.goto('http://127.0.0.1:3000/superstition/lemons-chillies-door')` and assert `page.getByRole('heading', { name: 'Hanging Lemons & Chillies at Doorways' })` and `getByRole('heading', { name: 'WHY IT STUCK', exact: true })`.

## Gotchas

Needs a prepared database. `npm run dev:local` provides one. An entry whose `status` is not `live` returns 404. Next's route announcer also has `role="alert"`, so scope alert locators with `:not(#__next-route-announcer__)`.
