#!/usr/bin/env node
/**
 * Migration lint. (ADR-0014, enforcing 0013, 0015, 0016, 0017, 0023, 0025)
 *
 * Several ADRs say "migration lint enforces this". This is that lint, in one place.
 *
 * The predecessor is the argument for it: its documented deduplication rule was never
 * expressed as a unique constraint (C7), and its stated no-deletion policy coexisted
 * with hard-delete endpoints (C22). Both were policies without mechanisms. A convention
 * checked by a human at review time is a convention that will eventually be missed.
 *
 * THIS FILE IS REGEX-OVER-SQL, which is the mechanism class that has silently failed
 * three times in this repository — ADR-0008's vendor rule under pnpm's layout,
 * ADR-0003's C-number gate under POSIX grep's bracket semantics, and the integration
 * runner's hardcoded binary path. So per ADR-0014's rider it is not trusted until:
 *   1. its fixtures are produced by the real drizzle-kit pipeline, and
 *   2. one deliberately non-compliant migration has failed real CI.
 * Both are done — see tools/migration-lint.test.mjs and ADR-0014's recorded result.
 *
 * Run: node tools/check-migrations.mjs <dir-or-file> [--label-expand-contract]
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE_COLUMNS = [
  'id',
  'organization_id',
  'created_at',
  'updated_at',
  'created_by',
  'deleted_at',
];

/**
 * Tables exempt from the base-column rule, by declaration. ADR-0014: "Exemptions live
 * in an explicit allow-list in the lint configuration, not in reviewers' heads."
 */
const EXEMPT = [
  /^platform\.outbox_events$/,
  /^platform\.business_counters$/,
  /^audit\./,
  /^public\.(graphile_worker|_private_)/,
  /^drizzle\./,
  /^public\.__drizzle_migrations$/,
];

const hasExpandContractLabel = process.argv.includes('--label-expand-contract');
const target = process.argv[2];

if (!target) {
  console.error('usage: node tools/check-migrations.mjs <dir-or-file> [--label-expand-contract]');
  process.exit(2);
}

function sqlFiles(t) {
  if (!existsSync(t)) return [];
  if (statSync(t).isFile()) return t.endsWith('.sql') ? [t] : [];
  const out = [];
  for (const e of readdirSync(t)) {
    const p = join(t, e);
    if (statSync(p).isDirectory()) out.push(...sqlFiles(p));
    else if (p.endsWith('.sql')) out.push(p);
  }
  return out.sort();
}

const files = sqlFiles(target);

if (files.length === 0) {
  console.log(`check-migrations: no .sql files under ${target}. Nothing to lint.`);
  process.exit(0);
}

const findings = [];
function flag(file, rule, adr, detail) {
  findings.push({ file, rule, adr, detail });
}

