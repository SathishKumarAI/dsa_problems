import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "valid-anagram",
  title: "Same Letters, Different Order",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "valid-anagram",
  brief: "Is one string a rearrangement of the other?",
  statement:
    "Given two strings s and t, return true if t uses exactly the same letters as s, each the same number of times — that is, if t is a rearrangement of s.",
  constraints: [
    "1 <= s.length, t.length <= 5 * 10^4",
    "s and t consist of lowercase English letters",
    "different lengths can never be anagrams, which is a free early exit",
    "counts matter, not just membership: 'aab' and 'abb' use the same letters and are not anagrams",
  ],
  examples: [
    { input: 's = "anagram", t = "nagaram"', output: "true" },
    {
      input: 's = "rat", t = "car"',
      output: "false",
      note: "Same length, different letters.",
    },
  ],
  hints: [
    "Length is the cheapest test there is. Do it before anything else.",
    "An anagram is a claim about counts: every letter appears the same number of times in both strings.",
    "Count up while reading s, count down while reading t. If nothing is left over, they match.",
  ],
  // THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md).
  unlocks: [
    {
      constraint: "1 <= s.length, t.length <= 5 * 10^4",
      what: "Fifty thousand characters per string. Sorting both is about 2 \u00d7 5\u00b710\u2074 log(5\u00b710\u2074) \u2248 1.6\u00b710\u2076 comparisons \u2014 fast enough that this bound does not forbid the sorted rung, which is worth saying plainly: the counting rung wins on the clock and on space, not on whether the other one passes.",
      figure: {
        kind: "quantities",
        unit: "ops",
        items: [
          { label: "sort both strings", value: 1.6e6, tone: "plain" },
          { label: "one pass, counting", value: 1e5, tone: "good" },
        ],
      },
    },
    {
      constraint: "s and t consist of lowercase English letters",
      what: "The alphabet is FIXED at 26, and that single fact is what turns the tally from O(n) space into O(1): 26 counters however long the strings are. It is also the line to re-read when someone asks the Unicode follow-up \u2014 lift this promise and the fixed array becomes a map, the same algorithm with a container that grows.",
      figure: {
        kind: "quantities",
        items: [
          { label: "letters the tally must hold", value: 26, tone: "good" },
          {
            label: "characters it counts, at the ceiling",
            value: 5e4,
            tone: "plain",
          },
        ],
      },
    },
    {
      constraint:
        "different lengths can never be anagrams, which is a free early exit",
      what: "A one-line test that answers the whole question for every mismatched pair before a single letter is read, in O(1). It is not an optimisation, it is a CORRECTNESS guard for the one-array tally: counting up through s and down through t in one loop assumes the two strings step together, and without the length check that loop reads past the end of the shorter one.",
    },
    {
      constraint:
        "counts matter, not just membership: 'aab' and 'abb' use the same letters and are not anagrams",
      what: "The line that rules out the answer everyone reaches for first: comparing two SETS of letters. set('aab') and set('abb') are both {a, b}, so a set-based check calls them anagrams. An anagram is a claim about a multiset, and the whole ladder is about which representation of a multiset you can afford.",
      figure: {
        kind: "cells",
        values: ["a", "a", "b"],
        caption:
          "against a, b, b \u2014 the same two letters, different counts. A set cannot tell these apart; a tally reports a: +1, b: \u22121.",
      },
    },
  ],
  checks: [
    {
      ask: "Which pair of strings is an anagram pair?",
      options: [
        '"aab" and "abb"',
        '"listen" and "silent"',
        '"abc" and "abcc"',
        '"rat" and "tar" with the r removed from the second',
      ],
      answer: 1,
      because:
        "An anagram uses exactly the same letters the same number of times. The first pair shares its letters but not its counts, and the others differ in length \u2014 which the statement makes an instant no.",
    },
    {
      ask: "Why is comparing the two strings as SETS of letters wrong?",
      options: [
        "It is too slow at this input size",
        "It ignores how many times each letter appears",
        "It fails on strings that contain no repeats",
        "It cannot handle lowercase letters",
      ],
      answer: 1,
      because:
        'A set records membership and forgets multiplicity, so "aab" and "abb" are both {a, b}. The constraints say counts matter, and that is exactly what a set throws away.',
    },
    {
      ask: "What does the fixed 26-letter alphabet buy you?",
      options: [
        "A faster comparison, since letters compare in O(1)",
        "A tally whose size does not grow with the input, so the extra space is O(1)",
        "The ability to skip the length check",
        "The right to assume the strings are already sorted",
      ],
      answer: 1,
      because:
        "26 counters hold the whole multiset however long the strings are, which is what makes this page claim O(1) space. Lift the constraint to Unicode and the same algorithm needs a growing container instead.",
    },
  ],
  reading: [
    {
      title: "Is Anagram \u2014 NeetCode",
      href: "https://neetcode.io/problems/is-anagram",
      kind: "course",
      note: "The same two rungs on video, with the Unicode follow-up asked out loud at the end.",
    },
    {
      title: "Check whether two strings are anagrams \u2014 GeeksforGeeks",
      href: "https://www.geeksforgeeks.org/dsa/check-whether-two-strings-are-anagram-of-each-other/",
      kind: "reference",
      note: "Several more representations of the same multiset, including the count-array version written out in four languages.",
    },
    {
      title: "collections.Counter",
      href: "https://docs.python.org/3/library/collections.html#collections.Counter",
      kind: "docs",
      note: "The tally as a standard-library object: Counter(s) == Counter(t) is this page's top rung in one line, and the docs state what it costs.",
    },
  ],
  costWhy:
    "The length check is O(1) and answers the whole question for most non-anagram pairs. After it, one pass over n characters with two constant-time array updates per step \u2014 an increment for s and a decrement for t \u2014 then a final sweep of 26 counters, which is a constant and does not scale with the input. So the time is O(n) with a very small constant: no allocation per character, no hashing, no comparison of characters against each other. The space is those 26 counters, and it is O(1) only because the alphabet is FIXED by the constraints \u2014 on Unicode input the same algorithm is O(k) in the number of distinct characters.",
  whyNow:
    "Sorting proves the claim by rebuilding both strings in a canonical order, which is more work than the question needs. Counting answers it directly in one pass over each string, and the alphabet is fixed so the tally never grows with the input.",
  arc: "Anagram means the same multiset of letters, so the entire problem is choosing a representation for a multiset. Sorting builds a canonical form by force and pays n log n per string. A tally is the multiset itself, built in one pass, compared in a fixed number of steps. The habit worth taking: before optimising, write down what the data actually IS — here 'a bag of counts' — and the efficient representation usually follows. Two extensions are worth knowing: one shared tally that increments for one string and decrements for the other ends at all zeros, and for Unicode the fixed 26-slot array becomes a [[hash map]], which is the same algorithm with a different container.",
  approach:
    "Reject different lengths immediately. Then keep one tally of 26 counters: add one for each letter of s, subtract one for each letter of t. If t is a rearrangement, every counter returns to zero. A non-zero counter names a letter one string has more of than the other, which is exactly the disagreement.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    counts = [0] * 26
    for i in range(len(s)):
        counts[ord(s[i]) - 97] += 1
        counts[ord(t[i]) - 97] -= 1
    return all(c == 0 for c in counts)`,
  java: `public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] counts = new int[26];
    for (int i = 0; i < s.length(); i++) {
        counts[s.charAt(i) - 'a']++;
        counts[t.charAt(i) - 'a']--;
    }
    for (int c : counts) {
        if (c != 0) return false;
    }
    return true;
}`,
  cpp: `bool isAnagram(const string& s, const string& t) {
    if (s.size() != t.size()) return false;
    vector<int> counts(26, 0);
    for (size_t i = 0; i < s.size(); i++) {
        counts[s[i] - 'a']++;
        counts[t[i] - 'a']--;
    }
    for (int c : counts) {
        if (c != 0) return false;
    }
    return true;
}`,
  alternatives: [
    {
      name: "Sort both",
      summary:
        "Sort the letters of each string and compare: two anagrams share exactly one sorted form. Correct for any alphabet, including Unicode, and it costs n log n plus two copies to answer a question that is really about counts, not order — nothing here needs the letters arranged, only tallied.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      costWhy:
        "Two sorts dominate: each is O(n log n), and at the ceiling of 5\u00b710\u2074 that is roughly 1.6\u00b710\u2076 comparisons across both. The comparison afterwards is one linear scan and disappears into the sort. The O(n) space is not optional in any of the three languages here \u2014 Python\u2019s sorted() builds a new list, and Java and C++ sort a COPY of the characters, because sorting the argument [[in-place|in place]] would mutate the caller\u2019s string. Worth knowing the shape of the win it gives up: this rung answers a question about counts by first rebuilding both strings in a canonical order, which is strictly more information than the question needs.",
      python: `def is_anagram(s: str, t: str) -> bool:
    return sorted(s) == sorted(t)`,
      java: `public boolean isAnagram(String s, String t) {
    char[] a = s.toCharArray();
    char[] b = t.toCharArray();
    Arrays.sort(a);
    Arrays.sort(b);
    return Arrays.equals(a, b);
}`,
      cpp: `bool isAnagram(string s, string t) {
    sort(s.begin(), s.end());
    sort(t.begin(), t.end());
    return s == t;
}`,
    },
  ],
}
