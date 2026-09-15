// merge-two-sorted — the ladder: every way in, worst first.
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

export const approach = "Create a dummy node and a tail pointer at it. While both lists are non-empty, attach the smaller head to tail and advance that list. When one empties, attach the survivor's remainder in one assignment. Return dummy.next. The dummy means the first comparison needs no special handling."

export const whyNow = "The recursion is that same merge with a stack frame per node. A dummy head and a tail pointer do it in a loop, in constant space."

export const arc = "One fact carries all three rungs: at any moment the smallest node left anywhere is one of the two heads, so the whole merge is a sequence of single comparisons and no node is ever looked at twice. Dumping both lists into an array and sorting throws that fact away and pays n log n to rediscover an order that arrived for free. Recursion keeps the fact — the smaller head owns the merge of everything behind it — and reads beautifully at a stack frame per node. The loop keeps the fact and drops the frames: a dummy node to hang the result from, a tail pointer to append to, and one assignment at the end to splice on whichever list still has nodes, because that remainder is already sorted. The dummy is the piece to know cold. It removes the question of whether this is the first node from this problem, from merge-k-lists, from remove-list-elements, and from every builder that would otherwise special-case its own head."

export const complexity = { time: "O(n + m)", space: "O(1)" }

export const python = `def merge_sorted(a, b):
    dummy = tail = Node(0)
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next`

export const java = `public ListNode mergeSorted(ListNode a, ListNode b) {
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
`

export const cpp = `ListNode* mergeSorted(ListNode* a, ListNode* b) {
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
`

export const alternatives: Solution[] = [
  {
    name: "Collect and sort",
    summary:
      "Dump the values of both lists into one array, sort it, and build a fresh list. It throws away the one fact the problem handed you, that both inputs are ALREADY sorted, and pays n log n for work that merging does in linear time. It also allocates n + m new nodes when the problem asks you to splice the existing ones.",
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
      "Whichever head is smaller owns the answer: attach it to the merge of its own tail with the other list, and return it. It reads like the definition of merging and is the clearest statement of the idea, and it opens one stack frame per node merged, which makes it a whiteboard version rather than the one you ship.",
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
]
