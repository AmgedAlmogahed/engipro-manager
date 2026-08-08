import { pgSchema, uuid, timestamp } from 'drizzle-orm/pg-core';

/** Rule: missing-organization-index. Has the column, no index on it. */
export const crm = pgSchema('lintfix_crm');

export const visits = crm.table('visits', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
