import {
  deserializeProgress,
  normalizeProgress,
  PROGRESS_BACKUP_KEY,
  PROGRESS_KEY,
  serializeProgress
} from "../domain/persistence";
import type { ProgressV2 } from "../types/state";
import type { StorageAdapter } from "./contracts";

export class ProgressStore {
  constructor(private readonly storage: StorageAdapter) {}

  load(): ProgressV2 {
    try {
      let raw = this.storage.getItem(PROGRESS_KEY);
      if (!raw) {
        const backup = this.storage.getItem(PROGRESS_BACKUP_KEY);
        const restored = backup ? deserializeProgress(backup) : null;
        if (restored) raw = JSON.stringify(restored);
      }
      return normalizeProgress(raw ? JSON.parse(raw) : null);
    } catch {
      return normalizeProgress(null);
    }
  }

  save(progress: ProgressV2): void {
    try {
      this.storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      this.storage.setItem(PROGRESS_BACKUP_KEY, serializeProgress(progress));
    } catch {
      // Restricted previews may deny storage; the in-memory session remains usable.
    }
  }
}
