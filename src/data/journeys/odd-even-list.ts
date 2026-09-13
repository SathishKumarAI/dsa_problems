// Odd Positions First, Then the Even Ones, derived — a LIST journey built
// around the one misreading that ruins this problem: the grouping is by
// POSITION, never by value. Every node carries the position it started at as
// its label (p1, p2, …), so the answer row reads p1 p3 p5 p2 p4 and no amount
// of squinting turns it into "odd numbers first" — the default preset is
// chosen so the values argue with the positions all the way through.
//
// The last two rungs draw two chains being pulled out of one row, and then
// the join: the front chain's tail reaching back to the saved back head. The
// frame where the loop stops says WHICH guard stopped it, because an even
// length and an odd length leave the runners in different places.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/linked-list/odd-even-list.ts"

type N = Data<number>

/** the answer: nodes at odd positions (counted from 1) first, then the even ones */
export const regrouped = (nums: number[]) => [
  ...nums.filter((_, i) => i % 2 === 0),
  ...nums.filter((_, i) => i % 2 === 1),
]

/** which ORIGINAL position is standing in this slot — p1, p2, … */
const posLabels = (order: number[]) =>
  Object.fromEntries(order.map((id, i) => [i, `p${id + 1}`]))

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

const vals = (nums: number[], order: number[]) => order.map((id) => nums[id])
const arrow = (xs: number[]) => (xs.length ? xs.join(" → ") : "—")
const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`

// ---- act 0: the need, then the trap, then the answer ----
function* story({ nums }: N): Generator<DFrame> {
  const all = nums.map((_, i) => i)
  yield {
    hold: 3,
    noChips: true,
    note: "A singly linked list, and the job is to regroup it: every node sitting at an odd position has to come before every node sitting at an even one, with the order inside each group left exactly as it was.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Positions are counted from 1, so the head is position 1 and therefore odd. Nothing in this problem ever reads a value — a node's group is decided by where it sits, and by nothing else.",
  }
  if (!nums.length) {
    yield {
      hold: 3,
      answer: [],
      corner: "empty",
      note: "An empty list is legal input. There is no first node to stand on, so the answer is the same nothing — and code that reaches for head.next before checking head crashes here instead of answering.",
    }
    return
  }
  const oddIds = all.filter((i) => i % 2 === 0)
  const evenIds = all.filter((i) => i % 2 === 1)
  yield {
    hold: 3,
    list: {
      values: nums,
      label: "as given — the label under a node is the position it occupies",
      labels: posLabels(all),
      marks: marksOf(nums.length, (i) => (i % 2 === 0 ? "answer" : "anchor")),
    },
    note: `p1, p3, p5 … are the odd positions, holding ${arrow(vals(nums, oddIds))}. Everything else is even, holding ${arrow(vals(nums, evenIds))}.`,
  }
  const out = regrouped(nums)
  // the evidence against "odd NUMBERS first": even numbers that land in the
  // front group, and odd numbers that land in the back one
  const frontEven = vals(nums, oddIds).filter((v) => v % 2 === 0)
  const backOdd = vals(nums, evenIds).filter((v) => Math.abs(v % 2) === 1)
  yield {
    hold: 3,
    answer: out,
    list: {
      values: out,
      label: "the answer — read the labels, not the numbers",
      labels: posLabels([...oddIds, ...evenIds]),
      marks: marksOf(out.length, (i) =>
        i < oddIds.length ? "answer" : "anchor"
      ),
    },
    corner: nums.length <= 2 ? "two" : "bypos",
    note:
      nums.length <= 2
        ? `Two nodes: position 1 is odd, position 2 is even, so ${arrow(nums)} is already grouped and comes straight back. It is also the shape that breaks a walk which steps onto the node after the second one without first checking there is one.`
        : `${arrow(nums)} becomes ${arrow(out)}, and the labels read ${[...oddIds, ...evenIds].map((id) => `p${id + 1}`).join(" ")}. ${
            frontEven.length && backOdd.length
              ? `The FRONT group holds the even number${frontEven.length === 1 ? "" : "s"} ${frontEven.join(", ")}, and the BACK group holds the odd ${backOdd.join(", ")} — read this as "odd numbers first" and both sets end up in the wrong half.`
              : `Every node landed by its index; not one value was consulted.`
          }`,
  }
}

// ---- rung 0 (from 0): unlink the second node, walk to the back, append ----
function* toTail({ nums }: N): Generator<DFrame> {
  const order = nums.map((_, i) => i)
  if (order.length < 2) {
    yield {
      line: 2,
      answer: [...nums],
      list: {
        values: nums,
        labels: posLabels(order),
        label: "nothing to regroup",
      },
      note: `${order.length ? "One node, and it sits at position 1" : "No nodes at all"} — everything that exists is already in the front group, so the list comes back untouched.`,
    }
    return
  }
  let walked = 0
  let prev = 0
  const rounds = Math.floor(order.length / 2)
  for (let k = 0; k < rounds; k++) {
    const at = prev + 1
    const victim = order[at]
    yield {
      line: 10,
      list: {
        values: vals(nums, order),
        labels: posLabels(order),
        label: "the node just after prev is the next one to move",
        marks: marksOf(order.length, (i) =>
          i === at
            ? "focus"
            : i === prev
              ? "anchor"
              : i < prev
                ? "answer"
                : undefined
        ),
      },
      note: `${nums[victim]} started at position ${victim + 1}, an even one, so it belongs behind every odd-position node. Unlink it and send it to the back.`,
    }
    order.splice(at, 1)
    order.push(victim)
    const hop = order.length - prev - 1
    walked += hop
    yield {
      line: 15,
      list: {
        values: vals(nums, order),
        labels: posLabels(order),
        label: `appended — ${plural(hop, "hop")} to find the end, ${walked} so far`,
        marks: marksOf(order.length, (i) =>
          i === order.length - 1 ? "focus" : i <= prev ? "answer" : "dim"
        ),
      },
      note: `It is at the back now, but finding the back cost ${plural(hop, "hop")} — and the list is no shorter next time round.`,
    }
    prev += 1
  }
  yield {
    line: 18,
    answer: vals(nums, order),
    list: {
      values: vals(nums, order),
      labels: posLabels(order),
      label: `correct — ${plural(walked, "tail step")} on ${plural(nums.length, "node")}`,
      marks: marksOf(order.length, () => "answer"),
    },
    note: `${arrow(vals(nums, order))}. Right answer, and ${plural(walked, "step")} of tail-hunting to reach it on ${plural(nums.length, "node")} — at the constraint's ten thousand nodes that is twenty-five million.`,
  }
}

