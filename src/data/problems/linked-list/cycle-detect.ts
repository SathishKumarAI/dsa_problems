import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "cycle-detect",
  title: "Detect a Cycle",
  pattern: "linked-list",
  difficulty: "easy",
  leetcode: "linked-list-cycle",
  brief: "Does the list loop back on itself?",
  statement:
    "Given the head of a linked list, return true if following next-pointers ever revisits a node (a cycle), false if the walk reaches the end.",
  constraints: [
    "0 <= list length <= 10^4",
    "-10^5 <= node value <= 10^5",
    "the cycle, if any, is entered from some node's next pointer",
    "O(1) extra space is the point — a visited set solves it and misses the lesson",
  ],
  examples: [
    { input: "1 → 2 → 3 → (back to 2)", output: "true" },
    { input: "1 → 2 → ∅", output: "false" },
  ],
  hints: [
    "A hash set of visited nodes works but costs O(n) memory.",
    "Two runners on a circular track: the faster one always laps the slower one.",
    "Advance slow by 1 and fast by 2. Cycle ⇔ they meet; no cycle ⇔ fast hits None.",
  ],
  whyNow:
    "The set is linear time but linear memory, on a problem whose whole point is constant space. Two pointers moving at different speeds must meet inside a cycle, and they remember nothing.",
  arc: "Both rungs answer one question — has this walk been here before — and they differ only in what they are willing to store. The visited set remembers every node, which is honest, linear and the baseline to say out loud first, but it spends memory proportional to the list to detect a property of the list's shape. Floyd's pair stores nothing at all: run one pointer one node a step and another two, and once both are inside a loop the fast one gains exactly one node on the slow one every step, so the gap shrinks to zero and they must collide rather than leap past each other. That sentence is the bit to be able to say under pressure — it is why the meeting is guaranteed rather than likely. Know the set as the baseline and the tortoise and hare cold: the same two-speed pair finds the middle of a list, drives the palindrome check, and detects the repeat in find-the-duplicate, where an array of indices is a linked list in disguise.",
  approach:
    "Floyd's tortoise and hare. Slow moves one node per step, fast moves two. If there is no cycle, fast reaches the end. If there is one, both eventually enter it, and the gap between them shrinks by exactly one node per step (fast gains 1 on slow inside the loop), so they must collide rather than skip past each other.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def has_cycle(head) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
  java: `public boolean hasCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`,
  cpp: `bool hasCycle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
  // B79. `docs/deep/cycle-detect_explained.md` teaches four approaches; this
  // file held one, so the problem page could offer two rungs where the reading
  // offered four. The two missing ones were disclosed additions — the document
  // says so in its headings — but a disclosed addition is still an approach the
  // page cannot name, rank or compare. They are records now, in the document's
  // own order, keyed so `lib/ladder.ts` can tell `set` the act from `set` the
  // alternative. The prose did not move; only the record is new.
  alternatives: [
    {
      key: "brute",
      name: "Nested walk",
      summary:
        "If you may not store where you have been, look it up again instead: on reaching the node at position i, walk a second pointer from the head through positions 0 … i-1 and ask whether any of them IS that node. It trades memory for recomputation, which is the same trade the optimal answer makes — only that one pays with a single extra pointer instead of a full prefix re-walk per node. Keep it as the oracle you check a clever implementation against when you do not yet trust anything else.",
      complexity: { time: "O(n²)", space: "O(1)" },
      python: `def has_cycle(head) -> bool:
    node, index = head, 0
    while node is not None:
        probe = head
        for _ in range(index):
            if probe is node:
                return True
            probe = probe.next
        node = node.next
        index += 1
    return False`,
      java: `public boolean hasCycle(ListNode head) {
    ListNode node = head;
    int index = 0;
    while (node != null) {
        ListNode probe = head;
        for (int i = 0; i < index; i++) {
            if (probe == node) return true;
            probe = probe.next;
        }
        node = node.next;
        index++;
    }
    return false;
}`,
      cpp: `bool hasCycle(const ListNode* head) {
    const ListNode* node = head;
    int index = 0;
    while (node != nullptr) {
        const ListNode* probe = head;
        for (int i = 0; i < index; i++) {
            if (probe == node) return true;
            probe = probe->next;
        }
        node = node->next;
        index++;
    }
    return false;
}`,
    },
    {
      key: "set",
      whyNow:
        "The nested walk answers \"have I been here?\" by re-deriving it from scratch at every node, re-walking the whole prefix each time — a quadratic number of comparisons to test a property one pass could test, if the pass were allowed to remember anything at all.",
      name: "Visited set",
      summary:
        "Walk the list putting every node OBJECT into a set, not its value, because duplicate values are legal and would report a cycle that is not there. The first node already in the set is where the cycle closes, so this even names the entry node for free. Its one sin is the O(n) memory, which is the whole reason the pointer trick exists.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def has_cycle(head) -> bool:
    seen = set()
    while head:
        if id(head) in seen:
            return True
        seen.add(id(head))
        head = head.next
    return False`,
      java: `public boolean hasCycle(ListNode head) {
    Set<ListNode> seen = new HashSet<>();
    while (head != null) {
        if (!seen.add(head)) return true;
        head = head.next;
    }
    return false;
}`,
      cpp: `bool hasCycle(const ListNode* head) {
    unordered_set<const ListNode*> seen;
    const ListNode* curr = head;
    while (curr != nullptr) {
        if (!seen.insert(curr).second) return true;
        curr = curr->next;
    }
    return false;
}`,
    },
    {
      key: "mark",
      name: "Value-marking",
      whyNow:
        "Floyd is already optimal on both bounds, so there is no complexity left to win — only the constant. It walks the list twice over, dereferencing up to 3n pointers to avoid writing anything down, and the one storage still going spare is the list itself.",
      summary:
        "Stamp each node on the way out with 100001 — a value the stated range makes impossible, so only a node WE stamped can hold it — and arriving at a stamped node means you have been there. One visit per node instead of Floyd's up-to-two, at the price of destroying every value in the list. It needs both halves of an assumption: the value range is bounded, and the nodes are yours to mutate. If either half fails this is not merely suboptimal, it is wrong, and a function called hasCycle that silently erases its input is the kind of thing that passes review and then corrupts data.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def has_cycle(head) -> bool:
    MARK = 100_001  # outside -10**5 .. 10**5, so no real node holds it
    node = head
    while node is not None:
        if node.val == MARK:
            return True
        node.val = MARK  # destructive: the original value is gone
        node = node.next
    return False`,
      java: `public boolean hasCycle(ListNode head) {
    final int MARK = 100001;
    ListNode node = head;
    while (node != null) {
        if (node.val == MARK) return true;
        node.val = MARK;
        node = node.next;
    }
    return false;
}`,
      cpp: `bool hasCycle(ListNode* head) {
    const int MARK = 100001;
    ListNode* node = head;
    while (node != nullptr) {
        if (node->val == MARK) return true;
        node->val = MARK;
        node = node->next;
    }
    return false;
}`,
    },
  ],
}
