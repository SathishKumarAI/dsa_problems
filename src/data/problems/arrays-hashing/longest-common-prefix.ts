import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "longest-common-prefix",
  title: "Prefix Shared by Every String",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "longest-common-prefix",
  brief: "The longest starting text all the strings share.",
  statement:
    "Given a list of strings, return the longest prefix common to all of them, or the empty string if they share none.",
  constraints: [
    "1 <= words.length <= 200, and 0 <= words[i].length <= 200",
    "words consist of lowercase English letters",
    "the answer is bounded by the SHORTEST string, so it can never be longer than that",
    "an empty string anywhere forces an empty answer",
  ],
  examples: [
    { input: 'words = ["flower", "flow", "flight"]', output: '"fl"' },
    {
      input: 'words = ["dog", "racecar", "car"]',
      output: '""',
      note: "Nothing is shared, not even one letter.",
    },
  ],
  hints: [
    "Compare the strings column by column rather than one against another.",
    "At column i, every string must have a character there and they must all agree.",
    "The first disagreement — or the first string that ran out — ends the prefix.",
  ],
  whyNow:
    "Growing the answer by comparing pairs re-reads the same leading characters for every pair. Reading down one column at a time touches each character at most once and stops at the first disagreement, so a list that shares nothing costs one column rather than a full scan of every string.",
  arc:
    "Two ways to slice the same work: compare strings against a shrinking candidate, or compare column by column across all strings and stop at the first disagreement. The second is worth internalising because it needs no accumulator string at all — the answer is a prefix of the first word, so its LENGTH is the only unknown. The general habit: when the answer is a slice of an input, search for its boundary instead of building it. The early exits do the heavy lifting on real inputs, since one short or one very different string settles the answer immediately, and the corner cases to rehearse are an empty string in the list and a list of one word.",
  approach:
    "Walk the columns of the first string. At each column, check every other string: if it has ended, or its character differs, the prefix stops right there. Otherwise the column is common and the walk continues. The first string is a safe ruler because the answer is a prefix of it, and the early exit means a list with nothing in common is rejected after a single column.",
  complexity: { time: "O(n · k)", space: "O(1)" },
  python: `def longest_common_prefix(words: list[str]) -> str:
    if not words:
        return ""
    first = words[0]
    for i in range(len(first)):
        for w in words:
            if i >= len(w) or w[i] != first[i]:
                return first[:i]
    return first`,
  java: `public String longestCommonPrefix(String[] words) {
    if (words.length == 0) return "";
    String first = words[0];
    for (int i = 0; i < first.length(); i++) {
        for (String w : words) {
            if (i >= w.length() || w.charAt(i) != first.charAt(i)) return first.substring(0, i);
        }
    }
    return first;
}`,
  cpp: `string longestCommonPrefix(const vector<string>& words) {
    if (words.empty()) return "";
    string first = words[0];
    for (int i = 0; i < (int)first.size(); i++) {
        for (const string& w : words) {
            if (i >= (int)w.size() || w[i] != first[i]) return first.substr(0, i);
        }
    }
    return first;
}`,
  alternatives: [
    {
      name: "Shrink against each string",
      summary:
        "Start with the first string as the answer and, for each later string, trim the answer until it is a prefix of that one too.",
      complexity: { time: "O(n · k)", space: "O(k)" },
      python: `def longest_common_prefix(words: list[str]) -> str:
    if not words:
        return ""
    prefix = words[0]
    for w in words[1:]:
        while not w.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix`,
      java: `public String longestCommonPrefix(String[] words) {
    if (words.length == 0) return "";
    String prefix = words[0];
    for (int i = 1; i < words.length; i++) {
        while (!words[i].startsWith(prefix)) {
            prefix = prefix.substring(0, prefix.length() - 1);
            if (prefix.isEmpty()) return "";
        }
    }
    return prefix;
}`,
      cpp: `string longestCommonPrefix(const vector<string>& words) {
    if (words.empty()) return "";
    string prefix = words[0];
    for (size_t i = 1; i < words.size(); i++) {
        while (words[i].rfind(prefix, 0) != 0) {
            prefix.pop_back();
            if (prefix.empty()) return "";
        }
    }
    return prefix;
}`,
    },
  ],
}
