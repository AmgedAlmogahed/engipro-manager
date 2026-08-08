import assert from 'node:assert/strict';
import test from 'node:test';
import { User, TransitionError, USER_TRANSITIONS, USER_STATUSES, type UserStatus } from './index.js';

/**
 * State-machine suite for the User aggregate. (ADR-0029, ADR-0009)
 *
 * ADR-0029 requires: "for every aggregate, every legal transition succeeds, every
 * illegal transition throws — including backwards out of terminal states, which is C3
 * verbatim — and every reason-requiring transition rejects a null reason."
 *
 * The legal/illegal cases are GENERATED from the transition map rather than listed by
 * hand. A hand-listed suite tests the cases someone thought of; a generated one tests
 * the whole 4×4 space, so adding a state without its transitions fails here rather
 * than shipping an unreachable state nobody noticed.
 */


/**
 * Capture and return a TransitionError.
 *
 * `assert.throws` returns undefined, so reading `.code` off its result silently
 * produced a TypeError rather than a useful assertion — four tests failed for the
 * wrong reason on the first run. Asserting the CODE matters: every guard in this
 * aggregate throws the same class, so a test that only checks "it threw" would pass
 * when the wrong guard fired.
 */
function expectTransitionError(fn: () => unknown, code: string): TransitionError {
  try {
    fn();
  } catch (e) {
    assert.ok(e instanceof TransitionError, `expected TransitionError, got ${String(e)}`);
    assert.equal(e.code, code, `expected code ${code}, got ${e.code}: ${e.message}`);
    return e;
  }
  assert.fail(`expected a TransitionError with code ${code}, but nothing was thrown`);
}

const AT = new Date('2026-08-08T12:00:00.000Z');
const ADMIN = { userId: 'admin-1', actorType: 'user' as const };

function userAt(status: UserStatus, id = 'user-1'): User {
  return User.rehydrate({
    id,
    organizationId: 'org-1',
    email: 'a@example.com',
    nameAr: 'أحمد',
    nameEn: 'Ahmed',
    status,
    departmentId: null,
  });
}

// --- Generated: every legal transition succeeds ------------------------------
for (const from of USER_STATUSES) {
  for (const t of USER_TRANSITIONS[from] ?? []) {
    test(`legal: ${from} → ${t.to}${t.reasonRequired ? ' (reason required)' : ''}`, () => {
      const u = userAt(from);
      const result = u.transition(t.to, {
        actor: ADMIN,
        at: AT,
        reason: t.reasonRequired ? 'documented reason' : undefined,
      });

      assert.equal(u.status, t.to, 'the aggregate must actually move');
      assert.equal(result.from, from);
      assert.equal(result.to, t.to);
      assert.equal(result.at, AT, 'time is injected, never read from the clock (ADR-0018)');
      assert.equal(result.reason, t.reasonRequired ? 'documented reason' : undefined);
    });
  }
}

// --- Generated: every transition NOT in the map throws -----------------------
for (const from of USER_STATUSES) {
  for (const to of USER_STATUSES) {
    if (from === to) continue;
    const legal = (USER_TRANSITIONS[from] ?? []).some((t) => t.to === to);
    if (legal) continue;

    test(`illegal: ${from} → ${to} throws`, () => {
      const u = userAt(from);
      assert.throws(
        () => u.transition(to, { actor: ADMIN, at: AT, reason: 'r' }),
        TransitionError,
      );
      assert.equal(u.status, from, 'a rejected transition must not mutate the aggregate');
    });
  }
}

// --- C3 verbatim: no coming back out of a terminal state ---------------------
test('archived is terminal — no transition leaves it (C3)', () => {
  for (const to of USER_STATUSES) {
    if (to === 'archived') continue;
    const u = userAt('archived');
    expectTransitionError(() => u.transition(to, { actor: ADMIN, at: AT, reason: 'r' }), 'TERMINAL_STATE');
    assert.equal(u.status, 'archived');
  }
});

// --- Reason requirements ----------------------------------------------------
test('a reason-requiring transition rejects a missing reason', () => {
  const u = userAt('active');
  expectTransitionError(() => u.transition('suspended', { actor: ADMIN, at: AT }), 'REASON_REQUIRED');
  assert.equal(u.status, 'active');
});

test('whitespace is not a reason', () => {
  const u = userAt('active');
  assert.throws(
    () => u.transition('suspended', { actor: ADMIN, at: AT, reason: '   ' }),
    (e: TransitionError) => e.code === 'REASON_REQUIRED',
  );
});

test('a reason is trimmed before it is recorded', () => {
  const u = userAt('active');
  const r = u.transition('suspended', { actor: ADMIN, at: AT, reason: '  left the company  ' });
  assert.equal(r.reason, 'left the company');
});

// --- Guards -----------------------------------------------------------------
test('a user cannot change their own status', () => {
  const u = userAt('active', 'self-1');
  expectTransitionError(
    () => u.transition('suspended', {
      actor: { userId: 'self-1', actorType: 'user' },
      at: AT,
      reason: 'r',
    }),
    'SELF_ACTION',
  );
  assert.equal(u.status, 'active');
});

test('the last active admin cannot be suspended or archived', () => {
  for (const to of ['suspended', 'archived'] as const) {
    const u = userAt('active');
    expectTransitionError(
      () => u.transition(to, { actor: ADMIN, at: AT, reason: 'r', isLastActiveAdmin: true }),
      'LAST_ACTIVE_ADMIN',
    );
    assert.equal(u.status, 'active', 'the organisation must not be left without an admin');
  }
});

test('the last-admin guard does not block a non-admin, nor invited → archived', () => {
  const u = userAt('active');
  u.transition('suspended', { actor: ADMIN, at: AT, reason: 'r', isLastActiveAdmin: false });
  assert.equal(u.status, 'suspended');

  // An invited user has never been active, so revoking the invite cannot orphan
  // the admin capability even if the flag is set.
  const inv = userAt('invited');
  inv.transition('archived', { actor: ADMIN, at: AT, reason: 'revoked', isLastActiveAdmin: true });
  assert.equal(inv.status, 'archived');
});

test('a system actor is not caught by the self-action guard', () => {
  // ADR-0024: system actors are actor_type='system' with a null actor_id. A system
  // actor has no user id to collide with, and must still be able to act.
  const u = userAt('active', 'user-1');
  const r = u.transition('suspended', {
    actor: { userId: 'user-1', actorType: 'system' },
    at: AT,
    reason: 'dormant-account sweep',
  });
  assert.equal(r.actor.actorType, 'system');
  assert.equal(u.status, 'suspended');
});

// --- Construction -----------------------------------------------------------
test('an invited user is the only constructible starting state', () => {
  const u = User.invite({
    id: 'u2',
    organizationId: 'org-1',
    email: 'b@example.com',
    nameAr: 'سارة',
    nameEn: 'Sara',
    departmentId: null,
  });
  assert.equal(u.status, 'invited');
  assert.equal(u.isActive, false);
});

test('status has no setter — transition() is the only mutation path (ADR-0029)', () => {
  const u = userAt('active');
  // The type system already forbids assignment; this asserts it at runtime too,
  // because the guarantee must hold for JavaScript callers and for anything
  // reaching the aggregate through a cast.
  assert.throws(() => {
    (u as unknown as { status: string }).status = 'archived';
  });
  assert.equal(u.status, 'active');
});
