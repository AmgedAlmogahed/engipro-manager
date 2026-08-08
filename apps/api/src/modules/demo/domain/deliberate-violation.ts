/**
 * DELIBERATE BOUNDARY VIOLATION — ADR-0008 Phase-1 exit criterion.
 *
 * ADR-0008: "the foundation phase is not complete until a deliberately introduced
 * violation (importing drizzle-orm into a domain/ folder) fails CI. Until that has
 * been demonstrated, the architecture is unverified."
 *
 * This file imports the HTTP framework into a domain/ layer. It must fail:
 *   - dependency-cruiser  no-vendor-in-domain-or-application
 *
 * It is reverted in the next commit. If you are reading this on main, the revert
 * was lost and the repository is in a state ADR-0006 forbids.
 */
import { Injectable } from '@nestjs/common';

export const violation = Injectable;
