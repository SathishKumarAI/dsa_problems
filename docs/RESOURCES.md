# Resources — a study guide for arrays and linked lists

The two patterns that carry the most interview problems, and the shortest path through them. The
repo's own material is the practice; this file is the reading around it. Problem ids below are
this app's ids (`src/data/problems/**`), so `pair-sum` is a route you can open, not a citation.

## How to use this list

**Before a pattern**, read one row of the tables below — the idea and its tell — and nothing else;
five lines is enough to recognise the shape, and the journey teaches the rest by making you earn
it. **After failing a problem**, read the editorial for *that* problem and then the one row whose
"classic mistake" column names what you did, because a mistake you have just made is the only
context in which a warning sticks. **Do not watch videos to learn a pattern**: passive viewing
produces recognition, not recall, and recognition is exactly what fails when the editor is blank —
the only reading that pays is reading done with a half-written solution in front of you.

## Arrays: the six ideas that cover most problems

| The idea | The tell in the statement | Learn it on | The classic mistake |
|---|---|---|---|
| **Two pointers converging** — one index from each end, move the end that cannot be part of a better answer | "sorted array", "find two", "the most water", "is it a palindrome"; the answer is a pair or a span, and moving an end changes the score monotonically | `sorted-pair-sum`, `sorted-squares`, `valid-palindrome`, `container-water`, `trap-rain-water` | Moving the wrong end, and being unable to say why the other one is safe to discard. In `container-water`, moving the *taller* wall can never increase the area — the width shrinks and the height is still capped by the shorter wall. If you cannot state that sentence, the loop is a guess |
| **Fast and slow (read index and write index)** — one pointer reads every element, a second writes only the ones that survive | "in place", "O(1) extra space", "return the new length", "the order of the rest must be preserved" | `move-zeroes`, `remove-duplicates-sorted`, `sort-colors`, `is-subsequence` | Advancing the write index on an element you skipped, so a survivor gets overwritten. The invariant is: everything before `write` is final, everything from `read` on is untouched, and the gap between them is garbage you are allowed to clobber |
| **Prefix sums** — precompute running totals so any range answer is one subtraction | "contiguous subarray", "sum equals k", "product of everything else", "range query"; the array is read-only and the same question is asked at every index | `subarray-sum-k`, `product-except-self`, `trap-rain-water` (prefix and suffix maxima), `max-subarray` | Forgetting the empty prefix. `subarray-sum-k` seeds its map with one occurrence of sum `0`; without it every subarray starting at index 0 is missed, and `[1, 1], k = 1` returns 1 instead of 2. The second mistake is reaching for a sliding window instead: with negative values the running sum is not monotonic, which is why that problem's constraints say so out loud |
| **Hash map as an index** — turn "have I seen X" or "where is X" from a scan into a lookup | "return the indices", "any duplicate", "group these", "how many times"; a nested loop whose inner loop only searches | `pair-sum`, `contains-duplicate`, `group-anagrams`, `longest-consecutive-run`, `valid-anagram` | Inserting before looking up, so an element pairs with itself: on `nums = [3, 4], target = 6`, a one-pass Two Sum that stores `3` and then asks for `6 - 3` finds its own index. Look up, then insert. The other one is trusting iteration order — it is insertion order in CPython, and that is an implementation detail, not something to build an answer on |
| **Sort, then scan** — pay O(n log n) once to make the useful elements adjacent | "duplicates", "anagrams", "k-th largest", "intervals"; the naive answer is O(n²) and the property you need is about neighbours, not positions | `contains-duplicate` (the "sort first" rung), `group-anagrams` (sorted letters as the key), `three-sum-zero`, `longest-consecutive-run` (the sort rung, which the hash-set rung then beats) | Sorting when the *indices* are the answer — `pair-sum` returns positions, and a sort destroys them unless you carry each original index with its value. And sorting out of habit when an O(n) pass exists: `longest-consecutive-run` keeps both rungs on the page precisely so you can watch the sort get beaten |
| **In-place index-as-a-hash** — when values are confined to a small known range, the value itself names the slot it belongs in | "values are in the range 1..n", "colours 0, 1, 2", "find the missing / the duplicated one", together with "O(1) extra space" | `sort-colors` is the closest of the older problems — the value decides which of three regions it is written to. The pure form is the missing-number family (`missing-number`, `first-missing-positive`), which was being added to `arrays-hashing` as this file was written; if a link 404s, that is why | Using `if` where the swap needs `while`: after swapping a value into its home the value swapped *back* also needs placing, so you re-test the same index until it settles. And the sign-marking variant silently breaks on a `0`, which has no sign to flip |

