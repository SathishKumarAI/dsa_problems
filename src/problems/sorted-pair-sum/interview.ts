// sorted-pair-sum — which rungs to know cold, and the drills
//
// Rewritten 2026-10-17 for reading. The drills are bullets, not a numbered
// list: `lib/markdown.ts` renders no ordered lists, so "1. … 2. …" was
// arriving on the page as one run-on paragraph.

export const interview = `**Know cold: the two pointers and the hash map.** They are a matched pair, and the interview is
about which one the input calls for.

- Unsorted two-sum → the map. The most-asked warm-up there is.
- "The array is sorted" or "use O(1) space" → the pointers.
- Say the exchange argument in one breath: *the sum at the ends is extreme, so one end is provably
  dead.* That sentence is what separates understanding from memorising.
- Get \`i < j\` right the first time, and expect the follow-up: *values instead of indices, and the
  array not sorted?* Sorting destroys indices — carry them along, or use the map.

**Understand, do not drill: brute force.** Say it in the first thirty seconds to name the baseline
and the cost you are about to remove, use it to check the fast version on small inputs, move on.
Skipping it reads as pattern-matching rather than reasoning.
---`

export const fluent = `- **Say the elimination before writing the loop.** *"If the cheapest and the dearest together fall
  short, the cheapest cannot reach the target with anyone."* Done when you can say it without the
  array in front of you — the code is four lines of transcription.
- **Hand-trace \`[1, 3, 6, 9]\` with \`target = 12\`, then with \`target = 100\`.** The second has no
  answer; watch the pointers meet. Done when you can say what \`while lo < hi\` protects against and
  why \`<=\` would be wrong.
- **Break the promise.** Shuffle the array and run the two-pointer rung. It returns something, and
  it is wrong. Done when you can name the line that stopped being true — and why the map does not
  care.
- **Count, do not time.** Both rungs on \`list(range(1, 10001))\` with the answer at the far end.
  Done when you have produced \`49 995 000\` against \`9 999\` yourself.
- **Do the siblings.** *Three Sum* is this loop with one element fixed outside it — the reason it is
  O(n²) and not O(n³). *Container With Most Water* is the same two pointers with a different reason
  to move. *Sort Colors* is two converging pointers with a third walking between them. Done when you
  can say, for each, what one move eliminates.
- **A month from now, one sentence should remain:** *on sorted data, comparing the two ends tells
  you about everything in between, so one comparison can retire a whole row of the table.*`