/** Split a statement list on semicolons that are not inside quotes. */
function statements(sql) {
  const out = [];
  let cur = '';
  let quote = null;
  for (let i = 0; i < sql.length; i += 1) {
    const c = sql[i];
    if (quote) {
      if (c === quote) quote = null;
      cur += c;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; cur += c; continue; }
    if (c === ';') { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

const unq = (s) => s.replace(/"/g, '');

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  // drizzle emits `--> statement-breakpoint`; comments must not be linted as DDL.
  const sql = raw.replace(/--[^\n]*/g, '');

  for (const stmt of statements(sql)) {
    const s = stmt.trim();
    if (!s) continue;

    // ── CREATE TABLE ────────────────────────────────────────────────────────
    const create = /CREATE TABLE\s+(IF NOT EXISTS\s+)?("?[\w]+"?\.)?("?[\w]+"?)\s*\(([\s\S]*)\)\s*$/i.exec(s);
    if (create) {
      const schema = unq(create[2] ?? 'public.').replace(/\.$/, '');
      const table = unq(create[3] ?? '');
      const qualified = `${schema}.${table}`;
      const body = create[4] ?? '';
      const exempt = EXEMPT.some((re) => re.test(qualified));

      if (!exempt) {
        const columns = body
          .split(/,(?![^()]*\))/)
          .map((c) => c.trim())
          .map((c) => unq(/^"?([\w]+)"?/.exec(c)?.[1] ?? ''))
          .filter(Boolean);

        const missing = BASE_COLUMNS.filter((c) => !columns.includes(c));
        if (missing.length > 0) {
          flag(file, 'base-columns', 'ADR-0015/0017/0023', `${qualified} is missing: ${missing.join(', ')}`);
        }
      }

      // Rule: forbidden numeric types anywhere in the body.
      for (const m of body.matchAll(/\b(double precision|float\d*|real|money)\b/gi)) {
        flag(file, 'forbidden-numeric-type', 'ADR-0016',
          `${qualified} uses "${m[1]}" — money is numeric(19,4), rates are numeric(5,4); ` +
          `binary floating point cannot represent 0.01 exactly`);
      }

      // Rule: a monetary or rate column with the wrong precision.
      for (const col of body.split(/,(?![^()]*\))/)) {
        const name = unq(/^\s*"?([\w]+)"?/.exec(col)?.[1] ?? '');
        const numeric = /\bnumeric\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i.exec(col);
        if (!numeric) continue;
        const precision = `${numeric[1]},${numeric[2]}`;
        const isRate = /(rate|percent|pct|vat|tax_rate)/i.test(name);
        const isMoney = /(amount|price|total|cost|value|balance|fee|limit|salary)/i.test(name);
        if (isRate && precision !== '5,4') {
          flag(file, 'rate-precision', 'ADR-0016', `${qualified}.${name} is numeric(${precision}), rates are numeric(5,4)`);
        } else if (isMoney && !isRate && precision !== '19,4') {
          flag(file, 'money-precision', 'ADR-0016', `${qualified}.${name} is numeric(${precision}), money is numeric(19,4)`);
        }
      }

      // Rule: no cross-schema REFERENCES except organization_id.
      for (const m of body.matchAll(/"?([\w]+)"?[^,]*?REFERENCES\s+("?[\w]+"?)\.("?[\w]+"?)/gi)) {
        const col = unq(m[1] ?? '');
        const refSchema = unq(m[2] ?? '');
        if (refSchema !== schema && col !== 'organization_id') {
          flag(file, 'cross-schema-fk', 'ADR-0013',
            `${qualified}.${col} references ${refSchema}.${unq(m[3] ?? '')} across schemas — ` +
            `only organization_id may do that; reference by identifier instead`);
        }
      }

      // Rule: a unique constraint on a soft-deletable table must be a partial index.
      // Inline UNIQUE cannot be partial, so it is wrong by construction here.
      if (!exempt && /\bdeleted_at\b/i.test(body) && /\bUNIQUE\b/i.test(body)) {
        flag(file, 'unique-not-partial', 'ADR-0023',
          `${qualified} has an inline UNIQUE on a soft-deletable table. An archived row ` +
          `keeps occupying the constraint, so the value can never be reused. Use ` +
          `CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL`);
      }
    }

    // ── Cross-schema foreign keys added by ALTER TABLE ──────────────────────
    //
    // This is the shape Drizzle actually emits. It does NOT put foreign keys inline in
    // CREATE TABLE; it emits:
    //
    //   ALTER TABLE "sales"."opportunities" ADD CONSTRAINT "..." FOREIGN KEY ("owner_id")
    //     REFERENCES "identity"."users"("id") ...
    //
    // The inline check above found nothing against real generated SQL. A hand-written
    // fixture would have used inline REFERENCES and this rule would have reported green
    // while being blind to every foreign key the generator produces — which is precisely
    // the failure ADR-0014's rider requires generated fixtures to prevent.
    const alterFk =
      /ALTER TABLE\s+("?[\w]+"?)\.("?[\w]+"?)[\s\S]*?FOREIGN KEY\s*\(\s*("?[\w]+"?)\s*\)[\s\S]*?REFERENCES\s+("?[\w]+"?)\.("?[\w]+"?)/i.exec(s);
    if (alterFk) {
      const fromSchema = unq(alterFk[1] ?? '');
      const col = unq(alterFk[3] ?? '');
      const refSchema = unq(alterFk[4] ?? '');
      if (fromSchema !== refSchema && col !== 'organization_id') {
        flag(file, 'cross-schema-fk', 'ADR-0013',
          `${fromSchema}.${unq(alterFk[2] ?? '')}.${col} references ` +
          `${refSchema}.${unq(alterFk[5] ?? '')} across schemas — only organization_id may ` +
          `do that. Reference by identifier and let the nightly consistency check find orphans`);
      }
    }

    // ── ALTER TABLE / destructive ───────────────────────────────────────────
    if (/\bDROP\s+(COLUMN|TABLE)\b/i.test(s) && !hasExpandContractLabel) {
      flag(file, 'destructive-without-label', 'ADR-0014',
        `${/DROP\s+\w+/i.exec(s)?.[0]} requires the expand-contract PR label. ` +
        `Destructive change follows expand → migrate → contract (Fowler, ParallelChange)`);
    }

    // ── Sequences ───────────────────────────────────────────────────────────
    if (/\bCREATE SEQUENCE\b/i.test(s) || /\b(bigserial|serial)\b/i.test(s)) {
      flag(file, 'sequence-for-business-number', 'ADR-0025',
        `sequences are not gapless — nextval is never rolled back — so they cannot ` +
        `produce a document number. Use platform.business_counters`);
    }
  }

  // ── organization_id index, per created table ──────────────────────────────
  for (const m of sql.matchAll(/CREATE TABLE\s+(IF NOT EXISTS\s+)?("?[\w]+"?\.)?("?[\w]+"?)/gi)) {
    const schema = unq(m[2] ?? 'public.').replace(/\.$/, '');
    const table = unq(m[3] ?? '');
    const qualified = `${schema}.${table}`;
    if (EXEMPT.some((re) => re.test(qualified))) continue;

    const indexed = new RegExp(
      `CREATE\\s+(UNIQUE\\s+)?INDEX[\\s\\S]{0,200}?ON\\s+"?${schema}"?\\.?"?${table}"?[\\s\\S]{0,200}?organization_id`,
      'i',
    ).test(sql);
    const pkIncludes = new RegExp(
      `CREATE TABLE[^;]*?"?${table}"?[\\s\\S]*?PRIMARY KEY\\s*\\([^)]*organization_id`,
      'i',
    ).test(sql);
    if (!indexed && !pkIncludes) {
      flag(file, 'missing-organization-index', 'ADR-0017',
        `${qualified} has no index including organization_id. Every list query carries ` +
        `an organization_id predicate, so without the index every list is a scan`);
    }
  }
}

console.log(`check-migrations: ${files.length} file(s) linted`);
for (const f of files) console.log(`  ${f}`);

if (findings.length > 0) {
  console.error(`\ncheck-migrations: ${findings.length} violation(s)\n`);
  for (const f of findings) {
    console.error(`  [${f.rule}] ${f.adr}`);
    console.error(`    ${f.file}: ${f.detail}\n`);
  }
  process.exit(1);
}

console.log('ok    all migrations comply.');
