import { Module } from '@nestjs/common';
import { HealthController } from './interface/http/health.controller.js';

/**
 * Health is a Thin-tier module (ADR-0007): no domain layer, no ports, no
 * use-cases. It has no business rules to protect, and tiering exists precisely
 * so ceremony is not paid where there is nothing to protect.
 *
 * Its shape is therefore NOT the template for a real module. Those get
 * domain/ + application/ + infrastructure/ + interface/http/ per ADR-0006.
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
