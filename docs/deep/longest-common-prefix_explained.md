# Prefix Shared by Every String — explained

## Understanding the Problem

You are given a list of words. Find the longest run of characters that every single one of them
starts with. `["flower", "flow", "flight"]` all begin with `f`, and all begin with `fl`, but not all
begin with `flo` — so the answer is `"fl"`. If they share nothing at all, the answer is the empty
string.

**The core question is: how far down the words can you read before they stop agreeing?** The naive
approach is slow because it guesses an answer and then checks it: it proposes a candidate prefix,
tests it against every word, and on failure proposes a shorter one — re-reading the same leading
characters once per guess.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| `1 <= words.length <= 200`, `0 <= words[i].length <= 200` | The whole input is at most 40,000 characters. This is the unusual case where the constraints are small enough that *every* approach in this file passes comfortably — even the quadratic-in-length brute force tops out around 8 million character comparisons. So the reason to prefer the best approach here is not survival, it is clarity and the early exit. It also means sorting the list (a log-linear pass) is perfectly affordable, which is why the sorting rung below is a real option rather than a curiosity. |
| words consist of lowercase English letters | A bounded 26-letter alphabet. This unlocks nothing for a single query, but it is what makes a **trie** attractive if you had to answer many prefix questions against the same word list — each node gets a fixed 26-slot child table. |
| **the answer is bounded by the SHORTEST string** | This caps the real work at `n × (length of the shortest word)` no matter how long the other words are, and it is what gives the binary-search rung its upper bound. A list containing one two-letter word can never cost more than two columns of scanning, however many 200-character words sit beside it. |
| an empty string anywhere forces an empty answer | The degenerate case, and a useful test of whether your loop reads a character before checking that one exists. It is also the extreme form of the early exit: the answer is settled before the first comparison. |

The shape worth noticing before reading on: **the answer is always a prefix of the first word**
(it is a prefix of every word, and the first word is one of them). So the answer is not something
you need to build — it is a slice of an input you already hold, and the only unknown is where to
cut it. That reframing is what the best approach here is built on.

---

## Approach 1 — Guess a prefix, test it, shorten

### The idea

*How do I know whether a given piece of text is a common prefix?* Check that every word starts with
it. *And how do I find the longest one?* The answer is a prefix of the first word, so there are only
a handful of candidates — the whole first word, the first word minus its last character, and so on
down to nothing. Try them longest-first and return the first that survives. This is the definition
turned into a search; it assumes nothing.

### How to think about it

A stack of candidate rulers, ordered from longest to shortest. You hold up the longest one against
every word; if any word disagrees you throw it away and hold up the next. Because you are going
longest-first, the first ruler that fits every word is by definition the longest that does, so you
can stop immediately. The obvious waste is that each new test re-reads the same leading characters
of every word — the `f` in `flower` gets compared five separate times on the example below — and
every later approach is a way of reading each character once.

### Worked example

Input: `words = ["flower", "flow", "flight"]`. The candidates come from the first word.

| Try | Candidate | `flower` starts with it? | `flow`? | `flight`? | Verdict |
|---|---|---|---|---|---|
| 1 | `"flower"` | yes | **no** | — | too long |
| 2 | `"flowe"` | yes | **no** | — | too long |
| 3 | `"flow"` | yes | yes | **no** | too long |
| 4 | `"flo"` | yes | yes | **no** | too long |
| 5 | `"fl"` | yes | yes | yes | **answer** |

Five candidate tests. Notice how much is repeated: try 5 compares the `f` and the `l` of all three
words, and tries 1 through 4 had already compared those same characters, four times over. That
re-reading is the entire inefficiency, and it is invisible in the result.

### Code

```python
def longest_common_prefix_brute_force(words: list[str]) -> str:
    if not words:
        return ""
    first = words[0]
    for length in range(len(first), -1, -1):  # longest candidate first, so the first hit wins
        candidate = first[:length]
        if all(w.startswith(candidate) for w in words):
            return candidate
    return ""
```

### Common mistake

Writing the loop the other way round — ascending from short to long — and then returning the wrong
slice. The natural ascending version says "grow the candidate until it fails, then return it", and
`return first[:length]` at that point returns **the candidate that just failed**, one character too
long. On this example it returns `"flo"` instead of `"fl"`. The ascending form needs
`first[:length - 1]`, or a loop that tracks the last candidate that *succeeded*, and either way it
is one more thing to get right. Descending has no such off-by-one to trip over: the first candidate
that passes is the answer, exactly as written.

