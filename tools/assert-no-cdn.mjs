#!/usr/bin/env node
/**
 * Assert a built HTML entry point resolves nothing at request time.
 * (ADR-0050 enforcement, also asserted in ADR-0032's image build)
 *
 * The frozen prototype loads Tailwind from a CDN `<script>` and React from esm.sh
 * through an import map (ADR-0002). Both mean dependencies are fetched when a user
 * opens the page, which is the same class of failure ADR-0032 exists to eliminate:
 * the predecessor's first production PDF request failed because a runtime
 * dependency was discovered at request time rather than at build time.
 *
 * A CDN script is worse than a build failure. It works on the developer's machine,
 * works in CI, and fails for a user on a restricted network or when the CDN is
 * unreachable — with no error anyone can reproduce.
 *
 * Usage: node tools/assert-no-cdn.mjs <path-to-built-index.html>
 */
import { readFileSync, existsSync } from 'node:fs';

const target = process.argv[2];
if (!target) {
  console.error('usage: node tools/assert-no-cdn.mjs <built index.html>');
  process.exit(2);
}
if (!existsSync(target)) {
  console.error(`assert-no-cdn: ${target} does not exist. Run the build first.`);
  process.exit(2);
}

const html = readFileSync(target, 'utf8');
const failures = [];

// Remote script sources.
for (const m of html.matchAll(/<script[^>]*\ssrc\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
  const src = m[1];
  if (/^(https?:)?\/\//i.test(src)) {
    failures.push(`remote <script src="${src}"> — bundle it instead`);
  }
}

// Import maps: the esm.sh pattern from the prototype.
if (/<script[^>]*type\s*=\s*["']importmap["']/i.test(html)) {
  failures.push('<script type="importmap"> — dependencies must be resolved at build time');
}

// Remote stylesheets, which is how CDN Tailwind usually arrives.
for (const m of html.matchAll(/<link[^>]*\shref\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
  const href = m[1];
  const tag = m[0];
  if (/^(https?:)?\/\//i.test(href) && /stylesheet/i.test(tag)) {
    failures.push(`remote stylesheet <link href="${href}"> — compile it into the bundle`);
  }
}

if (failures.length > 0) {
  console.error(`assert-no-cdn: ${target} resolves dependencies at request time\n`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error(
    '\nADR-0050 requires the built output to be self-contained. Tailwind is a build\n' +
      'dependency via @tailwindcss/vite; React and everything else is bundled by Vite.\n' +
      'The frozen prototype does the opposite — do not carry its setup across.',
  );
  process.exit(1);
}

console.log(`assert-no-cdn: ${target} is self-contained — no remote scripts, no import map.`);
