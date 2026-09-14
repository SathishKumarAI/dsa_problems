// Swap Every Adjacent Pair, derived — a LIST journey where the whole lesson is
// that the picture must show NODES MOVING, not values changing. The first rung
// swaps payloads and the row looks identical to the right answer, which is
// exactly why it is on the stage: the labels under the nodes carry the identity
// (n0, n1, …) so a value swap visibly leaves every node where it was.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/swap-pairs/index.ts"

type N = Data<number>

/** the answer: every adjacent pair exchanged, an odd tail left alone */
export const swapped = (nums: number[]) => {
  const out = [...nums]
  for (let i = 0; i + 1 < out.length; i += 2)
    [out[i], out[i + 1]] = [out[i + 1], out[i]]
  return out
}

/** identity labels — which ORIGINAL node is standing in this position */
const idLabels = (order: number[]) =>
  Object.fromEntries(order.map((id, i) => [i, `n${id}`]))

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A singly linked list, and the job is to exchange every two adjacent nodes: the first and second trade places, then the third and fourth, and so on to the end.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The catch is in the wording. The NODES have to move, not their contents — so the answer is a rewiring, and the thing to watch on the stage is which node sits where, not which number does.",
  }
  if (!nums.length) {
    yield {
      hold: 3,
      answer: [],
      corner: "empty",
      note: "An empty list is legal input. There is no pair, so there is nothing to swap and the answer is the same nothing — and any code that reads head.next before checking head crashes here instead of answering.",
    }
    return
  }
  yield {
    hold: 3,
    list: {
      values: nums,
      label: "as given",
      labels: idLabels(nums.map((_, i) => i)),
      marks: marksOf(nums.length, (i) => (i < 2 ? "focus" : undefined)),
    },
    state: [{ label: "becomes", value: swapped(nums).join(" → ") }],
    answer: swapped(nums),
    corner:
      nums.length === 1
        ? "single"
        : nums.length % 2 === 1
          ? "odd"
          : undefined,
    note:
      nums.length === 1
        ? "One node. There is nothing to pair it with, so it stays exactly where it is — and this is the case that catches a loop testing only the current node instead of the current node AND the one after it."
        : nums.length % 2 === 1
          ? `${nums.join(" → ")} becomes ${swapped(nums).join(" → ")}. An odd length: the last node has no partner and must be left alone, links intact.`
          : `${nums.join(" → ")} becomes ${swapped(nums).join(" → ")}. Every node has a partner here, which is the easy shape — the odd one is where solutions break.`,
  }
}

// ---- rung 0: swap the payloads. Correct-looking, and the wrong answer. ----
function* values({ nums }: N): Generator<DFrame> {
  const row = [...nums]
  const order = nums.map((_, i) => i)
  for (let i = 0; i + 1 < nums.length; i += 2) {
    yield {
      line: 2,
      list: {
        values: [...row],
        label: "a pair, about to trade CONTENTS",
        labels: idLabels(order),
        marks: marksOf(row.length, (k) =>
          k === i || k === i + 1 ? "focus" : k < i ? "dim" : undefined
        ),
      },
      state: [{ label: "nodes moved", value: 0 }],
      note: `${row[i]} and ${row[i + 1]} are about to be exchanged — but look at the labels: n${order[i]} and n${order[i + 1]} are not going anywhere.`,
    }
    ;[row[i], row[i + 1]] = [row[i + 1], row[i]]
    yield {
      line: 3,
      list: {
        values: [...row],
        label: "values exchanged, every node in its original place",
        labels: idLabels(order),
        marks: marksOf(row.length, (k) =>
          k === i || k === i + 1 ? "answer" : k < i ? "dim" : undefined
        ),
      },
      state: [{ label: "nodes moved", value: 0 }],
      note: `The row now reads ${row.join(" → ")}, which is the right sequence of numbers. n${order[i]} still sits first, still points at n${order[i + 1]}: not one link changed.`,
    }
  }
  yield {
    line: 5,
    answer: row,
    list: {
      values: row,
      label: "the right numbers, in the original nodes",
      labels: idLabels(order),
    },
    state: [
      { label: "nodes moved", value: 0 },
      { label: "links rewritten", value: 0 },
    ],
    note: `${row.join(" → ")} — indistinguishable from the answer while the values are plain integers, and wrong the moment a node carries anything else, or the caller holds a reference to one. The problem asked for the nodes to move; this moved nothing.`,
  }
}