Two flavours of "two pointers" get conflated and should not be: **converging** (`lo` and `hi` walk
toward each other over one array) and **parallel** (two indices walking forward, usually over two
inputs — `is-subsequence`, `merge-two-sorted`). The termination argument differs. Converging
terminates because the gap shrinks every iteration; parallel terminates because at least one index
advances every iteration, and that is the condition you actually have to check as you write it.

## Linked lists: the five moves

Almost every list problem is one or two of these composed. Each row names the invariant, because
the invariant is what people break — the move itself is three lines.

| The move | The tell | The invariant you must keep true | Learn it on | The classic mistake |
|---|---|---|---|---|
| **Dummy head** — allocate a node in front of the real head and build from it | The head itself can be deleted, replaced, or is the answer; the list can be empty; you catch yourself writing `if head is None` twice | `dummy.next` is the answer at all times, so `head` goes stale the moment anything changes and must never be returned. Whatever `tail` points at is the last *committed* node | `merge-two-sorted`, `remove-nth-from-end` | `return head` instead of `return dummy.next` — correct on every input where the first node survives, wrong on exactly the case the dummy was added for. When splicing, the other one is forgetting that the tail still points into the source list |
| **Fast and slow** — two pointers at different speeds, or the same speed with a fixed gap | "the middle", "is there a cycle", "the nth from the end", "in one pass, O(1) space" | Before every dereference both `fast` and `fast.next` exist — that is what `while fast is not None and fast.next is not None` buys. With a gap, the gap is *exactly* n for the whole walk, so it must be established before the joint walk starts | `middle-of-list`, `cycle-detect`, `remove-nth-from-end` | The even-length middle. `while fast and fast.next` leaves `slow` on the **second** of the two middles (what `middle-of-list` returns); `while fast.next and fast.next.next` leaves it on the first. Both are correct loops for different problems — choose on purpose, and test a 4-node list |
| **Reverse in place** — three pointers, `previous` / `current` / `next` | "reverse", "compare front to back", "reorder"; anything needing a backwards walk through a structure with no back pointers | At the top of every iteration: `previous` heads the already-reversed prefix, `current` heads the untouched suffix, and no node is orphaned — which means `nxt = current.next` is saved **before** `current.next` is overwritten | `reverse-list`, `palindrome-list` | Returning `current` (it is `None` when the loop ends) instead of `previous`. Worth knowing too that the loop is already correct on the empty list and the single node with no special case — if you wrote one, you did not trust the invariant |
| **Split and weave** — find the middle, reverse or reorder one half, then compare or interleave the two | "palindrome", "reorder the list", "is the second half like the first"; the answer needs both ends at once | Decide whether the front half's tail is terminated. `palindrome-list` deliberately does **not** terminate it — the first half still points into the reversed second half, and that is safe only because the comparison stops when the reversed side runs out. If you *weave* rather than compare you must set `first_tail.next = None` or you build a cycle | `palindrome-list` | Assuming the caller's list survives. Reversing a half mutates the input; if the list is read again after your call you owe it a second reverse to restore it. Say which contract you are honouring |
| **Two-pass with a length** — count the nodes, then walk to a computed position | "the nth from the end", "the middle", "rotate by k" (where `k` can exceed the length, so `k % n` is needed anyway) | The list must not change between the passes, and both passes count from the same end. To *delete* at position i you must stop at i−1, so the walk is one step shorter than the one that merely *finds* it | `remove-nth-from-end` ("count, then walk forward"), `middle-of-list` ("count, then walk half") | Walking `n - k` steps when you need `n - k - 1` to hold the predecessor. This is the whole reason a dummy head earns its allocation: with it the first node has a predecessor and the off-by-one disappears |

The one-pass and two-pass versions of the same problem are both worth writing. The two-pass is the
one you can always derive under pressure; the one-pass is the one that shows you understood why the
gap works. `remove-nth-from-end` carries both on its page for that reason.

## The inputs that break a first draft

Run these in your head before you submit. Each column says what the input is *for* — a test that
cannot fail is not a test.

