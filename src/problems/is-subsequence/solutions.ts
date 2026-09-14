// is-subsequence — the ladder: every way in, worst first.
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

export const approach = "Walk t with one pointer and s with another. Every time the characters agree, the s pointer advances; otherwise only the t pointer does. Taking a match at the first opportunity is never worse than waiting for a later one, since it leaves the longest possible remainder of t — that greedy step is what makes a single pass correct. If the s pointer reaches the end, every character was placed in order."

export const whyNow = "Searching for each character of s from the start of t re-walks ground already covered, and a long t makes that quadratic. Carrying the position in t means each of its characters is examined once — and taking the earliest match is safe, because an earlier match leaves strictly more of t available for what follows."

export const arc = "The greedy is the lesson: when scanning the text for the pattern's next character, taking the FIRST match is always safe, because any later match leaves strictly less text for the rest of the pattern. That exchange argument is the same one behind most matching greedies, and it is what makes the one-pass version correct rather than merely plausible. The follow-up is the part worth knowing: if you must answer this for many patterns against one fixed text, the per-query scan becomes the bottleneck and you precompute, for every position and every letter, the next occurrence — turning each query into a walk of the pattern's length with binary search or table lookups."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def is_subsequence(s: str, t: str) -> bool:
    i = 0
    for ch in t:
        if i < len(s) and s[i] == ch:
            i += 1
    return i == len(s)`

export const java = `public boolean isSubsequence(String s, String t) {
    int i = 0;
    for (int j = 0; j < t.length(); j++) {
        if (i < s.length() && s.charAt(i) == t.charAt(j)) i++;
    }
    return i == s.length();
}`

export const cpp = `bool isSubsequence(const string& s, const string& t) {
    size_t i = 0;
    for (char ch : t) {
        if (i < s.size() && s[i] == ch) i++;
    }
    return i == s.size();
}`

export const alternatives: Solution[] = [
  {
    name: "Search for each character in turn",
    summary:
      "For each character of s, scan t for it. Correct, and it restarts the scan from the beginning after every match rather than continuing, so matched ground is walked again and again — n times m in the worst case, to answer what one forward pass settles.",
    complexity: { time: "O(n · m)", space: "O(1)" },
    python: `def is_subsequence(s: str, t: str) -> bool:
    at = 0
    for ch in s:
        found = -1
        for j in range(at, len(t)):
            if t[j] == ch:
                found = j
                break
        if found < 0:
            return False
        at = found + 1
    return True`,
    java: `public boolean isSubsequence(String s, String t) {
    int at = 0;
    for (int k = 0; k < s.length(); k++) {
        char ch = s.charAt(k);
        int found = -1;
        for (int j = at; j < t.length(); j++) {
            if (t.charAt(j) == ch) {
                found = j;
                break;
            }
        }
        if (found < 0) return false;
        at = found + 1;
    }
    return true;
}`,
    cpp: `bool isSubsequence(const string& s, const string& t) {
    int at = 0;
    for (char ch : s) {
        int found = -1;
        for (int j = at; j < (int)t.size(); j++) {
            if (t[j] == ch) {
                found = j;
                break;
            }
        }
        if (found < 0) return false;
        at = found + 1;
    }
    return true;
}`,
  },
]
