#!/usr/bin/env sh
# Domain purity: packages/domain must typecheck with ONLY TypeScript present.
# (ADR-0006 enforcement, verbatim: "A job removes all other node_modules entries
#  and runs tsc --noEmit on it." ADR-0005: "a decorator in that package fails to
#  compile.")
#
# Running tsc in place would not prove this. In the workspace, packages/domain can
# resolve anything pnpm has linked, and its tsconfig sets types: [] — which stops
# ambient @types but does nothing about an explicit `import { Injectable } from
# "@nestjs/common"`. That import would typecheck fine in place and violate the ADR.
#
# So: copy the sources into an isolated tree containing typescript and nothing else,
# and typecheck there. Anything the domain imports from outside itself fails to
# resolve, which is the point.
#
# This is the same claim dependency-cruiser's `domain-imports-nothing` rule makes,
# checked by an independent mechanism. Two mechanisms because this is the property
# that makes "the framework is replaceable" (ADR-0005) and "the ORM is behind ports"
# (ADR-0011) true rather than aspirational, and a single check that silently stops
# working takes both claims with it.
#
# Usage: sh tools/check-domain-purity.sh

set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
SRC="$ROOT/packages/domain"

[ -d "$SRC/src" ] || { printf 'check-domain-purity: %s/src not found.\n' "$SRC"; exit 1; }

if ! [ -d "$ROOT/node_modules/typescript" ]; then
  printf 'FAIL  typescript is not installed at the workspace root.\n'
  printf '      Without it there is no compiler to run and this check would\n'
  printf '      pass by doing nothing.\n'
  exit 1
fi

TMP=$(mktemp -d)
# shellcheck disable=SC2064
trap "rm -rf '$TMP'" EXIT

mkdir -p "$TMP/node_modules"
cp -R "$SRC/src" "$TMP/src"
cp "$SRC/tsconfig.json" "$TMP/tsconfig.json"

# Exactly one thing in node_modules: the compiler.
cp -RL "$ROOT/node_modules/typescript" "$TMP/node_modules/typescript" 2>/dev/null \
  || cp -R "$ROOT/node_modules/typescript" "$TMP/node_modules/typescript"

printf 'Isolated tree contains: %s\n' "$(ls "$TMP/node_modules" | tr '\n' ' ')"

if node "$TMP/node_modules/typescript/lib/tsc.js" --noEmit --project "$TMP/tsconfig.json"; then
  printf '\nok    packages/domain typechecks with only TypeScript present.\n'
  exit 0
fi

cat >&2 <<'EOF'

FAIL  packages/domain does not typecheck in isolation.

Every error above is an import reaching outside the domain layer. ADR-0006 makes
this layer plain TypeScript with no framework, no ORM, no SDK, and no other
workspace package — the domain is the one thing in this system that must survive
every vendor being replaced.

If the code genuinely needs an outside capability, that is an outbound PORT in
application/ports/ with its adapter in infrastructure/ (ADR-0006). It is never an
import here.
EOF
exit 1
