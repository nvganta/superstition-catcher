# Data Model

Wave 1 schema for the cultural-drift entry model. Types live in `src/lib/schema/`; MongoDB is the runtime source of truth after migration.

## Entry

Central document. Stable slug `id` preserves legacy superstition ids (e.g. `lemons-chillies-door`).

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique slug |
| `title` | string | Max 200 |
| `country` | string | |
| `countryFlag` | string | Emoji |
| `region` | enum | `india`, `japan`, `china`, `middleEast`, `europe`, `americas`, `africa` |
| `categorySlugs` | string[] | Min 1; see Categories |
| `tags` | string[] | Max 20 |
| `theDefault` | string | What people inherit/believe |
| `whyItStarted` | string | Historical origin |
| `whyItStuck` | string | Why the default persisted |
| `whatsChangedSince` | string | Modern drift |
| `freshLook` | string? | Optional rethink prompt |
| `sources` | Source[] | `{ title, url?, kind: book\|paper\|oral\|web }` |
| `confidence` | enum? | `established`, `likely`, `speculative` |
| `uncertaintyNote` | string? | |
| `origin` | enum | `community` \| `curated` |
| `status` | enum | `live`, `flagged`, `underReview`, `hidden`, `removed` |
| `postedByVisitorId` | uuid? | Community author |
| `postedBy` | string? | Display name |
| `flagCount` | number | Denormalized counter |
| `version` | number | Incremented on edit |
| `legacy` | object? | `{ verdict, theRealReason, funFact?, legacyCategory }` |
| `createdAt`, `updatedAt` | Date | |

**Validation:** Curated entries require `confidence` and (≥1 source **or** `legacy`). Community entries do not.

## EntryVersion

| Field | Type |
|-------|------|
| `entryId` | string |
| `version` | number |
| `snapshot` | Entry fields minus timestamps |
| `createdAt` | Date |

Unique on `(entryId, version)`.

## Category

| Field | Type |
|-------|------|
| `slug` | string |
| `label` | string |
| `description` | string |
| `sortOrder` | number |
| `parentSlug` | string? |

### Life areas (seed)

`job`, `education`, `family`, `health`, `money`, `marriage`, `food`, `home`, `deathRites`, `numbers`, `animals`, `travel`, `religionRituals`

### Legacy mapping

| Legacy `Category` | New slug(s) |
|-------------------|-------------|
| `numbers` | `numbers` |
| `animals` | `animals` |
| `foodAndEating` | `food` |
| `deathAndAfterlife` | `deathRites` |
| `marriageAndLove` | `marriage` |
| `homeAndDaily` | `home` |
| `travelAndJourney` | `travel` |

## Flag (Wave 3 wiring)

| Field | Type |
|-------|------|
| `targetType` | `entry` \| `chainEntry` |
| `targetId` | string |
| `entryId` | string |
| `visitorId` | uuid |
| `reason` | `inaccurate`, `offensive`, `personalInfo`, `spam`, `other` |
| `note` | string? |
| `createdAt` | Date |
| `resolvedAt` | Date? |

Unique on `(targetType, targetId, visitorId)`.

## Reaction (Wave 3 wiring)

| Field | Type |
|-------|------|
| `entryId` | string |
| `visitorId` | uuid |
| `kind` | `rate` \| `save` \| `hide` |
| `value` | number \| boolean \| string |

Unique on `(entryId, visitorId, kind)`.

## ChainEntry

Broken Chain community story.

| Field | Type |
|-------|------|
| `id` | uuid |
| `entryId` | string |
| `visitorId` | uuid |
| `name` | string |
| `text` | string (max 2000) |
| `status` | entry status enum |
| `flagCount` | number |
| `region` | region enum? |
| `generationBand` | enum? |
| `researchConsent` | boolean? |
| `createdAt`, `updatedAt` | Date |

Unique on `(entryId, visitorId)`.

## AiNote (Wave 4)

| Field | Type |
|-------|------|
| `id` | uuid |
| `entryId` | string |
| `kind` | `summary`, `sourceSuggestion`, `editorialHint`, `freshLookDraft` |
| `content` | string |
| `model` | string? |
| `createdAt`, `updatedAt?` | Date |

## Visitor

| Field | Type |
|-------|------|
| `id` | uuid |
| `createdAt` | Date |
| `lastSeenAt` | Date? |

## RateLimit

| Field | Type |
|-------|------|
| `visitorId` | uuid |
| `action` | `newEntry`, `chainStory`, `flag`, `post` |
| `count` | number |
| `windowStart` | Date |
| `lastPostAt` | Date? |
| `expiresAt` | Date (TTL) |

### Limits

- 5 new entries / visitor / day
- 10 chain stories / visitor / day
- 20 flags / visitor / day
- 30s minimum between any posts

## Indexes

See `scripts/ensure-indexes.ts`. All index creation is idempotent.
