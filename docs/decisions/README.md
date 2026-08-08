# Architecture Decision Records

Format: [Michael Nygard, *Documenting Architecture Decisions*](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) (2011), extended with a mandatory **Enforcement** section.

## Why the Enforcement section exists

The predecessor system (`ABAK_ERP/`) shipped with a 23-item defect register (`blueprint/abak/99-conflicts.md`). Roughly two thirds of those defects were mechanically preventable — they existed because a rule was written in a document rather than encoded in a lint rule, a database constraint, or a CI check. C1 is the canonical example: a permission engine was added, the role checks it replaced were never deleted, and the two disagreed in production.

Therefore: **an ADR without an enforcement mechanism is a suggestion, and suggestions decay.** Every ADR must state how it is enforced by code, tests, lint, database constraints, CI, agent hooks, or deployment automation. Where a decision genuinely cannot be enforced mechanically, the ADR says so explicitly — that is a signal it may not need to be an ADR at all.

## Status values

| Status | Meaning |
|---|---|
| `Proposed` | Drafted, awaiting review. **Nothing here is Accepted until reviewed.** |
| `Proposed — BLOCKED on X` | Cannot be finalised until open question X is answered. Context is written so it can be closed in minutes. |
| `Accepted` | Reviewed and in force |
| `Superseded by ADR-NNNN` | Replaced |
| `Deprecated` | No longer relevant |

## Index

### Foundation
| ADR | Decision |
|---|---|
| [0001](ADR-0001.md) | Monorepo tooling and structure |
| [0002](ADR-0002.md) | Freeze the prototype at `apps/prototype` |
| [0003](ADR-0003.md) | Prior-art mining protocol |
| [0004](ADR-0004.md) | Modular monolith behind a standalone API |
| [0005](ADR-0005.md) | NestJS with the Fastify adapter |
| [0006](ADR-0006.md) | Hexagonal architecture: outbound ports only |
| [0007](ADR-0007.md) | Selective DDD by module tier |
| [0008](ADR-0008.md) | Boundary enforcement with dependency-cruiser |
| [0009](ADR-0009.md) | Testing strategy |

### Backend
| ADR | Decision |
|---|---|
| [0010](ADR-0010.md) | REST + OpenAPI generated from Zod contracts |
| [0011](ADR-0011.md) | Drizzle as the ORM |

### Data
| ADR | Decision |
|---|---|
| [0012](ADR-0012.md) | PostgreSQL as the only datastore |
| [0013](ADR-0013.md) | Schema per bounded context, no cross-schema FKs |
| [0014](ADR-0014.md) | Standard table conventions and migration lint |
| [0015](ADR-0015.md) | Primary keys: UUIDv7 |
| [0016](ADR-0016.md) | Money representation |
| [0017](ADR-0017.md) | Tenancy: `organization_id` from day one |
| [0018](ADR-0018.md) | Time, dates, and calendars |
| [0019](ADR-0019.md) | Bilingual content model |
| [0020](ADR-0020.md) | Identity owned in-house |
| [0021](ADR-0021.md) | Hand-rolled permission model |
| [0022](ADR-0022.md) | Row Level Security scope |
| [0023](ADR-0023.md) | Soft deletes |
| [0024](ADR-0024.md) | Audit log |
| [0025](ADR-0025.md) | Business number allocation |
| [0026](ADR-0026.md) | Transactional outbox |
| [0027](ADR-0027.md) | Job queue: graphile-worker |
| [0028](ADR-0028.md) | Internal notification model |
| [0029](ADR-0029.md) | Workflow, status, and state machines |
| [0030](ADR-0030.md) | Reporting strategy |
| [0031](ADR-0031.md) | Backups with WAL-G |

### Infrastructure
| ADR | Decision |
|---|---|
| [0032](ADR-0032.md) | Docker from commit #1 |
| [0033](ADR-0033.md) | Single domain, no CORS |
| [0034](ADR-0034.md) | Object storage |
| [0035](ADR-0035.md) | Secrets management |
| [0036](ADR-0036.md) | Observability |
| [0037](ADR-0037.md) | CI/CD pipelines |
| [0038](ADR-0038.md) | Agent guardrails |

### Conditional and deferred
| ADR | Decision |
|---|---|
| [0039](ADR-0039.md) | ZATCA e-invoicing applicability — **Accepted**, applies |
| [0040](ADR-0040.md) | Multi-currency deferred |
| [0041](ADR-0041.md) | Service level objectives |
| [0042](ADR-0042.md) | Audit retention — **Accepted** |
| [0043](ADR-0043.md) | Multi-role conflict resolution — **Superseded by 0049** |
| [0044](ADR-0044.md) | Explicit deny — **Accepted**, dropped |
| [0045](ADR-0045.md) | No cutover or data migration |

### Added during the completeness check
These were not in the agreed decision set. Each closes a conflict-register item that otherwise had no home, and each is expensive to retrofit.

| ADR | Decision | Closes |
|---|---|---|
| [0046](ADR-0046.md) | Public endpoints and the inbound integration boundary | C6 (S1) |
| [0047](ADR-0047.md) | UI data states and design system ownership | C8, C9 |
| [0048](ADR-0048.md) | Ubiquitous language and naming | C13 |

Also added inline, for the same reason: [0009](ADR-0009.md) testing strategy, [0014](ADR-0014.md) table conventions and migration lint, [0015](ADR-0015.md) primary keys, [0018](ADR-0018.md) time and calendars, [0019](ADR-0019.md) bilingual content, [0035](ADR-0035.md) secrets.

