import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * ADR-0032 wires /health and /ready to Docker health checks, and the deployment
 * script waits for healthy before completing, rolling back to the previous image
 * tag on failure.
 *
 * The distinction matters and is not cosmetic:
 *   /health  the process is alive
 *   /ready   the process can serve traffic — dependencies reachable
 *
 * ADR-0037 is explicit that a health check confirms the process is alive, not
 * that it works: the predecessor's first production PDF request failed against a
 * healthy process because Chromium was installed but unusable. That is why the
 * post-deploy smoke test issues a real quotation PDF rather than trusting /ready.
 */
@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Liveness — the process is running' })
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness — the process can serve traffic' })
  ready(): { status: 'ok'; checks: Record<string, 'ok'> } {
    // No dependencies to check yet. When the database, object storage and the
    // job queue arrive, each gets a check here — and readiness must go false
    // when one is unreachable, or this endpoint is decoration.
    return { status: 'ok', checks: {} };
  }
}