// ---- rung 1 (from 1): two buckets of VALUES, then build a fresh list ----
function* twoBuckets({ nums }: N): Generator<DFrame> {
  const odds: number[] = []
  const evens: number[] = []
  for (let i = 0; i < nums.length; i++) {
    const odd = i % 2 === 0
    ;(odd ? odds : evens).push(nums[i])
    yield {
      line: odd ? 7 : 9,
      list: {
        values: nums,
        labels: posLabels(nums.map((_, k) => k)),
        label: "one walk, reading values out by the parity of i",
        marks: marksOf(nums.length, (k) =>
          k === i ? "focus" : k < i ? "dim" : undefined
        ),
      },
      note: `i is ${i}, so position ${i + 1} is ${odd ? "odd" : "even"} and ${nums[i]} joins the ${odd ? "first" : "second"} bucket. The test is on i alone — the value never gets a vote.`,
    }
  }
  const out = [...odds, ...evens]
  yield {
    line: 14,
    answer: out,
    list: {
      values: out,
      label: "rebuilt from the values — every node here is brand new",
      marks: marksOf(out.length, () => "answer"),
    },
    note: `${arrow(out)} — linear at last, and the position labels are gone for a reason: not one of the original nodes survived. Anything the caller still held a pointer to now points into a discarded list.`,
  }
}

