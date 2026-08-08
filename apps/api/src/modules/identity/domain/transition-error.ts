import type { UserStatus } from './user-status.js';

/**
 * A rejected state change. (ADR-0029)
 *
 * Carries a machine-readable `code` so the interface layer maps it to an HTTP status
 * and a localised message without string-matching the text. ADR-0049's requirement
 * that a refusal be explainable applies here too: "403" alone leaves a user unable to
 * tell a missing permission from an illegal transition from a missing reason.
 *
 * A plain Error subclass, deliberately — no framework exception type, because this is
 * the domain layer (ADR-0006).
 */
export type TransitionErrorCode =
  | 'SELF_TRANSITION'
  | 'TERMINAL_STATE'
  | 'ILLEGAL_TRANSITION'
  | 'REASON_REQUIRED'
  | 'SELF_ACTION'
  | 'LAST_ACTIVE_ADMIN';

export class TransitionError extends Error {
  readonly from: UserStatus;
  readonly to: UserStatus;
  readonly code: TransitionErrorCode;

  constructor(
    message: string,
    details: { from: UserStatus; to: UserStatus; code: TransitionErrorCode },
  ) {
    super(message);
    this.name = 'TransitionError';
    this.from = details.from;
    this.to = details.to;
    this.code = details.code;
  }
}
