// Merge Two Sorted Lists, derived — the first journey whose input is TWO
// structures. Both arrive in one row of tokens with "|" between them, so the
// test-case drawer stays a single text field and a learner can move the divider
// to make either list empty.
//
// The list view draws the OUTPUT being spliced together, marked by which side
// each node came from; the two inputs live in the state row as what remains of
// them. That is the honest picture: the answer is one list, built from nodes
// that already existed.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/linked-list/merge-two-sorted.ts"

type W = Data<string>

const BAR = "|"

/** The row splits at the bar: list a, then list b. */
export function split(nums: string[]) {
  const at = nums.indexOf(BAR)
  const a = nums.slice(0, at === -1 ? nums.length : at).map(Number)
  const b = at === -1 ? [] : nums.slice(at + 1).map(Number)
  return { a, b }
}

/** The reference: both lists spliced into one ascending list. */
export const merged = (nums: string[]) => {
  const { a, b } = split(nums)
  return [...a, ...b].sort((x, y) => x - y)
}

const sortedAsc = (xs: number[]) =>
  xs.every((v, i) => i === 0 || xs[i - 1] <= v)

const wellFormed = (nums: string[]) => {
  if (nums.filter((t) => t === BAR).length !== 1) return false
  if (!nums.every((t) => t === BAR || Number.isInteger(Number(t)))) return false
  const { a, b } = split(nums)
  return sortedAsc(a) && sortedAsc(b)
}

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

const show = (xs: number[]) => (xs.length ? xs.join(" → ") : "∅")

/** The output list, with each node marked by the side it was taken from. */
const out = (
  values: number[],
  from: ("a" | "b")[],
  label: string,
  labels?: Record<number, string>
) => ({
  values,
  label,
  labels,
  marks: marksOf(values.length, (i) => (from[i] === "a" ? "anchor" : "focus")),
})

function* story({ nums }: W): Generator<DFrame> {
  const { a, b } = split(nums)
  yield {
    hold: 3,
    noChips: true,
    note: "Two linked lists, each already sorted, and one sorted list wanted out of them. The nodes themselves are to be re-linked — not copied into something new.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Both being sorted already is the whole gift. It means the smallest value left anywhere is always at the front of one list or the other — never buried in the middle of either.",
  }
  if (!a.length || !b.length) {
    yield {
      hold: 3,
      answer: merged(nums),
      list: out(
        merged(nums),
        merged(nums).map(() => (a.length ? "a" : "b")),
        a.length || b.length ? "the survivor, unchanged" : "∅"
      ),
      corner: "empty",
      note:
        a.length || b.length
          ? `One list is empty, which is legal. The answer is the other list exactly as it stands — already sorted, so there is nothing to merge and nothing to rebuild.`
          : "Both lists are empty, which is also legal. The answer is the empty list, and any code that dereferences a head before testing it fails here rather than saying so.",
    }
    return
  }
  const answer = merged(nums)
  yield {
    hold: 3,
    list: out(
      answer,
      answer.map(() => "a"),
      `${show(a)}   and   ${show(b)}`
    ),
    state: [
      { label: "a", value: show(a) },
      { label: "b", value: show(b) },
    ],
    answer,
    corner:
      a[a.length - 1] <= b[0] || b[b.length - 1] <= a[0]
        ? "disjoint"
        : a.some((v) => b.includes(v))
          ? "tie"
          : undefined,
    note:
      a[a.length - 1] <= b[0] || b[b.length - 1] <= a[0]
        ? `These two do not overlap at all: one list finishes before the other starts, so the answer is simply one after the other. The interesting part is what the code does when the first list runs out — the rest of the second is already sorted and needs no further comparisons.`
        : a.some((v) => b.includes(v))
          ? `A value appears in both lists. Merging keeps both copies — nothing is de-duplicated — and which one goes first is a decision the comparison makes, so it is worth deciding deliberately rather than by accident.`
          : `Interleaved: ${show(answer)}. Every value is already in the right order within its own list, so the only question at each step is which of the two FRONT nodes goes next.`,
  }
}

