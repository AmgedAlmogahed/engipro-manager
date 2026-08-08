import test from 'node:test';

/**
 * C2 — "`rfq.decline` is guarded by `rfq:assign_pricers` — a different capability...
 * `rfq:price_section` and `rfq:set_lead_pricer` are defined but used by no route
 * (orphan keys)."
 *
 * Two directions, and both matter: a route declaring a key that is not in the catalog
 * is a typo that fails open or closed unpredictably; a catalog key no route uses is a
 * capability administrators can grant that does nothing — which is worse, because it
 * reads as protection.
 */

test.skip('every route key exists in the catalog, and every catalog key is used or reserved [integration lane]', () => {
  // Needs the Nest application graph (to enumerate route metadata) and the seeded
  // permission catalog. Activates with the integration stage.
  //
  // Direction 1: for each route's declared permission key, assert it exists in the
  //              catalog.
  // Direction 2: for each catalog key, assert at least one route declares it, OR the
  //              catalog row is explicitly marked `reserved` with a note.
  // Zero orphans in either direction.
});
