# Longest Substring Without Repeats — explained

## Understanding the Problem

You are given a string. Find the longest stretch of it — **contiguous**, so characters you keep must
sit next to each other in the original — in which no character appears twice. Return that stretch's
length, not the stretch itself.

**The core question:** for each position you could end a stretch at, how far back can the stretch
start before a character repeats? The naive approach is slow because it answers that by **rebuilding
each candidate stretch from scratch** and re-checking it character by character, so the same
characters get re-examined once for every stretch that contains them.

### The constraints, and what each one unlocks

| Constraint | What it unlocks |
|---|---|
| `0 <= s.length <= 5 * 10^4` | Fifty thousand characters. **This is the constraint that kills brute force**: `O(n³)` on `5 * 10^4` is `10^14` operations, and even the `O(n²)` rung is `10^9`. It also permits `0`, so the **empty string is legal** and the answer for it is `0` — a loop that assumes at least one character will crash on the first hidden test. |
| `s` holds letters, digits, symbols and spaces | The alphabet is wider than lowercase English, so `[0] * 26` is wrong. Note what this does *not* promise: it does not say the characters are ASCII. **This is the constraint the last rung leans on**, and because it is not airtight, that rung needs a fallback rather than an assumption. |
| the answer is a **contiguous** substring, not a subsequence | You may not skip characters to dodge a repeat. This is what makes a *window* — one continuous stretch with two edges — the natural shape, instead of a selection problem. |

Nothing promises the string has any repeats at all (`"abcdefg"` is legal, and the answer is its whole
length), and nothing promises it has more than one distinct character (`"bbbb"` is legal, and the
answer is `1`, not `0` — a single character is a perfectly good repeat-free stretch).

### The worked example, and why it is not the statement's

Every section below traces the same input:

```
s = "tmmzuxt"        answer: 5   ("mzuxt", indices 2 through 6)
```

The statement's own example, `"abcabcbb"`, is in the test suite, but it is a poor *teaching* input:
every approach gets it right, including two of the buggy ones in this document. `"tmmzuxt"` is seven
characters long and exercises three separate things — a repeat that sits immediately next to its twin
(`mm`), a repeat separated by four characters (`t…t`), and the one detail that breaks more
implementations of this problem than anything else, which is what happens when the second `t` arrives
and the *first* `t` is no longer inside the window at all.

Index the string once, and keep it to hand:

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| character | `t` | `m` | `m` | `z` | `u` | `x` | `t` |

---

## Approach 1 — Brute force: test every substring

### The idea

*How do I know a stretch has no repeats?* Take it and look. Generate every substring — every start
paired with every end at or after it — check each one for a duplicate, and remember the longest that
passes.

### How to think about it

> **Intuition.** Imagine cutting the string into every possible ribbon: start at character 0 and cut
> ribbons of length 1, 2, 3, up to the whole string; then start at character 1 and do it again; and so
> on. For each ribbon you lay it on the table and check whether any letter appears twice. The check
> itself is cheap and obvious — drop the characters into a bag that refuses duplicates, and if the bag
> ends up smaller than the ribbon, something was thrown away. What makes this slow is not the check
> but the cutting: the ribbon `tmmz` and the ribbon `tmmzu` share four characters, and this method
> re-examines all four.

### Worked example

`s = "tmmzuxt"`. Twenty-eight substrings get built and checked. Collapsing them by start, here is the
longest clean ribbon from each:

| start | ribbons tried | first ribbon with a repeat | longest clean from this start | running `best` |
|---|---|---|---|---|
| 0 | `t`, `tm`, `tmm`, `tmmz`, … | `tmm` (two `m`s) | `tm`, length `2` | `2` |
| 1 | `m`, `mm`, `mmz`, … | `mm` | `m`, length `1` | `2` |
| 2 | `m`, `mz`, `mzu`, `mzux`, `mzuxt` | none — reaches the end clean | `mzuxt`, length **`5`** | **`5`** |
| 3 | `z`, `zu`, `zux`, `zuxt` | none | `zuxt`, length `4` | `5` |
| 4 | `u`, `ux`, `uxt` | none | `uxt`, length `3` | `5` |
| 5 | `x`, `xt` | none | `xt`, length `2` | `5` |
| 6 | `t` | none | `t`, length `1` | `5` |