// ---- rung 1: park the nodes in an array, swap there, relink ----
function* viaArray({ nums }: N): Generator<DFrame> {
  const order = nums.map((_, i) => i)
  yield {
    line: 3,
    list: {
      values: nums,
      label: "every node collected into an array",
      labels: idLabels(order),
      marks: marksOf(nums.length, () => "dim"),
    },
    state: [{ label: "extra memory", value: `${nums.length} refs` }],
    note: `One walk, ${nums.length} reference${nums.length === 1 ? "" : "s"} parked in an array. Nothing is rewired yet — the array exists so the swap can be done by index, where losing your way is impossible.`,
  }
  const arr = [...order]
  for (let i = 0; i + 1 < arr.length; i += 2) {
    ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
    yield {
      line: 6,
      list: {
        values: arr.map((id) => nums[id]),
        label: "swapped by index",
        labels: idLabels(arr),
        marks: marksOf(arr.length, (k) =>
          k === i || k === i + 1 ? "focus" : k < i ? "dim" : undefined
        ),
      },
      state: [{ label: "extra memory", value: `${nums.length} refs` }],
      note: `Positions ${i} and ${i + 1} exchanged — and the labels moved with them, so these really are the NODES swapping, not their contents.`,
    }
  }
  yield {
    line: 8,
    answer: arr.map((id) => nums[id]),
    list: {
      values: arr.map((id) => nums[id]),
      label: "every next pointer rewritten from the new order",
      labels: idLabels(arr),
      marks: marksOf(arr.length, () => "answer"),
    },
    state: [
      { label: "extra memory", value: `${nums.length} refs` },
      { label: "links rewritten", value: Math.max(arr.length - 1, 0) },
    ],
    note: `Correct, and genuinely a relink. The price is an array as long as the list: the problem is about pointers, and this one buys its way out of pointer arithmetic with memory.`,
  }
}

// ---- rung 2: recursion ----
function* recurse({ nums }: N): Generator<DFrame> {
  const order = nums.map((_, i) => i)
  const out: number[] = []
  const walk = function* (i: number): Generator<DFrame> {
    if (i + 1 >= nums.length) {
      if (i < nums.length) {
        out.push(order[i])
        yield {
          line: 2,
          list: {
            values: out.map((id) => nums[id]),
            label: "the odd tail, returned untouched",
            labels: idLabels(out),
            marks: marksOf(out.length, (k) =>
              k === out.length - 1 ? "answer" : "dim"
            ),
          },
          state: [{ label: "frames open", value: Math.ceil(i / 2) }],
          note: `One node left and no partner for it, so it is returned exactly as it is. This is the base case that makes the odd length free.`,
        }
      } else {
        yield {
          line: 2,
          list: {
            values: out.map((id) => nums[id]),
            label: "the end of the list",
            labels: idLabels(out),
          },
          state: [{ label: "frames open", value: Math.ceil(i / 2) }],
          note: "Nothing left. The recursion stops and the answers start coming back up.",
        }
      }
      return
    }
    yield {
      line: 3,
      list: {
        values: nums,
        label: "the pair this frame owns",
        labels: idLabels(order),
        marks: marksOf(nums.length, (k) =>
          k === i || k === i + 1 ? "focus" : k < i ? "dim" : undefined
        ),
      },
      state: [{ label: "frames open", value: Math.ceil(i / 2) + 1 }],
      note: `This frame owns ${nums[i]} and ${nums[i + 1]}, and delegates everything after them to the next call before touching either.`,
    }
    yield* walk(i + 2)
    out.unshift(order[i])
    out.unshift(order[i + 1])
    yield {
      line: 5,
      list: {
        values: out.map((id) => nums[id]),
        label: "the pair swapped, then hooked onto what came back",
        labels: idLabels(out),
        marks: marksOf(out.length, (k) => (k < 2 ? "answer" : "dim")),
      },
      state: [{ label: "frames open", value: Math.ceil(i / 2) }],
      note: `On the way back up: ${nums[i + 1]} goes in front of ${nums[i]}, and ${nums[i]} points at whatever the deeper call returned. The frame never needed a pointer to the node behind it — the caller holds that.`,
    }
  }
  yield* walk(0)
  yield {
    line: 6,
    answer: out.map((id) => nums[id]),
    list: {
      values: out.map((id) => nums[id]),
      label: "the new head, returned up the stack",
      labels: idLabels(out),
    },
    state: [{ label: "peak frames", value: Math.ceil(nums.length / 2) }],
    note: `${out.map((id) => nums[id]).join(" → ") || "nothing"}. The clearest statement of the idea, and it holds a frame per pair — at the constraint's 100 nodes that is fine, and on a list of 10^5 it is not.`,
  }
}

