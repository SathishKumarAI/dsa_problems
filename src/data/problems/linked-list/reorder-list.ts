import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "reorder-list",
  title: "Fold the List Onto Itself",
  pattern: "linked-list",
  difficulty: "medium",
  leetcode: "reorder-list",
  brief:
    "Interleave the list with its own reverse: first, last, second, second-last.",
  statement:
    "Given the head of a linked list, reorder it so it runs first node, last node, second node, second-last node, and so on, and return the head. The nodes must be relinked, not refilled with new values.",
  constraints: [
    "1 <= nodes <= 5 * 10^4, values in 0..1000",
    "the fold pairs node i with node n − 1 − i, so the answer needs the BACK of the list — the one direction a singly linked list will not give you",
    "an ODD length leaves the middle node alone at the end, and it belongs to the FRONT half, which decides which of the two middles you split at",
    "lists of 1 and 2 nodes are already in the required order and must come back untouched",
    "the list is singly linked, so anything that walks backwards has to build that ability first",
  ],
  examples: [
    { input: "head = [1,2,3,4]", output: "[1,4,2,3]" },
    {
      input: "head = [1,2,3,4,5]",
      output: "[1,5,2,4,3]",
      note: "Odd length: 3 is the middle and ends up last, on its own. Split so the front half KEEPS it — [1,2,3] and [4,5] — or the weave runs out of partners a step early.",
    },
    { input: "head = [1,2]", output: "[1,2]" },
  ],
  hints: [
    "Write out where each node ends up. The second output node is the last input node, the fourth is the second-last — you are reading the back half backwards.",
    "A singly linked list has no backwards. But half a list can be reversed in place in one pass, and then it does.",
    "Split at the middle, reverse the second half, then zip the two halves together one node at a time.",
  ],
  whyNow:
    "The node array is a full second copy of a 5 * 10^4-node list, held only so the code can reach the back. Reversing the back half in place makes that same back-to-front walk cost nothing but the pointers already in the list.",
  arc:
    "The fold pairs node i with node n − 1 − i, so every rung is answering one question: how do you reach the BACK of a list that only points forwards. Recursing in from the ends hunts for the tail at every level and pays a frame for each, which at fifty thousand nodes is a stack overflow rather than a slow answer. Walking from the head to reach each position drops the stack and keeps the hunting, so it stays quadratic. Copying the values out gives every position in one step, then writes the answer back into nodes that never moved — which reorders what the list PRINTS, not what it is. Holding the nodes and consuming them from both ends genuinely relinks, at the price of a second copy of a list that can already do this for itself. The answer is composition: find the middle with the fast and slow pair, reverse the back half in place, weave the two halves together. Three earlier problems used as subroutines, which is why middle-of-list and reverse-list are the two to know cold. On an odd length the middle node belongs to the FRONT half, and the weave then ends by itself when the reversed half runs out.",
  approach:
    "Find the middle with a slow and a fast runner, stopping so the front half keeps the middle node on an odd length. Cut there, reverse the second half in place, then weave: take one node from the front, one from the reversed back, relinking as you go. The weave ends naturally when the reversed half runs out, which is exactly when the odd middle has nothing left to pair with.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def reorder_list(head):
    if head is None or head.next is None:
        return head
    slow = head
    fast = head
    # guard on fast.next.next so an odd length leaves slow on the middle
    while fast.next is not None and fast.next.next is not None:
        slow = slow.next
        fast = fast.next.next
    second = slow.next
    slow.next = None
    prev = None
    while second is not None:
        nxt = second.next
        second.next = prev
        prev = second
        second = nxt
    first = head
    second = prev
    while second is not None:
        n1 = first.next
        n2 = second.next
        first.next = second
        second.next = n1
        first = n1
        second = n2
    return head`,
  java: `public ListNode reorderList(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode slow = head;
    ListNode fast = head;
    while (fast.next != null && fast.next.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    ListNode second = slow.next;
    slow.next = null;
    ListNode prev = null;
    while (second != null) {
        ListNode nxt = second.next;
        second.next = prev;
        prev = second;
        second = nxt;
    }
    ListNode first = head;
    second = prev;
    while (second != null) {
        ListNode n1 = first.next;
        ListNode n2 = second.next;
        first.next = second;
        second.next = n1;
        first = n1;
        second = n2;
    }
    return head;
}`,
  cpp: `ListNode* reorderList(ListNode* head) {
    if (!head || !head->next) return head;
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast->next && fast->next->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    ListNode* second = slow->next;
    slow->next = nullptr;
    ListNode* prev = nullptr;
    while (second) {
        ListNode* nxt = second->next;
        second->next = prev;
        prev = second;
        second = nxt;
    }
    ListNode* first = head;
    second = prev;
    while (second) {
        ListNode* n1 = first->next;
        ListNode* n2 = second->next;
        first->next = second;
        second->next = n1;
        first = n1;
        second = n2;
    }
    return head;
}`,
  alternatives: [
    {
      name: "Recursive fold from the ends",
      summary:
        "Find the tail, splice it in behind the head, recurse on what is left inside. It is the problem statement turned straight into code, and it pays for that twice: a walk to the tail per level, and a frame per level.",
      complexity: { time: "O(n^2)", space: "O(n) stack" },
      python: `def reorder_list(head):
    if head is None or head.next is None or head.next.next is None:
        return head
    prev = head
    tail = head.next
    while tail.next is not None:
        prev = tail
        tail = tail.next
    prev.next = None
    tail.next = head.next
    head.next = tail
    reorder_list(tail.next)
    return head`,
      java: `public ListNode reorderList(ListNode head) {
    if (head == null || head.next == null || head.next.next == null) return head;
    ListNode prev = head;
    ListNode tail = head.next;
    while (tail.next != null) { prev = tail; tail = tail.next; }
    prev.next = null;
    tail.next = head.next;
    head.next = tail;
    reorderList(tail.next);
    return head;
}`,
      cpp: `ListNode* reorderList(ListNode* head) {
    if (!head || !head->next || !head->next->next) return head;
    ListNode* prev = head;
    ListNode* tail = head->next;
    while (tail->next) { prev = tail; tail = tail->next; }
    prev->next = nullptr;
    tail->next = head->next;
    head->next = tail;
    reorderList(tail->next);
    return head;
}`,
    },
    {
      name: "Walk from the head for every position",
      whyNow:
        "The recursion opens a frame for every pair, and at 5 * 10^4 nodes that is 25 000 frames deep — a stack overflow, not a slow answer. The same tail hunting fits in a loop with no stack at all.",
      summary:
        "Read the values off by index, alternating front and back, then write the sequence back into the nodes. No stack — and it still walks the list from the head to reach every single position.",
      complexity: { time: "O(n^2)", space: "O(1)" },
      python: `def reorder_list(head):
    n = 0
    node = head
    while node is not None:
        n += 1
        node = node.next
    if n < 3:
        return head
    out = []
    lo = 0
    hi = n - 1
    while lo <= hi:
        node = head
        for _ in range(lo):
            node = node.next
        out.append(node.val)
        if lo != hi:
            node = head
            for _ in range(hi):
                node = node.next
            out.append(node.val)
        lo += 1
        hi -= 1
    node = head
    for v in out:
        node.val = v
        node = node.next
    return head`,
      java: `public ListNode reorderList(ListNode head) {
    int n = 0;
    ListNode node = head;
    while (node != null) { n++; node = node.next; }
    if (n < 3) return head;
    ArrayList<Integer> out = new ArrayList<>();
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        node = head;
        for (int i = 0; i < lo; i++) node = node.next;
        out.add(node.val);
        if (lo != hi) {
            node = head;
            for (int i = 0; i < hi; i++) node = node.next;
            out.add(node.val);
        }
        lo++;
        hi--;
    }
    node = head;
    for (int v : out) { node.val = v; node = node.next; }
    return head;
}`,
      cpp: `ListNode* reorderList(ListNode* head) {
    int n = 0;
    ListNode* node = head;
    while (node) { n++; node = node->next; }
    if (n < 3) return head;
    vector<int> out;
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        node = head;
        for (int i = 0; i < lo; i++) node = node->next;
        out.push_back(node->val);
        if (lo != hi) {
            node = head;
            for (int i = 0; i < hi; i++) node = node->next;
            out.push_back(node->val);
        }
        lo++;
        hi--;
    }
    node = head;
    for (int v : out) { node->val = v; node = node->next; }
    return head;
}`,
    },
    {
      name: "Copy the values, write them back",
      whyNow:
        "Walking from the head to reach position i costs i steps, so the scan alone is n^2/2. One array gives every position in one step, and one pass fills it.",
      summary:
        "One pass to collect the values, one pass to write them back in folded order. Finally linear — at the cost of a second copy of the list, and of a solution that never moves a node.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def reorder_list(head):
    vals = []
    node = head
    while node is not None:
        vals.append(node.val)
        node = node.next
    node = head
    lo = 0
    hi = len(vals) - 1
    while lo <= hi:
        node.val = vals[lo]
        node = node.next
        if lo != hi:
            node.val = vals[hi]
            node = node.next
        lo += 1
        hi -= 1
    return head`,
      java: `public ListNode reorderList(ListNode head) {
    ArrayList<Integer> vals = new ArrayList<>();
    ListNode node = head;
    while (node != null) { vals.add(node.val); node = node.next; }
    node = head;
    int lo = 0, hi = vals.size() - 1;
    while (lo <= hi) {
        node.val = vals.get(lo);
        node = node.next;
        if (lo != hi) {
            node.val = vals.get(hi);
            node = node.next;
        }
        lo++;
        hi--;
    }
    return head;
}`,
      cpp: `ListNode* reorderList(ListNode* head) {
    vector<int> vals;
    ListNode* node = head;
    while (node) { vals.push_back(node->val); node = node->next; }
    node = head;
    int lo = 0, hi = (int) vals.size() - 1;
    while (lo <= hi) {
        node->val = vals[lo];
        node = node->next;
        if (lo != hi) {
            node->val = vals[hi];
            node = node->next;
        }
        lo++;
        hi--;
    }
    return head;
}`,
    },
    {
      name: "Nodes from both ends",
      whyNow:
        "Rewriting the values reorders what the list PRINTS, not what it is: every node stays where it was. Holding the nodes and consuming them from both ends actually relinks them.",
      summary:
        "Collect the nodes, then chain them by taking alternately from the front and the back of that collection. A two-ended queue over the real nodes — still O(n) memory to reach a back the list could reach itself.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def reorder_list(head):
    nodes = []
    node = head
    while node is not None:
        nodes.append(node)
        node = node.next
    if not nodes:
        return None
    lo = 0
    hi = len(nodes) - 1
    tail = None
    while lo <= hi:
        tail = nodes[lo]
        lo += 1
        if lo <= hi:
            tail.next = nodes[hi]
            tail = nodes[hi]
            hi -= 1
            if lo <= hi:
                tail.next = nodes[lo]
    tail.next = None
    return nodes[0]`,
      java: `public ListNode reorderList(ListNode head) {
    ArrayList<ListNode> nodes = new ArrayList<>();
    ListNode node = head;
    while (node != null) { nodes.add(node); node = node.next; }
    if (nodes.isEmpty()) return null;
    int lo = 0, hi = nodes.size() - 1;
    ListNode tail = null;
    while (lo <= hi) {
        tail = nodes.get(lo);
        lo++;
        if (lo <= hi) {
            tail.next = nodes.get(hi);
            tail = nodes.get(hi);
            hi--;
            if (lo <= hi) tail.next = nodes.get(lo);
        }
    }
    tail.next = null;
    return nodes.get(0);
}`,
      cpp: `ListNode* reorderList(ListNode* head) {
    vector<ListNode*> nodes;
    ListNode* node = head;
    while (node) { nodes.push_back(node); node = node->next; }
    if (nodes.empty()) return nullptr;
    int lo = 0, hi = (int) nodes.size() - 1;
    ListNode* tail = nullptr;
    while (lo <= hi) {
        tail = nodes[lo];
        lo++;
        if (lo <= hi) {
            tail->next = nodes[hi];
            tail = nodes[hi];
            hi--;
            if (lo <= hi) tail->next = nodes[lo];
        }
    }
    tail->next = nullptr;
    return nodes[0];
}`,
    },
  ],
}
