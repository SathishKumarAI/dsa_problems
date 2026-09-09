// The store is the one module every feature writes through (B18), and until
// now nothing tested it directly: the UI suite exercised it by driving a real
// browser, which is slow and only ever covers the happy path it happens to
// walk. These are the paths a browser will not reach on purpose — a corrupt
// value someone else wrote, a streak that has to survive until midnight, and
// the read-modify-write that every XP award goes through.
//
// node has no localStorage, so one is stubbed before the module loads. The
// stub is deliberately dumb: a Map, and a mode that throws, which is what a
// full or blocked storage looks like from inside `try`.
import assert from "node:assert/strict"
import { test } from "node:test"

class MemoryStorage {
  map = new Map<string, string>()
  throws = false
  get length() {
    return this.map.size
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null
  }
  getItem(k: string) {
    if (this.throws) throw new Error("blocked")
    return this.map.get(k) ?? null
  }
  setItem(k: string, v: string) {
    if (this.throws) throw new Error("full")
    this.map.set(k, v)
  }
  removeItem(k: string) {
    this.map.delete(k)
  }
  clear() {
    this.map.clear()
  }
}

const storage = new MemoryStorage()
;(globalThis as { localStorage?: unknown }).localStorage = storage

const {
  K,
  exportProgress,
  getStored,
  importProgress,
  removeStored,
  resetProgress,
  setStored,
  streakOf,
  updateStored,
} = await import("./store.ts")

const day = (back: number) =>
  new Date(Date.now() - back * 864e5).toISOString().slice(0, 10)

// ---------- streakOf ----------

test("streakOf: an empty ledger is not a streak", () => {
  assert.equal(streakOf([]), 0)
})

test("streakOf: today alone is one day", () => {
  assert.equal(streakOf([day(0)]), 1)
})

// the streak has to survive from midnight until the learner opens the app
// again, or every session would start by breaking it
test("streakOf: yesterday alone still counts, so a streak survives until midnight", () => {
  assert.equal(streakOf([day(1)]), 1)
})

test("streakOf: consecutive days add up, in any order", () => {
  assert.equal(streakOf([day(2), day(0), day(1)]), 3)
})

test("streakOf: a gap ends it, and older days beyond the gap do not count", () => {
  assert.equal(streakOf([day(0), day(1), day(3), day(4)]), 2)
})

test("streakOf: the day before yesterday alone is a broken streak", () => {
  assert.equal(streakOf([day(2)]), 0)
})

test("streakOf: a duplicate day is still one day", () => {
  assert.equal(streakOf([day(0), day(0)]), 1)
})

// ---------- reading what someone else wrote ----------

test("a corrupt value reads as the fallback rather than throwing", () => {
  storage.map.set("dsa:corrupt-a", "{not json")
  assert.deepEqual(getStored("corrupt-a", ["safe"]), ["safe"])
})

test("a value of the wrong shape is returned as-is — the store owns no schema", () => {
  storage.map.set("dsa:wrong-shape", '"a string"')
  assert.equal(getStored("wrong-shape", 0), "a string")
})

test("storage that throws on read still yields the fallback", () => {
  storage.throws = true
  try {
    assert.equal(getStored("never-read-before", 42), 42)
  } finally {
    storage.throws = false
  }
})

test("storage that throws on write keeps the value in memory", () => {
  storage.throws = true
  try {
    setStored("write-blocked", 7)
  } finally {
    storage.throws = false
  }
  assert.equal(getStored("write-blocked", 0), 7, "the UI must still see it")
  assert.equal(storage.map.has("dsa:write-blocked"), false, "nothing persisted")
})

// ---------- updateStored ----------

test("updateStored: reads through the fallback when the key is absent", () => {
  updateStored("xp-fresh", 0, (x: number) => x + 10)
  assert.equal(getStored("xp-fresh", 0), 10)
})

test("updateStored: three awards in a row accumulate", () => {
  updateStored("xp-run", 0, (x: number) => x + 5)
  updateStored("xp-run", 0, (x: number) => x + 10)
  updateStored("xp-run", 0, (x: number) => x + 1)
  assert.equal(getStored("xp-run", 0), 16)
})

test("updateStored: the fallback is not written when the function returns it", () => {
  updateStored<string[]>("days-idem", [], (d) =>
    d.includes("x") ? d : [...d, "x"]
  )
  updateStored<string[]>("days-idem", [], (d) =>
    d.includes("x") ? d : [...d, "x"]
  )
  assert.deepEqual(getStored("days-idem", []), ["x"])
})

test("removeStored: the key goes back to its fallback, cache included", () => {
  setStored("temp", "here")
  assert.equal(getStored("temp", "gone"), "here")
  removeStored("temp")
  assert.equal(getStored("temp", "gone"), "gone")
})

// ---------- whole-store moves ----------

test("export leaves preferences behind — they are per device", () => {
  setStored(K.prefs, { speed: 90 })
  setStored(K.xp, 120)
  const out = exportProgress()
  assert.equal(out[K.prefs], undefined, "prefs must not travel between devices")
  assert.equal(out[K.xp], 120)
})

test("import writes everything but preferences, and counts what it wrote", () => {
  setStored(K.prefs, { speed: 90 })
  const n = importProgress({ xp: 500, "unlocked:two-sum": 4, prefs: { speed: 1 } })
  assert.equal(n, 2, "prefs should not be counted")
  assert.equal(getStored(K.xp, 0), 500)
  assert.equal(getStored(K.unlocked("two-sum"), 1), 4)
  assert.deepEqual(getStored(K.prefs, null), { speed: 90 }, "prefs survived")
})

test("import refuses anything that is not a plain object", () => {
  for (const bad of [null, [], "text", 3])
    assert.throws(() =>
      importProgress(bad as unknown as Record<string, unknown>)
    )
})

test("reset clears progress and keeps preferences", () => {
  setStored(K.prefs, { speed: 90 })
  setStored(K.xp, 999)
  setStored(K.solved, ["two-sum"])
  resetProgress()
  assert.equal(getStored(K.xp, 0), 0)
  assert.deepEqual(getStored(K.solved, []), [])
  assert.deepEqual(getStored(K.prefs, null), { speed: 90 })
})
