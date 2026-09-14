// reverse-list — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The KEYS on
// `alternatives` are load-bearing where a journey exists: `lib/ladder.ts`
// merges an alternative with the act that shares its key, and `from:` in the
// journey must then name that key rather than an array index.
//
// Two arcs, and they are not duplicates. The one here is the short paragraph
// the PROBLEM page renders under the ladder; `arc.ts` holds the long one the
// teaching document ends on. Changing either does not oblige the other.

import type { Solution } from "../../data/types.ts"

export const approach = "Walk the list with prev (starts None) and curr (starts head). Each step saves curr.next, rewires curr.next to prev, then shifts both pointers forward. When curr runs off the end, prev holds the new head. The initial None terminates the reversed list without special-casing."

export const whyNow = "Recursion still holds a frame per node, so a long list overflows the stack. Three pointers in a loop do the same rewiring in constant space."

export const arc = "Every rung is chasing the same thing — turning each next pointer around without the list losing its grip on the rest of itself. The array copy manages it by giving up: it reads the values out and builds a second list, which answers a different question, since not one of the original nodes was reversed. Recursion keeps the real nodes and rewires them, but it has to reach the end before it can rewire anything, so a five-thousand-node list is five thousand live frames. The loop notices that the only thing a frame was holding is the node behind you — and one variable holds that. prev, curr and the saved next are the whole algorithm, and they are worth knowing cold, because in-place reversal is a subroutine inside palindrome-list, reorder-list, rotate-list by triple reversal and every reverse-in-k-groups variant. The starting None is not a detail either: it is what terminates the reversed list without a special case."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def reverse_list(head: Node | None) -> Node | None:
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev, curr = curr, nxt
    return prev`

export const java = `public Node reverseList(Node head) {
    Node prev = null;
    Node curr = head;
    while (curr != null) {
        Node nxt = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}`

export const cpp = `Node* reverseList(Node* head) {
    Node* prev = nullptr;
    Node* curr = head;
    while (curr) {
        Node* nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}`

export const alternatives: Solution[] = [
  {
    name: "Copy to array",
    summary:
      "Walk the list collecting every value into an array, then build a brand-new list from that array backwards. Correct and obvious, and it allocates n fresh nodes and hands back a different list from the one it was given, so every pointer the caller still holds points into the old list. That is exactly what 'reverse it in place' forbids.",
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
      "Recurse to the end, reverse everything after the current node, then hook the current node onto the tail of that reversed remainder and null out its own next. Four lines, and the clearest statement of the idea. It also opens one stack frame per node, which is the reason the iterative version is the one to have memorised.",
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
]
