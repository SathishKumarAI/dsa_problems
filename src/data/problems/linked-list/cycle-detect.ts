import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "cycle-detect",
  title: "Detect a Cycle",
  pattern: "linked-list",
  difficulty: "easy",
  leetcode: "linked-list-cycle",
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
  whyNow:
    "The set is linear time but linear memory, on a problem whose whole point is constant space. Two pointers moving at different speeds must meet inside a cycle, and they remember nothing.",
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
  java: `public boolean hasCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`,
  cpp: `bool hasCycle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
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
      java: `public boolean hasCycle(ListNode head) {
    Set<ListNode> seen = new HashSet<>();
    while (head != null) {
        if (!seen.add(head)) return true;
        head = head.next;
    }
    return false;
}`,
      cpp: `bool hasCycle(const ListNode* head) {
    unordered_set<const ListNode*> seen;
    const ListNode* curr = head;
    while (curr != nullptr) {
        if (!seen.insert(curr).second) return true;
        curr = curr->next;
    }
    return false;
}`,
    },
  ],
}
