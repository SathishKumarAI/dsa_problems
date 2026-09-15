// lru-cache — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Combine a hash map from key to node with a doubly linked list holding the nodes in recency order, most recent at the front. A get looks the key up in the map, unlinks its node and re-attaches it at the front, then returns its value. A put either refreshes and updates an existing node the same way, or creates one at the front — and when that takes the size past capacity, removes the node at the back and deletes its key from the map. Every step is a constant number of pointer writes, and the map is what makes the middle of the list reachable without walking it."

export const whyNow = "The ordered dictionary IS this structure, and reaching for it is the right answer in practice — but it hides the part being asked about. Building the map and the list by hand is what makes the constant-time claim inspectable: the eviction end and the refresh are pointer writes you can point at, not a library's promise."

export const arc = "Two structures, each covering the other's blind spot, is the whole idea, and it is the most reusable lesson in the design pattern. A hash map finds anything instantly and knows nothing about order; a linked list maintains order and finds nothing. Store the list's NODES as the map's values and both weaknesses vanish, because the map turns an arbitrary key into a position the list can then splice in constant time. Once that pairing is familiar it answers a whole family of questions — LFU caches, a queue with random deletion, an ordered set with lookups. The rules to keep straight are behavioural rather than structural: a get is a use, an update is a use, and eviction happens only when a genuinely new key arrives at full capacity."

export const complexity = { time: "O(1) per operation", space: "O(capacity)" }

export const python = `class Node:
    def __init__(self, key: int = 0, val: int = 0) -> None:
        self.key, self.val = key, val
        self.prev: Node | None = None
        self.next: Node | None = None


class LRUCache:
    def __init__(self, capacity: int) -> None:
        self.cap = capacity
        self.by_key: dict[int, Node] = {}
        # sentinels, so no insertion or removal is ever a special case
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, node: Node) -> None:
        node.prev.next, node.next.prev = node.next, node.prev

    def _push_front(self, node: Node) -> None:
        node.next, node.prev = self.head.next, self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        node = self.by_key.get(key)
        if node is None:
            return -1
        self._unlink(node)
        self._push_front(node)  # a read counts as a use
        return node.val

    def put(self, key: int, value: int) -> None:
        node = self.by_key.get(key)
        if node is not None:
            node.val = value
            self._unlink(node)
            self._push_front(node)
            return
        node = Node(key, value)
        self.by_key[key] = node
        self._push_front(node)
        if len(self.by_key) > self.cap:
            oldest = self.tail.prev
            self._unlink(oldest)
            del self.by_key[oldest.key]


def run_lru(capacity: int, ops: list[str], args: list[list[int]]) -> list[int]:
    cache = LRUCache(capacity)
    out: list[int] = []
    for op, a in zip(ops, args):
        if op == "put":
            cache.put(a[0], a[1])
        elif op == "get":
            out.append(cache.get(a[0]))
    return out`

export const alternatives: Solution[] = [
  {
    name: "A list plus a scan for the oldest",
    summary:
      "Keep the entries in a plain list in use order and move a key to the end whenever it is touched, scanning to find it first. Eviction is then simply dropping the front. Correct, obvious, and linear per operation because finding a key in a list means walking it.",
    complexity: { time: "O(n) per operation", space: "O(capacity)" },
    python: `class LRUCache:
    def __init__(self, capacity: int) -> None:
        self.cap = capacity
        self.order: list[int] = []  # least recently used first
        self.vals: dict[int, int] = {}

    def get(self, key: int) -> int:
        if key not in self.vals:
            return -1
        self.order.remove(key)  # the linear step
        self.order.append(key)
        return self.vals[key]

    def put(self, key: int, value: int) -> None:
        if key in self.vals:
            self.order.remove(key)
        elif len(self.vals) >= self.cap:
            oldest = self.order.pop(0)
            del self.vals[oldest]
        self.vals[key] = value
        self.order.append(key)


def run_lru(capacity: int, ops: list[str], args: list[list[int]]) -> list[int]:
    cache = LRUCache(capacity)
    out: list[int] = []
    for op, a in zip(ops, args):
        if op == "put":
            cache.put(a[0], a[1])
        elif op == "get":
            out.append(cache.get(a[0]))
    return out`,
  },
  {
    name: "Timestamp every use, evict the smallest",
    summary:
      "Stamp each key with a counter that ticks on every access, and evict by finding the smallest stamp. Lookups become constant because the map holds the value directly, and only the eviction is slow — a sharper picture of where the cost actually lives.",
    complexity: { time: "O(n) on eviction, O(1) otherwise", space: "O(capacity)" },
    whyNow:
      "Moving a key in a list means finding it first, so even a plain get pays a scan. Recording WHEN each key was used makes every lookup and refresh constant, and leaves exactly one slow operation instead of three.",
    python: `class LRUCache:
    def __init__(self, capacity: int) -> None:
        self.cap = capacity
        self.vals: dict[int, int] = {}
        self.used: dict[int, int] = {}
        self.clock = 0

    def _touch(self, key: int) -> None:
        self.clock += 1
        self.used[key] = self.clock

    def get(self, key: int) -> int:
        if key not in self.vals:
            return -1
        self._touch(key)
        return self.vals[key]

    def put(self, key: int, value: int) -> None:
        if key not in self.vals and len(self.vals) >= self.cap:
            oldest = min(self.used, key=lambda k: self.used[k])
            del self.vals[oldest]
            del self.used[oldest]
        self.vals[key] = value
        self._touch(key)


def run_lru(capacity: int, ops: list[str], args: list[list[int]]) -> list[int]:
    cache = LRUCache(capacity)
    out: list[int] = []
    for op, a in zip(ops, args):
        if op == "put":
            cache.put(a[0], a[1])
        elif op == "get":
            out.append(cache.get(a[0]))
    return out`,
  },
]
