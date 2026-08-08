# engipro-manager

Abak/Engipro ERP. Architecture decisions live in `docs/decisions/` — 50 ADRs, each
with a mandatory Enforcement section. **The mechanism is the linter, the hook, or
the CI check. This file is the explanation, not the enforcement.**

## 1. Map

- `apps/prototype` — **frozen** (ADR-0002). Workflow and UX prior art, kept runnable
  for demos and as acceptance criteria. Not a workspace member; writes are blocked
  by a hook. Deleted in one PR once `apps/web` surpasses it.
- `apps/api`, `apps/web`, `packages/*` — **do not exist yet, on purpose.** They are
  gated by the ratification waves in `docs/decisions/README.md`. Check the wave
  before scaffolding.
- Packages are extracted **on the second consumer**, not in anticipation (ADR-0001).
  Until then, code lives inside its single consumer.
- `docs/mined/` — prior-art mining documents. **No domain code for a module until
  `docs/mined/<module>.md` exists** (ADR-0003). CI enforces this.
- `tools/` — enforcement scripts. Each has a self-test; a checker nobody verifies is
  a checker that silently passes everything.
- `../../ABAK_ERP/` — the predecessor. **Read-only, never imported, never a workspace
  member.** It is mined into artifacts, not referenced from code.

## 2. Commands

```bash
pnpm install                       # pnpm >= 9.5 required (catalogs); pin is 10.0.0
pnpm build                         # turbo run build
pnpm typecheck
pnpm check:boundaries              # dependency-cruiser — the blocking gate (ADR-0008)
pnpm check:hooks                   # hook self-test
pnpm check:boundaries:self-test    # boundary config self-test, with fixtures
pnpm check:paths                   # every ADR path literal resolves or has an owner
```

## 3. Hard rules

Each is enforced mechanically. The ADR says why.

- **Boundaries** (ADR-0008): domain imports nothing outside itself; no module reaches
  into another module's `domain/`, `application/` or `infrastructure/`; no app imports
  another app. `eslint-disable` on a boundary rule **is itself a lint error** —
  exceptions are reviewed rule changes, never inline suppressions.
- **Vendor purity** (ADR-0006, ADR-0008): no framework, ORM, or SDK import in a
  `domain/` or `application/` layer. This is what makes "the ORM is replaceable" a
  fact rather than an intention.
- **Money** (ADR-0016): `numeric(19,4)`. Never a float, never the `money` type.
- **Time** (ADR-0018): `timestamptz`, UTC in storage. Hijri is presentation only.
- **Base columns** (ADR-0014, ADR-0015, ADR-0017): UUIDv7 primary keys,
  `organization_id` on every table, audit columns. Migration lint enforces it.
- **Permissions are data** (ADR-0021, ADR-0049): no role literal in code. Multi-role
  resolution is a most-permissive union; monetary approval limits are approval
  authority, evaluated by the workflow engine, never in the resolver.
- **Nothing is deleted** (ADR-0023): archive or soft-delete with a reason.

## 4. Permissions

**Always** — run lint, tests, and the self-tests; write tests; draft `docs/mined/`
documents.

**Ask first** — schema migrations; new dependencies; changes to `packages/domain` or
`packages/contracts`; editing any ADR; bumping a pinned version.

**Never** —
- modify `apps/prototype` (ADR-0002)
- edit an existing ADR's **Decision** section — supersede it with a new ADR instead
- force-push
- commit directly to `main`
- **add restriction or licensing mechanisms of any kind** — no licence enforcement,
  no tenant control plane, no phone-home, no anti-scaling measures. Not deferred:
  absent, permanently (ADR-0017, open question B).

## 5. Pointers

- Conflict register: `../../ABAK_ERP/blueprint/abak/99-conflicts.md` — C1–C23,
  diagnosed defects of the predecessor with severities and `file:line`. Roughly two
  thirds were mechanically preventable. This set exists to prevent them.
- Mining template: `docs/mined/TEMPLATE.md`.
- Ratification waves and gates: `docs/decisions/README.md`.

## 6. The ADR obligation

**Every architectural decision gets an ADR**, and every ADR states how it is enforced.
A decision recorded without an enforcement mechanism is a suggestion, and suggestions
decay — that is how the predecessor accumulated C1–C23. If a rule cannot be enforced
mechanically, the ADR must say so explicitly.
