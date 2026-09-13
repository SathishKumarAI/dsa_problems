# Prefix Shared by Every String — explained

## Understanding the Problem

You are given a list of words. Find the longest run of characters that every single one of them
starts with. `["flower", "flow", "flight"]` all begin with `f`, and all begin with `fl`, but not all
begin with `flo` — so the answer is `"fl"`. If they share nothing at all, the answer is the empty
string.

**The core question:** how far down the words can you read before they stop agreeing? The naive
approach is slow because it guesses an answer and then checks it — it proposes a candidate prefix,
tests it against every word from character zero, and on failure proposes a shorter one, re-reading
the same leading characters once per guess.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `1 <= words.length <= 200`, `0 <= words[i].length <= 200` | The whole input is at most 40,000 characters. This is the unusual case where the ceiling is low enough that *every* approach here passes comfortably — even the quadratic-in-length brute force tops out around 8 million character comparisons. So the reason to prefer the best rung is not survival, it is **clarity** and the early exit. It also means a sort is affordable, which is why the sorting rung below is a real option rather than a curiosity. There is always at least one word, so no approach needs an empty-list branch. |
| the words are lowercase English letters | A bounded 26-letter **alphabet**. It unlocks nothing for a single query — but it is what would make a trie attractive if you had to answer many prefix questions against the same word list, since each node then gets a fixed 26-slot child table instead of a hash map. |
| the answer is bounded by the **shortest** string | This caps the real work at `n × (length of the shortest word)` however long the other words are, and it is what gives the binary-search rung its upper bound. A list holding one two-letter word can never cost more than two columns of scanning beside two hundred 200-character words. |
| a word may be **empty** | `0` is a legal length, so an empty string anywhere forces an empty answer. It is the extreme form of the early exit — settled before the first comparison — and it is the case that catches a loop which reads a character before checking one exists. |

One shape is worth noticing before reading on, because the best approach is built on it: **the answer
is always a prefix of the first word**, since it is a prefix of every word and the first word is one
of them. So the answer is not something you build — it is a slice of data you already hold, and the
only unknown is where to cut.

The worked example used in every section below is the statement's own:

```
words = ["flower", "flow", "flight"]        answer: "fl"
```

---

## Approach 1 — Guess a prefix, test it, shorten

### The idea

*How do I know whether a given piece of text is a common prefix?* Check that every word starts with
it. *And how do I find the longest one?* The answer is a prefix of the first word, so the candidates
are few — the whole first word, that minus its last character, and so on down to nothing. Try them
longest-first and return the first that survives.

### How to think about it

> **Intuition.** A stack of candidate rulers, ordered from longest to shortest. You hold up the
> longest against every word; if any word disagrees you throw that ruler away and hold up the next.
> Because you are going longest-first, the first ruler that fits every word is by definition the
> longest that does, so you can stop the instant one fits. The waste is that each new test re-reads
> the same leading characters — the `f` in `flower` is compared five separate times on the example
> below — and every later approach is a way of reading each character once.

### Worked example

`words = ["flower", "flow", "flight"]`. The candidates come from the first word, longest first.

| Try | `candidate` | `flower` starts with it? | `flow`? | `flight`? | Verdict |
|---|---|---|---|---|---|
| 1 | `"flower"` | yes | **no** | — | too long |
| 2 | `"flowe"` | yes | **no** | — | too long |
| 3 | `"flow"` | yes | yes | **no** | too long |
| 4 | `"flo"` | yes | yes | **no** | too long |
| 5 | `"fl"` | yes | yes | yes | **answer** |

Five candidate tests. Try 5 compares the `f` and the `l` of all three words — and tries 1 through 4
had already compared those same characters, four times over. That re-reading is the whole
inefficiency, and it is invisible in the result.

### Code

`_all_share` is the one decision this problem keeps making — *does every word start with this?* —
so it is lifted to module scope and reused by the binary search below rather than re-inlined.

