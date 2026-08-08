import { pgSchema, uuid, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * PoC schema — two bounded contexts, one identifier reference across them.
 * (ADR-0013: schema per bounded context, NO cross-schema foreign keys)
 *
 * Throwaway by design (ADR-0011 rider): it lives under tools/poc/ so a failed proof of
 * concept leaves no residue in packages/database. The cost is that this does not
 * exercise the real package layout — covered by a later gate, since the first real
 * migration is checked by the live-fired migration lint (ADR-0014 rider).
 */
export const identity = pgSchema('poc_identity');
export const sales = pgSchema('poc_sales');

export const users = identity.table('users', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const opportunities = sales.table('opportunities', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  /**
   * Reference by IDENTIFIER ONLY. No `.references(() => users.id)`.
   *
   * ADR-0013 permits exactly one cross-schema foreign key — `organization_id` — and
   * this is not it. The integrity trade-off is explicit and accepted: a nightly
   * consistency check finds orphans (ADR-0037), because the alternative is coupling two
   * bounded contexts at the database level, which makes them one context with extra
   * steps.
   */
  ownerId: uuid('owner_id').notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
