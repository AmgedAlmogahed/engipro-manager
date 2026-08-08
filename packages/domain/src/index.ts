/**
 * Pure domain layer. (ADR-0006, ADR-0007)
 *
 * This package imports NOTHING outside itself — not a framework, not an ORM, not
 * another workspace package. Two mechanisms hold that: dependency-cruiser's
 * `domain-imports-nothing` rule, and a CI job that typechecks this package with
 * every other node_modules entry removed.
 *
 * That is what makes "the framework is replaceable" (ADR-0005) and "the ORM is
 * behind ports" (ADR-0011) true claims rather than intentions.
 *
 * Empty on purpose. Domain modules are gated on W3/W4 ratification and on the
 * mining protocol (ADR-0003): no domain code for a module until
 * docs/mined/<module>.md exists.
 */
export {};
