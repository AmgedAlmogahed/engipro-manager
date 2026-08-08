import assert from 'node:assert/strict';
import test, { before } from 'node:test';
import { connect, waitForDatabase, withRollback } from './db.js';

/**
 * The integration lane's own first assertion. (ADR-0009)
 *
 * This tests the HARNESS, not the application, and it goes first because every later
 * integration test inherits its guarantee. If writes leak between tests, later failures
 * present as flakiness and get "fixed" by reordering — which hides a real defect behind
 * a test-suite quirk.
 *
 * It also proves the lane is not itself a false green: these assertions cannot pass
 * without a real PostgreSQL accepting connections and honouring transaction semantics.
 */

before(async () => {
  await waitForDatabase();
});

test('the lane is connected to a real PostgreSQL', async () => {
  const sql = connect();
  try {
    const rows = await sql`SELECT version() AS v, current_database() AS db`;
    // noUncheckedIndexedAccess is on (ADR-0009's strictness), so the row is possibly
    // undefined until asserted. Asserting it is correct rather than annoying: a query
    // returning no rows is exactly the case where a naive test would throw a confusing
    // TypeError instead of saying what went wrong.
    const row = rows[0];
    assert.ok(row, 'SELECT version() returned no rows — the connection is not usable');
    assert.match(row.v, /PostgreSQL/, 'must be a real PostgreSQL, not a stub');
    assert.ok(row.db, 'must be connected to a database');
    console.log(`      ${row.v.split(',')[0]} / ${row.db}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
});

test('withRollback isolates writes — nothing survives the test', async () => {
  const table = 'lane_isolation_probe';

  // Create the probe table OUTSIDE the transaction so the assertion is about rows,
  // not about DDL rollback.
  const setup = connect();
  try {
    await setup`CREATE TABLE IF NOT EXISTS ${setup(table)} (id int primary key)`;
    await setup`DELETE FROM ${setup(table)}`;
  } finally {
    await setup.end({ timeout: 5 });
  }

  const insertedInside = await withRollback(async (tx) => {
    await tx`INSERT INTO ${tx(table)} (id) VALUES (1)`;
    const rows = await tx`SELECT id FROM ${tx(table)}`;
    return rows.length;
  });

  assert.equal(insertedInside, 1, 'the write must be visible INSIDE the transaction');

  const after = connect();
  try {
    const rows = await after`SELECT id FROM ${after(table)}`;
    assert.equal(
      rows.length,
      0,
      'the write must NOT survive — if it does, every later integration test is ' +
        'order-dependent and its failures will look like flakes',
    );
  } finally {
    await after`DROP TABLE IF EXISTS ${after(table)}`.catch(() => {});
    await after.end({ timeout: 5 });
  }
});

test('a failure inside withRollback propagates rather than being swallowed', async () => {
  // A harness that eats errors turns a failing assertion into a passing test. The
  // rollback sentinel must not catch anything but itself.
  await assert.rejects(
    () => withRollback(async () => { throw new Error('boom'); }),
    /boom/,
  );
});
