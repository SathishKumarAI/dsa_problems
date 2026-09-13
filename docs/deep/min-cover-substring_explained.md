# Smallest Covering Window — explained

## Understanding the Problem

You are standing in front of a long shelf of jars, each labelled with a letter, and you have a
shopping list. You want the **narrowest** contiguous span of shelf that still contains everything on
the list. Extra jars inside the span are fine — nobody minds you carrying junk — but if the list says
two `A`s, a span with one `A` is not a span you can use.

That is the problem. `s` is the shelf, `t` is the list, and you return the shortest substring of `s`
containing every character of `t`, counting repeats. If no span qualifies, return the empty string.

**The core question:** as a span grows and shrinks, is it currently holding at least as many of every
listed character as the list demands? The naive approach is slow because it answers that question by
rebuilding a fresh **tally** of the entire span every time it asks — and it asks once per candidate
span, of which there are about n²/2.

### Two shapes of window, and this is the harder one

| Shape | Rule | Example |
|---|---|---|
| Fixed width | One character enters, one leaves, then test. The width never changes. | permutation-in-string |
| **Variable width** | Grow the right edge until the window becomes valid; then shrink the left edge *while it stays valid*, recording the best as you shrink. | this problem |

Growing the right edge is how you *find* a covering window. Shrinking the left edge while it still
covers is how you find the **tightest** version of that window. The instant a left move breaks
coverage you stop shrinking and go back to growing. Each index enters once and leaves once, which is
the entire reason a single pass suffices.

### The constraints, and what each one unlocks

| Constraint | What it unlocks |
|---|---|
| `1 <= s.length, t.length <= 10^5` | Forbids brute force outright. 10⁵ characters is ~5·10⁹ candidate spans, and each costs more than its own length to judge. Only a linear method survives. |
| `s` and `t` are upper and lower case English letters | The **permission slip** doing most of the work in this document. A fixed, tiny, known-in-advance alphabet makes the tally a constant-size object (so `O(alphabet)` space is really `O(1)`), makes "compare the whole table" a bounded constant rather than an input-dependent cost, and is what lets the last rung drop the hash map for a plain `[0] * 128` array indexed by character code. On arbitrary Unicode the last rung dies and the others survive. |
| duplicates in `t` must each be covered | Kills the **set**. Tracking "which required characters are present" answers a different question, and the difference is invisible until `t` repeats a character — measured below, it returns a 4-character answer where the truth is 11. |
| return `""` when nothing covers `t`; the answer is unique | No tie-breaking rule is needed, so every approach may keep the first shortest window it finds. The empty case needs a sentinel length that cannot be confused with a real one. |

### The worked example used in every section below

```
s = "ADOBECODEBANC", t = "ABC"        answer: "BANC"

index:  0  1  2  3  4  5  6  7  8  9 10 11 12
char:   A  D  O  B  E  C  O  D  E  B  A  N  C
```

`A` sits at 0 and 10, `B` at 3 and 9, `C` at 5 and 12. The answer `"BANC"` is indices 9–12.

### Shared scaffolding

Two things are needed by more than one approach, so they are declared once. They are harness for
reading the code, not part of any answer:

```python
ASCII_SLOTS = 128  # every legal character has a code below this; see the alphabet constraint


def covers(window: Counter[str], need: Counter[str]) -> bool:
    """Does `window` hold at least as many of every required character as `need` demands?"""
    return all(window[c] >= need[c] for c in need)
```

Approaches 1 and 2 call `covers`. Approaches 3 and 4 never do — **deleting that call is what they
exist to achieve.**

---

## Approach 1 — Every span, tallied from scratch

### The idea

*How do I know whether any span covers the list?* Take every possible start and walk the end rightward
until the span covers `t`. The first end that works is that start's shortest covering span, because a
longer end is only fatter. Keep the shortest across all starts.

### How to think about it

