// Asteroids That Collide, derived. Two rungs. The first re-scans the whole
// row after every collision; the second notices that the opponent a newcomer
// meets is always the same one — whichever right-mover survived most recently.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/stack/asteroid-collision.ts"

type N = Data<number>

export function survivors(asteroids: number[]) {
  const stack: number[] = []
  for (const a of asteroids) {
    let alive = true
    while (alive && a < 0 && stack.length && stack[stack.length - 1] > 0) {
      if (stack[stack.length - 1] < -a) {
        stack.pop()
        continue
      }
      if (stack[stack.length - 1] === -a) stack.pop()
      alive = false
    }
    if (alive) stack.push(a)
  }
  return stack
}

// How many collisions the busiest single arrival caused — the story act quotes
// it, so it is measured rather than claimed.
function busiestArrival(asteroids: number[]) {
  const stack: number[] = []
  let most = 0
  for (const a of asteroids) {
    let alive = true
    let fights = 0
    while (alive && a < 0 && stack.length && stack[stack.length - 1] > 0) {
      fights += 1
      if (stack[stack.length - 1] < -a) {
        stack.pop()
        continue
      }
      if (stack[stack.length - 1] === -a) stack.pop()
      alive = false
    }
    most = Math.max(most, fights)
    if (alive) stack.push(a)
  }
  return most
}

const arrows = (nums: number[], live: boolean[]) =>
  Object.fromEntries(
    nums.map((v, i) => [i, live[i] ? (v > 0 ? "anchor" : "focus") : "dim"])
  ) as Record<number, ChipRole>

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Each value is an asteroid: how big it is, and — by its sign — which way it is going. Positive moves right, negative moves left, and everything travels at the same speed.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Same speed is the constraint that decides everything. Two asteroids going the same way never catch each other, and a left-mover can never catch a right-mover ahead of it. The ONLY collision possible is a right-mover immediately followed by a left-mover.",
  }
  const out = survivors(nums)
  const adjacentEqual = nums.some(
    (v, i) => v > 0 && nums[i + 1] < 0 && v === -nums[i + 1]
  )
  const sameWay = !nums.some((v, i) => v > 0 && nums.slice(i + 1).some((w) => w < 0))
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((v, i) => [i, v > 0 ? "anchor" : "focus"])
    ) as Record<number, ChipRole>,
    state: [{ label: "survivors", value: out.join(", ") || "none" }],
    answer: out,
    corner: adjacentEqual
      ? "annihilate"
      : sameWay
        ? "samedirection"
        : busiestArrival(nums) >= 2
          ? "chain"
          : undefined,
    note: adjacentEqual
      ? `A right-mover meets a left-mover of exactly the same size here, and BOTH are destroyed — not one survivor with nothing left over. ${out.length ? `What is left is ${out.join(", ")}.` : "Nothing survives at all, and an empty result is a real answer."}`
      : sameWay
        ? "No right-mover has a left-mover anywhere ahead of it, so nothing can ever collide and the row survives exactly as it arrived. Direction, not size, decides whether a meeting is even possible."
        : busiestArrival(nums) >= 2
          ? `Survivors: ${out.join(", ") || "none"}. Watch the arrivals — one of them takes part in ${busiestArrival(nums)} collisions before its fate is settled, so resolving a single new asteroid is not one comparison but a fight down a whole line.`
          : `Survivors: ${out.join(", ") || "none"}.`,
  }
}

function* sweep({ nums }: N): Generator<DFrame> {
  const current = [...nums]
  let changed = true
  let passes = 0
  while (changed) {
    changed = false
    passes += 1
    for (let i = 0; i < current.length - 1; i++) {
      if (current[i] > 0 && current[i + 1] < 0) {
        const left = current[i]
        const right = -current[i + 1]
        yield {
          line: 6,
          row: [...current],
          marks: { [i]: "anchor", [i + 1]: "focus" },
          state: [
            { label: "collision", value: `${left} · ${right}` },
            { label: "passes", value: passes },
          ],
          note: `${left} moving right meets ${right} moving left. ${left < right ? `The right-mover is smaller and is destroyed.` : left > right ? `The left-mover is smaller and is destroyed.` : `Equal — both are destroyed.`}`,
        }
        if (left < right) current.splice(i, 1)
        else if (left > right) current.splice(i + 1, 1)
        else current.splice(i, 2)
        changed = true
        break
      }
    }
  }
  yield {
    line: 17,
    row: [...current],
    answer: [...current],
    state: [
      { label: "survivors", value: current.join(", ") || "none" },
      { label: "passes", value: passes },
    ],
    note: `${current.join(", ") || "nothing survives"}. Correct, and it restarted from the front after every single collision — ${passes} full pass${passes === 1 ? "" : "es"} over the row, because it had no way of knowing where the next collision might now be possible.`,
  }
}

function* stack({ nums }: N): Generator<DFrame> {
  const st: number[] = []
  const live = nums.map(() => false)
  for (let i = 0; i < nums.length; i++) {
    const a = nums[i]
    let alive = true
    while (alive && a < 0 && st.length && st[st.length - 1] > 0) {
      const top = st[st.length - 1]
      yield {
        line: 5,
        marks: { ...arrows(nums, live), [i]: "focus" },
        state: [
          { label: "surviving", value: st.join(", ") || "none" },
          { label: "fighting", value: `${top} · ${-a}` },
        ],
        note: `${-a} moving left meets ${top}, the most recent right-mover still standing — and it is always that one, because everything ahead of it was already destroyed or is moving the other way. ${top < -a ? `${top} is smaller and goes.` : top === -a ? "Equal — both go." : `${top} is bigger, so the newcomer goes.`}`,
      }
      if (top < -a) {
        st.pop()
        continue
      }
      if (top === -a) st.pop()
      alive = false
    }
    if (alive) {
      st.push(a)
      live[i] = true
      yield {
        line: 12,
        marks: { ...arrows(nums, live), [i]: "answer" },
        state: [{ label: "surviving", value: st.join(", ") }],
        note: `${a} survives${a > 0 ? " — a right-mover, and now the one any future left-mover will meet first" : " — a left-mover with nothing to its left that could stop it, so it is out of the row for good"}.`,
      }
    }
  }
  yield {
    line: 13,
    answer: [...st],
    state: [{ label: "survivors", value: st.join(", ") || "none" }],
    note: `${st.join(", ") || "nothing survives"}. No pass was ever restarted: a collision is resolved the instant it becomes possible, and every asteroid is added once and removed at most once.`,
  }
}

