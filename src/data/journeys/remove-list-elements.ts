// Delete Every Node Holding a Value, derived — the other half of the dummy-node
// lesson that swap-pairs teaches. Here the dummy removes TWO special cases at
// once: a head that matches, and a head that keeps matching after the first
// removal. The stage keeps deleted nodes visible as `dim` for one frame so a
// removal reads as an unlinking rather than a teleport.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/linked-list/remove-list-elements.ts"

type N = Data<number>

export const withoutValue = (nums: number[], val: number) =>
  nums.filter((x) => x !== val)

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

const target = (d: N) => (d.val as number) ?? 6

function* story(d: N): Generator<DFrame> {
  const { nums } = d
  const val = target(d)
  yield {
    hold: 3,
    noChips: true,
    note: `Every node holding ${val} has to go, and what is left keeps its order. The answer is the head of whatever survives — which may not be the head you were handed.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Unlinking a node means pointing the node BEFORE it at the node AFTER it. A forward-only list will not hand you the node before, so every solution below is really an argument about how to always have it.",
  }
  if (!nums.length) {
    yield {
      hold: 3,
      answer: [],
      corner: "empty",
      note: "An empty list in, an empty list out. Nothing to walk, nothing to unlink — and a solution that reads head.val before checking head crashes here.",
    }
    return
  }
  const kept = withoutValue(nums, val)
  yield {
    hold: 3,
    list: {
      values: nums,
      label: "as given",
      marks: marksOf(nums.length, (i) => (nums[i] === val ? "anchor" : undefined)),
      labels: { 0: "head" },
    },
    state: [
      { label: "removing", value: val },
      { label: "survivors", value: kept.length },
    ],
    answer: kept,
    corner:
      kept.length === 0
        ? "all"
        : nums[0] === val
          ? "head"
          : undefined,
    note:
      kept.length === 0
        ? `Every node holds ${val}, so the legal answer is an empty list. The function has to be able to return nothing at all — which is the case a solution that assumes a surviving head gets wrong.`
        : nums[0] === val
          ? `The HEAD matches${nums[1] === val ? ", and so does the node behind it" : ""}. The front of the list can need several removals in a row, and the head has no node before it to do the unlinking.`
          : `${nums.join(" → ")} becomes ${kept.join(" → ")}. The matches here sit in the middle, which is the easy shape — the head is where this problem bites.`,
  }
}

// ---- rung 0: restart the scan after every removal ----
function* restart(d: N): Generator<DFrame> {
  const { nums } = d
  const val = target(d)
  let row = [...nums]
  let steps = 0
  while (row.length && row[0] === val) {
    row = row.slice(1)
    steps++
    yield {
      line: 2,
      list: {
        values: row,
        label: "stripping a leading match",
        marks: marksOf(row.length, (i) => (row[i] === val ? "anchor" : undefined)),
      },
      state: [{ label: "steps walked", value: steps }],
      note: `The head matched, so the head moves on. Leading matches need their own loop here, because there is no node in front of the head to unlink from.`,
    }
  }
  let guard = 0
  for (;;) {
    const at = row.findIndex((x) => x === val)
    steps += at === -1 ? row.length : at + 1
    if (at === -1 || guard++ > 40) break
    yield {
      line: 8,
      list: {
        values: row,
        label: "scanning from the head — again",
        marks: marksOf(row.length, (i) =>
          i === at ? "focus" : i < at ? "dim" : undefined
        ),
      },
      state: [{ label: "steps walked", value: steps }],
      note: `Found a ${val} at position ${at}, after re-walking the ${at} node${at === 1 ? "" : "s"} in front of it — nodes this loop has already cleared once.`,
    }
    row = [...row.slice(0, at), ...row.slice(at + 1)]
    yield {
      line: 11,
      list: {
        values: row,
        label: "removed — and the scan starts over",
        marks: marksOf(row.length, (i) => (row[i] === val ? "anchor" : undefined)),
      },
      state: [{ label: "steps walked", value: steps }],
      note: "One node unlinked, and the loop breaks back to the head rather than carrying on from here. Every removal pays for the whole prefix again.",
    }
  }
  yield {
    line: 13,
    answer: row,
    list: { values: row, label: "correct, and quadratic" },
    state: [{ label: "steps walked", value: steps }],
    note: `${row.join(" → ") || "nothing"}. Never wrong, and it re-checks what it has already cleared: a list of nothing but matches costs about n²/2 steps. The information it keeps throwing away is where it had got to.`,
  }
}

// ---- rung 1: collect the survivors, build a new list ----
function* rebuild(d: N): Generator<DFrame> {
  const { nums } = d
  const val = target(d)
  const kept: number[] = []
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== val) kept.push(nums[i])
    yield {
      line: 3,
      list: {
        values: nums,
        label: "one pass, keeping what survives",
        marks: marksOf(nums.length, (k) =>
          k === i ? (nums[i] === val ? "anchor" : "focus") : k < i ? "dim" : undefined
        ),
      },
      state: [{ label: "kept so far", value: kept.join(", ") || "—" }],
      note:
        nums[i] === val
          ? `${nums[i]} matches, so it is simply not collected. Nothing is unlinked — the original list is untouched.`
          : `${nums[i]} survives and is written down.`,
    }
  }
  const out: number[] = []
  for (const v of [...kept].reverse()) {
    out.unshift(v)
    yield {
      line: 8,
      list: {
        values: [...out],
        label: "building a second list, back to front",
        marks: marksOf(out.length, (k) => (k === 0 ? "answer" : undefined)),
      },
      state: [{ label: "nodes allocated", value: out.length }],
      note: `A NEW node holding ${v}, put in front of what has been built. Linear at last — and every survivor is now a second object, with the originals abandoned.`,
    }
  }
  yield {
    line: 9,
    answer: out,
    list: { values: out, label: "freshly allocated" },
    state: [{ label: "nodes allocated", value: out.length }],
    note: `${out.join(" → ") || "nothing"}. Correct and linear, and it built up to n new nodes to avoid ever unlinking one. A caller holding a reference to a surviving node still holds the OLD node, which is no longer in the answer.`,
  }
}

// ---- rung 2: recursion ----
function* recurse(d: N): Generator<DFrame> {
  const { nums } = d
  const val = target(d)
  const walk = function* (i: number): Generator<DFrame, number[]> {
    if (i >= nums.length) {
      yield {
        line: 2,
        list: { values: [], label: "past the end" },
        state: [{ label: "frames open", value: i }],
        note: "The end of the list returns nothing, and the answers start coming back up.",
      }
      return []
    }
    yield {
      line: 3,
      list: {
        values: nums,
        label: "descending — nothing decided yet",
        marks: marksOf(nums.length, (k) =>
          k === i ? "focus" : k < i ? "dim" : undefined
        ),
      },
      state: [{ label: "frames open", value: i + 1 }],
      note: `This frame owns ${nums[i]}, and delegates the entire rest of the list before deciding anything about it.`,
    }
    const tail = yield* walk(i + 1)
    const keep = nums[i] !== val
    const out = keep ? [nums[i], ...tail] : tail
    yield {
      line: 4,
      list: {
        values: out,
        label: keep ? "kept, and hooked onto the cleaned tail" : "dropped — the tail is returned instead",
        marks: marksOf(out.length, (k) => (k === 0 ? (keep ? "answer" : "focus") : "dim")),
      },
      state: [{ label: "frames open", value: i }],
      note: keep
        ? `${nums[i]} does not match, so this frame returns itself with the cleaned tail behind it.`
        : `${nums[i]} matches, so the frame returns the cleaned tail INSTEAD of itself — which is how a matching head disappears without anyone unlinking it.`,
    }
    return out
  }
  const out = yield* walk(0)
  yield {
    line: 4,
    answer: out,
    list: { values: out, label: "returned up the stack" },
    state: [{ label: "peak frames", value: nums.length }],
    note: `${out.join(" → ") || "nothing"}. Three lines, and the head case costs nothing because a frame may return its tail instead of itself. The price is the stack: 10^4 nodes is 10^4 frames, and that is past what a default stack will give you.`,
  }
}

// ---- rung 3: strip the head, then walk with prev ----
function* stripThenWalk(d: N): Generator<DFrame> {
  const { nums } = d
  const val = target(d)
  let row = [...nums]
  let stripped = 0
  while (row.length && row[0] === val) {
    row = row.slice(1)
    stripped++
    yield {
      line: 3,
      list: {
        values: row,
        label: "the head loop — the one people forget",
        marks: marksOf(row.length, (i) => (i === 0 ? "focus" : undefined)),
      },
      state: [
        { label: "loops written", value: 2 },
        { label: "heads stripped", value: stripped },
      ],
      note: `The head matched, so the head moves on — and it may match again. A list that is ENTIRELY matches is handled here and nowhere else, which is why forgetting this loop passes every test where the head survives.`,
    }
  }
  let i = 0
  while (i + 1 < row.length) {
    if (row[i + 1] === val) {
      yield {
        line: 7,
        list: {
          values: row,
          label: "unlink the next node",
          marks: marksOf(row.length, (k) =>
            k === i ? "focus" : k === i + 1 ? "anchor" : k < i ? "dim" : undefined
          ),
        },
        state: [{ label: "loops written", value: 2 }],
        note: `prev is standing on ${row[i]} and the node after it matches, so prev's link jumps over it. prev does NOT advance — the node sliding in may match too.`,
      }
      row = [...row.slice(0, i + 1), ...row.slice(i + 2)]
    } else {
      i++
      yield {
        line: 9,
        list: {
          values: row,
          label: "a survivor — step forward",
          marks: marksOf(row.length, (k) =>
            k === i ? "focus" : k < i ? "dim" : undefined
          ),
        },
        state: [{ label: "loops written", value: 2 }],
        note: `${row[i]} stays, so prev moves onto it. Advancing only when nothing was removed is the whole trick of the walk.`,
      }
    }
  }
  yield {
    line: 10,
    answer: row,
    list: { values: row, label: "one pass, constant space — and two copies of the same test" },
    state: [{ label: "loops written", value: 2 }],
    note: `${row.join(" → ") || "nothing"}. Linear and in place. The cost is duplication: the same comparison is written twice, once for the head and once for everything else, and the two can drift apart the moment the rule changes.`,
  }
}

