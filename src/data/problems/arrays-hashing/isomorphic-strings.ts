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
  arc:
    "Isomorphism is a pair of consistent mappings, and the trap is that one mapping is not enough: mapping every letter of the first string forward permits two letters collapsing onto one, which is not a bijection. Either keep both directions, or encode each string as the pattern of first-occurrence indices and compare the patterns — two representations of the same idea, and the second generalises to 'word pattern' problems where the tokens are words rather than characters. The habit to take away is to write the definition down formally before coding: 'a bijection preserving position' immediately tells you that one hash map is half an answer.",
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
  java: `public boolean isIsomorphic(String s, String t) {
    if (s.length() != t.length()) return false;
    Map<Character, Character> forward = new HashMap<>();
    Map<Character, Character> backward = new HashMap<>();
    for (int i = 0; i < s.length(); i++) {
        char a = s.charAt(i);
        char b = t.charAt(i);
        if (forward.containsKey(a) && forward.get(a) != b) return false;
        if (backward.containsKey(b) && backward.get(b) != a) return false;
        forward.put(a, b);
        backward.put(b, a);
    }
    return true;
}`,
  cpp: `bool isIsomorphic(const string& s, const string& t) {
    if (s.size() != t.size()) return false;
    unordered_map<char, char> forward;
    unordered_map<char, char> backward;
    for (size_t i = 0; i < s.size(); i++) {
        char a = s[i];
        char b = t[i];
        auto f = forward.find(a);
        if (f != forward.end() && f->second != b) return false;
        auto g = backward.find(b);
        if (g != backward.end() && g->second != a) return false;
        forward[a] = b;
        backward[b] = a;
    }
    return true;
}`,
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
      java: `public boolean isIsomorphic(String s, String t) {
    return Arrays.equals(shapeOf(s), shapeOf(t));
}
private int[] shapeOf(String s) {
    Map<Character, Integer> first = new HashMap<>();
    int[] out = new int[s.length()];
    for (int i = 0; i < s.length(); i++) {
        char ch = s.charAt(i);
        if (!first.containsKey(ch)) first.put(ch, i);
        out[i] = first.get(ch);
    }
    return out;
}`,
      cpp: `vector<int> shapeOf(const string& s) {
    unordered_map<char, int> first;
    vector<int> out;
    for (int i = 0; i < (int)s.size(); i++) {
        if (!first.count(s[i])) first[s[i]] = i;
        out.push_back(first[s[i]]);
    }
    return out;
}

bool isIsomorphic(const string& s, const string& t) {
    return shapeOf(s) == shapeOf(t);
}`,
    },
  ],
}
