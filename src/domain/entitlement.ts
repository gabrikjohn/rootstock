import type { Entitlement } from "../types/state";

export interface StoredEntitlement extends Entitlement {
  source?: "native" | "dev";
  startedAt?: number;
}

/**
 * Native entitlement is authoritative and already reflects StoreKit expiry.
 * Browser-preview trials are checked against the injected clock.
 */
export function isEntitlementActive(
  entitlement: StoredEntitlement | null | undefined,
  now: number
): boolean {
  if (!entitlement) return false;
  if (entitlement.source === "native") return entitlement.active === true;
  if (!entitlement.active) return false;
  if (entitlement.expiresAt && now > entitlement.expiresAt) return false;
  return true;
}
