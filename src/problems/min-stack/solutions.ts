// min-stack — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Store a pair with every entry: the value, and the minimum of the whole stack as of that push. On push, the new record is min(value, current record), which is the old top's record when the stack is non-empty and the value itself when it is empty. getMin reads the top record; pop discards the pair and the record below it is already correct, because it was computed when that entry was pushed. Every operation touches one element, and the trick is that the history of minima is stored alongside the history of values rather than recomputed from it."

export const whyNow = "A separate minimum stack is the same idea with a second container and a comparison rule to get right — and the rule is where duplicates bite, since popping the record only when the value equals it must use >= on the way in or one of two equal minima is lost. Pairing the record with the entry makes the two stacks one and removes the rule entirely."

export const arc = "Every constant-time design problem is answered the same way: decide what has to be TRUE when a query arrives, then arrange for each update to maintain it. Here the invariant is that the top of the stack knows the minimum of everything beneath it, and the reason it survives a pop is that the record was never shared — each entry computed its own. That is the difference between a cache, which can go stale, and an invariant, which cannot. The same reasoning gives a queue that knows its maximum and a stack that knows its sum. The corner case to keep in mind is duplicates: any solution that stores minima separately must decide what happens when the value equals the current minimum, and getting it wrong is invisible until two equal minima meet."

export const complexity = { time: "O(1) per operation", space: "O(n)" }

export const python = `class MinStack:
    def __init__(self) -> None:
        # each entry carries the minimum as of its own push, so a pop
        # restores the previous minimum without recomputing anything
        self.stack: list[tuple[int, int]] = []

    def push(self, val: int) -> None:
        best = val if not self.stack else min(val, self.stack[-1][1])
        self.stack.append((val, best))

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def get_min(self) -> int:
        return self.stack[-1][1]


def run_min_stack(ops: list[str], args: list[list[int]]) -> list[int]:
    st = MinStack()
    out: list[int] = []
    for op, a in zip(ops, args):
        if op == "push":
            st.push(a[0])
        elif op == "pop":
            st.pop()
        elif op == "top":
            out.append(st.top())
        elif op == "getMin":
            out.append(st.get_min())
    return out`

export const alternatives: Solution[] = [
  {
    name: "Scan for the minimum when asked",
    summary:
      "Keep a plain list and walk the whole thing every time getMin is called. push, pop and top are already constant; only the query is slow, and on a workload that rarely asks for the minimum it is genuinely fine. It is the right baseline because it shows exactly which operation the problem is about.",
    complexity: { time: "O(n) for getMin, O(1) otherwise", space: "O(n)" },
    python: `class MinStack:
    def __init__(self) -> None:
        self.stack: list[int] = []

    def push(self, val: int) -> None:
        self.stack.append(val)

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def get_min(self) -> int:
        return min(self.stack)


def run_min_stack(ops: list[str], args: list[list[int]]) -> list[int]:
    st = MinStack()
    out: list[int] = []
    for op, a in zip(ops, args):
        if op == "push":
            st.push(a[0])
        elif op == "pop":
            st.pop()
        elif op == "top":
            out.append(st.top())
        elif op == "getMin":
            out.append(st.get_min())
    return out`,
  },
  {
    name: "A second stack of minima",
    summary:
      "Keep the values in one stack and, beside it, a stack holding every value that was the minimum when it arrived. Push onto it when the new value is less than or equal to its top, and pop from it when the value leaving equals its top. Constant everywhere, at the cost of one comparison rule.",
    complexity: { time: "O(1) per operation", space: "O(n)" },
    whyNow:
      "Scanning on every getMin turns a sequence of queries into quadratic work, and the minimum only ever changes at a push or a pop — so it can be maintained incrementally instead of discovered on demand.",
    python: `class MinStack:
    def __init__(self) -> None:
        self.stack: list[int] = []
        self.mins: list[int] = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        # <= and not <: two equal minima must both be recorded, or the
        # first pop loses a minimum that is still on the stack
        if not self.mins or val <= self.mins[-1]:
            self.mins.append(val)

    def pop(self) -> None:
        val = self.stack.pop()
        if self.mins and val == self.mins[-1]:
            self.mins.pop()

    def top(self) -> int:
        return self.stack[-1]

    def get_min(self) -> int:
        return self.mins[-1]


def run_min_stack(ops: list[str], args: list[list[int]]) -> list[int]:
    st = MinStack()
    out: list[int] = []
    for op, a in zip(ops, args):
        if op == "push":
            st.push(a[0])
        elif op == "pop":
            st.pop()
        elif op == "top":
            out.append(st.top())
        elif op == "getMin":
            out.append(st.get_min())
    return out`,
  },
]
