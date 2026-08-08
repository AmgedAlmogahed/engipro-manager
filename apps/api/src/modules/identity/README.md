Tier: Medium

Identity — users, their status lifecycle, and the link to Departments and Roles.

Medium tier per ADR-0007: entities and a state machine where status exists, thin
use-cases, ports for outbound I/O. Not Rich — identity holds one aggregate with one
state machine and no pricing, approval or scheduling policy. Not Thin — it has real
invariants (the last-admin guard), so it needs a `domain/` folder.

Mined from `docs/mined/identity.md` before any code here existed (ADR-0003).

**This module is the reference implementation of ADR-0029.** Read `domain/user.ts`
before adding a state machine elsewhere. Status is not a writable field: there is no
setter, only `transition()`.