Answer `5`. Notice row 0: after discovering that `tmm` has a repeat, this method goes on to build and
check `tmmz`, `tmmzu`, `tmmzux` and `tmmzuxt` anyway — four more ribbons that cannot possibly be
clean, because they all still contain `tmm`. Deleting exactly that waste is the next rung.

### Code

```python
def longest_unique_substring_brute_force(s: str) -> int:
    best = 0
    for start in range(len(s)):
        for stop in range(start, len(s)):
            window = s[start : stop + 1]
            if len(set(window)) == len(window):  # a set drops repeats, so a shorter set means a repeat
                best = max(best, len(window))
    return best
```

### Common mistake

> **Watch out.** Writing the inner loop as `range(start + 1, len(s))`. The misconception is that a
> "substring" needs at least two characters to be worth checking — that a single character is a
> degenerate case rather than a real answer. It is a real answer: `"bbbb"` has no repeat-free stretch
> longer than one character, and the expected output is `1`. With the off-by-one, `"bbbb"` returns `0`
> and `"a"` returns `0`. It passes the worked example (`5` either way) and it passes the statement's
> example, so nothing in the problem description will catch it. The rule that prevents it: when a loop
> enumerates windows, check what the **smallest** window it can produce is, and whether that is the
> smallest window the problem allows.

### Complexity and when to use this

**Time `O(n³)`, space `O(n)`.** The `n²` is the number of substrings; the third factor is the check,
which copies the substring and builds a set of it, both linear in its length. The space is that one
temporary set, at most as large as the string.

Use it as the oracle, and nowhere else. In the test suite below it is the independent definition that
the four faster approaches are cross-checked against — it embodies "no repeated character" so directly
that it is hard to get wrong, which is exactly the property you want in a reference implementation.

---

## Approach 2 — Grow from each start until a repeat appears  *(an addition — not in the data file's ladder)*

### The idea

*Once a stretch has a repeat, every longer stretch from the same start has it too — so why keep
going?* Stop. For each start, extend right one character at a time, adding to a set as you go, and
break the moment the incoming character is already in the set.

This fixes brute force's most visible waste — **it keeps building longer ribbons from a start that has
already failed, and it rebuilds each ribbon's set from scratch instead of extending the last one.**

### How to think about it

> **Intuition.** Pick a starting character and walk right, dropping each character into a bag as you
> pass it. The moment you reach a character already in the bag, this start is finished — nothing
> further right can help, because the offending pair is behind you and will be inside every longer
> stretch. Record how far you got, empty the bag, move the start one to the right, and walk again.
> The win over brute force is that each walk extends one set rather than building a new one per
> length; the remaining loss is that each walk starts its bag empty, so the characters between the old
> start and the new one get re-added every single time.

### Worked example

`s = "tmmzuxt"`. One walk per start, each carrying its own set:

| start | characters added, in order | stopped because | reach | running `best` |
|---|---|---|---|---|
| 0 | `t`, `m` | index 2 is `m`, already in the bag | `2` | `2` |
| 1 | `m` | index 2 is `m`, already in the bag | `1` | `2` |
| 2 | `m`, `z`, `u`, `x`, `t` | ran out of string | **`5`** | **`5`** |
| 3 | `z`, `u`, `x`, `t` | ran out of string | `4` | `5` |
| 4 | `u`, `x`, `t` | ran out of string | `3` | `5` |
| 5 | `x`, `t` | ran out of string | `2` | `5` |
| 6 | `t` | ran out of string | `1` | `5` |

Twenty characters examined in total, against brute force's twenty-eight substring constructions —
and the answer is the same. But read the last four rows: the walks from starts 3, 4, 5 and 6 each
re-walk a tail that the walk from start 2 already covered, and each one rediscovers that `z`, `u`, `x`
and `t` are distinct. Four separate walks confirming a fact that one walk had established. **That**
is the redundancy the sliding window deletes.

### Code

```python
def longest_unique_substring_grow_from_each_start(s: str) -> int:
    best = 0
    for start in range(len(s)):
        inside: set[str] = set()
        for stop in range(start, len(s)):
            if s[stop] in inside:  # this start can reach no further
                break
            inside.add(s[stop])
            best = max(best, stop - start + 1)
    return best
```

### Common mistake

