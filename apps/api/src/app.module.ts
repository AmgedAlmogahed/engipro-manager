import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module.js';

/**
 * Composition root. Modules are registered here and nowhere else.
 *
 * ADR-0004: one deployable, internally divided into domain modules. The division
 * is enforced by dependency-cruiser's `no-cross-module-internals` rule, not by
 * convention — the predecessor had the convention and produced C5 and C18 anyway.
 */
@Module({
  imports: [HealthModule],
})
export class AppModule {}
