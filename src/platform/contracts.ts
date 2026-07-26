import type { Entitlement, NativeBridgeRequest } from "../types/state";
import { browserAudioPlayer } from "./audio";
import { browserEntitlementPort } from "./native-bridge";

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface Clock {
  now(): number;
}

export interface RandomSource {
  next(): number;
}

export interface AudioPlayer {
  install(): void;
  play(key: string, done?: () => void): boolean;
}

export interface EntitlementPort {
  available(): boolean;
  send(message: NativeBridgeRequest): void;
  subscribe(listener: (entitlement: Entitlement) => void): () => void;
}

export interface AppDependencies {
  storage: StorageAdapter;
  clock: Clock;
  random: RandomSource;
  audio: AudioPlayer;
  entitlement: EntitlementPort;
}

export function browserDependencies(): AppDependencies {
  return {
    storage: window.localStorage,
    clock: { now: () => Date.now() },
    random: { next: () => Math.random() },
    audio: browserAudioPlayer(),
    entitlement: browserEntitlementPort()
  };
}
