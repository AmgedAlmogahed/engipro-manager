# Mined: identity

**Sources:** `ABAK_ERP/` · frozen prototype (`apps/prototype`) · Figma flowchart · `ABAK_ERP/blueprint/abak/01-actors.md`, `05-permissions.json`
**Date:** 2026-08-08
**Status:** Draft — contract section pending W4 ratification of ADR-0020/0021

## 1. Observed behaviour

### In `ABAK_ERP/`

Authentication (`packages/api/src/modules/auth/`):

- **JWT access token (15m) + database-stored refresh token with single-use rotation.** `auth.service.ts:96-133`: refresh verifies the JWT, looks the token up in `refreshToken` table, deletes it, and issues a new pair. Expired stored tokens are deleted on sight. Rotation is genuinely single-use — replay of a used refresh token fails. This part is *good* prior art.
- **The JWT payload carries the role**: `issueTokens()` signs `{ sub, email, role }` (`auth.service.ts:152-155`). Authorization data is baked into a bearer credential valid for 15 minutes — a role change does not take effect until token expiry, and every consumer is invited to read `payload.role` directly. This is the transport-level half of C1.
- **Access and refresh tokens are signed with the same secret** (`auth.jwtSecret` for both, `auth.service.ts:98,155-162`), differing only in expiry. A leaked refresh-verification path verifies access tokens and vice versa.
- **`User.role` is a single Prisma enum column.** One user = one hardcoded role. The permission engine (`permissions.service.ts`, `scope.util.ts` with `OWN`/`DEPARTMENT`/`ALL` scopes) exists *beside* it, and services branch on the enum: `quotes.service.ts:2431-2435`, `projects.service.ts:1020-1033` (C1).
- **Manager designation is a hardcoded `Set`** in `permission.guard.ts:22-32`, unlocking `rfq:assign_pricers` etc. for department managers — contradicting the blueprint's own rule that manager unlocks flow from `Department.managerId` as data (C14).
- **Guards exist and are bypassable by mismatch, not by absence**: `rfq.decline` is gated on `rfq:assign_pricers` — a different capability (C2). `client.close_followup` / `client.delete_note` fetch by id with no scope assertion (C21). `opportunity.create` and `target.create` are gated on `pipeline:move` (C23).
- `lastLoginAt` stamped on login; `getProfile` returns `id, email, firstName, lastName, phone, avatar, role, status, createdAt, lastLoginAt`.
- `@Public()` decorator exists; its one production use is the chatbot lead intake (C6 — owned by the leads mining doc and ADR-0046, not here).
- Auth events are **not** audited: no login/refresh/logout rows in the audit trail (C10, identity slice).

### In the frozen prototype

- **No authentication of any kind.** A mock `currentUser` and a `TEAM_MEMBERS` array in `constants.ts:11-38` with **free-text role strings** (`'Senior Project Manager'`, `'CFO'`).
- A roles-management screen (`components/roles/`) with permission-key checkboxes (`constants.ts:1056` `manage_roles` etc.) — validated UX for role editing, backed by nothing.
- An audit-log screen rendering strings like "Created 'Intern' role" (`constants.ts:1129`) — validated UX for viewing an audit trail.
- What the prototype validates for identity is therefore **the admin UX only**: role editor, permission checkboxes, audit viewer. It validates no auth flow.

### In the Figma flowchart

Roles appear as swimlanes (Sales Rep, Sales Manager, RFQ Engineer, Technical Dept. Head, CEO). No login, session, or identity flow is drawn anywhere — identity is assumed. The flowchart contributes the *actor list*, nothing mechanical.

### In the blueprint (`01-actors.md`, `05-permissions.json`)

The strongest prior art in this module:

- "An actor is a *function*, not a job title. **No code may branch on a role name.** Authorization is one call: `authorize(actor, action, resource)`."
- Permission catalog: `module:action` keys, each `scopeable`, with scope semantics defined: `OWN` = rows the actor owns; `DEPARTMENT` = manager sees the department, member sees own; `ALL` = unrestricted.
- Two non-human actors specified: **System (cron)** — auditable, "must never perform an action a human could not do unattended"; **Anonymous (chatbot)** — a trust boundary with exactly one reachable route.

## 2. Verdict table

