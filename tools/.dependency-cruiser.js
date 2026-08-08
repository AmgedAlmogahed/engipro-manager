/**
 * Boundary enforcement — the blocking CI gate.  (ADR-0008)
 *
 * The predecessor already had boundary enforcement: @nx/enforce-module-boundaries
 * with scope:* and type:* tags, documented in its ARCHITECTURE.md. It still
 * produced C1 (two authorization models coexisting), C5 (the leads module
 * writing Client, PipelineEntry and Rfq in one transaction) and C18 (Interaction
 * written by four modules) — because Nx tags operate at the *project* level, and
 * every one of those violations happened *inside* packages/api, where Nx cannot
 * look.
 *
 * These four rules look inside. That is the entire point of this file.
 *
 * Run: pnpm check:boundaries
 *      depcruise apps packages --config tools/.dependency-cruiser.js
 *
 * Verified by: sh tools/dependency-cruiser.test.sh
 */
module.exports = {
  forbidden: [
    {
      name: 'domain-imports-nothing',
      comment:
        'packages/domain is the pure domain layer. It imports nothing outside itself — ' +
        'not a framework, not an ORM, not another workspace package. This is what makes ' +
        'ADR-0006 (hexagonal, outbound ports only) a fact rather than an intention.',
      severity: 'error',
      from: { path: '^packages/domain/src/' },
      to: { pathNot: '^packages/domain/src/' },
    },

    {
      name: 'no-vendor-in-domain-or-application',
      comment:
        'Domain and application layers must not import vendor packages. This is what makes ' +
        'ADR-0005 ("the framework is replaceable") and ADR-0011 ("the ORM is behind ports") ' +
        'true claims. Extend this list when a new vendor dependency arrives — never weaken it.',
      severity: 'error',
      from: {
        path: '^(apps/api/src/modules/[^/]+/(domain|application)|packages/domain/src)/',
      },
      to: {
        path: '^node_modules/(@nestjs|drizzle-orm|@prisma|@aws-sdk|playwright|axios)/',
      },
    },

    {
      name: 'no-cross-module-internals',
      comment:
        'A module may not reach into another module\'s domain, application or infrastructure ' +
        'internals. Cross-module work goes through the other module\'s public surface or an ' +
        'event (ADR-0026). This rule is what makes C5 and C18 impossible rather than discouraged.',
      severity: 'error',
      from: { path: '^apps/api/src/modules/([^/]+)/' },
      to: {
        path: '^apps/api/src/modules/(?!$1)[^/]+/(domain|application|infrastructure)/',
      },
    },

    {
      name: 'no-app-to-app',
      comment:
        'Apps do not import each other. apps/web talks to apps/api over HTTP, which keeps the ' +
        'API a real network boundary rather than a shared library (ADR-0004). Since ADR-0050 ' +
        'the frontend is a static bundle with no server runtime, so this boundary is physical.',
      severity: 'error',
      from: { path: '^apps/([^/]+)/' },
      to: { path: '^apps/(?!$1)[^/]+/' },
    },
  ],

  options: {
    // Report dependencies on node_modules without crawling into them.
    // Rule 2 needs vendor imports visible; nothing needs their internals.
    doNotFollow: { path: 'node_modules' },

    // apps/prototype is frozen and outside the dependency graph (ADR-0002).
    // It is not a workspace member, so it is excluded here too — its
    // pre-freeze structure is not held to these rules.
    exclude: { path: '^apps/prototype/' },

    // Follow TypeScript type-only imports as well. A type import across a
    // boundary is still coupling: it is how a screen projection becomes an
    // API response becomes a database model (ADR-0002's argument about the
    // prototype's Client type).
    tsPreCompilationDeps: true,

    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
