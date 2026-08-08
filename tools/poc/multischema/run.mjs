#!/usr/bin/env node
/**
 * Multi-schema proof of concept — ENTRY CONDITION for the first migration.
 * (ADR-0011 rider, ADR-0013)
 *
 * Four claims are under test. Each is asserted, and a failure names which claim broke
 * so the ADR-0011 record says something useful:
 *
 *   1. drizzle-kit generates DDL that CREATES BOTH SCHEMAS.
 *   2. The generated SQL contains NO cross-schema foreign key (ADR-0013).
 *   3. A cross-schema reference BY IDENTIFIER works — a join with no FK constraint.
 *   4. Migration generation works in BOTH DIRECTIONS: adding a column and removing it
 *      each produce an applicable migration.
 *
 * Claim 4 is the one most likely to fail quietly. A tool that generates an additive
 * migration correctly and silently omits a destructive one leaves the schema drifting
 * from the model with every green run.
 *
 * If any claim fails, ADR-0011's fallback triggers: a one-day Prisma bake-off. The
 * schema layout is not bent to suit the tool.
 *
 * Runs in CI against a postgres:16 service container, never on a developer machine —
 * see .github/workflows/poc-multischema.yml for why.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import postgres from 'postgres';

const OUT = 'tools/poc/multischema/.migrations';
const CONFIG = 'tools/poc/multischema/drizzle.config.mjs';
const SCHEMA = 'tools/poc/multischema/schema.mjs';
const URL = process.env.DATABASE_URL;

if (!URL) {
  fail('DATABASE_URL is not set. This PoC requires a real PostgreSQL — that is the point.');
}

let passed = 0;
const failures = [];

function ok(claim, detail = '') {
  passed += 1;
  console.log(`ok    ${claim}${detail ? ` — ${detail}` : ''}`);
}
function bad(claim, detail) {
  failures.push(`${claim}: ${detail}`);
  console.error(`FAIL  ${claim} — ${detail}`);
}
function fail(msg) {
  console.error(`\nPoC ABORTED: ${msg}`);
  process.exit(1);
}

function generate() {
  execFileSync('node_modules/.bin/drizzle-kit', ['generate', `--config=${CONFIG}`], {
    stdio: 'inherit',
  });
  const files = readdirSync(OUT).filter((f) => f.endsWith('.sql')).sort();
  if (files.length === 0) fail('drizzle-kit produced no SQL. Nothing to test.');
  return files.map((f) => ({ name: f, sql: readFileSync(join(OUT, f), 'utf8') }));
}

// Start from a clean slate so a stale migration directory cannot make this pass.
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const sql = postgres(URL, { max: 1, onnotice: () => {} });

try {
  // ── Claim 1 & 2: generated DDL ──────────────────────────────────────────────
  const initial = generate();
  const allSql = initial.map((f) => f.sql).join('\n');

  const createsIdentity = /CREATE SCHEMA\s+(IF NOT EXISTS\s+)?"?poc_identity"?/i.test(allSql);
  const createsSales = /CREATE SCHEMA\s+(IF NOT EXISTS\s+)?"?poc_sales"?/i.test(allSql);
  if (createsIdentity && createsSales) {
    ok('claim 1: both schemas created', `${initial.length} migration file(s)`);
  } else {
    bad('claim 1: both schemas created', `identity=${createsIdentity} sales=${createsSales}`);
  }

  // A cross-schema FK would look like: REFERENCES "poc_identity"."users"
  // from inside a poc_sales table definition. Any FK naming the other schema fails.
  const crossFk = /FOREIGN KEY[\s\S]{0,200}?REFERENCES\s+"?poc_(identity|sales)"?\./i.exec(allSql);
  if (!crossFk) {
    ok('claim 2: no cross-schema foreign key in generated SQL');
  } else {
    bad('claim 2: no cross-schema foreign key', `found: ${crossFk[0].replace(/\s+/g, ' ').slice(0, 120)}`);
  }

  // ── Apply ───────────────────────────────────────────────────────────────────
  for (const f of initial) await sql.unsafe(f.sql);
  ok('initial migration applied');

  // ── Claim 3: cross-schema reference by identifier ───────────────────────────
  const org = '00000000-0000-0000-0000-0000000000aa';
  const userId = '00000000-0000-0000-0000-0000000000b1';
  const oppId = '00000000-0000-0000-0000-0000000000c1';

  await sql`INSERT INTO poc_identity.users (id, organization_id, name_ar, name_en)
            VALUES (${userId}, ${org}, 'أحمد', 'Ahmed')`;
  await sql`INSERT INTO poc_sales.opportunities (id, organization_id, owner_id, title)
            VALUES (${oppId}, ${org}, ${userId}, 'Tower MEP design')`;

  const joined = await sql`
    SELECT o.title, u.name_en
    FROM poc_sales.opportunities o
    JOIN poc_identity.users u
      ON u.id = o.owner_id AND u.organization_id = o.organization_id
    WHERE o.id = ${oppId}`;

  if (joined.length === 1 && joined[0].name_en === 'Ahmed') {
    ok('claim 3: cross-schema join by identifier works');
  } else {
    bad('claim 3: cross-schema join by identifier', `got ${JSON.stringify(joined)}`);
  }

  // The absence of the FK must be real, not assumed: an orphan insert has to SUCCEED,
  // because that is the integrity trade-off ADR-0013 accepts and the nightly
  // consistency check exists to catch. If this throws, a cross-schema FK exists.
  try {
    await sql`INSERT INTO poc_sales.opportunities (id, organization_id, owner_id, title)
              VALUES ('00000000-0000-0000-0000-0000000000c2', ${org},
                      '00000000-0000-0000-0000-00000000dead', 'Orphan')`;
    ok('claim 2 (runtime): an orphan identifier inserts, confirming no FK constraint');
  } catch (e) {
    bad('claim 2 (runtime)', `orphan insert was rejected, so an FK exists: ${e.message}`);
  }

  // ── Claim 4: generation in both directions ──────────────────────────────────
  const original = readFileSync(SCHEMA, 'utf8');

  try {
    // Forward: add a column.
    writeFileSync(
      SCHEMA,
      original.replace(
        "  title: text('title').notNull(),",
        "  title: text('title').notNull(),\n  notes: text('notes'),",
      ),
    );
    const added = generate();
    const addSql = added.map((f) => f.sql).join('\n');
    if (/ALTER TABLE\s+"?poc_sales"?\."?opportunities"?\s+ADD COLUMN\s+"?notes"?/i.test(addSql)) {
      ok('claim 4a: additive migration generated');
      for (const f of added.slice(initial.length)) await sql.unsafe(f.sql);
      ok('claim 4a: additive migration applied');
    } else {
      bad('claim 4a: additive migration', 'no ADD COLUMN "notes" in the generated SQL');
    }

    // Reverse: remove it again. This is the direction tools quietly skip.
    writeFileSync(SCHEMA, original);
    const removed = generate();
    const dropSql = removed.slice(added.length).map((f) => f.sql).join('\n');
    if (/DROP COLUMN\s+"?notes"?/i.test(dropSql)) {
      ok('claim 4b: destructive migration generated');
      for (const f of removed.slice(added.length)) await sql.unsafe(f.sql);
      ok('claim 4b: destructive migration applied');
    } else {
      bad(
        'claim 4b: destructive migration',
        'no DROP COLUMN in the generated SQL — the model and the schema would drift ' +
          'apart on every column removal, silently',
      );
    }
  } finally {
    writeFileSync(SCHEMA, original);
  }
} finally {
  await sql`DROP SCHEMA IF EXISTS poc_sales CASCADE`.catch(() => {});
  await sql`DROP SCHEMA IF EXISTS poc_identity CASCADE`.catch(() => {});
  await sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`.catch(() => {});
  await sql.end({ timeout: 5 });
}

console.log(`\n${passed} claim(s) passed, ${failures.length} failed`);

if (failures.length > 0) {
  console.error('\nADR-0011 fallback triggers: a one-day Prisma bake-off. Record this');
  console.error('result in ADR-0011 verbatim, with the run URL. Do NOT adjust the schema');
  console.error('layout to suit the tool — the layout is ADR-0013 and it is ratified.');
  process.exit(1);
}

console.log('\nADR-0011/0013 entry condition SATISFIED. Record the run URL in ADR-0011.');