```python
def _all_share(words: list[str], head: str) -> bool:
    """Does every word begin with `head`? The predicate two approaches are built on."""
    return all(w.startswith(head) for w in words)


def longest_common_prefix_brute_force(words: list[str]) -> str:
    if not words:
        return ""
    first = words[0]
    for length in range(len(first), -1, -1):  # longest first, so the first hit is maximal
        if _all_share(words, first[:length]):
            return first[:length]
    return ""
```

### Common mistake

> **Watch out.** The misconception is that the direction of the loop is a matter of taste — that
> growing a candidate until it fails is the mirror image of shrinking one until it passes. It is
> not. Ascending, the loop **exits holding the candidate that just failed**; descending, it exits
> holding one that passed. One of those needs an off-by-one correction and the other does not.

The natural ascending version says "grow the candidate until it fails, then return it", and
`return first[:length]` at that moment returns a candidate one character too long — `"flo"` instead
of `"fl"` on the worked example. The ascending form needs `first[:length - 1]`, or a second variable
tracking the last candidate that *succeeded*. Descending has no such correction to forget.

### Complexity and when to use this

**Time** `O(n · k²)`, **space** `O(k)`, where `k` is the length of the first word. The `k²` is the
re-reading: up to `k` candidates, and testing a candidate of length `L` costs up to `n × L`
comparisons, summing to roughly `n · k² / 2`. The space is the candidate slice.

At these constraints it runs fine, so this is not a wrong answer — it is an inelegant one. Its real
job is **oracle**: it is the most literal transcription of "the longest string every word starts
with", which is exactly what you want the clever versions checked against at the foot of this file.

---

## Approach 2 — Sort the list, then compare only the ends

### The idea

*Testing against every word on every guess is the expensive part — could two words stand in for all
of them?* Yes, once the list is in dictionary order. Sorting drives the two most dissimilar words to
the two ends, and anything those two share is shared by everything between them. This fixes brute
force's central weakness — **it re-consults all `n` words for every candidate** — by reducing "all
the words" to "two of them".

### How to think about it

> **Intuition.** Picture a shelf of alphabetised books. Reach past the middle entirely and take only
> the first book and the last one. If those two both begin `fl`, nothing on the shelf between them
> can begin otherwise — a book starting `gr` would have been shelved past the last one, not between.
> So the two ends *bracket* the shelf, and whatever they agree on, the whole shelf agrees on. You pay
> once to put the books in order, then harvest the answer from a single pair.

> **Why it works.** Dictionary order compares the first character, then the second, and so on. Take
> any middle word `m` with `ordered[0] <= m <= ordered[-1]`, and suppose `ordered[0]` and
> `ordered[-1]` share a prefix `p`. If `m` did not also start with `p`, it would differ from `p` at
> some column `i`, and that single difference would sort `m` strictly before `ordered[0]` or
> strictly after `ordered[-1]` — contradicting that it lies between them. So the prefix shared by
> the two extremes is shared by everyone, and no word in the middle need ever be read.

### Worked example

`words = ["flower", "flow", "flight"]`. First the restructuring:

| Stage | Contents |
|---|---|
| as given | `["flower", "flow", "flight"]` |
| after `sorted(words)` | `["flight", "flow", "flower"]` |
| the two ends | `a = "flight"`, `b = "flower"` |

Then one walk down the pair, `i` advancing while they agree:

| `i` | `a[i]` | `b[i]` | Agree? | prefix so far |
|---|---|---|---|---|
| 0 | `f` | `f` | yes | `"f"` |
| 1 | `l` | `l` | yes | `"fl"` |
| 2 | `i` | `o` | **no — stop** | `"fl"` ← answer |

Three character comparisons after the sort, and `"flow"` — the middle word — was never looked at
again.

### Code

```python
def _lcp_of_two(a: str, b: str) -> str:
    """The longest common prefix of exactly two strings — the primitive every rung is a way of applying."""
    i = 0
    while i < len(a) and i < len(b) and a[i] == b[i]:
        i += 1
    return a[:i]


def longest_common_prefix_sorted_ends(words: list[str]) -> str:
    if not words:
        return ""
    ordered = sorted(words)
    return _lcp_of_two(ordered[0], ordered[-1])  # the two most dissimilar strings bracket the rest
```

