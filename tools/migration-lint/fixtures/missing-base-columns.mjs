import { pgSchema, uuid, text, index } from 'drizzle-orm/pg-core';

/** Missing created_at, updated_at, created_by, deleted_at. Rule: base-columns. */
export const crm = pgSchema('lintfix_crm');

export const notes = crm.table(
  'notes',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id').notNull(),
    body: text('body').notNull(),
  },
  (t) => [index('lintfix_notes_org_idx').on(t.organizationId)],
);