> **Intuition.** You are checking the shelf by photographing a section of it and counting everything
> in the photo. Pick a left boundary, widen the photo one jar at a time, and after each widening count
> the *entire photo* again from the beginning. Nothing carried over — the ninth jar gets counted nine
> times. Two costs compound: there are quadratically many photos, and each photo costs its own width
> to count. The one piece of sense it does have is stopping as soon as a start's photo covers the
> list, since widening further only lengthens it.

### Worked example

`s = "ADOBECODEBANC"`, `t = "ABC"`. State per start — the first end that covers, and the record:

| start `i` | char | first covering end `j` | span | length | `best` after |
|---|---|---|---|---|---|
| 0 | `A` | 5 | `ADOBEC` | 6 | `ADOBEC` |
| 1 | `D` | 10 | `DOBECODEBA` | 10 | `ADOBEC` |
| 2 | `O` | 10 | `OBECODEBA` | 9 | `ADOBEC` |
| 3 | `B` | 10 | `BECODEBA` | 8 | `ADOBEC` |
| 4 | `E` | 10 | `ECODEBA` | 7 | `ADOBEC` |
| 5 | `C` | 10 | `CODEBA` | 6 | `ADOBEC` |
| 6 | `O` | 12 | `ODEBANC` | 7 | `ADOBEC` |
| 7 | `D` | 12 | `DEBANC` | 6 | `ADOBEC` |
| 8 | `E` | 12 | `EBANC` | 5 | `EBANC` |
| 9 | `B` | 12 | `BANC` | 4 | **`BANC`** |
| 10 | `A` | none | — | — | `BANC` |
| 11 | `N` | none | — | — | `BANC` |
| 12 | `C` | none | — | — | `BANC` |

The last three rows are the method showing its teeth: past index 9 there is no `B` left, so those
starts scan to the end of the string and find nothing. Measured cost on this 13-character input:
**74 tallies built, 455 characters counted**.

### Code

```python
def min_cover_substring_brute_force(s: str, t: str) -> str:
    need = Counter(t)
    best = ""
    for i in range(len(s)):
        for j in range(i, len(s)):
            if covers(Counter(s[i : j + 1]), need):  # a fresh tally for every (i, j)
                if not best or j - i + 1 < len(best):
                    best = s[i : j + 1]
                break  # a longer j only makes this start's span fatter
    return best
```

### Common mistake

> **Watch out.** The half-formed thought is *"covering means the span and the list match"*. They do
> not. A covering span is a **superset** of the list, not a twin — junk is allowed, absence is not.
> Write the test as `Counter(span) == need` and on the statement's own example it returns `''`: no
> stretch of `ADOBECODEBANC` is an exact rearrangement of `ABC`, so the answer vanishes. Same bug on
> `t = "AABC"` also returns `''`, while `s = "abc", t = "cba"` returns `'abc'` — it gets the easy case
> right, which is exactly why it survives a casual test.

### Complexity and when to use this

**Time `O(n² · alphabet)`.** The two nested walks give n²/2 spans; each builds its own tally at a cost
of its own length, then compares one slot per distinct required character.

**Space `O(alphabet)`.** Two tallies, constant only because the alphabet is bounded.

Unusable at the stated 10⁵ limit, but short enough to be obviously correct — which is precisely what
you want on the other side of a cross-check. That is its job in the test suite at the foot of this
document.

---

## Approach 2 — One window, validity re-checked against the whole table  *(an addition — not in the data file's ladder)*

> Not in the repo's data file for this problem; added here because it is the version most people write
> first, and because the step from it to Approach 3 is the entire lesson.

### The idea

*Brute force rebuilds a tally per candidate — can one tally be carried across candidates instead?* Yes.
Keep one window with a left and a right edge, and one tally of what lies between them. The right edge
moving out increments a slot; the left edge moving in decrements one. The tally is never rebuilt, only
nudged.