// ---- rung 3: a prev pointer, with the head special-cased ----
function* prevPointer({ nums }: N): Generator<DFrame> {
  const order = [...nums.map((_, i) => i)]
  if (nums.length < 2) {
    yield {
      line: 2,
      answer: nums,
      list: {
        values: nums,
        label: "fewer than two nodes",
        labels: idLabels(order),
      },
      state: [{ label: "special cases", value: 1 }],
      note: "Nothing to pair, so the guard at the top returns the list untouched. That guard is the first of the two special cases this rung needs.",
    }
    return
  }
  yield {
    line: 3,
    list: {
      values: nums,
      label: "the answer has to be remembered BEFORE the first swap",
      labels: idLabels(order),
      marks: marksOf(nums.length, (k) => (k === 1 ? "answer" : undefined)),
    },
    state: [{ label: "new head", value: nums[1] }],
    note: `The head changes the moment the first pair swaps, so the eventual answer — ${nums[1]} — is saved up front. That is the second special case: the first pair has no node behind it to relink.`,
  }
  for (let i = 0; i + 1 < order.length; i += 2) {
    ;[order[i], order[i + 1]] = [order[i + 1], order[i]]
    yield {
      line: 9,
      list: {
        values: order.map((id) => nums[id]),
        label: i === 0 ? "first pair — no prev to fix up" : "prev points at the new front",
        labels: idLabels(order),
        marks: marksOf(order.length, (k) =>
          k === i || k === i + 1
            ? "focus"
            : k === i - 1
              ? "anchor"
              : k < i
                ? "dim"
                : undefined
        ),
      },
      state: [
        { label: "new head", value: nums[1] },
        { label: "special cases", value: 2 },
      ],
      note:
        i === 0
          ? `The pair is swapped by relinking, and the code has to SKIP the "tell the previous node" step, because there is no previous node.`
          : `The same swap, plus the one line the first pair could not run: the node behind the pair now points at ${nums[order[i]]}.`,
    }
  }
  yield {
    line: 14,
    answer: order.map((id) => nums[id]),
    list: {
      values: order.map((id) => nums[id]),
      label: "correct, with two special cases carried the whole way",
      labels: idLabels(order),
    },
    state: [{ label: "special cases", value: 2 }],
    note: `${order.map((id) => nums[id]).join(" → ")}. Constant memory and one pass — the cost is that the first pair is not an ordinary pair, and the answer had to be remembered before the loop it comes out of.`,
  }
}

