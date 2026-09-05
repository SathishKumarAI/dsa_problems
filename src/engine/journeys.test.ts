// Content gate for every journey: schema, every generator drains on the
// sample, every frame narrates, every code tab matches the pseudocode
// line-for-line (highlight sync), and no act leaks a later act's name
// (the progressive-disclosure invariant). Replaces the legacy validate.js
// + lint_disclosure.js. Run: npm test

import assert from "node:assert/strict"
import { test } from "node:test"
import { JOURNEYS, drain } from "./index.ts"
import { classifySingle, singleNumber } from "./journeys/single-number.ts"
import { allTriplets, threeSum } from "./journeys/three-sum.ts"
import { classifyTwoSum, twoSum } from "./journeys/two-sum.ts"
import type { AnyJourney, BaseFrame, Frame } from "./types.ts"

const GENERIC = [
  "the problem",
  "code it",
  "the reveal",
  "start here",
  "your turn",
  "recap",
]
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

function actProse(j: AnyJourney, i: number): string[] {
  const a = j.acts[i]
  return [
    a.name,
    a.short,
    a.insight,
    a.idea,
    a.complexity,
    ...a.takeaways,
    ...(a.hints ?? []),
    ...(a.tools ?? []).flatMap((t) => [t.name, t.role]),
    ...(a.quiz ?? []).flatMap((q) => [q.q, q.explain, ...q.choices]),
  ]
}

