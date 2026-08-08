import { pgSchema, uuid, timestamp, index } from 'drizzle-orm/pg-core';

/** Rule: cross-schema-fk. sales.opportunities references identity.users across schemas. */
export const identity = pgSchema('lintfix_identity');
export const sales = pgSchema('lintfix_sales');

export const users = identity.table('users', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const opportunities = sales.table(
  'opportunities',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id').notNull(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [index('lintfix_opps_org_idx').on(t.organizationId)],
);