> **Watch out.** Guarding only the insertion instead of stopping the walk — writing
> `if s[stop] not in inside: inside.add(s[stop])` and letting the loop continue. The half-formed idea
> is that the set is the thing being protected, so guarding the set is enough. But the set is only
> bookkeeping; the thing being measured is the **window length**, and `stop - start + 1` keeps growing
> whether or not the character was added. The walk sails straight past the repeat and reports a stretch
> that contains it: on the worked example it returns `7`, the whole string, and on `"abcabcbb"` it
> returns `8`. A repeat must end the walk, not merely fail to be recorded.

### Complexity and when to use this

**Time `O(n²)`, space `O(min(n, alphabet))`.** The time is `n` starts, each walking up to `n`
characters with `O(1)` set operations — much better than `O(n³)` because the per-step check is now
constant rather than linear, but still quadratic because each start restarts from an empty set. The
space is one set, which cannot hold more distinct characters than the alphabet contains.

Use it when the window's rule is **not reversible** — and that condition is the real lesson here. A
sliding window requires that you can *remove* a character from the left and correctly restore the
earlier state. That works for "no duplicates" and for counting sums, and it fails for rules like "the
window must contain a palindrome", where undoing the left edge is not well defined. When you meet a
window problem where shrinking is impossible, this restart-per-start shape is the honest fallback.

---

## Approach 3 — One window, a set, and a left edge that shrinks

### The idea

*When the start moves right by one, must the end go back to the beginning?* No — it never needs to go
backwards at all. Keep one window with two edges. Push the right edge forward one character; if that
character is already inside, drop characters off the left until it is not; record the length.

This fixes the previous rung's weakness — **it throws away the entire window every time the start
moves, and rebuilds a tail that was already known to be repeat-free.**

### How to think about it

> **Intuition.** Hold two fingers on the string, marking the two ends of a stretch you are keeping
> honest: no character inside it appears twice, ever, after every step. The right finger always moves
> forward — that is the character you are considering adding. If adding it would break the promise,
> the left finger walks forward, dropping characters out of the window one at a time, until the twin
> of the incoming character has been dropped and the promise can be kept again. Then you add the
> character and note how wide the window is. Neither finger ever moves left, which is why this is one
> pass and not `n` passes.

> **Why it works.** Two halves. *Correctness*: the window contains no duplicate after every step — the
> shrinking loop guarantees it before the insertion and the insertion adds a character that is now
> absent — so every length you record is a legal answer; and for each right edge, the loop leaves the
> left edge at the **earliest** position that keeps the window clean, so no legal stretch ending there
> is longer than the one you measured. Take the maximum over all right edges and you have taken the
> maximum over all legal stretches. *Cost*: `left` and `right` each only ever increase, and neither
> passes `n`, so the total number of moves is at most `2n` however deeply nested the loops look. The
> inner `while` does not multiply the outer `for` — it shares a budget with it.

### Worked example

`s = "tmmzuxt"`. The full state at every step. `window` is `s[left..right]`.

| `right` | char | shrinking done first | `left` after | `inside` after | window | length | `best` |
|---|---|---|---|---|---|---|---|
| 0 | `t` | none | `0` | `{t}` | `t` | `1` | `1` |
| 1 | `m` | none | `0` | `{t, m}` | `tm` | `2` | `2` |
| 2 | `m` | **twice**: drop `t` (left→1), drop `m` (left→2) | `2` | `{m}` | `m` | `1` | `2` |
| 3 | `z` | none | `2` | `{m, z}` | `mz` | `2` | `2` |
| 4 | `u` | none | `2` | `{m, z, u}` | `mzu` | `3` | `3` |
| 5 | `x` | none | `2` | `{m, z, u, x}` | `mzux` | `4` | `4` |
| 6 | `t` | none — `t` was dropped back at step 2 | `2` | `{m, z, u, x, t}` | `mzuxt` | **`5`** | **`5`** |

Answer `5`. Two rows are doing the teaching here.

**Row 2** is why the shrinking is a `while` and not an `if`: the incoming `m` at index 2 has its twin
at index 1, but the left edge is sitting at 0, so *two* characters have to leave before the window is
clean. One removal would drop the `t` and leave the duplicate `m` sitting inside.

**Row 6** is the quiet one. The incoming `t` has a twin at index 0 — but index 0 left the window four
steps ago, so there is no conflict and the window simply grows to its widest. The set knows this for
free, because the `t` was physically removed from it. Remember that, because the next rung replaces
the set with a table of indices and **loses that property**, which is where the famous bug lives.