### Common mistake

> **Watch out.** The misconception is that "sorted" means "sorted by length", because the fact a
> reader has just learned is *the answer can never be longer than the shortest word*. That fact is
> about the answer's **length** and says nothing about its **content** — and the bracketing argument
> above is purely about content.

Sorting by length on `["ab", "xy", "abc"]` leaves `"ab"` first and `"abc"` last. Those two share
`"ab"`, so the function returns `"ab"` — while `"xy"` sits in the middle sharing nothing with
anyone and the true answer is `""`. Dictionary order is the only order in which "between these two"
implies "starts the same way".

### Complexity and when to use this

**Time** `O(n · k log n)`, **space** `O(n · k)`. The time is dominated by the sort — `O(n log n)`
comparisons, each costing up to `k` characters — while the walk afterwards adds only `O(k)`. The
space is the sorted copy.

It loses to the two rungs below for a one-off query, and earns its place for two other reasons.
The **insight** transfers: sorting converts "is this true of everything?" into "is this true of the
two extremes?", a move that reappears in interval merging and minimum-range problems. And it is the
best answer in this file when the list is **already sorted**, where the whole cost collapses to
`O(k)`.

---

## Approach 3 — Shrink one candidate across the words

### The idea

*The brute force throws away its candidate and starts fresh after each failure — could one candidate
be carried along and trimmed instead?* Yes. Hold the whole first word as the answer-so-far and, for
each later word, chop characters off the end until the answer-so-far fits. This fixes brute force's
restarts: **the candidate only ever shortens, so no length is ever reconsidered.**

### How to think about it

> **Intuition.** A pencil line drawn under the first word, marking how much of it is still believed
> to be common. Each new word can only push the line **left**, never right, because a length that
> failed for an earlier word can never come back. Walk the words once and the line finishes sitting
> on the answer.

> **Why it works.** The invariant is that after reconciling word `j`, `prefix` is exactly the
> longest common prefix of `words[0..j]`. It holds at the start (`words[0]` is its own prefix), and
> the trim loop preserves it because chopping from the right until `w.startswith(prefix)` stops at
> the first length that fits — which is precisely `_lcp_of_two(prefix, w)`. Folding pairwise is
> legal because the longest-common-prefix operation is **associative**: the shared prefix of a whole
> list is the shared prefix of (its running answer, the next word), taken in any order.

This is the version most people write first, and it is a good one. Its weakness is subtle: the trim
compares from the *start* of the word on every attempt, so a single stubborn word can cost `O(k²)`
comparisons on its own. It also holds a mutable candidate string, which in most languages means an
allocation per trim.

### Worked example

`words = ["flower", "flow", "flight"]`. Start with `prefix = "flower"`.

| Step | word being reconciled | `prefix` before | `w.startswith(prefix)`? | `prefix` after |
|---|---|---|---|---|
| 1 | `"flow"` | `"flower"` | no | `"flowe"` |
| 2 | `"flow"` | `"flowe"` | no | `"flow"` |
| 3 | `"flow"` | `"flow"` | **yes** — move on | `"flow"` |
| 4 | `"flight"` | `"flow"` | no | `"flo"` |
| 5 | `"flight"` | `"flo"` | no | `"fl"` |
| 6 | `"flight"` | `"fl"` | **yes** — move on | `"fl"` |

Answer `"fl"`. Six trim-or-accept steps, each one a full `startswith` that begins again at character
`0`. The `prefix` column never grows — that monotone leftward drift is the invariant made visible.

### Code

```python
def longest_common_prefix_horizontal(words: list[str]) -> str:
    if not words:
        return ""
    prefix = words[0]
    for w in words[1:]:
        while not w.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:  # nothing left to trim; Java's substring(0, -1) would throw here
                return ""
    return prefix
```

