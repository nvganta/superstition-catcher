import type { EntryStatus } from '@/lib/schema/common';
import type { FlagResolution } from '@/lib/schema/flag';
import type { StatusActor, StatusEvent } from '@/lib/schema/statusTransition';

/**
 * Open flags from distinct visitors that take a live community entry or chain story off public
 * pages. Community content goes live with no pre-review, so two is the lowest count where one
 * visitor alone can never take something down, while a phone number or a slur that slipped past
 * the guardrails leaves after the second report. Visitor ids are made by the browser, so a
 * determined person can reach two alone. That is the price of acting fast, and it is why curated
 * entries never hide on flags and why an admin restore is one click that dismisses those flags.
 */
export const FLAG_THRESHOLD = 2;

/**
 * A brake on the threshold. Fresh visitor ids cost nothing, so a script could take every community
 * entry offline two requests at a time. Past this many automatic takedowns in the last hour, flags
 * still queue targets for an admin but no longer hide them.
 */
export const MAX_SYSTEM_TAKEDOWNS_PER_HOUR = 10;

/** Every allowed status change. A (status, event) pair missing here is refused. */
export const STATUS_TRANSITIONS: Record<EntryStatus, Partial<Record<StatusEvent, EntryStatus>>> = {
  live: {
    flagThresholdReached: 'flagged',
    dismissFlags: 'live',
    startReview: 'underReview',
    hide: 'hidden',
    remove: 'removed',
  },
  flagged: { startReview: 'underReview', restore: 'live', hide: 'hidden', remove: 'removed' },
  underReview: { restore: 'live', hide: 'hidden', remove: 'removed' },
  hidden: { restore: 'live', remove: 'removed' },
  removed: {},
};

export const EVENT_ACTORS: Record<StatusEvent, StatusActor> = {
  flagThresholdReached: 'system',
  dismissFlags: 'admin',
  startReview: 'admin',
  restore: 'admin',
  hide: 'admin',
  remove: 'admin',
};

/** What an event decides about the flags still open on the target. */
export const FLAG_RESOLUTIONS: Partial<Record<StatusEvent, FlagResolution>> = {
  dismissFlags: 'dismissed',
  restore: 'dismissed',
  hide: 'upheld',
  remove: 'upheld',
};

/** Statuses a visitor can still flag. Flags on flagged or under-review targets add evidence without moving them. */
export const FLAGGABLE_STATUSES: readonly EntryStatus[] = ['live', 'flagged', 'underReview'];

export function nextStatus(from: EntryStatus, event: StatusEvent, actor: StatusActor): EntryStatus | null {
  if (EVENT_ACTORS[event] !== actor) {
    return null;
  }
  return STATUS_TRANSITIONS[from][event] ?? null;
}

/** The buttons an admin gets. Dismissing makes sense only while reports are open. */
export function adminEvents(status: EntryStatus, hasOpenFlags: boolean): StatusEvent[] {
  return (Object.keys(STATUS_TRANSITIONS[status]) as StatusEvent[]).filter(
    (event) => EVENT_ACTORS[event] === 'admin' && (event !== 'dismissFlags' || hasOpenFlags)
  );
}