| Input | Arrays: what it catches | Linked lists: what it catches |
|---|---|---|
| Empty | A `while lo < hi` loop is fine; a `for i in range(1, n)` that assumes `a[0]` exists is not | Whether `head is None` reaches a dereference. The three-pointer reverse survives it for free; a two-pass length walk usually does not |
| One element | Converging pointers that start equal, and any answer built from a *pair* | The middle of a one-node list is the node itself, and "remove the 1st from the end" is the case that needs the dummy |
| Two elements | Off-by-one in the loop bound — the difference between `<` and `<=` shows up here and nowhere smaller | The even-length middle: this is the smallest list where the two `while` conditions disagree |
| All values equal | Duplicate-skipping (`three-sum-zero`) and any "strictly greater" comparison quietly written as `>=` | A cycle check where every value is identical — identity, not equality, is what `cycle-detect` compares |
| Negatives, and a zero | Sliding windows that assumed a growing sum only grows (`subarray-sum-k`), and sign-marking tricks that have no sign to flip on `0` | Nothing list-specific, but a `0` value is the classic reason a `while node.val:` guard is wrong; test `node is not None` |
| The parameter at its bound | `k == len(nums)`, `target` unreachable, an answer at index 0 or n−1 | `n` equal to the length in `remove-nth-from-end` — that is "remove the head", the case the dummy exists for |

## Complexity you should be able to derive on the spot

Not memorise — derive. The reason column is the part that gets asked as the follow-up.

| Operation | Cost | Why |
|---|---|---|
| `a[i]` on a Python list | O(1) | The list is a contiguous block of pointers; the address is `base + i * width`, one multiply and one load. Nothing is searched |
| `a.append(x)` | **Amortised O(1)**, worst case O(n) | The buffer grows *geometrically*, not by one. CPython's `list_resize` over-allocates by roughly an eighth of the new size, so growing to n elements copies about n/8 + n/64 + … elements in total — a geometric series bounded by a constant multiple of n. Spread over n appends that is O(1) each, but the single append that triggers a resize really is O(n), so "amortised" is not a synonym for "always" |
| `a.pop()` (from the end) | O(1) | Decrement the size; nothing moves. CPython does not shrink the buffer until the list is well under a quarter full, so append/pop churn at the end does not thrash |
| `a.insert(0, x)`, `a.pop(0)` | O(n) | Every element after the insertion point shifts one slot — a single `memmove`, so it is cheap per element and still linear. `collections.deque` gives O(1) at both ends |
| `a[i:j]` | O(j − i) | A slice copies. A loop that slices inside itself is one degree worse than it looks |
| `x in a` (list) versus `x in s` (set or dict) | O(n) versus O(1) average | The list compares; the set hashes once and probes. That O(1) is an average — adversarial or badly distributed keys degrade toward O(n), which is the honest answer when the worst case is asked for |
| `sorted(a)` | O(n log n), and O(n) on already-sorted input | Timsort finds existing ascending or descending runs and merges them; a sorted or reverse-sorted array is one run and costs a single pass |
| Insert or delete a linked-list node **given the node** | O(1) | Two pointer writes. There is no shifting to do because nothing is contiguous |
| **Finding** that node | O(n) | There is no arithmetic from an index to an address; you have to walk. This is why "linked lists have O(1) insertion" is a half-truth: it is O(1) *after* an O(n) search, so inserting at a position given by index costs O(n) in total, exactly like the array |
| Walking n array elements versus n list nodes | Both O(n); the array is commonly an order of magnitude faster in wall clock | A cache line is 64 bytes. A contiguous array yields 8 or 16 useful values per cache miss, and the hardware prefetcher predicts the constant stride, so most accesses never wait on memory. List nodes sit wherever the allocator put them, so each hop can be a miss the prefetcher cannot anticipate, and a miss to main memory costs on the order of a hundred cycles. Big-O counts operations; it does not count which operations stall |
| Recursion over an n-node list | O(n) stack | Each frame is real memory. CPython's default recursion limit is 1000, so the recursive rung of `reverse-list` raises `RecursionError` on a 10,000-node input while the three-pointer loop does not notice — a correctness reason to prefer the iterative form, not a stylistic one |
| Building a prefix-sum array | O(n) once, then O(1) per range query | Each entry is the previous entry plus one element. It pays from the second query onward, and never if the array is mutated between queries |

## Where to learn more

The "bad for" column is the point of this table. A list where everything is excellent tells you
nothing about what to open tonight.

