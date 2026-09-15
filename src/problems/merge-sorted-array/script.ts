// merge-sorted-array — every approach in one file, cross-checked
//
// Converted from docs/deep/merge-sorted-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `All five approaches in one file, checked against the statement's three examples, the smallest legal
inputs (\`m + n = 1\`, in both the \`m = 0\` and the \`n = 0\` shapes), the all-of-\`b\`-is-smaller case
that exercises \`a\`'s leftover tail, the all-of-\`b\`-is-larger case where \`a\` never moves, an
all-ties case, negatives, and a randomised stress test against an independent oracle that ignores
in-place-ness entirely and just sorts the union.

\`reference\`, \`run_case\` and \`APPROACHES\` are **scaffolding**, not answers: \`reference\` is an
independent oracle that ignores in-place-ness entirely and just sorts the union, and the other two
are the harness that prints and compares.

Here the answer really is the whole array — \`a\` has exactly \`m + n\` slots and every one is specified
once the merge is done — so unlike the compaction problems in this family there is no unspecified
tail to avoid comparing. Every approach mutates \`a\`, so each one is handed its **own copy**; without
that the cross-check would be comparing data the previous approach had already rewritten.`

export const script = `"""Merge the Second Array Into the First - every approach in one file, cross-checked.

Run: python merge_sorted_array.py

Here the answer really is the whole array: a has exactly m + n slots and all of
them are specified once the merge is done, so there is no unspecified tail to
avoid looking at. Each approach still gets its OWN copy of a, because every one
of them writes into it.
"""

from __future__ import annotations

import random
from typing import Callable


# ---------------------------------------- approach 1: insert one at a time, O(n(m+n))
def merge_sorted_array_insert_one_at_a_time(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    live = m  # how many real values a currently holds
    for j in range(n):
        at = 0
        while at < live and a[at] <= b[j]:
            at += 1
        for k in range(live, at, -1):  # open a gap by sliding the tail right
            a[k] = a[k - 1]
        a[at] = b[j]
        live += 1
    return a


# ------------------------------------- approach 2: append and sort, O((m+n) log(m+n))
def merge_sorted_array_append_and_sort(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    for j in range(n):
        a[m + j] = b[j]
    a.sort()
    return a


# ------------------------------------ approach 3: forward merge into scratch, O(m+n)
def merge_sorted_array_scratch_merge(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    out = [0] * (m + n)
    i, j = 0, 0
    for w in range(m + n):
        if j >= n or (i < m and a[i] <= b[j]):
            out[w] = a[i]
            i += 1
        else:
            out[w] = b[j]
            j += 1
    for w in range(m + n):
        a[w] = out[w]
    return a


# ------------------------------------------ approach 4: copy only a's prefix, O(m)
def merge_sorted_array_copy_prefix(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    left = a[:m]  # only a's live values are ever at risk of being overwritten
    i, j = 0, 0
    for w in range(m + n):
        if j >= n or (i < m and left[i] <= b[j]):
            a[w] = left[i]
            i += 1
        else:
            a[w] = b[j]
            j += 1
    return a


# --------------------------------- approach 5: backward two pointers, O(1) space
def merge_sorted_array_backward_two_pointers(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    i, j, write = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and a[i] > b[j]:  # i may be -1 when a is pure padding
            a[write] = a[i]
            i -= 1
        else:
            a[write] = b[j]
            j -= 1
        write -= 1
    return a  # when j runs dry, a[0..i] is already in its final position


Merge = Callable[[list[int], int, list[int], int], list[int]]

APPROACHES: list[tuple[str, Merge]] = [
    ("insert one at a time", merge_sorted_array_insert_one_at_a_time),
    ("append and sort", merge_sorted_array_append_and_sort),
    ("scratch merge", merge_sorted_array_scratch_merge),
    ("copy a's prefix", merge_sorted_array_copy_prefix),
    ("backward pointers", merge_sorted_array_backward_two_pointers),
]


def reference(a: list[int], m: int, b: list[int], n: int) -> list[int]:
    """Independent oracle: forget in-place entirely and just sort the union."""
    return sorted(a[:m] + b[:n])


def run_case(label: str, a: list[int], m: int, b: list[int], n: int) -> bool:
    expected = reference(a, m, b, n)
    results = [(name, fn(list(a), m, list(b), n)) for name, fn in APPROACHES]
    agree = all(r == expected for _, r in results)
    print(f"{label}")
    print(f"  a={a} m={m} b={b} n={n}")
    for name, r in results:
        print(f"    {name:<21} -> {r}")
    print(f"    expected              -> {expected}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True
    ok &= run_case("example 1 / the doc's worked example",
                   [1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3)
    ok &= run_case("example 2 - nothing to merge, loop must not run",
                   [1], 1, [], 0)
    ok &= run_case("example 3 - a is pure padding, i starts at -1",
                   [0], 0, [1], 1)
    ok &= run_case("all of b is SMALLER - exercises a's leftover tail",
                   [4, 5, 6, 0, 0, 0], 3, [1, 2, 3], 3)
    ok &= run_case("all of b is LARGER - a never moves",
                   [1, 2, 3, 0, 0, 0], 3, [7, 8, 9], 3)
    ok &= run_case("ties everywhere - equal values are interchangeable",
                   [2, 2, 2, 0, 0, 0], 3, [2, 2, 2], 3)
    ok &= run_case("interleaved one for one",
                   [1, 3, 5, 0, 0, 0], 3, [2, 4, 6], 3)
    ok &= run_case("negative and large values",
                   [-10, 0, 0, 0], 1, [-99, 7, 100], 3)
    ok &= run_case("b has a single value that lands in the middle",
                   [1, 9, 0], 2, [5], 1)

    random.seed(3)
    for _ in range(3000):
        m = random.randint(0, 8)
        n = random.randint(0, 8)
        if m + n == 0:  # the constraints require at least one value
            continue
        left = sorted(random.randint(-5, 5) for _ in range(m))
        b = sorted(random.randint(-5, 5) for _ in range(n))
        a = left + [0] * n
        expected = reference(a, m, b, n)
        for name, fn in APPROACHES:
            got = fn(list(a), m, list(b), n)
            if got != expected:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} a={a} m={m} b={b} n={n} "
                      f"-> {got} != {expected}")
    print("stress: 3000 random (a, m, b, n) with m, n in 0..8, "
          "all five approaches vs the oracle")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok
          else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example 1 / the doc's worked example
  a=[1, 2, 3, 0, 0, 0] m=3 b=[2, 5, 6] n=3
    insert one at a time  -> [1, 2, 2, 3, 5, 6]
    append and sort       -> [1, 2, 2, 3, 5, 6]
    scratch merge         -> [1, 2, 2, 3, 5, 6]
    copy a's prefix       -> [1, 2, 2, 3, 5, 6]
    backward pointers     -> [1, 2, 2, 3, 5, 6]
    expected              -> [1, 2, 2, 3, 5, 6]
    all agree: True
example 2 - nothing to merge, loop must not run
  a=[1] m=1 b=[] n=0
    insert one at a time  -> [1]
    append and sort       -> [1]
    scratch merge         -> [1]
    copy a's prefix       -> [1]
    backward pointers     -> [1]
    expected              -> [1]
    all agree: True
example 3 - a is pure padding, i starts at -1
  a=[0] m=0 b=[1] n=1
    insert one at a time  -> [1]
    append and sort       -> [1]
    scratch merge         -> [1]
    copy a's prefix       -> [1]
    backward pointers     -> [1]
    expected              -> [1]
    all agree: True
all of b is SMALLER - exercises a's leftover tail
  a=[4, 5, 6, 0, 0, 0] m=3 b=[1, 2, 3] n=3
    insert one at a time  -> [1, 2, 3, 4, 5, 6]
    append and sort       -> [1, 2, 3, 4, 5, 6]
    scratch merge         -> [1, 2, 3, 4, 5, 6]
    copy a's prefix       -> [1, 2, 3, 4, 5, 6]
    backward pointers     -> [1, 2, 3, 4, 5, 6]
    expected              -> [1, 2, 3, 4, 5, 6]
    all agree: True
all of b is LARGER - a never moves
  a=[1, 2, 3, 0, 0, 0] m=3 b=[7, 8, 9] n=3
    insert one at a time  -> [1, 2, 3, 7, 8, 9]
    append and sort       -> [1, 2, 3, 7, 8, 9]
    scratch merge         -> [1, 2, 3, 7, 8, 9]
    copy a's prefix       -> [1, 2, 3, 7, 8, 9]
    backward pointers     -> [1, 2, 3, 7, 8, 9]
    expected              -> [1, 2, 3, 7, 8, 9]
    all agree: True
ties everywhere - equal values are interchangeable
  a=[2, 2, 2, 0, 0, 0] m=3 b=[2, 2, 2] n=3
    insert one at a time  -> [2, 2, 2, 2, 2, 2]
    append and sort       -> [2, 2, 2, 2, 2, 2]
    scratch merge         -> [2, 2, 2, 2, 2, 2]
    copy a's prefix       -> [2, 2, 2, 2, 2, 2]
    backward pointers     -> [2, 2, 2, 2, 2, 2]
    expected              -> [2, 2, 2, 2, 2, 2]
    all agree: True
interleaved one for one
  a=[1, 3, 5, 0, 0, 0] m=3 b=[2, 4, 6] n=3
    insert one at a time  -> [1, 2, 3, 4, 5, 6]
    append and sort       -> [1, 2, 3, 4, 5, 6]
    scratch merge         -> [1, 2, 3, 4, 5, 6]
    copy a's prefix       -> [1, 2, 3, 4, 5, 6]
    backward pointers     -> [1, 2, 3, 4, 5, 6]
    expected              -> [1, 2, 3, 4, 5, 6]
    all agree: True
negative and large values
  a=[-10, 0, 0, 0] m=1 b=[-99, 7, 100] n=3
    insert one at a time  -> [-99, -10, 7, 100]
    append and sort       -> [-99, -10, 7, 100]
    scratch merge         -> [-99, -10, 7, 100]
    copy a's prefix       -> [-99, -10, 7, 100]
    backward pointers     -> [-99, -10, 7, 100]
    expected              -> [-99, -10, 7, 100]
    all agree: True
b has a single value that lands in the middle
  a=[1, 9, 0] m=2 b=[5] n=1
    insert one at a time  -> [1, 5, 9]
    append and sort       -> [1, 5, 9]
    scratch merge         -> [1, 5, 9]
    copy a's prefix       -> [1, 5, 9]
    backward pointers     -> [1, 5, 9]
    expected              -> [1, 5, 9]
    all agree: True
stress: 3000 random (a, m, b, n) with m, n in 0..8, all five approaches vs the oracle

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