### Common mistake

> **Watch out.** The misconception is that `prefix in w` and `w.startswith(prefix)` are the same
> question written two ways. A **substring** test accepts the candidate appearing anywhere in the
> word; a **prefix** test demands it at position `0`. The first is usually shorter to type, which is
> why the bug gets written.

On `["abc", "xab"]` the candidate `"abc"` is not inside `"xab"`, so the substring version trims to
`"ab"` — which *is* inside `"xab"`, at position 1 — and returns `"ab"`. The true answer is `""`,
because `"xab"` does not start with `"ab"` at all. It produces plausible answers on most inputs,
which is what makes it dangerous.

### Complexity and when to use this

**Time** `O(n · k)`, **space** `O(k)`. Each word is compared against a candidate that only shrinks,
so across the run each character position is visited a bounded number of times; the pathological
case — one word forcing a trim all the way down, one character at a time — adds a `k²` term for that
word alone. The space is the candidate string, a real allocation on every trim.

Reach for it when the shared prefix is expected to be long and the words are few, since the candidate
then barely moves. It is also the natural shape for a **stream**: words arriving one at a time, folded
into a running answer — which the column scan below cannot do, because it needs every word at once.

---

## Approach 4 — Scan the columns (optimal)

### The idea

*Every rung so far compares whole strings against a candidate — what if the words were read downwards
instead of across?* Line them up and read column `0` of all of them, then column `1`, stopping the
instant one disagrees or runs out. This fixes the shrinking rung's re-reading: each character is
examined **once**, and no candidate string is built or trimmed at all.

### How to think about it

> **Intuition.** The words printed one under another, left-aligned, like a spreadsheet. Read
> straight down the first column: all `f`, fine. Down the second: all `l`, fine. Down the third:
> `o`, `o`, `i` — disagreement, so the prefix ends and you are finished. Two things end a column: a
> character that differs, or a word that has no character there because it ended. Both mean the same
> thing, and handling them in one condition is what keeps the code honest.
>
> The shift that makes this the best version is dropping the idea of *building* an answer. You are
> not accumulating a string; you are locating a **boundary** in a string you already hold. The first
> word is the ruler, the loop finds the cut, and the answer is one slice at the end.

> **Why it works.** The invariant is that column `i` is only ever reached having already proved
> every word agrees on columns `0 .. i-1`. So the moment a column fails, `first[:i]` is common to
> all words — and it is *maximal*, because column `i` itself is where agreement demonstrably stops.
> That is why the function may return immediately rather than continuing to look: there is nothing
> longer left to find.

### Worked example

`words = ["flower", "flow", "flight"]`. The first word is the ruler.

```
column:   0   1   2   3   4   5
flower    f   l   o   w   e   r
flow      f   l   o   w   –   –
flight    f   l   i   g   h   t
```

| `i` | `first[i]` | `flower` | `flow` | `flight` | Verdict | prefix so far |
|---|---|---|---|---|---|---|
| 0 | `f` | `f` ✓ | `f` ✓ | `f` ✓ | column common, continue | `"f"` |
| 1 | `l` | `l` ✓ | `l` ✓ | `l` ✓ | column common, continue | `"fl"` |
| 2 | `o` | `o` ✓ | `o` ✓ | `i` ✗ | **disagreement — cut at 2** | `"fl"` ← answer |

Nine character comparisons in total, and the walk never looked at `w`, `e`, `r`, `g`, `h` or `t`.
The early exit is the headline property, not a micro-optimisation: on `["dog", "racecar", "car"]`
this does **two** comparisons and returns `""`. The cost is proportional to the **answer**, not to
the input.

### Code

```python
def longest_common_prefix_vertical(words: list[str]) -> str:
    if not words:
        return ""
    first = words[0]
    for i in range(len(first)):
        for w in words:
            if i >= len(w) or w[i] != first[i]:  # ran out, or disagreed — the same event
                return first[:i]
    return first
```

### Common mistake