// ---- rung 4 (optimal): a dummy in front of the head ----
function* dummy(d: N): Generator<DFrame> {
  const { nums } = d
  const val = target(d)
  let row = [...nums]
  yield {
    line: 1,
    list: {
      values: ["·", ...row],
      label: "a dummy node in front of the head",
      marks: { 0: "anchor" },
      labels: { 0: "dummy", 1: "head" },
    },
    state: [{ label: "loops written", value: 1 }],
    note: "One throwaway node in front of the list, and the head stops being special: it now has a node before it, exactly like every other node.",
  }
  let i = 0
  let removed = 0
  while (i < row.length) {
    if (row[i] === val) {
      yield {
        line: 6,
        list: {
          values: ["·", ...row],
          label: "prev's link jumps over the match",
          marks: { [i + 1]: "anchor", [i]: "focus" },
          labels: { [i]: "prev" },
        },
        state: [
          { label: "loops written", value: 1 },
          { label: "removed", value: removed + 1 },
        ],
        note: `${row[i]} matches and is unlinked${i === 0 ? " — and this is the HEAD, handled by the same line as everything else" : ""}. prev stays exactly where it is, because the node that slides into that position may match too.`,
      }
      row = [...row.slice(0, i), ...row.slice(i + 1)]
      removed++
    } else {
      yield {
        line: 8,
        list: {
          values: ["·", ...row],
          label: "a survivor — prev moves on",
          marks: { [i + 1]: "focus" },
          labels: { [i + 1]: "prev" },
        },
        state: [
          { label: "loops written", value: 1 },
          { label: "removed", value: removed },
        ],
        note: `${row[i]} stays, so prev advances onto it. One loop, one test, and the head needed no mention.`,
      }
      i++
    }
  }
  yield {
    line: 9,
    answer: row,
    list: {
      values: ["·", ...row],
      label: "dummy.next is the answer",
      marks: { 0: "anchor", 1: "answer" },
      labels: { 0: "dummy" },
    },
    state: [
      { label: "loops written", value: 1 },
      { label: "extra memory", value: "1 node" },
    ],
    note: `${row.join(" → ") || "nothing"}. Reading the answer off the dummy rather than tracking the head is what makes an all-matches list free: dummy.next was never assigned a survivor, so it is still null, and returning nothing needs no branch.`,
  }
}