export const asteroidCollision = deriveJourney(problem, {
  slug: "asteroids-that-collide",
  subtitle: "the opponent is always the one that survived most recently",
  reveals: ["stack"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer field" },
  classify: (d) =>
    (d.nums as number[]).every((v) => v !== 0)
      ? { ok: true }
      : { ok: false, warning: "an asteroid of size 0 has no direction" },
  presets: {
    example: { label: "the example", nums: [5, 10, -5] },
    annihilate: {
      label: "equal sizes",
      nums: [8, -8],
      info: "both are destroyed",
    },
    samedirection: {
      label: "nothing can meet",
      nums: [-2, -1, 1, 2],
      info: "left-movers ahead, right-movers behind",
    },
    chain: {
      label: "one arrival, several collisions",
      nums: [10, 2, -5],
      info: "the newcomer wins once, then loses",
    },
    long: {
      label: "a longer field",
      nums: [3, 8, -2, -9, 4, 1, -6, 12, -12, 5, -1],
    },
  },
  edges: [
    {
      key: "annihilate",
      name: "equal sizes",
      example: "[8, -8] → []",
      why: "Both are destroyed — not one survivor with nothing left over. And the result is empty, which is a real answer rather than an absence of one.",
      think: "When two collide with the same size, how many asteroids do you remove?",
      preset: "annihilate",
      constraint: 3,
    },
    {
      key: "samedirection",
      name: "nothing can meet at all",
      example: "[-2, -1, 1, 2] → unchanged",
      why: "Every left-mover is already ahead of every right-mover, and equal speeds mean nothing catches anything. Direction decides whether a collision is possible; size only decides who wins one.",
      think: "Which pairs of asteroids can ever meet, and which can you rule out immediately?",
      preset: "samedirection",
      constraint: 2,
    },
    {
      key: "chain",
      name: "one arrival, several collisions",
      example: "[10, 2, -5] → [10]",
      why: "-5 destroys 2, survives, meets 10 and loses. Resolving a single new asteroid is a fight down a whole line, not one comparison — so the handling has to be a loop.",
      think: "After your newcomer wins a collision, is it finished?",
      preset: "chain",
      constraint: 0,
    },
  ],
  rungs: [
    {
      key: "story",
      name: "The Problem",
      short: "start here",
      insight: "",
      idea: problem.statement,
      pseudo: [
        "given: sizes with signs — positive right, negative left",
        "everything moves at the same speed",
        "so only a right-mover followed by a left-mover can ever collide",
        "task: return what is left when no collision is possible",
      ],
      tools: [
        {
          name: "Array of signed sizes",
          role: "a row where the sign is direction and the magnitude is size. Position is space: what is to your right is ahead of you, and equal speeds mean you never catch it.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "a collision needs a positive on the left and a negative on the right — nothing else",
        "equal magnitudes destroy both, so a collision can remove two asteroids",
        "one arrival can cause several collisions in a row before its own fate is settled",
        "an empty result is a legal answer",
      ],
      quiz: [
        {
          q: "Why can two asteroids moving in the same direction never collide?",
          choices: [
            "because they have the same size",
            "because they move at the same speed, so the gap between them never changes",
          ],
          answer: 1,
          explain:
            "Equal speed is the whole reason. It is also why a left-mover cannot catch a right-mover that is already ahead of it.",
        },
      ],
      run: story,
    },
    {
      key: "sweep",
      name: "Sweep until nothing changes",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Scan for an adjacent pair that would collide, resolve that one pair, and start over. Repeat until a full scan finds nothing to do.",
      takeaways: [
        "obviously right, because it only ever resolves collisions that are genuinely possible",
        "removing one asteroid can create a new adjacency anywhere, and this has no idea where",
        "so it pays a whole pass per collision — a long chain makes it quadratic",
      ],
      run: sweep,
    },
    {
      key: "stack",
      name: "Keep the right-movers still standing",
      short: "one push and one pop each",
      insight:
        "The restart exists because a collision can create a new adjacency, and the sweep does not know where. But it is knowable: a new left-mover meets whichever right-mover survived most recently, and if it wins, the one before that. The opponents are exactly the surviving right-movers, newest first.",
      idea: problem.whyNow!,
      takeaways: [
        "hold the survivors so far; a newcomer's opponent is always the most recent right-mover among them",
        "a left-mover that wins keeps fighting downward — the handling is a loop, not a comparison",
        "a right-mover never fights on arrival: everything before it is behind it",
        "each asteroid is added once and removed at most once, so the whole thing is linear",
      ],
      quiz: [
        {
          q: "A new left-mover arrives. Which asteroid does it meet first?",
          choices: [
            "the largest right-mover so far",
            "the most recently surviving right-mover",
          ],
          answer: 1,
          explain:
            "Space, not size, decides who is met — and the nearest thing to the left that is coming toward it is whatever survived most recently. Size only decides who wins.",
        },
      ],
      run: stack,
    },
  ],
})
