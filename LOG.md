# LOG.md

The founder's memory. Read this first every session. Update it before ending
any working session. Newest entries at the top.

## Status

- State: active
- Local URL: running on `http://localhost:3000` (Next.js 16.3.3 Turbopack)
- Live URL: unknown, verify whether the last deploy is still up
- Stranger test: unknown, the product was near polish stage when it stopped
- Currently working on: The Broken Chain and AI origin research, on branch `broken-chain`. Fixed next.config.ts turbopack root (removed hardcoded Mac path); local server tested and answering 200 OK. Typecheck, lint, and `next build` all pass; dependency advisories at zero.
- Blocked on investor: (1) an `ANTHROPIC_API_KEY` in the deploy environment, the origin-research button 503s without one and nothing else breaks; (2) authorize the Vercel connector so I can find the live URL and check whether the last deploy is still up, it refused in a non-interactive session; (3) merge `broken-chain` when you want it live

## Decisions

- 2026-08-27: Revive approved. The Broken Chain built, plus AI origin research.
- 2026-08-27: Investor delegated product calls to me. Decisions below are mine, not asks.
- 2026-08-27: Origin drafts stay admin-only for now. Revisit after ~20 real drafts, when the hallucination rate is measured rather than guessed. Trigger to flip public: if fewer than 2 of 20 drafts contain an invented specific claim, show them to submitters with the confidence badge attached.
- 2026-08-27: Upgraded Next 16.1.6 -> 16.3.3 and cleared every advisory (34 -> 0). The remaining production highs were Next itself: middleware/proxy bypass, cache poisoning, SSRF. Not shippable on a revived site. Verified with typecheck, lint, and build after the bump.
- 2026-08-27: Fixed the "superstition of the day" hydration bug. The page is prerendered, so `Date.now()` during render froze the pick at build date in the HTML while the client computed the current one, mismatching from the next morning on. Now uses `useSyncExternalStore` with a server snapshot of index 0.
- 2026-08-27: SearchBar now derives results during render instead of setState-in-effect, which removes a render pass per keystroke. Lint is at zero problems, so `npx eslint src` is a usable gate again.
- 2026-08-27: Stance counts toward the public bar immediately; only the written story waits for approval. The stance is a four-value enum and can't be abused, so holding it back would have made the bar useless without protecting anything.
- 2026-08-27: One entry per visitor per superstition, enforced by upsert on (superstitionId, visitorId). The bar counts people, not posts. Re-submitting overwrites, so changing your mind is allowed.
- 2026-08-27: `/api/explain` is admin-gated and its output is never published directly. An invented origin sitting next to 42 researched ones would cost more trust than the feature earns, and an open LLM endpoint on an unauthenticated site is a billing incident waiting to happen.
- 2026-03-12: Mobile navbar shows only icons on small screens.
- Catalog copy lives in a static in-repo store (src/data/superstitions.ts, 42 entries, 7 regions). User-generated content (comments, reactions, submissions) is in MongoDB via src/lib/mongodb.ts. The earlier "no database" note was wrong and has been corrected.
- Scope has drifted past the FOUNDER.md mission: data covers India, Japan, China, Middle East, Europe, Americas, Africa, not India alone. Flagged to the investor 2026-08-27, not yet resolved.

## Session notes

- 2026-09-10: Prepared a draft PR from an isolated working tree. Repository handoff and staged-diff checks pass in the isolated PR tree. This documentation PR does not claim a new application runtime acceptance test.


- 2026-09-10: Added repository orientation, agent handoff, setup/check instructions and a documentation CI baseline. Existing implementation and historical evidence remain in place; the repository handoff check and git diff --check passed. Runtime acceptance was not rerun unless a separate entry below explicitly records it. See DEVELOPMENT.md for verification gaps.

- 2026-08-27 (build): Investor approved the revive and added a second ask: use AI to find out why a submitted superstition has been that way. Both built.
  The Broken Chain: `src/data/brokenChain.ts` (Stance enum, labels, colors, per-stance interview prompts, tally helpers, shared field limits), `/api/chain` (GET approved stories + tally, POST upsert), `/api/chain/pending` and `/api/chain/[id]` (admin queue, PATCH approve / DELETE reject), `/api/chain/tallies` (one aggregation for the whole board), `src/components/BrokenChain.tsx` (stance bar, stance-gated form, story list), wired into the case-file page between reactions and comments. New `/chains` board sorts the catalog by fading / changing / holding / most answered, linked in the navbar.
  Origin research: `/api/explain` calls `claude-opus-5` via the Anthropic SDK with a Zod structured output (`messages.parse` + `zodOutputFormat`). Returns a full case-file draft plus `confidence` and a required `uncertaintyNote`. Admin panel gained an "Investigate origin" button per submission and a DraftPanel that shows the caveat above the prose, with "Open in editor" loading it into the existing superstition form unsaved.
  The prompt's house rules exist for specific failure modes: don't invent history, and specifically don't invent a practical/sanitation rationale for beliefs that are purely symbolic, which is the exact pattern this catalog would over-teach a model. Also never sneer, and stay careful around caste, gender, menstruation, and death rites.
  Verified: `tsc --noEmit`, `eslint` (new files clean; 3 pre-existing errors remain in `src/app/page.tsx` and `SearchBar.tsx`), `next build`. NOT verified: no MONGODB_URI and no ANTHROPIC_API_KEY in this environment, so no request has been run end to end. First deploy needs a manual pass: post a chain entry, approve it, run one origin draft.
  Open question for the investor: whether origin drafts eventually show to the submitter instead of only the admin. Worth revisiting after ~20 drafts, when we know the real hallucination rate.

- 2026-08-27: Investor proposed a generational tradition-breaking angle: families who abandoned or altered a practice once the original reason stopped making sense. I scoped it as "The Broken Chain", a first-person testimony layer sitting alongside the authored `modernTwist` field. Shape: one short entry per person per superstition, tagged with one of four stances (still do it / stopped / changed how we do it / never knew why until today). The stance enum is the load-bearing part, it turns free text into a per-superstition aggregate bar and unlocks a "Broken Chains" browse view sorted by which traditions are fading fastest. Implementation reuses the /api/comments pattern (superstitionId key, visitorId identity) plus a new collection. Estimated a day.
  Two design positions I took: feature "we changed how we do it" over "stopped", because traditions mutate more often than they die and a stopped-count scoreboard would turn the site into mockery, which violates the core tone rule; and route entries through the existing admin approval queue rather than posting live, since these touch death rituals, menstruation taboos, and caste-adjacent practices.
  Not built. Awaiting the revive decision and the moderation call.

- 2026-08-25: Repo joined the Compass portfolio. LOG stamped and README rewritten by the investor's setup pass.