> **Watch out.** The misconception is that a word running out of characters is an **error case** to
> be patched around, separate from the real work of comparing. It is not — it is one of the two
> legitimate ways a column fails, and it belongs in the same condition as the other.

Writing only `w[i] != first[i]` crashes, because the loop is bounded by the length of the *first*
word: `["abc", "ab"]` raises `IndexError: string index out of range` at column 2. The guard must
also come **first** in the `or` — short-circuit evaluation is what stops the comparison being
attempted on a character that does not exist.

### Complexity and when to use this

**Time** `O(n · k)`, **space** `O(1)` beyond the returned slice. One comparison per word per column,
with columns bounded by the shortest word, so the real cost is `n × (length of the answer + 1)`. The
space is a loop index and nothing else — no candidate string is ever built, which is exactly what
separates it from the shrinking rung.

**This is the one to ship.** It is the shortest correct code here, it never allocates, and its early
exit makes 200 words that disagree in the first column cost 200 comparisons however long they are.
The one input where something else genuinely wins is a list that is **already sorted**, where
comparing the two ends is `O(k)` and ignores the middle entirely.

---

## Approach 5 — Binary search on the length

### The idea

*The column scan walks the answer's length one step at a time — could that length be found by
halving instead?* It could. This rung does not fix a weakness in the column scan; it is here to make
a structural property visible, and to be honest about when that property is worth exploiting.

### How to think about it

> **Intuition.** The higher-or-lower guessing game, played over *answer lengths* rather than over
> the data. You know the answer is somewhere between `0` and the length of the shortest word. Guess
> the middle length, slice that much off the first word, and ask everyone "do you all start like
> this?" — a *yes* means the answer is at least this long and the lower bound jumps up, a *no* means
> it is shorter and the upper bound drops. About `log₂ k` questions pin the cut point exactly.

> **Why it works.** The licence is **monotonicity**: if every word shares a prefix of length `4`,
> every word shares prefixes of length `3`, `2` and `1` as well, because a prefix of a common prefix
> is common. So the predicate "all words share a prefix of length `L`" is `True` for every `L` at or
> below the answer and `False` for every `L` above it — one flip, never two. That single boundary is
> the entire precondition for binary search; without it, halving converges confidently on a wrong
> number.

The honest assessment belongs here rather than in a footnote: this is **not faster** than the column
scan. Each probe costs a full `O(n · k)` sweep, so the total is `O(n · k log k)` — a `log k` factor
*worse*. The reason to learn it is the pattern, not the performance.

### Worked example

`words = ["flower", "flow", "flight"]`. The shortest word is `"flow"`, so the search range is `0` to
`4`.

| Probe | `lo` | `hi` | `mid` | `head = first[:mid]` | `_all_share`? | range after |
|---|---|---|---|---|---|---|
| 1 | 0 | 4 | 2 | `"fl"` | yes | `lo = 2`, range 2–4 |
| 2 | 2 | 4 | 3 | `"flo"` | no (`flight`) | `hi = 2`, range 2–2 |
| — | 2 | 2 | — | — | collapsed | answer `first[:2]` = `"fl"` |

Two probes against the column scan's three columns. On this tiny input that looks like a win; it is
not, because each probe re-read the leading characters of all three words — exactly the waste the
column scan had already eliminated.

### Code

```python
def longest_common_prefix_binary_search(words: list[str]) -> str:
    if not words:
        return ""
    lo, hi = 0, min(len(w) for w in words)  # the answer can never exceed the shortest word
    while lo < hi:
        mid = (lo + hi + 1) // 2  # bias up: the success branch keeps mid, so rounding down stalls
        if _all_share(words, words[0][:mid]):
            lo = mid
        else:
            hi = mid - 1
    return words[0][:lo]
```

### Common mistake

> **Watch out.** The misconception is that `mid = (lo + hi) // 2` is *the* midpoint formula —
> universal furniture you can write without thinking. The rounding direction is not decoration: it
> is bound to which branch keeps `mid` as a live candidate, and getting the pair wrong does not give
> a wrong answer, it **hangs**.

