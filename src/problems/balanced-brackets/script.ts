// balanced-brackets — every approach in one file, cross-checked
//
// Converted from docs/deep/balanced-brackets_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `All three approaches in one file. The general pair — repeated replace and the stack — are checked
against each other on every case; the counter joins the comparison only on inputs that satisfy its
single-kind assumption, and is separately shown failing on the mixed-kind inputs it cannot decide,
which is the documented breakage rather than a bug. Cases cover all three of the statement's
examples, the smallest legal input (length 1, which can never be balanced), the empty string as an
out-of-constraints extra, each of the three failure modes in isolation, and a randomised stress test
over raw six-character soup plus strings constructed to be valid.`

export const script = `"""Balanced Brackets - every approach in one file, cross-checked.

Run: python balanced_brackets.py
"""

from __future__ import annotations

import random

# The alphabet, defined once. Every approach and the harness read it from here.
PAIRS: dict[str, str] = {")": "(", "]": "[", "}": "{"}  # closer -> its opener
OPENERS: str = "([{"
CLOSERS: str = ")]}"


def balanced_brackets_repeated_replace(s: str) -> bool:
    empty_pairs = [opener + closer for closer, opener in PAIRS.items()]  # "()", "[]", "{}"
    prev: str | None = None
    while prev != s:  # loop to a fixed point: one pass is not enough for nesting
        prev = s
        for pair in empty_pairs:
            s = s.replace(pair, "")
    return s == ""


def balanced_brackets_stack(s: str) -> bool:
    st: list[str] = []  # the openers still unmatched, in the order they were opened
    for ch in s:
        if ch in PAIRS:
            if not st or st.pop() != PAIRS[ch]:  # failure 1: empty; failure 2: wrong kind
                return False
        else:
            st.append(ch)
    return not st  # failure 3: an opener never closed


def balanced_brackets_counter(s: str) -> bool:
    """Correct ONLY when s uses a single bracket kind. See counter_applicable()."""
    depth = 0
    for ch in s:
        if ch in OPENERS:
            depth += 1
        else:
            depth -= 1
            if depth < 0:  # failure 1: a closer with nothing open
                return False
    return depth == 0  # failure 3: an opener never closed


def bracket_kind(ch: str) -> str:
    """The opener that identifies this character's kind, whichever half of the pair it is."""
    return PAIRS.get(ch, ch)


def counter_applicable(s: str) -> bool:
    """The assumption the counter needs: at most one kind of bracket in the string."""
    return len({bracket_kind(ch) for ch in s}) <= 1


GENERAL: list[tuple[str, object]] = [
    ("repeated replace", balanced_brackets_repeated_replace),
    ("stack", balanced_brackets_stack),
]


def run_case(label: str, s: str) -> bool:
    results = [(name, fn(s)) for name, fn in GENERAL]
    applies = counter_applicable(s)
    if applies:
        results.append(("counter", balanced_brackets_counter(s)))
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  s={s!r}")
    for name, r in results:
        print(f"    {name:<17} -> {r}")
    if not applies:
        print(f"    {'counter':<17} -- not applicable (more than one bracket kind)")
    print(f"    all agree: {agree}")
    return agree


def random_string(rng: random.Random, n: int) -> str:
    return "".join(rng.choice(OPENERS + CLOSERS) for _ in range(n))


def random_balanced(rng: random.Random, n_pairs: int) -> str:
    """Build a guaranteed-valid string by pushing and popping the way the answer does."""
    out: list[str] = []
    open_stack: list[str] = []
    remaining = n_pairs
    while remaining or open_stack:
        if remaining and (not open_stack or rng.random() < 0.6):
            kind = rng.randrange(3)
            out.append(OPENERS[kind])
            open_stack.append(CLOSERS[kind])
            remaining -= 1
        else:
            out.append(open_stack.pop())
    return "".join(out)


def main() -> None:
    ok = True

    ok &= run_case("statement example 1 - fully nested", "([{}])")
    ok &= run_case("statement example 2 - wrong kind of closer", "(]")
    ok &= run_case("statement example 3 - unclosed opener left over", "(")

    # Smallest legal input is length 1, and neither single character can be balanced.
    ok &= run_case("smallest legal input - lone opener", "{")
    ok &= run_case("smallest legal input - lone closer", "]")

    # Outside the stated constraints (1 <= s.length), but every approach accepts it:
    # the empty string is vacuously balanced.
    ok &= run_case("empty string (outside constraints)", "")

    # Failure mode 1 in isolation: a closer arriving with nothing open.
    ok &= run_case("failure 1: closer against an empty stack", "()]")
    # Failure mode 2 in isolation: a closer that mismatches the top.
    ok &= run_case("failure 2: closer mismatching the top", "([)]")
    # Failure mode 3 in isolation: everything matched, but something stayed open.
    ok &= run_case("failure 3: non-empty stack at the end", "([]")

    ok &= run_case("siblings, not nested", "()[]{}")
    ok &= run_case("deep nesting", "(((((((((())))))))))")
    ok &= run_case("all openers", "(((")
    ok &= run_case("all closers", ")))")
    ok &= run_case("balanced count, wrong order", ")(")

    # The counter's documented breakage: on mixed-kind input it is not merely excluded
    # from the comparison above, it is WRONG, and these are the inputs that prove it.
    print("counter on mixed-kind input (documented breakage, not a bug)")
    for bad in ("(]", "([)]", "{)"):
        truth = balanced_brackets_stack(bad)
        got = balanced_brackets_counter(bad)
        print(f"  s={bad!r:8} truth={truth}  counter={got}  counter is wrong: {got != truth}")
        if got == truth:  # the whole point of this rung is that it fails here
            ok = False
            print("  UNEXPECTED: the counter was supposed to be wrong on this input")

    # Stress: random six-character soup, plus strings built to be valid.
    rng = random.Random(7)
    valid_seen = 0
    counter_checked = 0
    for _ in range(2000):
        s = random_string(rng, rng.randint(0, 14))
        results = [fn(s) for _, fn in GENERAL]
        if counter_applicable(s):
            results.append(balanced_brackets_counter(s))
            counter_checked += 1
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT s={s!r} -> {results}")
    for _ in range(500):
        s = random_balanced(rng, rng.randint(1, 12))
        results = [fn(s) for _, fn in GENERAL]
        if any(r != results[0] for r in results) or results[0] is not True:
            ok = False
            print(f"  STRESS DISAGREEMENT (built valid) s={s!r} -> {results}")
        else:
            valid_seen += 1
    print(
        f"stress: 2000 random strings ({counter_checked} of them single-kind, so the counter "
        f"was checked too) + {valid_seen} constructed-valid strings"
    )

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()`