### Code

```python
def longest_unique_substring_set_window(s: str) -> int:
    inside: set[str] = set()
    left = 0
    best = 0
    for right, ch in enumerate(s):
        while ch in inside:  # while, not if: the twin may be several steps in from the left
            inside.remove(s[left])
            left += 1
        inside.add(ch)
        best = max(best, right - left + 1)
    return best
```

### Common mistake

> **Watch out.** Writing `if ch in inside:` instead of `while ch in inside:`. The misconception is
> that one duplicate needs one removal — that the edge moves by one because the problem is one
> character. What the edge actually has to do is move **past the twin**, and the twin can be anywhere
> in the window, so the number of removals is however many characters sit at or before it. With `if`,
> the loop drops one character, then adds the incoming one to a set that still contains its twin, and
> the window is silently corrupt from then on. On the worked example it returns `6` instead of `5`; on
> the four-character `"abba"` it returns `3` instead of `2`, and you can check by hand that no
> three-character stretch of `"abba"` is repeat-free. Nothing raises an error, because the set is
> perfectly happy — it is the *invariant* that broke, not the data structure.

### Complexity and when to use this

**Time `O(n)`, space `O(min(n, alphabet))`.** The time comes from the shared budget argument above:
every character enters the window exactly once and leaves at most once, so the total work across both
loops is at most `2n` set operations. The space is the set, which is bounded by the smaller of the
string's length and the alphabet's size — for ASCII text, a constant.

**This is the one to remember**, over the marginally faster jump version, and the reason is not speed.
It is that the rule fits in one sentence you can say while typing — *grow right, shrink left until the
window is clean* — and it needs no index arithmetic to be correct. The jump version is `O(n)` too; it
just does fewer operations per character, and it buys that with the one piece of bookkeeping that most
often goes wrong.

---

## Approach 4 — Last-seen jump

### The idea

*When a repeat appears, the left edge ends up just past the twin — why walk there one step at a
time?* Remember each character's most recent index in a map. Then the edge can be assigned directly:
one position past wherever the incoming character was last seen.

This fixes the previous rung's weakness — **the shrinking loop removes characters one by one to reach
a destination it could have computed in a single step.**

### How to think about it

> **Intuition.** Instead of a bag holding what is inside the window, keep a notebook with one line per
> character: *the last place I saw you*. When a character arrives and the notebook says you saw it at
> index `k`, the window has to start at `k + 1` at the earliest — you can jump the left edge straight
> there rather than shuffling it. The catch, and it is the whole difficulty of this rung, is that the
> notebook **remembers characters the window has already let go**. A bag forgets; a notebook does not.
> So the entry you read may be describing a sighting from long before the window began, and acting on
> it would drag the left edge *backwards* into territory you have already ruled out.

> **Why it works.** The left edge must never decrease — that is the invariant that makes this linear
> and correct at the same time. Guarding the jump with `last[ch] >= left` enforces it directly: a
> recorded index that is at or after the current edge is a genuine conflict inside the window and the
> edge moves forward; anything earlier is a ghost, already outside, and the edge stays put. Written as
> `left = max(left, last[ch] + 1)` it is the same statement in one line, and that formulation is worth
> preferring precisely because it makes "never backwards" impossible to forget.

### Worked example

`s = "tmmzuxt"`. The notebook is `last`, mapping character to its most recent index.

| `right` | char | `last[ch]` before | `>= left`? | `left` after | `last` after | length | `best` |
|---|---|---|---|---|---|---|---|
| 0 | `t` | not recorded | — | `0` | `{t: 0}` | `1` | `1` |
| 1 | `m` | not recorded | — | `0` | `{t: 0, m: 1}` | `2` | `2` |
| 2 | `m` | `1` | `1 >= 0` **yes** — jump | `2` | `{t: 0, m: 2}` | `1` | `2` |
| 3 | `z` | not recorded | — | `2` | `{t: 0, m: 2, z: 3}` | `2` | `2` |
| 4 | `u` | not recorded | — | `2` | `… u: 4` | `3` | `3` |
| 5 | `x` | not recorded | — | `2` | `… x: 5` | `4` | `4` |
| 6 | `t` | `0` | `0 >= 2` **no** — stale, do not move | `2` | `… t: 6` | **`5`** | **`5`** |