### Complexity and when to use this

**Time O(n · k²), space O(k).** The `k²` is the re-reading: there are up to k candidates, and testing
a candidate of length L costs up to `n × L` character comparisons, so the total sums to roughly
`n · k² / 2`, where k is the length of the first word. The space is the candidate slice itself.

At these constraints it runs fine — 200 words of 200 characters is about 8 million comparisons — so
this is not a wrong answer, it is an inelegant one. Its real use is as the oracle: it is the most
literal transcription of "the longest string that every word starts with", and it is what the faster
versions get checked against at the bottom of this file.

---

## Approach 2 — Sort the list, then compare only the ends

### The idea

*Testing against every word every time is the expensive part — could two words stand in for all of
them?* Yes, if you first put the list in dictionary order. Sorting places the two most dissimilar
words at the two ends, and any prefix shared by those two is automatically shared by everything
alphabetically between them — so after one restructuring pass, the answer comes from comparing a
single pair.

### How to think about it

Two costs, worth keeping separate. The **restructuring** is the sort, at `O(n · k log n)` — log-linear
in the number of words, with each comparison costing up to k characters. The **search** afterwards is
a single walk down two strings, `O(k)`. That is the classic trade: pay once to impose structure, then
harvest the answer almost for free.

Why the ends suffice: dictionary order sorts by the first character, then the second, and so on. If
the alphabetically smallest word and the alphabetically largest one both start with `fl`, then every
word in between must also start with `fl` — a word starting with anything else would have sorted
outside that pair, not between them. So the first and last entries bracket the whole list, and
whatever they agree on, everyone agrees on.

### Worked example

Input: `words = ["flower", "flow", "flight"]`.

| Stage | Contents |
|---|---|
| as given | `["flower", "flow", "flight"]` |
| after sorting | `["flight", "flow", "flower"]` |
| the two ends | `lo = "flight"`, `hi = "flower"` |

Then walk the two ends together:

| Column | `lo` char | `hi` char | Agree? |
|---|---|---|---|
| 0 | `f` | `f` | yes |
| 1 | `l` | `l` | yes |
| 2 | `i` | `o` | **no — stop** |

Cut at column 2: the answer is `"fl"`. Three character comparisons after the sort, and `"flow"` —
the middle word — was never looked at again.

### Common mistake

Sorting by **length** instead of alphabetically, on the reasoning that "the answer can't be longer
than the shortest word, so compare the shortest with the longest". That reasoning is true about the
*length* of the answer and says nothing about its *content*. On `["ab", "xy", "abc"]`, sorting by
length leaves `"ab"` first and `"abc"` last, those two share `"ab"`, and the function returns `"ab"`
— but `"xy"` is sitting in the middle sharing nothing with anyone, and the true answer is `""`. The
bracketing argument only works under dictionary order, because that is the order in which "between
these two" implies "starts the same way".

### Code

```python
def longest_common_prefix_sorted_ends(words: list[str]) -> str:
    if not words:
        return ""
    ordered = sorted(words)
    lo, hi = ordered[0], ordered[-1]  # the two most dissimilar strings in the list
    i = 0
    while i < len(lo) and i < len(hi) and lo[i] == hi[i]:
        i += 1
    return lo[:i]
```

### Complexity and when to use this

**Time O(n · k log n), space O(n · k).** The time is dominated by the sort — `O(n log n)` comparisons,
each costing up to k characters — and the comparison afterwards adds only `O(k)`. The space is the
sorted copy of the list.

It is slower than the two approaches below, so it is not the answer to ship for a one-off query. It
earns its place for two reasons. First, the *insight* is genuinely reusable: sorting converts "is
this true of everything?" into "is this true of the two extremes?", which is a move that shows up
again in interval merging, in minimum-range problems, and anywhere the predicate is monotone in
sorted order. Second, it is the right answer when the list is **already** sorted, or is sorted for
some other reason, in which case the whole cost collapses to `O(k)` — cheaper than any other approach
here.

---

## Approach 3 — Shrink one candidate across the words

### The idea

