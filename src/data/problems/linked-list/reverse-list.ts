import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "reverse-list",
  title: "Reverse a Linked List",
  pattern: "linked-list",
  difficulty: "easy",
  leetcode: "reverse-linked-list",
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
  whyNow:
    "Recursion still holds a frame per node, so a long list overflows the stack. Three pointers in a loop do the same rewiring in constant space.",
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
  java: `public Node reverseList(Node head) {
    Node prev = null;
    Node curr = head;
    while (curr != null) {
        Node nxt = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}`,
  cpp: `Node* reverseList(Node* head) {
    Node* prev = nullptr;
    Node* curr = head;
    while (curr) {
        Node* nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}`,
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
      java: `public Node reverseList(Node head) {
    ArrayList<Integer> vals = new ArrayList<>();
    while (head != null) {
        vals.add(head.val);
        head = head.next;
    }
    Node newHead = null;
    for (int v : vals) {
        newHead = new Node(v, newHead);
    }
    return newHead;
}`,
      cpp: `Node* reverseList(Node* head) {
    vector<int> vals;
    while (head != nullptr) {
        vals.push_back(head->val);
        head = head->next;
    }
    Node* new_head = nullptr;
    for (int v : vals) {
        new_head = new Node(v, new_head);
    }
    return new_head;
}`,
    },
    {
      name: "Recursive",
      whyNow:
        "Rebuilding the list allocates a second one and gives up the in-place requirement. Recursion rewires the nodes that are already there.",
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
      java: `public Node reverseList(Node head) {
    if (head == null || head.next == null)
        return head;
    Node newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}`,
      cpp: `Node* reverseList(Node* head) {
    if (!head || !head->next)
        return head;
    Node* newHead = reverseList(head->next);
    head->next->next = head;
    head->next = nullptr;
    return newHead;
}`,
    },
  ],
}