export const removeListElements = deriveJourney(problem, {
  slug: "delete-every-one-of-them",
  subtitle: "the head has no node in front of it — so invent one",
  reveals: ["linked-list"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer list" },
  sample: [1, 2, 6, 3, 4, 5, 6],
  presets: {
    example: {
      label: "the example",
      nums: [1, 2, 6, 3, 4, 5, 6],
      extra: { val: 6 },
      info: "matches in the middle and at the tail",
    },
    head: {
      label: "the head matches, twice",
      nums: [7, 7, 1, 2, 7],
      extra: { val: 7 },
      info: "several removals in a row at the front",
    },
    all: {
      label: "every node matches",
      nums: [7, 7, 7],
      extra: { val: 7 },
      info: "the answer is an empty list",
    },
    empty: {
      label: "an empty list",
      nums: [],
      extra: { val: 7 },
      info: "legal input",
    },
    none: {
      label: "nothing matches",
      nums: [1, 2, 3],
      extra: { val: 9 },
      info: "the list comes back whole",
    },
    long: {
      label: "a longer list",
      nums: [6, 1, 6, 6, 2, 3, 6, 4, 6],
      extra: { val: 6 },
    },
  },
  params: [{ key: "val", label: "remove", kind: "number" }],
  edges: [
    {
      key: "head",
      name: "the head matches — more than once",
      example: "[7,7,1,2,7], val 7 → [1,2]",
      why: "The head has no node in front of it to do the unlinking, and removing it can expose another match immediately. A solution that strips the head once, or that advances after a removal, leaves a match behind.",
      think: "After you remove a node, what is standing where it was — and have you checked it?",
      preset: "head",
      constraint: 2,
    },
    {
      key: "all",
      name: "every node matches",
      example: "[7,7,7], val 7 → []",
      why: "The legal answer is an empty list, so the function must be able to return nothing at all. Anything that assumes a surviving head — or that remembers the original head as the answer — returns a list that should not exist.",
      think: "What exactly do you return when nothing survives?",
      preset: "all",
      constraint: 3,
    },
    {
      key: "empty",
      name: "an empty list",
      example: "[] → []",
      why: "Legal input with nothing to walk. Code that reads head.val before testing head crashes here rather than answering, and it is the case a dummy-node solution never even notices.",
      think: "How many checks does your version need before its first comparison?",
      preset: "empty",
      constraint: 4,
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
        "given: the head of a singly linked list, and a value",
        "remove EVERY node holding that value",
        "what is left keeps its order",
        "task: return the head of the survivors — which may be nothing",
      ],
      tools: [
        {
          name: "Singly linked list",
          role: "a chain where each node knows only its successor. To unlink a node you need the node BEFORE it, and that is the one thing a forward-only list will not give you after the fact.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "unlinking needs the node before the one being removed",
        "removals can be consecutive, so after a removal the same position must be re-checked",
        "the head may match, and the answer may be an empty list",
      ],
      quiz: [
        {
          q: "You remove a node by pointing its predecessor past it. What must you check next?",
          choices: [
            "the node after the one you removed — you have already passed it",
            "the same position again: something new is standing there, and it may match too",
          ],
          answer: 1,
          explain:
            "This is the bug that survives every test where matches are not adjacent. Advancing after a removal skips whatever slid into the gap.",
        },
      ],
      run: story,
    },
    {
      key: "restart",
      name: "Remove one, then start over",
      short: "never wrong, never fast",
      from: 0,
      insight: "",
      idea: problem.alternatives![0].summary,
      takeaways: [
        "obviously correct: after every removal it re-examines everything",
        "and that is the cost — a list of nothing but matches walks about n²/2 nodes",
        "what it throws away each time is the one thing worth keeping: where it had got to",
      ],
      run: restart,
    },
    {
      key: "rebuild",
      name: "Collect the survivors, build a new list",
      short: "linear, and it allocates",
      from: 1,
      insight:
        "Restarting is only necessary because the walk forgets its position. A single pass that writes down what survives never has to go back.",
      idea: problem.alternatives![1].summary,
      takeaways: [
        "one pass, linear, and impossible to get the adjacency bug wrong — nothing is ever unlinked",
        "it allocates up to n new nodes and abandons the ones it was given",
        "a caller still holding a surviving node holds the OLD node, which is not in the answer",
      ],
      run: rebuild,
    },
    {
      key: "recurse",
      name: "Clean the tail, then decide about this node",
      short: "three lines, one frame per node",
      from: 2,
      insight:
        "Allocating a second list is a lot of machinery for a decision each node can make alone: keep me, or return what is behind me.",
      idea: problem.alternatives![2].summary,
      takeaways: [
        "a frame returns its cleaned tail INSTEAD of itself when it matches, so a matching head costs no special case",
        "it rewires the nodes it was given rather than allocating new ones",
        "and it holds a frame per node — 10^4 nodes is past what a default stack allows",
      ],
      run: recurse,
    },
    {
      key: "strip",
      name: "Strip the head, then walk with prev",
      short: "in place, two loops",
      from: 3,
      insight:
        "Every open frame is holding one thing: the node before the current one. That is a pointer, not a frame — carry it and walk forward once.",
      idea: problem.alternatives![3].summary,
      takeaways: [
        "constant memory and one pass over the list",
        "advance only when nothing was removed, or a match that slides into the gap is skipped",
        "and the same test is written twice — once for the head, once for the rest",
      ],
      run: stripThenWalk,
    },
    {
      key: "dummy",
      name: "A dummy in front of the head",
      short: "one loop, no special cases",
      insight:
        "Both loops are testing the same thing; only one of them exists because the head has nothing in front of it. So give it something.",
      idea: problem.whyNow!,
      takeaways: [
        "one fake node makes the head an ordinary node, and one loop covers the whole list",
        "return dummy.next, not the original head — the head may be one of the removed",
        "an all-matches list falls out for free: dummy.next was never reassigned, so it is still nothing",
        "prev stays put after a removal; that single decision is the whole correctness of the loop",
      ],
      quiz: [
        {
          q: "Why return dummy.next rather than the head you were given?",
          choices: [
            "they are the same node",
            "the head may have been removed — dummy.next is whatever ended up first, including nothing at all",
          ],
          answer: 1,
          explain:
            "That is also why the empty answer needs no branch: dummy.next is null until a survivor is linked to it.",
        },
      ],
      run: dummy,
    },
  ],
})
