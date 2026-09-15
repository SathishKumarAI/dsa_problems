// implement-trie — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Each node holds a map from character to child plus a flag saying a word ends here. Insert walks the word, creating children as needed, and sets the flag on the final node. search and startsWith share the same walk — follow one child per character and fail the moment one is missing — and differ only in the last line: search returns the landing node's end-of-word flag, startsWith returns true simply for having arrived. Every operation costs the length of its argument, independent of how many words the structure holds, because the path taken depends only on the characters given."

export const whyNow = "Scanning a sorted list narrows by binary search but still compares whole strings, so a prefix query costs log n comparisons of length m. The tree walks one character at a time and never looks at a word that has already diverged, so the cost is the length of the query alone and the dictionary's size drops out entirely."

export const arc = "A trie is what you get when you stop storing strings and start storing the DECISIONS that spell them. That one change is what makes prefix questions constant-ish rather than a search: every word sharing a prefix shares a path, so asking about the prefix means visiting that path once instead of visiting every word that has it. Keep the end-of-word flag in mind as the general principle rather than a detail — a structure has to distinguish 'this is an answer' from 'this is on the way to an answer', and forgetting that is the bug in half of all first implementations. Once the shape is familiar it extends naturally: counting words under a node, storing a value at the end for a map, and adding a wildcard that branches the walk instead of following one child."

export const complexity = { time: "O(m) per operation for a word of length m", space: "O(total characters inserted)" }

export const python = `class TrieNode:
    def __init__(self) -> None:
        self.children: dict[str, TrieNode] = {}
        # the whole difference between search and startsWith lives here
        self.is_word = False


class Trie:
    def __init__(self) -> None:
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_word = True

    def _walk(self, s: str) -> TrieNode | None:
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.is_word

    def starts_with(self, prefix: str) -> bool:
        return self._walk(prefix) is not None


def run_trie(ops: list[str], words: list[str]) -> list[int]:
    trie = Trie()
    out: list[int] = []
    for op, word in zip(ops, words):
        if op == "insert":
            trie.insert(word)
        elif op == "search":
            out.append(1 if trie.search(word) else 0)
        elif op == "startsWith":
            out.append(1 if trie.starts_with(word) else 0)
    return out`

export const alternatives: Solution[] = [
  {
    name: "Keep a set of words",
    summary:
      "Store the inserted words in a hash set. search is then a single lookup and genuinely constant — but startsWith has to examine every word in the set, because a hash tells you about equality and nothing about prefixes. It is the rung that shows which query the structure is really for.",
    complexity: { time: "O(1) search, O(n * m) startsWith", space: "O(total characters)" },
    python: `class Trie:
    def __init__(self) -> None:
        self.words: set[str] = set()

    def insert(self, word: str) -> None:
        self.words.add(word)

    def search(self, word: str) -> bool:
        return word in self.words

    def starts_with(self, prefix: str) -> bool:
        return any(w.startswith(prefix) for w in self.words)


def run_trie(ops: list[str], words: list[str]) -> list[int]:
    trie = Trie()
    out: list[int] = []
    for op, word in zip(ops, words):
        if op == "insert":
            trie.insert(word)
        elif op == "search":
            out.append(1 if trie.search(word) else 0)
        elif op == "startsWith":
            out.append(1 if trie.starts_with(word) else 0)
    return out`,
  },
  {
    name: "Keep the words sorted",
    summary:
      "Hold the dictionary in sorted order and binary search it. Words sharing a prefix are adjacent, so startsWith is a search for the first word at or after the prefix followed by one comparison — logarithmic rather than linear, at the cost of an insert that has to keep the order.",
    complexity: { time: "O(m log n) per query, O(n) per insert", space: "O(total characters)" },
    whyNow:
      "A hash set destroys the very relationship the problem asks about: hashing scatters neighbouring strings, so every prefix question degenerates into checking all of them. Sorting keeps words with a common prefix adjacent, which makes the question answerable by search rather than by scan.",
    python: `class Trie:
    def __init__(self) -> None:
        self.words: list[str] = []

    def insert(self, word: str) -> None:
        lo, hi = 0, len(self.words)
        while lo < hi:
            mid = (lo + hi) // 2
            if self.words[mid] < word:
                lo = mid + 1
            else:
                hi = mid
        if lo == len(self.words) or self.words[lo] != word:
            self.words.insert(lo, word)

    def _lower_bound(self, s: str) -> int:
        lo, hi = 0, len(self.words)
        while lo < hi:
            mid = (lo + hi) // 2
            if self.words[mid] < s:
                lo = mid + 1
            else:
                hi = mid
        return lo

    def search(self, word: str) -> bool:
        i = self._lower_bound(word)
        return i < len(self.words) and self.words[i] == word

    def starts_with(self, prefix: str) -> bool:
        i = self._lower_bound(prefix)
        return i < len(self.words) and self.words[i].startswith(prefix)


def run_trie(ops: list[str], words: list[str]) -> list[int]:
    trie = Trie()
    out: list[int] = []
    for op, word in zip(ops, words):
        if op == "insert":
            trie.insert(word)
        elif op == "search":
            out.append(1 if trie.search(word) else 0)
        elif op == "startsWith":
            out.append(1 if trie.starts_with(word) else 0)
    return out`,
  },
]