Answer `5`. Compare row 2 with the same row in Approach 3: what took two removals there is one
assignment here. And then compare row 6 — this is the row the whole document has been building
toward. The notebook still holds `t: 0` from the very first character, long after index 0 fell out of
the window. The window currently runs from index 2, so that sighting is **irrelevant**, and the guard
is what says so. Without it, `left` would be set to `0 + 1 = 1`, dragging the edge backwards to
include the `m` at index 1 — a window `"mmzuxt"` containing two `m`s, reported as length `6`.

### Code

```python
def longest_unique_substring_last_seen_jump(s: str) -> int:
    last: dict[str, int] = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:  # >= left, or a stale index drags the edge backwards
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best
```

### Common mistake

> **Watch out.** Dropping the `last[ch] >= left` half of the condition and jumping on any recorded
> sighting. This is the single most common bug in this problem, and the misconception behind it is
> precise: people carry over the mental model from Approach 3, where the set contained **only what was
> in the window**, and assume the map does too. It does not — the map is a record of the whole string
> so far, and it is never pruned, so "I have seen this character" and "this character is in my window"
> stop being the same question. On the worked example the unguarded version returns `6` instead of
> `5`; on `"abba"` it returns `3` instead of `2`. It passes `"abcabcbb"` — both give `3` — which is
> exactly why the statement's example is not the worked example in this document. The fix that also
> prevents the misconception is to write the line as `left = max(left, last[ch] + 1)`, which makes the
> monotonicity of `left` a property of the code rather than a fact you have to remember.

### Complexity and when to use this

**Time `O(n)`, space `O(min(n, alphabet))`.** The time is one pass with one map read, one map write
and one comparison per character — no inner loop at all, which is the constant-factor gain over
Approach 3, not an asymptotic one. The space is the map, which holds one entry per **distinct**
character in the whole string, not per character in the window — a real, if usually small, difference
from the set version, and one worth stating out loud since the map is never pruned.

Use it when the per-character cost genuinely matters, or when the window's rule needs the position
rather than just the presence — which is most of the harder members of this family. It is also the
version to reach for when the shrink step would be expensive to undo one at a time. For an interview,
write Approach 3 first and offer this as the refinement, together with the guard and the reason
for it.

---

## Approach 5 — Last-seen jump over a fixed table  *(an addition — not in the data file's ladder)*

### The idea

*A hash map is a general tool for arbitrary keys — but are these keys arbitrary?* If every character
fits in a known, small code range, replace the map with a plain list indexed by the character's code.
The algorithm is identical to Approach 4; the lookup becomes a single memory read with no hashing.

This fixes no complexity weakness — both are `O(n)` — but a **constant-factor** one: every map
operation costs a hash computation, a bucket probe, and a comparison on collision.

### How to think about it

> **Intuition.** A hash map is a cloakroom with a clerk: you hand over a key, the clerk computes
> where it belongs, walks to that shelf, and checks the label matches. A fixed table is a cloakroom
> where every coat already has a numbered peg and the number is printed on the coat — no clerk, no
> computing, just walk to peg `ord(ch)`. Nothing about the algorithm changes; the notebook of
> last-seen positions is the same notebook, with its pages pre-numbered instead of looked up. The
> price is that the pegs must all exist in advance, so you have to know how many characters there
> could possibly be — and if a character turns up with a number past the end of the rack, there is
> nowhere to hang it.

### What must be true, and what breaks if it is not

The assumption is that every character's code point is below `ASCII_SLOTS`, here `128`. The problem
says `s` holds "letters, digits, symbols and spaces", which *suggests* ASCII but does not guarantee
it — an accented letter, an emoji or any non-Latin script has a code point far above `128`. Indexing
a 128-slot list with `ord('é')` (`233`) raises `IndexError` in Python; in C++ with a raw array it
writes past the end and corrupts memory, which is the same bug with no error message.

So the version below **measures the assumption before relying on it** and falls back to the map when
it fails. That is honest engineering rather than a clean win, and it is the pattern to copy: when a
constraint is implied rather than promised, check it in one pass and keep the general version behind
it.

### Worked example

`s = "tmmzuxt"` — all ASCII, so the table is used. The decisions are identical to Approach 4; only
the lookup changed. The relevant code points are `t` = `116`, `m` = `109`, `z` = `122`, `u` = `117`,
`x` = `120`, and every slot starts at `UNSEEN` = `-1`.

