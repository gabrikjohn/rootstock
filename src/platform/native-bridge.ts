import type { Entitlement, NativeBridgeRequest } from "../types/state";
import type { EntitlementPort } from "./contracts";

export type NativeBridgeKind = "wk" | "capacitor" | null;

export function detectNativeBridge(): NativeBridgeKind {
  if (window.webkit?.messageHandlers?.rootstock) return "wk";
  if (window.RootstockNative?.postMessage) return "capacitor";
  return null;
}

export function postNativeRequest(request: NativeBridgeRequest): boolean {
  const bridge = detectNativeBridge();
  try {
    if (bridge === "wk") {
      window.webkit?.messageHandlers?.rootstock?.postMessage(request);
      return true;
    }
    if (bridge === "capacitor") {
      window.RootstockNative?.postMessage(JSON.stringify(request));
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function parseEntitlement(value: Entitlement | string): Entitlement | null {
  try {
    const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== "object" || !("active" in parsed)) return null;
    return parsed as Entitlement;
  } catch {
    return null;
  }
}

export function browserEntitlementPort(): EntitlementPort {
  const listeners = new Set<(entitlement: Entitlement) => void>();
  window.RS_setEntitlement = (value): void => {
    const entitlement = parseEntitlement(value);
    if (!entitlement) return;
    listeners.forEach((listener) => listener(entitlement));
  };
  return {
    available: () => detectNativeBridge() !== null,
    send: (message) => {
      postNativeRequest(message);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
