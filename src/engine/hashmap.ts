// A hash map, modelled as a hash map. Owns the bucket arithmetic the UI asks
// learners to trust: toy hash `key mod buckets`, chaining on collision, and a
// real double-and-rehash when load passes 0.75 (the factor Java/Python/Go
// resize at). Returns data only; src/features/journey/hash-map-view.tsx draws it.

import type { HashEntry, HashModel } from "./types.ts"

export const HASH_LOAD = 0.75
export const HASH_MIN_BUCKETS = 8

export function hashBuckets(n: number): number {
  let b = HASH_MIN_BUCKETS
  while (n > b * HASH_LOAD) b *= 2
  return b
}

// The mod that wraps negatives up, like Python's % — complements go negative.
export const hashSlot = (key: number, buckets: number) =>
  ((key % buckets) + buckets) % buckets

export function hashLayout(
  entries: HashEntry[],
  {
    probe = null,
    hit = false,
    label = "seen — value @ index",
    fmt = "at",
    mode = "lookup",
  }: {
    probe?: number | null
    hit?: boolean
    label?: string
    fmt?: "at" | "times"
    mode?: "insert" | "lookup"
  } = {}
): HashModel {
  const buckets = hashBuckets(entries.length)
  const chains: HashEntry[][] = Array.from({ length: buckets }, () => [])
  for (const e of entries) chains[hashSlot(e.key, buckets)].push(e)
  const slot = probe === null ? -1 : hashSlot(probe, buckets)
  const chain = slot >= 0 ? chains[slot] : []
  const at = probe === null ? -1 : chain.findIndex((e) => e.key === probe)
  const present = at >= 0
  const hops = present ? at + 1 : chain.length
  return {
    entries,
    buckets,
    chains,
    probe,
    mode,
    slot,
    present,
    hit,
    hops,
    load: entries.length / buckets,
    resized: buckets > HASH_MIN_BUCKETS,
    collisions: chains.filter((c) => c.length > 1).length,
    label,
    fmt,
  }
}

export const entriesOf = (pairs: [number, number][]): HashEntry[] =>
  pairs.map(([key, value]) => ({ key, value }))