This variant keeps a candidate answer in `lo`, moving `lo = mid` on success rather than
`lo = mid + 1`. With the midpoint biased downward, `lo = 1, hi = 2` computes `mid = 1`, succeeds, and
sets `lo = 1` again — the range never shrinks. On `["aa", "aa"]` it spins forever. The rule:
whenever a branch assigns `lo = mid`, the midpoint must round **up**, so that every iteration
strictly shrinks the range on both branches.

### Complexity and when to use this

**Time** `O(n · k log k)`, **space** `O(k)`. Each of the `log k` probes checks a candidate against
all `n` words at up to `k` characters each; the space is the sliced candidate. That is strictly more
work than the column scan's `O(n · k)`, with a worse constant and no early exit.

So do not ship it here. Ship the *technique* when the **check is cheap and the range is large** —
"smallest ship capacity that finishes the deliveries in `D` days", "largest minimum distance between
placed items" — where one feasibility test is a single linear pass and the candidate range spans a
billion. The assumption it needs is the monotonicity above; take that away and binary search will
converge silently on a wrong number, which is the failure mode to fear.

---

## The Overall Arc

The principle every rung chases is *read each character once, and stop the moment the answer is
settled*. The brute force reads them many times over: it guesses a whole candidate, tests it against
every word from character zero, and on failure guesses a shorter one and starts the reading again,
so the leading `f` of each word is compared once per guess for no gain in information. Sorting is the
first idea with real content, and it is a different kind of move altogether — restructure the input
so that a property of *all* the words becomes a property of just *two*, because dictionary order
guarantees everything between the alphabetical extremes shares whatever those extremes share; a
genuinely reusable insight that happens to cost more here than it saves, since the sort is log-linear
and the problem is linear. Shrinking a single candidate across the words is what instinct produces,
and it is close to right: the candidate only ever gets shorter, so no length is ever reconsidered —
but it still compares from the start of each word on every trim, and it is still *building* an
answer, allocating a new string each time it chops. The column scan is what happens when you take
seriously the observation sitting in plain sight the whole time: the answer is a prefix of the first
word, so it is a slice of data you already hold, and there is nothing to build — only a boundary to
locate. Reading downward touches every character at most once, treats "this word disagrees" and
"this word has ended" as the same event, and exits at the first failing column, which makes the cost
proportional to the *answer* rather than the input: three words sharing nothing cost three
comparisons whether they are three letters long or two hundred. Binary search on the length is the
coda, included precisely because it is *worse* here — it proves the monotone structure really is
present, which is the precondition that licenses binary-search-on-the-answer elsewhere, while showing
that a present precondition is not by itself a reason to use the technique. The habit to carry away
is the one the column scan embodies: when the answer is a slice of an input, do not accumulate it —
find its boundary.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Guess, test, shorten | `O(n · k²)` | `O(k)` | Literal and obviously correct; re-reads every character once per guess | You need an oracle to cross-check a faster version, or `n` and `k` are tiny |
| Sort, compare the ends | `O(n · k log n)` | `O(n · k)` | One restructuring pass reduces "all words" to "two words" | The list is **already sorted**, where it collapses to `O(k)` and beats everything |
| Shrink one candidate | `O(n · k)` | `O(k)` | Carries a single answer forward; still compares from character `0` on each trim | Words arrive one at a time and must be folded into a running answer |
| **Scan the columns** | **`O(n · k)`** | **`O(1)`** | **Reads each character once, builds nothing, exits at the first disagreement** | **The general case — the answer to ship** |
| Binary search on length | `O(n · k log k)` | `O(k)` | Exploits monotonicity of "shares a prefix of length `L`"; costs a full sweep per probe | **Not here.** When a feasibility check is one cheap pass and the answer range is huge |

---

## Interview Priority

