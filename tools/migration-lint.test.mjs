#!/usr/bin/env node
/**
 * Migration lint self-test. (ADR-0014 rider, requirement 1)
 *
 * "Fixtures must be produced by the real Drizzle pipeline — drizzle-kit generate, then
 *  lint the generated SQL. Never hand-written SQL. A hand-written fixture tests the
 *  fixture: it encodes what we *assume* the generator emits, so the lint passes against
 *  text no generator ever produces while missing the real thing."
 *
 * That is not a hypothetical caution. It is exactly how the boundary self-test came to
 * "verify" a rule that never matched: its fixture built a flat node_modules layout that
 * pnpm never produces.
 *
 * So every fixture here is a Drizzle SCHEMA. This script runs `drizzle-kit generate`
 * against each one and lints whatever SQL Drizzle actually emits.
 *
 * Run: node tools/migration-lint.test.mjs
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FIX = 'tools/migration-lint/fixtures';
const WORK = 'tools/migration-lint/.work';

/** fixture → the rule(s) the lint must report. `[]` means the SQL must be clean. */
const CASES = [
  { file: 'compliant.mjs', expect: [] },
  { file: 'missing-base-columns.mjs', expect: ['base-columns'] },
  { file: 'float-money.mjs', expect: ['forbidden-numeric-type', 'money-precision'] },
  // identity.users in this fixture also lacks an organization_id index, so both rules
  // must report. Expecting only one would let a regression in the other hide here.
  { file: 'cross-schema-fk.mjs', expect: ['cross-schema-fk', 'missing-organization-index'] },
  { file: 'no-org-index.mjs', expect: ['missing-organization-index'] },
  { file: 'unique-not-partial.mjs', expect: ['unique-not-partial'] },
];

if (CASES.length === 0) {
  console.error('migration-lint.test: zero cases. A self-test with no cases proves nothing.');
  process.exit(1);
}

let pass = 0;
let fail = 0;

function generate(fixture, outDir) {
  const configPath = join(WORK, 'drizzle.config.mjs');
  writeFileSync(
    configPath,
    `export default {\n` +
      `  schema: './${FIX}/${fixture}',\n` +
      `  out: './${outDir}',\n` +
      `  dialect: 'postgresql',\n` +
      `};\n`,
  );
  execFileSync('node_modules/.bin/drizzle-kit', ['generate', `--config=${configPath}`], {
    stdio: 'pipe',
  });
}

function lint(dir) {
  try {
    const out = execFileSync('node', ['tools/check-migrations.mjs', dir], { encoding: 'utf8' });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

if (existsSync(WORK)) rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });

for (const c of CASES) {
  const outDir = join(WORK, c.file.replace('.mjs', ''));
  mkdirSync(outDir, { recursive: true });

  try {
    generate(c.file, outDir);
  } catch (e) {
    console.error(`FAIL  ${c.file} — drizzle-kit generate failed: ${String(e).slice(0, 200)}`);
    fail += 1;
    continue;
  }

  const { code, out } = lint(outDir);

  if (c.expect.length === 0) {
    if (code === 0) {
      pass += 1;
      console.log(`ok    ${c.file.padEnd(26)} generated SQL is clean`);
    } else {
      fail += 1;
      console.error(`FAIL  ${c.file.padEnd(26)} lint rejected COMPLIANT SQL:\n${out}`);
      console.error(
        '      A lint that flags compliant migrations is worse than none: it gets ' +
          'disabled by the first person it blocks.',
      );
    }
    continue;
  }

  const missing = c.expect.filter((rule) => !out.includes(`[${rule}]`));
  if (code !== 0 && missing.length === 0) {
    pass += 1;
    console.log(`ok    ${c.file.padEnd(26)} reported ${c.expect.join(', ')}`);
  } else {
    fail += 1;
    console.error(
      `FAIL  ${c.file.padEnd(26)} expected ${c.expect.join(', ')}` +
        `${missing.length ? `, missing ${missing.join(', ')}` : ''} (exit ${code})`,
    );
    console.error(out.split('\n').slice(0, 20).join('\n'));
  }
}

rmSync(WORK, { recursive: true, force: true });

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.error(
    '\nADR-0014 rider: until this passes AND a non-compliant migration has failed real\n' +
      'CI, the migration lint is DECLARED BUT UNVERIFIED, and every ADR citing it as its\n' +
      'enforcement mechanism is citing an unproven check.',
  );
  process.exit(1);
}
