// boats-to-save — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `Every approach above, plus a test suite that runs the statement's example, the worked example, the
crowd where nobody can share a boat, the smallest legal input, two all-duplicate crowds (one where
everyone pairs up and one where nobody does), the crowd that exposes light-end pairing, and twelve
randomised stress crowds cross-checked against the exhaustive search. The exponential rung is run only
up to twelve people — its worst case is stated analytically above, not measured.`

export const script = `"""Fewest Boats for Everyone - every approach in one file, plus a self-checking test suite.

Run: python boats_to_save_all.py
"""

from __future__ import annotations

import random


# --- the problem's one rule, shared by every approach ------------------------

def fits_one_boat(lighter: int, heavier: int, limit: int) -> bool:
    """The problem's one rule, in one place: two people share a boat only if their
    combined weight is within the limit. Change the rule here and every rung follows."""
    return lighter + heavier <= limit


# --- 1. Exact search over every group ------------------------------------------

def boats_to_save_subset_search(people: list[int], limit: int) -> int:
    n = len(people)
    full = 1 << n
    best = [n + 1] * full  # n + 1 is "unreachable": no answer ever needs more than n boats
    best[0] = 0
    for mask in range(full):
        if best[mask] > n:
            continue
        # fixing the boat to carry the lowest waiting person removes the
        # duplicate work of trying the same pair in both orders
        first = -1
        for i in range(n):
            if not (mask >> i) & 1:
                first = i
                break
        if first < 0:
            continue
        alone = mask | (1 << first)
        if best[mask] + 1 < best[alone]:
            best[alone] = best[mask] + 1
        for j in range(first + 1, n):
            if not (mask >> j) & 1 and fits_one_boat(people[first], people[j], limit):
                both = alone | (1 << j)
                if best[mask] + 1 < best[both]:
                    best[both] = best[mask] + 1
    return best[full - 1]


# --- 2. Rescan for the heaviest and the lightest -------------------------------

def boats_to_save_rescan(people: list[int], limit: int) -> int:
    n = len(people)
    used = [False] * n
    waiting = n
    boats = 0
    while waiting > 0:
        hi = -1
        for i in range(n):
            if not used[i] and (hi < 0 or people[i] > people[hi]):
                hi = i
        used[hi] = True  # mark BEFORE looking for a companion, or hi can be its own partner
        waiting -= 1
        boats += 1
        lo = -1
        for i in range(n):
            if not used[i] and (lo < 0 or people[i] < people[lo]):
                lo = i
        if lo >= 0 and fits_one_boat(people[lo], people[hi], limit):
            used[lo] = True
            waiting -= 1
    return boats


# --- 3. Sort, then empty the queue from both ends ------------------------------

def boats_to_save_sorted_queue(people: list[int], limit: int) -> int:
    waiting = sorted(people)
    boats = 0
    while waiting:
        heaviest = waiting.pop()
        boats += 1
        if waiting and fits_one_boat(waiting[0], heaviest, limit):
            waiting.pop(0)  # removing the front shifts everyone behind it
    return boats


# --- 4. Count the weights into buckets -----------------------------------------

def boats_to_save_buckets(people: list[int], limit: int) -> int:
    count = [0] * (limit + 1)  # +1 because a person may weigh exactly the limit
    for w in people:
        count[w] += 1
    low, high = 1, limit
    waiting = len(people)
    boats = 0
    while waiting > 0:
        while count[high] == 0:  # neither cursor ever moves back
            high -= 1
        count[high] -= 1
        waiting -= 1
        boats += 1
        if waiting > 0:  # without this, the low cursor could re-seat the person just taken
            while low <= limit and count[low] == 0:
                low += 1
            if low <= limit and fits_one_boat(low, high, limit):
                count[low] -= 1
                waiting -= 1
    return boats


# --- 5. Sort, then two converging pointers (optimal) ---------------------------

def boats_to_save_two_pointers(people: list[int], limit: int) -> int:
    order = sorted(people)
    i, j = 0, len(order) - 1
    boats = 0
    while i <= j:  # <=, not <: when both land on the same person, that person still needs a boat
        if fits_one_boat(order[i], order[j], limit):
            i += 1  # the lightest fits alongside the heaviest, so they share
        j -= 1      # the heaviest boards either way, so j always moves
        boats += 1
    return boats


APPROACHES = [
    ("subset_search", boats_to_save_subset_search),
    ("rescan", boats_to_save_rescan),
    ("sorted_queue", boats_to_save_sorted_queue),
    ("buckets", boats_to_save_buckets),
    ("two_pointers", boats_to_save_two_pointers),
]


# --- test suite ----------------------------------------------------------------

def main() -> None:
    cases: list[tuple[str, list[int], int]] = [
        ("statement example", [1, 2], 3),
        ("worked example", [3, 2, 2, 1], 3),
        ("nobody can share", [3, 5, 3, 4], 5),
        ("smallest legal input", [1], 1),
        ("all duplicates, all pair up", [2, 2, 2, 2], 4),
        ("all duplicates, none pair up", [2, 2, 2, 2], 3),
        ("light-greedy trap", [1, 1, 2, 2], 3),
        ("everyone at the limit", [4, 4, 4], 4),
    ]

    rng = random.Random(20260912)
    for n in range(1, 13):  # the subset search is exponential: keep the stress crowds small
        limit = rng.randint(1, 12)
        # 1 <= people[i] <= limit, exactly as the constraints promise
        crowd = [rng.randint(1, limit) for _ in range(n)]
        cases.append((f"stress n={n} limit={limit}", crowd, limit))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, crowd, limit in cases:
        print(f"\\n{label}: people={crowd} limit={limit}")
        results = []
        for name, fn in APPROACHES:
            got = fn(list(crowd), limit)  # own copy: the sorting rungs reorder what they are given
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        if any(r != results[0] for r in results):
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
