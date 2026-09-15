// group-anagrams — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are given a list of words and asked to sort them into piles, where two words go in the same pile
if one is a rearrangement of the other. "eat", "tea" and "ate" belong together; "bat" sits alone.
You return the piles, not the words, and here the answer is sorted inside each pile and between the
piles so there is exactly one correct output.

**The core question:** what single label can you compute from a word such that every rearrangement of
it produces the same label, and no other word does? The naive approach is slow because, lacking such
a label, it compares each new word against the piles built so far — so the number of comparisons
grows with the number of piles, and on input with no anagrams at all that is one comparison per
existing pile per word.

Two words that mean something specific here, each introduced by the picture rather than the
definition:

- Melt a word down and recast it in a fixed mould, and every anagram of it comes out of the mould
  looking the same. That cast object is the word's **canonical form** — also called its *key* or
  *signature* — and it turns "are these two equivalent?" into "are these two identical?".
- Now give every mould shape its own box on a shelf, and words drop into boxes as they arrive. That
  is **bucketing by key**: a hash map from key to list. Choosing the mould is the whole problem; the
  shelf is the part nobody argues about.

Throughout, \`n\` is the number of words and \`k\` is the maximum length of a word.

In the general form of this problem the group order is arbitrary, and comparing two arbitrary orders
without normalising first is the classic source of a false "wrong answer". Here the required order
and the normalisation happen to be the same operation, which is why one helper below serves both.

The worked example traced in every section is the statement's own:
\`words = ["eat", "tea", "tan", "ate", "nat", "bat"]\`, whose answer is
\`[["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]\`.

Two decisions repeat across every approach, so each is lifted into a named helper defined once:

\`\`\`python
A = ord("a")            # lowercase letters index a fixed 26-slot tally
ALPHABET_SIZE = 26

def _sorted_key(word: str) -> str:
    """The letters in order: anagrams sort identically, non-anagrams cannot."""
    return "".join(sorted(word))

def _count_key(word: str) -> str:
    """The same multiset as a tally. The comma is load-bearing: without it the
    counts 1,11 and 11,1 both render as "111"."""
    counts = [0] * ALPHABET_SIZE
    for ch in word:
        counts[ord(ch) - A] += 1
    return ",".join(str(c) for c in counts)

def _in_required_order(groups: list[list[str]]) -> list[list[str]]:
    """Sort inside each group, then between groups. Required by this statement;
    in the general version it is the harness's canonicaliser instead."""
    return sorted(sorted(g) for g in groups)
\`\`\`

---`

export const unlocks: Unlock[] = [
    {
        "constraint": "`1 <= words.length <= 10^4`",
        "what": "Ten thousand words is what rules out the pairwise **scan**: on input where no two words are anagrams there are `n` piles at the end, and the scan performs about `n²/2 = 5 × 10^7` group comparisons, each of which sorts a word."
    },
    {
        "constraint": "`0 <= words[i].length <= 100`, lowercase English letters",
        "what": "**Two** things at once. The 26-letter alphabet is what unlocks a fixed-size count signature — the letter is its own array index, so the tally costs no hashing and no allocation proportional to the alphabet. And `k <= 100` means `log k` is under 7, so the difference between sorting a word and counting it is a small **constant factor** in practice, not an order of magnitude."
    },
    {
        "constraint": "the empty string is a legal word, and all empty strings belong to one group",
        "what": "Every key scheme must handle it. Sorted letters give `\"\"`; the count signature gives twenty-six zeros. Both are perfectly good keys, which is the point — nothing special needs writing, but it needs checking."
    },
    {
        "constraint": "the answer is sorted inside each group and between groups",
        "what": "This makes the output unambiguous, which is what lets a test compare two answers directly. It also adds a real `O(n·k log n)` term to every approach, because **ordering** the output is part of the required work — and it is worth separating that from the grouping, which is the part the problem is actually about."
    }
]