| # | Behaviour / field / rule | Source | Verdict | Reason |
|---|---|---|---|---|
| 1 | Single-use rotating DB refresh tokens, replay-safe | ABAK_ERP `auth.service.ts:96-133` | **Keep** | Correct design, verified by reading the delete-before-reissue order |
| 2 | JWT payload `{sub, email, role}` | ABAK_ERP `auth.service.ts:152` | **Reject** | Authorization data in a bearer credential: stale on role change, invites `payload.role` reads. Token/session carries identity only (`sub`); permissions resolved server-side per request |
| 3 | Same signing secret for access + refresh | ABAK_ERP `auth.service.ts:98,155` | **Reject** | Token-type confusion risk for one config line of savings. ADR-0020 owns the replacement mechanism |
| 4 | Bearer tokens held by the client (Next.js era) | ABAK_ERP | **Reject** | ADR-0033 already decides `httpOnly` cookies, `SameSite=Lax`, no `Domain` — XSS-readable storage rejected there |
| 5 | `User.role` single enum column | ABAK_ERP `schema` | **Reject** | The structural root of C1. Replaced by role/permission tables per ADR-0021; a user holds N roles |
| 6 | Role-name branches in services | `quotes.service.ts:2431`, `projects.service.ts:1020` | **Reject** | C1 itself. `authorize()` is the only entry point; role-literal lint enforces |
| 7 | Manager unlock via hardcoded `Set` | `permission.guard.ts:22-32` | **Reject** | C14. Manager designation is `Department.managerId` — data, resolved by the permission resolver |
| 8 | Permission catalog `module:action`, scopeable, `OWN`/`DEPARTMENT`/`ALL` semantics | blueprint `05-permissions.json` | **Keep** | Well-specified, matches ADR-0021's model. Scope semantics adopted verbatim |
| 9 | "No code branches on a role name" + `authorize(actor, action, resource)` | blueprint `01-actors.md` | **Keep** | The rule the old code violated; the rebuild enforces it mechanically (lint + role-matrix suite) |
| 10 | System actor: auditable cron identity | blueprint `01-actors.md` | **Keep** | Adopted; representation (service-account row vs. synthetic id) is an ADR-0020 question |
| 11 | Anonymous actor: single-route trust boundary | blueprint `01-actors.md` | **Keep** (elsewhere) | Owned by ADR-0046 and the leads mining doc |
| 12 | `lastLoginAt` stamped on login | ABAK_ERP | **Keep** | Cheap, useful for dormant-account review |
| 13 | Free-text role strings | prototype `constants.ts:17-24` | **Reject** | Mock-data artifact, not a design |
| 14 | Role editor / permission-checkbox / audit-viewer UX | prototype `components/roles/` | **Keep** | Validated screens; rebuilt in `apps/web` against real tables |
| 15 | `User.status` free enum, no transitions | ABAK_ERP | **Modify** | Becomes a state machine (§5) with required reasons, per ADR-0029/0023 |
| 16 | Auth events unaudited | ABAK_ERP (C10 slice) | **Modify** | Login success/failure, refresh, logout, grant/revoke all audited (ADR-0024) |
| 17 | Hard delete of users | ABAK_ERP | **Reject** | ADR-0023: archived, never deleted; `archived` is terminal (§5) |

| Rejected | ADR that records it |
|---|---|
| `role` in token payload, role column, role-name branches (2, 5, 6) | ADR-0021 (hand-rolled permissions; role literals are lint errors) |
| Same-secret tokens, bearer storage (3, 4) | ADR-0020 (session mechanism) · ADR-0033 (cookies) |
| Hardcoded manager set (7) | ADR-0021 (manager designation is data — C14 clause) |
| Hard deletes (17) | ADR-0023 (soft deletes) |
| Free-text roles (13) | ADR-0002 (prototype freeze — mock data is not prior art for schema) |

## 3. Conflict register