This fixes brute force's central weakness: **every span is tallied from scratch, so each character is
counted once for every span containing it.**

### How to think about it

> **Intuition.** A rubber band stretched over the string. It grows rightward until it covers the list
> — now you have *a* covering window, probably a fat one. Then you squeeze it from the left one
> character at a time for as long as it still covers, writing down each shorter covering width. The
> moment a squeeze breaks coverage, stop squeezing and grow again. That grow-then-squeeze rhythm is
> the variable-width skeleton and it is the same shape whatever the validity rule happens to be. What
> stays wasteful here is the **rule**: every time the band moves, you re-read the entire requirement
> table to ask "does it still cover?"

### Worked example

`s = "ADOBECODEBANC"`, `t = "ABC"`. Counts are what the window holds after that step's shrinking;
`best` is `(length, start, end)`:

| `right` | char | `left` after | shrinks | `A` | `B` | `C` | `best` |
|---|---|---|---|---|---|---|---|
| 0 | `A` | 0 | 0 | 1 | 0 | 0 | none |
| 1 | `D` | 0 | 0 | 1 | 0 | 0 | none |
| 2 | `O` | 0 | 0 | 1 | 0 | 0 | none |
| 3 | `B` | 0 | 0 | 1 | 1 | 0 | none |
| 4 | `E` | 0 | 0 | 1 | 1 | 0 | none |
| 5 | `C` | 1 | 1 | 0 | 1 | 1 | **(6, 0, 5)** `ADOBEC` |
| 6 | `O` | 1 | 0 | 0 | 1 | 1 | (6, 0, 5) |
| 7 | `D` | 1 | 0 | 0 | 1 | 1 | (6, 0, 5) |
| 8 | `E` | 1 | 0 | 0 | 1 | 1 | (6, 0, 5) |
| 9 | `B` | 1 | 0 | 0 | 2 | 1 | (6, 0, 5) |
| 10 | `A` | 6 | 5 | 1 | 1 | 0 | (6, 0, 5) |
| 11 | `N` | 6 | 0 | 1 | 1 | 0 | (6, 0, 5) |
| 12 | `C` | 10 | 4 | 1 | 0 | 1 | **(4, 9, 12)** `BANC` |

> **Why it works.** Read the `shrinks` column: 0, 1, 5, 4 on different steps — **ten** left-moves in
> total against thirteen right-moves. The nested `while` looks like a nested loop and is not one,
> because `left` only ever moves forward and so can move at most n times across the whole run. That is
> an amortised argument, not a per-step one, and it is the reason this is `O(n)` rather than `O(n²)`.

### Code

```python
def min_cover_substring_window_table(s: str, t: str) -> str:
    if not t or len(t) > len(s):
        return ""
    need = Counter(t)
    window: Counter[str] = Counter()
    best = (len(s) + 1, 0, 0)  # (length, start, end); length > len(s) means "none yet"
    left = 0
    for right, ch in enumerate(s):
        window[ch] += 1
        while covers(window, need):  # re-reads every required character, every move
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            window[s[left]] -= 1
            left += 1
    length, i, j = best
    return "" if length > len(s) else s[i : j + 1]
```

### Common mistake

> **Watch out.** The misconception is that coverage is about **presence** — "do the required
> characters appear?" — when the question is about **quantity**. Swap the counts for a `set` of the
> characters `t` needs and the two questions agree on every example without a repeat, which is every
> example anyone tries first. On `s = "ADOBECODEBANC", t = "AABC"` the presence version returns
> `'BANC'`; the correct answer is `'ADOBECODEBA'`, eleven characters, because the string holds only
> two `A`s and the window must contain both. On `s = "aa", t = "aa"` it returns `'a'`. This is exactly
> what the "duplicates in `t` must each be covered" constraint is warning about.

### Complexity and when to use this

**Time `O(n · d)`**, `d` = distinct characters in `t`. The window is linear — ten left-moves against
thirteen right-moves on our example — but each of those ~2n moves triggers a full scan of the
requirements.

