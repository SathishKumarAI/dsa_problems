// find-all-duplicates — the teaching document, as data.
//
// Converted from docs/deep/find-all-duplicates_explained.md by
// scripts/md-to-content.mjs. Every byte of prose carried through unchanged;
// what changed is that the STRUCTURE is now a type (src/content/types.ts)
// rather than a heading convention a script had to grep for.
//
// Reached only through `lib/content.ts`'s glob — never import this file.

import type { TeachingDoc } from "./types.ts"

export const doc: TeachingDoc = {
  problemId: "find-all-duplicates",
  understanding: `You are handed an array of length n. Every number in it is between 1 and n, and each of those
numbers shows up either once or twice — never three times. Report every number that shows up
twice. The order of the answer does not matter, and the answer may be empty.

**The core question is: for each value, have I seen this one before?** The naive approach is slow
because it answers that question by re-reading the rest of the array for every element, so an
array of 100,000 numbers costs about five billion comparisons — minutes of work for an answer that
should take milliseconds.

The constraints, and what each one buys:

The whole arc of this problem is one sentence: **the values are promised to lie in 1..n, which is
exactly the number of slots the array has, so the array itself can become the lookup table.**
Everything below is a walk toward taking that promise seriously.

---`,
  unlocks: [
      {
          "constraint": "`n == nums.length`, `1 <= n <= 10^5`",
          "what": "Quadratic work is ~5 × 10⁹ comparisons, far too slow. An O(n²) answer is correct and unusable."
      },
      {
          "constraint": "**`1 <= nums[i] <= n`**",
          "what": "The load-bearing one. Every value is a legal index of this very array. That is what lets the last two rungs throw away the hash map: a value *is* a slot number, so the lookup table does not need to be built — it is already sitting there. Subtract one to go from a 1-based value to a 0-based index."
      },
      {
          "constraint": "a value appears once or twice, never more",
          "what": "One bit per value is enough. You never need a counter, only a flag — which is what makes the sign of a number a sufficient place to keep the record."
      },
      {
          "constraint": "the answer may be empty, and its order is not part of the answer",
          "what": "You cannot return early, and you do not have to sort. Any comparison against a reference answer must sort both sides first."
      },
      {
          "constraint": "`n` may be 1",
          "what": "The only legal array is `[1]` and the answer is empty. This is the input that catches a loop starting at index 1, or one reading `nums[i - 1]` without a guard."
      }
  ],
  approaches: [
  {
    rung: "compare-every-pair",
    title: "Compare every pair",
    idea: `*How do I know whether a value repeats?* Compare it against everything that comes after it. *And
how do I find all of them?* Do that for every position, and collect each match. This is the
baseline. It uses nothing about the input except that it is a list of things you can compare — it
would work unchanged if the values were names, dates, or floating-point temperatures.`,
    intuition: `Picture two fingers. The outer finger parks on an element; the inner finger walks the whole
remaining tail, checking each one against it. When the tail runs out, the outer finger advances and
the inner one restarts just behind it. You are enumerating every unordered pair exactly once, which
is n(n−1)/2 comparisons in total. The shape to notice is that the inner walk *starts over* every
time: whatever the outer step at index 3 learned is thrown away before index 4 begins. Every later
approach is a different way of not throwing that away. Because a value appears at most twice, a
match fires at most once per duplicate, so the answer needs no de-duplication.`,
    worked: `Input: \`nums = [4, 3, 2, 7, 8, 2, 3, 1]\` — the same input traced through every approach in this
document.

| Outer i (value) | Inner walk over the tail | Result |
|---|---|---|
| 0 (4) | 3, 2, 7, 8, 2, 3, 1 | no 4 anywhere after it |
| 1 (3) | 2, 7, 8, 2, **3**, 1 | match at index 6 → collect \`3\` |
| 2 (2) | 7, 8, **2**, 3, 1 | match at index 5 → collect \`2\` |
| 3 (7) | 8, 2, 3, 1 | nothing |
| 4 (8) | 2, 3, 1 | nothing |
| 5 (2) | 3, 1 | nothing — its partner was *before* it, already counted at i = 2 |
| 6 (3) | 1 | nothing, same reason |

28 comparisons for an eight-element array. Answer collected: \`[3, 2]\`, which is \`[2, 3]\` once
sorted. Note the array is never written to — it comes back exactly as it went in.`,
    code: `def find_all_duplicates_compare_every_pair(nums: list[int]) -> list[int]:
    out: list[int] = []
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                out.append(nums[i])
    return out`,
    mistake: `Writing the inner loop as \`for j in range(len(nums))\` instead of \`range(i + 1, len(nums))\`. Now \`j\`
can equal \`i\`, so every element matches itself and the answer is the entire array. Starting at
\`i + 1\` fixes two things at once: it stops the self-match, and it stops you from reporting the pair
\`(a, b)\` and then \`(b, a)\` — which on \`[2, 2]\` would return \`[2, 2]\` instead of \`[2]\`.`,
    cost: `**Time O(n²), space O(1)** (not counting the answer list, which every approach must build). The
cost is the nested walk: n outer positions, each scanning up to n elements, with nothing remembered
between outer steps. Space is constant because only two indices are ever held.

Use it when n is genuinely tiny, when the values are not integers in a known range so none of the
indexing tricks apply, or as a trustworthy reference to cross-check a clever solution against —
which is exactly the job it does in the stress test at the bottom of this file.

---`,
  },
  {
    rung: "sort-then-read-neighbours",
    title: "Sort, then read neighbours",
    idea: `*The pair scan re-reads the whole tail for every element. What if the two copies of a value were
always next to each other, so a single pass could find them?* Sort the array. Sorting guarantees
that equal values become adjacent, so the question "does this repeat?" shrinks from "check n−i
other elements" to "check the one element immediately before me". This fixes the pair scan's exact
weakness: the restarted inner walk.`,
    intuition: `Sorting is herding — it drives every copy of a value into one clump. After that, duplicates are not
scattered across the array, they are touching. So you walk the sorted array once with a single
backward glance at each step: *is the number I am standing on the same as the one I just left?* Every
clump of two announces itself. You never look further back than one step, because sorting has
already promised that if a match exists anywhere, it is right there.`,
    worked: `Input: \`nums = [4, 3, 2, 7, 8, 2, 3, 1]\`. Sorted, that becomes \`[1, 2, 2, 3, 3, 4, 7, 8]\`.

| i | \`ordered[i - 1]\` | \`ordered[i]\` | Equal? |
|---|---|---|---|
| 1 | 1 | 2 | no |
| 2 | 2 | 2 | **yes** → collect \`2\` |
| 3 | 2 | 3 | no |
| 4 | 3 | 3 | **yes** → collect \`3\` |
| 5 | 3 | 4 | no |
| 6 | 4 | 7 | no |
| 7 | 7 | 8 | no |

Seven comparisons instead of 28, plus the cost of the sort. Answer: \`[2, 3]\`, already ascending for
free.`,
    code: `def find_all_duplicates_sort_then_neighbours(nums: list[int]) -> list[int]:
    ordered = sorted(nums)  # a COPY — sorting in place would rearrange the caller's array
    out: list[int] = []
    for i in range(1, len(ordered)):
        if ordered[i] == ordered[i - 1]:
            out.append(ordered[i])
    return out`,
    mistake: `Starting the loop at \`i = 0\` and reading \`ordered[i - 1]\`. In Python that is not an error — index
\`-1\` is the *last* element — so on the input \`[1]\` the code compares \`ordered[0]\` against
\`ordered[-1]\`, which is the same element, and reports \`1\` as a duplicate. The smallest legal input
is exactly where this shows up, and it is silent: no exception, just a wrong answer. Start at
\`i = 1\`.

The second mistake is using \`nums.sort()\` instead of \`sorted(nums)\`. That sorts the caller's array
in place and hands back a permuted array they did not ask for — see the mutation discussion under
Approach 5, which applies here too.`,
    cost: `**Time O(n log n), space O(n).** The time is dominated by the sort; the single pass afterwards is
linear and free by comparison. The space is the sorted copy. (If you are allowed to sort in place,
the space drops toward O(1) in C++ and to O(log n) of stack in most library sorts — but you have
then destroyed the input, which is the same cost Approach 5 pays, without Approach 5's speed.)

This is the right choice when the values are *not* bounded by n. Sorting needs no promise about the
range, which is what makes it the general answer to "find duplicates in anything comparable". It is
also what you reach for when you want the answer ascending anyway and the n log n is beneath notice.

---`,
  },
  {
    rung: "count-in-a-hash-map",
    title: "Count in a hash map",
    idea: `*Sorting spends O(n log n) arranging values into an order the question never asked about — it only
asks how many times each value occurs. Can that be asked directly?* Yes: walk once, tallying each
value in a dictionary, then walk the candidates 1..n and take the ones whose tally is 2. This fixes
sorting's weakness — the ordering work the answer makes no use of — and it leaves the input
untouched.`,
    intuition: `A tally sheet. As each number walks past you make a mark next to it on the sheet; at the end you
read off every name with two marks. No number is ever compared against another number; the only
operation is "find this name's row and increment it", which a hash map does in constant expected
time. Notice the trade being made explicit for the first time: you buy linear time with linear
memory, and that memory holds nothing but facts the input already contained.`,
    worked: `Input: \`nums = [4, 3, 2, 7, 8, 2, 3, 1]\`.

Pass 1 builds the tally, one value at a time:

| Value seen | Map after |
|---|---|
| 4 | \`{4: 1}\` |
| 3 | \`{4: 1, 3: 1}\` |
| 2 | \`{4: 1, 3: 1, 2: 1}\` |
| 7 | \`{4: 1, 3: 1, 2: 1, 7: 1}\` |
| 8 | \`{4: 1, 3: 1, 2: 1, 7: 1, 8: 1}\` |
| 2 | \`{…, 2: 2, …}\` |
| 3 | \`{…, 3: 2, …}\` |
| 1 | \`{4: 1, 3: 2, 2: 2, 7: 1, 8: 1, 1: 1}\` |

Pass 2 walks the candidates 1, 2, 3, 4, 5, 6, 7, 8 and keeps those with a count of exactly 2: \`2\`
and \`3\`. Answer \`[2, 3]\`, ascending because the candidate walk is ascending. The map peaked at six
entries.`,
    code: `def find_all_duplicates_count_in_hash_map(nums: list[int]) -> list[int]:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    out: list[int] = []
    for v in range(1, len(nums) + 1):  # walk the candidates, not the map, to get order
        if counts.get(v, 0) == 2:
            out.append(v)
    return out`,
    mistake: `Writing \`counts[x] = counts[x] + 1\` without the \`.get(x, 0)\` default, which raises \`KeyError\` on the
first sighting of every value. The subtler version of the same bug is testing \`counts[v] == 2\` in
the second loop: values in 1..n that never appeared have no key at all, so the lookup throws. Both
are fixed by defaulting to 0, and in production code by reaching for \`collections.Counter\`, which
defaults for you. This file uses a plain \`dict\` so the mechanism stays visible instead of hiding in
a library.`,
    cost: `**Time O(n), space O(n).** Time is two linear passes with an O(1) expected hash operation at each
step. Space is the map, which holds one entry per distinct value — up to n of them.

This is the right choice when the values are **not** confined to 1..n: a hash map keys on anything
hashable, so it is the approach that survives the follow-up "now the values are arbitrary 64-bit
integers" or "now they are strings". It is also the one that generalises to "appears *k* times",
because it stores a count rather than a flag. Here it is two rungs short only because the promised
value range makes both the hashing and the extra allocation avoidable.

---`,
  },
  {
    rung: "a-flag-per-value",
    title: "A flag per value",
    idea: `*The map is hashing keys that are already small integers in a known range, and boxing each one.
What is that buying?* Nothing. When keys are guaranteed to be 1..n, a flat array of n+1 booleans
indexed by the value itself does the same job with a direct memory read instead of a hash. This
fixes the map's weakness — paying for generality you were promised you would not need — and as a
bonus the answer falls out during the single pass, with no second sweep.`,
    intuition: `**The array is a row of numbered pigeonholes, and the value tells you which hole it belongs in.**
Hole 1 is for the value 1, hole 2 for the value 2, up to hole n. As each number walks past, you look
in its own hole: empty means this is the first copy, so drop a token in; occupied means you have met
this number before, so it is a duplicate. One glance per element — no searching, no hashing, no
comparing of any two values against each other.

This is the rung that makes the final one obvious. Once you see the answer as "a row of n
pigeonholes", the next question asks itself: *the input is already a row of n slots — why am I
building a second one?*`,
    worked: `Input: \`nums = [4, 3, 2, 7, 8, 2, 3, 1]\`. \`seen\` starts as nine \`False\` flags (indices 0..8; slot 0
is never used, because no value is 0).

| Step | Value | \`seen[value]\` before | Action | Answer so far |
|---|---|---|---|---|
| 1 | 4 | False | set \`seen[4] = True\` | \`[]\` |
| 2 | 3 | False | set \`seen[3] = True\` | \`[]\` |
| 3 | 2 | False | set \`seen[2] = True\` | \`[]\` |
| 4 | 7 | False | set \`seen[7] = True\` | \`[]\` |
| 5 | 8 | False | set \`seen[8] = True\` | \`[]\` |
| 6 | 2 | **True** | duplicate | \`[2]\` |
| 7 | 3 | **True** | duplicate | \`[2, 3]\` |
| 8 | 1 | False | set \`seen[1] = True\` | \`[2, 3]\` |

Eight steps, one pass, no second sweep. The input array was never written to.`,
    code: `def find_all_duplicates_flag_per_value(nums: list[int]) -> list[int]:
    seen = [False] * (len(nums) + 1)  # index by the value itself, so slot 0 goes unused
    out: list[int] = []
    for x in nums:
        if seen[x]:
            out.append(x)
        else:
            seen[x] = True
    return out`,
    mistake: `Allocating \`[False] * len(nums)\` instead of \`len(nums) + 1\`. The values run up to n inclusive, so
\`seen[n]\` has to exist — and it does not. The array \`[1]\` has n = 1, the value 1 needs slot 1, and a
one-element table only has slot 0, so the code raises \`IndexError\` on the smallest legal input. The
off-by-one is invisible on every input whose maximum value happens to be less than n, which is most
randomly generated ones, so it survives casual testing.`,
    cost: `**Time O(n), space O(n).** One pass, with an array read and possibly an array write per element —
strictly cheaper constants than the hash map, since there is no hashing and no boxing. Space is n+1
booleans, which in Python is a list of object references and in C++ can be a bitset of n bits.

This is the right choice whenever the value range is known, small, and dense, and you are allowed to
allocate — which describes an enormous number of real counting problems, not just interview ones. It
is also the version to write when the input must come back intact, because it is the fastest
approach in this file that does not touch \`nums\`.

---`,
  },
  {
    rung: "optimal",
    title: "Encode the flag in the sign, in place",
    idea: `*The flag table has exactly n+1 slots and the input has exactly n. Both are indexed by the same
values. Why are there two of them?* Because a \`True\`/\`False\` needs somewhere to live — but each
number in the input already has an unused bit: its sign. Every value is positive, so a negative
number at slot \`v - 1\` can mean "the value v has been seen", while the magnitude still holds the
original number. This fixes the flag table's weakness, the fresh allocation, and drops the extra
space to O(1). The price is that the input is destroyed.`,
    intuition: `Same row of pigeonholes as before, except now you are writing the tokens *on the array itself*. To
record "I have seen the value v", walk to slot v−1 and flip that number negative. The number living
there is not lost: minus seven is still a seven, you just have to read it with an absolute value. So
every number in the array carries two independent pieces of information at once — its magnitude is
the original data, its sign is a flag about a *different* value. When you arrive at a slot whose
number is already negative, some earlier element claimed it, and the value you are holding is the
second copy.

The one thing that trips people up: the cursor may walk onto a slot that an earlier step already
negated. That is expected, not a bug — take the absolute value first and the original number comes
straight back.`,
    worked: `Input: \`nums = [4, 3, 2, 7, 8, 2, 3, 1]\`. This is the real trace, with the array's state shown after
every mutation.

| i | value read (\`nums[i]\`) | magnitude \`v\` | target slot \`v−1\` | what was there | action | array after |
|---|---|---|---|---|---|---|
| 0 | 4 | 4 | 3 | 7 (positive) | negate slot 3 | \`[4, 3, 2, -7, 8, 2, 3, 1]\` |
| 1 | 3 | 3 | 2 | 2 (positive) | negate slot 2 | \`[4, 3, -2, -7, 8, 2, 3, 1]\` |
| 2 | **−2** | 2 | 1 | 3 (positive) | negate slot 1 | \`[4, -3, -2, -7, 8, 2, 3, 1]\` |
| 3 | **−7** | 7 | 6 | 3 (positive) | negate slot 6 | \`[4, -3, -2, -7, 8, 2, -3, 1]\` |
| 4 | 8 | 8 | 7 | 1 (positive) | negate slot 7 | \`[4, -3, -2, -7, 8, 2, -3, -1]\` |
| 5 | 2 | 2 | 1 | **−3 (negative)** | duplicate → collect \`2\` | unchanged |
| 6 | **−3** | 3 | 2 | **−2 (negative)** | duplicate → collect \`3\` | unchanged |
| 7 | **−1** | 1 | 0 | 4 (positive) | negate slot 0 | \`[-4, -3, -2, -7, 8, 2, -3, -1]\` |

Answer \`[2, 3]\`. Look at rows 2, 3, 6 and 7: the cursor read a number a *previous* step had already
flipped. \`abs()\` recovered 2, 7, 3 and 1 exactly, which is the whole reason the trick works. The
array left behind is garbage to the caller — six of eight signs flipped — and the answer cost one
integer of extra state.`,
    code: `def find_all_duplicates_sign_flip(nums: list[int]) -> list[int]:
    """Destroys nums: every visited slot is negated."""
    out: list[int] = []
    for x in nums:
        at = abs(x) - 1  # the magnitude survives the marking, so read it back with abs
        if nums[at] < 0:
            out.append(abs(x))
        else:
            nums[at] = -nums[at]
    return out`,
    mistake: `Writing \`at = x - 1\` instead of \`at = abs(x) - 1\`. On the first few elements this looks fine, because
nothing has been flipped yet — and then the cursor walks onto a slot an earlier step negated, \`x\` is
\`-2\`, and \`at\` becomes \`-3\`. Python does not complain: index −3 is a legal index counted from the end
of the list. The code cheerfully flips the wrong slot, and the answer is wrong on some inputs and
right on others depending on where the collisions land. In C or Java the same bug is an
out-of-bounds access and at least announces itself.

The mirror-image mistake is appending \`x\` instead of \`abs(x)\` to the answer. When a duplicate happens
to be read from a slot that was already flipped, you report \`-3\` instead of \`3\`.`,
    cost: `**Time O(n), space O(1).** One pass over n elements with a constant amount of work at each step — one
absolute value, one array read, at most one array write. The only extra memory is the loop variable;
the answer list is required output, not bookkeeping.

Use it when the O(1)-space follow-up is actually being asked, when the array is large enough that a
second n-sized allocation matters (memory bandwidth, an embedded target, a hot inner loop), and when
you have either confirmed the caller is done with the array or you are prepared to repair it
afterwards. Do not reach for it as a default just because it is the cleverest thing in the file — the
flag table is the same asymptotic cost, is easier to read, and is safe.

---`,
    notes: [
      { title: "the cost of mutation — who it hurts, and can it be undone", body: `This rung and the flag table produce the same answer at the same asymptotic speed. The only
difference is that this one writes over the caller's data, so the difference is not about the
algorithm, it is about the contract.

Who gets hurt:

- **A caller that still needs the array.** If it is a field on an object, a slice of a larger buffer,
  or something used again three lines later, it has been silently corrupted. Nothing throws; the next
  reader just sees negative numbers where the data used to be.
- **A concurrent reader.** If any other thread can see this array, this function is a data race and a
  correctness bug regardless of locking discipline, because it writes to nearly every slot. The
  flag-table version is safe to run from ten threads at once on the same input; this one is not.
- **A shared, cached, or memory-mapped array.** Writing may be genuinely illegal (a read-only mapping
  faults) or expensive (a copy-on-write page is now dirty).

**Can it be undone?** Yes, and cheaply. The transformation here is *pure sign flipping*, and flipping
a sign twice restores the number, so one extra pass — \`for i in range(len(nums)): nums[i] =
abs(nums[i])\` — restores the array exactly, because the input was promised to be all positive to
begin with. That adds O(n) time and keeps O(1) space. If the caller needs their array back, the
honest version is: do the work, then repair.

What matters is *what kind* of mutation it is. Nothing here is ever moved — only signs change — so
the positions, and therefore the order, survive untouched. That is a real advantage over the
swap-based in-place tricks used in \`first-missing-positive\` and \`missing-number\`, where the
permutation genuinely scrambles the input and undoing it would cost more bookkeeping than the trick
saves.

The rule worth carrying: **if you mutate the input, say so in the signature, the docstring, or the
function name.** Half the production bugs caused by this pattern are not in the algorithm; they are
in a caller who read the name \`find_duplicates\` and had no reason to suspect it was a writer.` },
    ],
  },
  ],
  arc: `The principle every rung of this ladder chases is *stop paying for information the constraints
already gave you*. The pair scan pays for it in time, asking "have I seen this before?" by re-reading
the tail n times over, which is the quadratic wall. Sorting buys the answer by imposing an order on
the data — that works for anything comparable, but it charges n log n for an arrangement the answer
never reads. The hash map drops the ordering and stores presence directly, correct and linear and
completely general, but it hashes keys that were promised to be small dense integers, which is a
computation bought and thrown away. The flag table strips that away too: values 1..n index straight
into a row of n+1 pigeonholes, one memory read each, no hashing at all. And then comes the
observation the whole problem was built around: **that row of n+1 pigeonholes is a near-copy of the
input, which is already a row of n slots indexed by exactly the same numbers.** The second table was
never new information — it was the first one, paid for twice. Encoding the flag in the sign of
\`nums[v-1]\` collapses the two into one and the extra space goes to nothing. That collapse is the
transferable idea, and it costs something real every time you use it: the data now carries two
meanings at once, so every read has to strip the marking off before trusting the value, and the
caller's array is no longer the caller's array. The same move with a different marking scheme is what
solves \`first-missing-positive\` (swap each value into its own slot) and \`missing-number\` (the same
swap, or an arithmetic invariant that never touches the array at all) — and the question to ask at
the top of any of them is identical: *what does the constraint promise about the values, and is there
already a structure of exactly that shape lying around?*

---`,
  comparison: {
      "head": [
          "Approach",
          "Time",
          "Space",
          "Core trade-off",
          "Best used when"
      ],
      "rows": [
          [
              "Compare every pair",
              "O(n²)",
              "O(1)",
              "Zero assumptions, zero memory, quadratic time",
              "n is tiny, values are not numbers in a known range, or you need a reference oracle"
          ],
          [
              "Sort, read neighbours",
              "O(n log n)",
              "O(n)",
              "Buys adjacency with ordering work the answer never uses",
              "Values are unbounded or non-integer, or you want the answer sorted anyway"
          ],
          [
              "Count in a hash map",
              "O(n)",
              "O(n)",
              "Linear time for linear memory; fully general keys",
              "Values are arbitrary or non-integer, or the question becomes \"appears k times\""
          ],
          [
              "A flag per value",
              "O(n)",
              "O(n)",
              "Trades the map's generality for direct indexing",
              "Values are 1..n, allocation is fine, and the input must survive"
          ],
          [
              "Sign flip in place",
              "O(n)",
              "O(1)",
              "Same speed as the flag table, no allocation — pays by destroying the input",
              "The O(1)-space follow-up is asked and the caller can spare the array (or you repair it)"
          ]
      ]
  },
  interview: `**Know cold: the sign-flip in-place version, and the flag-per-value table.** Those two are the
matched pair this question exists to test. The flag table is what you say first — it is obviously
correct, it is linear, and stating it proves you have spotted the \`1 <= nums[i] <= n\` constraint. The
sign flip is what you say when the interviewer asks for constant space, and the sentence that earns
the point is *"every value is positive and every value is a valid index, so the sign of \`nums[v-1]\`
is a free bit I can use as the flag."* Be ready for the two follow-ups that always come: *what if
values could be negative?* (the trick dies; you need the flag table or an offset scheme) and *can you
give me my array back?* (yes — one pass of \`abs\`, because sign flipping is its own inverse).

**Worth having ready as the opener: the hash map.** Not because it is impressive, but because it is
the honest general answer and naming it takes ten seconds. It is also the version you would actually
ship when the value range is not guaranteed by a type system.

**Understand but do not drill: the pair scan and the sort.** The pair scan's entire value is as the
baseline you name in the first thirty seconds and as the oracle you cross-check against — it plays
exactly that role in the script below. The sort is worth one sentence ("n log n, and it moves the
caller's data for an ordering the answer does not need"), because dismissing it for the right reason
shows you are choosing rather than pattern-matching.

---`,
  scriptNote: `Every approach in one file, checked against the statement's example, the smallest legal input
(\`[1]\`), an array that is nothing but a duplicate, an array with no duplicates at all, an array where
every value is doubled, and a randomised stress test. Each approach is handed **its own copy of the
data**, because the sign-flip rung wrecks the array it is given and the next approach would otherwise
read corrupted input. Every answer is **sorted before comparison**, because the order of the answer
is not part of the answer.`,
  script: `"""Every Value That Appears Twice — every approach in one file, cross-checked.

Run: python find_all_duplicates.py
"""

from __future__ import annotations

import random
from typing import Callable


def find_all_duplicates_compare_every_pair(nums: list[int]) -> list[int]:
    out: list[int] = []
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                out.append(nums[i])
    return out


def find_all_duplicates_sort_then_neighbours(nums: list[int]) -> list[int]:
    ordered = sorted(nums)
    out: list[int] = []
    for i in range(1, len(ordered)):
        if ordered[i] == ordered[i - 1]:
            out.append(ordered[i])
    return out


def find_all_duplicates_count_in_hash_map(nums: list[int]) -> list[int]:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    out: list[int] = []
    for v in range(1, len(nums) + 1):
        if counts.get(v, 0) == 2:
            out.append(v)
    return out


def find_all_duplicates_flag_per_value(nums: list[int]) -> list[int]:
    seen = [False] * (len(nums) + 1)  # index by the value itself, so slot 0 goes unused
    out: list[int] = []
    for x in nums:
        if seen[x]:
            out.append(x)
        else:
            seen[x] = True
    return out


def find_all_duplicates_sign_flip(nums: list[int]) -> list[int]:
    """Destroys nums: every visited slot is negated."""
    out: list[int] = []
    for x in nums:
        at = abs(x) - 1  # the magnitude survives the marking, so read it back with abs
        if nums[at] < 0:
            out.append(abs(x))
        else:
            nums[at] = -nums[at]
    return out


APPROACHES: list[tuple[str, Callable[[list[int]], list[int]]]] = [
    ("compare every pair", find_all_duplicates_compare_every_pair),
    ("sort, read neighbours", find_all_duplicates_sort_then_neighbours),
    ("count in hash map", find_all_duplicates_count_in_hash_map),
    ("a flag per value", find_all_duplicates_flag_per_value),
    ("sign flip in place", find_all_duplicates_sign_flip),
]


def run_case(label: str, nums: list[int]) -> bool:
    # Each approach gets its OWN copy: the sign-flip rung wrecks the array it is handed.
    results = [(name, sorted(fn(list(nums)))) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  nums={nums}")
    for name, r in results:
        print(f"    {name:<22} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def _random_valid(n: int) -> list[int]:
    """Length n, values in 1..n, each value present once or twice."""
    k = random.randint(0, n // 2)              # how many values appear twice
    present = random.sample(range(1, n + 1), n - k)
    doubled = random.sample(present, k)
    bag = present + doubled
    random.shuffle(bag)
    return bag


def main() -> None:
    ok = True
    ok &= run_case("example from the statement", [4, 3, 2, 7, 8, 2, 3, 1])
    ok &= run_case("smallest legal input (n = 1)", [1])
    ok &= run_case("nothing but a duplicate", [2, 2])
    ok &= run_case("no duplicates at all", [1, 2, 3])
    ok &= run_case("every value doubled", [3, 1, 3, 1])

    random.seed(7)
    checked = 0
    for _ in range(500):
        nums = _random_valid(random.randint(1, 40))
        expected = sorted(find_all_duplicates_compare_every_pair(list(nums)))
        for name, fn in APPROACHES:
            got = sorted(fn(list(nums)))
            if got != expected:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} {got} != {expected}")
        checked += 1
    print(f"stress: {checked} random legal arrays, all five approaches cross-checked "
          f"against brute force")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`,
  scriptOutput: `\`\`\`
example from the statement
  nums=[4, 3, 2, 7, 8, 2, 3, 1]
    compare every pair     -> [2, 3]
    sort, read neighbours  -> [2, 3]
    count in hash map      -> [2, 3]
    a flag per value       -> [2, 3]
    sign flip in place     -> [2, 3]
    all agree: True
smallest legal input (n = 1)
  nums=[1]
    compare every pair     -> []
    sort, read neighbours  -> []
    count in hash map      -> []
    a flag per value       -> []
    sign flip in place     -> []
    all agree: True
nothing but a duplicate
  nums=[2, 2]
    compare every pair     -> [2]
    sort, read neighbours  -> [2]
    count in hash map      -> [2]
    a flag per value       -> [2]
    sign flip in place     -> [2]
    all agree: True
no duplicates at all
  nums=[1, 2, 3]
    compare every pair     -> []
    sort, read neighbours  -> []
    count in hash map      -> []
    a flag per value       -> []
    sign flip in place     -> []
    all agree: True
every value doubled
  nums=[3, 1, 3, 1]
    compare every pair     -> [1, 3]
    sort, read neighbours  -> [1, 3]
    count in hash map      -> [1, 3]
    a flag per value       -> [1, 3]
    sign flip in place     -> [1, 3]
    all agree: True
stress: 500 random legal arrays, all five approaches cross-checked against brute force

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``,
}

export default doc
