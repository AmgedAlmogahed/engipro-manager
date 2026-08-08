import postgres from 'postgres';

/**
 * Integration-test database harness. (ADR-0009)
 *
 * Lives in `apps/api/src/test-support/` rather than `packages/testing` on purpose:
 * ADR-0001 extracts a package **on its second consumer**, and there is one. It moves
 * when `apps/web` or a worker needs it, not in anticipation.
 *
 * The single property everything else depends on is **isolation**. If one test's writes
 * leak into the next, every later assertion is unreliable in a way that presents as
 * flakiness and gets "fixed" by reordering tests. So the harness gives each test a
 * transaction that is **always rolled back**, and the first integration test asserts
 * exactly that.
 *
 * `DATABASE_URL` absent is a FAILURE, never a skip. A skipped integration suite that
 * reports green is the failure mode this branch has hit ten times.
 */

export function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Integration tests require a real PostgreSQL and must ' +
        'FAIL rather than skip when it is absent — a skipped suite that reports green ' +
        'is indistinguishable from a passing one.',
    );
  }
  return url;
}

export function connect(): postgres.Sql {
  // max: 1 so a test's transaction and its queries are guaranteed the same session.
  // With a pool, a query can land on a different connection and silently sit outside
  // the transaction — which looks like an isolation bug in the test rather than in the
  // harness.
  return postgres(databaseUrl(), { max: 1, onnotice: () => {} });
}

/**
 * Run `fn` inside a transaction that is always rolled back, even on success.
 *
 * Rollback-always rather than truncate-between-tests: truncation is slower, it has to
 * know every table, and it silently stops covering tables added later. A rollback
 * cannot go stale.
 */
export async function withRollback<T>(
  fn: (tx: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  const sql = connect();
  const ROLLBACK = Symbol('rollback');
  try {
    let captured: T;
    try {
      await sql.begin(async (tx) => {
        captured = await fn(tx);
        // Throwing is how postgres.js is told to roll back. The sentinel is rethrown
        // below only if it is not ours, so a real error from `fn` still surfaces.
        throw ROLLBACK;
      });
    } catch (e) {
      if (e !== ROLLBACK) throw e;
    }
    // @ts-expect-error assigned inside the transaction callback before the throw
    return captured;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

/** Wait for the database to accept connections. CI service containers race startup. */
export async function waitForDatabase(attempts = 20, delayMs = 500): Promise<void> {
  for (let i = 1; i <= attempts; i += 1) {
    const sql = connect();
    try {
      await sql`SELECT 1`;
      await sql.end({ timeout: 5 });
      return;
    } catch (e) {
      await sql.end({ timeout: 5 }).catch(() => {});
      if (i === attempts) {
        throw new Error(`database not reachable after ${attempts} attempts: ${String(e)}`);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
