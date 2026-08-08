Tier: Thin

Health — liveness and readiness endpoints for Docker health checks (ADR-0032).

Thin per ADR-0007: a service over the runtime, no `domain/` folder, no state machine,
no invariants. There is nothing here to protect, and tiering exists so ceremony is not
paid where there is nothing to protect.

`/health` answers "the process is alive". `/ready` answers "the process can serve
traffic" and gains a check per dependency as they arrive — and must return false when
one is unreachable, or it is decoration. Neither endpoint proves the system *works*:
that is the post-deploy smoke test's job (ADR-0037), because the predecessor's first
production PDF request failed against a process that was healthy.
