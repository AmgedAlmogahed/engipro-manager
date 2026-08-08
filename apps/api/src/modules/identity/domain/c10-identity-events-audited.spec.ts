import assert from 'node:assert/strict';
import test from 'node:test';
import { User } from './index.js';

/**
 * C10 (identity slice) — "Audit is inconsistent... RFQ decline/cancel/start-pricing,
 * every pipeline stage move, the bulk SLA recompute and the cron reclassifier all
 * mutate state silently." Audit failures were swallowed (`audit.service.ts:40`).
 *
 * The unit-lane half is assertable today: a transition must RETURN everything an audit
 * row needs. If the aggregate does not surface actor, time and reason, no amount of
 * discipline in the service layer can produce a complete audit row.
 */

const AT = new Date('2026-08-08T12:00:00.000Z');

test('a transition returns every field an audit row requires', () => {
  const u = User.rehydrate({
    id: 'u1', organizationId: 'o1', email: 'a@b.c',
    nameAr: 'أ', nameEn: 'A', status: 'active', departmentId: null,
  });

  const r = u.transition('suspended', {
    actor: { userId: 'admin-1', actorType: 'user' },
    at: AT,
    reason: 'policy violation',
  });

  assert.equal(r.from, 'active');
  assert.equal(r.to, 'suspended');
  assert.equal(r.actor.userId, 'admin-1');
  assert.equal(r.actor.actorType, 'user');
  assert.equal(r.at, AT, 'the audit timestamp is the injected time, not the write time');
  assert.equal(r.reason, 'policy violation');
});

test('a system transition is attributable without inventing a user', () => {
  // ADR-0024: actor_id NULL + actor_type='system'. A service-account user row would
  // appear in user lists, be assignable, and be grantable roles — a fake human is
  // worse than an explicit null.
  const u = User.rehydrate({
    id: 'u1', organizationId: 'o1', email: 'a@b.c',
    nameAr: 'أ', nameEn: 'A', status: 'active', departmentId: null,
  });
  const r = u.transition('suspended', {
    actor: { userId: 'cron', actorType: 'system' },
    at: AT,
    reason: 'dormant 180 days',
  });
  assert.equal(r.actor.actorType, 'system');
  assert.ok(r.reason, 'an automated status change still requires a reason');
});

test.skip('login, refresh, logout, grant/revoke and every transition write audit rows [integration lane]', () => {
  // Needs the database and the audit table. Activates with the integration stage.
  //
  // Also asserts audit writes are NOT swallowed: a failing audit insert must fail the
  // transaction, since the predecessor's audit service caught and discarded errors,
  // which is how "audited" became untrue without anyone noticing.
});