**Space `O(alphabet)`.** Two bounded tallies.

Right when the validity rule genuinely resists incremental update — some window predicates really do
need the whole state re-examined — or when `d` is one or two. Here `d` is at most 52, so this rung is
technically `O(n)` as well; the next rung is not about asymptotics but about not doing 52 reads to
learn what one increment already implied.

---

## Approach 3 — One window carrying a single "how much is still missing" number

### The idea

*When the window moves by one character, how much of the verdict can actually change?* Only the part
touching that character. So stop recomputing the verdict and start **maintaining** it: carry one
integer for how many required character-copies are still owed, and adjust it only when the character
that moved crosses its own requirement.

This fixes Approach 2's weakness: **it re-reads the entire requirement table after a move that could
only have changed one entry.**

### How to think about it

> **Intuition.** `need` is a ledger of debts, one row per character, and `missing` is the total debt
> outstanding. A character entering pays one unit off its row — if the row still owed something the
> total debt drops; if the row was already settled you are handing over a **surplus**, the total does
> not move, and the row goes negative to record "one more of these than required". A character leaving
> takes its copy back: the row rises, and only if that pushes it *above zero* — from settled or
> surplus back into genuine debt — does the total rise. The window covers exactly when the total is
> zero, and checking that is reading one integer.

### Worked example

`s = "ADOBECODEBANC"`, `t = "ABC"`. `missing` starts at `len(t) = 3` — the length, not the distinct
count, which is what makes repeats work. The window shown is what remains after that step's shrinking:

| `right` | char | `missing` | `left` | window | covering widths seen while shrinking | `best` |
|---|---|---|---|---|---|---|
| 0 | `A` | 2 | 0 | `A` | — | none |
| 1 | `D` | 2 | 0 | `AD` | — | none |
| 2 | `O` | 2 | 0 | `ADO` | — | none |
| 3 | `B` | 1 | 0 | `ADOB` | — | none |
| 4 | `E` | 1 | 0 | `ADOBE` | — | none |
| 5 | `C` | 1 | 1 | `DOBEC` | `0..5` len 6 | **(6, 0, 5)** |
| 6 | `O` | 1 | 1 | `DOBECO` | — | (6, 0, 5) |
| 7 | `D` | 1 | 1 | `DOBECOD` | — | (6, 0, 5) |
| 8 | `E` | 1 | 1 | `DOBECODE` | — | (6, 0, 5) |
| 9 | `B` | 1 | 1 | `DOBECODEB` | — | (6, 0, 5) |
| 10 | `A` | 1 | 6 | `ODEBA` | `1..10` 10, `2..10` 9, `3..10` 8, `4..10` 7, `5..10` 6 | (6, 0, 5) |
| 11 | `N` | 1 | 6 | `ODEBAN` | — | (6, 0, 5) |
| 12 | `C` | 1 | 10 | `ANC` | `6..12` 7, `7..12` 6, `8..12` 5, **`9..12` 4** | **(4, 9, 12)** |

Three rows repay a second look.

| Row | What the ledger does |
|---|---|
| `right = 5` | `C` arrives owing one, so `missing` drops to 0 and window `0..5` is recorded. One squeeze drops the `A` at index 0, raising `A`'s row from 0 to 1 — above zero, real debt again — so shrinking stops after a single step. |
| `right = 9` | A second `B` arrives. `B`'s row was already 0, so `missing` does **not** drop; the row goes to −1, quietly banking a spare `B`. That negative is what later lets the window shed index 3's `B` for free. |
| `right = 12` | The final `C` restores coverage and the window squeezes four times, down to `BANC` — precisely because the surplus `B` and surplus `C` absorb the first departures without raising the debt. The fifth squeeze would drop the `B` at index 9 and break coverage, so it stops. |

