#!/usr/bin/env sh
# Self-test for the boundary configuration.  (ADR-0037 enforcement: "the boundary
# configuration has its own unit tests with deliberately non-compliant fixtures,
# so a broken checker is caught rather than silently passing everything.")
#
# This also discharges ADR-0008's explicit instruction:
#
#   "Before relying on rules 3 and 4, verify $1 back-reference support in the
#    installed dependency-cruiser version by committing a deliberate violation
#    and confirming CI fails. If unsupported, replace with explicit allow-lists
#    of barrel files."
#
# Rules 3 and 4 depend on $1 interpolation inside a negative lookahead. If the
# installed version does not support it, those two rules match nothing and
# report green — a silent hole in the two rules that carry C5, C18 and the
# app-to-app boundary. That failure mode is exactly why this file exists.
#
# The fixtures are built into a temp tree rather than committed at their real
# paths, because a committed apps/api/src/modules/... fixture would be a real
# workspace file that the real boundary run would then have to exclude.
#
# Usage: sh tools/dependency-cruiser.test.sh

set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
CONFIG="$ROOT/tools/.dependency-cruiser.js"

if ! [ -f "$CONFIG" ]; then
  printf 'FAIL  config not found at %s\n' "$CONFIG"
  exit 1
fi

# --- Is the checker installed yet? ------------------------------------------
# W1b lands this config; depcruise itself arrives with the first pnpm install,
# which is blocked on pnpm >= 9.5 for catalog support. Skip loudly rather than
# passing quietly: a skipped check that looks like a passing check is the thing
# this whole file is arguing against.
if ! [ -x "$ROOT/node_modules/.bin/depcruise" ]; then
  printf 'SKIP  dependency-cruiser is not installed — cannot verify the config.\n'
  printf '      This check is INCOMPLETE, not passing.\n'
  printf '      ADR-0008 rules 3 and 4 remain UNVERIFIED until this runs:\n'
  printf '        no-cross-module-internals  (carries C5, C18)\n'
  printf '        no-app-to-app\n'
  printf '      Run: pnpm install && sh tools/dependency-cruiser.test.sh\n'
  exit 0
fi

DEPCRUISE="$ROOT/node_modules/.bin/depcruise"

# dependency-cruiser needs the TypeScript compiler to resolve .ts sources. Without
# it, it emits `missing-typescript-transpiler`, parses nothing, and reports
# "0 modules, 0 dependencies cruised" — while exiting 0.
#
# This bit us: the first local run of this file passed 4/4 only because a stale
# node_modules from the pre-monorepo npm install still had typescript hoisted at the
# repo root. In clean CI there was no typescript, the rules matched nothing, and the
# $1 back-reference verification this file exists to perform silently did not happen.
#
# So: assert the transpiler is present before trusting any result below. An absent
# transpiler makes every assertion in this file vacuous, which is the exact
# failure mode the file was written to catch.
if ! [ -d "$ROOT/node_modules/typescript" ]; then
  printf 'FAIL  typescript is not installed.\n'
  printf '      dependency-cruiser cannot parse .ts sources without it and will\n'
  printf '      report "0 modules cruised" while exiting 0 — making every\n'
  printf '      assertion in this file pass vacuously.\n'
  printf '      Add typescript to the root devDependencies.\n'
  exit 1
fi
TMP=$(mktemp -d)
# shellcheck disable=SC2064
trap "rm -rf '$TMP'" EXIT

pass=0
fail=0

# $1 label, $2 rule name expected in the output
expect_violation() {
  label=$1
  rule=$2
  out=$("$DEPCRUISE" apps packages --config "$CONFIG" --output-type err 2>&1 || true)
  if printf '%s' "$out" | grep -q "$rule"; then
    pass=$((pass + 1))
    printf 'ok    %s → %s reported\n' "$label" "$rule"
  else
    fail=$((fail + 1))
    printf 'FAIL  %s → %s NOT reported. The rule matched nothing.\n' "$label" "$rule"
    printf '      depcruise output was:\n%s\n' "$out"
  fi
}

# --- Fixture tree ------------------------------------------------------------
cd "$TMP"
mkdir -p packages/domain/src \
         packages/database/src \
         apps/api/src/modules/clients/domain \
         apps/api/src/modules/quotations/domain \
         apps/web/src

# Rule 1 — domain must import nothing outside itself.
cat > packages/database/src/index.ts <<'EOF'
export const db = {};
EOF
cat > packages/domain/src/violates-rule-1.ts <<'EOF'
// Deliberate violation: the pure domain layer reaching for the database package.
import { db } from '../../database/src/index';
export const x = db;
EOF

# Rule 3 — one module reaching into another module's internals. This is C5/C18
# reproduced deliberately: the shape where the leads module wrote Client,
# PipelineEntry and Rfq in a single transaction.
cat > apps/api/src/modules/quotations/domain/quote.ts <<'EOF'
export type Quote = { id: string };
EOF
cat > apps/api/src/modules/clients/domain/violates-rule-3.ts <<'EOF'
// Deliberate violation: clients reaching into quotations' domain internals.
import type { Quote } from '../../quotations/domain/quote';
export type Held = Quote;
EOF

# Rule 4 — app importing another app.
cat > apps/web/src/violates-rule-4.ts <<'EOF'
// Deliberate violation: the frontend importing API internals instead of
// speaking HTTP to it.
import type { Quote } from '../../api/src/modules/quotations/domain/quote';
export type Shown = Quote;
EOF

