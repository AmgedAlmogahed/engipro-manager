#!/usr/bin/env node
/**
 * Glossary lint: a rejected synonym may not enter the codebase. (ADR-0048)
 *
 * C13 is the predecessor's naming drift, and it was not cosmetic. `ServiceCategory`
 * was the model name while Department was the concept — including in authorization,
 * where `Department.managerId` decided who could act. One concept under two names in
 * the same system means two mental models of one column, and the reader cannot tell
 * which one the code in front of them assumes.
 *
 * The rejected synonyms are parsed out of docs/glossary.md rather than duplicated
 * here, so the document and the check cannot disagree. A term whose lint entry lives
 * only in this file would be a rule the glossary does not know about.
 *
 * Run: node tools/check-glossary.mjs [--fixture <path>]
 *
 *   --fixture  lint one specific file instead of the tree. Used by the live-fire
 *              check to prove this lint actually fails on a violation.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const GLOSSARY = 'docs/glossary.md';
const SCAN_DIRS = ['apps/api/src', 'apps/web/src', 'packages'];
const SCAN_EXT = new Set(['.ts', '.tsx', '.sql', '.json']);

// apps/prototype is frozen (ADR-0002) and predates the glossary; it is prior art, not
// code being held to this rule. docs/ is prose that must be able to NAME a rejected
// synonym in order to reject it — including this file and the glossary itself.
const SKIP = [/^apps\/prototype\//, /node_modules/, /\/dist\//, /\.d\.ts$/];

if (!existsSync(GLOSSARY)) {
  console.error(`check-glossary: ${GLOSSARY} not found. ADR-0048 requires it before domain code.`);
  process.exit(1);
}

/** Parse `| Canonical | ... | Rejected synonyms |` rows out of the glossary table. */
function parseRejected() {
  const out = [];
  for (const line of readFileSync(GLOSSARY, 'utf8').split('\n')) {
    if (!line.startsWith('|')) continue;
    // A markdown row `| a | b | c |` splits to ['', 'a', 'b', 'c', ''] — so the first
    // content cell is index 1 and the last is length-2. Indexing the rejected column
    // by a fixed number broke the moment the table gained a column, and the parser
    // then returned zero terms. The zero-terms guard below is what caught that; the
    // lint would otherwise have passed every violation while reporting success.
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 4) continue;
    const canonical = cells[1].replace(/\*\*/g, '');
    const rejected = cells[cells.length - 2];
    if (!canonical || canonical === 'Canonical (en)' || canonical.startsWith('---')) continue;
    if (!rejected || rejected === '—') continue;

    for (const m of rejected.matchAll(/`([^`]+)`/g)) {
      out.push({ term: m[1], canonical });
    }
  }
  return out;
}

const rejected = parseRejected();
if (rejected.length === 0) {
  console.error('check-glossary: parsed ZERO rejected synonyms from the glossary.');
  console.error('  A lint with no terms passes everything. Either the table shape changed');
  console.error('  or the parser broke — this is not a passing result.');
  process.exit(1);
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (SKIP.some((re) => re.test(p))) continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (SCAN_EXT.has(extname(p))) acc.push(p);
  }
  return acc;
}

const fixtureIdx = process.argv.indexOf('--fixture');
const files = fixtureIdx !== -1 ? [process.argv[fixtureIdx + 1]] : SCAN_DIRS.flatMap((d) => walk(d));

/**
 * Comments are stripped from TypeScript before scanning, and this is a deliberate
 * scope decision rather than a loophole.
 *
 * The harm C13 describes is one concept carrying two names **in the code**: a model
 * called `ServiceCategory` while every other layer said Department, including the
 * authorization path. A comment cannot become an identifier, a column, or an API
 * field.
 *
 * And the alternative is incoherent with ADR-0003, which requires conflict-register
 * items to be quoted **verbatim** — every such quote names the rejected term by
 * definition. C1's text is literally "Hardcoded UserRole checks live beside the
 * permission engine". A lint that forbids writing that sentence forbids documenting
 * the defect it exists to prevent.
 *
 * `.sql` and `.json` are scanned whole: neither has comments in the forms below, and
 * both contain nothing but names.
 */
function stripTsComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const findings = [];
for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const scannable = /\.tsx?$/.test(file) ? stripTsComments(raw) : raw;
  const lines = scannable.split('\n');
  lines.forEach((line, i) => {
    // An eslint-style opt-out is deliberately NOT supported. ADR-0008's suppression
    // policy applies: an exception is a glossary change, reviewed, never an inline
    // comment that no reviewer sees again.
    for (const { term, canonical } of rejected) {
      // Whole-identifier match, so `Category` does not fire inside `CategoryFree`
      // and `Quote` does not fire inside `Quotation`.
      const re = new RegExp(`(^|[^A-Za-z0-9_])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9_]|$)`);
      if (re.test(line)) {
        findings.push({ file, line: i + 1, term, canonical, text: line.trim().slice(0, 100) });
      }
    }
  });
}

console.log(`check-glossary: ${rejected.length} rejected synonyms, ${files.length} files scanned`);

if (findings.length > 0) {
  console.error(`\ncheck-glossary: ${findings.length} rejected term(s) found\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}`);
    console.error(`    "${f.term}" is a rejected synonym — use "${f.canonical}" (docs/glossary.md)`);
    console.error(`    ${f.text}`);
  }
  console.error(
    '\nC13 is what this prevents: the predecessor called one concept ServiceCategory in the\n' +
      'model and Department everywhere else, including in authorization. Rename to the\n' +
      'canonical term. If the canonical term is genuinely wrong, change the glossary in a\n' +
      'reviewed commit — there is no inline suppression.',
  );
  process.exit(1);
}

console.log('ok    no rejected synonyms found.');
