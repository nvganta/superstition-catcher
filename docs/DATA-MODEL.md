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

**Writes (Wave 2):** community posts are inserted `live` at version 1. Admin edits are optimistic on `version`: the edit must name the current version, the entry is replaced with `version + 1`, and the new version is snapshotted to `entryVersions`.

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

## Moderation (Wave 3)

Entries and chain stories share one status machine, `STATUS_TRANSITIONS` in `src/lib/moderation/statusMachine.ts`. `applyStatusEvent` is the only code that changes `status`. It refuses any (status, event, actor) the table lacks, updates conditionally on the status it read, and appends a `statusTransitions` record. Admin content edits never touch `status` or `flagCount`.

| From | Event (actor) | To |
|------|---------------|----|
| `live` | `flagThresholdReached` (system) | `flagged` |
| `live` | `dismissFlags` (admin) | `live` |
| `live`, `flagged` | `startReview` (admin) | `underReview` |
| `flagged`, `underReview`, `hidden` | `restore` (admin) | `live` |
| `live`, `flagged`, `underReview` | `hide` (admin) | `hidden` |
| `live`, `flagged`, `underReview`, `hidden` | `remove` (admin) | `removed` |

`removed` is terminal. Restore and dismiss resolve the target's open flags as `dismissed`; hide and remove resolve them as `upheld`. Public pages and APIs show only `live`, so a `flagged` target leaves public pages at once, and the chain and reactions under an entry that is not live return 404.

`FLAG_THRESHOLD` is 2 open flags from distinct visitors. Reaching it moves a live community entry or chain story to `flagged`. Curated entries were reviewed before going live, so flags queue them for review but never hide them. Past `MAX_SYSTEM_TAKEDOWNS_PER_HOUR` (10) automatic takedowns in an hour, flags only queue targets, so minted visitor ids cannot empty the site. `flagCount` on the target is its open flags, kept by `$inc` on each flag and `-n` when a transition resolves `n`; the threshold itself reads the open flags, not the counter.

## Flag

| Field | Type |
|-------|------|
| `targetType` | `entry` \| `chainEntry` |
| `targetId` | string (entry `id` or chain entry `id`) |
| `entryId` | string |
| `visitorId` | uuid |
| `reason` | `inaccurate`, `offensive`, `personalInfo`, `spam`, `other` |
| `note` | string? (max 500, admin-only, slurs and spam blocked) |
| `createdAt` | Date |
| `resolvedAt` | Date? |
| `resolution` | `dismissed` \| `upheld`? |

Unique on `(targetType, targetId, visitorId, resolvedAt)`, so a visitor holds one open flag per target and can report again once an admin resolves it. Flags have a 20-a-day cap but skip the 30-second posting interval.

## StatusTransition

Append-only log of every status change.

| Field | Type |
|-------|------|
| `targetType`, `targetId`, `entryId` | as Flag |
| `event` | `flagThresholdReached`, `dismissFlags`, `startReview`, `restore`, `hide`, `remove` |
| `from`, `to` | status |
| `actor` | `system` \| `admin` |
| `at` | Date |

## Reaction

One document per (entry, visitor, kind), present only while set. Unsaving, unhiding or clearing a rating deletes it.

| Field | Type |
|-------|------|
| `entryId` | string |
| `visitorId` | uuid |
| `kind` | `rate` \| `save` \| `hide` |
| `value` | 1 to 5 for `rate`, `true` for `save` and `hide` |
| `legacyType` | `like` \| `dislike` \| `mind_blown`? (set only by the migration, cleared on re-rate) |
| `createdAt`, `updatedAt` | Date |

Unique on `(entryId, visitorId, kind)`. A `hide` drops the entry from that visitor's home, explore, category and related lists. The entry page itself still opens.

### Legacy reaction mapping

`scripts/migrate-reactions.ts` converts the pre-Wave-3 documents (`{ superstitionId, type, visitorId, createdAt }`) in `reactions`:

| Legacy `type` | New reaction |
|---------------|--------------|
| `mind_blown` | `rate` 5 |
| `like` | `rate` 4 |
| `dislike` | `rate` 2 |

`superstitionId` becomes `entryId` (migrated entries keep their ids). A rating the visitor already set on the new scale wins. Every legacy document, converted or not, is copied to `legacyReactions` and then deleted from `reactions`. Documents whose superstition no longer exists, or with a malformed visitor id, are archived without converting. It must run before `ensure-indexes`, whose unique reactions index cannot be built while one visitor has two legacy documents.

## ChainEntry

One visitor's Broken Chain answer for one entry.

| Field | Type |
|-------|------|
| `id` | uuid |
| `entryId` | string |
| `visitorId` | uuid |
| `passedDown` | boolean (was it handed to them) |
| `kept` | boolean (do they keep it today) |
| `story` | `{ text (max 2000), name? }`? |
| `region` | region enum? |
| `generationBand` | `genZ`, `millennial`, `genX`, `boomer`, `silent`, `unknown`? |
| `researchConsent` | boolean? |
| `status` | entry status enum |
| `flagCount` | number |
| `createdAt`, `updatedAt` | Date |

Unique on `(entryId, visitorId)`. Answers are upserts against that index, so a second answer from the same visitor updates the first. Every story change passes the guardrails; a new story also counts against the chain-story rate limit, while rewording your own does not. Moderation status gates the story only: the tally counts every answer, the public story list shows `live` ones, and neither carries `visitorId`.

## Visitor identity

The browser keeps its visitor id in the `sb-visitor-id` cookie (carried over from localStorage for older visitors). Every route reads the visitor from the cookie and ignores any `visitorId` in the body. No public response or page carries a visitor id.

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

Chain answers without a story are not rate limited, since the unique index caps them at one per entry.

- 5 new entries / visitor / day
- 10 chain stories / visitor / day
- 20 flags / visitor / day
- 30s minimum between any posts

## Indexes

See `scripts/ensure-indexes.ts`. All index creation is idempotent.

`entries` carries `entries_text`, a text index over `title` (weight 10), `tags` and `country` (5), `theDefault` (3), and `whyItStarted`, `whyItStuck`, `whatsChangedSince`, `freshLook` (1). Search requires it.