// ---- rung 2 (from 2): keep the real nodes, park the even ones in an array ----
function* parkNodes({ nums }: N): Generator<DFrame> {
  const order = nums.map((_, i) => i)
  const chain: number[] = []
  const parked: number[] = []
  if (!order.length) {
    yield {
      line: 2,
      answer: [],
      list: { values: [], label: "an empty list, returned before the walk" },
      note: "No nodes, so the guard at the top returns before anything is read and the array is never even allocated.",
    }
    return
  }
  for (let i = 0; i < order.length; i++) {
    const odd = i % 2 === 0
    if (odd) chain.push(order[i])
    else parked.push(order[i])
    yield {
      line: odd ? 12 : 10,
      list: {
        values: nums,
        labels: posLabels(order),
        label: "the same nodes — linked as they are met, or set aside",
        marks: marksOf(order.length, (k) =>
          k === i
            ? "focus"
            : k > i
              ? undefined
              : k % 2 === 0
                ? "answer"
                : "anchor"
        ),
      },
      note: odd
        ? `Position ${i + 1} is odd, so ${nums[i]} is hooked onto the back of the chain being built in place.`
        : `Position ${i + 1} is even, so ${nums[i]} is set aside — the node itself, not a copy of its value, which is why its identity survives this time.`,
    }
  }
  const out = [...chain, ...parked]
  yield {
    line: 17,
    list: {
      values: vals(nums, out),
      labels: posLabels(out),
      label: "the set-aside nodes hooked back on, in the order they were met",
      marks: marksOf(out.length, (i) =>
        i < chain.length ? "answer" : "anchor"
      ),
    },
    note: "The set-aside nodes go back on the end one at a time, and their order inside the group survives because the array preserved it.",
  }
  yield {
    line: 20,
    answer: vals(nums, out),
    list: {
      values: vals(nums, out),
      labels: posLabels(out),
      label: "the last node's link cut — without this the list never ends",
      marks: marksOf(out.length, (i) =>
        i === out.length - 1 ? "focus" : "dim"
      ),
    },
    note: `${arrow(vals(nums, out))}. Every original node survived — the price is ${plural(parked.length, "reference")} of memory to remember an order the nodes could have remembered themselves.`,
  }
}

// ---- rung 3 (from 3): both chains built at once, behind two spare nodes ----
function* dummies({ nums }: N): Generator<DFrame> {
  const order = nums.map((_, i) => i)
  const oddIds: number[] = []
  const evenIds: number[] = []
  const draw = (upto: number, cur: number) => {
    const rest = order.slice(upto)
    const values: (number | string)[] = [
      "·",
      ...vals(nums, oddIds),
      "·",
      ...vals(nums, evenIds),
      ...vals(nums, rest),
    ]
    const labels: Record<number, string> = {
      0: "spare",
      [oddIds.length + 1]: "spare",
    }
    const marks: Record<number, ChipRole> = {
      0: "dim",
      [oddIds.length + 1]: "dim",
    }
    oddIds.forEach((id, k) => {
      labels[k + 1] = `p${id + 1}`
      marks[k + 1] = id === cur ? "focus" : "answer"
    })
    evenIds.forEach((id, k) => {
      const at = oddIds.length + 2 + k
      labels[at] = `p${id + 1}`
      marks[at] = id === cur ? "focus" : "anchor"
    })
    rest.forEach((id, k) => {
      const at = oddIds.length + evenIds.length + 2 + k
      labels[at] = `p${id + 1}`
      marks[at] = "dim"
    })
    return { values, labels, marks }
  }
  yield {
    line: 1,
    list: {
      ...draw(0, -1),
      label: "two spare nodes, allocated before anything is read",
    },
    note: "Two nodes nobody asked for, one in front of each chain. They exist so that hooking on the FIRST node of a chain is the same line of code as hooking on any other.",
  }
  for (let i = 0; i < order.length; i++) {
    const odd = i % 2 === 0
    if (odd) oddIds.push(order[i])
    else evenIds.push(order[i])
    yield {
      line: odd ? 9 : 12,
      list: {
        ...draw(i + 1, order[i]),
        label: "one row pulling apart into two chains",
      },
      note: `Position ${i + 1} is ${odd ? "odd" : "even"}, so ${nums[i]} is hooked onto the back of the ${odd ? "first" : "second"} chain and that chain's tail pointer moves onto it.`,
    }
  }
  yield {
    line: 16,
    list: {
      ...draw(order.length, -1),
      label: "the second chain's tail cut off",
    },
    note: "The last node of the second chain still points at whatever followed it in the original list. Cut that link, or joining the chains makes a ring the walk never leaves.",
  }
  const out = [...oddIds, ...evenIds]
  yield {
    line: 17,
    answer: vals(nums, out),
    list: {
      values: vals(nums, out),
      labels: posLabels(out),
      label: "the first chain's tail hooked onto the second chain's first real node",
      marks: marksOf(out.length, (i) =>
        i === Math.max(oddIds.length - 1, 0) || i === oddIds.length
          ? "focus"
          : i < oddIds.length
            ? "answer"
            : "anchor"
      ),
    },
    note: `${arrow(vals(nums, out))}. One pass, and the answer is read off the spare node in front rather than remembered before the loop. Those two spares are the only thing it spends.`,
  }
}

