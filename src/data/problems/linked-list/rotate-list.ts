import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "rotate-list",
  title: "Rotate the List to the Right by k",
  pattern: "linked-list",
  difficulty: "medium",
  leetcode: "rotate-list",
  brief: "Move the last k nodes to the front, in one cut.",
  statement:
    "Given the head of a linked list and a number k, move each node k places to the right — the last k nodes become the front — and return the new head.",
  constraints: [
    "0 <= nodes <= 500, values in -100..100",
    "0 <= k <= 2 * 10^9, so k is routinely far larger than the list; the real rotation is k % n, and you cannot compute that before you know n",
    "n rotations put the list back where it started, which is why the modulus is the whole trick and not a micro-optimisation",
    "n = 0 has no modulus to take at all — dividing by zero is the corner case, not an empty answer",
    "k % n == 0 (including k = 0) must return the list unchanged, cut or no cut",
  ],
  examples: [
    { input: "head = [1,2,3,4,5], k = 2", output: "[4,5,1,2,3]" },
    {
      input: "head = [0,1,2], k = 4",
      output: "[2,0,1]",
      note: "k is bigger than the list. 4 % 3 = 1, so this is ONE rotation, not four — and rotating one step at a time four times would give the same answer only by accident of how small k is here.",
    },
    {
      input: "head = [], k = 5",
      output: "[]",
      note: "No nodes means no length to take a modulus against. Guard the empty list before you divide.",
    },
  ],
  hints: [
    "Rotating by n changes nothing, so only k % n matters — and finding n costs one walk you were going to make anyway.",
    "The answer is the original list cut in exactly one place: the new head is the node n − k % n steps from the front.",
    "If you join the tail to the head first, the list becomes a ring and the whole problem is deciding where to cut it.",
  ],
  whyNow:
    "Cutting first means hunting for the OLD tail afterwards to reattach the front — a third walk down the list. Joining the tail to the head before you cut does that attachment in one assignment, and cutting exactly where you joined makes k % n == 0 fall out correctly with no special case.",
  arc: "Rotating right by k moves nothing at all when k is n: the list comes back identical, so the real work is k % n and the real edit is a single cut. Doing it one node at a time reads the definition literally and repeats work that cancels out — k runs to two billion against five hundred nodes. The array rebuild is linear and hands you n, which is what makes the modulus available in the first place, but it discards every original node to produce a list holding the same values. Three reversals allocate nothing and touch every node three times, with three chances at an off-by-one. Measuring and then walking to the cut is two pointer writes of real work, hidden behind a third walk to re-find a tail the counting pass already stood on. Closing the list into a ring before cutting is the version to keep: one walk gives both n and the tail, one assignment joins them, and cutting n − k % n steps along means a rotation of zero cuts the link it just made, so it needs no special case. The empty list still does — there is no modulus to take.",
  approach:
    "Walk once to the tail, counting as you go, which gives both n and the tail pointer. Close the list into a ring by pointing the tail at the head. The new head is n − k % n steps along, so step to the node just before it, cut there, and return what follows. Because the join happened before the cut, a rotation of zero cuts at the same link it just made and the list comes out untouched.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def rotate_right(head, k):
    if head is None:
        return None
    n = 1
    tail = head
    while tail.next is not None:
        n += 1
        tail = tail.next
    # close the ring FIRST, then decide where to cut it
    tail.next = head
    steps = n - k % n
    new_tail = head
    for _ in range(steps - 1):
        new_tail = new_tail.next
    new_head = new_tail.next
    new_tail.next = None
    return new_head`,
  java: `public ListNode rotateRight(ListNode head, int k) {
    if (head == null) return null;
    int n = 1;
    ListNode tail = head;
    while (tail.next != null) { n++; tail = tail.next; }
    tail.next = head;
    int steps = n - k % n;
    ListNode newTail = head;
    for (int i = 0; i < steps - 1; i++) newTail = newTail.next;
    ListNode newHead = newTail.next;
    newTail.next = null;
    return newHead;
}`,
  cpp: `ListNode* rotateRight(ListNode* head, int k) {
    if (!head) return nullptr;
    int n = 1;
    ListNode* tail = head;
    while (tail->next) { n++; tail = tail->next; }
    tail->next = head;
    int steps = n - k % n;
    ListNode* newTail = head;
    for (int i = 0; i < steps - 1; i++) newTail = newTail->next;
    ListNode* newHead = newTail->next;
    newTail->next = nullptr;
    return newHead;
}`,
  alternatives: [
    {
      name: "Rotate by one, k times",
      summary:
        "Move the last node to the front, k times over. It is the definition read literally, and with k up to 2 * 10^9 against a 500-node list it repeats the same 500 rotations four million times.",
      complexity: { time: "O(n * k)", space: "O(1)" },
      python: `def rotate_right(head, k):
    for _ in range(k):
        if head is None or head.next is None:
            return head
        prev = head
        tail = head.next
        while tail.next is not None:
            prev = tail
            tail = tail.next
        prev.next = None
        tail.next = head
        head = tail
    return head`,
      java: `public ListNode rotateRight(ListNode head, int k) {
    for (int i = 0; i < k; i++) {
        if (head == null || head.next == null) return head;
        ListNode prev = head;
        ListNode tail = head.next;
        while (tail.next != null) { prev = tail; tail = tail.next; }
        prev.next = null;
        tail.next = head;
        head = tail;
    }
    return head;
}`,
      cpp: `ListNode* rotateRight(ListNode* head, int k) {
    for (int i = 0; i < k; i++) {
        if (!head || !head->next) return head;
        ListNode* prev = head;
        ListNode* tail = head->next;
        while (tail->next) { prev = tail; tail = tail->next; }
        prev->next = nullptr;
        tail->next = head;
        head = tail;
    }
    return head;
}`,
    },
    {
      name: "Values into an array, rebuild rotated",
      whyNow:
        "Rotating one step at a time redoes work that cancels out: after n rotations the list is identical. Reading the values into an array gives you the length, and the length is what turns k into k % n.",
      summary:
        "Copy the values out, slice them at the rotation point, build a new list. Linear and easy to check by eye — and it discards every original node to produce a list with the same values in it.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def rotate_right(head, k):
    vals = []
    node = head
    while node is not None:
        vals.append(node.val)
        node = node.next
    if not vals:
        return None
    k %= len(vals)
    # write the guard out: vals[-0:] is the WHOLE list, not the empty one
    rotated = vals[-k:] + vals[:-k] if k else vals
    new_head = None
    for v in reversed(rotated):
        new_head = ListNode(v, new_head)
    return new_head`,
      java: `public ListNode rotateRight(ListNode head, int k) {
    ArrayList<Integer> vals = new ArrayList<>();
    ListNode node = head;
    while (node != null) { vals.add(node.val); node = node.next; }
    int n = vals.size();
    if (n == 0) return null;
    int shift = k % n;
    ListNode newHead = null;
    for (int i = n - 1; i >= 0; i--) {
        int from = (i - shift + n) % n;
        newHead = new ListNode(vals.get(from), newHead);
    }
    return newHead;
}`,
      cpp: `ListNode* rotateRight(ListNode* head, int k) {
    vector<int> vals;
    ListNode* node = head;
    while (node) { vals.push_back(node->val); node = node->next; }
    int n = (int) vals.size();
    if (n == 0) return nullptr;
    int shift = k % n;
    ListNode* newHead = nullptr;
    for (int i = n - 1; i >= 0; i--) {
        int from = (i - shift + n) % n;
        newHead = new ListNode(vals[from], newHead);
    }
    return newHead;
}`,
    },
    {
      name: "Reverse three times",
      whyNow:
        "The array is a second copy of the whole list for a job that only moves pointers. Rotation is the same identity that rotates an array: reverse everything, then reverse each of the two pieces.",
      summary:
        "Reverse the list, reverse its first k nodes, reverse the rest. No allocation at all — and every node is touched three times, with three off-by-one opportunities.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def rotate_right(head, k):
    n = 0
    node = head
    while node is not None:
        n += 1
        node = node.next
    if n < 2:
        return head
    k %= n
    if k == 0:
        return head
    prev = None
    node = head
    while node is not None:
        nxt = node.next
        node.next = prev
        prev = node
        node = nxt
    head = prev
    prev = None
    node = head
    for _ in range(k):
        nxt = node.next
        node.next = prev
        prev = node
        node = nxt
    front_head = prev
    front_tail = head
    prev = None
    while node is not None:
        nxt = node.next
        node.next = prev
        prev = node
        node = nxt
    front_tail.next = prev
    return front_head`,
      java: `public ListNode rotateRight(ListNode head, int k) {
    int n = 0;
    ListNode node = head;
    while (node != null) { n++; node = node.next; }
    if (n < 2) return head;
    k %= n;
    if (k == 0) return head;
    ListNode prev = null;
    node = head;
    while (node != null) {
        ListNode nxt = node.next;
        node.next = prev;
        prev = node;
        node = nxt;
    }
    head = prev;
    prev = null;
    node = head;
    for (int i = 0; i < k; i++) {
        ListNode nxt = node.next;
        node.next = prev;
        prev = node;
        node = nxt;
    }
    ListNode frontHead = prev;
    ListNode frontTail = head;
    prev = null;
    while (node != null) {
        ListNode nxt = node.next;
        node.next = prev;
        prev = node;
        node = nxt;
    }
    frontTail.next = prev;
    return frontHead;
}`,
      cpp: `ListNode* rotateRight(ListNode* head, int k) {
    int n = 0;
    ListNode* node = head;
    while (node) { n++; node = node->next; }
    if (n < 2) return head;
    k %= n;
    if (k == 0) return head;
    ListNode* prev = nullptr;
    node = head;
    while (node) {
        ListNode* nxt = node->next;
        node->next = prev;
        prev = node;
        node = nxt;
    }
    head = prev;
    prev = nullptr;
    node = head;
    for (int i = 0; i < k; i++) {
        ListNode* nxt = node->next;
        node->next = prev;
        prev = node;
        node = nxt;
    }
    ListNode* frontHead = prev;
    ListNode* frontTail = head;
    prev = nullptr;
    while (node) {
        ListNode* nxt = node->next;
        node->next = prev;
        prev = node;
        node = nxt;
    }
    frontTail->next = prev;
    return frontHead;
}`,
    },
    {
      name: "Measure, then walk to the cut",
      whyNow:
        "Three full reversals touch every node three times and give you three chances to lose the list. Once n is known the rotation is a single cut: one link to break and one to make.",
      summary:
        "Count the nodes, step to the node before the cut, split there, then walk the back piece to its end and attach the front. Two pointer writes of real work — behind a third walk to re-find a tail the first walk already visited.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def rotate_right(head, k):
    if head is None:
        return None
    n = 0
    node = head
    while node is not None:
        n += 1
        node = node.next
    k %= n
    if k == 0:
        return head
    new_tail = head
    for _ in range(n - k - 1):
        new_tail = new_tail.next
    new_head = new_tail.next
    new_tail.next = None
    old_tail = new_head
    while old_tail.next is not None:
        old_tail = old_tail.next
    old_tail.next = head
    return new_head`,
      java: `public ListNode rotateRight(ListNode head, int k) {
    if (head == null) return null;
    int n = 0;
    ListNode node = head;
    while (node != null) { n++; node = node.next; }
    k %= n;
    if (k == 0) return head;
    ListNode newTail = head;
    for (int i = 0; i < n - k - 1; i++) newTail = newTail.next;
    ListNode newHead = newTail.next;
    newTail.next = null;
    ListNode oldTail = newHead;
    while (oldTail.next != null) oldTail = oldTail.next;
    oldTail.next = head;
    return newHead;
}`,
      cpp: `ListNode* rotateRight(ListNode* head, int k) {
    if (!head) return nullptr;
    int n = 0;
    ListNode* node = head;
    while (node) { n++; node = node->next; }
    k %= n;
    if (k == 0) return head;
    ListNode* newTail = head;
    for (int i = 0; i < n - k - 1; i++) newTail = newTail->next;
    ListNode* newHead = newTail->next;
    newTail->next = nullptr;
    ListNode* oldTail = newHead;
    while (oldTail->next) oldTail = oldTail->next;
    oldTail->next = head;
    return newHead;
}`,
    },
  ],
}
