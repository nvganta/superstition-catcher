# Public data API (v1)

Read-only JSON over HTTPS. No key needed. Every route answers `GET` and a CORS preflight (`OPTIONS`), sends `Access-Control-Allow-Origin: *`, and is cached for 60 seconds in browsers and 5 minutes at the CDN (`Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600`). Errors are not cached.

Only live entries appear. The API never returns visitor ids, flags, moderation status, AI notes or the legacy migration fields.

Errors share one shape, with a status code to match:

```json
{ "error": "invalid", "message": "Some query parameters are not valid.", "issues": [{ "field": "region", "message": "..." }] }
```

## `GET /api/v1/entries`

Lists live entries, newest first.

| Parameter | Values | Default |
|-----------|--------|---------|
| `region` | `india`, `japan`, `china`, `middleEast`, `europe`, `americas`, `africa` | any |
| `category` | a category slug from `/api/v1/categories` | any |
| `origin` | `community` or `curated` | any |
| `page` | 1 or more | 1 |
| `limit` | 1 to 100 | 20 |

An unknown `region` or `origin`, or a `limit` above 100, answers `400`. An unknown `category` matches nothing.

```bash
curl 'https://<host>/api/v1/entries?region=india&limit=5'
```

```json
{
  "data": [
    {
      "id": "lemons-chillies-door",
      "url": "https://<host>/superstition/lemons-chillies-door",
      "title": "Lemons and chillies on the door",
      "country": "India",
      "countryFlag": "🇮🇳",
      "region": "india",
      "categorySlugs": ["home"],
      "tags": [],
      "theDefault": "…",
      "whyItStarted": "…",
      "whyItStuck": "…",
      "whatsChangedSince": "…",
      "sources": [],
      "confidence": "likely",
      "origin": "curated",
      "version": 1,
      "createdAt": "2026-11-23T09:00:00.000Z",
      "updatedAt": "2026-11-23T09:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 5, "total": 12, "totalPages": 3 }
}
```

Optional fields (`freshLook`, `confidence`, `uncertaintyNote`, `postedBy`, a source's `url`) are left out when empty. `confidence` is `established`, `likely` or `speculative`; community entries usually have none, since the editors have not reviewed them.

## `GET /api/v1/entries/:id`

One live entry in the same shape, plus its Broken Chain tally. Answers `404` when no live entry has that id.

```bash
curl 'https://<host>/api/v1/entries/lemons-chillies-door'
```

```json
{
  "data": {
    "id": "lemons-chillies-door",
    "…": "…",
    "chain": { "keptIt": 4, "droppedIt": 9, "pickedItUp": 1, "neverHadIt": 3 }
  }
}
```

The four counts are the Broken Chain answers: handed down and kept, handed down and dropped, picked up without being handed down, and never had it.

## `GET /api/v1/categories`

```json
{
  "data": [
    { "slug": "food", "label": "Food", "description": "…", "entryCount": 7 }
  ]
}
```

`entryCount` counts live entries. Categories come in display order.

## `GET /api/v1/chain`

Broken Chain answers across every live entry, overall and by the answerer's own region and generation. `unspecified` collects answers that gave none.

```json
{
  "data": {
    "answers": 17,
    "tally": { "keptIt": 4, "droppedIt": 9, "pickedItUp": 1, "neverHadIt": 3 },
    "byRegion": { "india": { "keptIt": 3, "droppedIt": 6, "pickedItUp": 0, "neverHadIt": 1 }, "unspecified": { "…": 0 } },
    "byGeneration": { "genZ": { "…": 0 }, "unspecified": { "…": 0 } }
  }
}
```

## Limits

There is no per-IP rate limit in the app yet. The CDN cache absorbs repeated requests; a platform firewall rule is the intended limit (see LOG.md).
