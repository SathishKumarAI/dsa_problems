// subarray-sum-k — which rungs to know cold, and the drills
//
// Converted from docs/deep/subarray-sum-k_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `> **In an interview.** Say the baseline out loud in the first thirty seconds — "brute force is every
> pair of endpoints, \`O(n²)\`, about 2 × 10⁸ operations here" — then derive \`P[i] = P[j] - k\` in front
> of the interviewer rather than producing the finished map from memory. Write the map version,
> seed it \`{0: 1}\` the first time, and name why it is indifferent to negatives: nothing in it
> assumes a direction of movement. The follow-up is almost always **"what if I told you all the
> numbers were positive?"** — the answer is the sliding window at \`O(1)\` space, and switching on
> that one word is the whole point of the question. Expect the second follow-up too, *"now return
> the longest such subarray instead of the count"*: same walk, with the map storing the **first
> index** at which each reading occurred rather than a tally.

**Know cold: the prefix-sum counting map, and the sliding window.** They are a matched pair, and the
interview is usually about proving you know which one the input calls for. The map version is the
one you write; the window is the one you must be able to reach for the instant the constraint on
negatives is lifted.

**Understand but do not drill: the two quadratic rungs.** Neither is something anyone is hiring for,
but skipping them entirely makes the optimal solution look memorised rather than reasoned. The
pairwise rung in particular is the bridge — it is where the problem stops being about addition and
starts being about differences.

---`
