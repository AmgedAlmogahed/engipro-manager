import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { User } from './index.js';

/**
 * C1 — "Two authorization models coexist. Hardcoded UserRole checks live beside the
 * permission engine, and they disagree."
 *
 * The fix is structural, so the test is structural: there is no role to check.
 * ADR-0021 removes the column, ADR-0049 makes resolution a most-permissive union, and
 * the glossary lint rejects `UserRole` as a term. This spec is the fourth mechanism,
 * and C1 has earned four.
 */

/**
 * Comments are stripped before scanning. These assertions are about CODE: a comment
 * explaining "permission is checked by the caller via authorize()" is documentation of
 * the rule, not a violation of it, and the first run of this spec failed on exactly
 * that sentence. A structural check that cannot tell code from prose produces a rule
 * nobody can write about — and an unexplained rule is the kind people work around.
 */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const DOMAIN_FILES = readdirSync(import.meta.dirname)
  .filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'))
  .map((f) => ({
    name: f,
    text: stripComments(readFileSync(`${import.meta.dirname}/${f}`, 'utf8')),
  }));

test('the User aggregate exposes no role', () => {
  const u = User.invite({
    id: 'u1', organizationId: 'o1', email: 'a@b.c',
    nameAr: 'أ', nameEn: 'A', departmentId: null,
  });
  // `as unknown as` is required: UserSnapshot has no index signature, and TypeScript
  // rejects the direct assertion. Worth keeping the double cast rather than widening
  // UserSnapshot — the snapshot type being closed is part of what this test asserts.
  const snapshot = u.toSnapshot() as unknown as Record<string, unknown>;

  // The forbidden keys are DERIVED from the glossary's rejected synonyms rather than
  // hardcoded here. Two reasons, and the second is the better one:
  //   1. Hardcoding them meant writing the rejected token, which the glossary lint
  //      correctly flags — string literals are where a rejected term does the most
  //      damage, so they are scanned.
  //   2. A new rejected synonym now extends this assertion automatically. A hardcoded
  //      list would have gone stale the first time the glossary grew, and gone stale
  //      silently, which is this whole branch's recurring failure.
  const glossary = readFileSync(
    `${import.meta.dirname}/../../../../../../docs/glossary.md`,
    'utf8',
  );
  const normalise = (s: string) => s.toLowerCase().replace(/[_-]/g, '');
  const rejectedNorms = new Set(
    [...glossary.matchAll(/`([^`]+)`/g)].map((m) => normalise(m[1] ?? '')),
  );
  assert.ok(rejectedNorms.size > 0, 'the glossary must yield terms, or this asserts nothing');

  for (const key of Object.keys(snapshot)) {
    assert.equal(
      rejectedNorms.has(normalise(key)),
      false,
      `snapshot key "${key}" is a glossary-rejected term — a role on the aggregate is C1's root`,
    );
  }
  // And the concept itself is absent under any spelling.
  assert.equal(
    Object.keys(snapshot).some((k) => normalise(k).includes('role')),
    false,
    'no snapshot key may mention a role: permissions resolve server-side per request',
  );
});

test('the identity domain contains no role literal', () => {
  // A role literal in the domain is the shape that produced C1: a branch on a role
  // name beside a permission engine that disagreed with it.
  const forbidden = /['"`](admin|sales_rep|sales_manager|rfq_engineer|dept_head|ceo|finance|viewer)['"`]/i;
  for (const f of DOMAIN_FILES) {
    const hit = f.text.split('\n').findIndex((l) => forbidden.test(l) && !l.trimStart().startsWith('*') && !l.trimStart().startsWith('//'));
    assert.equal(hit, -1, `${f.name}:${hit + 1} contains a role literal — authorization is not the domain's job`);
  }
});

test('the domain imports no permission model', () => {
  // ADR-0021: authorize() is the single entry point and it lives in the interface
  // layer. A domain that also decides access is C1 by construction.
  for (const f of DOMAIN_FILES) {
    assert.equal(/\bauthorize\s*\(/.test(f.text), false, `${f.name} calls authorize() — permission checks belong to the caller`);
  }
});

test.skip('a role change takes effect on the next request without re-login [integration lane]', () => {
  // Needs a database and a live resolver. Activates with the integration stage —
  // the service-container pattern from the multi-schema PoC (ADR-0011/0037).
  // Asserts: grant a role, next request reflects it; no token refresh needed,
  // because the credential carries `sub` only (identity.md verdict row 2).
});
