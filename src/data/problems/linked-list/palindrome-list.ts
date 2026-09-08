import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "palindrome-list",
  title: "Is the Linked List a Palindrome?",
  pattern: "linked-list",
  difficulty: "easy",
  leetcode: "palindrome-linked-list",
  brief: "Read the same forwards and backwards, in constant space.",
  statement:
    "Given the head of a singly linked list, return true if the sequence of values reads the same forwards and backwards.",
  constraints: [
    "1 <= number of nodes <= 10^5",
    "0 <= node.val <= 9",
    "a singly linked list cannot be read backwards, which is the entire difficulty",
    "constant extra space is the goal, which rules out copying the values into an array",
  ],
  examples: [
    { input: "head = [1, 2, 2, 1]", output: "true" },
    { input: "head = [1, 2]", output: "false" },
  ],
  hints: [
    "Copying into an array makes it trivial — and spends O(n) memory to do it.",
    "Find the middle, then reverse the second half in place. Now you have two lists to compare.",
    "Compare from both heads until the reversed half runs out; the odd middle node is skipped naturally.",
  ],
  whyNow:
    "Copying the values into an array is the honest first answer, and it costs O(n) memory to hold data the list already stores. Reversing the second half in place gives a backwards reader for free, so the comparison happens against the list itself and the extra space drops to a handful of pointers.",
  approach:
    "Walk fast and slow pointers to find the middle, then reverse the list from the middle onward by relinking the nodes. Compare the front half against the reversed back half node by node; on an odd length the extra middle node has no partner and the shorter reversed half simply runs out first, so it needs no special case. A mismatch anywhere means false. The list is left modified, which is worth knowing — restoring it is another reversal if the caller cares.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `class ListNode:
    def __init__(self, val: int = 0, nxt: "ListNode | None" = None):
        self.val = val
        self.next = nxt


def is_palindrome(head: ListNode | None) -> bool:
    slow = head
    fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    previous = None
    while slow is not None:
        nxt = slow.next
        slow.next = previous
        previous = slow
        slow = nxt
    left = head
    right = previous
    while right is not None:
        if left.val != right.val:
            return False
        left = left.next
        right = right.next
    return True`,
  walkthrough: [
    {
      text: `1 → 2 → 2 → 1 → None`,
      caption:
        "A singly linked list cannot be walked backwards — that is the whole problem.",
    },
    {
      text: `1 → 2 → 2 → 1
         ^middle`,
      caption: "Fast and slow pointers find the middle in one pass.",
    },
    {
      text: `1 → 2 → None
2 ← 1`,
      caption:
        "The second half is reversed in place by relinking, giving a backwards reader.",
    },
    {
      text: `compare 1 vs 1  ✓
compare 2 vs 2  ✓`,
      caption:
        "Two heads walk toward each other's halves. A mismatch would end it here.",
    },
    {
      text: `right ran out → true`,
      caption:
        "On an odd length the unmatched middle simply has no partner, so it needs no special case.",
    },
  ],
  alternatives: [
    {
      name: "Copy into an array",
      summary:
        "Walk the list collecting the values, then compare the array against its own reverse.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `class ListNode:
    def __init__(self, val: int = 0, nxt: "ListNode | None" = None):
        self.val = val
        self.next = nxt


def is_palindrome(head: ListNode | None) -> bool:
    values = []
    node = head
    while node is not None:
        values.append(node.val)
        node = node.next
    return values == values[::-1]`,
    },
  ],
}
