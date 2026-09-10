import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "odd-even-list",
  title: "Odd Positions First, Then the Even Ones",
  pattern: "linked-list",
  difficulty: "medium",
  leetcode: "odd-even-linked-list",
  brief: "Regroup a list by index parity, in place, order preserved.",
  statement:
    "Given the head of a singly linked list, regroup it so every node at an odd position comes before every node at an even position, keeping the original order inside each group, and return the head.",
  constraints: [
    "0 <= nodes <= 10^4, values fit in a signed 32-bit int",
    "positions are counted from 1, so the HEAD is odd — parity is about where a node sits, never about its value",
    "relative order inside each group must survive, which rules out any swap-based shuffle",
    "O(n) time and O(1) extra space are part of the problem, not a bonus",
    "lists of 0, 1 or 2 nodes are already grouped, and the two-node case is where a loop that dereferences even.next blows up",
  ],
  examples: [
    { input: "head = [1,2,3,4,5]", output: "[1,3,5,2,4]" },
    { input: "head = [2,1,3,5,6,4,7]", output: "[2,3,6,7,1,5,4]" },
    {
      input: "head = [1,2]",
      output: "[1,2]",
      note: "One even node and nothing after it. The loop must not step past it — the guard is even and even.next, not just even.",
    },
  ],
  hints: [
    "You are building two chains out of one list, and the head of each chain is known before the loop starts.",
    "Odd node 1 is the head, even node 1 is head.next — save that second one, you will need it to join the chains at the end.",
    "Each step hops two nodes: odd.next becomes even.next, then even.next becomes the new odd.next. Stop when the even runner has no node after it.",
  ],
  whyNow:
    "The two dummy nodes exist only to answer is this the first node of its chain? — but the first odd node IS the head and the first even node IS head.next, both known before the loop begins. Two runners weaving through the list allocate nothing at all.",
  approach:
    "Point odd at the head and even at head.next, and remember even as the head of the even chain. Each iteration unhooks two nodes: odd.next jumps over the even node to even.next, then even.next jumps over the new odd node. Stop when even is null or has nothing after it — the odd runner is then the last odd node, and pointing it at the saved even head splices the two chains together.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def odd_even_list(head):
    if head is None or head.next is None:
        return head
    odd = head
    even = head.next
    even_head = even
    # both guards matter: even runs one ahead, so it falls off first
    while even is not None and even.next is not None:
        odd.next = even.next
        odd = odd.next
        even.next = odd.next
        even = even.next
    odd.next = even_head
    return head`,
  java: `public ListNode oddEvenList(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode odd = head;
    ListNode even = head.next;
    ListNode evenHead = even;
    while (even != null && even.next != null) {
        odd.next = even.next;
        odd = odd.next;
        even.next = odd.next;
        even = even.next;
    }
    odd.next = evenHead;
    return head;
}`,
  cpp: `ListNode* oddEvenList(ListNode* head) {
    if (!head || !head->next) return head;
    ListNode* odd = head;
    ListNode* even = head->next;
    ListNode* evenHead = even;
    while (even && even->next) {
        odd->next = even->next;
        odd = odd->next;
        even->next = odd->next;
        even = even->next;
    }
    odd->next = evenHead;
    return head;
}`,
  walkthrough: [
    {
      cells: {
        values: [1, 2, 3, 4, 5],
        marks: { 0: "focus", 1: "compare" },
        labels: { 0: "odd", 1: "even" },
      },
      caption:
        "odd sits on the head, even on head.next. That second node is saved — it is where the even chain will start.",
    },
    {
      cells: {
        values: [1, 3, 5, 2, 4],
        marks: { 0: "done", 1: "focus", 3: "compare" },
        labels: { 1: "odd", 3: "even" },
      },
      caption:
        "First hop: 1.next skips to 3, and 2.next skips to 4. The two chains are now interleaved in pointers, not in position.",
    },
    {
      cells: {
        values: [1, 3, 5, 2, 4],
        marks: { 0: "done", 1: "done", 2: "focus", 4: "compare" },
        labels: { 2: "odd", 4: "even" },
      },
      caption:
        "Second hop lands odd on 5 and even on 4. even.next is null, so the loop stops here.",
    },
    {
      cells: { values: [1, 3, 5, 2, 4], marks: { 2: "focus", 3: "window" } },
      caption:
        "Last odd node is 5; point it at the saved even head 2. The result is [1,3,5,2,4] and not one node was copied.",
    },
  ],
  alternatives: [
    {
      name: "Move the second node to the tail, repeatedly",
      summary:
        "For each even-positioned node, unlink it and append it to the end. Obviously correct, and it re-walks the whole list to find the tail every single time.",
      complexity: { time: "O(n^2)", space: "O(1)" },
      python: `def odd_even_list(head):
    if head is None or head.next is None:
        return head
    n = 0
    node = head
    while node is not None:
        n += 1
        node = node.next
    prev = head
    for _ in range(n // 2):
        victim = prev.next
        prev.next = victim.next
        tail = prev
        while tail.next is not None:
            tail = tail.next
        tail.next = victim
        victim.next = None
        prev = prev.next
    return head`,
      java: `public ListNode oddEvenList(ListNode head) {
    if (head == null || head.next == null) return head;
    int n = 0;
    ListNode node = head;
    while (node != null) { n++; node = node.next; }
    ListNode prev = head;
    for (int i = 0; i < n / 2; i++) {
        ListNode victim = prev.next;
        prev.next = victim.next;
        ListNode tail = prev;
        while (tail.next != null) tail = tail.next;
        tail.next = victim;
        victim.next = null;
        prev = prev.next;
    }
    return head;
}`,
      cpp: `ListNode* oddEvenList(ListNode* head) {
    if (!head || !head->next) return head;
    int n = 0;
    ListNode* node = head;
    while (node) { n++; node = node->next; }
    ListNode* prev = head;
    for (int i = 0; i < n / 2; i++) {
        ListNode* victim = prev->next;
        prev->next = victim->next;
        ListNode* tail = prev;
        while (tail->next) tail = tail->next;
        tail->next = victim;
        victim->next = nullptr;
        prev = prev->next;
    }
    return head;
}`,
    },
    {
      name: "Two value arrays",
      whyNow:
        "The repeated tail hunt walks the whole list once per moved node — a 10^4-node list costs 25 million steps for an answer that needs 10^4. One pass into two buckets is linear.",
      summary:
        "Collect the values by position parity, concatenate, rebuild. Linear at last, but it allocates a whole second list and throws the original nodes away.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def odd_even_list(head):
    odds = []
    evens = []
    i = 0
    node = head
    while node is not None:
        if i % 2 == 0:
            odds.append(node.val)
        else:
            evens.append(node.val)
        node = node.next
        i += 1
    new_head = None
    for v in reversed(odds + evens):
        new_head = ListNode(v, new_head)
    return new_head`,
      java: `public ListNode oddEvenList(ListNode head) {
    ArrayList<Integer> odds = new ArrayList<>();
    ArrayList<Integer> evens = new ArrayList<>();
    int i = 0;
    ListNode node = head;
    while (node != null) {
        if (i % 2 == 0) odds.add(node.val);
        else evens.add(node.val);
        node = node.next;
        i++;
    }
    odds.addAll(evens);
    ListNode newHead = null;
    for (int j = odds.size() - 1; j >= 0; j--) newHead = new ListNode(odds.get(j), newHead);
    return newHead;
}`,
      cpp: `ListNode* oddEvenList(ListNode* head) {
    vector<int> odds;
    vector<int> evens;
    int i = 0;
    ListNode* node = head;
    while (node) {
        if (i % 2 == 0) odds.push_back(node->val);
        else evens.push_back(node->val);
        node = node->next;
        i++;
    }
    for (int v : evens) odds.push_back(v);
    ListNode* newHead = nullptr;
    for (int j = (int) odds.size() - 1; j >= 0; j--) newHead = new ListNode(odds[j], newHead);
    return newHead;
}`,
    },
    {
      name: "Park the even nodes in a list",
      whyNow:
        "Rebuilding from values quietly replaces every node. If a node carried anything besides an int, or anyone else held a pointer to it, that is a data-loss bug. Holding the NODES keeps the originals.",
      summary:
        "Chain the odd nodes as you walk and stash the even nodes in an array, then append them. The real nodes survive — but the array is still O(n) memory for something the list can hold itself.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def odd_even_list(head):
    if head is None:
        return None
    evens = []
    odd = head
    node = head
    i = 0
    while node is not None:
        nxt = node.next
        if i % 2 == 1:
            evens.append(node)
        else:
            odd.next = node
            odd = node
        node = nxt
        i += 1
    for e in evens:
        odd.next = e
        odd = e
    # the first pass leaves head.next pointing at head; this closes the tail
    odd.next = None
    return head`,
      java: `public ListNode oddEvenList(ListNode head) {
    if (head == null) return null;
    ArrayList<ListNode> evens = new ArrayList<>();
    ListNode odd = head;
    ListNode node = head;
    int i = 0;
    while (node != null) {
        ListNode nxt = node.next;
        if (i % 2 == 1) evens.add(node);
        else { odd.next = node; odd = node; }
        node = nxt;
        i++;
    }
    for (ListNode e : evens) { odd.next = e; odd = e; }
    odd.next = null;
    return head;
}`,
      cpp: `ListNode* oddEvenList(ListNode* head) {
    if (!head) return nullptr;
    vector<ListNode*> evens;
    ListNode* odd = head;
    ListNode* node = head;
    int i = 0;
    while (node) {
        ListNode* nxt = node->next;
        if (i % 2 == 1) evens.push_back(node);
        else { odd->next = node; odd = node; }
        node = nxt;
        i++;
    }
    for (ListNode* e : evens) { odd->next = e; odd = e; }
    odd->next = nullptr;
    return head;
}`,
    },
    {
      name: "Two dummy heads, split then join",
      whyNow:
        "Parking the even nodes in an array is O(n) memory to remember an order the nodes can remember themselves — chain them as you meet them and a single tail pointer is enough.",
      summary:
        "Build both chains at once behind two dummy nodes, then hook the odd tail to the even head. Constant space and easy to read; the two dummies are the only thing between it and the optimum.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def odd_even_list(head):
    odd_head = ListNode(0)
    even_head = ListNode(0)
    odd_tail = odd_head
    even_tail = even_head
    node = head
    i = 0
    while node is not None:
        if i % 2 == 0:
            odd_tail.next = node
            odd_tail = node
        else:
            even_tail.next = node
            even_tail = node
        node = node.next
        i += 1
    even_tail.next = None
    odd_tail.next = even_head.next
    return odd_head.next`,
      java: `public ListNode oddEvenList(ListNode head) {
    ListNode oddHead = new ListNode(0);
    ListNode evenHead = new ListNode(0);
    ListNode oddTail = oddHead;
    ListNode evenTail = evenHead;
    ListNode node = head;
    int i = 0;
    while (node != null) {
        if (i % 2 == 0) { oddTail.next = node; oddTail = node; }
        else { evenTail.next = node; evenTail = node; }
        node = node.next;
        i++;
    }
    evenTail.next = null;
    oddTail.next = evenHead.next;
    return oddHead.next;
}`,
      cpp: `ListNode* oddEvenList(ListNode* head) {
    ListNode* oddHead = new ListNode(0);
    ListNode* evenHead = new ListNode(0);
    ListNode* oddTail = oddHead;
    ListNode* evenTail = evenHead;
    ListNode* node = head;
    int i = 0;
    while (node) {
        if (i % 2 == 0) { oddTail->next = node; oddTail = node; }
        else { evenTail->next = node; evenTail = node; }
        node = node->next;
        i++;
    }
    evenTail->next = nullptr;
    oddTail->next = evenHead->next;
    return oddHead->next;
}`,
    },
  ],
}