// ---- rung 4 (optimal): two runners weave the chains out of the list itself ----
function* weave({ nums }: N): Generator<DFrame> {
  const n = nums.length
  const all = nums.map((_, i) => i)
  if (n < 2) {
    yield {
      line: 2,
      answer: [...nums],
      corner: n === 0 ? "empty" : undefined,
      list: {
        values: nums,
        labels: posLabels(all),
        label: n ? "one node" : "no nodes",
      },
      note: n
        ? "One node is already grouped, and the guard hands it back before either runner is set up — head.next is only read in that guard after head itself has been checked."
        : "No nodes. The guard sees head is nothing and returns the nothing straight back, so head.next is never dereferenced.",
    }
    return
  }
  let odd = 0
  let even = 1
  const oddIds = [0]
  const evenIds = [1]
  const paint = (cur: number[]) =>
    marksOf(n, (i) =>
      cur.includes(i)
        ? "focus"
        : oddIds.includes(i)
          ? "answer"
          : evenIds.includes(i)
            ? "anchor"
            : undefined
    )
  yield {
    line: 5,
    list: {
      values: nums,
      labels: { ...posLabels(all), 0: "odd·p1", 1: "even·p2" },
      label: "both chain heads are known before the loop begins",
      marks: paint([0, 1]),
    },
    note: `The first node of the front chain IS the head, and the first node of the back chain IS head.next. That second one — ${nums[1]} — is saved right now, because the walk is about to run away from it.`,
  }
  while (even < n && even + 1 < n) {
    odd = even + 1
    oddIds.push(odd)
    yield {
      line: 8,
      list: {
        values: nums,
        labels: { ...posLabels(all), [odd]: `odd·p${odd + 1}`, [even]: `even·p${even + 1}` },
        label: "the front runner hops over the node beside it",
        marks: paint([odd, even]),
      },
      note: `The front runner skips ${nums[even]} and links straight to ${nums[odd]} at position ${odd + 1}, the next odd one. One link rewritten, no node copied.`,
    }
    even = odd + 1
    if (even < n) evenIds.push(even)
    yield {
      line: 10,
      list: {
        values: nums,
        labels: {
          ...posLabels(all),
          [odd]: `odd·p${odd + 1}`,
          ...(even < n ? { [even]: `even·p${even + 1}` } : {}),
        },
        label: "and the back runner hops over the node the front one just took",
        marks: paint(even < n ? [odd, even] : [odd]),
      },
      note:
        even < n
          ? `The back runner skips ${nums[odd]} and links to ${nums[even]} at position ${even + 1}. Two chains threaded through one row — nothing has physically moved.`
          : `The back runner links to whatever follows ${nums[odd]}, and there is nothing there. That null is what terminates the back chain, and it arrives for free.`,
    }
  }
  const evenLen = n % 2 === 0
  yield {
    line: 7,
    corner: evenLen ? "evenlen" : undefined,
    list: {
      values: nums,
      labels: {
        ...posLabels(all),
        [odd]: `odd·p${odd + 1}`,
        ...(even < n ? { [even]: `even·p${even + 1}` } : {}),
      },
      label: evenLen
        ? "stopped because the back runner has nothing after it"
        : "stopped because the back runner ran off the end",
      marks: paint(even < n ? [odd, even] : [odd]),
    },
    note: evenLen
      ? `An even number of nodes, so the last node is an even-position one: the back runner is standing ON it and its link is already null. The second guard is what stops the loop, and the back chain ended itself.`
      : `An odd number of nodes, so the last node is an odd-position one: the front runner is standing on it and the back runner has fallen off the end entirely. The first guard is what stops the loop. Both are needed — a walk testing only one of them would step into nothing here.`,
  }
  const out = [...oddIds, ...evenIds]
  yield {
    line: 12,
    answer: vals(nums, out),
    list: {
      values: vals(nums, out),
      labels: posLabels(out),
      label: "the join — the front chain's tail reaches back to the saved head",
      marks: marksOf(out.length, (i) =>
        i === oddIds.length - 1 || i === oddIds.length
          ? "focus"
          : i < oddIds.length
            ? "answer"
            : "anchor"
      ),
    },
    note: `${arrow(vals(nums, oddIds))} ends at ${nums[oddIds[oddIds.length - 1]]}; point it at ${nums[evenIds[0]]}, the node saved before the loop, and the two chains become one list: ${arrow(vals(nums, out))}. Nothing was allocated and nothing was copied.`,
  }
}