# Rule 2 needs a real node_modules entry to resolve against.
#
# CRITICAL: the fixture mirrors pnpm's ACTUAL layout, not a flat one. An earlier
# version copied @nestjs/common straight to node_modules/@nestjs/common, which is
# npm/yarn shaped. That made the rule appear verified while it matched nothing in the
# real workspace, because pnpm resolves a vendor import to
#
#   node_modules/.pnpm/<name>@<version>_<peers>/node_modules/@nestjs/common/index.js
#
# The fixture tested the fixture. Both layouts are asserted below so the matcher
# cannot regress into working for only one of them.
mkdir -p node_modules/.pnpm/fixture/node_modules/@nestjs node_modules/@nestjs
NEST_COMMON=""
for cand in "$ROOT/node_modules/@nestjs/common" "$ROOT/apps/api/node_modules/@nestjs/common"; do
  [ -d "$cand" ] && NEST_COMMON=$cand && break
done
if [ -n "$NEST_COMMON" ]; then
  # pnpm-shaped (what this workspace actually produces)
  cp -RL "$NEST_COMMON" node_modules/.pnpm/fixture/node_modules/@nestjs/common 2>/dev/null \
    || cp -R "$NEST_COMMON" node_modules/.pnpm/fixture/node_modules/@nestjs/common
  # Relative to node_modules/@nestjs/, so the target needs to climb one level.
  ln -s ../.pnpm/fixture/node_modules/@nestjs/common node_modules/@nestjs/common 2>/dev/null || true
  cat > packages/domain/src/violates-rule-2.ts <<'FIXEOF'
// Deliberate violation: the HTTP framework inside the domain layer.
import { Injectable } from '@nestjs/common';
export const x = Injectable;
FIXEOF
fi
if [ -d "$ROOT/node_modules/drizzle-orm" ]; then
  cp -R "$ROOT/node_modules/drizzle-orm" node_modules/drizzle-orm
  cat > packages/domain/src/violates-rule-2b.ts <<'FIXEOF'
// Deliberate violation: an ORM inside the domain layer.
import { sql } from 'drizzle-orm';
export const q = sql;
FIXEOF
fi

# --- Assertions --------------------------------------------------------------
expect_violation 'domain imports another package'        'domain-imports-nothing'
expect_violation 'module reaches into another module'    'no-cross-module-internals'
expect_violation 'app imports another app'               'no-app-to-app'

if [ -f packages/domain/src/violates-rule-2.ts ]; then
  expect_violation 'framework imported into domain layer' 'no-vendor-in-domain-or-application'
else
  printf 'FAIL  no-vendor-in-domain-or-application could not be tested: @nestjs/common absent.\n'
  fail=$((fail + 1))
fi
if [ -f packages/domain/src/violates-rule-2b.ts ]; then
  expect_violation 'ORM imported into domain layer'      'no-vendor-in-domain-or-application'
else
  printf 'note  drizzle-orm variant of rule 2 not asserted; drizzle arrives in W3.\n'
fi

# --- The clean case must be clean -------------------------------------------
# A config that flags everything is as useless as one that flags nothing.
rm -f packages/domain/src/violates-rule-1.ts \
      packages/domain/src/violates-rule-2.ts \
      packages/domain/src/violates-rule-2b.ts \
      apps/api/src/modules/clients/domain/violates-rule-3.ts \
      apps/web/src/violates-rule-4.ts

if "$DEPCRUISE" apps packages --config "$CONFIG" --output-type err >/dev/null 2>&1; then
  pass=$((pass + 1))
  printf 'ok    compliant tree reports no violations\n'
else
  fail=$((fail + 1))
  printf 'FAIL  compliant tree reported violations — the config over-matches.\n'
fi

# --- The real run must actually examine something ---------------------------
# `depcruise apps packages` currently reports "no dependency violations found
# (0 modules, 0 dependencies cruised)" and exits 0. That is truthful today —
# packages/ is empty and apps/prototype is excluded (ADR-0002) — but a green
# result against zero modules is indistinguishable from a green result against
# a compliant codebase.
#
# This is the same failure as an ESLint rule scoped to a directory that does not
# exist: the check reports success because it matched nothing. Once there is a
# subject, a zero-module cruise means the gate has silently stopped working —
# a bad glob, a moved directory, a renamed app.
cd "$ROOT"
if [ -d apps/api/src ] || [ -n "$(find packages -mindepth 2 -name src -type d 2>/dev/null)" ]; then
  # Parse the JSON summary, not the human text output. The text reporter only
  # prints "(N modules, N dependencies cruised)" in its no-violations-found
  # phrasing, so scraping it reported 0 whenever modules actually existed — a
  # false alarm in the guard written to catch false greens.
  cruised=$("$DEPCRUISE" apps packages --config "$CONFIG" --output-type json 2>/dev/null \
    | node -e 'let r="";process.stdin.on("data",d=>r+=d).on("end",()=>{try{console.log(JSON.parse(r).summary.totalCruised||0)}catch{console.log(0)}})')
  cruised=${cruised:-0}
  if [ "$cruised" -gt 0 ]; then
    pass=$((pass + 1))
    printf 'ok    real tree cruised %s modules\n' "$cruised"
  else
    fail=$((fail + 1))
    printf 'FAIL  a subject exists but depcruise cruised 0 modules.\n'
    printf '      The gate is reporting green because it matched nothing.\n'
    printf '      Check the globs in package.json check:boundaries and the\n'
    printf '      exclude patterns in tools/.dependency-cruiser.js.\n'
  fi
else
  printf 'note  real tree has no subject yet (packages/ empty, prototype excluded),\n'
  printf '      so "0 modules cruised" is expected. This assertion activates with\n'
  printf '      the first apps/api/src or packages/*/src.\n'
fi

printf '\n%s passed, %s failed\n' "$pass" "$fail"
[ "$fail" = 0 ] || exit 1