### Added while resolving the blocked decisions (2026-08-08)

| ADR | Decision | Status |
|---|---|---|
| [0049](ADR-0049.md) | Multi-role resolution and approval authority limits | **Accepted** — supersedes 0043 |
| [0050](ADR-0050.md) | Frontend application stack for `apps/web` | **Accepted** |
| 0051 | Offline sync strategy | **Reserved** — spike in progress |

**0051 is a known gap, deliberately recorded rather than left implicit.** The requirements call for offline support for mobile sales reps and no ADR says how it works. Hand-rolling a mutation queue with replay and conflict resolution on a *quotation* system risks two divergent versions of a price, which is a correctness problem with financial consequences. It should land as `Proposed — BLOCKED` pending a spike that compares a local-first sync engine against hand-rolling, evaluated specifically against RLS (ADR-0022) and `organization_id` scoping (ADR-0017). The number is held so the gap cannot be forgotten.

## Ratification order

Statuses are not all moved at once. The waves below are a **review order**, derived from dependency shape:

| Wave | ADRs | Why here |
|---|---|---|
| **W1a — substrate** ✅ **Accepted 2026-08-08** | 0001, 0002 | These are not *governed by* the enforcement gate; they **are** the substrate it presupposes. Dependency-cruiser, CI, and the agent guardrails have nothing to run against until a workspace exists. |
| **W1b — machinery** ✅ **Accepted 2026-08-08** | 0003, 0008, 0037, 0038 | Every other ADR's Enforcement section assumes CI, dependency-cruiser, and the agent guardrails exist. Accepting a decision whose enforcement mechanism is itself unratified is how the predecessor got C1. Ratified **and installed** — running and green, not merely Accepted. Fully closed: the prototype-freeze hook is wired via `.claude/settings.json`, `CLAUDE.md` is committed and length-checked, and `$1` back-reference support is verified on dependency-cruiser 18.1.1 rather than assumed. |
| **W2 — architecture shape** ✅ **Accepted 2026-08-08** | 0004, 0005, 0006, 0007, 0009, 0010, 0011 | Shells scaffolded: `packages/domain`, `packages/contracts`, `apps/api`, `apps/web`. ADR-0008's live-fire demo run — it found that `no-vendor-in-domain-or-application` had never fired under pnpm. See ADR-0008. |
| **W3 — data foundation** | 0012, 0013, 0014, 0015, 0016, 0017, 0018, 0019, 0023, 0025 | |
| **W4 — identity and authorization** | 0020, 0021, 0022, 0044, 0049 | 0049 is written and Accepted in the same sitting as 0043's supersede, so authorization is never in a state where the approval control is described nowhere. |
| **W5 — platform mechanics** | 0024, then 0042, 0026, 0027, 0028, 0029, 0030 | 0042 depends on both 0024 and 0039. |
| **W6 — infrastructure** | 0031, 0032, 0033, 0034, 0035, 0036, 0041 | |
| **W7 — conditional and scope** | 0039, 0040, 0045, 0046, 0047, 0048 | |

**Three gates, in plain terms:**

1. **No code beyond the W1a skeleton until W1b is installed and green.**
2. **No migration before W3 and W4.**
3. **No domain module before [0048](ADR-0048.md) and its `docs/mined/` documents** ([0003](ADR-0003.md)). 0048 is listed last by dependency but is a hard gate on domain code — if domain work is reached before W7, pull 0048 forward.

### Why W1 splits

An earlier form of gate 1 read "no code before W1" with 0001 and 0002 inside W1. That is circular and therefore unsatisfiable: the machinery cannot be installed until a workspace exists, and the workspace cannot be created until the machinery is ratified. A gate that cannot be satisfied is a bug in the gate, so W1a is exempt from it.

**The exemption is bounded to exactly this, so that "substrate" does not become a loophole:**

- `pnpm-workspace.yaml`, `turbo.json`, root `package.json`, `.npmrc`, `.gitignore`
- empty `apps/` and `packages/` directories
- the `git mv` of the flat prototype into `apps/prototype`

Nothing else. **No `apps/api`, no `apps/web`, no `packages/*` contents, no `infra/docker/`, and not one line of application code** — including `apps/web`, even though [ADR-0050](ADR-0050.md) is Accepted and the stack is settled. Scaffolding an application is precisely the code the machinery exists to govern from its first commit, and ADR-0032's thesis is that the first commit is where this is won or lost.

The skeleton and the `git mv` land as **two separate commits**, so the rename stays a reviewable pure-rename diff.

Two things are already ratified ahead of their wave, deliberately: **0039, 0042, 0044, 0049** because they were blocking, and the **0032 amendment** for the frontend topology, because an unratified framework assumption sitting inside an infrastructure document for the duration of W1–W5 is the C1 shape — a stale assumption surviving because the document that contradicts it is somewhere else.

**Scope caveat on the waves**: this is *sequencing*, not a content review of all 50 bodies. Treat a wave as "safe to review together", not "known correct".

## Writing a new ADR

```bash
cp docs/decisions/TEMPLATE.md docs/decisions/ADR-00NN.md
```

Numbering is sequential and permanent. A reversed decision gets a new ADR that supersedes the old one.

A superseded file's **body is never rewritten** — it is the record of the reasoning that led somewhere. It may gain two things and nothing else: its new `Status` line, and a note directly beneath it stating what superseded it and why, including any part of the body that must not be implemented. ADR-0043 is the worked example. Editing a superseded body to make it look correct in hindsight destroys the only thing it is still for.