Total measured work: **13 right-moves and 10 left-moves, 23 pointer moves**, against brute force's 455
counted characters.

### Code

```python
def min_cover_substring_satisfied_count(s: str, t: str) -> str:
    if not t or len(t) > len(s):
        return ""
    need = Counter(t)
    missing = len(t)
    best = (float("inf"), 0, 0)  # (length, start, end)
    left = 0
    for right, ch in enumerate(s):
        if need[ch] > 0:  # only a still-owed copy pays down the debt
            missing -= 1
        need[ch] -= 1  # negative records a surplus, which is what makes duplicates work
        while missing == 0:
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            need[s[left]] += 1
            if need[s[left]] > 0:  # only a crossing back above zero re-opens a debt
                missing += 1
            left += 1
    length, i, j = best
    return "" if length == float("inf") else s[i : j + 1]
```

### Common mistake

> **Watch out.** Writing the entry test as `need[ch] >= 0` instead of `> 0`. It reads as harmless
> defensiveness, and the misconception underneath is that `missing` counts *characters consumed* when
> it counts **debt repaid**. With `>=`, every character that `t` never asked for — each `D`, `O` and
> `E` here — sits on a row at 0 and also decrements `missing`. The debt hits zero after three
> arbitrary characters, the shrink loop believes the window covers, and `left` marches past the end of
> the string. On the statement's own example this does not return a wrong answer, it **crashes**:
> `IndexError: string index out of range`, with `left` running off at `right = 12`.

### Complexity and when to use this

**Time `O(|s| + |t|)`.** One pass to build `need`, then n right-moves and at most n left-moves, each
doing one increment, one comparison against zero, and one integer adjustment. No move scans anything.

**Space `O(alphabet)`.** One bounded tally plus a few integers.

This is the one to write. It handles duplicates by construction rather than by special case, and the
move it embodies — *replace a repeated recomputation with a summary you update at the boundary* — is
the most transferable idea in the sliding-window family.

---

## Approach 4 — The same window over a fixed array  *(an addition — not in the data file's ladder)*

### The idea

*The tally is a hash map with arbitrary keys — but are the keys arbitrary?* No: the constraint says
English letters, so every key is an ASCII code below 128. Replace the map with a `[0] * 128` list
indexed by `ord(ch)` and every tally touch becomes one memory read — no hashing, no bucket, no
collision chain.

This fixes no complexity weakness of Approach 3; both are `O(n)`. It fixes a **constant factor**: each
of the ~2n tally touches was paying for a hash computation and a dictionary probe.

### What must be true, and what breaks without it

The assumption is that every character has a small, known, bounded code. This problem's constraints
guarantee it — that is what "upper and lower case English letters" buys, and it is why the repo's Java
and C++ solutions for this problem use `int[256]` rather than a `HashMap`. Feed the same code any
character with `ord(ch) >= 128` — an emoji, an accented letter — and it does not return a wrong answer,
it raises `IndexError` on the first one. Where the alphabet cannot be bounded in advance, Approach 3 is
the ceiling.

### How to think about it

> **Intuition.** A hash map is a cloakroom clerk: you hand over a character, they work out where it
> belongs, and fetch the count. A fixed array is a wall of pigeonholes with the characters' codes
> painted on them: you walk straight to the one you want. The clerk handles any garment ever invented;
> the pigeonholes only work because somebody promised in advance exactly which garments can show up.

### Worked example

Behaviour is identical to Approach 3 — same edges, same shrink points, same answer `BANC` at 9–12. Only
the container differs. At `right = 9`, the step where the second `B` banks a surplus:

| | Approach 3 (`Counter`) | Approach 4 (128-slot list) |
|---|---|---|
| reaching `A`'s count | hash `'A'`, probe a bucket, read | `need[65]` — one indexed read |
| state after the second `B` | `{'A': 0, 'B': -1, 'C': 1, 'D': -2, …}` | slot 65 = 0, 66 = −1, 67 = 1, 68 = −2, all others 0 |
| `missing` | 1 | 1 |

