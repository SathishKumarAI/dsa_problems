import type { Problem } from "../types.ts"

export const linkedList: Problem[] = [
  {
    id: "reverse-list",
    title: "Reverse a Linked List",
    pattern: "linked-list",
    difficulty: "easy",
    brief: "Flip all next-pointers in place.",
    statement:
      "Given the head of a singly linked list, reverse it in place and return the new head.",
    constraints: [
      "0 <= list length <= 5000",
      "-5000 <= node value <= 5000",
      "an empty list is legal input",
    ],
    examples: [{ input: "1 → 2 → 3 → ∅", output: "3 → 2 → 1 → ∅" }],
    hints: [
      "You only ever need three pointers: previous, current, and a saved next.",
      "At each node: remember where you were going, point backwards, step forward.",
      "prev starts as None — that None becomes the tail's new next, terminating the reversed list for free.",
    ],
    approach:
      "Walk the list with prev (starts None) and curr (starts head). Each step saves curr.next, rewires curr.next to prev, then shifts both pointers forward. When curr runs off the end, prev holds the new head. The initial None terminates the reversed list without special-casing.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def reverse_list(head: Node | None) -> Node | None:
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev, curr = curr, nxt
    return prev`,
    walkthrough: [
      {
        text: "prev   curr\n ∅      1 → 2 → 3 → ∅",
        caption: "Start: prev is None, curr at head.",
      },
      {
        text: "       save nxt = 2\n ∅ ← 1      2 → 3 → ∅\nprev'  curr'",
        caption: "Point 1 back at None, step both pointers.",
      },
      {
        text: "       save nxt = 3\n ∅ ← 1 ← 2      3 → ∅\n       prev   curr",
        caption: "Point 2 back at 1, step forward.",
      },
      {
        text: " ∅ ← 1 ← 2 ← 3      ∅\n            prev   curr",
        caption: "Point 3 back at 2. curr is now None — loop ends.",
      },
      {
        text: "return prev\n\n3 → 2 → 1 → ∅",
        caption: "prev holds the new head. Three pointers, zero extra memory.",
      },
    ],
    alternatives: [
      {
        name: "Copy to array",
        summary:
          'Collect values, rebuild a reversed list. Obvious, allocates n nodes, and disqualifies you from the "in place" requirement — but it\'s the honest baseline.',
        complexity: { time: "O(n)", space: "O(n)" },
        python: `def reverse_list(head: Node | None) -> Node | None:
    vals = []
    while head:
        vals.append(head.val)
        head = head.next
    new_head = None
    for v in vals:
        new_head = Node(v, new_head)
    return new_head`,
      },
      {
        name: "Recursive",
        summary:
          "Reverse the tail, then hook the current node behind it. Elegant, but n stack frames — the iterative version is the one to ship.",
        complexity: { time: "O(n)", space: "O(n) stack" },
        python: `def reverse_list(head: Node | None) -> Node | None:
    if head is None or head.next is None:
        return head
    new_head = reverse_list(head.next)
    head.next.next = head
    head.next = None
    return new_head`,
      },
    ],
  },
  {
    id: "cycle-detect",
    title: "Detect a Cycle",
    pattern: "linked-list",
    difficulty: "easy",
    brief: "Does the list loop back on itself?",
    statement:
      "Given the head of a linked list, return true if following next-pointers ever revisits a node (a cycle), false if the walk reaches the end.",
    constraints: [
      "0 <= list length <= 10^4",
      "-10^5 <= node value <= 10^5",
      "the cycle, if any, is entered from some node's next pointer",
      "O(1) extra space is the point — a visited set solves it and misses the lesson",
    ],
    examples: [
      { input: "1 → 2 → 3 → (back to 2)", output: "true" },
      { input: "1 → 2 → ∅", output: "false" },
    ],
    hints: [
      "A hash set of visited nodes works but costs O(n) memory.",
      "Two runners on a circular track: the faster one always laps the slower one.",
      "Advance slow by 1 and fast by 2. Cycle ⇔ they meet; no cycle ⇔ fast hits None.",
    ],
    approach:
      "Floyd's tortoise and hare. Slow moves one node per step, fast moves two. If there is no cycle, fast reaches the end. If there is one, both eventually enter it, and the gap between them shrinks by exactly one node per step (fast gains 1 on slow inside the loop), so they must collide rather than skip past each other.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def has_cycle(head) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
    walkthrough: [
      {
        text: "1 → 2 → 3 → 4\n    ↑       │\n    └───────┘\n\nslow = 1, fast = 1",
        caption: "List with a cycle: 4 points back to 2.",
      },
      {
        text: "slow: 1 → 2\nfast: 1 → 3\n\n(slow +1, fast +2)",
        caption: "Step 1: runners separate.",
      },
      {
        text: "slow: 2 → 3\nfast: 3 → 2  (via 4, wrapping)",
        caption: "Step 2: fast wraps around the cycle.",
      },
      {
        text: "slow: 3 → 4\nfast: 2 → 4\n\nslow is fast  →  cycle!",
        caption:
          "Step 3: they collide. Gap shrinks by 1 per step inside the loop — collision is guaranteed.",
      },
    ],
    alternatives: [
      {
        name: "Visited set",
        summary:
          "Remember every node object seen; a repeat means a cycle. Linear time and dead simple — the O(n) memory is its only sin.",
        complexity: { time: "O(n)", space: "O(n)" },
        python: `def has_cycle(head) -> bool:
    seen = set()
    while head:
        if id(head) in seen:
            return True
        seen.add(id(head))
        head = head.next
    return False`,
      },
    ],
  },
  {
    id: "merge-two-sorted",
    title: "Merge Two Sorted Lists",
    pattern: "linked-list",
    difficulty: "easy",
    brief: "Splice two sorted lists into one sorted list.",
    statement:
      "Given the heads of two sorted linked lists, merge them into one sorted list by splicing existing nodes (no new value nodes) and return its head.",
    constraints: [
      "0 <= each list length <= 50",
      "-100 <= node value <= 100",
      "both lists are sorted ascending",
      "either list may be empty",
    ],
    examples: [
      { input: "a = 1 → 3 → 5, b = 2 → 4", output: "1 → 2 → 3 → 4 → 5" },
    ],
    hints: [
      "Repeatedly take the smaller of the two front nodes.",
      'A dummy head node kills every "is this the first node?" special case.',
      "When one list runs out, the other is already sorted — attach the whole remainder.",
    ],
    approach:
      "Create a dummy node and a tail pointer at it. While both lists are non-empty, attach the smaller head to tail and advance that list. When one empties, attach the survivor's remainder in one assignment. Return dummy.next. The dummy means the first comparison needs no special handling.",
    complexity: { time: "O(n + m)", space: "O(1)" },
    python: `def merge_sorted(a, b):
    dummy = tail = Node(0)
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next`,
    walkthrough: [
      {
        text: "a: 1 → 3 → 5\nb: 2 → 4\n\nout: [dummy] →",
        caption: "Dummy head avoids special-casing the first splice.",
      },
      {
        text: "1 ≤ 2 — take 1 from a\n\na: 3 → 5\nb: 2 → 4\nout: [dummy] → 1",
        caption: "Compare fronts, splice the smaller.",
      },
      {
        text: "2 < 3 — take 2 from b\n\na: 3 → 5\nb: 4\nout: [dummy] → 1 → 2",
        caption: "Tail always points at the last spliced node.",
      },
      {
        text: "3 ≤ 4 — take 3        4 < 5 — take 4\n\na: 5\nb: ∅\nout: [dummy] → 1 → 2 → 3 → 4",
        caption: "b just emptied.",
      },
      {
        text: "attach remainder of a in one step\n\nout: [dummy] → 1 → 2 → 3 → 4 → 5\nreturn dummy.next",
        caption: "The leftover list is already sorted — no loop needed.",
      },
    ],
    alternatives: [
      {
        name: "Collect and sort",
        summary:
          "Dump both lists into one array, sort, rebuild. Throws away the pre-sorted structure — O(n log n) where merging is linear.",
        complexity: { time: "O((n+m) log (n+m))", space: "O(n+m)" },
        python: `def merge_sorted(a, b):
    vals = []
    for head in (a, b):
        while head:
            vals.append(head.val)
            head = head.next
    head = None
    for v in sorted(vals, reverse=True):
        head = Node(v, head)
    return head`,
      },
      {
        name: "Recursive",
        summary:
          "The smaller head owns the merge of everything else. Reads beautifully; n+m stack frames make it a demo, not a default.",
        complexity: { time: "O(n+m)", space: "O(n+m) stack" },
        python: `def merge_sorted(a, b):
    if not a or not b:
        return a or b
    if a.val <= b.val:
        a.next = merge_sorted(a.next, b)
        return a
    b.next = merge_sorted(a, b.next)
    return b`,
      },
    ],
  },
]