*The brute force restarts from a fresh candidate after each failure — could a single candidate be
carried along and trimmed as needed?* Yes. Start with the whole first word as the answer-so-far, and
for each subsequent word, chop characters off the end until the answer-so-far is a prefix of that
word too. This fixes the brute force's restarts: the candidate only ever gets shorter, so work is
never redone at a length already rejected.

### How to think about it

A pencil line drawn under the first word, marking how much of it is still believed to be common.
Each new word can only push the line left, never right, because a prefix that failed for an earlier
word can never come back. Go through the words once, and by the end the line sits at the answer.

This is the version most people write first, and it is a good one. Its weakness is subtle: the trim
step compares from the *start* of the word every time. Chopping `"flower"` down to `"fl"` one
character at a time re-compares the leading `f` at every step, so a single stubborn word can cost
`O(k²)` character comparisons on its own. It also holds a mutable candidate string, which in most
languages means allocating a new string per trim.

### Worked example

Input: `words = ["flower", "flow", "flight"]`. Start with `prefix = "flower"`.

| Step | Word being reconciled | `prefix` before | Is it a prefix of the word? | `prefix` after |
|---|---|---|---|---|
| 1 | `"flow"` | `"flower"` | no | `"flowe"` |
| 2 | `"flow"` | `"flowe"` | no | `"flow"` |
| 3 | `"flow"` | `"flow"` | **yes** — move on | `"flow"` |
| 4 | `"flight"` | `"flow"` | no | `"flo"` |
| 5 | `"flight"` | `"flo"` | no | `"fl"` |
| 6 | `"flight"` | `"fl"` | **yes** — move on | `"fl"` |

Answer: `"fl"`. Six trim-or-accept steps, each one a full `startswith` check that begins again at
character 0. The line only ever moved left, which is the property that makes this correct.

### Code

```python
def longest_common_prefix_horizontal(words: list[str]) -> str:
    if not words:
        return ""
    prefix = words[0]
    for w in words[1:]:
        while not w.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix
```

### Common mistake

Writing `while prefix not in w` instead of `while not w.startswith(prefix)`. A substring test is not
a prefix test: it accepts the candidate appearing *anywhere* in the word. On `["abc", "xab"]` the
candidate `"abc"` is not inside `"xab"`, so it trims to `"ab"` — which *is* inside `"xab"`, at
position 1 — and the function returns `"ab"` when the true answer is `""`, because `"xab"` does not
start with `"ab"` at all. The bug is easy to write in languages where the substring operator is the
shorter one to type, and it produces plausible answers on most inputs, which is what makes it
dangerous. The early `if not prefix: return ""` is a genuine exit, not decoration: in Python the loop
would terminate anyway (every word starts with the empty string), but in Java the equivalent
`substring(0, -1)` throws.

### Complexity and when to use this

**Time O(n · k), space O(k).** In the usual case each word is compared against a candidate that only
shrinks, so across the whole run each character position is visited a bounded number of times and
the total is `n · k`; the pathological case — one word forcing a trim all the way down one character
at a time — adds a `k²` term for that word alone. The space is the candidate string, which is a real
allocation on every trim.

Reach for it when the common prefix is expected to be long and the words are few, since the candidate
then barely moves and the code is three lines. It is also the natural shape when you are folding a
running answer across a stream of words arriving one at a time — you hold one candidate and shrink
it as each new word arrives, which the column-scan below cannot do because it needs all the words at
once.

---

## Approach 4 — Scan the columns (optimal)

### The idea

*Every approach so far compares whole strings against a candidate — what if the words were read
downwards instead of across?* Line the words up and read column 0 of all of them, then column 1, and
so on, stopping the instant one disagrees or runs out. This fixes the shrinking rung's re-reading:
each character is examined exactly once, and no candidate string is built or trimmed at all, because
the answer is a slice of the first word and the only thing being computed is where to cut.

### How to think about it

Imagine the words printed one under another, left-aligned, like a spreadsheet. You read straight
down the first column: all `f`, fine. Down the second: all `l`, fine. Down the third: `o`, `o`,
`i` — disagreement, so the prefix ends at column 2 and you are finished. Two things end a column:
a character that differs, or a word that has no character there at all because it ended. Both mean
the same thing, and handling them with a single `or` is what keeps the code honest.

