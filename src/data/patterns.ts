import type { Pattern } from "./types.ts"

// Order here = order in the sidebar (rough difficulty ramp).
export const PATTERNS: Pattern[] = [
  {
    id: "arrays-hashing",
    name: "Arrays & Hashing",
    glyph: "{ k→v }",
    blurb:
      "Trade memory for speed: one pass with a hash map replaces a nested scan.",
    references: [
      {
        title: "Hash table",
        href: "https://en.wikipedia.org/wiki/Hash_table",
        kind: "reference",
        note: "What the table actually does with your key - buckets, collisions, and why O(1) is an average and not a promise.",
      },
      {
        title: "Sedgewick & Wayne, Hash Tables",
        href: "https://algs4.cs.princeton.edu/34hash/",
        kind: "course",
        note: "Separate chaining and linear probing, built up from code. Read this when you want to know what your language is doing for you.",
      },
      {
        title: "Python: dict and set",
        href: "https://docs.python.org/3/library/stdtypes.html",
        kind: "docs",
        note: "The guarantees you may actually rely on - including that insertion order is a language promise in CPython, and hash order is not.",
      },
    ],
    // The six ideas, lifted out of docs/RESOURCES.md, which nothing in src/
    // could read, so the best writing in the repository reached no screen.
    // Order is the order they are worth learning, not difficulty.
    playbook: [
      {
        name: "Two pointers converging",
        idea: "One index from each end, walking inward; each step moves the end that cannot be part of a better answer.",
        tell: '"sorted array", "find two", "the most water", "is it a palindrome" — the answer is a pair or a span, and moving an end changes the score monotonically.',
        invariant:
          "Everything outside [lo, hi] has been ruled out on purpose, and you can say why. The gap shrinks every iteration, which is the whole termination argument.",
        learnOn: ["sorted-pair-sum", "valid-palindrome", "container-water"],
        mistake:
          "Moving the wrong end, and being unable to say why the other one is safe to discard. In container-water, moving the TALLER wall can never increase the area — the width shrinks and the height is still capped by the shorter wall. If you cannot state that sentence, the loop is a guess.",
      },
      {
        name: "Read index and write index",
        idea: "One pointer reads every element, a second writes only the ones that survive — the array is compacted in place behind it.",
        tell: '"in place", "O(1) extra space", "return the new length", "the order of the rest must be preserved".',
        invariant:
          "Everything before write is final, everything from read on is untouched, and the gap between them is garbage you are allowed to clobber.",
        learnOn: ["move-zeroes", "remove-duplicates-sorted", "sort-colors"],
        mistake:
          "Advancing the write index on an element you skipped, so a survivor gets overwritten. The write index moves only when something is written.",
      },
      {
        name: "Prefix sums",
        idea: "Precompute running totals once, so any range answer becomes a single subtraction.",
        tell: '"contiguous subarray", "sum equals k", "product of everything else", "range query" — the array is read-only and the same question is asked at every index.',
        learnOn: ["subarray-sum-k", "product-except-self", "max-subarray"],
        mistake:
          "Forgetting the empty prefix. subarray-sum-k seeds its map with one occurrence of sum 0; without it every subarray starting at index 0 is missed, and [1, 1] with k = 1 returns 1 instead of 2. The second mistake is reaching for a sliding window: with negative values the running sum is not monotonic, which is why that problem's constraints say so out loud.",
      },
      {
        name: "Hash map as an index",
        idea: 'Turn "have I seen X" or "where is X" from a scan into a lookup.',
        tell: '"return the indices", "any duplicate", "group these", "how many times" — or a nested loop whose inner loop only searches.',
        learnOn: [
          "pair-sum",
          "contains-duplicate",
          "group-anagrams",
          "valid-anagram",
        ],
        mistake:
          "Inserting before looking up, so an element pairs with itself: on nums = [3, 4] with target 6, a one-pass Two Sum that stores 3 and then asks for 6 − 3 finds its own index. Look up, then insert. The other one is trusting iteration order — it is insertion order in CPython, an implementation detail, not something to build an answer on.",
      },
      {
        name: "Sort, then scan",
        idea: "Pay O(n log n) once to make the useful elements adjacent, then answer in one linear pass.",
        tell: '"duplicates", "anagrams", "k-th largest", "intervals" — the naive answer is quadratic and the property you need is about neighbours, not positions.',
        learnOn: [
          "contains-duplicate",
          "group-anagrams",
          "longest-consecutive-run",
        ],
        mistake:
          "Sorting when the INDICES are the answer — pair-sum returns positions, and a sort destroys them unless you carry each original index with its value. And sorting out of habit when an O(n) pass exists: longest-consecutive-run keeps both rungs on the page precisely so you can watch the sort get beaten.",
      },
      {
        name: "The value names its own slot",
        idea: "When values are confined to a small known range, the value itself says which index it belongs at — so the array becomes its own hash table.",
        tell: '"values are in the range 1..n", "colours 0, 1, 2", "find the missing or the duplicated one", together with "O(1) extra space".',
        learnOn: ["sort-colors", "missing-number", "first-missing-positive"],
        mistake:
          "Using if where the swap needs while: after swapping a value into its home, the value swapped BACK also needs placing, so you re-test the same index until it settles. And the sign-marking variant silently breaks on a 0, which has no sign to flip.",
      },
    ],
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    glyph: "i→ ←j",
    blurb:
      "Sorted or symmetric input: move two indices toward each other instead of trying all pairs.",
    references: [
      {
        title: "USACO Guide: Two Pointers",
        href: "https://usaco.guide/silver/two-pointers",
        kind: "course",
        note: "The converging and parallel forms side by side, with the termination argument for each - the part people skip and then get wrong.",
      },
      {
        title: "Cycle detection",
        href: "https://en.wikipedia.org/wiki/Cycle_detection",
        kind: "reference",
        note: "Why a fast pointer and a slow one must meet inside a cycle. The proof is short, and it is the thing an interviewer asks for.",
      },
      {
        title: "Tortoise and hare",
        href: "https://cp-algorithms.com/others/tortoise_and_hare.html",
        kind: "reference",
        note: "The same algorithm written as code, plus how to recover the START of the cycle once you know one exists.",
      },
    ],
    // The moves, in the order they are worth learning. Every `learnOn` id is
    // checked by `data/problems.test.ts`, so a row cannot point at a problem
    // that was renamed or never existed.
    playbook: [
      {
        name: "Converging from both ends",
        idea: "One index at each end walking inward. At every step you can prove that one of the two ends cannot belong to a better answer than the one you already have, so you move that end and never look at it again.",
        tell: '"sorted", "find two that…", "the most water", "reads the same backwards" — the answer is a PAIR or a SPAN, and moving an end changes the score in a direction you can predict.',
        invariant:
          "Everything outside [lo, hi] has been ruled out deliberately, and you can say which end ruled it out and why. The gap shrinks every iteration, which is the entire termination argument.",
        learnOn: ["sorted-pair-sum", "container-water", "valid-palindrome", "trap-rain-water"],
        mistake:
          "Moving the wrong end, because you reasoned about the VALUE instead of the bound. In container-water the shorter wall moves — moving the taller one can only lose height and width at once, so it can never improve. Say out loud which end you are allowed to discard before you write the branch.",
      },
      {
        name: "A reader and a writer",
        idea: "Two indices walking the SAME direction at different speeds: the reader visits every element, the writer marks where the next kept element belongs. The gap between them is exactly how much has been dropped.",
        tell: '"in place", "remove", "move the X to the end", "keep the relative order" — you are compacting an array into itself and the answer is a new LENGTH as much as a new arrangement.',
        invariant:
          "Everything before `write` is final and correct. Nothing after the reader has been touched. That is why the two can never collide destructively — the writer is never ahead.",
        learnOn: ["move-zeroes", "remove-element", "remove-duplicates-sorted"],
        mistake:
          "Advancing the writer on every element rather than only on a kept one, which turns the compaction into a copy. The tell that you have it right: on an input where nothing is dropped, `write` ends equal to the length and every swap was with itself.",
      },
      {
        name: "Fill from the back",
        idea: "When writing forward would overwrite something you still need to read, write BACKWARDS instead — start at the last slot and take the larger of the two candidates each time.",
        tell: '"merge into the first array", "the result is as long as the input", "no extra space" — there is spare room at the END, and a forward pass would clobber unread input.',
        invariant:
          "Every slot at or after the write cursor already holds its final value, and both read cursors still point at unconsumed input.",
        learnOn: ["merge-sorted-array", "sorted-squares"],
        mistake:
          "Running out of one input and forgetting the other still has values to drain. Only ONE of the two drains matters — the one from the array you are not writing into is already in place — and getting that backwards passes every test where the arrays interleave evenly.",
      },
      {
        name: "Fix one, converge the rest",
        idea: "For a question about three values, fix the first with an outer loop and let a converging pair answer the remaining two-value question in linear time. Sorting first is what makes the inner pair legal.",
        tell: '"three numbers", "triplets", "closest to a target" — a k-value question where k − 1 of them can be found by the move above.',
        invariant:
          "The outer index only moves forward, and for each of its positions the inner pair covers the whole remaining range exactly once — so the total is n outer steps times n inner steps and not n³.",
        learnOn: ["three-sum-zero", "three-sum-closest"],
        mistake:
          "Producing the same triplet twice. Skipping duplicates has to happen at BOTH levels — the anchor and the two pointers — and the anchor skip is the one people forget, because the inner skip makes the output look right on small inputs.",
      },
      {
        name: "Two cursors over two sequences",
        idea: "The same walk, but the two indices are in different arrays. Advance whichever one cannot yet be matched; you never rewind, so the cost is the sum of the two lengths rather than their product.",
        tell: '"is A a subsequence of B", "merge", "compare two streams" — two ordered inputs and a question about how they line up.',
        learnOn: ["is-subsequence", "merge-sorted-array", "backspace-compare"],
        mistake:
          "Advancing both cursors on a mismatch. Only the one that is behind may move; advancing both skips the very element that would have matched next, and it fails on exactly the inputs where the answer is yes.",
      },
    ],
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    glyph: "[■■□]→",
    blurb:
      "Best contiguous run: grow the right edge, shrink the left when the window breaks a rule.",
    references: [
      {
        title: "Sliding window minimum",
        href: "https://cp-algorithms.com/data_structures/stack_queue_modification.html",
        kind: "reference",
        note: "The monotonic deque: how to keep the minimum of a moving window in O(1) amortised, which is the one hard version of this pattern.",
      },
      {
        title: "Amortized analysis",
        href: "https://en.wikipedia.org/wiki/Amortized_analysis",
        kind: "reference",
        note: "Why a window with a nested-looking inner loop is still O(n). If you cannot explain that, you cannot defend the solution.",
      },
      {
        title: "USACO Guide: Two Pointers",
        href: "https://usaco.guide/silver/two-pointers",
        kind: "course",
        note: "Files the sliding window under two pointers, which is the honest taxonomy - the window IS two indices with a rule about the gap.",
      },
    ],
    playbook: [
      {
        name: "Grow right, shrink left",
        idea: "A window over a contiguous run, with a tally of what is inside it. Push the right edge out to take more in; while the window breaks its rule, pull the left edge in. Each element enters once and leaves at most once, so the whole sweep is linear however much the edges move.",
        tell: '"longest", "shortest", "contains at most k", "contiguous" — the answer is a RUN, and whether a run is legal can be decided from a running tally rather than by re-reading it.',
        invariant:
          "Between the two edges the window is always legal by the end of each step, and the running tally describes exactly what is between them — nothing stale from an element already dropped.",
        learnOn: ["longest-unique-substring", "char-replacement", "fruit-baskets", "min-subarray-sum"],
        mistake:
          "Recomputing the window's property from scratch inside the loop, which quietly restores the quadratic cost the window was supposed to remove. If the body contains a second loop over the window, the move has not actually been applied.",
      },
      {
        name: "A fixed window that slides",
        idea: "When the length is given, the window never changes size: add the element entering and remove the one leaving, in the same step. One add and one remove per position, whatever the window's width.",
        tell: '"of size k", "every window of length n", "an anagram of" — the width is stated in the problem rather than discovered.',
        invariant:
          "The tally always describes exactly k consecutive elements. Add and remove happen together or the window has the wrong width for one step — which is the step the bug hides in.",
        learnOn: ["permutation-in-string", "anagram-positions", "max-ones-after-flips"],
        mistake:
          "Comparing whole tallies on every step. For a bounded alphabet that is a constant factor, but the honest version carries ONE number — how many symbols currently agree — and updates it as the counts change.",
      },
      {
        name: "At most k, minus at most k − 1",
        idea: "Counting windows with EXACTLY k of something is awkward; counting windows with at most k is a plain sliding window. Run it twice and subtract.",
        tell: '"exactly k distinct", "exactly k odd numbers" — a counting question where the shrink rule is natural for "at most" and unnatural for "exactly".',
        learnOn: ["fruit-baskets", "longest-unique-substring"],
        mistake:
          "Reaching for it when the values can be NEGATIVE. The shrink step assumes that removing an element from the left can only move the running total one way; a negative breaks that, and the count comes out wrong rather than slow.",
      },
      {
        name: "A monotonic deque for the extreme",
        idea: "When the window needs its maximum, keep a deque of indices whose values are decreasing. The front is always the window's maximum; anything smaller arriving behind a larger value can never be the answer while that value is still in the window, so it is discarded on arrival.",
        tell: '"maximum of every window", "the best in the last k" — you need an extreme of the window, and recomputing it is the thing making the sweep quadratic.',
        invariant:
          "The deque holds indices in increasing order with strictly decreasing values, and every index in it is still inside the window. Both halves have to be re-established every step.",
        learnOn: ["window-maximum"],
        mistake:
          "Storing values rather than indices, which leaves no way to tell when the front has fallen out of the window. The expiry check is the half people drop, and it only shows up once the maximum is old enough to leave.",
      },
    ],
  },
  {
    id: "stack",
    name: "Stack",
    glyph: "[≡]↕",
    blurb:
      "Most-recent-first matching: parentheses, previous-greater, undo of the last open thing.",
    references: [
      {
        title: "Stack (abstract data type)",
        href: "https://en.wikipedia.org/wiki/Stack_(abstract_data_type)",
        kind: "reference",
        note: "The operations and their costs, and the call-stack connection that makes every recursive solution a stack solution in disguise.",
      },
      {
        title: "Python: collections.deque",
        href: "https://docs.python.org/3/library/collections.html",
        kind: "docs",
        note: "Why a list is a fine stack and a terrible queue, and what deque costs at each end.",
      },
      {
        title: "Minimum stack, minimum queue",
        href: "https://cp-algorithms.com/data_structures/stack_queue_modification.html",
        kind: "reference",
        note: "Keeping a running minimum in O(1) alongside the stack itself - the trick behind the monotonic-stack problems here.",
      },
    ],
    playbook: [
      {
        name: "Match the most recent",
        idea: "Push each thing that is still waiting; when its partner arrives, the one it belongs to is by definition the one on top. The stack is not a trick applied to the problem — it is a literal record of what is still unresolved, in the order it became unresolved.",
        tell: '"balanced", "valid", "nested", "matching" — a closer must answer the most recent unanswered opener, which is the definition of last-in-first-out written as a sentence.',
        invariant:
          "The stack holds exactly the items read so far that are still unmatched, oldest at the bottom. That is why an empty stack at the end IS the answer rather than an extra rule bolted on.",
        learnOn: ["balanced-brackets", "simplify-path", "decode-string"],
        mistake:
          "Ending the loop with `return true` instead of checking the stack is empty. Every other check fires INSIDE the loop, so the loop can complete without one tripping — on a string that was never finished. It returns true for a single opening bracket.",
      },
      {
        name: "A monotonic stack",
        idea: "Keep the stack ordered — increasing or decreasing — by popping everything the arriving element beats. Each pop is a question being answered: the arriving element is the first one larger (or smaller) than the thing being popped.",
        tell: '"next greater", "how many days until", "the largest rectangle", "span" — you need, for every position, the first later position satisfying something.',
        invariant:
          "Everything on the stack is still waiting for its answer, and it is ordered, so the arriving element answers a PREFIX of them and nothing deeper. Each index is pushed once and popped once, which is why the sweep is linear despite the inner loop.",
        learnOn: ["daily-warmer", "largest-rectangle", "remove-k-digits"],
        mistake:
          "Forgetting what is left on the stack when the input runs out. Those are the positions with no answer at all, and they need their default written explicitly — a loop that only handles pops triggered by an arrival silently drops them.",
      },
      {
        name: "Operands wait, operators consume",
        idea: "Push values; an operator takes the two most recently finished values and its result takes their place. No precedence rules and no parentheses, because postfix already encodes the order.",
        tell: '"evaluate", "reverse Polish", "calculator" — an expression where the operands of an operator are always the most recent completed results.',
        learnOn: ["rpn-eval", "calculator-basic"],
        mistake:
          "Reversing the operands. The value popped FIRST is the right-hand one, and subtraction and division produce plausible wrong answers when that is backwards — addition and multiplication hide the bug completely.",
      },
      {
        name: "Recursion with the frames written out",
        idea: "A stack of state instead of a stack of calls. Push the work still to do; pop, do one step, push whatever that step created. It is the same traversal, with the frames made into data you can inspect.",
        tell: '"the input can be 10^4 deep", "without recursion", "decode nested" — the recursive version is correct and the depth is a real risk.',
        learnOn: ["decode-string", "generate-parens", "asteroid-collision"],
        mistake:
          "Pushing children in the order you want to visit them. A stack reverses, so the child you push LAST comes out first — getting this backwards produces a mirror-image traversal that is right on symmetric inputs.",
      },
    ],
  },
  {
    id: "binary-search",
    name: "Binary Search",
    glyph: "lo·mid·hi",
    blurb:
      "Monotonic answer space: halve it every step — search values, not just indices.",
    references: [
      {
        title: "Binary search",
        href: "https://en.wikipedia.org/wiki/Binary_search",
        kind: "reference",
        note: "The invariant, the overflow-safe midpoint, and the two boundary variants that return different answers on duplicates.",
      },
      {
        title: "Binary search on the answer",
        href: "https://cp-algorithms.com/num_methods/binary_search.html",
        kind: "reference",
        note: "The step up: search a space of ANSWERS rather than a position in an array. Most hard problems in this pattern are this.",
      },
      {
        title: "Python: bisect",
        href: "https://docs.python.org/3/library/bisect.html",
        kind: "docs",
        note: "bisect_left versus bisect_right stated precisely - the same off-by-one you will hand-write, already named.",
      },
    ],
    playbook: [
      {
        name: "Halve an inclusive range",
        idea: "Keep a range that must contain the answer if it exists. Probe the middle: equal means done, otherwise one half provably cannot contain it and is discarded whole.",
        tell: '"sorted", "find the index of", "O(log n) required" — and the array itself is what you are searching.',
        invariant:
          "If the target is anywhere, it is inside [lo, hi]. Every step must strictly shrink that range, or the loop runs forever on a two-element window.",
        learnOn: ["classic-binary-search", "search-2d-matrix"],
        mistake:
          "Mixing the two contracts. `lo <= hi` needs `mid ± 1` on both branches; `lo < hi` needs one branch to keep `mid`. Take one from each and you get either an infinite loop or an off-by-one, and which of the two shows up depends on the input.",
      },
      {
        name: "Converge on the first index that qualifies",
        idea: "Instead of asking \"is it here\", ask \"does the property start here\". Move `lo` past anything that provably fails and move `hi` TO anything that might be the answer, until one candidate is left.",
        tell: '"the first", "the leftmost", "insert position", "the smallest x such that" — a boundary rather than a value.',
        invariant:
          "Everything left of `lo` fails the property and everything at or right of `hi` might satisfy it. The answer is where those two meet, which is why the check happens once, after the loop.",
        learnOn: ["search-insert-position", "first-last-position", "rotated-minimum"],
        mistake:
          "Returning `-1` from inside the loop. This contract cannot return early — it has not finished narrowing — and an exact-hit branch bolted on is how the leftmost occurrence gets missed when duplicates exist.",
      },
      {
        name: "Search the answer, not the array",
        idea: "When the input is not sorted but the ANSWER is monotone — if a speed works, every faster speed works — binary search the range of possible answers and use a feasibility check as the probe.",
        tell: '"minimum capacity", "the smallest k such that", "within d days" — you can cheaply test a candidate answer, but you cannot cheaply produce one.',
        invariant:
          "`feasible(x)` is monotone in x: false, false, …, true, true. Confirm that before writing the loop — if it is not monotone, the search silently returns a wrong answer rather than failing.",
        learnOn: ["koko-bananas", "ship-in-d-days"],
        mistake:
          "Choosing bounds that exclude the answer. The low end must be the smallest conceivable answer and the high end one that is certainly feasible — usually the maximum single element and the sum, and taking the array length instead is the version that works on the examples.",
      },
      {
        name: "Halve a rotated or shaped array",
        idea: "One half of a rotated sorted array is always properly sorted. Work out which, decide whether the target lies inside it, and discard the other half exactly as in a plain search.",
        tell: '"rotated", "a peak", "mountain" — not sorted, but locally you can still prove a half away.',
        learnOn: ["rotated-search", "rotated-minimum", "find-peak-element"],
        mistake:
          "Comparing against the wrong endpoint when deciding which half is sorted. Use `nums[lo]` against `nums[mid]`, and handle equality deliberately — with duplicates neither half is provably sorted and the worst case degrades to linear.",
      },
    ],
  },
  {
    id: "linked-list",
    name: "Linked List",
    glyph: "•→•→∅",
    blurb:
      "Pointer surgery: fast/slow runners, reversal, and dummy heads solve most of it.",
    references: [
      {
        title: "Linked list",
        href: "https://en.wikipedia.org/wiki/Linked_list",
        kind: "reference",
        note: "The variants and their trade-offs, and why every operation is cheap except the one you need most: finding a node.",
      },
      {
        title: "Cycle detection",
        href: "https://en.wikipedia.org/wiki/Cycle_detection",
        kind: "reference",
        note: "Floyd and Brent. The proof that the runners meet, and how to find where the loop begins.",
      },
      {
        title: "Sedgewick & Wayne, Bags, Queues, and Stacks",
        href: "https://algs4.cs.princeton.edu/13stacks/",
        kind: "course",
        note: "Linked structures built from nothing, with the memory cost of a node counted honestly.",
      },
    ],
    // The five moves, lifted out of docs/RESOURCES.md. Every row names its
    // invariant, because the invariant is what people break — the move itself
    // is three lines.
    playbook: [
      {
        name: "Dummy head",
        idea: "Allocate a node in front of the real head and build from it, so the first node is not a special case.",
        tell: "The head itself can be deleted, replaced, or is the answer; the list can be empty; you catch yourself writing the same None check twice.",
        invariant:
          "dummy.next is the answer at all times, so head goes stale the moment anything changes and must never be returned. Whatever tail points at is the last COMMITTED node.",
        learnOn: [
          "merge-two-sorted",
          "remove-nth-from-end",
          "remove-list-elements",
        ],
        mistake:
          "Returning head instead of dummy.next — correct on every input where the first node survives, and wrong on exactly the case the dummy was added for.",
      },
      {
        name: "Fast and slow",
        idea: "Two pointers at different speeds, or the same speed with a fixed gap, so one pass learns something about the list's length or shape.",
        tell: '"the middle", "is there a cycle", "the nth from the end", "in one pass, O(1) space".',
        invariant:
          "Before every dereference both fast and fast.next exist — that is what the two-part while condition buys. With a gap, the gap is EXACTLY n for the whole walk, so it must be established before the joint walk starts.",
        learnOn: ["cycle-detect", "middle-of-list", "remove-nth-from-end"],
        mistake:
          "The even-length middle. Testing fast and fast.next leaves slow on the SECOND of the two middles; testing fast.next and fast.next.next leaves it on the first. Both are correct loops for different problems — choose on purpose, and test a four-node list.",
      },
      {
        name: "Reverse in place",
        idea: "Three pointers — previous, current and next — walking the list once and turning every arrow around as they pass.",
        tell: '"reverse", "compare front to back", "reorder" — anything needing a backwards walk through a structure with no back pointers.',
        invariant:
          "At the top of every iteration: previous heads the already-reversed prefix, current heads the untouched suffix, and no node is orphaned — which means the next pointer is saved BEFORE current.next is overwritten.",
        learnOn: ["reverse-list", "palindrome-list", "reorder-list"],
        mistake:
          "Returning current — it is None when the loop ends — instead of previous. Worth knowing too that the loop is already correct on the empty list and the single node with no special case: if you wrote one, you did not trust the invariant.",
      },
      {
        name: "Split and weave",
        idea: "Find the middle, reverse or reorder one half, then compare or interleave the two.",
        tell: '"palindrome", "reorder the list", "is the second half like the first" — the answer needs both ends at once.',
        invariant:
          "Decide whether the front half's tail is terminated. palindrome-list deliberately does NOT terminate it, which is safe only because the comparison stops when the reversed side runs out. If you WEAVE rather than compare you must null the first half's tail or you build a cycle.",
        learnOn: ["palindrome-list", "reorder-list"],
        mistake:
          "Assuming the caller's list survives. Reversing a half mutates the input; if the list is read again after your call you owe it a second reverse to restore it. Say which contract you are honouring.",
      },
      {
        name: "Two-pass with a length",
        idea: "Count the nodes, then walk to a computed position — the version you can always derive under pressure.",
        tell: '"the nth from the end", "the middle", "rotate by k" where k can exceed the length, so k mod n is needed anyway.',
        invariant:
          "The list must not change between the passes, and both passes count from the same end. To DELETE at position i you must stop at i−1, so the walk is one step shorter than the one that merely finds it.",
        learnOn: ["remove-nth-from-end", "middle-of-list", "rotate-list"],
        mistake:
          "Walking n − k steps when you need n − k − 1 to hold the predecessor. This is the whole reason a dummy head earns its allocation: with it the first node has a predecessor and the off-by-one disappears.",
      },
    ],
  },
  {
    id: "trees",
    name: "Trees",
    glyph: "┌┴┐",
    blurb:
      "Recursion mirrors the structure: define the answer for a node from its children's answers.",
    references: [
      {
        title: "Binary search tree",
        href: "https://en.wikipedia.org/wiki/Binary_search_tree",
        kind: "reference",
        note: "The ordering invariant, and how it degrades to a linked list on sorted input - which is the whole reason balancing exists.",
      },
      {
        title: "Tree traversal",
        href: "https://en.wikipedia.org/wiki/Tree_traversal",
        kind: "reference",
        note: "Pre-, in-, post- and level-order in one place, with the iterative forms. In-order on a BST giving sorted output is the fact most problems lean on.",
      },
      {
        title: "Sedgewick & Wayne, Binary Search Trees",
        href: "https://algs4.cs.princeton.edu/32bst/",
        kind: "course",
        note: "Insert, delete and the analysis. Delete is the one nobody can write from memory, and this is where to learn why.",
      },
    ],
    playbook: [
      {
        name: "Ask both children, then combine",
        idea: "A node's answer is a function of its subtrees' answers. Write the base case for an absent node, recurse on both sides, combine. The recursion visits every node once and the shape of the code is the shape of the tree.",
        tell: '"the depth", "is it balanced", "the same tree", "invert" — the question has an obvious answer for an empty tree and an obvious way to fold two answers into one.',
        invariant:
          "A call returns a FINISHED answer for its whole subtree and reads nothing outside it. The moment a call needs to know about its parent or its sibling, this is the wrong move.",
        learnOn: ["max-depth", "balanced-tree", "same-tree", "invert-tree"],
        mistake:
          "Returning the answer when the parent needs a different quantity. tree-diameter's walk returns a DEPTH while the answer is a BEND; conflating the two is the most common bug in this pattern, and it passes every test whose longest path happens to touch the root.",
      },
      {
        name: "Carry a bound down, not a value up",
        idea: "Some properties cannot be checked locally. Pass the constraint DOWN as an interval that narrows at each step, instead of trying to reconstruct it from what comes back up.",
        tell: '"is it a valid BST", "paths summing to", "every node in range" — a rule about a node that depends on its ancestors, not its descendants.',
        invariant:
          "Every node is checked against the interval its whole ancestry implies, not just against its parent. That distinction IS the problem: comparing each node with its parent accepts trees that are not BSTs.",
        learnOn: ["validate-bst", "bst-ancestor"],
        mistake:
          "Checking node against parent only. `[10, 5, 15, null, null, 6, 20]` passes that check and is not a BST — 6 is in the right subtree of 10 and smaller than it.",
      },
      {
        name: "A level at a time",
        idea: "A queue, draining exactly the nodes present when the round starts. Everything added during the round belongs to the next one, so each round IS a level without needing to store depths.",
        tell: '"level order", "the right side", "the minimum depth", "by row" — the answer is grouped by distance from the root, or found at the shallowest place.',
        invariant:
          "At the top of each round the queue holds exactly one level. Capturing its size BEFORE the loop is what makes that true; reading it inside walks the whole tree as one round.",
        learnOn: ["level-order", "right-side-view", "max-depth"],
        mistake:
          "Memory. A queue holds the WIDEST level, which on a full tree is half the nodes — the recursion holds the height instead. Neither is always better, and saying which you are paying for is the point of knowing both.",
      },
      {
        name: "In-order is sorted, for a BST",
        idea: "Left, node, right — on a binary search tree that visits the values in ascending order. Any question about sorted order becomes a question about a walk with no sorting involved.",
        tell: '"kth smallest", "validate", "two values summing to" on a BST — the tree is already the sorted sequence.',
        learnOn: ["inorder-walk", "validate-bst"],
        mistake:
          "Collecting the whole walk into a list when you needed one element. The walk can stop at the kth, and building the list first turns an O(h) answer into O(n) — which matters exactly when the tree is large enough for the question to be asked.",
      },
    ],
  },
  {
    id: "heaps",
    name: "Heaps",
    glyph: "▲ top",
    blurb:
      "Repeated min/max of a changing set: a heap gives it in O(log n) per operation.",
    references: [
      {
        title: "Binary heap",
        href: "https://en.wikipedia.org/wiki/Binary_heap",
        kind: "reference",
        note: "The array-as-a-tree layout, sift-up and sift-down, and why BUILDING a heap is O(n) and not O(n log n).",
      },
      {
        title: "Python: heapq",
        href: "https://docs.python.org/3/library/heapq.html",
        kind: "docs",
        note: "The module every Python solution here uses - including the min-heap-only limitation and the negate-to-invert workaround.",
      },
      {
        title: "Sedgewick & Wayne, Priority Queues",
        href: "https://algs4.cs.princeton.edu/24pq/",
        kind: "course",
        note: "Priority queues and heapsort, with the top-k discussion these problems are really about.",
      },
    ],
    playbook: [
      {
        name: "A heap of size k",
        idea: "For the kth largest, keep a MIN-heap of the k best seen. Every arrival is compared against the weakest survivor and replaces it or is discarded. The heap never grows past k, so the cost is n log k rather than n log n.",
        tell: '"the k largest", "the k closest", "top k" — you need a few extremes out of many, and sorting everything answers a bigger question than the one asked.',
        invariant:
          "The heap holds the best k seen so far and its ROOT is the weakest of them — which is exactly the one to evict. Using a max-heap here is the inversion that makes the whole move pointless.",
        learnOn: ["kth-largest-element", "k-closest-points", "kth-largest-stream"],
        mistake:
          "Reaching for a heap when counting would do. When the values are bounded, bucketing by frequency is linear and a heap is n log k — top-k-frequent is the case where the 'optimal' rung is measurably the slower one.",
      },
      {
        name: "Repeatedly take the extreme",
        idea: "When the process itself is 'take the largest, do something, put the result back', a heap IS the algorithm rather than an optimisation of it. Each round is one pop, or two, and one push.",
        tell: '"smash the two heaviest", "merge the two smallest", "until one is left" — a simulation whose every step needs the current extreme of a set that keeps changing.',
        invariant:
          "The heap always holds the live set — everything not yet consumed, including everything produced along the way. Forgetting to push a result back is the bug that terminates early with a plausible answer.",
        learnOn: ["last-stone-weight", "ugly-number"],
        mistake:
          "Re-sorting the collection every round. That is the quadratic version of the same idea and it is easy to write without noticing, because it is correct.",
      },
      {
        name: "Count first, then heap the counts",
        idea: "Two passes. Tally the frequencies in a map, then push the tallies into a heap of size k. The heap never sees the raw input, so its size is the number of DISTINCT values.",
        tell: '"most frequent", "top k words", "by frequency" — the ranking key has to be computed before anything can be ranked.',
        learnOn: ["sort-by-frequency", "top-k-frequent-words"],
        mistake:
          "Tie-breaking by accident. When two counts are equal the problem usually dictates the order — alphabetical, or first seen — and a heap's order among equals is whatever the comparator leaves unspecified, so it differs between languages.",
      },
      {
        name: "A heap over several sorted sequences",
        idea: "Hold one entry per sequence — its current head — and repeatedly take the smallest, then push that sequence's next value. The heap's size is the NUMBER OF SEQUENCES, not the total length.",
        tell: '"merge k sorted", "kth smallest in a sorted matrix" — many ordered runs and a question about their combined order.',
        invariant:
          "The heap holds exactly one candidate per live sequence, so its root is the global minimum of everything unconsumed. Push the successor before the next pop or that guarantee is gone.",
        learnOn: ["kth-smallest-matrix"],
        mistake:
          "Pushing everything in at the start. That works and it makes the heap the size of the input, which is the cost the move exists to avoid — and on a matrix it is the difference between k log n and n² log n.",
      },
    ],
  },
  {
    id: "graphs",
    name: "Graphs",
    glyph: "v—e—v",
    blurb:
      "Explicit or implicit networks: BFS for shortest hops, DFS for reachability and cycles.",
    references: [
      {
        title: "Breadth-first search",
        href: "https://cp-algorithms.com/graph/breadth-first-search.html",
        kind: "reference",
        note: "BFS with the proof that it finds shortest paths on an UNWEIGHTED graph - the precondition that decides BFS versus Dijkstra.",
      },
      {
        title: "Dijkstra's algorithm",
        href: "https://cp-algorithms.com/graph/dijkstra.html",
        kind: "reference",
        note: "Both implementations and their costs, plus why a negative edge breaks the greedy argument outright.",
      },
      {
        title: "Sedgewick & Wayne, Undirected Graphs",
        href: "https://algs4.cs.princeton.edu/41graph/",
        kind: "course",
        note: "Representations first - adjacency list versus matrix - because choosing wrong is what actually makes graph code slow.",
      },
    ],
    playbook: [
      {
        name: "Flood a region, marking as you go",
        idea: "From a starting cell, visit every reachable neighbour, marking each one the moment it is QUEUED rather than when it is processed. The marks are what stop the walk revisiting itself.",
        tell: '"how many islands", "the area of", "surrounded regions" — a grid, and the question is about connected groups of cells.',
        invariant:
          "A cell is marked at most once and processed at most once. Marking on pop instead of on push lets the same cell enter the frontier several times, which is correct and quadratic.",
        learnOn: ["island-count", "max-island-area", "flood-fill", "surrounded-regions"],
        mistake:
          "Mutating the grid to mark, then needing the original later. It is the cheapest visited-set there is and it is destructive — decide deliberately, and if the caller keeps the grid, say so and pay for a separate set.",
      },
      {
        name: "BFS for the fewest steps",
        idea: "A queue explores by distance: everything one step away, then everything two steps away. The first time you reach a node is therefore by a shortest path, which is why no revisiting is ever needed.",
        tell: '"shortest path", "minimum number of moves", "how many minutes until" — on an UNWEIGHTED graph, where every edge costs the same.',
        invariant:
          "The queue holds nodes in non-decreasing distance order. That holds only while every edge costs the same — the moment weights differ, first-reached stops meaning shortest and this silently returns a wrong answer.",
        learnOn: ["rotting-fruit", "shortest-path-grid", "island-count"],
        mistake:
          "Starting from one source when the problem has many. Rotting fruit starts from EVERY rotten cell at once — seeding the queue with all of them is the whole algorithm, and looping one BFS per source is both slower and wrong about simultaneity.",
      },
      {
        name: "DFS with a state per node, for cycles",
        idea: "Three states, not two: unseen, in progress, finished. A node reached while still in progress is a cycle; a node reached after finishing is just a shared dependency. Two states cannot tell those apart.",
        tell: '"can the courses be finished", "is there a cycle", "topological order" — a dependency graph where the answer is an ordering or the absence of one.',
        invariant:
          "Anything marked finished has had its whole subtree explored and is safe to meet again. The in-progress set is exactly the current path from the root of this walk.",
        learnOn: ["course-order"],
        mistake:
          "Using a single visited set. It reports a cycle for a diamond — two paths reaching the same node with no cycle at all — which is the shape most dependency graphs have.",
      },
      {
        name: "A priority queue for weighted shortest paths",
        idea: "Dijkstra: always expand the unfinished node with the smallest known distance. The heap turns 'find the nearest frontier node' from a scan into a pop.",
        tell: '"the time for the signal to reach all", "the cheapest route", weights that differ — BFS no longer applies because reaching a node first no longer means reaching it cheapest.',
        invariant:
          "When a node is popped its distance is final. That is only true with non-negative weights — a negative edge breaks the proof, and the algorithm returns a confidently wrong number rather than failing.",
        learnOn: ["network-delay"],
        mistake:
          "Not skipping stale heap entries. The same node can be pushed several times with different distances; popping an entry worse than the one already recorded must be discarded, or the relaxation runs on out-of-date state.",
      },
      {
        name: "Backtrack, and undo the mark",
        idea: "Explore a path, marking cells as used; when the branch fails, UNMARK before returning. The mark means 'on the current path', not 'seen at some point'.",
        tell: '"does this word exist in the grid", "all paths", "place the queens" — a search over arrangements where the same cell may belong to a different attempt.',
        invariant:
          "On return, the board is exactly as it was on entry. A single missing undo leaves a cell permanently blocked and the failure appears several branches later, somewhere else.",
        learnOn: ["word-search"],
        mistake:
          "Treating it as a flood fill. Flood fill never unmarks because it wants each cell once; backtracking must unmark because a cell rejected on one path may be required on another.",
      },
    ],
  },
  {
    id: "dp",
    name: "Dynamic Programming",
    glyph: "dp[i-1]",
    blurb:
      "Overlapping subproblems: define state, write the recurrence, fill the table.",
    references: [
      {
        title: "Dynamic programming",
        href: "https://en.wikipedia.org/wiki/Dynamic_programming",
        kind: "reference",
        note: "Optimal substructure and overlapping subproblems: the two properties that decide whether DP is even applicable.",
      },
      {
        title: "USACO Guide: Introduction to DP",
        href: "https://usaco.guide/gold/intro-dp",
        kind: "course",
        note: "Worked problems that force you to name the state before writing the recurrence - the step that makes the rest mechanical.",
      },
      {
        title: "MIT 6.006, Introduction to Algorithms",
        href: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
        kind: "course",
        note: "Full lectures and notes. The DP sequence is the clearest free treatment of how to choose a subproblem.",
      },
    ],
    playbook: [
      {
        name: "Name the state before writing anything",
        idea: "Say in one sentence what `dp[i]` MEANS — 'the best answer using the first i items' — and the recurrence usually writes itself. Most dynamic programming bugs are a state that means two things in different places.",
        tell: '"the number of ways", "the minimum cost", "can it be done" — and a brute force that keeps solving the same smaller question.',
        invariant:
          "Every entry is final before anything reads it, which is what fixes the fill order. If the recurrence reads dp[i+1], you fill backwards; that is a consequence of the state, not a separate decision.",
        learnOn: ["stair-ways", "house-robber", "min-cost-stairs"],
        mistake:
          "A base case that is a guess. `dp[0]` is usually the EMPTY case — one way to make nothing, zero cost for no stairs — and picking it to make the first example come out right is how an off-by-one gets baked in.",
      },
      {
        name: "Keep only the window you read",
        idea: "If the recurrence reaches back a fixed distance, the table is not needed — two or three variables are. The answer is the same and the memory drops from linear to constant.",
        tell: "the recurrence mentions dp[i-1] and dp[i-2] and nothing older.",
        learnOn: ["stair-ways", "house-robber", "counting-bits"],
        mistake:
          "Rolling the variables in the wrong order and reading one you have already overwritten. Write the table version first, get it right, and only then collapse it — the collapse is mechanical once the recurrence is proven.",
      },
      {
        name: "A running best, decided at each element",
        idea: "For a contiguous run, ask one local question at every position: does the run so far help, or is this element better off starting a new one? Keep the best answer seen alongside the running one.",
        tell: '"maximum subarray", "longest increasing run", "best trade" — contiguous, and the decision at each step is local.',
        invariant:
          "Two quantities, and they are not the same: the best run ENDING HERE, and the best run seen anywhere. Conflating them is the classic bug and it is invisible on all-positive input.",
        learnOn: ["max-subarray", "longest-increasing-run", "best-trade", "max-product-subarray"],
        mistake:
          "Carrying one extreme when the problem needs two. With negative numbers a running product needs the minimum as well — the most negative value becomes the largest the moment another negative arrives.",
      },
      {
        name: "A grid over two sequences",
        idea: "When the question compares two strings or two sequences, the state is a PAIR of indices and the table is two-dimensional: match, and both advance; mismatch, and the answer is the better of advancing one or the other.",
        tell: '"longest common", "edit distance", "is A an interleaving of" — two inputs, and a question about how they align.',
        learnOn: ["longest-common-subsequence"],
        mistake:
          "Getting the axes backwards halfway through, so `dp[i][j]` means one thing in the fill and another in the answer. Write what the row index and the column index mean above the loop and keep it there.",
      },
      {
        name: "Choose or skip, over a capacity",
        idea: "Knapsack. For each item, either it is used or it is not, and the state carries how much room is left. The inner loop's direction decides whether an item may be used once or many times.",
        tell: '"can the set be split", "the fewest coins", "make exactly this amount" — a target to hit and a set of items to hit it with.',
        invariant:
          "Iterating capacity DOWNWARD uses each item at most once; iterating upward allows unlimited reuse. That single direction is the whole difference between 0/1 and unbounded, and neither loop looks wrong.",
        learnOn: ["coin-change-min", "partition-equal-subset"],
        mistake:
          "Initialising the impossible cases to 0 rather than to infinity. Zero is a legitimate answer for 'no coins needed', so using it for 'cannot be done' makes unreachable amounts look reachable and the minimum comes out too small.",
      },
      {
        name: "Count paths through a shape",
        idea: "When every move is forced to go forward, the number of ways to reach a cell is the sum of the ways to reach the cells that can reach it. No search, just a sum.",
        tell: '"how many ways to", "paths in a grid", "ways to decode" — counting arrangements, not finding the best one.',
        learnOn: ["unique-paths", "decode-ways", "word-break", "jump-game"],
        mistake:
          "Forgetting that a step may be illegal. decode-ways has to reject a leading zero and any pair above 26 — a recurrence that always adds both predecessors counts strings that do not decode at all.",
      },
    ],
  },
]