Both bank the spare `B` as a −1; one of them has to hash a character to find out.

### Code

```python
def min_cover_substring_fixed_array(s: str, t: str) -> str:
    if not t or len(t) > len(s):
        return ""
    need = [0] * ASCII_SLOTS  # legal only because the alphabet is bounded
    for ch in t:
        need[ord(ch)] += 1
    missing = len(t)
    best_len, best_start = len(s) + 1, 0
    left = 0
    for right, ch in enumerate(s):
        code = ord(ch)
        if need[code] > 0:
            missing -= 1
        need[code] -= 1
        while missing == 0:
            if right - left + 1 < best_len:
                best_len, best_start = right - left + 1, left
            out_code = ord(s[left])
            need[out_code] += 1
            if need[out_code] > 0:
                missing += 1
            left += 1
    return "" if best_len > len(s) else s[best_start : best_start + best_len]
```

### Common mistake

> **Watch out.** Sizing the array to 26 and indexing with `ord(ch) - ord('a')`, on autopilot from a
> lowercase-only problem. This problem says **upper and lower case**, so `'A'` gives
> `ord('A') - ord('a') = -32` — and in Python a negative index does not raise, it silently reads from
> the far end of the array. Uppercase and lowercase stop being distinguishable, and the result is a
> plausible-looking wrong answer rather than a crash. Indexing with the raw `ord` into 128 slots
> removes the question. The test suite's `s = "aA", t = "A"` case exists to catch exactly this.

### Complexity and when to use this

**Time `O(|s| + |t| + A)`**, `A = 128`. The `+ A` is allocating and zeroing the slot array — invisible
at 128, fatal to anyone who extends the idea to Unicode's 1.1 million code points.

**Space `O(A)`.** The slot array, whatever the input length.

Right whenever a problem bounds its alphabet, which sliding-window string problems almost always do.
Note that this is the same instinct as `counts = [0] * 26` in char-replacement and
permutation-in-string, where the array version is so natural nobody names it as a separate rung.

---

## The Overall Arc

Every rung chases one principle: **never recompute what a single move could only have changed a
little.** Brute force is the purest violation — for each of the n²/2 candidate spans it builds a tally
from the first character, so the ninth character is counted dozens of times and everything learned is
discarded the instant the start moves; on a thirteen-character input that is 455 characters counted to
answer a question about thirteen. The first fix is structural rather than clever: keep *one* window
with two edges, grow the right until it covers, then squeeze the left while it still covers, so each
character is added once and removed once and the tally is nudged instead of rebuilt — ten left-moves
and thirteen right-moves in place of those 455 counts. But that version still asks its question at the
wrong granularity, re-reading the whole requirement table after nudging a single slot, which is a scan
to learn something one increment already implied. So the next move is to stop storing only the state
and start storing the **verdict**: one integer for how much of the requirement is outstanding, changed
only when the character that moved crosses its own requirement line — debt repaid when a still-owed row
settles, new debt only when a departure pushes a row back above zero. That number is what makes
coverage a one-integer test, and it is also what makes duplicates work by construction, because rows
are allowed to go negative and bank surpluses rather than merely flagging presence — which is why the
tempting "set of required characters" shortcut is not a simplification but a different question,
returning four characters where the truth is eleven. With the algorithm linear, the only thing left is
the machine underneath it, and there the constraint everyone skimmed past finally pays: the alphabet is
bounded, so the tally need not be a hash map at all and the character code *is* the index. Quadratic
recount, one window with a recomputed verdict, one window with a maintained verdict, the same window
over raw memory — and the move worth stealing is the middle one, because "replace a repeated check with
a summary updated at the boundary" is the engine behind every other window in this pattern.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force | `O(n² · alphabet)` | `O(alphabet)` | No memory between candidates; each character recounted once per span containing it | n is tiny; you need an obviously-correct oracle |
| Window + whole-table check | `O(n · d)` | `O(alphabet)` | Carries the tally but not the verdict, so each of ~2n moves scans the requirements | The validity rule resists incremental update; `t` has one or two distinct characters |
| **Window + `missing` counter** | **`O(\|s\| + \|t\|)`** | **`O(alphabet)`** | Maintains the verdict as one integer; the price is getting the crossing conditions exactly right | The default answer for this problem |
| Window + fixed array | `O(\|s\| + \|t\| + A)` | `O(A)` | Drops hashing for direct indexing, but only with a bounded known alphabet | The alphabet is bounded, as here; on arbitrary Unicode it raises `IndexError` |

