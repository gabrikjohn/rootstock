import type { Entitlement } from "./types/state";

declare global {
  interface Window {
    RS_setEntitlement?: (entitlement: Entitlement | string) => void;
    RootstockNative?: { postMessage(message: string): void };
    webkit?: {
      messageHandlers?: {
        rootstock?: { postMessage(message: unknown): void };
      };
    };
  }
}

export {};