| C-number | Verbatim | Severity | Status |
|---|---|---|---|
| C1 | > "Two authorization models coexist. Hardcoded `UserRole` checks live beside the permission engine, and they disagree." — `quotes.service.ts:2431-2435`, `projects.service.ts:1020-1033`, `permission.guard.ts:22-32` | S2 | **Prevented** — no role column exists to check; role-literal lint; `c01` test |
| C2 | > "`rfq.decline` is guarded by `rfq:assign_pricers` — a different capability. A pricer entitled to decline cannot; a manager entitled to assign can decline unnoticed. `rfq:price_section` and `rfq:set_lead_pricer` are defined but used by no route (orphan keys)." — `rfqs.controller.ts:98`; catalog in `prisma/seed-rbac.ts` | S1 | **Prevented** — route↔key parity check: every route's declared key exists in the catalog, every catalog key is used by ≥1 route or explicitly marked reserved; `c02` test |
| C14 | > "Manager-designation unlocks are a hardcoded `Set` in the guard, not data — and the set contains out-of-slice keys. Managers cannot be reconfigured without a code change, contradicting the delegable-permissions requirement." — `permission.guard.ts:22-32` | S2 | **Prevented** — resolver reads `Department.managerId`; changing a manager is a data change asserted by `c14` test |
| C21 | > "Missing ownership checks: `client.close_followup` and `client.delete_note` look records up by id with no scope assertion. Any holder of `comms:log` can act on any client's records. Same shape as the five IDORs already fixed elsewhere." — `clients.service.ts:635, 821` | S1 | **Prevented** — scope predicate applied in the repository base, not per call site; role-matrix suite runs IDOR probes with foreign `organization_id` and foreign owner (ADR-0009); `c21` test |
| C23 | > "Permission-to-capability mismatches: `opportunity.create` and `target.create` are both gated on `pipeline:move`; an assignee updating their own pricing progress needs the manager key `rfq:assign_pricers`." — `pipeline.controller.ts:62,169`; `rfq-assignments.controller.ts:77` | S3 | **Prevented** — same parity mechanism as C2, plus the role-matrix suite asserts each actor's *intended* capabilities from `01-actors.md`, so a wrong-key gate fails as an unexpected deny; `c23` test |
| C10 | > "Audit is inconsistent. Among pilot entities only lead status transitions are audited. RFQ decline/cancel/start-pricing, every pipeline stage move, the bulk SLA recompute and the cron reclassifier all mutate state silently." — `audit.service.ts:40` (failures swallowed) | S2 | **Prevented (identity slice only)** — login success/failure, token refresh, logout, role grant/revoke, status transitions audited; `c10-identity` test. The broader C10 claim belongs to each module's own mining doc |
| C6 | > "`POST /api/v1/leads/chatbot` is `@Public` — an unauthenticated write into the primary business table with no specified secret, rate limit or duplicate suppression." — `leads.controller.ts:132` | S1 | **Not applicable here** — trust boundary owned by ADR-0046 and `docs/mined/leads.md` |

## 4. New contract

```ts
// packages/contracts/src/identity.ts — DRAFT, final shape gated on W4 (ADR-0020/0021)
import { z } from 'zod';

export const UserStatus = z.enum(['invited', 'active', 'suspended', 'archived']);

export const User = z.object({
  id: z.string().uuid(),                    // UUIDv7 (ADR-0015)
  organizationId: z.string().uuid(),        // ADR-0017
  email: z.string().email(),                // unique per organization
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),                // bilingual, per ADR-0019 — see open question c
  phone: z.string().nullable(),
  avatarKey: z.string().nullable(),         // object-storage key (ADR-0034), not a URL
  status: UserStatus,
  departmentId: z.string().uuid().nullable(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Session / token shapes are owned by ADR-0020 and intentionally NOT drafted here.
// The one constraint this document fixes from prior-art evidence:
// the credential carries identity (`sub`) ONLY — never email, never role,
// never permissions. Verdict rows 2–4.
```

**Absent relative to the old model, deliberately:**
- **No `role` column** — roles live in ADR-0021's `user_roles`; a user holds N roles. This absence *is* the C1 fix.
- **No `role` (or any authorization data) in the token/session payload** — resolved server-side per request.
- **No `firstName`/`lastName` split** — replaced by bilingual display names (open question c: does Abak need structured names for any document? Route to ADR-0019 review).
- **No `avatar` URL** — storage key instead; URLs are derived (ADR-0034).
- **No `refreshToken` shape in the contract** — transport is ADR-0020/0033's decision, not an API surface.

## 5. State machine — `User.status`

