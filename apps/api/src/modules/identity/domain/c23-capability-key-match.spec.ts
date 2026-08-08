import test from 'node:test';

/**
 * C23 — "Permission-to-capability mismatches: `opportunity.create` and `target.create`
 * are both gated on `pipeline:move`; an assignee updating their own pricing progress
 * needs the manager key `rfq:assign_pricers`."
 *
 * The parity check in c02 catches keys that do not exist. This catches keys that exist
 * and are WRONG — a mismatch parity cannot see, because both sides are valid.
 */

test.skip('each actor can do exactly what the actor spec says, and nothing more [integration lane]', () => {
  // Needs the full role matrix and a running application. Activates with the
  // integration stage.
  //
  // Drives the expected-capability table from ABAK_ERP/blueprint/abak/01-actors.md
  // (mined in docs/mined/identity.md). A wrong-key gate surfaces as an UNEXPECTED
  // DENY for an actor the spec says is entitled — which is why the table must be
  // exhaustive rather than a sample.
});
