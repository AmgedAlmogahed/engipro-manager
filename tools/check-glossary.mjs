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
      const term = m[1];
      out.push({ term, canonical, norm: term.toLowerCase().replace(/[_-]/g, '') });
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
/**
 * A character scanner, NOT a regex.
 *
 * A regex stripper corrupts string literals: `'https://example.com'` contains `//`, so
 * a naive line-comment rule truncates the line and the rest of it stops being scanned.
 * That matters specifically here, because **string literals are exactly where rejected
 * terms do the most damage** — a permission key `'servicecategory:read'`, an API field
 * name, a status literal. Silently dropping the tail of any line containing a URL
 * would have made this lint blind in the places it most needs to see.
 *
 * Comment content is replaced with spaces rather than removed, so reported line numbers
 * still match the file on disk.
 */
function stripTsComments(src) {
  let out = '';
  let i = 0;
  // 'code' | 'line' | 'block' | a quote character for string/template state
  let state = 'code';

  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];

    if (state === 'code') {
      if (c === '/' && next === '/') { state = 'line'; out += '  '; i += 2; continue; }
      if (c === '/' && next === '*') { state = 'block'; out += '  '; i += 2; continue; }
      if (c === '"' || c === "'" || c === '`') { state = c; out += c; i += 1; continue; }
      out += c; i += 1; continue;
    }

    if (state === 'line') {
      if (c === '\n') { state = 'code'; out += '\n'; i += 1; continue; }
      out += ' '; i += 1; continue;
    }

    if (state === 'block') {
      if (c === '*' && next === '/') { state = 'code'; out += '  '; i += 2; continue; }
      out += c === '\n' ? '\n' : ' '; i += 1; continue;
    }

    // Inside a string or template literal: preserve everything verbatim, and respect
    // escapes so `'it\'s'` does not end the literal early.
    if (c === '\\') { out += c + (next ?? ''); i += 2; continue; }
    if (c === state) { state = 'code'; out += c; i += 1; continue; }
    out += c; i += 1;
  }

  return out;
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
    // Tokenise, then compare NORMALISED forms: lowercase with `_` and `-` removed.
    //
    // Matching the literal spelling case-sensitively missed the case that matters most.
    // A permission key is lowercase by convention (`module:action`), so
    // `'servicecategory:read'` is real drift and slipped straight through a
    // case-sensitive check for `ServiceCategory`. Normalising catches ServiceCategory,
    // service_category, serviceCategory, SERVICE_CATEGORY and service-category from one
    // glossary entry, which also stops the rejected-synonyms column from having to
    // enumerate every casing anyone might invent.
    //
    // Tokens are whole, so `Category` does not fire inside `CategoryFree` and `Quote`
    // does not fire inside `Quotation`.
    for (const raw of line.match(/[A-Za-z0-9_-]+/g) ?? []) {
      const norm = raw.toLowerCase().replace(/[_-]/g, '');
      const hit = rejected.find((r) => r.norm === norm);
      if (hit) {
        findings.push({
          file,
          line: i + 1,
          term: raw,
          canonical: hit.canonical,
          text: line.trim().slice(0, 100),
        });
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