for (const j of JOURNEYS) {
  test(`${j.slug}: schema — every act has the fields the UI reads`, () => {
    assert.ok(j.acts.length >= 2)
    assert.ok(Object.keys(j.presets).length > 0)
    assert.ok(j.presets[j.defaultPreset], "defaultPreset exists")
    assert.equal(typeof j.classify, "function")
    assert.ok(Array.isArray(j.sample.nums))
    for (const a of j.acts) {
      for (const k of ["key", "name", "short", "complexity", "idea"] as const)
        assert.ok(a[k], `${a.key}.${k}`)
      assert.ok(a.takeaways.length, `${a.key}.takeaways`)
      assert.ok(a.code.pseudo.length, `${a.key}.code.pseudo`)
      for (const q of a.quiz ?? []) {
        assert.ok(
          q.choices.length >= 2 && q.answer >= 0 && q.answer < q.choices.length,
          `${a.key} quiz shape`
        )
        assert.ok(q.explain, `${a.key} quiz explain`)
      }
    }
    const keys = j.acts.map((a) => a.key)
    assert.equal(new Set(keys).size, keys.length, "act keys unique")
  })

  test(`${j.slug}: code tabs match pseudocode line-for-line`, () => {
    for (const a of j.acts) {
      const n = a.code.pseudo.length
      for (const lang of ["python", "java", "cpp"] as const) {
        const lines = a.code[lang]
        if (lines)
          assert.equal(
            lines.length,
            n,
            `${a.key}.${lang} has ${lines.length} lines, pseudocode has ${n}`
          )
      }
    }
  })

  test(`${j.slug}: every generator drains on the sample and every frame narrates`, () => {
    for (const a of j.acts) {
      const frames = drain(a.run(j.sample, {}))
      assert.ok(frames.length >= 1, `${a.key} yields`)
      for (const f of frames) {
        assert.ok(
          typeof f.note === "string" && f.note.length > 0,
          `${a.key} frame without note`
        )
        if (f.predict)
          assert.ok(
            f.predict.choices.length >= 2 &&
              f.predict.answer < f.predict.choices.length,
            `${a.key} predict shape`
          )
        const model = a.view(f as Frame, j.sample)
        assert.ok(model.panel.kind, `${a.key} view returns a panel`)
        if (f.line !== undefined && f.line >= 0)
          assert.ok(
            f.line < a.code.pseudo.length,
            `${a.key} line ${f.line} out of range`
          )
      }
      // frames must survive JSON — the API ships them over the wire
      assert.equal(
        JSON.stringify(frames),
        JSON.stringify(JSON.parse(JSON.stringify(frames)))
      )
    }
  })

  test(`${j.slug}: edge cases — well-formed, and each one is explained in play at least once`, () => {
    assert.ok(j.edgeCases.length >= 3, "bring at least three corner cases")
    const keys = j.edgeCases.map((e) => e.key)
    assert.equal(new Set(keys).size, keys.length, "edge keys unique")
    for (const e of j.edgeCases) {
      for (const k of ["name", "example", "why", "think"] as const)
        assert.ok(e[k], `${e.key}.${k}`)
      assert.ok(j.presets[e.preset], `${e.key} preset "${e.preset}" exists`)
      // the preset that loads it must make some act tag a frame with it
      const d = j.presets[e.preset].make()
      const tagged = j.acts.some((a) =>
        drain(a.run(d, {})).some((f) => f.corner === e.key)
      )
      assert.ok(
        tagged,
        `edge "${e.key}" is never explained on preset ${e.preset}`
      )
    }
    // and no frame points at an edge case that does not exist
    const data = [j.sample, ...Object.values(j.presets).map((p) => p.make())]
    for (const d of data)
      for (const a of j.acts)
        for (const f of drain(a.run(d, {})))
          if (f.corner)
            assert.ok(
              keys.includes(f.corner),
              `${a.key}: unknown edge "${f.corner}"`
            )
  })

  test(`${j.slug}: every preset makes data the generators accept`, () => {
    for (const [k, p] of Object.entries(j.presets)) {
      const d = p.make()
      assert.ok(Array.isArray(d.nums), `${k}.nums`)
      for (const a of j.acts) drain(a.run(d, {}))
      assert.equal(typeof j.classify(d).ok, "boolean")
    }
  })

  test(`${j.slug}: progressive disclosure — no act names a later act`, () => {
    for (let i = 0; i < j.acts.length; i++) {
      const spoilers = j.acts
        .slice(i + 1)
        .map((a) => a.name)
        .filter((n) => !GENERIC.includes(n.toLowerCase()))
      const surfaces = [
        ...actProse(j, i),
        ...drain(j.acts[i].run(j.sample, {})).flatMap((f) => [
          f.note,
          ...(f.predict ? [f.predict.q, ...f.predict.choices] : []),
        ]),
      ]
      for (const s of spoilers) {
        const re = new RegExp(`\\b${esc(s)}\\b`, "i")
        for (const text of surfaces)
          assert.ok(
            !re.test(text),
            `act "${j.acts[i].name}" leaks "${s}": ${text.slice(0, 80)}`
          )
      }
    }
    // preset banners show from act 1 on, so they may not name anything past act 0
    const spoilers = j.acts
      .slice(1)
      .map((a) => a.name)
      .filter((n) => !GENERIC.includes(n.toLowerCase()))
    for (const [k, p] of Object.entries(j.presets))
      for (const s of spoilers)
        assert.ok(
          !new RegExp(`\\b${esc(s)}\\b`, "i").test(p.info ?? ""),
          `preset ${k} leaks "${s}"`
        )
    // edge cases sit in the story act's reading column — same rule
    for (const e of j.edgeCases)
      for (const s of spoilers)
        for (const text of [e.name, e.example, e.why, e.think])
          assert.ok(
            !new RegExp(`\\b${esc(s)}\\b`, "i").test(text),
            `edge case ${e.key} leaks "${s}": ${text.slice(0, 80)}`
          )
  })
}

// ---------- correctness: every approach agrees with the contract ----------

const lastAnswer = <T>(frames: BaseFrame[]): T | undefined =>
  (
    frames.findLast((f) => "answer" in f && f.answer !== undefined) as
      { answer?: T } | undefined
  )?.answer

