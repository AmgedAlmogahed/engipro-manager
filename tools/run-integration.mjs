#!/usr/bin/env node
/**
 * Integration-lane runner. (ADR-0009, ADR-0037)
 *
 * Exists rather than a bare `tsx --test` glob for one reason: **it fails when it finds
 * zero tests.** A glob that matches nothing exits 0, and "integration tests passed" with
 * no tests run is the single most misleading green in a pipeline — it is the same class
 * as the boundary rule that matched nothing, the lint that parsed zero rules, and the
 * count check where both sides were broken. The ADR-0048 standing rule applies here.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.argv[2] ?? 'src';

function find(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) find(p, acc);
    else if (p.endsWith('.itest.ts')) acc.push(p);
  }
  return acc;
}

const files = find(ROOT);

if (files.length === 0) {
  console.error('run-integration: found ZERO *.itest.ts files.');
  console.error('  An empty integration run exits 0 and reports as passing, which is');
  console.error('  indistinguishable from a suite that actually verified something.');
  console.error('  If the lane is intentionally empty, remove the CI stage instead.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('run-integration: DATABASE_URL is not set.');
  console.error('  Integration tests FAIL rather than skip when the database is absent.');
  process.exit(1);
}

console.log(`run-integration: ${files.length} file(s)`);
for (const f of files) console.log(`  ${f}`);

/**
 * Resolve the tsx binary instead of assuming a path.
 *
 * `../../node_modules/.bin/tsx` was wrong: under pnpm, tsx is a devDependency of
 * apps/api and lives in `apps/api/node_modules/.bin`, not at the workspace root. The
 * bug survived local testing because the DATABASE_URL guard above exits first on a
 * machine with no database, so this line never ran until CI reached it.
 *
 * Same family as ADR-0008's vendor rule, which was written against npm's flat
 * node_modules and never matched under pnpm: **any hardcoded node_modules path is a
 * package-manager assumption.** Resolve, do not assume.
 */
const candidates = [
  join('node_modules', '.bin', 'tsx'),
  join('..', '..', 'node_modules', '.bin', 'tsx'),
];
const tsx = candidates.find((c) => existsSync(c));
if (!tsx) {
  console.error('run-integration: cannot find the tsx binary. Looked in:');
  for (const c of candidates) console.error(`  ${c}`);
  process.exit(1);
}

execFileSync(tsx, ['--test', ...files], { stdio: 'inherit' });