| Resource | Good for | Bad for |
|---|---|---|
| **CLRS**, *Introduction to Algorithms*, Cormen/Leiserson/Rivest/Stein, 4th ed. (no link — check the MIT Press listing rather than trust a URL from memory) | The reference you consult, and the only source that makes loop invariants and amortised analysis rigorous. Its amortised-analysis chapter — the accounting and potential methods — is the actual proof behind the `append` row above | A first read, and a linear read. The pseudocode is 1-indexed and not runnable, there is no interview framing, and the exercises are a graduate course. Looking one section up is fine; "reading CLRS" is a plan that fails |
| **Sedgewick & Wayne**, *Algorithms*, 4th ed. — https://algs4.cs.princeton.edu/home/ | Implementations you can run, and the clearest treatment anywhere of sorting and union-find. The free booksite carries the figures and the code without the book | Java-flavoured, and thinner than CLRS on dynamic programming and on analysis itself. No interview problems, and its API conventions are the book's own rather than the language's |
| **Skiena**, *The Algorithm Design Manual* — https://www.algorist.com/ | The war stories, genuinely — each is a real job where modelling a problem as the wrong known problem cost months, and that failure mode is what interviews test. Part 2's catalogue is the best "what is this problem actually called" lookup in print | Part 1 is a survey, so it explains less per topic than CLRS; if you want a proof, wrong book. Catalogue entries hand you literature references you will not follow up |
| **CPython `listobject.c`** — https://github.com/python/cpython/blob/main/Objects/listobject.c | Settling arguments with the source. The comment above `list_resize` states the over-allocation growth pattern exactly, and `list_ass_slice` is the `memmove` behind `insert(0, x)`. Ten minutes here replaces a lot of hand-waving about amortised cost | It is C, and it is CPython-specific: none of it is a language guarantee, and PyPy or MicroPython may differ. Do not cite an implementation detail as a property of "Python" |
| **Python time-complexity table** — https://wiki.python.org/moin/TimeComplexity | One page covering list, deque, set and dict, with average and amortised costs side by side. The fastest way to check whether the thing you just wrote inside a loop was secretly O(n) | A community wiki with no version stamp — a strong hint, not a citation. Average versus worst case is easy to misread in a hurry |
| **The LeetCode editorial for a problem you have already attempted** — `https://leetcode.com/problems/<slug>/editorial/` (every problem here carries its slug in `Problem.leetcode`) | The official complexity accounting, and usually the same worst-to-best ladder this repo builds a journey from. Read after a real attempt, it names the gap in your reasoning precisely | Read before an attempt, it converts a skill into a memory and you will not notice for weeks. Quality varies enormously by problem and by age, some are paywalled, and the community solutions below them are frequently wrong about their own complexity |
| **Neetcode roadmap** — https://neetcode.io/roadmap | A defensible topic order with the dependencies drawn, which answers "what should I learn before what" better than any list of 150 problems does | Video-first, the mode this file opens by warning against. The list optimises for coverage; the discipline of staying on one problem until you can re-derive it cold is not in the roadmap and has to come from you |
| **visualgo.net** — https://visualgo.net/en | Watching a structure actually move, once, when your model of the pointers is wrong — a list splice, a heap sift, a BST rotation. Thirty seconds of the right animation beats a page of prose about `previous` and `current` | Passive, and generic: it animates textbook operations, never the problem you are stuck on. For that, this repo's journeys are the better tool, because they make you predict before they show you |

## Drilling plan

Four weeks, and "done" is a thing you can fail. If a week's exit condition is not met, repeat the
week — the schedule is the flexible part, not the gate.

| Week | Drill | Done when |
|---|---|---|
| **1 — array pointers** | `sorted-pair-sum`, `valid-palindrome`, `sorted-squares`, `move-zeroes`, `remove-duplicates-sorted`, `sort-colors`. Each from a blank file, no page open | You write the `sorted-squares` fill-from-the-back loop with no index error on the first try on two different days, on inputs of length 0, 1 and 2 as well as the sample. Plus: you can say out loud, in one sentence and without drawing, why `container-water` moves the shorter wall |
| **2 — hashing and prefix sums** | `pair-sum`, `contains-duplicate`, `group-anagrams`, `subarray-sum-k`, `product-except-self`, `max-subarray` | You can construct from memory a 3-element input on which `subarray-sum-k` returns the wrong count if its map is not seeded with `{0: 1}`, and explain why `product-except-self` needs no division even when no element is zero |
| **3 — linked lists** | `reverse-list`, `middle-of-list`, `cycle-detect`, `merge-two-sorted`, `remove-nth-from-end`, `palindrome-list` | The three-pointer reverse comes out with no off-by-one on the first try, twice in a row, handling the empty list and the single node with no special case. And you can state which `while` condition lands `slow` on the first middle versus the second, without running it |
| **4 — mixed and timed** | Ten problems drawn at random from weeks 1–3, 20 minutes each, no hints and no editorial until the timer ends. Then write out the complexity table above from memory | Eight of the ten are correct on the first submission, and your written table has the **why** column filled in, not just the costs. A cost you can state but not derive counts as a miss |

After week 4 these ideas are no longer the bottleneck. The patterns that come next in the practice
set — `sliding-window`, `binary-search`, `stack` — each reuse the pointer discipline drilled here,
which is the order [`PROBLEMS.md`](PROBLEMS.md) puts them in.