test("two-sum: every approach returns the promised pair, including the traps", () => {
  const cases = [
    { nums: [2, 7, 11, 15], target: 9, want: [0, 1] },
    { nums: [3, 2, 4], target: 6, want: [1, 2] },
    { nums: [3, 3], target: 6, want: [0, 1] },
    { nums: [3, 1, 3, 8], target: 6, want: [0, 2] },
    { nums: [1, 9, 4, 6, 30], target: 31, want: [0, 4] },
  ]
  for (const c of cases) {
    assert.ok(classifyTwoSum(c.nums, c.target).ok)
    for (const key of ["brute", "twoptr", "twopass", "hash"]) {
      const act = twoSum.acts.find((a) => a.key === key)!
      const got = lastAnswer<number[]>(drain(act.run(c, {})))
      assert.deepEqual(got, c.want, `${key} on [${c.nums}] target ${c.target}`)
    }
  }
  // broken promise: nobody invents an answer
  for (const key of ["brute", "twoptr", "twopass", "hash"]) {
    const act = twoSum.acts.find((a) => a.key === key)!
    assert.equal(
      lastAnswer(drain(act.run({ nums: [1, 2, 5, 11], target: 99 }, {}))),
      undefined,
      key
    )
  }
})

test("three-sum: every approach returns the same distinct triples, including the traps", () => {
  const cases = [
    {
      nums: [-1, 0, 1, 2, -1, -4],
      want: [
        [-1, -1, 2],
        [-1, 0, 1],
      ],
    },
    { nums: [0, 0, 0, 0], want: [[0, 0, 0]] },
    { nums: [1, 2, 3, 4], want: [] },
    { nums: [-1, 0, 1], want: [[-1, 0, 1]] },
    {
      nums: [3, -2, -1, 0, 2, -3, 1, 1],
      want: allTriplets([3, -2, -1, 0, 2, -3, 1, 1]),
    },
    {
      nums: [-2, 0, 1, 1, 2],
      want: [
        [-2, 0, 2],
        [-2, 1, 1],
      ],
    },
  ]
  const norm = (t: number[][]) =>
    t
      .map((x) => [...x].sort((a, b) => a - b))
      .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
  for (const c of cases) {
    assert.deepEqual(allTriplets(c.nums), norm(c.want))
    for (const key of ["brute", "hash", "twoptr"]) {
      const act = threeSum.acts.find((a) => a.key === key)!
      const got = lastAnswer<number[][]>(drain(act.run(c, {})))
      assert.deepEqual(norm(got ?? []), norm(c.want), `${key} on [${c.nums}]`)
    }
  }
})

test("two-sum: challenge act replays the learner's trace", () => {
  const act = twoSum.acts.find((a) => a.key === "challenge")!
  const data = { nums: [2, 7, 11, 15], target: 9 }
  assert.equal(drain(act.run(data, {})).length, 1)
  const frames = drain(
    act.run(data, {
      trace: {
        events: [
          { op: "get", i: 0, v: 2 },
          { op: "get", i: 1, v: 7 },
        ],
        result: [0, 1],
        error: null,
      },
    })
  )
  assert.equal(frames.length, 3)
  assert.deepEqual(lastAnswer(frames), [0, 1])
})

test("single-number: every approach finds the loner; XOR lies on two singles", () => {
  const cases = [
    [2, 2, 3],
    [4, 1, 2, 1, 2],
    [7],
    [5, 3, 5, 9, 9, 3, 12],
    [1, 1, 2, 2, 8],
  ]
  for (const nums of cases) {
    const want = classifySingle(nums)
    assert.ok(want.ok, `[${nums}]`)
    for (const key of ["brute", "hash", "sort", "xor"]) {
      const act = singleNumber.acts.find((a) => a.key === key)!
      assert.equal(
        lastAnswer(drain(act.run({ nums }, {}))),
        want.single,
        `${key} on [${nums}]`
      )
    }
  }
  const broken = classifySingle([1, 2, 3, 3])
  assert.equal(broken.ok, false)
  const xor = singleNumber.acts.find((a) => a.key === "xor")!
  assert.equal(
    lastAnswer(drain(xor.run({ nums: [1, 2, 3, 3] }, {}))),
    3,
    "1 ^ 2 = 3 — confidently wrong"
  )
})
