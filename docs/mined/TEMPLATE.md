# Mined: <module>

**Sources:** `ABAK_ERP/` · frozen prototype (`apps/prototype`) · Figma flowchart
**Date:** YYYY-MM-DD
**Status:** Draft | Complete

> Fill every section. A mining document exists to make prior-art knowledge
> reviewable *before* domain code exists (ADR-0003). An empty section is a
> question nobody answered, and the gate in `tools/check-mining-docs.sh` only
> checks that this file exists — it cannot check that it is honest.

## 1. Observed behaviour

What each prior-art system actually does. Behaviour, not intent — read the code
and the screens, not the documentation.

### In `ABAK_ERP/`
<!-- Cite file:line. Include the Prisma model, the service methods, the guards. -->

### In the frozen prototype
<!-- The validated, clicked-through workflow. This is an executable
     specification and is worth more than a written one because it has been
     exercised. Cite apps/prototype paths. -->

### In the Figma flowchart
<!-- The intended process, including steps neither codebase implements. -->

## 2. Verdict table

One row per behaviour, field, rule, or structure. Every row gets a reason —
"Reject" with no reason is how knowledge gets lost silently.

| # | Behaviour / field / rule | Source | Verdict | Reason |
|---|---|---|---|---|
| 1 | | | Keep / Modify / Reject | |

**Every `Reject` verdict needs a line in an ADR** (ADR-0003 clause 5), so that
"why is there no Lead table?" is answerable in eighteen months. List them:

| Rejected | ADR that records it |
|---|---|
| | |

## 3. Conflict register

Quote each relevant C-number **verbatim** from
`ABAK_ERP/blueprint/abak/99-conflicts.md`, including its severity and
`file:line` references. Do not paraphrase — the wording is the diagnosis.

| C-number | Verbatim | Severity | Status |
|---|---|---|---|
| C?? | > "…" | | Prevented / Accepted-as-is / Not applicable |

**`Prevented` is a claim with a cost.** `tools/check-cnumber-coverage.sh` fails
the build if a C-number marked `Prevented` here has no
`c<NN>-<description>.spec.ts` test. Mark it `Prevented` only when the test
exists or is landing in the same PR.

## 4. New contract

The Zod schema for this module. Not the old shape — the shape decided here.

```ts
// packages/contracts/src/<module>.ts
```

Note explicitly what is **absent** relative to the old model, and why. The old
prototype's `Client` inlined `interactions[]`, `documents[]` and
`statusHistory[]` — a screen projection, not an aggregate (ADR-0002). Absences
are decisions.

## 5. State machine

States, legal transitions, and what each transition requires.

| From | To | Trigger | Guard / required reason |
|---|---|---|---|
| | | | |

Illegal transitions are as important as legal ones — the state-machine suite
tests both (ADR-0029, ADR-0037).

## 6. Tests that prevent each old failure

The point of the whole exercise: the defect register becomes a test suite
instead of a document.

| Test file | Prevents | What it asserts |
|---|---|---|
| `c??-<description>.spec.ts` | C?? | |

**Characterization tests must be tagged with their C-number status.** A test
written against a known-good workflow of the old system faithfully re-encodes
that system's *defects* as "correct behaviour" unless it is tagged. ADR-0003
states this is mandatory, not optional, or this step actively harms.

## 7. Open questions

Anything the prior art does not answer and the flowchart does not settle.
Route each to a person or an ADR — an open question with no owner is a decision
that will be made by accident.

| Question | Owner | Blocks |
|---|---|---|
| | | |
