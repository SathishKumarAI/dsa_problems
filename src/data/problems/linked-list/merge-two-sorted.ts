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
  arc: "One fact carries all three rungs: at any moment the smallest node left anywhere is one of the two heads, so the whole merge is a sequence of single comparisons and no node is ever looked at twice. Dumping both lists into an array and sorting throws that fact away and pays n log n to rediscover an order that arrived for free. Recursion keeps the fact — the smaller head owns the merge of everything behind it — and reads beautifully at a stack frame per node. The loop keeps the fact and drops the frames: a dummy node to hang the result from, a tail pointer to append to, and one assignment at the end to splice on whichever list still has nodes, because that remainder is already sorted. The dummy is the piece to know cold. It removes the question of whether this is the first node from this problem, from merge-k-lists, from remove-list-elements, and from every builder that would otherwise special-case its own head.",
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
    List<Integer> vals = new ArrayList<>();
    for (Node head : new Node[]{a,b}){
        while (head != null){
            vals.add(head.val);
            head = head.next;
        }
    }
    Collections.sort(vals, Comparator.reverseOrder());
    Node head = null;
    for (int v : vals){
        head = new Node(v, head);
    }
    return head;
}`,
      cpp: `Node* mergeSorted(const Node* a, const Node* b){
    vector<int> vals;
    for (const Node* head : {a,b}){
        while (head){
            vals.push_back(head->val);
            head = head->next;
        }
    }
    sort(vals.rbegin(), vals.rend());
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
