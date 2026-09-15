// queue-from-stacks — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Keep an inbox stack and an outbox stack. Push always goes onto the inbox. Pop and peek work on the outbox, and when the outbox is empty they first pour the entire inbox into it — one transfer reverses the order, so the oldest element ends up on top. The rule that makes it correct is pouring only when the outbox is empty; the rule that makes it fast is that each element is pushed and popped at most twice in its life, so although one pop may move n elements, a sequence of n operations still costs O(n) and each is amortised constant."

export const whyNow = "Reversing on every push moves the whole queue for each arrival, so n pushes cost n^2 no matter how few pops follow. Deferring the transfer until a pop actually needs it means each element is moved exactly once, and a long run of pushes costs nothing extra."

export const arc = "The transferable idea is amortised analysis: an operation that is occasionally expensive can still be cheap on average, provided you can account for the expense against work that was already paid for. Here every element is pushed twice and popped twice in its entire lifetime, so the total over any sequence is linear, however brutal one individual pop looks. That argument — charge the rare expensive step to the many cheap ones that caused it — is the same one behind a dynamic array's doubling and a splay tree's rotations, and being able to make it is what separates a design that is fast from one that merely looks fast. The correctness rule is narrower and just as important: never pour while the outbox still holds anything."

export const complexity = { time: "O(1) amortised per operation", space: "O(n)" }

export const python = `class MyQueue:
    def __init__(self) -> None:
        self.inbox: list[int] = []
        self.outbox: list[int] = []

    def _shift(self) -> None:
        # only when the outbox is EMPTY: pouring on top of leftovers would
        # put newer elements in front of older ones
        if not self.outbox:
            while self.inbox:
                self.outbox.append(self.inbox.pop())

    def push(self, x: int) -> None:
        self.inbox.append(x)

    def pop(self) -> int:
        self._shift()
        return self.outbox.pop()

    def peek(self) -> int:
        self._shift()
        return self.outbox[-1]

    def empty(self) -> bool:
        return not self.inbox and not self.outbox


def run_queue(ops: list[str], args: list[list[int]]) -> list[int]:
    q = MyQueue()
    out: list[int] = []
    for op, a in zip(ops, args):
        if op == "push":
            q.push(a[0])
        elif op == "pop":
            out.append(q.pop())
        elif op == "peek":
            out.append(q.peek())
        elif op == "empty":
            out.append(1 if q.empty() else 0)
    return out`

export const alternatives: Solution[] = [
  {
    name: "Reverse on every push",
    summary:
      "Keep one stack holding the elements in queue order, oldest on top. To push, pour everything into a helper, add the newcomer, and pour it all back. Every pop is then a plain stack pop. It makes the cost obvious by putting all of it in one place.",
    complexity: { time: "O(n) push, O(1) pop", space: "O(n)" },
    python: `class MyQueue:
    def __init__(self) -> None:
        self.data: list[int] = []  # oldest on TOP

    def push(self, x: int) -> None:
        helper: list[int] = []
        while self.data:
            helper.append(self.data.pop())
        self.data.append(x)
        while helper:
            self.data.append(helper.pop())

    def pop(self) -> int:
        return self.data.pop()

    def peek(self) -> int:
        return self.data[-1]

    def empty(self) -> bool:
        return not self.data


def run_queue(ops: list[str], args: list[list[int]]) -> list[int]:
    q = MyQueue()
    out: list[int] = []
    for op, a in zip(ops, args):
        if op == "push":
            q.push(a[0])
        elif op == "pop":
            out.append(q.pop())
        elif op == "peek":
            out.append(q.peek())
        elif op == "empty":
            out.append(1 if q.empty() else 0)
    return out`,
  },
]
