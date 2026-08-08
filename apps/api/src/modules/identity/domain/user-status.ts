/**
 * User status and its legal transitions.  (ADR-0029, docs/mined/identity.md §5)
 *
 * The transition map is DATA, in one place. The predecessor had no transition table
 * for the opportunity stage field at all, so any stage could jump to any other
 * including backwards out of WON (C3), and client status was a free-form write from
 * four call sites with no reason and no audit (C4).
 *
 * (The old model's name for that field is deliberately not written here — the
 * glossary lint rejects it, and it caught this comment on the first run. Prior-art
 * names live in `docs/mined/identity.md` §6b, which is where a reader should go for
 * the mapping.)
 *
 * A hand-rolled map is deliberate over a state-machine library: this is a four-state
 * graph, and a dependency plus a modelling paradigm buys nothing (ADR-0029).
 */
export const USER_STATUSES = ['invited', 'active', 'suspended', 'archived'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/** Transitions that require a documented reason, stored NOT NULL (ADR-0029 clause 3). */
type Transition = { to: UserStatus; reasonRequired: boolean };

/**
 * `archived` is absent as a key: it is TERMINAL. Absence rather than an empty array,
 * so "can I leave archived?" and "is archived a state I forgot to define?" are the
 * same lookup and both answer no.
 */
export const USER_TRANSITIONS: Readonly<Partial<Record<UserStatus, readonly Transition[]>>> = {
  invited: [
    { to: 'active', reasonRequired: false }, // invite accepted, credentials set
    { to: 'archived', reasonRequired: true }, // invite revoked
  ],
  active: [
    { to: 'suspended', reasonRequired: true },
    { to: 'archived', reasonRequired: true },
  ],
  suspended: [
    { to: 'active', reasonRequired: true }, // reinstated
    { to: 'archived', reasonRequired: true },
  ],
} as const;

export function isTerminal(status: UserStatus): boolean {
  return USER_TRANSITIONS[status] === undefined;
}

export function findTransition(from: UserStatus, to: UserStatus): Transition | undefined {
  return USER_TRANSITIONS[from]?.find((t) => t.to === to);
}
