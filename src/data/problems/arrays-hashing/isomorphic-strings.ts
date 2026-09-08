import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "isomorphic-strings",
  title: "Same Shape, Different Letters",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "isomorphic-strings",
  brief: "Can one string's letters be relabelled into the other's?",
  statement:
    "Given two strings of equal length, decide whether the characters of the first can be consistently replaced to produce the second. Each character maps to exactly one character, and no two characters may map to the same one.",
  constraints: [
    "1 <= s.length <= 5 * 10^4, and t has the same length",
    "s and t consist of any ASCII characters",
    "the mapping must be consistent in BOTH directions — 'badc' and 'baba' fail because b and d would both map to b",
    "a character may map to itself",
  ],
  examples: [
    { input: 's = "egg", t = "add"', output: "true", note: "e→a and g→d." },
    {
      input: 's = "foo", t = "bar"',
      output: "false",
      note: "o would have to become both a and r.",
    },
    {
      input: 's = "badc", t = "baba"',
      output: "false",
      note: "Forward is consistent; backward is not.",
    },
  ],
  hints: [
    "Walk the two strings together and record what each character has to become.",
    "A contradiction is a character that already has a different mapping.",
    "One map is not enough: two different characters must not land on the SAME target.",
  ],
  whyNow:
    "Encoding both strings into a canonical pattern works and is a neat trick, but it builds two whole new sequences before comparing anything. Two maps decide the answer at the first contradiction, which for most failing inputs is within the first few characters.",
  approach:
    "Carry two maps, forward and backward. At each position, if the forward map already sends this character somewhere else, or the backward map already claims this target for a different source, the strings are not isomorphic. Otherwise record both directions and continue. The backward map is the half people forget — without it, two distinct characters can be collapsed onto one, which the definition forbids.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def is_isomorphic(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    forward: dict[str, str] = {}
    backward: dict[str, str] = {}
    for i in range(len(s)):
        a, b = s[i], t[i]
        if a in forward and forward[a] != b:
            return False
        if b in backward and backward[b] != a:
            return False
        forward[a] = b
        backward[b] = a
    return True`,
  walkthrough: [
    {
      cells: { values: ["b", "a", "d", "c"] },
      caption: 's = "badc", t = "baba". Two maps travel with the walk.',
    },
    {
      cells: { values: ["b", "a", "d", "c"], marks: { 0: "focus" } },
      caption: "b→b recorded, and b←b backward.",
    },
    {
      cells: {
        values: ["b", "a", "d", "c"],
        marks: { 0: "window", 1: "focus" },
      },
      caption: "a→b? No: a→a here. Both maps agree so far.",
    },
    {
      cells: { values: ["b", "a", "d", "c"], marks: { 2: "compare" } },
      caption:
        "d must become b — but backward already says b came from b. Two sources, one target.",
    },
    {
      cells: { values: ["b", "a", "d", "c"], marks: { 2: "done" } },
      caption:
        "False, on the BACKWARD map. A forward-only check would have accepted this.",
    },
  ],
  alternatives: [
    {
      name: "Encode both as patterns",
      summary:
        "Rewrite each string as the position at which each character was first seen, then check whether the two encodings are identical.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def encode(s: str) -> list[int]:
    first: dict[str, int] = {}
    out = []
    for i, ch in enumerate(s):
        if ch not in first:
            first[ch] = i
        out.append(first[ch])
    return out


def is_isomorphic(s: str, t: str) -> bool:
    return encode(s) == encode(t)`,
    },
  ],
}