| `right` | char | slot | value in slot | `>= left`? | `left` after | slot set to | length | `best` |
|---|---|---|---|---|---|---|---|---|
| 0 | `t` | `116` | `-1` | `-1 >= 0` no | `0` | `0` | `1` | `1` |
| 1 | `m` | `109` | `-1` | no | `0` | `1` | `2` | `2` |
| 2 | `m` | `109` | `1` | `1 >= 0` **yes** | `2` | `2` | `1` | `2` |
| 3 | `z` | `122` | `-1` | no | `2` | `3` | `2` | `2` |
| 4 | `u` | `117` | `-1` | no | `2` | `4` | `3` | `3` |
| 5 | `x` | `120` | `-1` | no | `2` | `5` | `4` | `4` |
| 6 | `t` | `116` | `0` | `0 >= 2` **no** — stale | `2` | `6` | **`5`** | **`5`** |

Answer `5`. The `UNSEEN` sentinel of `-1` is quietly doing double duty: because `left` is never
negative, `seen_at >= left` is automatically false for a character never seen, so "never seen" and
"seen before the window" collapse into the same branch and the `ch in last` test of Approach 4
disappears.

### Code

```python
# Used only by this approach: one slot per code point it is willing to index
# directly, and the marker for "this character has never been seen".
ASCII_SLOTS: int = 128
UNSEEN: int = -1


def longest_unique_substring_ascii_table(s: str) -> int:
    if any(ord(ch) >= ASCII_SLOTS for ch in s):  # the assumption failed; fall back
        return longest_unique_substring_last_seen_jump(s)
    last = [UNSEEN] * ASCII_SLOTS
    left = best = 0
    for right, ch in enumerate(s):
        seen_at = last[ord(ch)]
        if seen_at >= left:  # UNSEEN is -1 and left is never negative, so this covers "never seen"
            left = seen_at + 1
        last[ord(ch)] = right
        best = max(best, right - left + 1)
    return best
```

### Common mistake

> **Watch out.** Filling the table with `0` instead of `UNSEEN`. The misconception is that `0` means
> "empty", which is true of a *counter* table and false of an *index* table — index `0` is a real
> position, the first character of the string. Every unseen character then claims to have been seen at
> index `0`, so the very first character of the string pushes `left` to `1` and is excluded from every
> window. On `"abcdefg"`, which has no repeats at all, it returns `6` instead of `7`. On the worked
> example it happens to return `5`, the right answer, because the answer there does not include index
> `0` — so this bug survives the trace in this document and is caught only by a string whose best
> stretch starts at the beginning. Use a sentinel that the data cannot produce: `-1` for an index
> table, or a separate array of "occupied" flags.

### Complexity and when to use this

**Time `O(n + A)`, space `O(A)`, where `A` is the alphabet size** — here `128`. The `A` term is
allocating and clearing the table, invisible at `128` slots and fatal if someone set it to the full
Unicode range of over a million. The per-character work is one `ord`, one list read and one list
write, several times cheaper in practice than the hash operations they replace, though both are
`O(1)`.

Use it when the alphabet is genuinely and provably bounded — lowercase letters, digits, DNA bases, a
small enum — and say so out loud rather than assuming it. For this problem the bound is *implied* and
not promised, which is why the guard exists, and why in an interview the right move is to name the
technique, state the assumption it needs, and let the interviewer tell you whether it holds. Naming a
technique and correctly qualifying it is a stronger answer than either using it blindly or not knowing
it exists.

---

## The Overall Arc

