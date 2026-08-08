import { pgSchema, uuid, text, timestamp, numeric, index } from 'drizzle-orm/pg-core';

/** A table that satisfies every ADR-0014 rule. The lint must pass this. */
export const crm = pgSchema('lintfix_crm');

export const clients = crm.table(
  'clients',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id').notNull(),
    nameAr: text('name_ar').notNull(),
    nameEn: text('name_en').notNull(),
    creditLimit: numeric('credit_limit', { precision: 19, scale: 4 }),
    vatRate: numeric('vat_rate', { precision: 5, scale: 4 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [index('lintfix_clients_org_idx').on(t.organizationId)],
);
