// backspace-compare — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `All five approaches in one file. \`HASH\` is a module constant and \`prev_survivor\` is lifted out of the
final rung because its walk is needed twice, once per string — and because keeping that loop in one
place is the cheapest defence against the off-by-one it is prone to. \`typed_text\` is **reference
scaffolding, not an answer**: it types a string out the obvious way so every approach can be checked
against something independent.

Tests cover the worked example with its run of hashes, all three of the statement's examples including
the leading \`'#'\`, the smallest legal input (both empty), a string of nothing but hashes against an
empty string, both sides deleted down to nothing, repeated letters, a long run of hashes, and three
distinct \`false\` shapes — same length with different text, one text a suffix of the other, and one side
emptied entirely. The \`false\` cases *are* the no-valid-answer case here: the answer is a boolean, so
"no match" is a legitimate result rather than an absent one. The stress test runs 4000 random pairs
over a deliberately hash-heavy alphabet, with 30 % of them forced equal so \`true\` cases are common,
cross-checked against the reference.`

export const script = `"""Two Strings After the Backspaces - every approach in one file, cross-checked.

Run: python backspace_compare.py
"""

from __future__ import annotations

import random

HASH = "#"


def backspace_compare_recursion(s: str, t: str) -> bool:
    at = s.find(HASH)
    if at >= 0:
        head = s[: at - 1] if at > 0 else ""   # a '#' at index 0 has nothing to its left
        return backspace_compare_recursion(head + s[at + 1 :], t)
    at = t.find(HASH)
    if at >= 0:
        head = t[: at - 1] if at > 0 else ""
        return backspace_compare_recursion(s, head + t[at + 1 :])
    return s == t


def backspace_compare_slicing(s: str, t: str) -> bool:
    typed: list[str] = []
    for text in (s, t):
        out = ""
        for ch in text:
            if ch == HASH:
                out = out[:-1]        # slicing an empty string is a silent no-op in Python
            else:
                out = out + ch
        typed.append(out)
    return typed[0] == typed[1]


def backspace_compare_stack(s: str, t: str) -> bool:
    typed: list[list[str]] = []
    for text in (s, t):
        keep: list[str] = []
        for ch in text:
            if ch == HASH:
                if keep:              # a backspace on empty text deletes nothing
                    keep.pop()
            else:
                keep.append(ch)
        typed.append(keep)
    return typed[0] == typed[1]


def backspace_compare_backward_pass(s: str, t: str) -> bool:
    survivors: list[list[str]] = []
    for text in (s, t):
        out: list[str] = []
        skip = 0
        for i in range(len(text) - 1, -1, -1):
            if text[i] == HASH:
                skip += 1             # a COUNTER, not a flag: a run of hashes owes that many
            elif skip > 0:
                skip -= 1
            else:
                out.append(text[i])
        survivors.append(out)
    return survivors[0] == survivors[1]


def prev_survivor(text: str, i: int) -> int:
    """Walk left from \`i\` to the next character that survives; -1 if there is none.

    The whole constant-space trick lives here: reading right to left, a '#'
    arrives BEFORE its victim, so \`skip\` is a debt counter and every character
    can be judged on sight. A run of hashes raises the debt by that many, and
    the loop must consume the WHOLE run before it can return.
    """
    skip = 0
    while i >= 0:
        if text[i] == HASH:
            skip += 1
            i -= 1
        elif skip > 0:                # this character pays off one pending delete and dies
            skip -= 1
            i -= 1
        else:
            return i                  # owes nothing: it survives
    return -1


def backspace_compare_two_cursors(s: str, t: str) -> bool:
    i, j = len(s) - 1, len(t) - 1
    while i >= 0 or j >= 0:
        i = prev_survivor(s, i)
        j = prev_survivor(t, j)
        if i >= 0 and j >= 0:
            if s[i] != t[j]:
                return False
        elif i >= 0 or j >= 0:
            # one side ran out of survivors while the other still has one
            return False
        i -= 1
        j -= 1
    return True


def typed_text(text: str) -> str:
    """The reference: just type it out."""
    out: list[str] = []
    for ch in text:
        if ch == "#":
            if out:
                out.pop()
        else:
            out.append(ch)
    return "".join(out)


def reference(s: str, t: str) -> bool:
    return typed_text(s) == typed_text(t)


APPROACHES = [
    ("recursion", backspace_compare_recursion),
    ("slicing", backspace_compare_slicing),
    ("stack", backspace_compare_stack),
    ("backward pass", backspace_compare_backward_pass),
    ("two cursors", backspace_compare_two_cursors),
]


def run_case(label: str, s: str, t: str) -> bool:
    want = reference(s, t)
    results = [(name, fn(s, t)) for name, fn in APPROACHES]
    agree = all(got == want for _, got in results)
    print(label)
    print(f"  s={s!r} -> {typed_text(s)!r}   t={t!r} -> {typed_text(t)!r}   (reference {want})")
    for name, got in results:
        print(f"    {name:<14} -> {got}")
    print(f"    all agree with the reference: {agree}")
    return agree


def main() -> None:
    ok = True

    # The document's worked example: a RUN of hashes on one side.
    ok &= run_case("the document's worked example", "abc##d", "ad#d")

    ok &= run_case("statement 1", "ab#c", "ad#c")
    ok &= run_case("statement 2 - a false case", "a#c", "b")
    ok &= run_case("statement 3 - a leading '#'", "#a", "a")

    # Smallest legal input.
    ok &= run_case("both empty", "", "")
    ok &= run_case("one empty, one all hashes", "", "###")
    ok &= run_case("everything deleted on both sides", "abc###", "xy##")

    # Duplicates and repeated letters.
    ok &= run_case("repeated letters", "aaa#a", "aa#aa")
    ok &= run_case("a long run of hashes", "abcdef#####g", "ag")

    # False cases: same length, different text; and different lengths.
    ok &= run_case("same length, different text", "xy", "xz")
    ok &= run_case("one side is a suffix of the other", "c", "ac")
    ok &= run_case("prefix survives, suffix does not", "ab##", "a")

    random.seed(5)
    bad = 0
    for _ in range(4000):
        def gen() -> str:
            n = random.randint(0, 14)
            # heavy on '#' so runs of them, and deletes on empty text, happen constantly
            return "".join(random.choice("aab#c#") for _ in range(n))

        s, t = gen(), gen()
        if random.random() < 0.3:       # force plenty of TRUE cases, not just random FALSEs
            t = s
        want = reference(s, t)
        for name, fn in APPROACHES:
            got = fn(s, t)
            if got != want:
                bad += 1
                ok = False
                print(f"  STRESS DISAGREEMENT {name} s={s!r} t={t!r}: got {got}, want {want}")
    print(f"stress: 4000 random string pairs (<= 14 chars, hash-heavy), all five approaches, {bad} disagreements")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
the document's worked example
  s='abc##d' -> 'ad'   t='ad#d' -> 'ad'   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
statement 1
  s='ab#c' -> 'ac'   t='ad#c' -> 'ac'   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
statement 2 - a false case
  s='a#c' -> 'c'   t='b' -> 'b'   (reference False)
    recursion      -> False
    slicing        -> False
    stack          -> False
    backward pass  -> False
    two cursors    -> False
    all agree with the reference: True
statement 3 - a leading '#'
  s='#a' -> 'a'   t='a' -> 'a'   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
both empty
  s='' -> ''   t='' -> ''   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
one empty, one all hashes
  s='' -> ''   t='###' -> ''   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
everything deleted on both sides
  s='abc###' -> ''   t='xy##' -> ''   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
repeated letters
  s='aaa#a' -> 'aaa'   t='aa#aa' -> 'aaa'   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
a long run of hashes
  s='abcdef#####g' -> 'ag'   t='ag' -> 'ag'   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
same length, different text
  s='xy' -> 'xy'   t='xz' -> 'xz'   (reference False)
    recursion      -> False
    slicing        -> False
    stack          -> False
    backward pass  -> False
    two cursors    -> False
    all agree with the reference: True
one side is a suffix of the other
  s='c' -> 'c'   t='ac' -> 'ac'   (reference False)
    recursion      -> False
    slicing        -> False
    stack          -> False
    backward pass  -> False
    two cursors    -> False
    all agree with the reference: True
prefix survives, suffix does not
  s='ab##' -> ''   t='a' -> 'a'   (reference False)
    recursion      -> False
    slicing        -> False
    stack          -> False
    backward pass  -> False
    two cursors    -> False
    all agree with the reference: True
stress: 4000 random string pairs (<= 14 chars, hash-heavy), all five approaches, 0 disagreements

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
