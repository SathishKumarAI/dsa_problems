// Input generators shared by every journey's presets. Owns randomness only.

export function randInt(lo: number, hi: number): number {
  return lo + Math.floor(Math.random() * (hi - lo + 1))
}

export function shuffled<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// `count` distinct integers in [lo, hi]. Caller guarantees the range is wide enough.
export function distinct(count: number, lo = 1, hi = 99): number[] {
  const pool: number[] = []
  while (pool.length < count) {
    const v = randInt(lo, hi)
    if (!pool.includes(v)) pool.push(v)
  }
  return pool
}