| From | To | Trigger | Guard / required reason |
|---|---|---|---|
| `invited` | `active` | invite accepted, credentials set | — |
| `invited` | `archived` | invite revoked | reason required |
| `active` | `suspended` | admin suspends | reason required; cannot suspend self; cannot suspend the last active holder of the admin capability |
| `suspended` | `active` | admin reinstates | reason required |
| `active` | `archived` | admin archives | reason required; same last-admin guard; open sessions revoked in the same transaction |
| `suspended` | `archived` | admin archives | reason required |

Illegal (the suite asserts these throw): `archived → *` (terminal), any self-transition, `invited → suspended`, and **hard delete of a user row** (no endpoint exists; DB grant for the app role excludes `DELETE` on `identity.users` — ADR-0023/0024 pattern).

## 6. Tests that prevent each old failure

| Test file | Prevents | What it asserts |
|---|---|---|
| `c01-single-authorization-model.spec.ts` | C1 | No role column in the identity schema; `authorize()` is the only authorization entry point; the role-literal lint fixture fails; a role change takes effect on the *next request* without re-login |
| `c02-route-key-parity.spec.ts` | C2 | Every route's declared permission key exists in the catalog; every catalog key is used by ≥1 route or marked `reserved`; zero orphans |
| `c14-manager-designation-is-data.spec.ts` | C14 | Setting `Department.managerId` grants the manager action set with no deploy; unsetting revokes it; the granted set comes from data, not from any in-code list |
| `c21-ownership-scope-enforced.spec.ts` | C21 | An actor with `OWN` scope acting on a foreign-owner row by id gets 403/404; repository base applies the predicate — probe bypassing the service layer still cannot cross `organization_id` (RLS, ADR-0022) |
| `c23-capability-key-match.spec.ts` | C23 | The role-matrix suite's expected-capability table (from `01-actors.md`) passes: every actor can do what the actor spec says, and nothing else — a wrong-key gate surfaces as an unexpected deny |
| `c10-identity-events-audited.spec.ts` | C10 (identity slice) | Login success, login failure, refresh, logout, role grant/revoke, and every §5 transition produce an audit row with actor, timestamp, and reason where required |
| `char-refresh-rotation.spec.ts` | — (characterization, **no C-number: correct in old system**) | A refresh token is single-use: second use fails, a new pair is issued on first use. Re-encodes verified-good ABAK_ERP behaviour |

## 6b. Prior-art name → canonical name (ADR-0048)

| Prior-art name | Canonical | Note |
|---|---|---|
| `User.role` / `UserRole` enum | — (rejected concept) | Roles are rows in `access.roles`; a user *holds roles* via `user_roles`. The enum has no successor by design |
| `refreshToken` table (JWT stored) | opaque session/refresh token (ADR-0020) | Old rows were signed JWTs in a table; new tokens are opaque, rotating, family-revocable |
| `firstName` / `lastName` | `name_en` / `name_ar` | Bilingual display names (ADR-0019); no structured split — see resolved question c |
| `avatar` (URL) | `avatar_key` | Object-storage key (ADR-0034) |
| `ServiceCategory` (used as department) | `Department` | ADR-0048's decided rename; identity links users to real departments |
| `@Public()` decorator | unchanged | Concept kept; constraints owned by ADR-0046 |

## 7. Open questions

| Question | Owner | Blocks |
|---|---|---|
| a. Session mechanism: server-side sessions vs JWT+rotation; separate secrets; revocation story | ADR-0020 (W4 review — planning session) | `apps/api` identity module |
| b. Invitation flow: admin-creates-with-temp-password vs email invite link (SMTP dependency day one?) | User (morning question) | `invited` state implementation, not the schema |
| ~~c. User names: structured first/last vs bilingual display names~~ | **RESOLVED 2026-08-08** | No structured split. `name_ar`/`name_en` only — recorded in ADR-0019. Saudi B2B documents carry a full name; a consultancy's quotations, POs and contracts never decompose it |
| d. Password policy + 2FA scope for launch | ADR-0020 | Nothing at schema level |
| ~~e. System actor representation~~ | **RESOLVED 2026-08-08** | `actor_id NULL` + `actor_type = 'system'` on the audit row (ADR-0024). No service-account user rows: a synthetic user would appear in user lists, be assignable, and be grantable roles — a fake human is worse than an explicit null |
