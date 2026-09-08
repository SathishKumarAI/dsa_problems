// The API contract, exercised in-process. Same function the servers mount.

import assert from "node:assert/strict"
import { test } from "node:test"
import { route } from "./routes.ts"

const get = (p: string) => route("GET", p)
const post = (p: string, b: unknown) => route("POST", p, b)

test("GET /api/problems lists every problem and names its journey", () => {
  const r = get("/api/problems")
  assert.equal(r.status, 200)
  const list = r.body as { id: string; journey: string | null }[]
  assert.ok(list.length >= 30)
  assert.equal(list.find((p) => p.id === "pair-sum")?.journey, "two-sum")
  assert.equal(
    list.find((p) => p.id === "single-number")?.journey,
    "single-number"
  )
})

test("GET /api/journeys/:slug returns JSON-safe meta without functions", () => {
  const r = get("/api/journeys/two-sum")
  assert.equal(r.status, 200)
  const meta = r.body as {
    acts: { key: string }[]
    presets: Record<string, unknown>
  }
  assert.equal(meta.acts.length, 7)
  assert.ok("random" in meta.presets)
  assert.doesNotThrow(() => JSON.stringify(r.body))
  assert.equal(get("/api/journeys/nope").status, 404)
})

test("POST run returns frames; bad input is a 400, unknown act a 404", () => {
  const r = post("/api/journeys/two-sum/run", {
    act: "hash",
    data: { nums: [2, 7, 11, 15], target: 9 },
  })
  assert.equal(r.status, 200)
  const { frames } = r.body as { frames: { note: string }[] }
  assert.ok(frames.length > 2)
  assert.ok(frames.every((f) => f.note))
  assert.equal(
    post("/api/journeys/two-sum/run", { act: "hash", data: { nums: "x" } })
      .status,
    400
  )
  assert.equal(
    post("/api/journeys/two-sum/run", { act: "zzz", data: { nums: [1] } })
      .status,
    404
  )
  assert.equal(get("/api/journeys/two-sum/run").status, 405)
})

test("POST run accepts a row of characters, and only a homogeneous one", () => {
  // a derived journey over a string sends single characters, not integers —
  // the guard has to let that through without letting anything else in
  const ok = post("/api/journeys/longest-clean-run/run", {
    act: "window",
    data: { nums: [..."abcabcbb"] },
  })
  assert.equal(ok.status, 200)
  const { frames } = ok.body as { frames: { note: string }[] }
  assert.ok(frames.length > 2)
  for (const bad of [
    { nums: ["a", 1] }, // mixed
    { nums: ["ab"] }, // not one character
    { nums: [1.5] }, // not an integer
    { nums: [{}] },
  ])
    assert.equal(
      post("/api/journeys/longest-clean-run/run", { act: "window", data: bad })
        .status,
      400,
      JSON.stringify(bad)
    )
})

test("POST chart never includes acts past `upto` (no spoilers over the wire)", () => {
  const data = { nums: [2, 7, 11, 15], target: 9 }
  const all = post("/api/journeys/two-sum/chart", { data }).body as {
    act: string
  }[]
  assert.deepEqual(
    all.map((r) => r.act),
    ["brute", "twoptr", "twopass", "hash"]
  )
  const two = post("/api/journeys/two-sum/chart", { data, upto: 3 }).body as {
    act: string
  }[]
  assert.deepEqual(
    two.map((r) => r.act),
    ["brute", "twoptr"]
  )
})

test("POST preset / parse / classify", () => {
  const p = post("/api/journeys/single-number/preset", { preset: "single" })
    .body as { data: { nums: number[] }; info: string }
  assert.equal(p.data.nums.length, 1)
  assert.ok(p.info)
  assert.equal(
    post("/api/journeys/single-number/preset", { preset: "nope" }).status,
    404
  )
  const parsed = post("/api/journeys/two-sum/parse", {
    text: "1, 2 3",
    params: { target: "5" },
  }).body as { data: { nums: number[]; target: number } }
  assert.deepEqual(parsed.data, { nums: [1, 2, 3], target: 5 })
  assert.equal(
    post("/api/journeys/two-sum/parse", { text: "", params: {} }).status,
    400
  )
  const v = post("/api/journeys/two-sum/classify", {
    data: { nums: [1, 2, 5, 11], target: 99 },
  }).body as { ok: boolean }
  assert.equal(v.ok, false)
})

test("algorithms: list, meta, run for arrays and graphs", () => {
  const list = get("/api/algorithms").body as { key: string }[]
  assert.ok(
    list.some((a) => a.key === "quick") && list.some((a) => a.key === "bfs")
  )
  const sort = post("/api/algorithms/quick/run", { array: [3, 1, 2] }).body as {
    frames: { arr: number[] }[]
  }
  assert.deepEqual(sort.frames.at(-1)!.arr, [1, 2, 3])
  const g = post("/api/algorithms/bfs/run", { n: 6 }).body as {
    graph: { nodes: unknown[] }
    frames: unknown[]
  }
  assert.equal(g.graph.nodes.length, 6)
  assert.ok(g.frames.length > 6)
  assert.equal(post("/api/algorithms/quick/run", { array: "x" }).status, 400)
  assert.equal(get("/api/nothing").status, 404)
})
