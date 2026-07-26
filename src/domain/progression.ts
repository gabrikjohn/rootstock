export const DAY_MS = 24 * 60 * 60 * 1000;
export const TEMPER_MIN_MS = 8 * 60 * 60 * 1000;
export const TEMPER_WAKE_HOUR = 4;

export function temperUnlock(
  trialOneAt: number,
  minimumMs = TEMPER_MIN_MS,
  wakeHour = TEMPER_WAKE_HOUR
): number {
  const wake = new Date(trialOneAt);
  wake.setHours(wakeHour, 0, 0, 0);
  if (wake.getTime() <= trialOneAt) wake.setDate(wake.getDate() + 1);
  return Math.max(wake.getTime(), trialOneAt + minimumMs);
}

export function canAccessGate(
  gateIndex: number,
  freeGateCount: number,
  entitled: boolean,
  alreadySealed: boolean
): boolean {
  return gateIndex < freeGateCount || entitled || alreadySealed;
}
