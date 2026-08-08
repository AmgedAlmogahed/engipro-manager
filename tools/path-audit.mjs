#!/usr/bin/env node
/**
 * Path audit: every path literal in an ADR Enforcement section either resolves
 * today, or is a declared future subject whose stage is skipped in CI.
 *
 * Why this exists. ADR-0019 and ADR-0047 scoped the RTL directional-utility
 * ESLint rule to `apps/admin` — a directory that will never exist, because the
 * app is `apps/web`. A lint rule pointed at a nonexistent directory matches
 * nothing and REPORTS AS PASSING. That rule is the mechanism keeping RTL
 * breakage out of an Arabic-first interface, so it would have been a silent hole
 * of exactly the C9 kind it was written to prevent.
 *
 * The generalisation: any ADR Enforcement clause containing a path is
 * load-bearing, and a rename or restructure that misses one converts a gate into
 * a no-op that still reports green.
 *
 * Run: node tools/path-audit.mjs [--strict]
 *
 *   default   report only; exit 0. Use while subjects are still arriving.
 *   --strict  exit 1 on any unresolved literal not in the expected-future list.
 *             Turn this on once the last W7 subject lands.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';

const ADR_DIR = 'docs/decisions';
const strict = process.argv.includes('--strict');

/**
 * Subjects that legitimately do not exist yet, each with the thing that creates
 * it. An entry here is a promise, not an excuse: when the subject lands, its CI
 * stage activates (ADR-0037 staged-activation rider) and the entry is deleted.
 */
const EXPECTED_FUTURE = {
  'apps/api': 'W2 — the PR that scaffolds the API',
  'apps/web': 'W2 — the PR that scaffolds the frontend (ADR-0050)',
  'packages/domain': 'W2 — first domain package (ADR-0006, ADR-0007)',
  'packages/contracts': 'W2 — first Zod contract (ADR-0010)',
  'packages/database': 'W3 — first migration (ADR-0011)',
  'packages/ui': 'W2 — first shared component (ADR-0047)',
  'packages/testing': 'W2 — test harness (ADR-0009, ADR-0045)',
  'infra': 'W6 — Docker (ADR-0032)',
  'infra/docker': 'W6 — Docker (ADR-0032)',
  'docs/runbooks': 'W6 — runbooks (ADR-0031 restore, ADR-0035 rotation)',
  'docs/mined': 'present; individual module docs land per ADR-0003 mining order',
};

const files = readdirSync(ADR_DIR).filter((f) => /^ADR-\d+\.md$/.test(f)).sort();

const rows = [];
for (const f of files) {
  const txt = readFileSync(join(ADR_DIR, f), 'utf8');
  const sec = txt.match(/\n## Enforcement\n([\s\S]*?)(?=\n## |$)/);
  if (!sec) continue;

  for (const m of sec[1].matchAll(/`([^`]+)`/g)) {
    const lit = m[1].trim();
    if (!/(apps|packages|tools|docs|\.github|infra)\//.test(lit)) continue;
    if (lit.length > 90) continue;

    // Reduce to a concrete prefix that can be tested for existence: drop the
    // first glob, placeholder, or whitespace.
    const probe = lit
      .split(/\s/)[0]
      .replace(/^[`'"]|[`'",;:]$/g, '')
      .split('*')[0]
      .split('<')[0]
      .replace(/\/$/, '');
    if (!probe || !probe.includes('/')) continue;

    const exists = existsSync(probe);
    let expected = null;
    if (!exists) {
      // Longest matching prefix in the expected-future list.
      expected = Object.keys(EXPECTED_FUTURE)
        .filter((k) => probe === k || probe.startsWith(k + '/'))
        .sort((a, b) => b.length - a.length)[0] ?? null;
    }
    rows.push({ adr: basename(f), lit, probe, exists, expected });
  }
}

const resolved = rows.filter((r) => r.exists);
const declared = rows.filter((r) => !r.exists && r.expected);
const orphans = rows.filter((r) => !r.exists && !r.expected);

const seen = new Set();
const show = (r) => {
  const key = r.adr + r.lit;
  if (seen.has(key)) return '';
  seen.add(key);
  return `  ${r.adr.padEnd(12)} ${r.lit}`;
};

console.log(`Path audit over ${files.length} ADR Enforcement sections\n`);
console.log(`RESOLVED (${resolved.length}) — the target exists now`);
resolved.forEach((r) => { const s = show(r); if (s) console.log(s); });

console.log(`\nDECLARED FUTURE (${declared.length}) — target absent, stage skipped in CI`);
for (const r of declared) {
  const s = show(r);
  if (s) console.log(`${s}\n${' '.repeat(15)}↳ ${EXPECTED_FUTURE[r.expected]}`);
}

console.log(`\nORPHANS (${orphans.length}) — absent AND undeclared`);
if (orphans.length === 0) {
  console.log('  none. Every path literal resolves or has an owner.');
} else {
  console.log('  These are the dangerous ones: an enforcement clause naming a path');
  console.log('  that nothing will ever create, which reports green forever.\n');
  orphans.forEach((r) => { const s = show(r); if (s) console.log(s); });
}

console.log(
  `\n${resolved.length} resolved · ${declared.length} declared · ${orphans.length} orphaned`
);

if (strict && orphans.length > 0) process.exit(1);