The mental shift that makes this the best version is dropping the idea of *building* an answer. You
are not accumulating a string; you are locating a boundary in a string you already have. The first
word is the ruler, the loop finds the cut point, and the answer is one slice at the end.

### Worked example

Input: `words = ["flower", "flow", "flight"]`. The first word is the ruler.

```
column:   0   1   2   3   4   5
flower    f   l   o   w   e   r
flow      f   l   o   w   –   –
flight    f   l   i   g   h   t
```

| Column | ruler char | `flower` | `flow` | `flight` | Verdict |
|---|---|---|---|---|---|
| 0 | `f` | `f` ✓ | `f` ✓ | `f` ✓ | column is common, continue |
| 1 | `l` | `l` ✓ | `l` ✓ | `l` ✓ | column is common, continue |
| 2 | `o` | `o` ✓ | `o` ✓ | `i` ✗ | **disagreement — cut at 2** |

Return `first[:2]` = `"fl"`. Nine character comparisons in total — three columns of three words —
and the walk stopped at column 2, never looking at `w`, `e`, `r`, `g`, `h` or `t`. Compare that with
the brute force's five full candidate tests over the same data.

The early exit is not a micro-optimisation, it is the headline property. On
`["dog", "racecar", "car"]` this approach does **two** comparisons — `d` against `d`, then `d`
against `r` — and returns `""`. It is proportional to the answer, not to the input.

### Code

```python
def longest_common_prefix_vertical(words: list[str]) -> str:
    if not words:
        return ""
    first = words[0]
    for i in range(len(first)):
        for w in words:
            if i >= len(w) or w[i] != first[i]:  # ran out, or disagreed
                return first[:i]
    return first
```

### Common mistake

Dropping the `i >= len(w)` guard and writing only `w[i] != first[i]`. The loop is bounded by the
length of the *first* word, so any shorter word runs out of characters partway down and the
indexing crashes: `["abc", "ab"]` raises `IndexError: string index out of range` at column 2. The
guard has to come first in the `or`, too — short-circuit evaluation is what stops the comparison
from being attempted on a character that does not exist. A word ending is not an error case to be
patched around; it is one of the two legitimate ways a column fails, and it deserves to be in the
same condition as the other.

### Complexity and when to use this

**Time O(n · k), space O(1) beyond the returned slice.** The time is one comparison per word per
column, with columns bounded by the length of the shortest word — so the real cost is
`n × (length of the answer + 1)`, which on inputs that share little is tiny. The space is a loop
index and nothing else; no candidate string is ever built, which is what separates it from the
shrinking version.

This is the answer to ship. It is the shortest correct code here, it never allocates, and its early
exit makes it proportional to the answer rather than the input — an input of 200 words that disagree
in the first column costs 200 comparisons regardless of how long those words are. The one situation
where another approach genuinely wins is a list that is already sorted, where comparing the two ends
is `O(k)` and ignores the middle entirely.

---

## Approach 5 — Binary search on the length

### The idea

*The column scan walks the answer's length one step at a time — could the length be found by halving
instead?* It could, because the property in play is **monotone**: if every word shares a prefix of
length 4, then every word shares prefixes of length 3, 2 and 1 as well. That is exactly the
condition binary search needs, so you can probe a length, ask "do all words share this much?", and
throw away half the remaining range on every answer.

### How to think about it

You are searching over *answer lengths* rather than over the data. The range runs from 0 to the
length of the shortest word — the constraint that the answer is bounded by the shortest string is
what gives the upper end. Each probe takes the midpoint length, slices that much off the first word,
and checks it against everyone; a success means the answer is at least that long, so the lower bound
moves up, and a failure means it is shorter, so the upper bound moves down. About log₂ k probes and
you have the exact cut point.

The honest assessment comes with it: this is **not faster** than the column scan on this problem. Each
probe costs a full `O(n · k)` sweep, so the total is `O(n · k log k)` — a `log k` factor *worse*. The
reason to learn it is the pattern, not the performance. "Binary search on the answer" is a genuinely
powerful technique when the check is cheap relative to the range being searched, and this is a clean
place to see the requirement for it stated plainly.

### Worked example

Input: `words = ["flower", "flow", "flight"]`. The shortest word is `"flow"`, so the search range is
0 to 4.

