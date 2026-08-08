#!/usr/bin/env sh
# PreToolUse hook: block writes to apps/prototype/**  (ADR-0002, ADR-0038)
#
# ADR-0002 freezes the prototype. ADR-0038's position is that a constraint which
# absolutely must not be violated cannot be an instruction, because instructions
# are probabilistic. This script is the deterministic form of that constraint.
#
# Contract with the harness:
#   stdin  — JSON describing the tool call, including .tool_input.file_path
#   exit 0 — allow the write
#   exit 2 — BLOCK the write; stderr is returned to the agent as the reason
#
# Any other non-zero exit is a hook malfunction, not a decision. This script
# therefore fails OPEN on its own internal errors (see the parse guard below):
# a broken hook must not wedge every edit in the repository. CI is the backstop
# for that window (ADR-0037), which is the division of labour ADR-0038 states.

set -eu

PROTECTED='apps/prototype/'

payload=$(cat)

# Extract the target path. node is a hard dependency of this repo (engines
# node>=20), so it is available wherever an agent is editing.
path=$(printf '%s' "$payload" | node -e '
  let raw = "";
  process.stdin.on("data", d => raw += d);
  process.stdin.on("end", () => {
    try {
      const j = JSON.parse(raw);
      const i = j.tool_input || {};
      // Write/Edit use file_path; NotebookEdit uses notebook_path.
      process.stdout.write(i.file_path || i.notebook_path || "");
    } catch {
      // Unparseable payload: emit nothing and let the caller fail open.
      process.stdout.write("");
    }
  });
' 2>/dev/null) || path=""

# No path resolved — either not a file-writing tool, or the payload changed
# shape. Fail open rather than blocking every edit on a parsing detail.
[ -n "$path" ] || exit 0

# Normalise to a repo-relative path so an absolute path cannot slip past.
# Strip everything up to and including the repo root if present.
case "$path" in
  */engipro-manager/*) rel=${path##*/engipro-manager/} ;;
  *)                   rel=$path ;;
esac
rel=${rel#./}

case "$rel" in
  "$PROTECTED"*)
    cat >&2 <<EOF
BLOCKED: $rel is inside the frozen prototype.

ADR-0002 freezes apps/prototype. It is workflow and UX prior art only, kept
runnable for stakeholder demos and as acceptance criteria for rebuilt flows.
Feature development on it has stopped, and it is deleted in a single PR once
apps/web surpasses it flow-for-flow.

If you are here to change behaviour: build it in apps/web instead.
If you are mining it: read it, do not edit it (ADR-0003).
If ADR-0002 genuinely needs to change: that is a new ADR superseding it, not
an edit to this file.
EOF
    exit 2
    ;;
esac

exit 0