/** Rung 1 — collect every value, sort, rebuild. */
function* collectSort({ nums }: W): Generator<DFrame> {
  const { a, b } = split(nums)
  const vals: number[] = []
  const from: ("a" | "b")[] = []
  yield {
    line: 1,
    list: out([], [], "vals: empty"),
    state: [
      { label: "a", value: show(a) },
      { label: "b", value: show(b) },
    ],
    note: "Forget that they are linked lists for a moment: walk both, and collect the values into one flat array.",
  }
  for (const [side, list] of [
    ["a", a],
    ["b", b],
  ] as const)
    for (const v of list) {
      vals.push(v)
      from.push(side)
      yield {
        line: 4,
        list: out(vals, from, `vals: ${vals.join(" ")}`),
        state: [{ label: "collected", value: vals.length }],
        note: `${v} from list ${side}. The array is not sorted while this runs — appending list b after list a undoes the order both of them arrived in.`,
      }
    }
  const answer = merged(nums)
  yield {
    line: 7,
    list: out(
      answer,
      answer.map(() => "a"),
      `sorted: ${show(answer)}`
    ),
    state: [{ label: "values", value: answer.length }],
    corner: !a.length || !b.length ? "empty" : undefined,
    note: `Now sort all ${answer.length} values and build a fresh list from them. It works — at the cost of sorting data that arrived sorted, and of allocating a node for every value when the nodes already existed.`,
  }
  yield {
    line: 9,
    answer,
    list: out(
      answer,
      answer.map(() => "a"),
      show(answer)
    ),
    state: [
      { label: "answer", value: show(answer) },
      { label: "new nodes", value: answer.length },
    ],
    note: `${show(answer)}. Correct, and wasteful twice over: n log n to re-establish an order that was handed to us, and ${answer.length} new nodes for a problem that asked for the old ones to be re-linked.`,
  }
}

/** Rung 2 — recursion: whichever head is smaller, then merge the rest. */
function* recursive({ nums }: W): Generator<DFrame> {
  const { a, b } = split(nums)
  const values: number[] = []
  const from: ("a" | "b")[] = []
  let depth = 0
  let deepest = 0
  function* merge(i: number, j: number): Generator<DFrame> {
    depth++
    deepest = Math.max(deepest, depth)
    if (i >= a.length || j >= b.length) {
      const rest = i >= a.length ? b.slice(j) : a.slice(i)
      for (const v of rest) {
        values.push(v)
        from.push(i >= a.length ? "b" : "a")
      }
      yield {
        line: 2,
        list: out(
          values,
          from,
          rest.length ? "one side is empty — return the other" : "both empty"
        ),
        state: [
          { label: "depth", value: depth },
          { label: "returned", value: show(rest) },
        ],
        corner: !a.length || !b.length ? "empty" : undefined,
        note: rest.length
          ? `${i >= a.length ? "List a" : "List b"} is exhausted, so the answer to this sub-problem is the whole of what remains: ${show(rest)}. No comparisons left to make — the survivor is already sorted.`
          : "Both sides are empty, so this call returns nothing at all. That is the base case the whole recursion unwinds from.",
      }
      depth--
      return
    }
    const takeA = a[i] <= b[j]
    values.push(takeA ? a[i] : b[j])
    from.push(takeA ? "a" : "b")
    yield {
      line: takeA ? 4 : 6,
      list: out(values, from, `depth ${depth}`, {
        [values.length - 1]: takeA ? "from a" : "from b",
      }),
      state: [
        { label: "a", value: show(a.slice(i)) },
        { label: "b", value: show(b.slice(j)) },
        { label: "depth", value: depth },
      ],
      corner: a[i] === b[j] ? "tie" : undefined,
      note:
        a[i] === b[j]
          ? `Both fronts are ${a[i]}. The comparison is <=, so list a's copy goes first — arbitrary for values, but it is the line that decides whether equal elements keep their original relative order.`
          : `${takeA ? a[i] : b[j]} is the smaller of the two fronts, so it goes next, and the same question is then asked of what is left. The call stack grows by one for every node placed.`,
    }
    yield* merge(takeA ? i + 1 : i, takeA ? j : j + 1)
    depth--
  }
  yield* merge(0, 0)
  const answer = merged(nums)
  yield {
    line: 5,
    answer,
    list: out(values, from, show(answer)),
    state: [
      { label: "answer", value: show(answer) },
      { label: "deepest frame", value: deepest },
    ],
    note: `${show(answer)} — and no new nodes: each call returned one of the nodes it was handed. The price is the stack: it went ${deepest} frames deep, one per node, and the lists may hold thousands.`,
  }
}

