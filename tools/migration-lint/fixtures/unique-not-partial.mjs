import { pgSchema, uuid, text, timestamp, index, unique } from 'drizzle-orm/pg-core';

/** Rule: unique-not-partial. A plain UNIQUE on a soft-deletable table. */
export const crm = pgSchema('lintfix_crm');

export const contacts = crm.table(
  'contacts',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id').notNull(),
    email: text('email').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('lintfix_contacts_org_idx').on(t.organizationId),
    unique('lintfix_contacts_email_uq').on(t.email),
  ],
);