Every rung here is a different answer to one question: **where should the window's left edge go when a
repeat appears?** Brute force never asks it, because it has no window — it builds every substring from
scratch and re-checks characters it has already cleared, paying `O(n³)` to rediscover facts one step
at a time. The first improvement is to notice that a start which has already failed can never succeed
by growing, so each start becomes a single walk that stops at its first repeat, and the cost falls to
`O(n²)`; but the trace of that version shows the remaining waste plainly, because four consecutive
starts each re-walk the same clean tail and each independently rediscovers that its characters are
distinct. Killing that means never moving the right edge backwards — one window, two edges, both
travelling in the same direction — and once the edges only ever advance, the whole scan is `O(n)`
however nested the loops look, because `left` and `right` share a budget of `n` moves each rather than
multiplying. The set version answers the question by shrinking: drop characters off the left, one at a
time, until the incoming character's twin has been evicted, which is correct by construction and needs
no arithmetic at all, since the set contains exactly what is inside the window. The last rung replaces
that walk with a jump — a notebook of last-seen positions lets the edge be assigned straight past the
twin instead of stepping there — and in doing so it quietly breaks the property the set version relied
on, because the notebook keeps sightings the window has long since discarded. That is where the bug
worth naming lives: a stale index describes a conflict that is no longer inside the window, and acting
on it drags the left edge *backwards* into ground already ruled out, producing a window that contains
the very repeat it was supposed to exclude. Guarding the jump — `left = max(left, last[ch] + 1)` —
restores the invariant as a property of the code rather than a fact to remember, and it is the same
guard every "last seen" window needs, in this problem and in the dozen that share its shape. The final
step stops improving the algorithm and improves the machine under it: if the alphabet is small and
bounded, the character code *is* the hash, and a plain table replaces the map — with a check first,
because here that bound is implied rather than promised.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force, every substring | `O(n³)` | `O(n)` | No memory between candidates, so every character is re-checked many times | `n` is tiny; as the oracle the fast versions are tested against |
| Grow from each start | `O(n²)` | `O(min(n, A))` | Stops early per start, but throws the whole window away when the start moves | The window's rule cannot be undone one character at a time, so shrinking is impossible |
| **One window and a set** | **`O(n)`** | **`O(min(n, A))`** | **Optimal, and needs no index arithmetic — the set holds exactly the window** | **The default. The version to write first and to say out loud** |
| Last-seen jump | `O(n)` | `O(distinct chars)` | Fewer operations per character, bought with a map that outlives the window | Per-character cost matters; the rule needs positions, not just presence |
| Jump over a fixed table | `O(n + A)` | `O(A)` | Drops hashing entirely, but only if the alphabet is provably bounded | A promised small alphabet — letters, digits, DNA. Here the bound is implied, so it needs a fallback |

---

## Interview Priority

**Memorise cold — the set window.** Grow right, shrink left while the window is dirty, record the
width. It is seven lines, it has no index arithmetic to get wrong, and the shared-budget argument for
why it is `O(n)` despite the nested loop is a thirty-second explanation you should have ready, because
it is the follow-up question.

**Memorise cold — the last-seen jump, and its guard.** This is the refinement an interviewer expects
after the set version, and the guard is the point of asking. Write it as
`left = max(left, last[ch] + 1)` rather than as an `if`, and be able to say in one sentence why: the
map remembers characters the window has already released, so an unguarded jump can move the left edge
backwards.

> **In an interview.** Say this, in this order. *"Brute force is every substring, `O(n³)`. But I never
> need to move the right edge backwards: I can keep one window that is always repeat-free, push the
> right edge forward, and shrink from the left whenever the incoming character is already inside. Each
> character enters and leaves at most once, so that is `O(n)`."* Then offer the refinement: *"I can
> replace the shrink loop with a jump if I remember each character's last index — but the map is not
> pruned, so it holds characters that have already left the window, and the jump has to be
> `max(left, last[ch] + 1)` or a stale index drags the edge backwards."* Name `"abba"` as the case that
> catches it. The usual follow-ups are "return the substring, not the length" (remember `left` when
> `best` improves) and "at most `k` distinct characters instead of zero repeats" — same window, a
> count map instead of a set, shrink while the map has more than `k` keys.

**Understand but do not memorise — grow-from-each-start.** Worth understanding for the one thing it
teaches: a sliding window is only available when the window's rule can be *undone* from the left. When
it cannot, restarting per start is the honest fallback, and knowing that boundary is more valuable
than the code.

**Understand but do not memorise — the fixed table.** Nothing to recall beyond the recognition:
bounded alphabet means the character code can be the index. What is worth practising is the habit of
stating the assumption and checking it, since here the constraints imply ASCII without promising it.

**Understand but do not memorise — brute force.** Ten seconds of naming and rejecting in an interview,
and a real job in a test suite as the definition everything faster is checked against.

---

## Full Runnable Script

