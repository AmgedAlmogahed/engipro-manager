#!/usr/bin/env node
/**
 * Module tier declarations and structural consistency. (ADR-0007 enforcement)
 *
 * ADR-0007: "each module has a README.md whose first line declares
 * Tier: Rich | Medium | Thin. A CI script asserts every module directory contains one."
 * And: "CI asserts that a module declared Rich or Medium *has* a domain/ folder, and
 * that a module declared Thin does *not*. This makes tier drift visible instead of
 * silent."
 *
 * Tier drift is the failure: a Thin module that grows invariants and keeps them in a
 * service is how the predecessor ended up with business rules inside methods that also
 * performed I/O — the root of C3, C4, C5 and C12.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'apps/api/src/modules';
const VALID = ['Rich', 'Medium', 'Thin'];

if (!existsSync(ROOT)) {
  console.log(`check-module-tiers: ${ROOT} does not exist yet. OK.`);
  process.exit(0);
}

const modules = readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory());

if (modules.length === 0) {
  console.log('check-module-tiers: no modules yet. OK.');
  process.exit(0);
}

const problems = [];

for (const m of modules) {
  const dir = join(ROOT, m);
  const readme = join(dir, 'README.md');

  if (!existsSync(readme)) {
    problems.push(`${m}: no README.md. ADR-0007 requires a tier declaration on its first line.`);
    continue;
  }

  const first = readFileSync(readme, 'utf8').split('\n')[0]?.trim() ?? '';
  const match = /^Tier:\s*(Rich|Medium|Thin)\s*$/.exec(first);
  if (!match) {
    problems.push(
      `${m}: README.md first line is "${first.slice(0, 60)}" — must be exactly ` +
        `"Tier: ${VALID.join(' | ')}".`,
    );
    continue;
  }

  const tier = match[1];
  const hasDomain = existsSync(join(dir, 'domain'));

  if ((tier === 'Rich' || tier === 'Medium') && !hasDomain) {
    problems.push(`${m}: declared ${tier} but has no domain/ folder. Either add it or declare Thin.`);
  }
  if (tier === 'Thin' && hasDomain) {
    problems.push(
      `${m}: declared Thin but has a domain/ folder. A Thin module that grew invariants ` +
        `should be promoted (the Rule of Three, ADR-0007) — not left mislabelled, ` +
        `because the boundary rules key off the domain/ path segment.`,
    );
  }

  console.log(`ok    ${m.padEnd(14)} Tier: ${tier}${hasDomain ? ' (domain/ present)' : ''}`);
}

if (problems.length > 0) {
  console.error(`\ncheck-module-tiers: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(`\n${modules.length} module(s) checked, all consistent.`);
