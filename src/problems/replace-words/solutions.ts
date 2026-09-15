// replace-words — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Insert every root into a trie, flagging the node where each ends. For each word in the sentence, walk from the trie's root one character at a time and stop the moment you land on a flagged node — that prefix is the shortest matching root, because a walk encounters prefixes in increasing length. If the walk falls off the trie before reaching a flag, no root applies and the word is kept. Each word costs its own length rather than a comparison against every root, and the shortest-first rule needs no sorting because the structure already imposes it."

export const whyNow = "Trying prefixes against a hash set is already fast per attempt, but it rebuilds a substring for every length and hashes each one, so a long word pays for work it has already done one character earlier. The trie walk extends the same path instead, and stops at the first flag without ever constructing a string."

export const arc = "The habit to take from this one is to look for an ordering that a structure gives you for free rather than one you impose. The problem says shortest root wins, which sounds like it needs the roots sorted by length or every match collected and compared — and neither is necessary, because walking down from the root visits a word's prefixes in exactly increasing order of length. When a data structure's natural traversal order already matches the tie-break a problem asks for, the tie-break stops being code. That is the same reason sorting by end makes interval scheduling greedy, and it is worth asking of every problem that contains the words shortest, first or smallest. The corner case here is the word that matches nothing: falling off the trie and arriving at an unflagged node are both failures, and they are reached differently."

export const complexity = { time: "O(total characters in roots and sentence)", space: "O(total characters in the roots)" }

export const python = `class TrieNode:
    def __init__(self) -> None:
        self.children: dict[str, TrieNode] = {}
        self.is_root = False


def replace_words(dictionary: list[str], sentence: str) -> str:
    trie = TrieNode()
    for root in dictionary:
        node = trie
        for ch in root:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_root = True

    def shortest_root(word: str) -> str:
        node = trie
        for i, ch in enumerate(word):
            node = node.children.get(ch)
            if node is None:
                return word  # fell off the trie: no root applies
            if node.is_root:
                # a walk meets prefixes shortest first, so stop at the first flag
                return word[: i + 1]
        return word

    return " ".join(shortest_root(w) for w in sentence.split(" "))`

export const alternatives: Solution[] = [
  {
    name: "Try every root on every word",
    summary:
      "For each word, scan the whole dictionary for roots that begin it and keep the shortest one found. It is the definition typed out and needs nothing but a prefix test, at a cost of one full dictionary pass per word in the sentence.",
    complexity: { time: "O(words * roots * length)", space: "O(1) beyond the output" },
    python: `def replace_words(dictionary: list[str], sentence: str) -> str:
    out: list[str] = []
    for word in sentence.split(" "):
        best = word
        for root in dictionary:
            if word.startswith(root) and len(root) < len(best):
                best = root
        out.append(best)
    return " ".join(out)`,
  },
  {
    name: "Hash the roots, try prefixes shortest first",
    summary:
      "Put the roots in a set and, for each word, test its prefixes from length one upwards, stopping at the first hit. The shortest-first rule is then enforced by the order of the loop rather than by comparing candidates.",
    complexity: { time: "O(total characters in the sentence)", space: "O(total characters in the roots)" },
    whyNow:
      "Scanning the dictionary per word compares against roots that differ at the very first character. Asking the set directly about the prefixes a word actually has replaces a search over the dictionary with a handful of lookups.",
    python: `def replace_words(dictionary: list[str], sentence: str) -> str:
    roots = set(dictionary)
    out: list[str] = []
    for word in sentence.split(" "):
        replaced = word
        for i in range(1, len(word) + 1):
            if word[:i] in roots:
                replaced = word[:i]
                break  # shortest first, so the first hit wins
        out.append(replaced)
    return " ".join(out)`,
  },
]