Every approach above, assembled — the same functions, not a second implementation — plus a test suite
covering the worked example, the statement's example, an all-same-character string, the **empty
string**, a single character, `"abba"`, a string with spaces and symbols, a string with no repeat at
all, a string whose only repeat is at its two ends, a non-ASCII string that forces the table rung to
fall back, and thirty randomised stress cases cross-checked against brute force. The stress strings
are drawn mostly from a four-letter alphabet so that repeats are dense, with one wider-alphabet case;
they are capped at forty characters because the brute-force oracle is cubic.

```python
"""Longest Substring Without Repeats - every approach in one file, plus a self-checking test suite.

Run: python longest_unique_substring_all.py
"""

from __future__ import annotations

import random
import string

# Used only by the last approach: one slot per code point it is willing to index
# directly, and the marker for "this character has never been seen".
ASCII_SLOTS: int = 128
UNSEEN: int = -1


# --- 1. Brute force: test every substring --------------------------------------

def longest_unique_substring_brute_force(s: str) -> int:
    best = 0
    for start in range(len(s)):
        for stop in range(start, len(s)):
            window = s[start : stop + 1]
            if len(set(window)) == len(window):  # a set drops repeats, so a shorter set means a repeat
                best = max(best, len(window))
    return best


# --- 2. Grow from each start until a repeat appears ----------------------------

def longest_unique_substring_grow_from_each_start(s: str) -> int:
    best = 0
    for start in range(len(s)):
        inside: set[str] = set()
        for stop in range(start, len(s)):
            if s[stop] in inside:  # this start can reach no further
                break
            inside.add(s[stop])
            best = max(best, stop - start + 1)
    return best


# --- 3. One window, a set, and a left edge that shrinks ------------------------

def longest_unique_substring_set_window(s: str) -> int:
    inside: set[str] = set()
    left = 0
    best = 0
    for right, ch in enumerate(s):
        while ch in inside:  # while, not if: the twin may be several steps in from the left
            inside.remove(s[left])
            left += 1
        inside.add(ch)
        best = max(best, right - left + 1)
    return best


# --- 4. Last-seen jump ---------------------------------------------------------

def longest_unique_substring_last_seen_jump(s: str) -> int:
    last: dict[str, int] = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:  # >= left, or a stale index drags the edge backwards
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best


# --- 5. Last-seen jump over a fixed table (bounded alphabet) -------------------

def longest_unique_substring_ascii_table(s: str) -> int:
    if any(ord(ch) >= ASCII_SLOTS for ch in s):  # the assumption failed; fall back
        return longest_unique_substring_last_seen_jump(s)
    last = [UNSEEN] * ASCII_SLOTS
    left = best = 0
    for right, ch in enumerate(s):
        seen_at = last[ord(ch)]
        if seen_at >= left:  # UNSEEN is -1 and left is never negative, so this covers "never seen"
            left = seen_at + 1
        last[ord(ch)] = right
        best = max(best, right - left + 1)
    return best


APPROACHES = [
    ("brute_force", longest_unique_substring_brute_force),
    ("grow_from_each_start", longest_unique_substring_grow_from_each_start),
    ("set_window", longest_unique_substring_set_window),
    ("last_seen_jump", longest_unique_substring_last_seen_jump),
    ("ascii_table", longest_unique_substring_ascii_table),
]


# --- test suite ----------------------------------------------------------------

def main() -> None:
    cases: list[tuple[str, str]] = [
        ("worked example - the stale-index trap", "tmmzuxt"),
        ("statement example", "abcabcbb"),
        ("every character the same", "bbbb"),
        ("empty string", ""),
        ("single character", "a"),
        ("the shortest stale-index case", "abba"),
        ("answer straddles a repeat", "pwwkew"),
        ("spaces and symbols count", "a b!b a"),
        ("no repeat at all", "abcdefg"),
        ("repeat only at the ends", "abcda"),
        ("beyond ASCII - the table rung must fall back", "abééba"),
    ]

    rng = random.Random(20260912)
    for n in range(1, 30):  # the brute-force oracle is cubic: keep the stress strings short
        cases.append((f"stress n={n}", "".join(rng.choice("abcd") for _ in range(n))))
    cases.append(("stress wide alphabet n=40",
                  "".join(rng.choice(string.ascii_letters) for _ in range(40))))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, s in cases:
        print(f"\n{label}: s={s!r}")
        results = []
        for name, fn in APPROACHES:
            got = fn(s)  # strings are immutable, so no approach can corrupt another's input
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        if any(r != results[0] for r in results):
            all_agreed = False
            print("  DISAGREEMENT")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