// ---- rung 4 (optimal): a dummy in front of the head ----
function* dummy({ nums }: N): Generator<DFrame> {
  const order = nums.map((_, i) => i)
  yield {
    line: 1,
    list: {
      values: ["·", ...nums],
      label: "a dummy node in front of the head",
      labels: { 0: "dummy", ...idLabels(order.map((id) => id + 0)) },
      marks: { 0: "anchor" },
    },
    state: [{ label: "special cases", value: 0 }],
    note: "One fake node in front of the list, and the first pair stops being special: there is now a node behind it, exactly like every other pair.",
  }
  const cur = [...order]
  for (let i = 0; i + 1 < cur.length; i += 2) {
    yield {
      line: 4,
      list: {
        values: ["·", ...cur.map((id) => nums[id])],
        label: "prev, then the pair it is about to reorder",
        labels: { 0: "prev", [i + 1]: "first", [i + 2]: "second" },
        marks: {
          0: "anchor",
          [i + 1]: "focus",
          [i + 2]: "focus",
        },
      },
      state: [{ label: "pairs done", value: i / 2 }],
      note: `prev sits on the node before the pair — the dummy for the first pair, and the back of the last swap after that. first is ${nums[cur[i]]}, second is ${nums[cur[i + 1]]}.`,
    }
    ;[cur[i], cur[i + 1]] = [cur[i + 1], cur[i]]
    yield {
      line: 8,
      list: {
        values: ["·", ...cur.map((id) => nums[id])],
        label: "three links rewritten, in the one order that works",
        labels: { 0: "prev", ...idLabels(cur) },
        marks: {
          [i + 1]: "answer",
          [i + 2]: "answer",
        },
      },
      state: [{ label: "pairs done", value: i / 2 + 1 }],
      note: `first.next hangs onto what followed the pair, second.next takes first, and prev.next takes second. Do those three in any other order and the link you still need is already gone.`,
    }
  }
  const out = cur.map((id) => nums[id])
  yield {
    line: 11,
    answer: out,
    list: {
      values: ["·", ...out],
      label: "dummy.next is the answer",
      labels: { 0: "dummy", 1: "new head" },
      marks: { 0: "anchor", 1: "answer" },
    },
    state: [
      { label: "special cases", value: 0 },
      { label: "extra memory", value: "1 node" },
    ],
    note: `${out.join(" → ") || "nothing"}. The dummy absorbed both awkward cases at once: the head change, because the answer is read off it at the end, and the empty list, because its next was null the whole time and never had to be checked.`,
  }
}

