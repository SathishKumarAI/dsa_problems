// Add the Digits, Least Significant First, derived — the journey whose picture
// is a COLUMN ADDITION. Both inputs arrive in one row of tokens with "|"
// between them (the convention merge-two-sorted set), and the working acts draw
// a four-row grid: the carry into each column, the two input digits, and the
// answer node written underneath. The ones column is on the LEFT, because that
// is the order the lists hand the digits over — which is the whole reason this
// problem is easy, and the thing the picture has to make obvious.
//
// derive.ts draws ONE panel per frame, and a grid replaces the state row, so
// the carry lives in the grid's top row rather than beside it. The one act with
// no carry to show — the one that builds whole integers first — has no grid,
// and uses the state row instead: that is where the 64-bit wrap-around is made
// visible (the exact value and the wrapped value side by side) rather than
// asserted in prose.

import { deriveJourney } from "../../engine/derive.ts"
import type { Cell, DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/linked-list/add-two-numbers.ts"

type W = Data<string>

const BAR = "|"
const DOT = "·"

/** The row splits at the bar: the digits of the first list, then the second. */
export function split(nums: string[]) {
  const at = nums.indexOf(BAR)
  const a = nums.slice(0, at === -1 ? nums.length : at).map(Number)
  const b = at === -1 ? [] : nums.slice(at + 1).map(Number)
  return { a, b }
}

/** Column addition, ones column first — the carry into each column and the
 *  answer digit under it. Every rung has to agree with this. */
export function columns(a: number[], b: number[]) {
  const carries: number[] = []
  const out: number[] = []
  let carry = 0
  for (let i = 0; i < Math.max(a.length, b.length) || carry; i++) {
    carries.push(carry)
    const total = (a[i] ?? 0) + (b[i] ?? 0) + carry
    out.push(total % 10)
    carry = Math.floor(total / 10)
  }
  return { carries, out }
}

export const digitSum = (nums: string[]) => {
  const { a, b } = split(nums)
  const { out } = columns(a, b)
  return out.length ? out : [0]
}

/** what a list of digits actually spells, most significant first */
const spell = (xs: number[]) => (xs.length ? [...xs].reverse().join("") : "∅")

/** a list read node by node — but a twenty-node chain of arrows is unreadable
 *  in a chip and no clearer in a note, so past ten it is quoted as the number */
const chain = (xs: number[]) =>
  xs.length > 10 ? `${spell(xs)} (${xs.length} nodes)` : xs.join(" → ")

const int64 = (v: bigint) => BigInt.asIntN(64, v)

// ---------- the column grid ----------

interface Row {
  name: string
  cells: (Cell | null)[]
  role?: (c: number) => ChipRole | undefined
}

// Grid columns are a fixed 2.75rem, so a twenty-digit input would squeeze every
// cell to nothing. Past MAXCOL the table shows a window around the column being
// worked on, with "…" on whichever side is cut off.
const MAXCOL = 11

function gridOf(rows: Row[], label: string, width: number, focus = 0) {
  const w = Math.max(width, 1)
  const win = w > MAXCOL
  const from = win ? Math.max(0, Math.min(focus - MAXCOL + 2, w - MAXCOL)) : 0
  const to = win ? from + MAXCOL : w
  const pre = from > 0
  const post = to < w
  const cells = rows.map((r) => [
    r.name,
    ...(pre ? ["…"] : []),
    ...Array.from({ length: to - from }, (_, k) => r.cells[from + k] ?? DOT),
    ...(post ? ["…"] : []),
  ])
  const off = 1 + (pre ? 1 : 0)
  const marks: Record<string, ChipRole> = {}
  rows.forEach((r, i) => {
    for (let c = from; c < to; c++) {
      const role = r.role?.(c)
      if (role) marks[`${i},${c - from + off}`] = role
    }
  })
  return {
    cells,
    marks,
    label: win ? `${label} · columns ${from + 1}–${to} of ${w}` : label,
  }
}

const at = (c: number, role: ChipRole) => (k: number) =>
  k === c ? role : undefined

// ---------- act 0: the problem ----------

function* story({ nums }: W): Generator<DFrame> {
  const { a, b } = split(nums)
  const { carries, out } = columns(a, b)
  const width = Math.max(a.length, b.length, out.length, 1)
  yield {
    hold: 3,
    noChips: true,
    note: "Two non-negative numbers, each stored as a linked list with one digit per node, and the answer wanted back in the same form.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The head of each list is its ONES digit, so both numbers are written backwards — and that is a gift rather than an obstacle, because the two heads are the same place value and the digits that share a column already line up.",
  }
  yield {
    hold: 3,
    list: {
      values: a,
      label: "the first list",
      labels: { 0: "head · ones" },
      marks: { 0: "focus" },
    },
    note: `Node by node this list reads ${a.join(" → ") || "nothing"}, and the number it holds is ${spell(a)}: head is the ones digit, then tens, then hundreds.`,
  }
  yield {
    hold: 3,
    list: {
      values: b,
      label: "the second list",
      labels: { 0: "head · ones" },
      marks: { 0: "focus" },
    },
    note: `The second list holds ${spell(b)} written the same way — and it need not be the same length as the first.`,
  }
  const bothZero = out.length === 1 && out[0] === 0
  const carriedPast = out.length > Math.max(a.length, b.length)
  yield {
    hold: 3,
    grid: gridOf(
      [
        { name: "c", cells: carries, role: at(0, "anchor") },
        { name: "l1", cells: a },
        { name: "l2", cells: b },
        { name: "sum", cells: out, role: () => "answer" },
      ],
      "c carry into the column · l1 l2 the inputs · sum the answer",
      width,
      0
    ),
    answer: out,
    corner: bothZero
      ? "zero"
      : carriedPast
        ? "carryOut"
        : a.length !== b.length
          ? "lengths"
          : undefined,
    note: bothZero
      ? `${spell(a)} + ${spell(b)} is zero, and zero is one node holding 0 — not an empty list. Something still has to be written even when there is nothing left over.`
      : carriedPast
        ? `${spell(a)} + ${spell(b)} = ${spell(out)}, and the answer has ${out.length} nodes where the longer input had ${Math.max(a.length, b.length)}: the last ten carried past the end of both lists and became a digit of its own.`
        : a.length !== b.length
          ? `${spell(a)} + ${spell(b)} = ${spell(out)}. One list runs out before the other, and the columns keep coming — a missing digit is a zero there, not the end of the sum.`
          : `${spell(a)} + ${spell(b)} = ${spell(out)}, read right to left in the table and handed back ones digit first: ${chain(out)}.`,
  }
}

// ---------- act 1: read each list as a whole number ----------

function* asNumber({ nums }: W): Generator<DFrame> {
  const { a, b } = split(nums)
  const bar = nums.indexOf(BAR)
  let told = false

  const readList = function* (
    xs: number[],
    where: (i: number) => number,
    line: number,
    which: string,
    before: () => { label: string; value: Cell }[]
  ): Generator<DFrame, { exact: bigint; wide: bigint }> {
    let exact = 0n
    let wide = 0n
    let place = 1n
    let widePlace = 1n
    for (let i = 0; i < xs.length; i++) {
      const p = place
      exact += BigInt(xs[i]) * place
      wide = int64(wide + int64(BigInt(xs[i]) * widePlace))
      place *= 10n
      widePlace = int64(widePlace * 10n)
      const broke = wide !== exact
      const first = broke && !told
      if (first) told = true
      const pretty = String(p).length > 7 ? `10^${String(p).length - 1}` : String(p)
      yield {
        line,
        marks: { [where(i)]: "focus" },
        state: [
          ...before(),
          { label: which, value: String(exact) },
          { label: "place", value: pretty },
          ...(broke ? [{ label: `${which} in 64 bits`, value: String(wide) }] : []),
        ],
        corner: first ? "overflow" : undefined,
        note: first
          ? `Node ${i + 1} is worth ${xs[i]} × ${pretty}, and here is the crack: Python says ${which} is ${exact} and is exactly right, while the identical line in Java or C++ has just wrapped ${which} round to ${wide}. Nothing threw.`
          : broke
            ? `Another digit at ${pretty}. The exact value keeps growing; the 64-bit one is now noise.`
            : `Digit ${xs[i]} at place ${pretty}, so ${which} is ${exact} after ${i + 1} node${i ? "s" : ""} — the list is being spent to build one number.`,
      }
    }
    return { exact, wide }
  }

  const av = yield* readList(a, (i) => i, 6, "a", () => [])
  const bv = yield* readList(b, (i) => bar + 1 + i, 12, "b", () => [
    { label: "a", value: String(av.exact) },
  ])
  const total = av.exact + bv.exact
  const wideTotal = int64(av.wide + bv.wide)
  const bent = wideTotal !== total
  const firstHere = bent && !told
  if (firstHere) told = true
  yield {
    line: 15,
    state: [
      { label: "a", value: String(av.exact) },
      { label: "b", value: String(bv.exact) },
      { label: "total", value: String(total) },
      ...(bent ? [{ label: "total in 64 bits", value: String(wideTotal) }] : []),
    ],
    corner: firstHere ? "overflow" : undefined,
    note: bent
      ? `One addition, and the two answers have parted company: ${total} is the truth, ${wideTotal} is what a 64-bit integer holds. Every digit written from here is written from the wrong number.`
      : `${av.exact} + ${bv.exact} = ${total}. One addition instead of a column walk — which is exactly what makes this version read like the problem statement.`,
  }
  const out: number[] = []
  let t = total
  do {
    out.push(Number(t % 10n))
    t /= 10n
    yield {
      line: 20,
      state: [
        { label: "written", value: chain(out) },
        { label: "left to write", value: String(t) },
      ],
      corner: out.length === 1 && total === 0n ? "zero" : undefined,
      note:
        out.length === 1 && total === 0n
          ? "The total is 0 and a node still has to come out — which is why the loop writes first and tests afterwards. Written the other way round, zero plus zero returns an empty list."
          : `Peel off ${out[out.length - 1]} with total % 10, divide by ten, and keep going while anything is left.`,
    }
  } while (t > 0n)
  const wrong: number[] = []
  if (bent) {
    let w = wideTotal
    do {
      wrong.push(Number(w % 10n))
      w /= 10n
    } while (w !== 0n)
  }
  yield {
    line: 25,
    answer: out,
    state: [
      { label: "answer", value: chain(out) },
      { label: "nodes", value: out.length },
    ],
    note: bent
      ? `${chain(out)} — correct, because these frames ran on a language whose integers grow. The same source in Java hands back ${wrong.slice(0, 5).join(" → ")} → … : ${wrong.length} digits that appear nowhere in the sum, ${wrong.filter((d) => d < 0).length} of them negative.`
      : `${chain(out)}. Right here, and right for every input small enough to fit a machine integer — which the constraints do not promise.`,
  }
}

// ---------- act 2: copy the digits out, add column by column ----------

function* arrays({ nums }: W): Generator<DFrame> {
  const { a, b } = split(nums)
  const bar = nums.indexOf(BAR)
  const dimUpTo = (n: number, from = 0) => {
    const marks: Record<number, ChipRole> = {}
    for (let i = 0; i < n; i++) marks[from + i] = "dim"
    return marks
  }
  yield {
    line: 3,
    marks: dimUpTo(a.length),
    state: [{ label: "a", value: a.join(", ") || "empty" }],
    note: `One walk down the first list, ${a.length} value${a.length === 1 ? "" : "s"} parked in an array. Nothing is added yet — this pass only copies.`,
  }
  yield {
    line: 7,
    marks: { ...dimUpTo(a.length), ...dimUpTo(b.length, bar + 1) },
    state: [
      { label: "a", value: a.join(", ") || "empty" },
      { label: "b", value: b.join(", ") || "empty" },
    ],
    note: `A second walk for the other list. Both numbers now sit in arrays, indexed by place value, where reading past the end gives a tidy "no digit" instead of a crash.`,
  }
  const width = Math.max(a.length, b.length, 1)
  const out: number[] = []
  const carries: number[] = []
  let carry = 0
  for (let i = 0; i < width; i++) {
    carries.push(carry)
    const total = (a[i] ?? 0) + (b[i] ?? 0) + carry
    out.push(total % 10)
    carry = Math.floor(total / 10)
    yield {
      line: 18,
      grid: gridOf(
        [
          { name: "c", cells: carries, role: at(i, "anchor") },
          { name: "l1", cells: a, role: at(i, "focus") },
          { name: "l2", cells: b, role: at(i, "focus") },
          { name: "sum", cells: out, role: at(i, "answer") },
        ],
        "one column: carry + two digits",
        Math.max(width, out.length),
        i
      ),
      note: `Column ${i + 1}: ${carries[i]} + ${a[i] ?? "nothing"} + ${b[i] ?? "nothing"} = ${total}, so ${total % 10} is the answer digit and ${carry} carries left. The index guard is what turns "no digit" into a zero.`,
    }
  }
  if (carry) {
    carries.push(0)
    out.push(carry)
    yield {
      line: 20,
      corner: "carryOut",
      grid: gridOf(
        [
          { name: "c", cells: carries },
          { name: "l1", cells: a },
          { name: "l2", cells: b },
          { name: "sum", cells: out, role: at(out.length - 1, "focus") },
        ],
        "a column with no input digits under it",
        out.length,
        out.length - 1
      ),
      note: `The columns are finished and a ${carry} is still in hand, so it becomes one more digit — the only node of the answer that no input node sits above.`,
    }
  }
  yield {
    line: 23,
    answer: out,
    grid: gridOf(
      [
        { name: "c", cells: carries },
        { name: "l1", cells: a },
        { name: "l2", cells: b },
        { name: "sum", cells: out, role: () => "answer" },
      ],
      "the answer, built back to front",
      out.length,
      0
    ),
    note: `${chain(out)}. Correct at any length, because no whole number was ever formed — but it walked the inputs twice to copy them, then walked the digits again backwards to build the list, and it is holding two arrays the size of the inputs.`,
  }
}

// ---------- act 3: add into the first list, recursively ----------

function* recurse({ nums }: W): Generator<DFrame> {
  const { a, b } = split(nums)
  const L = [...a]
  let bn = b.length
  const allDim = (n: number) => {
    const marks: Record<number, ChipRole> = {}
    for (let i = 0; i < n; i++) marks[i] = "dim"
    return marks
  }
  const walk = function* (i: number): Generator<DFrame> {
    if (i >= L.length && i >= bn) {
      yield {
        line: 2,
        list: {
          values: [...L],
          label: `nothing left on either side · ${i} frames open`,
          marks: allDim(L.length),
        },
        note: "Both lists are spent, so this call returns nothing and the frames start coming back up.",
      }
      return
    }
    if (i >= L.length) {
      for (let k = i; k < bn; k++) L.push(b[k])
      bn = i
      yield {
        line: 4,
        list: {
          values: [...L],
          label: "the second list becomes the spine",
          marks: { [i]: "focus" },
          labels: { [i]: "adopted" },
        },
        note: `The first list ran out at node ${i + 1}, so the two are swapped and what is left of the second list simply becomes the rest of the answer — no copying, the nodes are already the right ones.`,
      }
    } else if (i < bn) {
      L[i] += b[i]
      yield {
        line: 6,
        list: {
          values: [...L],
          label: "the second list's digit added INTO the first list's node",
          marks: { [i]: "focus" },
          labels: { [i]: `+${b[i]}` },
        },
        note: `Node ${i + 1} of the first list now holds ${L[i]}. The answer is being written over the input — there is no new list anywhere.`,
      }
    } else {
      yield {
        line: 5,
        list: {
          values: [...L],
          label: "no digit on the other side",
          marks: { [i]: "focus" },
        },
        note: `The second list has no node here, so this one keeps what it holds — ${L[i]} — which may be a ten that the level before pushed in.`,
      }
    }
    if (L[i] >= 10) {
      L[i] -= 10
      const grew = i + 1 >= L.length
      if (grew) L.push(1)
      else L[i + 1] += 1
      yield {
        line: 9,
        corner: grew ? "carryOut" : undefined,
        list: {
          values: [...L],
          label: grew
            ? "the carry had nowhere to land, so a node was made for it"
            : "over nine: ten goes next door",
          marks: { [i]: "answer", [i + 1]: "focus" },
          labels: { [i + 1]: "carry" },
        },
        note: grew
          ? `The column overflowed at the very end of the list, so a brand new node holding 1 is appended — the answer is now longer than either input, and nothing else had to change.`
          : `Ten of it moves into the node ahead as a plain +1, leaving ${L[i]} behind. The carry is not a variable here; it is stored in the list itself.`,
      }
    }
    yield* walk(i + 1)
    yield {
      line: 15,
      list: {
        values: [...L],
        label: `frame ${i + 1} hooks its node onto what came back`,
        marks: { [i]: "answer" },
      },
      note: `Coming back up: node ${i + 1} keeps ${L[i]} and points at the answer the deeper call returned.`,
    }
  }
  yield* walk(0)
  yield {
    line: 16,
    answer: [...L],
    list: {
      values: [...L],
      label: "the first list IS the answer",
      marks: Object.fromEntries(L.map((_, i) => [i, "answer" as ChipRole])),
    },
    state: [{ label: "peak frames", value: L.length }],
    note: `${chain(L)}. Nothing was copied and nothing was allocated but the one carry node — at the price of a stack frame per digit, and of destroying the first list, which the caller may still be holding.`,
  }
}

// ---------- act 4: pad the shorter list, then add in place ----------

function* pad({ nums }: W): Generator<DFrame> {
  const { a, b } = split(nums)
  const A = [...a]
  const B = [...b]
  const n = Math.max(A.length, B.length, 1)
  const rows = (
    carries: (Cell | null)[],
    focus: number | null,
    aRole?: (c: number) => ChipRole | undefined
  ): Row[] => [
    { name: "c", cells: carries, role: focus === null ? undefined : at(focus, "anchor") },
    { name: "l1", cells: A, role: aRole },
    { name: "l2", cells: B, role: focus === null ? undefined : at(focus, "focus") },
  ]
  let padded = 0
  for (let i = 0; i + 1 < Math.max(A.length, B.length); i++) {
    const grewA = A.length <= i + 1
    const grewB = B.length <= i + 1
    if (grewA) A.push(0)
    if (grewB) B.push(0)
    if (grewA || grewB) padded++
    yield {
      line: grewA || grewB ? 8 : 11,
      grid: gridOf(
        rows([], null, at(i + 1, grewA ? "anchor" : "focus")),
        grewA || grewB
          ? "a zero node fabricated in the shorter list"
          : "both lists still have a node here",
        n,
        i + 1
      ),
      note:
        grewA || grewB
          ? `The ${grewA ? "first" : "second"} list has no node at column ${i + 2}, so one holding 0 is attached to it. That zero is not in the input — this pass is editing the caller's data.`
          : `Both lists have a node at column ${i + 2}; step on. This pass writes nothing here and still costs a step.`,
    }
  }
  if (Math.max(A.length, B.length) <= 1) {
    yield {
      line: 6,
      grid: gridOf(rows([], null), "already the same length", n, 0),
      note: "Both lists are a single node, so the padding pass has nothing to do and the loop body never runs.",
    }
  }
  const carries: number[] = []
  let carry = 0
  let i = 0
  while (i < A.length) {
    carries[i] = carry
    const total = A[i] + (B[i] ?? 0) + carry
    A[i] = total % 10
    carry = Math.floor(total / 10)
    yield {
      line: 16,
      grid: gridOf(
        rows(carries, i, at(i, "answer")),
        "the answer is written INTO the first list",
        Math.max(n, A.length),
        i
      ),
      note: `Column ${i + 1} sums to ${total}, so the first list's node is overwritten with ${A[i]} and ${carry} carries on. The digit that node used to hold is gone.`,
    }
    if (i + 1 >= A.length) {
      if (carry) {
        A.push(carry)
        carries[i + 1] = 0
        yield {
          line: 20,
          corner: "carryOut",
          grid: gridOf(
            rows(carries, null, at(A.length - 1, "focus")),
            "one node past the end of both padded lists",
            A.length,
            A.length - 1
          ),
          note: `Both lists end here and a ${carry} is still in hand, so a final node is appended. The padding pass could not have known to make room for it.`,
        }
      }
      break
    }
    i++
  }
  yield {
    line: 23,
    answer: [...A],
    grid: gridOf(
      rows(carries, null, () => "answer"),
      "the first list, overwritten",
      A.length,
      0
    ),
    note: `${chain(A)}. Constant extra space and a plain loop — bought with ${padded} fabricated zero${padded === 1 ? "" : "s"} and two vandalised inputs, one of which is the answer and the other of which is now the wrong number.`,
  }
}

// ---------- act 5 (optimal): one loop, three inputs per column ----------

function* walkBoth({ nums }: W): Generator<DFrame> {
  const { a, b } = split(nums)
  const { out } = columns(a, b)
  const width = Math.max(out.length, 1)
  yield {
    line: 1,
    grid: gridOf(
      [
        { name: "c", cells: [0] },
        { name: "l1", cells: a },
        { name: "l2", cells: b },
        { name: "sum", cells: [] },
      ],
      "a dummy node to hang the answer off, and a carry of 0",
      width,
      0
    ),
    note: "Nothing is written yet: a dummy node to hang the answer off, a tail pointing at it, and a carry of 0 — which is the third input to the first column.",
  }
  const got: number[] = []
  const carries: number[] = []
  let carry = 0
  let toldLengths = false
  for (let i = 0; i < out.length; i++) {
    carries.push(carry)
    const d1 = a[i]
    const d2 = b[i]
    const total = (d1 ?? 0) + (d2 ?? 0) + carry
    got.push(total % 10)
    const beyond = d1 === undefined && d2 === undefined
    const lopsided = !beyond && (d1 === undefined || d2 === undefined)
    const tagLengths = lopsided && !toldLengths
    if (tagLengths) toldLengths = true
    carry = Math.floor(total / 10)
    yield {
      line: beyond ? 5 : 14,
      corner: beyond ? "carryOut" : tagLengths ? "lengths" : undefined,
      grid: gridOf(
        [
          { name: "c", cells: carries, role: at(i, "anchor") },
          { name: "l1", cells: a, role: at(i, "focus") },
          { name: "l2", cells: b, role: at(i, "focus") },
          { name: "sum", cells: got, role: at(i, "answer") },
        ],
        beyond
          ? "neither list has a node here — the carry does"
          : "carry + whatever each list still offers",
        width,
        i
      ),
      note: beyond
        ? `Both lists are finished and the carry is ${carries[i]}, so the loop runs one more time on the strength of that third condition alone and writes the ${got[i]} that would otherwise be lost.`
        : lopsided
          ? `The ${d1 === undefined ? "first" : "second"} list has run out, so its side of the column contributes 0 — the "if the node exists" test does it, and the other list keeps going. ${carries[i]} + ${d1 ?? 0} + ${d2 ?? 0} = ${total}, write ${got[i]}, carry ${carry}.`
          : `${carries[i]} + ${d1} + ${d2} = ${total}: append a node holding ${got[i]} and keep ${carry}. One column, one new node, nothing copied.`,
    }
  }
  yield {
    line: 16,
    answer: got,
    grid: gridOf(
      [
        { name: "c", cells: carries },
        { name: "l1", cells: a },
        { name: "l2", cells: b },
        { name: "sum", cells: got, role: () => "answer" },
      ],
      "dummy.next is the answer",
      width,
      0
    ),
    note: `${spell(a)} + ${spell(b)} = ${spell(got)}${got.length > 10 ? ` — ${got.length} nodes` : `, handed back ones digit first: ${got.join(" → ")}`}. One pass, three variables, both inputs untouched, and the only nodes made are the answer's own.`,
  }
}

// ---------- the journey ----------

export const addTwoNumbers = deriveJourney<string>(problem, {
  slug: "add-them-the-way-you-were-taught",
  subtitle:
    "the digits arrive backwards, which is the gift — and the carry is the third number in every column",
  reveals: ["linked-list"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "big", label: "twelve digits each" },
  classify: (d) => {
    const row = d.nums as string[]
    const bars = row.filter((t) => t === BAR).length
    const { a, b } = split(row)
    const digits = row.filter((t) => t !== BAR)
    // A leading zero is the LAST token of a list here, and it is the one
    // illegal input the acts disagree about rather than merely mishandle:
    // rebuilding the answer from a whole number drops it, adding column by
    // column keeps it. The constraint forbids it, so say so.
    const noLead = (xs: number[]) => xs.length === 1 || xs[xs.length - 1] !== 0
    return bars === 1 &&
      a.length > 0 &&
      b.length > 0 &&
      digits.every((t) => /^[0-9]$/.test(t)) &&
      noLead(a) &&
      noLead(b)
      ? { ok: true }
      : {
          ok: false,
          warning:
            "two non-empty runs of single digits with one | between them, ones digit first — e.g. 2 4 3 | 5 6 4. A node holding more than one digit is not a digit, and a list whose LAST node is 0 spells a number with a leading zero: the acts that rebuild the answer from a whole number will drop it and the ones that add column by column will keep it.",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: ["2", "4", "3", BAR, "5", "6", "4"],
      info: "342 + 465, both written ones digit first",
    },
    carryOut: {
      label: "the carry outlives both lists",
      nums: ["9", "9", "9", BAR, "1"],
      info: "999 + 1 — the answer is longer than either input",
    },
    uneven: {
      label: "different lengths",
      nums: ["5", "6", BAR, "1", "2", "3"],
      info: "65 + 321 — one side runs out early",
    },
    zeros: {
      label: "zero plus zero",
      nums: ["0", BAR, "0"],
      info: "the answer is one node, not an empty list",
    },
    huge: {
      label: "nineteen digits and a one",
      nums: [...Array.from({ length: 19 }, () => "9"), BAR, "1"],
      info: "bigger than any 64-bit integer holds",
    },
    big: {
      label: "twelve digits each",
      nums: [
        "7",
        "8",
        "9",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        BAR,
        "3",
        "2",
        "1",
        "9",
        "8",
        "7",
        "6",
        "5",
        "4",
        "3",
        "2",
      ],
      info: "long enough that the table shows a window of the columns",
    },
    broken: {
      label: "a node holding 13 (broken promise)",
      nums: ["3", "1", "3", BAR, "13", "2"],
      info: "one node, one digit — 13 is not a digit",
    },
  },
  edges: [
    {
      key: "lengths",
      name: "the lists are different lengths",
      example: "65 + 321 → 6 → 8 → 3",
      why: "A list that has run out is neither a list of zeros nor the end of the sum: the columns keep coming while EITHER side still has a node. Code that stops at the shorter list answers 65 + 21 and looks entirely reasonable doing it.",
      think:
        "When one list runs out, what does your code read from it — and does the loop stop?",
      preset: "uneven",
      constraint: 2,
    },
    {
      key: "carryOut",
      name: "the carry survives both lists",
      example: "999 + 1 → 0 → 0 → 0 → 1",
      why: "The final ten has no input digit under it and is still a digit of the answer, so the answer can be longer than either input. A loop that ends the moment both lists are spent drops it and reports 999 + 1 = 0.",
      think: "After the last column, what is still in your hand?",
      preset: "carryOut",
      constraint: 3,
    },
    {
      key: "zero",
      name: "zero plus zero",
      example: "[0] + [0] → [0]",
      why: "The answer is zero, and zero is one node holding 0 — not an empty list. Anything that writes a digit only while something is left over writes nothing at all here and hands back nothing.",
      think:
        "Does your writing step run at least once, or only while there is something left?",
      preset: "zeros",
      constraint: 4,
    },
    {
      key: "overflow",
      name: "a hundred digits is not a number your language holds",
      example: "9999999999999999999 + 1",
      why: "Each list may hold a hundred digits, and a hundred-digit number fits in no fixed-width integer: 64 bits run out at nineteen. In a language with growing integers the arithmetic quietly stays right, so the bug is invisible in Python and the identical lines wrap around in Java or C++ without throwing.",
      think:
        "How large can the value in your variable get, and how large is the variable?",
      preset: "huge",
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
        "given: two linked lists, one digit per node",
        "the HEAD of each list is its ones digit",
        "add the two numbers they spell",
        "task: return the sum as a list in the same form",
      ],
      tools: [
        {
          name: "Singly linked list",
          role: "a chain whose nodes are handed over one at a time, front first — so whatever the front means is what you get to work with first.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the heads are both ones digits, so the digits that share a column already line up",
        "a column takes three numbers, not two: a digit from each list and whatever the column before it left over",
        "the two lists need not be the same length, and the answer can be longer than both",
      ],
      quiz: [
        {
          q: "The head of each list holds which digit?",
          choices: [
            "the largest place value, as a number is normally written",
            "the ones digit — the numbers are stored backwards",
          ],
          answer: 1,
          explain:
            "That is the whole reason this problem is easier than it looks: both heads are the same place value, so no alignment pass is needed before the first column.",
        },
        {
          q: "999 + 1. How many nodes does the answer have?",
          choices: ["three, the length of the longer input", "four"],
          answer: 1,
          explain:
            "1000 is four digits. The last ten has no input digit under it and is a digit of the answer all the same.",
        },
      ],
      run: story,
    },
    {
      key: "asnumber",
      name: "Read both lists as one number each",
      short: "reads exactly like the statement",
      from: 0,
      insight:
        "Forget the nodes for a moment. These are two numbers written backwards — so read each one out, add them, and write the total back as digits.",
      idea: problem.alternatives![0].summary,
      takeaways: [
        "it mirrors the statement, and it is the version everybody writes first",
        "the writing loop has to run once before it tests, or zero plus zero returns nothing",
        "and it builds the whole number, which a hundred digits will not fit in",
      ],
      quiz: [
        {
          q: "Each list may hold a hundred digits. What does that do to this version?",
          choices: [
            "nothing, a hundred digits is a large number but still a number",
            "in a fixed-width language the value wraps around silently, and every digit written afterwards comes from the wrong number",
          ],
          answer: 1,
          explain:
            "The nastiness is that Python keeps answering correctly while Java and C++ do not, so the same source passes on the machine it was written on and fails in review.",
        },
      ],
      run: asNumber,
    },
    {
      key: "arrays",
      name: "Copy the digits into two arrays",
      short: "column by column, at any length",
      from: 1,
      insight: problem.alternatives![1].whyNow!,
      tools: [
        {
          name: "Array",
          role: "indexed storage where reading past the end can be tested for cheaply, so 'this list has no digit here' becomes an if rather than a crash.",
        },
      ],
      idea: problem.alternatives![1].summary,
      takeaways: [
        "adding column by column never forms the whole number, so there is nothing left to overflow",
        "an index guard is what turns a missing digit into a zero",
        "and it holds two arrays and walks the data three times to avoid touching pointers",
      ],
      run: arrays,
    },
    {
      key: "recurse",
      name: "Add into the first list as you go",
      short: "in place, a frame per digit",
      from: 2,
      insight: problem.alternatives![2].whyNow!,
      tools: [
        {
          name: "The call stack",
          role: "one frame per node, each holding the single node it owns — the carry rides in the list itself instead of in a variable.",
        },
      ],
      idea: problem.alternatives![2].summary,
      takeaways: [
        "the carry is stored as a ten in the node ahead, so no variable carries it",
        "nothing is copied, and the extra node at the end is the only allocation",
        "but the first list is destroyed, and a hundred digits is a hundred frames deep",
      ],
      run: recurse,
    },
    {
      key: "pad",
      name: "Make the lists the same length first",
      short: "a pass of zeros, then a flat loop",
      from: 3,
      insight: problem.alternatives![3].whyNow!,
      idea: problem.alternatives![3].summary,
      takeaways: [
        "once the lengths match, every column has two digits and the loop is three variables",
        "the padding pass writes nodes that were never in the input, into the caller's lists",
        "and it still cannot make room for the last carry, which is appended anyway",
      ],
      quiz: [
        {
          q: "The padding pass makes both lists the same length. Why is a node still appended at the end sometimes?",
          choices: [
            "a bug — matched lengths mean matched columns",
            "the final carry is a digit with no input under it, and no amount of padding creates that column",
          ],
          answer: 1,
          explain:
            "Padding equalises the inputs; it cannot predict the sum. 999 + 001 still needs a fourth node.",
        },
      ],
      run: pad,
    },
    {
      key: "walk",
      name: "One loop, three inputs per column",
      short: "one pass, nothing copied, nothing damaged",
      insight:
        "Every one of those fixes was about making the two sides the same shape before adding. They are already the right shape — what a column actually needs is a digit from each list IF there is one, and the leftover from the column before.",
      idea: problem.whyNow!,
      tools: [
        {
          name: "A dummy head",
          role: "a node nobody asked for, so the first answer node is appended by the same two lines as every other one and the answer is read off it at the end.",
        },
        {
          name: "The carry",
          role: "a single integer that is both an input to the next column and a reason for the loop to run again.",
        },
      ],
      takeaways: [
        "loop while either list has a node OR the carry is non-zero — that third term is the whole leading-digit case",
        "a missing node contributes 0 inside the same loop, so no padding pass and no damage",
        "the answer is dummy.next, which makes the first node need no special handling",
        "one pass, three variables, and the only nodes allocated are the answer's",
      ],
      quiz: [
        {
          q: "What keeps the loop running after both lists are exhausted?",
          choices: [
            "nothing — that is where it ends",
            "a non-zero carry, which is a condition of the loop in its own right",
          ],
          answer: 1,
          explain:
            "Drop that third term and 999 + 1 comes back as 0 → 0 → 0. It is one word in the loop condition and it is the entire corner case.",
        },
      ],
      run: walkBoth,
    },
  ],
})
