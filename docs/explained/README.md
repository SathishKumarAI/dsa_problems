# `docs/explained/` — one page per problem, every approach in order

**Generated. Do not edit a page here** — `npm run docs:explained` rewrites all of them
from `src/data/problems/**`, and `scripts/gen-explained.test.mjs` fails when the tree on
disk has drifted from the data.

## Change → file

| Change | File |
|---|---|
| A problem's statement, rungs, prose or code | `src/data/problems/<pattern>/<id>.ts` |
| The page layout — headings, tables, what a rung shows | `scripts/gen-explained.mjs` |
| The inputs the runnable script prints | `scripts/localsmith/vectors.mjs` |
| Which rungs a page shows, and in what order | `src/lib/ladder.ts` |

A page carries the problem, its constraints and examples, hints behind a fold, then the
approach ladder worst → best — each rung with the weakness in the one before it, its cost,
and Python, Java and C++ — and closes with a runnable script holding every rung at once.

A journeyed problem's acts are **not** read here: the journey gates them behind the ledger
and a file on disk cannot. These pages show only what the problem page already shows.

127 problems.

### Arrays & Hashing  `{ k→v }`

| Problem | Difficulty | Rungs |
|---|---|---|
| [Pair With Target Sum](pair-sum.md) | easy | 3 |
| [Top K Frequent Elements](top-k-frequent.md) | medium | 3 |
| [Longest Consecutive Sequence](longest-consecutive-run.md) | medium | 2 |
| [Single Number](single-number.md) | easy | 3 |
| [Any Repeat in the Array?](contains-duplicate.md) | easy | 3 |
| [Same Letters, Different Order](valid-anagram.md) | easy | 2 |
| [Product of Everything Else](product-except-self.md) | medium | 3 |
| [Group the Anagrams Together](group-anagrams.md) | medium | 3 |
| [How Many Subarrays Sum to k?](subarray-sum-k.md) | medium | 3 |
| [The Value That Owns the Majority](majority-element.md) | easy | 2 |
| [Prefix Shared by Every String](longest-common-prefix.md) | easy | 2 |
| [Same Shape, Different Letters](isomorphic-strings.md) | easy | 2 |
| [Every Value That Appears Twice](find-all-duplicates.md) | medium | 5 |
| [The Smallest Positive That Is Missing](first-missing-positive.md) | hard | 5 |
| [What Both Arrays Hold](intersection-of-arrays.md) | easy | 5 |
| [The Number That Is Not There](missing-number.md) | easy | 5 |
| [Add One to a Digit Array](plus-one.md) | easy | 5 |
| [Rotate the Array by k](rotate-array.md) | medium | 5 |
| [Collapse the Runs into Ranges](summary-ranges.md) | easy | 5 |
| [Read the Matrix in a Spiral](spiral-order.md) | medium | 3 |
| [One Zero Wipes Its Row and Column](zero-matrix.md) | medium | 3 |

### Two Pointers  `i→ ←j`

| Problem | Difficulty | Rungs |
|---|---|---|
| [Pair Sum in Sorted Array](sorted-pair-sum.md) | easy | 3 |
| [Widest Container](container-water.md) | medium | 2 |
| [Triplets Summing to Zero](three-sum-zero.md) | medium | 3 |
| [Palindrome, Ignoring the Noise](valid-palindrome.md) | easy | 2 |
| [Water Held by an Elevation Map](trap-rain-water.md) | hard | 3 |
| [Sort Three Colours In Place](sort-colors.md) | medium | 2 |
| [Push the Zeroes to the End](move-zeroes.md) | easy | 2 |
| [Squares of a Sorted Array](sorted-squares.md) | easy | 2 |
| [Squeeze Out the Duplicates](remove-duplicates-sorted.md) | easy | 2 |
| [Is One String Hidden in the Other?](is-subsequence.md) | easy | 2 |
| [Merge the Second Array Into the First](merge-sorted-array.md) | easy | 5 |
| [Strip Out Every Copy of a Value](remove-element.md) | easy | 5 |
| [Reverse the Characters in Place](reverse-string.md) | easy | 5 |
| [The Triple Nearest the Target](three-sum-closest.md) | medium | 5 |
| [Two Strings After the Backspaces](backspace-compare.md) | easy | 5 |
| [Fewest Boats for Everyone](boats-to-save.md) | medium | 5 |
| [The Next Arrangement in Order](next-permutation.md) | medium | 5 |

