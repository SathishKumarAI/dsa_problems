import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "middle-of-list",
  title: "The Middle of a Linked List",
  pattern: "linked-list",
  difficulty: "easy",
  leetcode: "middle-of-the-linked-list",
  brief: "Find the middle node in one pass, without counting first.",
  statement:
    "Given the head of a singly linked list, return the middle node. If the list has an even number of nodes, return the second of the two middle ones.",
  constraints: [
    "1 <= number of nodes <= 100",
    "1 <= node.val <= 100",
    "an EVEN length returns the SECOND middle node, which decides where the fast pointer must stop",
    "a single node is its own middle",
  ],
  examples: [
    { input: "head = [1, 2, 3, 4, 5]", output: "node 3" },
    {
      input: "head = [1, 2, 3, 4, 5, 6]",
      output: "node 4",
      note: "The second of the two middles.",
    },
  ],
  hints: [
    "You cannot index a linked list, and counting first means two passes.",
    "Send two pointers from the head, one moving twice as fast as the other.",
    "When the fast one runs out, the slow one has covered exactly half the distance.",
  ],
  whyNow:
    "Counting the nodes and then walking half of them is correct and simple, but it traverses the list twice and needs the length before it can start. Two pointers at different speeds derive the halfway point from the geometry of the walk itself, so the answer arrives on the first pass with nothing stored.",
  approach:
    "Advance a slow pointer one node at a time and a fast pointer two. When the fast pointer falls off the end, the slow one has travelled exactly half as far, which is the middle. The loop condition decides the even case: continuing while both the fast node and its successor exist makes the slow pointer land on the SECOND middle, which is what the problem asks for. Stopping one step earlier would return the first.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `class ListNode:
    def __init__(self, val: int = 0, nxt: "ListNode | None" = None):
        self.val = val
        self.next = nxt


def middle_node(head: ListNode | None) -> ListNode | None:
    slow = head
    fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    return slow`,
  java: `public ListNode middleNode(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}`,
  cpp: `ListNode* middleNode(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}`,
  alternatives: [
    {
      name: "Count, then walk half",
      summary:
        "Traverse once to count the nodes, then traverse again stopping at index length // 2.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `class ListNode:
    def __init__(self, val: int = 0, nxt: "ListNode | None" = None):
        self.val = val
        self.next = nxt


def middle_node(head: ListNode | None) -> ListNode | None:
    count = 0
    node = head
    while node is not None:
        count += 1
        node = node.next
    node = head
    for _ in range(count // 2):
        node = node.next
    return node`,
      java: `public ListNode middleNode(ListNode head) {
    int count = 0;
    ListNode node = head;
    while (node != null) {
        count++;
        node = node.next;
    }
    node = head;
    for (int i = 0; i < count / 2; i++) node = node.next;
    return node;
}`,
      cpp: `ListNode* middleNode(ListNode* head) {
    int count = 0;
    ListNode* node = head;
    while (node != nullptr) {
        count++;
        node = node->next;
    }
    node = head;
    for (int i = 0; i < count / 2; i++) node = node->next;
    return node;
}`,
    },
  ],
}
