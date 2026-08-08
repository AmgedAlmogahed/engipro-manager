/**
 * API contracts — Zod schemas, the single source of truth for the wire. (ADR-0010)
 *
 * OpenAPI is generated from these, and the typed client is generated from the
 * OpenAPI document. Nothing is hand-written twice: CI regenerates both and fails
 * on `git diff --exit-code`, so contract drift is a codegen diff rather than a
 * runtime surprise.
 *
 * Empty on purpose. ADR-0010's rider requires the first real contract to arrive
 * with a CI round-trip test (schema → OpenAPI → orval client → typecheck) proving
 * the *resolved* toolchain versions work together, and to pin those versions exact
 * in the catalog. That rider exists because a point-in-time "verified compatible"
 * claim already failed here once.
 */
export {};
