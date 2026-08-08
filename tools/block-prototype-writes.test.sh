#!/usr/bin/env sh
# Self-test for block-prototype-writes.sh  (ADR-0038 enforcement: "hook self-test")
#
# Deliberately dependency-free: it runs before any test runner exists in this
# workspace, and it must keep running if the test runner is ever swapped. A hook
# whose own test cannot run is a hook nobody verifies.
#
# Usage: sh tools/block-prototype-writes.test.sh

set -eu

HOOK="$(dirname "$0")/block-prototype-writes.sh"
pass=0
fail=0

# $1 label, $2 expected exit code, $3 JSON payload
check() {
  label=$1
  want=$2
  payload=$3

  got=0
  printf '%s' "$payload" | sh "$HOOK" >/dev/null 2>&1 || got=$?

  if [ "$got" = "$want" ]; then
    pass=$((pass + 1))
    printf 'ok    %s (exit %s)\n' "$label" "$got"
  else
    fail=$((fail + 1))
    printf 'FAIL  %s — wanted exit %s, got %s\n' "$label" "$want" "$got"
  fi
}

# --- Blocked: anything inside the frozen prototype (exit 2) ------------------
check 'relative prototype path'   2 '{"tool_input":{"file_path":"apps/prototype/App.tsx"}}'
check 'nested prototype path'     2 '{"tool_input":{"file_path":"apps/prototype/components/sales/RfqList.tsx"}}'
check 'dot-slash prefixed'        2 '{"tool_input":{"file_path":"./apps/prototype/constants.ts"}}'
check 'absolute prototype path'   2 '{"tool_input":{"file_path":"/Users/x/Website/engipro-manager/apps/prototype/types.ts"}}'
check 'prototype dotfile'         2 '{"tool_input":{"file_path":"apps/prototype/.env.local"}}'
check 'notebook_path variant'     2 '{"tool_input":{"notebook_path":"apps/prototype/nb.ipynb"}}'

# --- Allowed: everything else (exit 0) --------------------------------------
check 'apps/web'                  0 '{"tool_input":{"file_path":"apps/web/src/main.tsx"}}'
check 'apps/api'                  0 '{"tool_input":{"file_path":"apps/api/src/main.ts"}}'
check 'packages/domain'           0 '{"tool_input":{"file_path":"packages/domain/src/client.ts"}}'
check 'an ADR'                    0 '{"tool_input":{"file_path":"docs/decisions/ADR-0002.md"}}'
check 'repo root file'            0 '{"tool_input":{"file_path":"turbo.json"}}'

# A path that merely *contains* the word prototype must not be blocked — the
# rule is a directory prefix, not a substring match.
check 'prototype-like sibling'    0 '{"tool_input":{"file_path":"apps/web/src/prototype-notes.md"}}'
check 'packages/prototype-utils'  0 '{"tool_input":{"file_path":"packages/prototype-utils/index.ts"}}'

# --- Fails open, never closed, on malformed input ---------------------------
# A hook that wedges every edit because a payload changed shape is worse than
# one that lets a write through and relies on CI (ADR-0037) to catch it.
check 'empty payload'             0 ''
check 'not JSON'                  0 'this is not json'
check 'JSON without tool_input'   0 '{"tool_name":"Write"}'
check 'JSON without file_path'    0 '{"tool_input":{}}'

printf '\n%s passed, %s failed\n' "$pass" "$fail"
[ "$fail" = 0 ] || exit 1
