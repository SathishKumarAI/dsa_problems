// daily-warmer — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `All three approaches in one file, cross-checked on every case. Coverage: the statement's example; the
smallest legal input (\`n = 1\`); the no-valid-answer cases the problem explicitly allows, both as a
strictly decreasing series and as an all-equal one; duplicates, which are where the strict comparison
is decided; the constraint bounds 30 and 100; and a randomised stress test run in two regimes — a
tie-heavy one over an 11-degree range, because ties are where the \`<\` versus \`<=\` bug lives, and a
wider one over the full legal range.`

export const script = `"""Days Until Warmer - every approach in one file, cross-checked.

Run: python daily_warmer.py
"""

from __future__ import annotations

import random


def daily_warmer_brute_force(temps: list[int]) -> list[int]:
    n = len(temps)
    answer = [0] * n
    for i in range(n):
        for j in range(i + 1, n):
            if temps[j] > temps[i]:
                answer[i] = j - i
                break
    return answer


def daily_warmer_backward_scan(temps: list[int]) -> list[int]:
    n = len(temps)
    answer = [0] * n
    for i in range(n - 2, -1, -1):
        j = i + 1
        while j < n and temps[j] <= temps[i]:
            if answer[j] == 0:
                j = n  # day j never warms up, so neither does day i
            else:
                j += answer[j]  # hop over a whole block that is already resolved
        answer[i] = j - i if j < n else 0
    return answer


def daily_warmer_monotonic_stack(temps: list[int]) -> list[int]:
    answer = [0] * len(temps)
    waiting: list[int] = []  # indices whose answer is unknown, temps decreasing
    for i, t in enumerate(temps):
        while waiting and temps[waiting[-1]] < t:  # strict: an equal day is not warmer
            j = waiting.pop()
            answer[j] = i - j
        waiting.append(i)
    return answer


APPROACHES: list[tuple[str, object]] = [
    ("brute force", daily_warmer_brute_force),
    ("backward scan", daily_warmer_backward_scan),
    ("monotonic stack", daily_warmer_monotonic_stack),
]


def run_case(label: str, temps: list[int]) -> bool:
    results = [(name, fn(list(temps))) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  temps={temps}")
    for name, r in results:
        print(f"    {name:<16} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    ok &= run_case("statement example", [73, 74, 75, 71, 69, 72, 76, 73])

    # Smallest legal input: one day, and nothing follows it.
    ok &= run_case("smallest legal input (n = 1)", [30])

    # No day ever warms up - the all-zero answer the problem explicitly allows.
    ok &= run_case("no warmer day ever (strictly decreasing)", [100, 90, 80, 70])
    ok &= run_case("no warmer day ever (all equal)", [55, 55, 55, 55])

    # Duplicates matter: 'strictly warmer' means an equal day resolves nothing.
    ok &= run_case("duplicates then a warmer day", [73, 73, 73, 74])

    # Every day resolved by its immediate neighbour.
    ok &= run_case("strictly increasing", [30, 40, 50, 60])

    # The constraint bounds, both ends of the legal range.
    ok &= run_case("constraint bounds", [100, 30, 100])

    # One late peak resolves a long cold run all at once - the expensive single
    # iteration whose cost is paid for by the cheap ones before it.
    ok &= run_case("one late peak", [50, 49, 48, 47, 46, 100])

    # Stress against brute force. The first regime is tie-heavy on purpose: an
    # 11-degree range makes equal neighbours common, which is what the strict
    # comparison is decided by. n stays small because brute force is quadratic;
    # its worst case is stated analytically in the document, not measured here.
    rng = random.Random(11)
    for _ in range(1500):
        temps = [rng.randint(30, 40) for _ in range(rng.randint(1, 60))]
        results = [fn(list(temps)) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT temps={temps} -> {results}")
    for _ in range(500):
        temps = [rng.randint(30, 100) for _ in range(rng.randint(1, 200))]
        results = [fn(list(temps)) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT temps={temps} -> {results}")
    print("stress: 1500 tie-heavy + 500 wide-range temperature series cross-checked")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()`
