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
| [0039](ADR-0039.md) | ZATCA e-invoicing applicability — **BLOCKED** |
| [0040](ADR-0040.md) | Multi-currency deferred |
| [0041](ADR-0041.md) | Service level objectives |
| [0042](ADR-0042.md) | Audit retention — **BLOCKED** |
| [0043](ADR-0043.md) | Multi-role conflict resolution — **BLOCKED** |
| [0044](ADR-0044.md) | Explicit deny — **BLOCKED** |
| [0045](ADR-0045.md) | No cutover or data migration |

### Added during the completeness check
These were not in the agreed decision set. Each closes a conflict-register item that otherwise had no home, and each is expensive to retrofit.

| ADR | Decision | Closes |
|---|---|---|
| [0046](ADR-0046.md) | Public endpoints and the inbound integration boundary | C6 (S1) |
| [0047](ADR-0047.md) | UI data states and design system ownership | C8, C9 |
| [0048](ADR-0048.md) | Ubiquitous language and naming | C13 |

Also added inline, for the same reason: [0009](ADR-0009.md) testing strategy, [0014](ADR-0014.md) table conventions and migration lint, [0015](ADR-0015.md) primary keys, [0018](ADR-0018.md) time and calendars, [0019](ADR-0019.md) bilingual content, [0035](ADR-0035.md) secrets.

## Writing a new ADR

```bash
cp docs/decisions/TEMPLATE.md docs/decisions/ADR-00NN.md
```

Numbering is sequential and permanent. A reversed decision gets a new ADR that supersedes the old one; the old file is never edited except to change its Status line.
