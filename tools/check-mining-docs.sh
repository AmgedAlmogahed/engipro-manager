#!/usr/bin/env sh
# Mining gate: no new domain code for a module until docs/mined/<module>.md exists.
# (ADR-0003 enforcement, clause 1)
#
# The failure mode this guards against is the old repository becoming a hidden
# source of truth — a developer with ABAK_ERP open in a second window, copying
# structure by osmosis while believing they are designing fresh. Mining first
# turns that into a reviewable artifact.
#
# Usage:
#   sh tools/check-mining-docs.sh <base-ref>
#   sh tools/check-mining-docs.sh origin/main
#
# Exits non-zero listing every module that added domain code without a mining doc.

set -eu

BASE=${1:-origin/main}

if ! git rev-parse --verify --quiet "$BASE" >/dev/null; then
  printf 'check-mining-docs: base ref "%s" not found; nothing to compare.\n' "$BASE"
  exit 0
fi

# Modules touched in this change under apps/api/src/modules/<x>/domain/
modules=$(git diff --name-only --diff-filter=AM "$BASE"...HEAD \
  | sed -n 's#^apps/api/src/modules/\([^/]*\)/domain/.*#\1#p' \
  | sort -u)

if [ -z "$modules" ]; then
  printf 'check-mining-docs: no domain code added or modified. OK.\n'
  exit 0
fi

missing=''
for m in $modules; do
  if [ -f "docs/mined/$m.md" ]; then
    printf 'ok    %-14s docs/mined/%s.md exists\n' "$m" "$m"
  else
    printf 'FAIL  %-14s docs/mined/%s.md MISSING\n' "$m" "$m"
    missing="$missing $m"
  fi
done

if [ -n "$missing" ]; then
  cat >&2 <<EOF

Domain code was added for:$missing
without the corresponding mining document.

ADR-0003 requires the prior art be mined into a written artifact BEFORE domain
code exists, so that business knowledge survives in reviewable form and the
defect register (C1-C23) becomes a test suite rather than a document.

Start from the template:
  cp docs/mined/TEMPLATE.md docs/mined/<module>.md

Mining order follows dependencies:
  Identity/Access/Org -> CRM -> Sales -> Delivery -> Finance
EOF
  exit 1
fi

exit 0