### Sliding Window  `[■■□]→`

| Problem | Difficulty | Rungs |
|---|---|---|
| [Single Buy/Sell Profit](best-trade.md) | easy | 2 |
| [Longest Substring Without Repeats](longest-unique-substring.md) | medium | 3 |
| [Smallest Covering Window](min-cover-substring.md) | hard | 2 |
| [Longest Run After k Rewrites](char-replacement.md) | medium | 2 |
| [Does One String Hide the Other's Letters?](permutation-in-string.md) | medium | 3 |
| [Maximum of Every Window](window-maximum.md) | hard | 3 |
| [Longest Run of 1s With k Flips](max-ones-after-flips.md) | medium | 2 |
| [Shortest Subarray That Reaches the Target](min-subarray-sum.md) | medium | 2 |
| [Where Every Anagram Hides](anagram-positions.md) | medium | 4 |
| [The Longest Run of Two Kinds](fruit-baskets.md) | medium | 3 |

### Stack  `[≡]↕`

| Problem | Difficulty | Rungs |
|---|---|---|
| [Balanced Brackets](balanced-brackets.md) | easy | 2 |
| [Days Until Warmer](daily-warmer.md) | medium | 3 |
| [Largest Rectangle in Histogram](largest-rectangle.md) | hard | 3 |
| [Evaluate Reverse Polish Notation](rpn-eval.md) | medium | 2 |
| [Every Well-Formed Bracket String](generate-parens.md) | medium | 2 |
| [Asteroids That Collide](asteroid-collision.md) | medium | 2 |
| [Brackets With a Wildcard](valid-parenthesis-string.md) | medium | 2 |
| [Expand a Nested Encoding](decode-string.md) | medium | 2 |
| [Smallest Number After Removing k Digits](remove-k-digits.md) | medium | 2 |
| [Evaluate + − × ÷ Without Parentheses](calculator-basic.md) | medium | 3 |
| [Reduce a Unix Path to Its Canonical Form](simplify-path.md) | medium | 3 |

### Binary Search  `lo·mid·hi`

| Problem | Difficulty | Rungs |
|---|---|---|
| [Find a Target in Sorted Array](classic-binary-search.md) | easy | 3 |
| [Minimum in Rotated Sorted Array](rotated-minimum.md) | medium | 3 |
| [Slowest Sufficient Eating Speed](koko-bananas.md) | medium | 2 |
| [Search a Fully Sorted Matrix](search-2d-matrix.md) | medium | 3 |
| [Search a Rotated Sorted Array](rotated-search.md) | medium | 3 |
| [First and Last Position of a Value](first-last-position.md) | medium | 3 |
| [Where Would This Value Go?](search-insert-position.md) | easy | 2 |
| [Any Local Peak, in Log Time](find-peak-element.md) | medium | 2 |
| [The Lone Value Among Pairs](single-in-sorted.md) | medium | 2 |
| [The k Values Nearest x](k-closest-values.md) | medium | 4 |
| [The Smallest Ship That Still Makes the Deadline](ship-in-d-days.md) | medium | 3 |

### Linked List  `•→•→∅`

| Problem | Difficulty | Rungs |
|---|---|---|
| [Reverse a Linked List](reverse-list.md) | easy | 3 |
| [Detect a Cycle](cycle-detect.md) | easy | 2 |
| [Merge Two Sorted Lists](merge-two-sorted.md) | easy | 3 |
| [The Middle of a Linked List](middle-of-list.md) | easy | 2 |
| [Is the Linked List a Palindrome?](palindrome-list.md) | easy | 2 |
| [Remove the nth Node From the End](remove-nth-from-end.md) | medium | 2 |
| [Add the Digits, Least Significant First](add-two-numbers.md) | medium | 5 |
| [Odd Positions First, Then the Even Ones](odd-even-list.md) | medium | 5 |
| [Delete Every Node Holding a Value](remove-list-elements.md) | easy | 5 |
| [Fold the List Onto Itself](reorder-list.md) | medium | 5 |
| [Rotate the List to the Right by k](rotate-list.md) | medium | 5 |
| [Swap Every Adjacent Pair](swap-pairs.md) | medium | 5 |

### Trees  `┌┴┐`

| Problem | Difficulty | Rungs |
|---|---|---|
| [Maximum Depth of Binary Tree](max-depth.md) | easy | 3 |
| [Validate a Binary Search Tree](validate-bst.md) | medium | 2 |
| [Level Order Traversal](level-order.md) | medium | 2 |
| [Are Two Trees Identical?](same-tree.md) | easy | 2 |
| [Mirror a Binary Tree](invert-tree.md) | easy | 2 |
| [Is the Tree Height-Balanced?](balanced-tree.md) | easy | 2 |
| [Lowest Common Ancestor in a BST](bst-ancestor.md) | medium | 2 |
| [Read a Tree Left, Node, Right](inorder-walk.md) | easy | 4 |
| [Is the Tree Its Own Mirror?](mirror-tree.md) | easy | 4 |
| [What You See Standing to the Right](right-side-view.md) | medium | 4 |
| [The Longest Path Between Any Two Nodes](tree-diameter.md) | easy | 3 |

### Heaps  `▲ top`

| Problem | Difficulty | Rungs |
|---|---|---|
| [Kth Largest in a Stream](kth-largest-stream.md) | easy | 3 |
| [K Closest Points to Origin](k-closest-points.md) | medium | 3 |
| [Task Scheduling With Cooldown](task-cooldown.md) | medium | 2 |
| [Smash the Two Heaviest Stones](last-stone-weight.md) | easy | 2 |
| [The kth Largest Value](kth-largest-element.md) | medium | 3 |
| [Sort Characters by How Often They Appear](sort-by-frequency.md) | medium | 2 |
| [kth Smallest in a Sorted Matrix](kth-smallest-matrix.md) | medium | 2 |
| [The k Most Common Words, Ties Alphabetical](top-k-frequent-words.md) | medium | 3 |
| [The nth Number Built Only From 2, 3 and 5](ugly-number.md) | medium | 3 |

### Graphs  `v—e—v`

| Problem | Difficulty | Rungs |
|---|---|---|
| [Count the Islands](island-count.md) | medium | 3 |
| [Course Ordering (Topological Sort)](course-order.md) | medium | 2 |
| [Rotting Spread (Multi-source BFS)](rotting-fruit.md) | medium | 2 |
| [Largest Island in the Grid](max-island-area.md) | medium | 2 |
| [Trace a Word Through the Grid](word-search.md) | medium | 2 |
| [How Many Connected Groups?](count-provinces.md) | medium | 2 |
| [When Does the Signal Reach Everyone?](network-delay.md) | medium | 2 |
| [Capture the Enclosed Regions](surrounded-regions.md) | medium | 2 |
| [Repaint the Patch You Clicked](flood-fill.md) | easy | 4 |
| [Rain That Reaches Both Oceans](pacific-atlantic.md) | medium | 3 |
| [Fewest Cells Across an Open Grid](shortest-path-grid.md) | medium | 4 |

### Dynamic Programming  `dp[i-1]`

| Problem | Difficulty | Rungs |
|---|---|---|
| [Ways to Climb Stairs](stair-ways.md) | easy | 3 |
| [Non-Adjacent Maximum Take](house-robber.md) | medium | 3 |
| [Fewest Coins for Amount](coin-change-min.md) | medium | 3 |
| [Longest Increasing Subsequence](longest-increasing-run.md) | medium | 3 |
| [Best Contiguous Run](max-subarray.md) | medium | 3 |
| [Longest Shared Subsequence](longest-common-subsequence.md) | medium | 2 |
| [Set Bits for Every Number up to n](counting-bits.md) | easy | 2 |
| [Split the Array Into Two Equal Halves](partition-equal-subset.md) | medium | 2 |
| [Paths Across a Grid](unique-paths.md) | medium | 2 |
| [Can the Sentence Be Cut Into Words?](word-break.md) | medium | 2 |
| [Cheapest Way Up the Stairs](min-cost-stairs.md) | easy | 2 |
| [How Many Ways to Read the Digits](decode-ways.md) | medium | 4 |
| [Can You Reach the Last Index?](jump-game.md) | medium | 4 |
| [The Best Product a Run Can Make](max-product-subarray.md) | medium | 4 |