/** Rung 3 — a dummy head and a tail pointer: the same merge, in a loop. */
function* dummyHead({ nums }: W): Generator<DFrame> {
  const { a, b } = split(nums)
  const values: number[] = []
  const from: ("a" | "b")[] = []
  let i = 0
  let j = 0
  const anyNegative = [...a, ...b].some((v) => v < 0)
  yield {
    line: 1,
    list: out([], [], "dummy → ∅"),
    state: [
      { label: "a", value: show(a) },
      { label: "b", value: show(b) },
    ],
    corner: anyNegative ? "negatives" : undefined,
    note: anyNegative
      ? "One node that holds no answer and exists only to be pointed at. Note what it holds — 0 — and note that nothing ever reads it: these lists contain values below 0, so a dummy treated as 'smaller than everything' would be wrong on the first comparison. It is a placeholder for a POINTER."
      : "One node that holds no answer and exists only to be pointed at. Every 'is this the first node?' question disappears, because there is always already a node to attach to.",
  }
  while (i < a.length && j < b.length) {
    const takeA = a[i] <= b[j]
    values.push(takeA ? a[i] : b[j])
    from.push(takeA ? "a" : "b")
    yield {
      line: takeA ? 4 : 6,
      list: out(values, from, `tail = ${values[values.length - 1]}`, {
        [values.length - 1]: "tail",
      }),
      state: [
        { label: "a", value: show(a.slice(takeA ? i + 1 : i)) },
        { label: "b", value: show(b.slice(takeA ? j : j + 1)) },
      ],
      corner: a[i] === b[j] ? "tie" : undefined,
      note:
        a[i] === b[j]
          ? `The fronts tie at ${a[i]}; <= takes a's, and the tail moves onto it. Written with < instead, b's copy would go first — same output values, different nodes, and on a stable merge that difference is the specification.`
          : `${takeA ? a[i] : b[j]} is smaller, so the tail's next points at it and the tail moves along. Nothing was allocated: an existing node just changed which node it precedes.`,
    }
    if (takeA) i++
    else j++
  }
  const rest = i < a.length ? a.slice(i) : b.slice(j)
  for (const v of rest) {
    values.push(v)
    from.push(i < a.length ? "a" : "b")
  }
  const answer = merged(nums)
  yield {
    line: 8,
    list: out(
      values,
      from,
      rest.length ? `+ ${show(rest)}` : "nothing left over"
    ),
    state: [{ label: "attached in one step", value: show(rest) }],
    corner:
      !a.length || !b.length
        ? "empty"
        : a[a.length - 1] <= b[0] || b[b.length - 1] <= a[0]
          ? "disjoint"
          : undefined,
    note: rest.length
      ? `One list is empty and the other still holds ${show(rest)}. That remainder is already sorted and already linked, so it is attached with a single assignment — no loop, no comparisons. This one line is why 'either list may be empty' needs no special case anywhere.`
      : "Both ran out on the same step, so there is no remainder. The same assignment still runs, and attaches nothing — which is why it does not need a test around it.",
  }
  yield {
    line: 9,
    answer,
    list: out(values, from, show(answer), { 0: "the real head" }),
    state: [
      { label: "answer", value: show(answer) },
      { label: "new nodes", value: 0 },
    ],
    note: `${show(answer)}. Return dummy.next, never the dummy itself. One pass over each list, no recursion, no allocation — the dummy is thrown away and the extra memory is the two pointers.`,
  }
}

