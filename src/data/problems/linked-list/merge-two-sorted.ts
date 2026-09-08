import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "merge-two-sorted",
  title: "Merge Two Sorted Lists",
  pattern: "linked-list",
  difficulty: "easy",
  leetcode: "merge-two-sorted-lists",
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
  whyNow:
    "The recursion is that same merge with a stack frame per node. A dummy head and a tail pointer do it in a loop, in constant space.",
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
  java: `public ListNode mergeSorted(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0);
    ListNode tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b;
    return dummy.next;
}
`,
  cpp: `ListNode* mergeSorted(ListNode* a, ListNode* b) {
    ListNode* dummy = new ListNode(0);
    ListNode* tail = dummy;
    while (a && b) {
        if (a->val <= b->val) { tail->next = a; a = a->next; }
        else { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    return dummy->next;
}
`,
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
      java: `public Node mergeSorted(Node a, Node b){
    java.util.List<Integer> vals = new java.util.ArrayList<>();
    for (Node head : new Node[]{a,b}){
        while (head != null){
            vals.add(head.val);
            head = head.next;
        }
    }
    java.util.Collections.sort(vals, java.util.Comparator.reverseOrder());
    Node head = null;
    for (int v : vals){
        head = new Node(v, head);
    }
    return head;
}`,
      cpp: `Node* mergeSorted(const Node* a, const Node* b){
    std::vector<int> vals;
    for (const Node* head : {a,b}){
        while (head){
            vals.push_back(head->val);
            head = head->next;
        }
    }
    std::sort(vals.rbegin(), vals.rend());
    Node* head = nullptr;
    for (int v : vals){
        head = new Node(v, head);
    }
    return head;
}`,
    },
    {
      name: "Recursive",
      whyNow:
        "Sorting the combined values throws away the fact that both inputs are already sorted. Merging compares the two heads and never looks back.",
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
      java: `public ListNode mergeSorted(ListNode a, ListNode b) {
    if (a == null || b == null) return a != null ? a : b;
    if (a.val <= b.val) { a.next = mergeSorted(a.next, b); return a; }
    else { b.next = mergeSorted(a, b.next); return b; }
}`,
      cpp: `ListNode* mergeSorted(ListNode* a, ListNode* b) {
    if (!a || !b) return a ? a : b;
    if (a->val <= b->val) { a->next = mergeSorted(a->next, b); return a; }
    else { b->next = mergeSorted(a, b->next); return b; }
}`,
    },
  ],
}
