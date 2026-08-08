import { pgSchema, uuid, timestamp, doublePrecision, numeric, index } from 'drizzle-orm/pg-core';

/** Rules: forbidden-numeric-type (double precision) and money-precision (10,2). */
export const finance = pgSchema('lintfix_finance');

export const invoices = finance.table(
  'invoices',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id').notNull(),
    total: numeric('total_amount', { precision: 10, scale: 2 }),
    discount: doublePrecision('discount'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [index('lintfix_invoices_org_idx').on(t.organizationId)],
);
