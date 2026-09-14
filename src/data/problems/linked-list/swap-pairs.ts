import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "swap-pairs",
  title: "Swap Every Adjacent Pair",
  pattern: "linked-list",
  difficulty: "medium",
  leetcode: "swap-nodes-in-pairs",
  brief: "Exchange nodes two at a time by relinking, not by copying values.",
  statement:
    "Given the head of a linked list, swap every two adjacent nodes and return the new head. The nodes themselves must move — you may not solve it by copying values between them.",
  constraints: [
    "0 <= nodes <= 100, values in 0..100",
    "the swap has to be done by relinking; rewriting the values is a different answer that happens to print the same for ints",
    "an ODD number of nodes leaves the last one exactly where it is, with nothing to swap it with",
    "0 and 1 nodes return unchanged, which is why the loop guard tests both the node and the node after it",
    "the first pair changes the head, so whatever you return is not the head you were given (unless there is no pair at all)",
  ],
  examples: [
    { input: "head = [1,2,3,4]", output: "[2,1,4,3]" },
    {
      input: "head = [1,2,3]",
      output: "[2,1,3]",
      note: "Odd length: 3 has no partner and stays put. A loop that only tests curr, not curr.next, walks off the end here.",
    },
    { input: "head = []", output: "[]" },
  ],
  hints: [
    "A swap needs three links rewritten, not two: the node before the pair also has to be told about the new order.",
    "Write down the two nodes and what follows them before you touch anything — the first assignment destroys the pointer you need next.",
    "The first pair has no node before it. Put a fake one there and every pair looks the same.",
  ],
  whyNow:
    "The loop still has to remember the new head before it starts, and skip the relink on the first pair because there is nothing behind it. A dummy in front of the head turns the first pair into an ordinary pair, and its next is the answer at the end.",
  arc: "The requirement is that the NODES move, and the bottom rung is the one that fails it: exchanging payloads is two lines, leaves every node where it was, and is wrong the moment a node carries more than an int or anything outside holds a pointer into the list. Everything above it really relinks, and the rungs differ only in how they get hold of the node after the pair. The array buys a second copy of the list to see one node ahead, which the pair already points at. Recursion asks the tail to swap itself and costs a frame per pair. A prev pointer does the same three assignments in a loop, but with nothing in front of the head it must remember the answer before it starts and skip the relink on the first pair — two branches that exist only because the head has no predecessor. A dummy node supplies one, and then every pair is an ordinary pair and dummy.next is the new head for free. That is the piece to take away: the same dummy turns remove-nth-from-end, remove-list-elements and merge-two-sorted into single-branch loops, and a guard testing both the node and its successor is what leaves an odd tail alone.",
  approach:
    "Put a dummy in front of the head and keep a prev pointer on the node before the pair being swapped. While there are two nodes ahead of prev, grab first and second, hang second.next onto first, put first behind second, and point prev at second. Then prev moves onto first, which is now the back of the swapped pair. Return dummy.next, which absorbs both the head change and the empty-list case.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def swap_pairs(head):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next is not None and prev.next.next is not None:
        first = prev.next
        second = first.next
        first.next = second.next
        second.next = first
        prev.next = second
        # first is now the BACK of the pair, so it is the next prev
        prev = first
    return dummy.next`,
  java: `public ListNode swapPairs(ListNode head) {
    ListNode dummy = new ListNode(0, head);
    ListNode prev = dummy;
    while (prev.next != null && prev.next.next != null) {
        ListNode first = prev.next;
        ListNode second = first.next;
        first.next = second.next;
        second.next = first;
        prev.next = second;
        prev = first;
    }
    return dummy.next;
}`,
  cpp: `ListNode* swapPairs(ListNode* head) {
    ListNode* dummy = new ListNode(0, head);
    ListNode* prev = dummy;
    while (prev->next && prev->next->next) {
        ListNode* first = prev->next;
        ListNode* second = first->next;
        first->next = second->next;
        second->next = first;
        prev->next = second;
        prev = first;
    }
    return dummy->next;
}`,
  alternatives: [
    {
      name: "Swap the values",
      summary:
        "Walk in twos and exchange the payloads. Two lines and constant space — and it is not the answer to this problem: no node moved, so anything else pointing into the list still sees the old order.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def swap_pairs(head):
    node = head
    while node is not None and node.next is not None:
        node.val, node.next.val = node.next.val, node.val
        node = node.next.next
    return head`,
      java: `public ListNode swapPairs(ListNode head) {
    ListNode node = head;
    while (node != null && node.next != null) {
        int t = node.val;
        node.val = node.next.val;
        node.next.val = t;
        node = node.next.next;
    }
    return head;
}`,
      cpp: `ListNode* swapPairs(ListNode* head) {
    ListNode* node = head;
    while (node && node->next) {
        int t = node->val;
        node->val = node->next->val;
        node->next->val = t;
        node = node->next->next;
    }
    return head;
}`,
    },
    {
      name: "Array of nodes, then relink",
      whyNow:
        "Swapping payloads leaves every node exactly where it was, which fails the moment a node carries more than an int or somebody else holds a pointer to it. Moving the nodes themselves is the actual requirement.",
      summary:
        "Collect the nodes, swap them pairwise in the array, then rewrite every next from the new order. Genuinely relinks — using a second copy of the list to look one node ahead, which the list itself does in one step.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def swap_pairs(head):
    nodes = []
    while head is not None:
        nodes.append(head)
        head = head.next
    for i in range(0, len(nodes) - 1, 2):
        nodes[i], nodes[i + 1] = nodes[i + 1], nodes[i]
    for i in range(len(nodes)):
        nodes[i].next = nodes[i + 1] if i + 1 < len(nodes) else None
    return nodes[0] if nodes else None`,
      java: `public ListNode swapPairs(ListNode head) {
    ArrayList<ListNode> nodes = new ArrayList<>();
    while (head != null) { nodes.add(head); head = head.next; }
    for (int i = 0; i + 1 < nodes.size(); i += 2) {
        ListNode t = nodes.get(i);
        nodes.set(i, nodes.get(i + 1));
        nodes.set(i + 1, t);
    }
    for (int i = 0; i < nodes.size(); i++)
        nodes.get(i).next = (i + 1 < nodes.size()) ? nodes.get(i + 1) : null;
    return nodes.isEmpty() ? null : nodes.get(0);
}`,
      cpp: `ListNode* swapPairs(ListNode* head) {
    vector<ListNode*> nodes;
    while (head) { nodes.push_back(head); head = head->next; }
    for (int i = 0; i + 1 < (int) nodes.size(); i += 2) {
        ListNode* t = nodes[i];
        nodes[i] = nodes[i + 1];
        nodes[i + 1] = t;
    }
    for (int i = 0; i < (int) nodes.size(); i++)
        nodes[i]->next = (i + 1 < (int) nodes.size()) ? nodes[i + 1] : nullptr;
    return nodes.empty() ? nullptr : nodes[0];
}`,
    },
    {
      name: "Recursive",
      whyNow:
        "The array exists only so the code can name the node after the pair, and the pair already points at it. Recursion asks the tail to swap itself and hangs the answer off the pair it is holding.",
      summary:
        "Swap the first two, then let the recursion own everything after them. The clearest statement of the idea, at one stack frame per pair.",
      complexity: { time: "O(n)", space: "O(n) stack" },
      python: `def swap_pairs(head):
    if head is None or head.next is None:
        return head
    second = head.next
    head.next = swap_pairs(second.next)
    second.next = head
    return second`,
      java: `public ListNode swapPairs(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode second = head.next;
    head.next = swapPairs(second.next);
    second.next = head;
    return second;
}`,
      cpp: `ListNode* swapPairs(ListNode* head) {
    if (!head || !head->next) return head;
    ListNode* second = head->next;
    head->next = swapPairs(second->next);
    second->next = head;
    return second;
}`,
    },
    {
      name: "Prev pointer, head special-cased",
      whyNow:
        "Recursion opens a frame per pair for rewiring that is three assignments deep. A loop carrying a prev pointer does the same work with no stack.",
      summary:
        "Remember head.next as the answer up front, then loop with a prev pointer, skipping the relink on the very first pair. Constant space — and two branches that exist only because the head has nothing in front of it.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def swap_pairs(head):
    if head is None or head.next is None:
        return head
    new_head = head.next
    prev = None
    node = head
    while node is not None and node.next is not None:
        second = node.next
        node.next = second.next
        second.next = node
        if prev is not None:
            prev.next = second
        prev = node
        node = node.next
    return new_head`,
      java: `public ListNode swapPairs(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode newHead = head.next;
    ListNode prev = null;
    ListNode node = head;
    while (node != null && node.next != null) {
        ListNode second = node.next;
        node.next = second.next;
        second.next = node;
        if (prev != null) prev.next = second;
        prev = node;
        node = node.next;
    }
    return newHead;
}`,
      cpp: `ListNode* swapPairs(ListNode* head) {
    if (!head || !head->next) return head;
    ListNode* newHead = head->next;
    ListNode* prev = nullptr;
    ListNode* node = head;
    while (node && node->next) {
        ListNode* second = node->next;
        node->next = second->next;
        second->next = node;
        if (prev) prev->next = second;
        prev = node;
        node = node->next;
    }
    return newHead;
}`,
    },
  ],
}