export const swapPairs = deriveJourney(problem, {
  slug: "trade-places-two-at-a-time",
  subtitle: "the nodes move, not the numbers — and the first pair is the one with no one behind it",
  reveals: ["linked-list"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer list" },
  presets: {
    example: { label: "the example", nums: [1, 2, 3, 4] },
    odd: {
      label: "an odd length",
      nums: [1, 2, 3],
      info: "the last node has no partner",
    },
    empty: { label: "an empty list", nums: [], info: "legal input" },
    single: { label: "one node", nums: [7], info: "nothing to pair it with" },
    long: { label: "a longer list", nums: [1, 2, 3, 4, 5, 6, 7, 8] },
  },
  edges: [
    {
      key: "odd",
      name: "an odd number of nodes",
      example: "[1,2,3] → [2,1,3]",
      why: "The last node has nothing to swap with and must be left exactly where it is, links intact. A loop that tests only the current node — not the one after it — walks off the end here and crashes or drops the tail.",
      think: "What does your loop condition test: one node, or two?",
      preset: "odd",
      constraint: 2,
    },
    {
      key: "empty",
      name: "an empty list",
      example: "[] → []",
      why: "Legal input with no pair in it. Code that reads head.next before checking head crashes; a dummy-node solution never notices this case at all, which is part of why it wins.",
      think: "How many checks does your version need before the first swap?",
      preset: "empty",
      constraint: 3,
    },
    {
      key: "single",
      name: "one node",
      example: "[7] → [7]",
      why: "The loop body never runs, so the answer comes entirely from what is returned rather than from anything the loop did. It catches a version that returns the wrong variable.",
      think: "With no swap performed, what exactly do you return?",
      preset: "single",
      constraint: 3,
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
        "given: the head of a singly linked list",
        "exchange node 1 with node 2, node 3 with node 4, …",
        "the NODES move — copying values is a different answer",
        "task: return the new head",
      ],
      tools: [
        {
          name: "Singly linked list",
          role: "a chain where each node knows only its successor, so a node's position is defined by who points at it — which is why swapping a pair means rewriting three links, not two.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the nodes have to move, so the answer is a rewiring and not an exchange of values",
        "a swap rewrites three links: the node behind the pair also has to be told",
        "an odd tail and an empty list both have to survive untouched",
      ],
      quiz: [
        {
          q: "Swapping a pair changes how many next pointers?",
          choices: [
            "two — the two nodes in the pair",
            "three — the two in the pair, and the node in front of them",
          ],
          answer: 1,
          explain:
            "The node before the pair is still pointing at the old first node. Forget it and the list keeps the original order however carefully the pair was rewired.",
        },
      ],
      run: story,
    },
    {
      key: "values",
      name: "Swap what the nodes hold",
      short: "looks right, answers a different question",
      from: 0,
      insight: "",
      idea: problem.alternatives![0].summary,
      takeaways: [
        "two lines, constant memory, and the printed list is identical to the answer",
        "not one link is rewritten — watch the node labels on the stage stay put",
        "it breaks the moment a node carries more than an int, or a caller holds a reference to one",
      ],
      quiz: [
        {
          q: "The row on screen reads 2 → 1 → 4 → 3 after this rung. Why is it still wrong?",
          choices: [
            "it is not wrong, the output matches",
            "every node is exactly where it started — only the payloads moved, and the problem asked for the nodes",
          ],
          answer: 1,
          explain:
            "This is why the stage labels the nodes rather than only the values: n0 is still first. With integers you cannot see the difference in the output, which is exactly what makes it a trap.",
        },
      ],
      run: values,
    },
    {
      key: "array",
      name: "Park the nodes in an array",
      short: "a real swap, bought with memory",
      from: 1,
      insight:
        "The value swap failed because it never moved a node. Move the nodes, then — and the easiest place to move things is an array, where a swap is one line and nothing can get lost.",
      idea: problem.alternatives![1].summary,
      takeaways: [
        "genuinely relinks, and the index arithmetic is impossible to get lost in",
        "it holds a reference to every node: memory proportional to the list",
        "and it rewrites every next pointer at the end, including the ones that did not change",
      ],
      run: viaArray,
    },
    {
      key: "recurse",
      name: "Swap the first pair, recurse on the rest",
      short: "the clearest statement",
      from: 2,
      insight:
        "The array is only there to hold what the walk already knows. Each pair's answer depends on nothing but the answer for the rest of the list — which is a recursion, not a buffer.",
      idea: problem.alternatives![2].summary,
      takeaways: [
        "swap the pair, then point the back of it at whatever the rest of the list returned",
        "the odd tail is the base case, so it costs no special handling",
        "and it holds a frame per pair, which is memory the problem did not ask you to spend",
      ],
      run: recurse,
    },
    {
      key: "prev",
      name: "One pass with a prev pointer",
      short: "constant space, two special cases",
      from: 3,
      insight:
        "Every waiting frame holds one thing: the node behind the pair. That is a pointer, not a frame — carry it and walk forward once.",
      idea: problem.alternatives![3].summary,
      takeaways: [
        "constant memory and one pass, which is the shape the constraints want",
        "the head changes on the first swap, so the answer has to be saved before the loop",
        "and the first pair has no node behind it, so the relink is skipped exactly once",
      ],
      run: prevPointer,
    },
    {
      key: "dummy",
      name: "A dummy in front of the head",
      short: "no special cases at all",
      insight:
        "Both awkward things are the same thing: the first pair has nothing behind it. Put a node there that nobody asked for, and the first pair becomes an ordinary pair.",
      idea: problem.whyNow!,
      takeaways: [
        "one fake node removes the head special-case and the empty-list check together",
        "the answer is dummy.next, read at the end rather than remembered at the start",
        "three links per pair, in the order first.next, second.next, prev.next — any other order loses a pointer you still need",
        "prev then moves to first, which is now the BACK of the swapped pair",
      ],
      quiz: [
        {
          q: "What does returning dummy.next save you from?",
          choices: [
            "an extra pointer",
            "remembering the new head before the loop, and checking for an empty list at all",
          ],
          answer: 1,
          explain:
            "The dummy is holding the answer the whole time. On an empty list its next was null from the start, so the same return handles the case without a branch.",
        },
      ],
      run: dummy,
    },
  ],
})
