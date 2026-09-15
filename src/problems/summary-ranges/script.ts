// summary-ranges — every approach in one file, cross-checked
//
// Converted from docs/deep/summary-ranges_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach above, the shared \`format_range\` helper, and a test suite covering the statement's
examples, the empty array — this problem's no-answer case — the smallest non-empty input, one
unbroken run, no run longer than one, negatives crossing zero, the 32-bit extremes that force the
painting rung to fall back, and 46 randomised cases including a batch pressed against the 32-bit
floor. Each is cross-checked against an independent oracle that finds run starts by set membership
rather than by scanning. The values are promised distinct, so there is no duplicate case to test.`

export const script = `"""Collapse the Runs into Ranges - every approach in one file, plus a self-checking test suite.

Run: python summary_ranges_all.py
"""

from __future__ import annotations

import random


def format_range(first: int, last: int) -> str:
    """A one-value run prints bare; anything longer prints as first->last."""
    return str(first) if first == last else f"{first}->{last}"


# --- 1. Paint the number line --------------------------------------------------

def summary_ranges_paint_line(nums: list[int], span_limit: int = 1 << 20) -> list[str]:
    if not nums:
        return []
    lo, hi = nums[0], nums[-1]
    if hi - lo + 1 > span_limit:  # the small-span assumption fails; fall back
        return summary_ranges_anchor_walk(nums)
    present = [False] * (hi - lo + 1)  # one slot per VALUE in the span, not per element
    for x in nums:
        present[x - lo] = True
    out: list[str] = []
    v = lo
    while v <= hi:
        if not present[v - lo]:
            v += 1
            continue
        start = v
        while v <= hi and present[v - lo]:
            v += 1
        out.append(format_range(start, v - 1))  # v overshot by one past the run
    return out


# --- 2. Bucket by value minus index --------------------------------------------

def summary_ranges_value_minus_index(nums: list[int]) -> list[str]:
    groups: dict[int, list[int]] = {}
    for i, x in enumerate(nums):
        groups.setdefault(x - i, []).append(x)  # the key is constant inside a run
    out: list[str] = []
    for key in sorted(groups):
        run = groups[key]
        out.append(format_range(run[0], run[-1]))
    return out


# --- 3. Split into run lists ---------------------------------------------------

def summary_ranges_run_lists(nums: list[int]) -> list[str]:
    runs: list[list[int]] = []
    for x in nums:
        if runs and runs[-1][-1] + 1 == x:  # compare against the run's LAST value
            runs[-1].append(x)
        else:
            runs.append([x])
    return [format_range(run[0], run[-1]) for run in runs]


# --- 4. Collect the break points -----------------------------------------------

def summary_ranges_break_points(nums: list[int]) -> list[str]:
    if not nums:
        return []
    ends = [i for i in range(len(nums) - 1) if nums[i] + 1 != nums[i + 1]]
    ends.append(len(nums) - 1)  # the last run always ends at the last index
    out: list[str] = []
    start = 0
    for b in ends:
        out.append(format_range(nums[start], nums[b]))
        start = b + 1
    return out


# --- 5. One walk with an anchor (optimal) --------------------------------------

def summary_ranges_anchor_walk(nums: list[int]) -> list[str]:
    out: list[str] = []
    n = len(nums)
    i = 0
    while i < n:
        start = nums[i]
        # drift along the chain of +1 steps; i lands on the run's last value
        while i + 1 < n and nums[i + 1] == nums[i] + 1:
            i += 1
        out.append(format_range(start, nums[i]))
        i += 1
    return out


APPROACHES = [
    ("paint_line", summary_ranges_paint_line),
    ("value_minus_index", summary_ranges_value_minus_index),
    ("run_lists", summary_ranges_run_lists),
    ("break_points", summary_ranges_break_points),
    ("anchor_walk", summary_ranges_anchor_walk),
]


# --- test scaffolding, not part of any answer ----------------------------------

def summary_ranges_reference(nums: list[int]) -> list[str]:
    """Independent oracle: a run starts where x - 1 is absent, then grows by membership."""
    present = set(nums)
    out: list[str] = []
    for x in nums:
        if x - 1 not in present:
            last = x
            while last + 1 in present:
                last += 1
            out.append(format_range(x, last))
    return out


def main() -> None:
    cases: list[tuple[str, list[int]]] = [
        ("statement example", [0, 1, 2, 4, 5, 7]),
        ("three lone values", [0, 2, 3, 4, 6, 8, 9]),
        ("empty array - this problem's no-answer case", []),
        ("smallest non-empty input", [0]),
        ("one long run", [1, 2, 3, 4, 5]),
        ("no run longer than one", [1, 3, 5, 7, 9]),
        ("negatives crossing zero", [-3, -2, -1, 0, 1, 5]),
        ("32-bit extremes - paint_line must fall back", [-2147483648, 2147483647]),
        ("a run at the very bottom of the range", [-2147483648, -2147483647, 0]),
        ("full 20 values, one unbroken run", list(range(20))),
    ]
    # The values are promised DISTINCT, so there is no duplicate case to test; the
    # empty array is the only input with no range to emit, and it is covered above.

    rng = random.Random(20260912)
    for _ in range(40):
        n = rng.randint(0, 20)  # 20 is the stated maximum length
        cases.append((f"stress n={n}", sorted(rng.sample(range(-40, 40), n))))
    for _ in range(6):
        n = rng.randint(1, 20)
        floor = -2147483648
        cases.append((f"stress at the 32-bit floor n={n}",
                      sorted(rng.sample(range(floor, floor + 600), n))))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums in cases:
        print(f"\\n{label}: nums={nums}")
        expected = summary_ranges_reference(nums)
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums))  # a copy each, so no approach can disturb another
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        agreed = all(r == expected for r in results)
        if not agreed:
            all_agreed = False
            print(f"  DISAGREEMENT: reference said {expected}")

    print(f"\\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED WITH THE REFERENCE ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
