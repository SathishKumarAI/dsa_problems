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