export const mergeTwoSorted = deriveJourney<string>(problem, {
  slug: "take-the-smaller-front",
  subtitle:
    "a node that holds nothing, so the first node needs no special case",
  reveals: ["linked-list"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "two longer lists" },
  classify: (d) =>
    wellFormed(d.nums as string[])
      ? { ok: true }
      : {
          ok: false,
          warning:
            "two ascending lists of integers with a single | between them — e.g. 1 3 5 | 2 4",
        },
  presets: {
    example: {
      label: "the example",
      nums: ["1", "3", "5", BAR, "2", "4"],
      info: "1 → 2 → 3 → 4 → 5",
    },
    emptyOne: {
      label: "one list is empty",
      nums: [BAR, "2", "4", "6"],
      info: "the survivor, unchanged",
    },
    emptyBoth: {
      label: "both are empty",
      nums: [BAR],
      info: "legal, and the answer is ∅",
    },
    disjoint: {
      label: "no overlap at all",
      nums: ["1", "2", "3", BAR, "7", "8", "9"],
      info: "one finishes before the other starts",
    },
    tie: {
      label: "equal values in both",
      nums: ["1", "4", "4", BAR, "2", "4", "5"],
      info: "nothing is de-duplicated",
    },
    negatives: {
      label: "negative values",
      nums: ["-9", "-4", "0", BAR, "-7", "-1", "3"],
      info: "ordinary comparisons",
    },
    long: {
      label: "two longer lists",
      nums: [
        "1",
        "4",
        "7",
        "10",
        "13",
        "16",
        BAR,
        "2",
        "3",
        "8",
        "9",
        "14",
        "20",
      ],
      info: "twelve nodes to splice",
    },
  },
  edges: [
    {
      key: "empty",
      name: "one list, or both, is empty",
      example: "∅ and 2 → 4 → 6 → the second list unchanged",
      why: "Both cases are legal input. The answer is whatever survives, and it needs no work at all — but only if the code tests a head before reading through it, and only if 'attach the remainder' can attach nothing.",
      think:
        "Does your first comparison happen before or after you have checked that both lists have a node?",
      preset: "emptyOne",
      constraint: 3,
    },
    {
      key: "tie",
      name: "the same value in both lists",
      example: "1 → 4 → 4 and 2 → 4 → 5 → three 4s in the answer",
      why: "Merging keeps every copy; nothing is de-duplicated. Which copy goes first is decided by whether the comparison is <= or <, and on a stable merge that choice is part of the contract rather than a detail.",
      think: "Is your comparison <= or <, and do you know which one you meant?",
      preset: "tie",
      constraint: 2,
    },
    {
      key: "disjoint",
      name: "one list ends before the other begins",
      example: "1 → 2 → 3 and 7 → 8 → 9 → straight concatenation",
      why: "The loop exits with a whole list untouched. Attaching that remainder in one assignment is what keeps the merge linear; walking it node by node is the same answer for more work and more code.",
      think: "When one side runs out, do you walk the rest or point at it?",
      preset: "disjoint",
      constraint: 2,
    },
    {
      key: "negatives",
      name: "negative values",
      example: "-9 → -4 → 0 and -7 → -1 → 3",
      why: "Nothing promises the values are positive, so a dummy node holding 0 must never be compared against — it is a placeholder for a POINTER, not a value smaller than everything.",
      think: "Does any part of your code read the dummy's value?",
      preset: "negatives",
      constraint: 1,
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
        "given: two linked lists, each sorted ascending, either may be empty",
        "the nodes already exist — the answer re-links them",
        "task: return the head of one sorted list holding all of them",
        "and keep every duplicate: nothing is dropped",
      ],
      tools: [
        {
          name: "Two sorted lists",
          role: "written here as one row with | between them, so the divider can be moved to make either side empty. The drawing below is the OUTPUT being built; what remains of each input is in the state line.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the smallest value left is always at the front of one list or the other",
        "so the whole problem is a repeated choice between two heads",
        "and an empty list is not an error case, it is the ordinary end of the loop",
      ],
      quiz: [
        {
          q: "Where can the smallest value not yet placed possibly be?",
          choices: [
            "anywhere in either list",
            "at the front of list a or the front of list b — nowhere else",
          ],
          answer: 1,
          explain:
            "Each list is sorted, so nothing behind a front node can beat it. That is the entire reason a single comparison per step is enough.",
        },
      ],
      run: story,
    },
    {
      key: "collect",
      name: "Tip both out and sort",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk both lists into one array, sort it, and build a new list from the sorted values.",
      takeaways: [
        "it works, and it needs no thought about which head is smaller",
        "but it sorts data that arrived sorted — n log n to recover an order it was given",
        "and it allocates a node per value, when the problem asked for the existing nodes to be re-linked",
      ],
      run: collectSort,
    },
    {
      key: "recurse",
      name: "Smaller head, then merge the rest",
      short: "the definition",
      from: 1,
      insight:
        "Sorting is only necessary because the collection step threw the order away. Keep it: the smaller of the two heads is the next node, and what follows it is the same problem on what remains.",
      idea: "If either list is empty, return the other. Otherwise take the smaller head, point it at the merge of everything left, and return it.",
      takeaways: [
        "the answer is written as its own definition, in about five lines",
        "no allocation — each call returns a node it was handed",
        "and one stack frame per node placed, which is where it stops working on long lists",
      ],
      quiz: [
        {
          q: "What is the base case here?",
          choices: [
            "when both lists are empty",
            "when EITHER list is empty — the other one is the answer as it stands",
          ],
          answer: 1,
          explain:
            "A sorted list needs nothing done to it. Waiting for both to empty means walking the survivor node by node for no reason.",
        },
      ],
      run: recursive,
    },
    {
      key: "dummy",
      name: "A node that holds nothing",
      short: "loop, no stack",
      insight:
        "The recursion is that same merge with a stack frame per node, and the frames hold nothing but the node just placed — which a single pointer can hold instead.",
      idea: problem.whyNow!,
      takeaways: [
        "the dummy exists so there is always a node to attach to, which removes every first-node special case",
        "the tail pointer is the only state, so the extra memory is constant however long the lists are",
        "when one list empties, the remainder is attached in ONE assignment — it is already sorted and already linked",
        "and the answer is dummy.next, never the dummy",
      ],
      quiz: [
        {
          q: "What is the dummy node actually for?",
          choices: [
            "to hold a value smaller than everything in either list",
            "to give the tail pointer something to point at before the first real node exists",
          ],
          answer: 1,
          explain:
            "Its value is never read — which matters, because with negative inputs a dummy holding 0 would be a bug if it were.",
        },
      ],
      run: dummyHead,
    },
  ],
})
