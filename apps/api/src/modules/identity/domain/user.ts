import {
  findTransition,
  isTerminal,
  type UserStatus,
} from './user-status.js';
import { TransitionError } from './transition-error.js';

/**
 * The User aggregate.  (ADR-0029 reference implementation, ADR-0007 Medium tier)
 *
 * Plain TypeScript. No decorators, no `@Injectable`, no import from `@nestjs/*`,
 * `drizzle-orm`, or any SDK — enforced by dependency-cruiser's
 * `no-vendor-in-domain-or-application` rule and by the domain purity check.
 *
 * **Status has no setter.** ADR-0029: "Status is never a writable field... A service
 * cannot bypass it, because the setter does not exist." That is the structural fix for
 * C4 (four call sites writing Client.classification free-form) and C3 (any stage
 * jumping to any other). `_status` is private and the only mutation path is
 * `transition()`.
 *
 * Time is injected, never read from the ambient clock (ADR-0018): a domain that calls
 * `new Date()` cannot be tested at a boundary, and every "works except at month end"
 * bug lives in code that reads the clock directly.
 */

export interface Actor {
  readonly userId: string;
  /** ADR-0024: system actors are `actor_id NULL` + `actor_type='system'`, never a fake user row. */
  readonly actorType: 'user' | 'system';
}

/** Facts the aggregate cannot know about itself, supplied by the use-case. */
export interface TransitionContext {
  readonly actor: Actor;
  readonly at: Date;
  readonly reason?: string | undefined;
  /**
   * Whether this user is the last active holder of the administrative capability.
   *
   * Deliberately a fact passed IN, not a query made here. The domain cannot reach a
   * repository (ADR-0006: outbound ports only, and none of them belong to an entity).
   * The use-case resolves it and hands it over, which also makes the guard trivially
   * testable in both states without a database.
   */
  readonly isLastActiveAdmin?: boolean;
}

/** What a transition produced. The caller persists and audits it in ONE transaction. */
export interface TransitionResult {
  readonly from: UserStatus;
  readonly to: UserStatus;
  readonly at: Date;
  readonly actor: Actor;
  readonly reason: string | undefined;
}

export interface UserSnapshot {
  readonly id: string;
  readonly organizationId: string;
  readonly email: string;
  readonly nameAr: string;
  readonly nameEn: string;
  readonly status: UserStatus;
  readonly departmentId: string | null;
}

export class User {
  #status: UserStatus;

  private constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly email: string,
    /** Bilingual display names. No first/last split — ADR-0019, resolving identity.md question c. */
    readonly nameAr: string,
    readonly nameEn: string,
    status: UserStatus,
    readonly departmentId: string | null,
  ) {
    this.#status = status;
  }

  static rehydrate(snapshot: UserSnapshot): User {
    return new User(
      snapshot.id,
      snapshot.organizationId,
      snapshot.email,
      snapshot.nameAr,
      snapshot.nameEn,
      snapshot.status,
      snapshot.departmentId,
    );
  }

  /** A new user always starts `invited`. There is no way to construct one `active`. */
  static invite(params: Omit<UserSnapshot, 'status'>): User {
    return new User(
      params.id,
      params.organizationId,
      params.email,
      params.nameAr,
      params.nameEn,
      'invited',
      params.departmentId,
    );
  }

  /** Read-only. Any writable `status` reintroduces C3 and C4. */
  get status(): UserStatus {
    return this.#status;
  }

  get isActive(): boolean {
    return this.#status === 'active';
  }

  /**
   * The ONLY way status changes.
   *
   * Validates, in this order, and the order matters for the error a user sees:
   *   1. the target state is reachable from the current one
   *   2. a reason is present where the transition requires one
   *   3. domain guards (self-transition, last-admin)
   *
   * Permission is checked by the caller via `authorize()` (ADR-0021) before this is
   * reached — the domain layer has no permission model and must not grow one, or
   * authorization ends up in two places, which is C1.
   */
  transition(to: UserStatus, ctx: TransitionContext): TransitionResult {
    const from = this.#status;

    if (from === to) {
      throw new TransitionError(
        `A user is already ${from}; a self-transition is not a state change.`,
        { from, to, code: 'SELF_TRANSITION' },
      );
    }

    if (isTerminal(from)) {
      throw new TransitionError(
        `${from} is terminal. A user cannot be restored from ${from}; create a new user instead.`,
        { from, to, code: 'TERMINAL_STATE' },
      );
    }

    const legal = findTransition(from, to);
    if (!legal) {
      throw new TransitionError(`${from} → ${to} is not a legal transition.`, {
        from,
        to,
        code: 'ILLEGAL_TRANSITION',
      });
    }

    const reason = ctx.reason?.trim() ? ctx.reason.trim() : undefined;
    if (legal.reasonRequired && reason === undefined) {
      throw new TransitionError(
        `${from} → ${to} requires a documented reason.`,
        { from, to, code: 'REASON_REQUIRED' },
      );
    }

    // Guard: nobody suspends or archives themselves. Not vanity — an admin who
    // locks themselves out needs another admin, and if they were the last one, the
    // organisation needs database access to recover.
    if (ctx.actor.actorType === 'user' && ctx.actor.userId === this.id) {
      throw new TransitionError(
        'A user cannot change their own status.',
        { from, to, code: 'SELF_ACTION' },
      );
    }

    // Guard: never remove the last active administrator. The failure this prevents
    // is unrecoverable through the application — there is no endpoint left that can
    // grant the capability back.
    const leavesActive = from === 'active' && (to === 'suspended' || to === 'archived');
    if (leavesActive && ctx.isLastActiveAdmin === true) {
      throw new TransitionError(
        'This user is the last active administrator; grant the capability to another user first.',
        { from, to, code: 'LAST_ACTIVE_ADMIN' },
      );
    }

    this.#status = to;

    return { from, to, at: ctx.at, actor: ctx.actor, reason };
  }

  toSnapshot(): UserSnapshot {
    return {
      id: this.id,
      organizationId: this.organizationId,
      email: this.email,
      nameAr: this.nameAr,
      nameEn: this.nameEn,
      status: this.#status,
      departmentId: this.departmentId,
    };
  }
}
