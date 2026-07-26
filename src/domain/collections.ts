import type { RandomSource } from "../platform/contracts";

export function shuffle<T>(values: readonly T[], random: RandomSource): T[] {
  const result = values.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random.next() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }
  return result;
}

export function avoidRepeat<T>(
  queue: T[],
  lastKey: string | null | undefined,
  keyOf: (item: T) => string
): void {
  if (lastKey == null || queue.length < 2 || keyOf(queue[0]!) !== lastKey) return;
  for (let index = 1; index < queue.length; index += 1) {
    if (keyOf(queue[index]!) !== lastKey) {
      const [item] = queue.splice(index, 1);
      if (item !== undefined) queue.unshift(item);
      return;
    }
  }
}

export function requeueMiss<T>(queue: T[], item: T, penalty: T): void {
  const first = Math.max(1, Math.floor(queue.length * 0.34));
  const second = Math.max(first + 2, Math.floor(queue.length * 0.7));
  queue.splice(Math.min(first, queue.length), 0, penalty);
  queue.splice(Math.min(second, queue.length), 0, item);
}

export function roman(value: number): string | number {
  if (!(value > 0)) return value;
  const numerals: Array<readonly [number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let remaining = value;
  let result = "";
  for (const [amount, numeral] of numerals) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }
  return result;
}
