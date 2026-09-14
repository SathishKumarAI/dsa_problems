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
  arc: "The whole difficulty is one sentence: a singly linked list has no way to be read backwards, so a palindrome check has to manufacture one. Copying the values into an array manufactures it by buying a second copy of the data — the honest first answer, and O(n) memory to hold what the list is already holding. The alternative is to make the list itself readable from the back: walk a fast and a slow pointer to the middle, reverse the second half in place, and the two halves can then be compared head to head with nothing but pointers. That is two techniques you already have, composed — the fast/slow split from middle-of-list and the prev/curr rewiring from reverse-list — which is why both are worth knowing cold rather than merely recognising. An odd length needs no branch: the lone middle node has no partner and the shorter half simply runs out first. Note what the in-place version costs, though. The list comes back modified, and restoring it is one more reversal.",
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
  java: `public boolean isPalindrome(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    ListNode previous = null;
    while (slow != null) {
        ListNode nxt = slow.next;
        slow.next = previous;
        previous = slow;
        slow = nxt;
    }
    ListNode left = head;
    ListNode right = previous;
    while (right != null) {
        if (left.val != right.val) return false;
        left = left.next;
        right = right.next;
    }
    return true;
}`,
  cpp: `bool isPalindrome(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    ListNode* previous = nullptr;
    while (slow != nullptr) {
        ListNode* nxt = slow->next;
        slow->next = previous;
        previous = slow;
        slow = nxt;
    }
    ListNode* left = head;
    ListNode* right = previous;
    while (right != nullptr) {
        if (left->val != right->val) return false;
        left = left->next;
        right = right->next;
    }
    return true;
}`,
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
      java: `public boolean isPalindrome(ListNode head) {
    List<Integer> values = new ArrayList<>();
    ListNode node = head;
    while (node != null) {
        values.add(node.val);
        node = node.next;
    }
    for (int i = 0, j = values.size() - 1; i < j; i++, j--)
        if (!values.get(i).equals(values.get(j))) return false;
    return true;
}`,
      cpp: `bool isPalindrome(ListNode* head) {
    vector<int> values;
    ListNode* node = head;
    while (node != nullptr) {
        values.push_back(node->val);
        node = node->next;
    }
    for (int i = 0, j = (int)values.size() - 1; i < j; i++, j--)
        if (values[i] != values[j]) return false;
    return true;
}`,
    },
  ],
}