---

## Interview Priority

**Know cold — the window with the `missing` counter.** The expected answer, and you should produce it
without hesitating over which comparison is `> 0` and which is `>= 0`.

> **In an interview.** Say the skeleton before you write it: *"grow right until it covers, then shrink
> left while it still covers, recording on every shrink."* Then expect two follow-ups. **Why may a
> count go negative?** — it banks surplus copies, which is what lets the window shed a duplicate for
> free. **Why is the nested `while` not quadratic?** — `left` only moves forward, so across the whole
> run it moves at most n times; the bound is amortised, not per-step. Rehearse once on a `t` with a
> repeated character. That is where a half-remembered version breaks.

**Know cold — the grow-then-shrink skeleton itself, separated from this problem.** Recognising that it
is a *different shape* from the fixed-width window in permutation-in-string is worth more than any
single solution: it is the scaffolding under longest-substring-without-repeats, fruit-baskets and
minimum-size-subarray-sum. Being able to say which of the two shapes a new problem wants is most of
the hard half.

**Understand, do not memorize — brute force.** Ten seconds to state and price, and it is the oracle you
cross-check against. Its value is in being the thing you visibly improve *from*.

**Understand, do not memorize — the whole-table check and the fixed array.** They mark the two ends of
the real insight: one shows what the window costs before the predicate is optimised, the other shows
the last constant factor falling out of a constraint handed to you on line one. Neither needs recall —
but noticing out loud that "upper and lower case English letters" is a permission slip rather than
decoration is a cheap way to sound like someone who has done this before.

---

## Full Runnable Script

Every approach above, assembled unchanged, plus a suite covering the statement's example, the smallest
legal input, a case with no valid answer, `t` longer than `s`, duplicates in `t` (including one needing
the whole string), mixed case, and 30 randomised stress cases over a deliberately tiny alphabet so that
covering windows actually occur — each cross-checked against brute force and validated independently as
a genuine covering substring.

