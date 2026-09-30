# Roadmap

## Vision

Shift from myth-busting to a **living record of cultural drift** — traditions as inherited defaults worth revisiting.

---

## Wave 1 — Data model ✅ (this branch)

- [x] Zod schemas for all core collections
- [x] Category taxonomy + mapping from legacy 7 categories
- [x] Entry migration from static seed + legacy DB
- [x] `entryVersions` snapshots
- [x] Index script (idempotent)
- [x] Guardrails module (PII, slurs, spam, field limits)
- [x] Rate limit module (not routed yet)
- [x] `GET /api/categories`
- [x] Tests + docs

## Wave 2 — Read paths + posting

- [ ] Switch pages/API from `superstitions.ts` to `entries` collection
- [ ] Community entry POST (instant live) with guardrails + rate limits
- [ ] Curated entry admin flow with confidence + sources requirement
- [ ] Search/index on new entry fields

## Wave 3 — Community features

- [ ] Flags collection wired to moderation queue
- [ ] Broken Chain (`chainEntries`) go-live UI
- [ ] Reactions redesign (`rate` | `save` | `hide`)
- [ ] `flagCount` / status transitions

## Wave 4 — Intelligence + API

- [ ] AI notes (Anthropic SDK) on entries
- [ ] Public data API
- [ ] Editorial dashboard for migration flags + review queue
- [ ] Multi-locale slur lists

---

## Legacy → Entry field mapping

| Legacy | Entry |
|--------|-------|
| `whatPeopleBelieve` | `theDefault` |
| `historicalOrigin` | `whyItStarted` |
| `theRealReason` | `whyItStuck` (+ `legacy.theRealReason`) |
| `modernTwist` | `whatsChangedSince` |
| `verdict`, `funFact`, `category` | `legacy.*` |
| `category` | `categorySlugs[]` via mapping table |