export const oddEvenList = deriveJourney(problem, {
  slug: "where-it-sits-not-what-it-holds",
  subtitle:
    "two chains woven out of one list — grouped by the position a node occupies, never by the number it carries",
  reveals: ["linked-list"],
  defaultPreset: "values",
  harder: { preset: "long", label: "a longer list" },
  presets: {
    values: {
      label: "values that argue with positions",
      nums: [2, 1, 3, 5, 6, 4, 7],
      info: "watch the position labels, not the numbers",
    },
    example: { label: "the example", nums: [1, 2, 3, 4, 5] },
    evenlen: {
      label: "an even number of nodes",
      nums: [1, 2, 3, 4, 5, 6],
      info: "the last node is an even-position one",
    },
    two: {
      label: "two nodes",
      nums: [1, 2],
      info: "already grouped — and the shape that breaks a careless walk",
    },
    empty: { label: "an empty list", nums: [], info: "legal input" },
    long: { label: "a longer list", nums: [9, 8, 7, 6, 5, 4, 3, 2, 1] },
  },
  edges: [
    {
      key: "bypos",
      name: "values that argue with their positions",
      example: "[2,1,3,5,6,4,7] → [2,3,6,7,1,5,4]",
      why: "The front group is 2, 3, 6, 7 — two of them even numbers — and the back group is 1, 5, 4, which holds two odd ones. Read the task as 'odd numbers first' and four of those seven end up in the wrong place. Code that tests node.val instead of the index is wrong here and right on [1,2,3,4,5], which is exactly what makes [1,2,3,4,5] a dangerous thing to test on.",
      think: "Write out the answer for an input whose numbers disagree with their positions BEFORE writing any code. If your rule mentions the value, this input will say so out loud.",
      preset: "values",
      constraint: 1,
    },
    {
      key: "two",
      name: "exactly two nodes",
      example: "[1,2] → [1,2]",
      why: "One node in each group and nothing to do, so the answer is the input. It is also where a walk that advances two nodes at a time falls over: the second node exists, but the node after it does not, and reading through it is a crash rather than a wrong answer.",
      think: "Before stepping forward two nodes, how many of them have you checked exist — one, or both?",
      preset: "two",
      constraint: 4,
    },
    {
      key: "evenlen",
      name: "an even number of nodes",
      example: "[1,2,3,4,5,6] → [1,3,5,2,4,6]",
      why: "Whether the list ends on an odd or an even position decides where the walk stops and where it is standing when it does. Get it wrong by one and the last node is dropped — or the back group's final node still points at a node that has moved into the front group, which is a ring, and a ring is an infinite loop for whoever reads the answer.",
      think: "Run your loop on a 5-node list and a 6-node list by hand. What ends it each time, and does the back group still finish in nothing?",
      preset: "evenlen",
      constraint: 4,
    },
    {
      key: "empty",
      name: "an empty list",
      example: "[] → []",
      why: "Legal input with no head to stand on. Anything that reads head.next before checking head itself crashes here rather than answering, and the two checks only work in that order.",
      think: "What is the very first thing your code touches, and is it guaranteed to be there?",
      preset: "empty",
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
        "given: the head of a singly linked list, positions counted from 1",
        "every node at an ODD POSITION comes before every node at an even one",
        "inside each group the original order survives",
        "the values are irrelevant: a 2 sitting first is an odd-position node",
        "task: rewire the existing nodes and return the head",
      ],
      tools: [
        {
          name: "Singly linked list",
          role: "a chain where each node knows only its successor, so a node's position is whatever the links say it is — which makes regrouping a rewiring, and makes the order inside a group free as long as nothing is ever reversed.",
        },
      ],
      hints: [
        "Reread the statement and underline the word that decides which group a node lands in. It is not the word most people remember afterwards.",
        "Say the rule back in your own words against an input where the numbers disagree with the positions — [2,1,3,5,6,4,7] is exactly that input, and its answer is [2,3,6,7,1,5,4].",
        "Bring three inputs before writing anything: the empty list, a five-node list, and a list of two. Work out all three answers by hand first.",
      ],
      takeaways: [
        "the group is decided by the position a node sits at, counted from 1 — so the head is odd",
        "no value is ever read, and an input whose numbers contradict its positions changes nothing",
        "the order inside each group must survive, which rules out shuffling nodes around",
        "0, 1 and 2 nodes are all already grouped, and all three are legal input",
      ],
      quiz: [
        {
          q: "The list is [2,1,3,5,6,4,7]. Which nodes belong to the front group?",
          choices: [
            "1, 3, 5, 7 — the odd numbers",
            "2, 3, 6, 7 — the nodes at positions 1, 3, 5, 7",
          ],
          answer: 1,
          explain:
            "Positions, not values. The head holds a 2 and goes first precisely because it is the head. Any rule that mentions node.val has misread the problem — and [1,2,3,4,5] cannot tell you so, because there the two readings happen to agree.",
        },
        {
          q: "Inside the front group, does the original relative order have to survive?",
          choices: [
            "no, any order of the odd-position nodes is accepted",
            "yes — the groups are reordered against each other, never within themselves",
          ],
          answer: 1,
          explain:
            "That requirement is what makes this a regrouping rather than a shuffle, and it is why nodes get appended in the order they are met rather than pushed onto anything.",
        },
      ],
      run: story,
    },
    {
      key: "totail",
      name: "Send every second node to the back",
      short: "obviously right, and it re-walks the list every time",
      from: 0,
      insight: "",
      idea: problem.alternatives![0].summary,
      takeaways: [
        "one node moved at a time, and each move is unarguably correct",
        "appending means finding the end, and the end is found again from scratch every single time",
        "on ten thousand nodes that is twenty-five million steps for an answer that needs ten thousand",
      ],
      quiz: [
        {
          q: "Why is this quadratic when it only moves n/2 nodes?",
          choices: [
            "because unlinking a node is expensive",
            "because a singly linked list has no pointer to its end, so every append walks the whole list to find one",
          ],
          answer: 1,
          explain:
            "The cost is in the search, not the move. Anything that appends to a singly linked list in a loop and re-finds the tail each time pays this, and the fix is always to carry the tail rather than hunt for it.",
        },
      ],
      run: toTail,
    },
    {
      key: "buckets",
      name: "Two buckets of values, then rebuild",
      short: "linear at last, with all-new nodes",
      from: 1,
      insight:
        "Every move re-walks a list the previous move already walked. Read it once instead, writing down what you see, and the second walk stops being a search.",
      idea: problem.alternatives![1].summary,
      takeaways: [
        "one pass to read and one to build — genuinely linear",
        "it allocates a list as long as the input",
        "and every original node is discarded, so anyone still holding a pointer to one is holding a pointer into the old list",
      ],
      quiz: [
        {
          q: "The output prints correctly. What did this quietly break?",
          choices: [
            "nothing — the values are all that matter",
            "node identity: these are new nodes, so a node carrying anything besides an int, or referenced from elsewhere, is gone",
          ],
          answer: 1,
          explain:
            "The problem says regroup the list, not produce a list with these numbers in it. With plain integers on screen the difference is invisible, which is exactly what makes it worth pointing at.",
        },
      ],
      run: twoBuckets,
    },
    {
      key: "park",
      name: "Keep the even nodes in an array",
      short: "the original nodes survive",
      from: 2,
      insight:
        "Copying values out hands back a different list wearing the same numbers. Hold the NODES instead — the walk already has each one in its hand as it goes past.",
      idea: problem.alternatives![2].summary,
      takeaways: [
        "one pass, real nodes, and the order inside each group preserved by the array",
        "the last link has to be cut by hand, or the tail still points back into the middle of the list",
        "and it spends memory proportional to the list to remember an order the nodes could hold themselves",
      ],
      run: parkNodes,
    },
    {
      key: "dummies",
      name: "Two chains behind two spare heads",
      short: "constant space, two nodes nobody asked for",
      from: 3,
      insight:
        "The array is only remembering the sequence of the nodes it holds — the one thing a linked list is already good at. Link each node to the previous one of its own kind as you meet it and the array has nothing left to do.",
      idea: problem.alternatives![3].summary,
      takeaways: [
        "both chains grow in the same single pass, each with its own tail pointer",
        "the spare node in front of a chain exists only so the first hook-on is not a special case",
        "the second chain's tail MUST be cut before the join, or the result is a ring",
        "constant memory, except for the two nodes it allocates and then throws away",
      ],
      run: dummies,
    },
    {
      key: "weave",
      name: "Two runners, weaving in place",
      short: "nothing allocated at all",
      insight:
        "Those two spare nodes each answer one question: is this the first node of its chain? Both answers are already sitting in front of you before the walk starts.",
      idea: problem.whyNow!,
      takeaways: [
        "the front chain starts at head and the back chain starts at head.next — save that second one, the walk runs away from it",
        "each turn rewrites two links: the front runner hops the node beside it, then the back runner hops the node the front one just took",
        "both loop guards are load-bearing: the back runner is one ahead, so it is the one that falls off, and it can fall off in two different ways",
        "finish by pointing the front chain's tail at the saved back head; the back chain's tail was terminated on the way through",
      ],
      quiz: [
        {
          q: "Why is the second node saved into its own variable before the loop?",
          choices: [
            "to avoid an extra dereference inside the loop",
            "because the very first link rewritten makes head point past it, and after that there is no way to reach it again",
          ],
          answer: 1,
          explain:
            "head.next is overwritten on the first turn. Reach for it at the end instead of the start and you get the second node of the FRONT chain — a list that skips half its nodes and loses the rest.",
        },
        {
          q: "The loop stops when the back runner has nothing after it, or is nothing at all. Why both?",
          choices: [
            "belt and braces — one of them is redundant",
            "an odd length leaves it off the end and an even length leaves it on the last node, so a different one fires in each case",
          ],
          answer: 1,
          explain:
            "Drop the first and an odd-length list reads through nothing; drop the second and an even-length one steps one node too far. Two nodes is the smallest input that shows the second check doing its job.",
        },
      ],
      run: weave,
    },
  ],
})