> **In an interview.** Say the reframing before you write anything: *"the answer is a prefix of the
> first word, so I am not building a string — I am finding where to cut one."* Then write the column
> scan, with the `i >= len(w)` guard present on the first attempt rather than after a crash. The
> follow-up is almost always **"what if the words arrive one at a time and you cannot hold them
> all?"** — answer with the shrinking candidate, and name the difference out loud: one *builds* the
> answer, the other *locates* it, which is why the optimal version needs no extra space.

**Know cold — the column scan.** Six lines, no allocation, and one property worth stating aloud: the
cost is proportional to the answer, not the input. The `i >= len(w)` guard is the single most likely
thing to be probed, because it is where "a word can simply end" lives.

**Know cold — the shrinking candidate.** It is the natural answer to the streaming follow-up, and
contrasting it with the column scan is a clean way to say something real about building versus
locating an answer.

**Understand, do not drill — the brute force and the sort.** Name the brute force in one sentence to
establish the baseline. The sort is worth mentioning for its insight — *dictionary order makes the
extremes stand in for the whole list* — and worth dismissing just as fast on cost, unless the
interviewer says the input is already sorted, at which point it becomes the best answer in the file.

**Understand, do not drill — the binary search.** Its value is that it names the precondition (*if
length `L` works, every shorter length works*) that licenses binary-search-on-the-answer where that
technique genuinely wins. Being able to say "the monotone structure is here, but the check costs a
full sweep so it loses to the linear scan" is a better answer than either using it or ignoring it.

---

## Full Runnable Script

Every approach in one file, sharing the two lifted helpers — `_all_share` and `_lcp_of_two` — and
checked against both statement examples, the smallest legal input of a single word, identical words,
a word that is a prefix of the others, an empty string in first and in later position, and a
randomised stress run over a two-letter alphabet so that shared prefixes actually occur and the
disagreement column lands in interesting places.

```python
"""Prefix Shared by Every String — every approach in one file, cross-checked.

Run: python longest_common_prefix.py
"""

from __future__ import annotations

import random

# --- shared primitives (used by more than one approach) ------------------------

def _all_share(words: list[str], head: str) -> bool:
    """Does every word begin with `head`? The predicate two approaches are built on."""
    return all(w.startswith(head) for w in words)


def _lcp_of_two(a: str, b: str) -> str:
    """The longest common prefix of exactly two strings."""
    i = 0
    while i < len(a) and i < len(b) and a[i] == b[i]:
        i += 1
    return a[:i]

# --- 1. Guess a prefix, test it, shorten ---------------------------------------

def longest_common_prefix_brute_force(words: list[str]) -> str:
    if not words:
        return ""
    first = words[0]
    for length in range(len(first), -1, -1):  # longest first, so the first hit is maximal
        if _all_share(words, first[:length]):
            return first[:length]
    return ""

# --- 2. Sort the list, then compare only the ends ------------------------------

def longest_common_prefix_sorted_ends(words: list[str]) -> str:
    if not words:
        return ""
    ordered = sorted(words)
    return _lcp_of_two(ordered[0], ordered[-1])  # the two most dissimilar strings bracket the rest

# --- 3. Shrink one candidate across the words ----------------------------------

def longest_common_prefix_horizontal(words: list[str]) -> str:
    if not words:
        return ""
    prefix = words[0]
    for w in words[1:]:
        while not w.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:  # nothing left to trim; Java's substring(0, -1) would throw here
                return ""
    return prefix

# --- 4. Scan the columns (optimal) ---------------------------------------------

def longest_common_prefix_vertical(words: list[str]) -> str:
    if not words:
        return ""
    first = words[0]
    for i in range(len(first)):
        for w in words:
            if i >= len(w) or w[i] != first[i]:  # ran out, or disagreed — the same event
                return first[:i]
    return first

# --- 5. Binary search on the length --------------------------------------------

def longest_common_prefix_binary_search(words: list[str]) -> str:
    if not words:
        return ""
    lo, hi = 0, min(len(w) for w in words)  # the answer can never exceed the shortest word
    while lo < hi:
        mid = (lo + hi + 1) // 2  # bias up: the success branch keeps mid, so rounding down stalls
        if _all_share(words, words[0][:mid]):
            lo = mid
        else:
            hi = mid - 1
    return words[0][:lo]


APPROACHES: list[tuple[str, object]] = [
    ("brute force", longest_common_prefix_brute_force),
    ("sort, compare ends", longest_common_prefix_sorted_ends),
    ("horizontal shrink", longest_common_prefix_horizontal),
    ("vertical scan", longest_common_prefix_vertical),
    ("binary search on length", longest_common_prefix_binary_search),
]

# --- test harness (scaffolding, not answer) ------------------------------------

def run_case(label: str, words: list[str]) -> bool:
    results = [(name, fn(list(words))) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  words={words}")
    for name, r in results:
        print(f"    {name:<24} -> {r!r}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    # Both examples from the statement.
    ok &= run_case("statement example 1", ["flower", "flow", "flight"])
    ok &= run_case("statement example 2 (no answer)", ["dog", "racecar", "car"])

    # Minimal legal input: a single word is its own longest common prefix.
    ok &= run_case("minimal (one word)", ["alone"])

    # Duplicates: every word identical, so the answer is the whole word.
    ok &= run_case("duplicates", ["abc", "abc", "abc"])

    # One word is a prefix of the others — the shortest string caps the answer.
    ok &= run_case("one word caps the rest", ["interspecies", "inter", "interstellar"])

    # An empty string anywhere forces an empty answer.
    ok &= run_case("empty string present", ["", "abc"])
    ok &= run_case("empty string first", ["abc", ""])

    # Randomised stress over a two-letter alphabet, so shared prefixes actually happen.
    random.seed(3)
    for _ in range(1000):
        words = [
            "".join(random.choice("ab") for _ in range(random.randint(0, 6)))
            for _ in range(random.randint(1, 6))
        ]
        results = [fn(list(words)) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT words={words} -> {results}")
    print()
    print("stress: 1000 random word lists over a two-letter alphabet, "
          "all five approaches cross-checked")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()
```

