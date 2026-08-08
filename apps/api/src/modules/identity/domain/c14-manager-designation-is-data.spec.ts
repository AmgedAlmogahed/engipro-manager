import test from 'node:test';

/**
 * C14 — "Manager-designation unlocks are a hardcoded Set in the guard, not data — and
 * the set contains out-of-slice keys. Managers cannot be reconfigured without a code
 * change, contradicting the delegable-permissions requirement."
 */

test.skip('setting Department.manager_id grants the manager action set, with no deploy [integration lane]', () => {
  // Needs the database and the resolver. Activates with the integration stage.
  //
  // Asserts: set manager_id → the user resolves the manager action set at DEPARTMENT
  // scope; unset it → the set is revoked; and the granted set is read from data, so
  // no in-code list appears anywhere in the resolution path.
});
