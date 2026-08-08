import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from './main.js';

/**
 * ADR-0005 enforcement, verbatim: "a smoke test asserts the app bootstraps under
 * FastifyAdapter and that /api/docs serves a valid OpenAPI document (ADR-0010)."
 *
 * The adapter assertion is not ceremony. ADR-0005 rejected the Express adapter on
 * measured throughput, and the difference between the two is a single constructor
 * argument — exactly the kind of decision that silently reverts during a refactor
 * and shows up as a performance regression nobody can date.
 */

test('bootstraps under the Fastify adapter, not Express', async () => {
  const app = await createApp();
  try {
    const adapter = app.getHttpAdapter();
    assert.equal(
      adapter.constructor.name,
      'FastifyAdapter',
      'ADR-0005 requires the Fastify adapter; an Express adapter here is a silent revert',
    );
    // The Fastify instance exposes inject(); Express does not. This is a
    // capability check rather than a name check, so renaming cannot fake it.
    assert.equal(typeof (adapter.getInstance() as { inject?: unknown }).inject, 'function');
  } finally {
    await app.close();
  }
});

test('/api/health and /api/ready respond', async () => {
  const app = await createApp();
  await app.init();
  try {
    const fastify = app.getHttpAdapter().getInstance();

    const health = await fastify.inject({ method: 'GET', url: '/api/health' });
    assert.equal(health.statusCode, 200);
    assert.deepEqual(health.json(), { status: 'ok' });

    const ready = await fastify.inject({ method: 'GET', url: '/api/ready' });
    assert.equal(ready.statusCode, 200);
    assert.equal(ready.json().status, 'ok');
  } finally {
    await app.close();
  }
});

test('/api/docs serves a valid OpenAPI document', async () => {
  const app = await createApp();
  await app.init();
  try {
    const fastify = app.getHttpAdapter().getInstance();
    const res = await fastify.inject({ method: 'GET', url: '/api/docs-json' });

    assert.equal(res.statusCode, 200);
    const doc = res.json();

    // Structural validity, not merely "returned 200". A 200 carrying an HTML
    // error page would otherwise pass — the same confusion the Caddy API-404
    // assertion guards against (ADR-0032).
    assert.match(doc.openapi, /^3\./, 'must declare an OpenAPI 3.x version');
    assert.ok(doc.info?.title, 'must carry info.title');
    assert.ok(doc.paths, 'must carry a paths object');
    assert.ok(
      Object.keys(doc.paths).some((p) => p.includes('health')),
      'the health route must appear in the document — an empty paths object is a valid document and a useless one',
    );
  } finally {
    await app.close();
  }
});
