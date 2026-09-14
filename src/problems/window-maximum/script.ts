// window-maximum — every approach in one file, cross-checked
//
// Converted from docs/deep/window-maximum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach above, assembled unchanged, plus a suite covering the statement's example, the single
window case, the minimal input, both degenerate widths (\`k = 1\` and \`k = n\`), all-identical values,
repeats positioned so a value-based deque would break, strictly increasing and strictly decreasing
arrays, an all-negative array, an input where the maximum must **expire from the front** rather than be
beaten, the stated value-range endpoints, and 30 randomised stress cases — every case cross-checked
against the other approaches and against an independent \`max()\`-per-slice oracle, with each approach
given its own copy of the input.`

export const script = `"""Maximum of Every Window - every approach in one file, plus a self-checking suite.

Run: python window_maximum_all.py
"""

from __future__ import annotations

import heapq
import random
from collections import deque

# --- shared scaffolding (harness, not answer) ----------------------------------


def expired(index: int, right: int, k: int) -> bool:
    """Has \`index\` fallen out of the window of width k that ends at \`right\`?"""
    return index <= right - k


# --- 1. Scan each window from scratch ------------------------------------------

def window_maximum_scan_each_window(nums: list[int], k: int) -> list[int]:
    out: list[int] = []
    for start in range(len(nums) - k + 1):
        best = nums[start]
        for i in range(start, start + k):  # re-reads k - 1 values it saw last step
            if nums[i] > best:
                best = nums[i]
        out.append(best)
    return out


# --- 2. Max-heap with lazy eviction --------------------------------------------

def window_maximum_heap_lazy(nums: list[int], k: int) -> list[int]:
    heap: list[tuple[int, int]] = []
    out: list[int] = []
    for i, x in enumerate(nums):
        heapq.heappush(heap, (-x, i))  # negated: heapq is a MIN-heap
        while expired(heap[0][1], i, k):  # the top may be a corpse from outside the window
            heapq.heappop(heap)
        if i >= k - 1:
            out.append(-heap[0][0])
    return out


# --- 3. Monotonic deque of indices ---------------------------------------------

def window_maximum_monotonic_deque(nums: list[int], k: int) -> list[int]:
    best: deque[int] = deque()  # indices, their values strictly decreasing front to back
    out: list[int] = []
    for i, x in enumerate(nums):
        while best and nums[best[-1]] <= x:
            best.pop()  # dominated forever: x is at least as large AND outlives them
        best.append(i)
        if expired(best[0], i, k):
            best.popleft()  # the front is what ages out — this is what a stack cannot do
        if i >= k - 1:
            out.append(nums[best[0]])
    return out


APPROACHES = [
    ("scan_each_window", window_maximum_scan_each_window),
    ("heap_lazy", window_maximum_heap_lazy),
    ("monotonic_deque", window_maximum_monotonic_deque),
]


# --- test suite ----------------------------------------------------------------

def brute_force_oracle(nums: list[int], k: int) -> list[int]:
    """Independent check: the stdlib max() of every slice."""
    return [max(nums[i : i + k]) for i in range(len(nums) - k + 1)]


def main() -> None:
    cases: list[tuple[str, list[int], int]] = [
        ("statement example", [1, 3, -1, -3, 5, 3, 6, 7], 3),
        ("one window only", [4, 2, 1], 3),
        ("smallest legal input", [5], 1),
        ("k = 1 returns the array itself", [1, 3, -1, -3, 5], 1),
        ("k = n returns one value", [1, 3, -1, -3, 5], 5),
        ("every value identical", [2, 2, 2, 2], 2),
        ("repeats that must not be double-counted", [7, 7, 1, 7, 7, 1], 3),
        ("strictly increasing", [1, 2, 3, 4, 5], 2),
        ("strictly decreasing", [5, 4, 3, 2, 1], 2),
        ("all negative", [-7, -8, -1, -5, -9], 3),
        ("the maximum expires from the front", [9, 1, 1, 1, 2], 3),
        ("value range endpoints", [10**4, -(10**4), 0, 10**4], 2),
    ]

    rng = random.Random(20260912)
    for n in range(1, 31):
        nums = [rng.randint(-9, 9) for _ in range(n)]
        k = rng.randint(1, n)
        cases.append((f"stress n={n} k={k}", nums, k))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums, k in cases:
        shown = nums if len(nums) <= 10 else nums[:10] + ["..."]
        print(f"\\n{label}: nums={shown} k={k}")
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums), k)  # own copy per approach
            results.append(got)
            shown_got = got if len(got) <= 10 else got[:10] + ["..."]
            print(f"  {name:<{width}} -> {shown_got}")
        agreed = all(r == results[0] for r in results)
        oracle = brute_force_oracle(nums, k)
        if not agreed or results[0] != oracle:
            all_agreed = False
            print(f"  DISAGREEMENT (agreed={agreed}, oracle={oracle})")

    print(f"\\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
