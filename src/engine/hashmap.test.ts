// The bucket arithmetic the hash-map panel asks learners to trust.

import assert from "node:assert/strict"
import { test } from "node:test"
import {
  HASH_MIN_BUCKETS,
  entriesOf,
  hashBuckets,
  hashLayout,
  hashSlot,
} from "./hashmap.ts"

test("resize ladder doubles at load 0.75", () => {
  assert.equal(hashBuckets(0), 8)
  assert.equal(hashBuckets(6), 8)
  assert.equal(hashBuckets(7), 16)
  assert.equal(hashBuckets(12), 16)
  assert.equal(hashBuckets(13), 32)
})

test("slot wraps negatives up like Python's %", () => {
  assert.equal(hashSlot(11, 8), 3)
  assert.equal(hashSlot(-6, 8), 2)
  assert.equal(hashSlot(0, 8), 0)
})

test("layout chains colliding keys and counts hops to a present probe", () => {
  const m = hashLayout(
    entriesOf([
      [3, 0],
      [11, 1],
      [19, 2],
    ]),
    { probe: 19, hit: true }
  )
  assert.equal(m.buckets, HASH_MIN_BUCKETS)
  assert.equal(m.slot, 3)
  assert.deepEqual(
    m.chains[3].map((e) => e.key),
    [3, 11, 19]
  )
  assert.equal(m.present, true)
  assert.equal(m.hops, 3)
  assert.equal(m.collisions, 1)
})

test("a miss walks the whole chain; an empty bucket walks nothing", () => {
  const m = hashLayout(
    entriesOf([
      [3, 0],
      [11, 1],
    ]),
    { probe: 27 }
  )
  assert.equal(m.present, false)
  assert.equal(m.hops, 2)
  const e = hashLayout(entriesOf([[3, 0]]), { probe: 4 })
  assert.equal(e.hops, 0)
})

test("hit and present are independent (count-scan case)", () => {
  const m = hashLayout(entriesOf([[5, 2]]), {
    probe: 5,
    hit: false,
    fmt: "times",
  })
  assert.equal(m.present, true)
  assert.equal(m.hit, false)
})

test("an insert reports the same bucket arithmetic a lookup does", () => {
  // The panel showed nothing at all while the map was being BUILT, so a
  // learner watching pass 1 of a two-pass hash saw values land in buckets
  // with no sum on screen. The model now says which of the two is happening.
  // the frame yields AFTER the insertion, so `seen` already holds the key
  // being filed — that is the contract the panel's "hops - 1" reads
  const built = hashLayout(entriesOf([[45, 0], [31, 1], [39, 2]]), {
    probe: 39,
    mode: "insert",
  })
  assert.equal(built.mode, "insert")
  assert.equal(built.slot, 7, "39 mod 8 is 7")
  assert.equal(built.hops, 2, "31 was already in bucket 7, so 39 joins a chain")

  const alone = hashLayout(entriesOf([[45, 0], [25, 1]]), {
    probe: 25,
    mode: "insert",
  })
  assert.equal(alone.slot, 1, "25 mod 8 is 1")
  assert.equal(alone.hops, 1, "alone in its bucket: hops - 1 == 0 others")
})

test("lookup stays the default, so every other journey is unchanged", () => {
  assert.equal(hashLayout(entriesOf([[7, 0]]), { probe: 7 }).mode, "lookup")
})