| Probe | `lo` | `hi` | `mid` | Candidate `first[:mid]` | All words start with it? | New range |
|---|---|---|---|---|---|---|
| 1 | 0 | 4 | 2 | `"fl"` | yes | `lo = 2`, range 2–4 |
| 2 | 2 | 4 | 3 | `"flo"` | no (`flight`) | `hi = 2`, range 2–2 |
| — | 2 | 2 | — | — | range collapsed | answer `first[:2]` = `"fl"` |

Two probes instead of the column scan's three columns. On this tiny input that looks like a win; it
is not, because each probe re-read the leading characters of all three words, which is exactly the
waste the column scan had eliminated.

### Code

```python
def longest_common_prefix_binary_search(words: list[str]) -> str:
    if not words:
        return ""
    lo, hi = 0, min(len(w) for w in words)  # the answer can never exceed the shortest word
    while lo < hi:
        mid = (lo + hi + 1) // 2  # bias up, or lo == hi - 1 loops forever
        head = words[0][:mid]
        if all(w.startswith(head) for w in words):
            lo = mid
        else:
            hi = mid - 1
    return words[0][:lo]
```

### Common mistake

Writing `mid = (lo + hi) // 2` — the midpoint formula from every other binary search you have ever
written. This variant keeps a *candidate answer* in `lo` (it moves `lo = mid` on success rather than
`lo = mid + 1`), and with the midpoint biased downward, `lo = 1, hi = 2` computes `mid = 1`, succeeds,
and sets `lo = 1` again: the range never shrinks and the loop spins forever. On `["aa", "aa"]` it
hangs. Whenever one branch of a binary search assigns `lo = mid` rather than `lo = mid + 1`, the
midpoint must round **up**, and vice versa — the rule is that every iteration has to strictly shrink
the range on both branches.

### Complexity and when to use this

**Time O(n · k log k), space O(k).** Each of the `log k` probes checks a candidate against all n words
at up to k characters each; the space is the sliced candidate. That is strictly more work than the
column scan, which is `O(n · k)` with a better constant and an earlier exit.

So: do not ship this for this problem. Ship it when the **check is cheap and the range is large** —
the shape where binary-search-on-the-answer earns its keep, such as "smallest capacity that lets the
shipments finish in D days" or "largest minimum distance between placed items", where a single
feasibility check is one linear pass and the answer range spans a billion. The assumption it needs is
the monotonicity spelled out above: *if length L works, every shorter length works*. Take that away —
imagine a problem where medium-sized answers fail but large ones succeed — and binary search will
confidently converge on a wrong number, silently, which is the failure mode to fear.

---

## The Overall Arc

The principle every rung chases is *read each character once, and stop the moment the answer is
settled*. The brute force reads them many times over: it guesses a whole candidate prefix, tests it
against every word from character zero, and on failure guesses a shorter one and starts the reading
again — so the leading `f` of each word is compared once per guess, and the work is quadratic in the
word length for no gain in information. Sorting is the first idea with real content, and it is a
different kind of move altogether: restructure the input so that a property of *all* the words
becomes a property of just *two* of them, because dictionary order guarantees everything between the
alphabetical extremes shares whatever those extremes share — a genuinely reusable insight that
happens to cost more here than it saves, since the sort is log-linear and the problem is linear.
Shrinking a single candidate across the words is the version instinct produces, and it is close to
right: the candidate only ever gets shorter, so no length is ever reconsidered — but it still
compares from the start of each word on every trim, and it is still *building* an answer, allocating
a new string each time it chops a character off. The column scan is what happens when you take
seriously the observation sitting in plain sight the whole time: the answer is a prefix of the first
word, so it is a slice of data you already hold, and there is nothing to build — only a boundary to
locate. Reading downward instead of across touches every character at most once, treats "this word
disagrees" and "this word has ended" as the same event, and exits at the first column that fails,
which makes the cost proportional to the *answer* rather than to the input: three words sharing
nothing cost three comparisons whether they are three letters long or two hundred. Binary search on
the length is the coda, and it is included precisely because it is *worse* here — it demonstrates
that the monotone structure ("if length four works, length three works") really is present, which is
the precondition that makes binary-search-on-the-answer legitimate elsewhere, while showing that a
present precondition is not the same as a reason to use the technique. The habit to carry away is the
one the column scan embodies: when the answer is a slice of an input, do not accumulate it — find its
boundary.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Guess, test, shorten | O(n · k²) | O(k) | Literal and obviously correct; re-reads every character once per guess | You need an oracle to cross-check a faster version, or n and k are tiny |
| Sort, compare the ends | O(n · k log n) | O(n · k) | One restructuring pass reduces "all words" to "two words" | The list is **already sorted**, in which case it collapses to O(k) and beats everything |
| Shrink one candidate | O(n · k) | O(k) | Carries a single answer forward; still compares from character 0 each trim | Words arrive one at a time and you must fold a running answer, or the shared prefix is long and n is small |
| Scan the columns | O(n · k) | O(1) | Reads each character once, builds nothing, exits at the first disagreement | The general case — the answer to ship |
| Binary search on length | O(n · k log k) | O(k) | Exploits monotonicity of "shares a prefix of length L"; costs a full sweep per probe | **Not here.** When a feasibility check is one cheap pass and the answer range is huge |

