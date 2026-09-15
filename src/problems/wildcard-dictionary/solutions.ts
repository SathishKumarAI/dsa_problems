// wildcard-dictionary — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Build the same trie as before and make search recursive over position and node. At a concrete letter follow that one child, failing if it is absent; at a dot, recurse into every child and succeed if any branch does. The recursion ends when the pattern is exhausted, where the answer is the node's end-of-word flag rather than the mere fact of having arrived. With d dots the work multiplies by the branching at each one, so the cost is bounded by 26^d times the pattern length — which is exactly why the problem caps the number of dots."

export const whyNow = "Matching the pattern against every stored word touches words that diverged at the first character, and it re-walks their shared prefixes once per word. The trie visits each shared prefix a single time and only fans out where a dot actually makes the next character unknown."

export const arc = "This is the moment a data structure stops being a lookup and becomes a search space, and the transition is worth watching closely. In the plain trie every character determined one child, so the walk was deterministic and the cost was the word's length. One wildcard removes that determinism and the same structure now hosts a depth-first search, with the trie's branches as the choices and the pattern's position as the depth. The cost model changes with it: no longer the length of the query, but the length times how much the unknowns fan out. Recognising when a structure has crossed that line tells you whether to reason about it with a walk or with a recursion — and here it also tells you why the constraint caps the dots, because that cap is the only thing keeping the fan-out finite in practice."

export const complexity = { time: "O(26^d * m) for m characters and d dots", space: "O(total characters added)" }

export const python = `class TrieNode:
    def __init__(self) -> None:
        self.children: dict[str, TrieNode] = {}
        self.is_word = False


class WordDictionary:
    def __init__(self) -> None:
        self.root = TrieNode()

    def add_word(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_word = True

    def search(self, word: str) -> bool:
        def go(i: int, node: TrieNode) -> bool:
            if i == len(word):
                # arriving is not matching: the flag is what decides
                return node.is_word
            ch = word[i]
            if ch == ".":
                # the walk becomes a search: every child is a candidate
                return any(go(i + 1, kid) for kid in node.children.values())
            kid = node.children.get(ch)
            return kid is not None and go(i + 1, kid)

        return go(0, self.root)


def run_dictionary(ops: list[str], words: list[str]) -> list[int]:
    d = WordDictionary()
    out: list[int] = []
    for op, word in zip(ops, words):
        if op == "addWord":
            d.add_word(word)
        elif op == "search":
            out.append(1 if d.search(word) else 0)
    return out`

export const alternatives: Solution[] = [
  {
    name: "Match the pattern against every word",
    summary:
      "Keep a list of the added words and, for each search, compare the pattern with each word character by character, treating a dot as an automatic match. Simple and obviously correct, and it re-reads the same shared prefixes once per stored word.",
    complexity: { time: "O(n * m) per search", space: "O(total characters)" },
    python: `class WordDictionary:
    def __init__(self) -> None:
        self.words: list[str] = []

    def add_word(self, word: str) -> None:
        self.words.append(word)

    def search(self, word: str) -> bool:
        for candidate in self.words:
            if len(candidate) != len(word):
                continue
            if all(p == "." or p == c for p, c in zip(word, candidate)):
                return True
        return False


def run_dictionary(ops: list[str], words: list[str]) -> list[int]:
    d = WordDictionary()
    out: list[int] = []
    for op, word in zip(ops, words):
        if op == "addWord":
            d.add_word(word)
        elif op == "search":
            out.append(1 if d.search(word) else 0)
    return out`,
  },
  {
    name: "Bucket the words by length",
    summary:
      "A pattern only ever matches words of exactly its own length, so group the dictionary by length and compare against that bucket alone. It is one line of change and it removes most of the candidates on a mixed dictionary — without touching the real waste.",
    complexity: { time: "O(k * m) for k words of that length", space: "O(total characters)" },
    whyNow:
      "Comparing against every word spends most of its time rejecting candidates on the length alone, which is knowable before a single character is read. Bucketing makes that rejection free.",
    python: `class WordDictionary:
    def __init__(self) -> None:
        self.by_len: dict[int, list[str]] = {}

    def add_word(self, word: str) -> None:
        self.by_len.setdefault(len(word), []).append(word)

    def search(self, word: str) -> bool:
        for candidate in self.by_len.get(len(word), []):
            if all(p == "." or p == c for p, c in zip(word, candidate)):
                return True
        return False


def run_dictionary(ops: list[str], words: list[str]) -> list[int]:
    d = WordDictionary()
    out: list[int] = []
    for op, word in zip(ops, words):
        if op == "addWord":
            d.add_word(word)
        elif op == "search":
            out.append(1 if d.search(word) else 0)
    return out`,
  },
]