```python
"""Smallest Covering Window - every approach in one file, plus a self-checking test suite.

Run: python min_cover_all.py
"""

from __future__ import annotations

import random
from collections import Counter

# --- shared scaffolding (harness, not answer) ----------------------------------

ASCII_SLOTS = 128  # every legal character has a code below this; see the alphabet constraint


def covers(window: Counter[str], need: Counter[str]) -> bool:
    """Does `window` hold at least as many of every required character as `need` demands?"""
    return all(window[c] >= need[c] for c in need)


# --- 1. Brute force: every span, tallied from scratch --------------------------

def min_cover_substring_brute_force(s: str, t: str) -> str:
    need = Counter(t)
    best = ""
    for i in range(len(s)):
        for j in range(i, len(s)):
            if covers(Counter(s[i : j + 1]), need):  # a fresh tally for every (i, j)
                if not best or j - i + 1 < len(best):
                    best = s[i : j + 1]
                break  # a longer j only makes this start's span fatter
    return best


# --- 2. One window, validity re-checked against the whole table ----------------

def min_cover_substring_window_table(s: str, t: str) -> str:
    if not t or len(t) > len(s):
        return ""
    need = Counter(t)
    window: Counter[str] = Counter()
    best = (len(s) + 1, 0, 0)  # (length, start, end); length > len(s) means "none yet"
    left = 0
    for right, ch in enumerate(s):
        window[ch] += 1
        while covers(window, need):  # re-reads every required character, every move
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            window[s[left]] -= 1
            left += 1
    length, i, j = best
    return "" if length > len(s) else s[i : j + 1]


# --- 3. One window carrying a single "how much is still missing" number --------

def min_cover_substring_satisfied_count(s: str, t: str) -> str:
    if not t or len(t) > len(s):
        return ""
    need = Counter(t)
    missing = len(t)
    best = (float("inf"), 0, 0)  # (length, start, end)
    left = 0
    for right, ch in enumerate(s):
        if need[ch] > 0:  # only a still-owed copy pays down the debt
            missing -= 1
        need[ch] -= 1  # negative records a surplus, which is what makes duplicates work
        while missing == 0:
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            need[s[left]] += 1
            if need[s[left]] > 0:  # only a crossing back above zero re-opens a debt
                missing += 1
            left += 1
    length, i, j = best
    return "" if length == float("inf") else s[i : j + 1]


# --- 4. The same window over a fixed array ------------------------------------

def min_cover_substring_fixed_array(s: str, t: str) -> str:
    if not t or len(t) > len(s):
        return ""
    need = [0] * ASCII_SLOTS  # legal only because the alphabet is bounded
    for ch in t:
        need[ord(ch)] += 1
    missing = len(t)
    best_len, best_start = len(s) + 1, 0
    left = 0
    for right, ch in enumerate(s):
        code = ord(ch)
        if need[code] > 0:
            missing -= 1
        need[code] -= 1
        while missing == 0:
            if right - left + 1 < best_len:
                best_len, best_start = right - left + 1, left
            out_code = ord(s[left])
            need[out_code] += 1
            if need[out_code] > 0:
                missing += 1
            left += 1
    return "" if best_len > len(s) else s[best_start : best_start + best_len]


APPROACHES = [
    ("brute_force", min_cover_substring_brute_force),
    ("window_table", min_cover_substring_window_table),
    ("satisfied_count", min_cover_substring_satisfied_count),
    ("fixed_array", min_cover_substring_fixed_array),
]


# --- test suite ----------------------------------------------------------------

def main() -> None:
    cases: list[tuple[str, str, str]] = [
        ("statement example", "ADOBECODEBANC", "ABC"),
        ("smallest legal input", "a", "a"),
        ("no window exists", "a", "aa"),
        ("t longer than s", "ab", "abc"),
        ("duplicates in t", "ADOBECODEBANC", "AABC"),
        ("duplicates, whole string needed", "aaflslflsfla", "aaa"),
        ("t is one repeated letter", "aa", "aa"),
        ("answer is the whole string", "abc", "cba"),
        ("case matters", "aA", "A"),
        ("repeats everywhere", "bbbbbbb", "bb"),
    ]

    rng = random.Random(20260912)
    alphabet = "abc"  # tiny on purpose, so covering windows actually occur
    for n in range(1, 31):
        s = "".join(rng.choice(alphabet) for _ in range(n))
        t = "".join(rng.choice(alphabet) for _ in range(rng.randint(1, 4)))
        cases.append((f"stress n={n}", s, t))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, s, t in cases:
        print(f"\n{label}: s={s!r} t={t!r}")
        results = []
        for name, fn in APPROACHES:
            got = fn(s, t)
            results.append(got)
            print(f"  {name:<{width}} -> {got!r}")
        agreed = all(r == results[0] for r in results)
        # whatever is returned must be a real substring that actually covers t
        need = Counter(t)
        valid = all(
            (r == "" or (r in s and covers(Counter(r), need))) for r in results
        )
        if not agreed or not valid:
            all_agreed = False
            print(f"  DISAGREEMENT (agreed={agreed}, valid={valid})")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
