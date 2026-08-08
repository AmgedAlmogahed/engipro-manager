export default {
  schema: './tools/poc/multischema/schema.mjs',
  out: './tools/poc/multischema/.migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  // Both schemas must be declared, or drizzle-kit introspects only `public` and the
  // generated SQL silently omits one — a false pass for the exact property under test.
  schemaFilter: ['poc_identity', 'poc_sales'],
  verbose: true,
  strict: false,
};