---

## Interview Priority

**Know cold: the column scan, and the shrinking candidate.** The column scan is what you should
write, in six lines, with the `i >= len(w)` guard present on the first attempt rather than after a
crash — that guard is the single most likely thing to be probed, because it is where the "a word can
simply end" case lives. The shrinking version is worth being able to produce as well, because it is
the natural answer to the follow-up "what if the words arrive one at a time and you cannot hold them
all?", and because contrasting the two is a clean way to say something real: one *builds* the answer,
the other *locates* it, and the second is why the optimal version needs no extra space. Be ready to
state the early-exit property out loud — the cost is proportional to the answer, not the input — since
that is the observation that shows you understand the shape of the problem rather than just its code.

**Understand but do not drill: the guess-and-shorten brute force, the sort, and the binary search.**
Name the brute force in one sentence to establish the baseline. The sort is worth mentioning for its
insight — *dictionary order makes the extremes stand in for the whole list* — and worth dismissing
just as quickly on cost, unless the interviewer says the input is already sorted, at which point it
becomes the best answer in the file. The binary search is the one to keep in the back pocket rather
than the front: its value is that it names the precondition (*if length L works, every shorter length
works*) that licenses binary-search-on-the-answer in problems where that technique genuinely wins, and
being able to say "the monotone structure is here, but the check costs a full sweep so it loses to the
linear scan" is a much better answer than either using it or ignoring it.

---

## Full Runnable Script

Every approach in one file, checked against both statement examples — including the one with no
common prefix at all — the smallest legal input of a single word, a list of identical words, a list
where one word is a prefix of the others, an empty string in first and in later position, and a
randomised stress run over a two-letter alphabet so that shared prefixes actually occur and the
disagreement column lands in interesting places.

```python
"""Prefix Shared by Every String — every approach in one file, cross-checked.

Run: python longest_common_prefix.py
"""

from __future__ import annotations

import random


def longest_common_prefix_brute_force(words: list[str]) -> str:
    if not words:
        return ""
    first = words[0]
    for length in range(len(first), -1, -1):  # longest candidate first, so the first hit wins
        candidate = first[:length]
        if all(w.startswith(candidate) for w in words):
            return candidate
    return ""


def longest_common_prefix_sorted_ends(words: list[str]) -> str:
    if not words:
        return ""
    ordered = sorted(words)
    lo, hi = ordered[0], ordered[-1]  # the two most dissimilar strings in the list
    i = 0
    while i < len(lo) and i < len(hi) and lo[i] == hi[i]:
        i += 1
    return lo[:i]


def longest_common_prefix_horizontal(words: list[str]) -> str:
    if not words:
        return ""
    prefix = words[0]
    for w in words[1:]:
        while not w.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix


def longest_common_prefix_vertical(words: list[str]) -> str:
    if not words:
        return ""
    first = words[0]
    for i in range(len(first)):
        for w in words:
            if i >= len(w) or w[i] != first[i]:  # ran out, or disagreed
                return first[:i]
    return first


def longest_common_prefix_binary_search(words: list[str]) -> str:
    if not words:
        return ""
    lo, hi = 0, min(len(w) for w in words)  # the answer can never exceed the shortest word
    while lo < hi:
        mid = (lo + hi + 1) // 2  # bias up, or lo == hi - 1 loops forever
        head = words[0][:mid]
        if all(w.startswith(head) for w in words):
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
