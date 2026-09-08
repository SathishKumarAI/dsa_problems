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
  walkthrough: [
    {
      cells: { values: ["flower", "flow", "flight"] },
      caption: "Read down the columns, not across the strings.",
    },
    {
      cells: {
        values: ["flower", "flow", "flight"],
        marks: { 0: "focus", 1: "focus", 2: "focus" },
      },
      caption: "Column 0: f, f, f — agreed.",
    },
    {
      cells: {
        values: ["flower", "flow", "flight"],
        marks: { 0: "window", 1: "window", 2: "window" },
      },
      caption: "Column 1: l, l, l — agreed. The prefix is 'fl' so far.",
    },
    {
      cells: { values: ["flower", "flow", "flight"], marks: { 2: "compare" } },
      caption: "Column 2: o, o, i — 'flight' disagrees. Stop immediately.",
    },
    {
      cells: { values: ["fl"], marks: { 0: "done" } },
      caption: "Answer 'fl'. Only three columns were ever read.",
    },
  ],
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
    },
  ],
}
