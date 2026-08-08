# Glossary — canonical terms

**One concept, one word, everywhere**: database, API, UI, Arabic, and conversation. (ADR-0048)

Mined from `ABAK_ERP/blueprint/abak/00-glossary.md` (ADR-0003). The predecessor's glossary
recorded its own drift in a `DRIFT:` column — three names for one concept, a model called
`ServiceCategory` used as a Department everywhere including in authorization. C13 is that drift.
**This file resolves it**: the Canonical column is the only name, and the Rejected column is
enforced by lint so a rejected synonym cannot re-enter the codebase.

`tools/check-glossary.mjs` fails CI on any rejected synonym in source, contracts, migrations, or
UI strings. A term with no lint entry is a term nobody is holding.

## Terms

| Canonical (en) | Arabic | Owning context | Definition | Rejected synonyms |
|---|---|---|---|---|
| **Client** | عميل | crm | A party we do or have done business with. Owns the long-term relationship record. A client's lifecycle status covers the pre-commercial stage; there is no separate Lead entity. | — |
| **Opportunity** | فرصة | sales | One potential deal with one client. A client may have many over time. | `PipelineEntry`, `pipeline_entry`, `pipelineEntry`, `Deal` |
| **Stage** | مرحلة | sales | Where an **Opportunity** sits in the sales funnel. Belongs to Opportunity and nothing else. | — |
| **Status** | حالة | — | Lifecycle state of a single entity. **Never** used to mean pipeline position. | — |
| **RFQ** | طلب عرض سعر | sales | A request for the technical departments to price an opportunity. Exactly one per opportunity. | `RequestForQuote`, `PricingRequest` |
| **Quotation** | عرض سعر | sales | The priced document produced from an RFQ and sent to the client. | `Quote` (in UI labels and prose; `Quote` remains acceptable only as an established code identifier where the API contract already uses it) |
| **Department** | قسم | org | An internal pricing and execution unit. Owns `manager_id`, which is what unlocks the manager action set as data (ADR-0021, C14). | `ServiceCategory`, `service_category`, `serviceCategory`, `Category` |
| **Account Manager** | مدير الحساب | crm | The sales user who owns a client relationship. The row-level owner for client scope. | — |
| **Opportunity Owner** | مالك الفرصة | sales | The sales user who owns the deal. Inherited by the RFQ. | — |
| **Coordinator** | منسق | sales | The user triaging an RFQ into department assignments. | — |
| **Primary Pricer** | مسؤول التسعير الرئيسي | sales | The one assignee who consolidates a multi-department quotation. | `LeadPricer`, `lead_pricer`, `isLeadPricer`, `leadPricer` |
| **Assignment** | إسناد | sales | One department's slice of pricing work on one RFQ. | — |
| **Interaction** | تفاعل | crm | Any logged contact: call, meeting, email, visit, note. | `Communication` (as an entity name; acceptable as a UI grouping label) |
| **Follow-up** | متابعة | crm | A scheduled future obligation against a client. | — |
| **Scope** | نطاق الصلاحية | access | Row visibility band for a permission: `OWN`, `TEAM`, `DEPARTMENT`, `BRANCH`, `ORGANIZATION`, `PLATFORM`. | — |
| **Permission key** | مفتاح صلاحية | access | A `module:action` string, e.g. `rfq:request`. The only unit authorization is expressed in. | — |
| **Approval authority** | حد الموافقة | access | A monetary limit on a subject's ability to approve, with amount, currency and scope. Distinct from a permission key, which answers *whether* someone participates in approvals, never *up to how much* (ADR-0049). | — |
| **Role** | دور | access | A named set of permission grants. A user holds N roles. **Not** a column, not an enum, not a token claim. | `UserRole`, `user_role` (as an enum type — the C1 root) |
| **Business number** | الرقم المرجعي | platform | The human-facing identifier printed on documents and spoken aloud: `CLIENT-2026-0042`. Distinct from the primary key, and distinct from the ZATCA invoice counter (ADR-0025, ADR-0039). | — |

## Naming rules

1. **Stage ≠ Status.** Stage belongs to Opportunity only. Every other entity has a Status.
2. **"Lead" is always the sales sense**, and it is a *client status*, not an entity. For pricing use
   **Primary Pricer**, never "Lead Pricer" — the collision between "lead" as *sales prospect* and
   *lead* as *principal* is the kind of ambiguity that produces two mental models of one column.
3. **No structured person names.** Bilingual display names only (ADR-0019).
4. A term entering the system needs a row here **before** the code that uses it, the same way a
   module needs a mining document before its domain layer (ADR-0003).

## Not yet in the glossary

`PurchaseOrder`, `Project`, `Phase`, `Task`, `Invoice`, `Payment`, `Commission`, `GovTransaction`,
`Licence`, `Document`, `FileAsset`. Out of the current slice — each is added when its module is
mined, and its absence here is why no code may use it yet.
