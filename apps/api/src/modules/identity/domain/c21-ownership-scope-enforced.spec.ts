import test from 'node:test';

/**
 * C21 — "Missing ownership checks: `client.close_followup` and `client.delete_note`
 * look records up by id with no scope assertion. Any holder of `comms:log` can act on
 * any client's records. Same shape as the five IDORs already fixed elsewhere."
 *
 * Five separate IDOR fixes in the predecessor is the tell: the checks were per call
 * site, so each new call site was a new hole. ADR-0021 moves the scope predicate into
 * the repository base, which is why this spec probes BELOW the service layer.
 */

test.skip('a scoped actor cannot reach a foreign row by id, even bypassing the service [integration lane]', () => {
  // Needs the database, RLS, and the repository base. Activates with the integration stage.
  //
  // Asserts: an actor with OWN scope requesting a foreign-owner row by id gets 404,
  // not 403 — existence must not leak (ADR-0017's cross-tenant probe uses the same
  // rule). A probe constructed directly against the repository, bypassing the
  // service layer entirely, still cannot cross organization_id, because RLS is the
  // second layer (ADR-0022).
});
