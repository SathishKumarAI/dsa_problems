// product-except-self — every approach in one file, cross-checked
//
// Converted from docs/deep/product-except-self_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach above, plus a test suite covering the statement's two examples (including the one with
a zero), the smallest legal input, two zeros, one zero at minimal length, all-negative values,
repeated values, the extremes of the stated \`-30\`…\`30\` range, and eleven randomised stress cases from
that range with zeros deliberately over-represented — each cross-checked against brute force and
against every other approach. Python integers are arbitrary-precision, so the stress cases' products
may exceed 32 bits; that guarantee matters for Java and C++, not here.

\`EMPTY_PRODUCT\` is the one shared decision, declared once and used by all four approaches.`

export const script = `"""Product of Everything Else - every approach in one file, plus a self-checking test suite.

Run: python product_except_self_all.py
"""

from __future__ import annotations

import random
import time

EMPTY_PRODUCT = 1  # the product of no numbers at all; every accumulator below starts here


# --- 1. Brute force: multiply the others, once per position -------------------

def product_except_self_brute_force(nums: list[int]) -> list[int]:
    out: list[int] = []
    for i in range(len(nums)):
        product = EMPTY_PRODUCT
        for j in range(len(nums)):
            if j != i:  # the only position skipped
                product *= nums[j]
        out.append(product)
    return out


# --- 2. Divide the total product (banned by the statement; shown to be refuted)

def product_except_self_division(nums: list[int]) -> list[int]:
    zeros = nums.count(0)
    if zeros > 1:  # two zeros leave a zero in every product
        return [0] * len(nums)
    product_of_nonzero = EMPTY_PRODUCT
    for x in nums:
        if x != 0:
            product_of_nonzero *= x
    if zeros == 1:  # only the zero's own slot survives
        return [product_of_nonzero if x == 0 else 0 for x in nums]
    return [product_of_nonzero // x for x in nums]  # exact: x divides the product


# --- 3. Two prefix arrays -----------------------------------------------------

def product_except_self_two_prefix_arrays(nums: list[int]) -> list[int]:
    n = len(nums)
    left = [EMPTY_PRODUCT] * n   # left[i] = product of everything strictly before i
    right = [EMPTY_PRODUCT] * n  # right[i] = product of everything strictly after i
    for i in range(1, n):
        left[i] = left[i - 1] * nums[i - 1]
    for i in range(n - 2, -1, -1):
        right[i] = right[i + 1] * nums[i + 1]
    return [left[i] * right[i] for i in range(n)]


# --- 4. Prefix forward, suffix folded back in (optimal) ----------------------

def product_except_self_prefix_suffix(nums: list[int]) -> list[int]:
    n = len(nums)
    out = [EMPTY_PRODUCT] * n
    running = EMPTY_PRODUCT
    for i in range(n):
        out[i] = running     # written before nums[i] joins, so i excludes itself
        running *= nums[i]
    running = EMPTY_PRODUCT
    for i in range(n - 1, -1, -1):
        out[i] *= running    # folds the suffix into the prefix already stored
        running *= nums[i]
    return out


APPROACHES = [
    ("brute_force", product_except_self_brute_force),
    ("division", product_except_self_division),
    ("two_prefix_arrays", product_except_self_two_prefix_arrays),
    ("prefix_suffix", product_except_self_prefix_suffix),
]


# --- test suite ---------------------------------------------------------------

def _best_of(fn, rounds: int = 3) -> float:
    best = float("inf")
    for _ in range(rounds):
        start = time.perf_counter()
        fn()
        best = min(best, time.perf_counter() - start)
    return best


def _naive_division(nums: list[int]) -> list[int]:
    """Scaffolding: the one-liner people reach for, with NO zero handling at all."""
    total = EMPTY_PRODUCT
    for x in nums:
        total *= x
    return [total // x for x in nums]


def _legal_array(n: int, rng: random.Random) -> list[int]:
    """An array that actually satisfies 'every answer fits in a 32-bit integer'.
    At this n that forces nearly every element to be +/-1, which is the point."""
    nums = [rng.choice([-1, 1]) for _ in range(n)]
    for i in rng.sample(range(n), 6):
        nums[i] = [2, 3, 5, 7, 11, 13][i % 6]
    return nums


def trace_the_fold() -> None:
    """Both tables of the hand-trace in 'Reading the Calculations'."""
    nums = [1, 2, 3, 4]
    n = len(nums)
    out = [EMPTY_PRODUCT] * n
    print(f"=== {nums}, forward pass: store, THEN extend ===")
    running = EMPTY_PRODUCT
    for i in range(n):
        out[i] = running
        running *= nums[i]
        print(f"  i={i}  out[{i}] = {out[i]:<3} then running = {running}")
    print(f"  out {out}   (final running {running} is written and never read)")
    print("=== backward pass: multiply IN, then extend ===")
    running = EMPTY_PRODUCT
    for i in range(n - 1, -1, -1):
        before = out[i]
        out[i] *= running
        running *= nums[i]
        print(f"  i={i}  {before} * {out[i] // before if before else 0} = {out[i]:<3} then running = {running}")
    print(f"  out {out}")


def measure() -> None:
    """The numbers quoted in the two 'Under the hood' callouts. Counts are exact;
    timings are one machine's, and the SHAPE of each column is the claim."""
    print("\\n=== the division one-liner, with no zero special case ===")
    for nums in ([1, 2, 3, 4], [1, 0, 3, 4], [0, 0, 3, 4]):
        try:
            got = str(_naive_division(list(nums)))
        except ZeroDivisionError as exc:
            got = f"ZeroDivisionError: {exc}"
        correct = product_except_self_prefix_suffix(list(nums))
        print(f"  {str(nums):<14} -> {got:<34} correct {correct}")

    rng = random.Random(1)
    buckets = {0: 0, 1: 0, 2: 0}
    for _ in range(10000):
        sample = [rng.choice([-2, -1, 0, 1, 2, 3]) for _ in range(rng.randint(2, 8))]
        buckets[min(sample.count(0), 2)] += 1
    print("  over 10,000 random small arrays with zeros permitted:")
    print(f"    no zeros    {buckets[0]:>6}   plain division works")
    print(f"    exactly one {buckets[1]:>6}   needs its own branch")
    print(f"    two or more {buckets[2]:>6}   needs a third branch")
    share = 100 * (buckets[1] + buckets[2]) / 10000
    print(f"    {share:.0f}% land in a branch the one-liner does not have")

    print("\\n=== linear, when the 32-bit promise holds ===")
    print(f"  {'n':>6} {'two arrays ms':>14} {'folded ms':>11}")
    rng = random.Random(20260913)
    for n in (500, 1000, 2000, 4000):
        nums = _legal_array(n, rng)
        print(
            f"  {n:>6}"
            f" {_best_of(lambda d=nums: product_except_self_two_prefix_arrays(list(d))) * 1e3:>14.2f}"
            f" {_best_of(lambda d=nums: product_except_self_prefix_suffix(list(d))) * 1e3:>11.2f}"
        )

    print("\\n=== and what happens when it does not: an array of n twos ===")
    print(f"  {'n':>6} {'bits':>8} {'digits':>8} {'folded ms':>11}")
    for n in (500, 1000, 2000, 4000):
        nums = [2] * n
        running = EMPTY_PRODUCT
        for x in nums:
            running *= x
        t = _best_of(lambda d=nums: product_except_self_prefix_suffix(list(d)))
        print(f"  {n:>6} {running.bit_length():>8} {len(str(running)):>8} {t * 1e3:>11.1f}")
    print("  time QUADRUPLES when n doubles: bignum multiplication is not O(1)")

    print("\\n=== at the real ceiling, n = 10^5, with legal values ===")
    nums = _legal_array(10**5, rng)
    biggest = max(abs(v) for v in product_except_self_prefix_suffix(list(nums)))
    print(f"  largest answer {biggest}, inside 32 bits: {biggest < 2**31}")
    print(
        f"  two prefix arrays"
        f" {_best_of(lambda: product_except_self_two_prefix_arrays(list(nums))) * 1e3:.2f} ms"
        f"  ·  folded"
        f" {_best_of(lambda: product_except_self_prefix_suffix(list(nums))) * 1e3:.2f} ms"
    )
    print(f"  scratch integers held: two arrays {2 * len(nums)}, folded 1")


def main() -> None:
    trace_the_fold()
    measure()
    print()

    cases: list[tuple[str, list[int]]] = [
        ("statement example", [1, 2, 3, 4]),
        ("statement example with a zero", [-1, 1, 0, -3, 3]),
        ("smallest legal input", [2, 3]),
        ("two zeros", [0, 0]),
        ("one zero, minimal", [0, 5]),
        ("all negative", [-1, -2, -3]),
        ("ones only", [1, 1, 1, 1]),
        ("repeated values", [3, 3, 3]),
        ("bounds of the value range", [-30, 30, -30, 30]),
    ]

    rng = random.Random(20260912)
    for n in range(2, 13):
        # random values inside the stated -30..30 range, zeros deliberately likely
        cases.append((f"stress n={n}", [rng.choice([0] + list(range(-30, 31))) for _ in range(n)]))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums in cases:
        print(f"\\n{label}: nums={nums}")
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums))
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        agreed = all(r == results[0] for r in results)
        if not agreed:
            all_agreed = False
            print("  DISAGREEMENT")

    print(f"\\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
