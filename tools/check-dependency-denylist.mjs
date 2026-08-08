#!/usr/bin/env node
/**
 * Dependency denylist. (ADR-0012 pattern, extended by ADR-0051, ADR-0011, ADR-0005, ADR-0050)
 *
 * Each denied package would silently reverse a ratified decision if installed. The
 * clearest example is ADR-0051's: any replication-based sync engine moves per-user
 * filtering into engine-side sync rules, producing a second authorization model beside
 * `scopeFilter()` — which is C1, the register's worst defect, reintroduced by
 * infrastructure rather than by code.
 *
 * Installing one of these is a SUPERSESSION of its ADR. That is a reviewed decision,
 * and this check is what makes it one instead of an `npm install` nobody noticed.
 *
 * The zero-rules guard applies (ADR-0048 standing rule): if the denylist parses empty,
 * this fails rather than passing everything.
 *
 * Run: node tools/check-dependency-denylist.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LIST = 'tools/dependency-denylist.json';
const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

if (!existsSync(LIST)) {
  console.error(`check-dependency-denylist: ${LIST} not found.`);
  process.exit(1);
}

const { denied } = JSON.parse(readFileSync(LIST, 'utf8'));

if (!Array.isArray(denied) || denied.length === 0) {
  console.error('check-dependency-denylist: the denylist is EMPTY.');
  console.error('  A denylist with no entries permits everything. This is not a pass —');
  console.error('  either the file shape changed or entries were removed without an ADR.');
  process.exit(1);
}

/** Every workspace package.json, plus the root. apps/prototype is frozen (ADR-0002). */
function manifests() {
  const found = ['package.json'];
  for (const base of ['apps', 'packages']) {
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base)) {
      if (entry === 'prototype') continue;
      const p = join(base, entry, 'package.json');
      if (existsSync(p) && statSync(p).isFile()) found.push(p);
    }
  }
  return found;
}

const files = manifests();
const findings = [];

for (const file of files) {
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  for (const field of DEP_FIELDS) {
    for (const name of Object.keys(pkg[field] ?? {})) {
      for (const rule of denied) {
        // A scoped prefix like "@powersync/" matches any package under the scope; a
        // bare name must match exactly, so denying "next" does not also deny
        // "next-safe-action" or any unrelated package that merely starts with it.
        const isPrefix = rule.pattern.endsWith('/');
        const hit = isPrefix ? name.startsWith(rule.pattern) : name === rule.pattern;
        if (hit) findings.push({ file, field, name, rule });
      }
    }
  }
}

console.log(
  `check-dependency-denylist: ${denied.length} rules, ${files.length} manifest(s) checked`,
);

if (findings.length > 0) {
  console.error(`\ncheck-dependency-denylist: ${findings.length} denied dependency(ies)\n`);
  for (const f of findings) {
    console.error(`  ${f.file} → ${f.field}.${f.name}`);
    console.error(`    Denied by ${f.rule.adr}: ${f.rule.reason}`);
    console.error('');
  }
  console.error(
    'Installing one of these reverses a ratified decision. If the decision should\n' +
      'change, supersede the ADR in a reviewed commit and remove its denylist entry —\n' +
      'in that order. There is no inline suppression.',
  );
  process.exit(1);
}

console.log('ok    no denied dependencies.');