### Output when run

```
statement example 1
  words=['flower', 'flow', 'flight']
    brute force              -> 'fl'
    sort, compare ends       -> 'fl'
    horizontal shrink        -> 'fl'
    vertical scan            -> 'fl'
    binary search on length  -> 'fl'
    all agree: True
statement example 2 (no answer)
  words=['dog', 'racecar', 'car']
    brute force              -> ''
    sort, compare ends       -> ''
    horizontal shrink        -> ''
    vertical scan            -> ''
    binary search on length  -> ''
    all agree: True
minimal (one word)
  words=['alone']
    brute force              -> 'alone'
    sort, compare ends       -> 'alone'
    horizontal shrink        -> 'alone'
    vertical scan            -> 'alone'
    binary search on length  -> 'alone'
    all agree: True
duplicates
  words=['abc', 'abc', 'abc']
    brute force              -> 'abc'
    sort, compare ends       -> 'abc'
    horizontal shrink        -> 'abc'
    vertical scan            -> 'abc'
    binary search on length  -> 'abc'
    all agree: True
one word caps the rest
  words=['interspecies', 'inter', 'interstellar']
    brute force              -> 'inter'
    sort, compare ends       -> 'inter'
    horizontal shrink        -> 'inter'
    vertical scan            -> 'inter'
    binary search on length  -> 'inter'
    all agree: True
empty string present
  words=['', 'abc']
    brute force              -> ''
    sort, compare ends       -> ''
    horizontal shrink        -> ''
    vertical scan            -> ''
    binary search on length  -> ''
    all agree: True
empty string first
  words=['abc', '']
    brute force              -> ''
    sort, compare ends       -> ''
    horizontal shrink        -> ''
    vertical scan            -> ''
    binary search on length  -> ''
    all agree: True

stress: 1000 random word lists over a two-letter alphabet, all five approaches cross-checked

ALL APPROACHES AGREED ON EVERY CASE.
```
