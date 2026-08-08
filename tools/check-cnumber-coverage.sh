#!/usr/bin/env sh
# C-number coverage gate: every conflict-register item a mining doc claims to
# PREVENT must have at least one matching characterization test.
# (ADR-0003 enforcement, clause 4 / test naming convention)
#
# ADR-0003's warning is that characterization tests "capture bugs as faithfully
# as correct behaviour", so the C-number tagging is mandatory or the step
# actively harms. This script is what makes the tagging load-bearing: a mining
# doc that claims a defect is prevented, with no test behind the claim, fails.
#
# Convention: tests are named c<NN>-<description>.spec.ts
# Claim syntax in a mining doc: a line containing "C<NN>" and "Prevented"
# (case-insensitive), which is what the TEMPLATE's verdict table produces.
#
# Usage: sh tools/check-cnumber-coverage.sh

set -eu

if ! [ -d docs/mined ]; then
  printf 'check-cnumber-coverage: docs/mined does not exist yet. OK.\n'
  exit 0
fi

docs=$(find docs/mined -name '*.md' ! -name 'TEMPLATE.md' 2>/dev/null || true)
if [ -z "$docs" ]; then
  printf 'check-cnumber-coverage: no mining documents yet. OK.\n'
  exit 0
fi

missing=''
checked=0

for doc in $docs; do
  # Every C-number on a line that also says "prevented".
  #
  # NOTE: `.*` not `[^\n]*`. POSIX grep does not interpret \n inside a bracket
  # expression — `[^\n]` means "not a backslash and not the letter n", so any
  # quoted defect text containing an 'n' failed to match and this gate reported
  # "no prevented claims found" against a document making six of them. It only
  # appeared to work interactively because this shell shims grep to ugrep, which
  # reads `[^\n]` the PCRE way. grep is line-oriented, so `.` already excludes
  # newlines.
  claims=$(grep -oiE 'C[0-9]{1,2}.*prevented|prevented.*C[0-9]{1,2}' "$doc" 2>/dev/null \
    | grep -oiE 'C[0-9]{1,2}' \
    | tr 'a-z' 'A-Z' \
    | sort -u || true)

  # A mining document is written BEFORE the module's domain code — that is the whole
  # protocol (ADR-0003 clause 1). So a "Prevented" claim only becomes load-bearing
  # once the module exists; enforcing it earlier would make a correct, complete
  # mining document impossible to commit.
  #
  # The claim is not forgotten in the meantime: it is listed as PENDING below, and
  # the moment apps/api/src/modules/<module>/ appears, this gate starts failing until
  # the tests land. That is the same staged-activation rule the CI pipeline uses.
  module=$(basename "$doc" .md)
  if ! [ -d "apps/api/src/modules/$module" ]; then
    if [ -n "$claims" ]; then
      printf 'PENDING  %-14s claims %s — enforced when apps/api/src/modules/%s/ lands\n' \
        "$(basename "$doc")" "$(printf '%s' "$claims" | tr '\n' ' ')" "$module"
    fi
    continue
  fi

  for c in $claims; do
    checked=$((checked + 1))
    num=$(printf '%s' "$c" | sed 's/^C//')
    # Zero-padded and bare forms both acceptable: c05-... or c5-...
    padded=$(printf 'c%02d' "$num")
    bare=$(printf 'c%d' "$num")

    if find . -path ./node_modules -prune -o \
              \( -name "${padded}-*.spec.ts" -o -name "${bare}-*.spec.ts" \) -print 2>/dev/null \
       | grep -q .; then
      printf 'ok    %-12s %s claimed prevented, test found\n' "$(basename "$doc")" "$c"
    else
      printf 'FAIL  %-12s %s claimed prevented, NO test named %s-*.spec.ts\n' \
        "$(basename "$doc")" "$c" "$padded"
      missing="$missing $(basename "$doc"):$c"
    fi
  done
done

if [ "$checked" = 0 ]; then
  printf 'check-cnumber-coverage: no enforceable claims yet across %s document(s). OK.\n' \
    "$(printf '%s\n' $docs | wc -l | tr -d ' ')"
  printf '  Any PENDING lines above are claims awaiting their module; they are not passing.\n'
  exit 0
fi

if [ -n "$missing" ]; then
  cat >&2 <<EOF

Unbacked "prevented" claims:$missing

A mining document that claims a conflict-register defect is prevented, with no
test behind the claim, is worse than one that says nothing: it reads as
verified. ADR-0003 makes the C-number tagging mandatory for exactly this
reason.

Either add the test:
  c<NN>-<description>.spec.ts
or change the verdict in the mining doc to state what is actually true.
EOF
  exit 1
fi

exit 0
