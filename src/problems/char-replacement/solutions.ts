// char-replacement — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The KEYS on
// `alternatives` are load-bearing where a journey exists: `lib/ladder.ts`
// merges an alternative with the act that shares its key, and `from:` in the
// journey must then name that key rather than an array index.
//
// Two arcs, and they are not duplicates. The one here is the short paragraph
// the PROBLEM page renders under the ladder; `arc.ts` holds the long one the
// teaching document ends on. Changing either does not oblige the other.

import type { Solution } from "../../data/types.ts"

export const approach = "Slide a window over the string keeping a tally of the letters inside it and the highest count that tally has ever reached. The window needs (length − highest count) rewrites; while that exceeds k, drop the leftmost character and shrink. Because the answer only cares about the largest window ever seen, the highest count never has to be recomputed downward — a window that shrinks can never beat the record that set it."

export const whyNow = "Checking every substring re-counts letters it has already counted. A window carries those counts forward, so each character is added once and removed at most once — and the most-common count only ever needs to grow, because a smaller one could never have produced a longer answer."

export const arc = "The trick here is what the window does NOT track. A window is legal when its length minus the count of its most frequent character is at most k, and the surprise is that the most-frequent count never has to be recomputed downward: since the answer is a maximum, letting it go stale can only make the window refuse to grow, never make it grow wrongly. That is why the linear version has no inner maximum scan and looks almost too simple. Understand the argument before you trust it, because it is the same 'the answer is a maximum, so the window need never shrink' reasoning behind the fruit-baskets version, and it is the part interviewers probe."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def character_replacement(s: str, k: int) -> int:
    counts = [0] * 26
    best = 0
    most = 0
    left = 0
    for right in range(len(s)):
        counts[ord(s[right]) - 65] += 1
        most = max(most, counts[ord(s[right]) - 65])
        while (right - left + 1) - most > k:
            counts[ord(s[left]) - 65] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`

export const java = `public int characterReplacement(String s, int k) {
    int[] counts = new int[26];
    int best = 0, most = 0, left = 0;
    for (int right = 0; right < s.length(); right++) {
        counts[s.charAt(right) - 'A']++;
        most = Math.max(most, counts[s.charAt(right) - 'A']);
        while ((right - left + 1) - most > k) {
            counts[s.charAt(left) - 'A']--;
            left++;
        }
        best = Math.max(best, right - left + 1);
    }
    return best;
}`

export const cpp = `int characterReplacement(const string& s, int k) {
    vector<int> counts(26, 0);
    int best = 0, most = 0, left = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        counts[s[right] - 'A']++;
        most = max(most, counts[s[right] - 'A']);
        while ((right - left + 1) - most > k) {
            counts[s[left] - 'A']--;
            left++;
        }
        best = max(best, right - left + 1);
    }
    return best;
}`

export const alternatives: Solution[] = [
  {
    key: "brute",
    name: "Every substring",
    summary:
      "Take every start and every end, tally the 26 letters inside that substring, and keep it when the rewrites it needs, its length minus its most common letter's count, fit inside k. It checks the definition literally and is the version to reason from, and the n-squared substrings make it hours of work for a problem one window answers in a single pass.",
    complexity: { time: "O(n² · 26)", space: "O(1)" },
    python: `def character_replacement(s: str, k: int) -> int:
    best = 0
    for i in range(len(s)):
        counts = [0] * 26
        for j in range(i, len(s)):
            counts[ord(s[j]) - 65] += 1
            if (j - i + 1) - max(counts) <= k:
                best = max(best, j - i + 1)
    return best`,
    java: `public int characterReplacement(String s, int k) {
    int best = 0;
    for (int i = 0; i < s.length(); i++) {
        int[] counts = new int[26];
        for (int j = i; j < s.length(); j++) {
            counts[s.charAt(j) - 'A']++;
            int most = 0;
            for (int c : counts) most = Math.max(most, c);
            if ((j - i + 1) - most <= k) best = Math.max(best, j - i + 1);
        }
    }
    return best;
}`,
    cpp: `int characterReplacement(const string& s, int k) {
    int best = 0;
    int n = (int)s.size();
    for (int i = 0; i < n; i++) {
        vector<int> counts(26, 0);
        for (int j = i; j < n; j++) {
            counts[s[j] - 'A']++;
            int most = 0;
            for (int c : counts) most = max(most, c);
            if ((j - i + 1) - most <= k) best = max(best, j - i + 1);
        }
    }
    return best;
}`,
  },
  // B79. The document reaches the answer through this rung and the page could
  // not name it. It is the honest window — correct, and already linear once
  // the alphabet bound is counted — and the whole point of the rung above it
  // is that the 26-slot scan it does on every step turns out to be
  // unnecessary, which is a much stranger claim than "make it faster".
  {
    key: "recompute",
    after: "brute",
    name: "A window, recounting the most frequent each step",
    whyNow:
      "Trying every start throws the tally away whenever the start moves, so each character is re-tallied once for every start before it. A window keeps one tally between two edges: the right edge pushes out, the left edge pulls in while the window is unaffordable, and each character is added once and removed at most once.",
    summary:
      "One window, one tally of 26 counts, and a `max()` over all 26 on every step to find the most frequent letter. Linear in the honest sense — the edges move at most 2n times — but each of those moves pays a 26-slot scan, so the constant is the alphabet. It is correct and it is the version worth writing first; what the next rung shows is that the scan can be deleted outright, because a stale maximum never makes the answer wrong.",
    complexity: { time: "O(26 · n)", space: "O(26)" },
    python: `def character_replacement(s: str, k: int) -> int:
    counts = [0] * 26
    best = 0
    left = 0
    for right in range(len(s)):
        counts[ord(s[right]) - ord("A")] += 1
        # (window length) - (most frequent) is how many rewrites it needs
        while (right - left + 1) - max(counts) > k:  # 26 reads per check
            counts[ord(s[left]) - ord("A")] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
    java: `public int characterReplacement(String s, int k) {
    int[] counts = new int[26];
    int best = 0, left = 0;
    for (int right = 0; right < s.length(); right++) {
        counts[s.charAt(right) - 'A']++;
        while (true) {
            int most = 0;
            for (int c : counts) most = Math.max(most, c);
            if ((right - left + 1) - most <= k) break;
            counts[s.charAt(left) - 'A']--;
            left++;
        }
        best = Math.max(best, right - left + 1);
    }
    return best;
}`,
    cpp: `int characterReplacement(const string& s, int k) {
    vector<int> counts(26, 0);
    int best = 0, left = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        counts[s[right] - 'A']++;
        while (true) {
            int most = 0;
            for (int c : counts) most = max(most, c);
            if ((right - left + 1) - most <= k) break;
            counts[s[left] - 'A']--;
            left++;
        }
        best = max(best, right - left + 1);
    }
    return best;
}`,
  },
]
