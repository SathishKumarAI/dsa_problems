import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "remove-list-elements",
  title: "Delete Every Node Holding a Value",
  pattern: "linked-list",
  difficulty: "easy",
  leetcode: "remove-linked-list-elements",
  brief: "Unlink every node whose value matches, head included.",
  statement:
    "Given the head of a linked list and a value, remove every node holding that value and return the head of what is left.",
  constraints: [
    "0 <= nodes <= 10^4, and both the node values and the target sit in 0..50",
    "EVERY match goes, not just the first — one pass has to keep deleting after it has deleted once",
    "the HEAD may match, and so may the node that replaces it, so the front of the list can need several removals in a row",
    "every node may match, which means the legal answer is an empty list and the function must be able to return nothing",
    "an empty list in is an empty list out",
  ],
  examples: [
    { input: "head = [1,2,6,3,4,5,6], val = 6", output: "[1,2,3,4,5]" },
    {
      input: "head = [7,7,7,7], val = 7",
      output: "[]",
      note: "Every node goes. A loop that starts at head.next and only ever edits prev.next can never produce this answer — the head is the node it cannot reach.",
    },
    { input: "head = [], val = 1", output: "[]" },
  ],
  hints: [
    "To unlink a node you need the node BEFORE it, which a forward-only list will not hand you after the fact.",
    "After removing prev.next, do not advance — the new prev.next may match too.",
    "The head has no node before it. Invent one: a throwaway node in front of the head makes the head an ordinary case.",
  ],
  whyNow:
    "Stripping the head first is a second loop running the same test, and it is the loop people forget — a list that is entirely matches is handled only there. A dummy node in front of the head makes the head an ordinary node, so one loop covers the whole list.",
  arc: "Every rung applies one unlinking rule — point a node's predecessor past it — and the ladder is a sequence of things that turn out to be unnecessary. Restarting the scan after each removal re-checks nodes it has already cleared, which is quadratic when the survivors come first and the matches sit at the end; a deleted node cannot come back, so nothing behind you can change and one pass is enough. Rebuilding from the surviving values is linear and replaces every node you were handed with a copy. Recursion keeps the real nodes and keeps ten thousand frames along with them. Stripping the leading matches first and then looping is one pass in constant space, and writes the same test twice — the head loop being the one people forget, which is exactly the loop that a list of nothing but matches depends on entirely. The dummy node deletes that duplication: with a node in front of the head, the head is an ordinary node, one loop covers everything, and dummy.next is right whether nothing went, the front went, or all of it did. The other habit worth keeping is not advancing prev after a removal, because the node that slid into place may match too.",
  approach:
    "Put a dummy node in front of the head and walk a prev pointer from it. If prev.next matches, splice it out and leave prev where it is, because the node that slid into place may match as well. Otherwise step prev forward. Returning dummy.next gives the right answer whether nothing was removed, the head was removed, or everything was.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def remove_elements(head, val):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next is not None:
        if prev.next.val == val:
            # do NOT advance: the node that slid in may match too
            prev.next = prev.next.next
        else:
            prev = prev.next
    return dummy.next`,
  java: `public ListNode removeElements(ListNode head, int val) {
    ListNode dummy = new ListNode(0, head);
    ListNode prev = dummy;
    while (prev.next != null) {
        if (prev.next.val == val) prev.next = prev.next.next;
        else prev = prev.next;
    }
    return dummy.next;
}`,
  cpp: `ListNode* removeElements(ListNode* head, int val) {
    ListNode* dummy = new ListNode(0, head);
    ListNode* prev = dummy;
    while (prev->next) {
        if (prev->next->val == val) prev->next = prev->next->next;
        else prev = prev->next;
    }
    return dummy->next;
}`,
  alternatives: [
    {
      name: "Restart the scan after every removal",
      summary:
        "Strip the leading matches, then scan from the head, remove the first match you find, and start over. Never wrong, and it re-checks everything it has already cleared. Measured, the worst shape is SURVIVORS FIRST with the matches at the end — 419 inner steps at n = 40, 929 at n = 60 — because a list of nothing but matches is cleared entirely by the head loop before this one runs, and costs it zero.",
      complexity: { time: "O(n^2)", space: "O(1)" },
      python: `def remove_elements(head, val):
    while head is not None and head.val == val:
        head = head.next
    changed = True
    while changed:
        changed = False
        node = head
        while node is not None and node.next is not None:
            if node.next.val == val:
                node.next = node.next.next
                changed = True
                break
            node = node.next
    return head`,
      java: `public ListNode removeElements(ListNode head, int val) {
    while (head != null && head.val == val) head = head.next;
    boolean changed = true;
    while (changed) {
        changed = false;
        ListNode node = head;
        while (node != null && node.next != null) {
            if (node.next.val == val) {
                node.next = node.next.next;
                changed = true;
                break;
            }
            node = node.next;
        }
    }
    return head;
}`,
      cpp: `ListNode* removeElements(ListNode* head, int val) {
    while (head && head->val == val) head = head->next;
    bool changed = true;
    while (changed) {
        changed = false;
        ListNode* node = head;
        while (node && node->next) {
            if (node->next->val == val) {
                node->next = node->next->next;
                changed = true;
                break;
            }
            node = node->next;
        }
    }
    return head;
}`,
    },
    {
      name: "Rebuild from the survivors",
      whyNow:
        "Restarting re-walks every node it has already cleared. A deleted node can never come back, so one pass is enough — nothing behind you can change.",
      summary:
        "Collect the values that stay, then build a fresh list out of them. Linear, and it allocates a second list of up to n nodes while abandoning the ones you were handed.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def remove_elements(head, val):
    kept = []
    while head is not None:
        if head.val != val:
            kept.append(head.val)
        head = head.next
    new_head = None
    for v in reversed(kept):
        new_head = ListNode(v, new_head)
    return new_head`,
      java: `public ListNode removeElements(ListNode head, int val) {
    ArrayList<Integer> kept = new ArrayList<>();
    while (head != null) {
        if (head.val != val) kept.add(head.val);
        head = head.next;
    }
    ListNode newHead = null;
    for (int i = kept.size() - 1; i >= 0; i--) newHead = new ListNode(kept.get(i), newHead);
    return newHead;
}`,
      cpp: `ListNode* removeElements(ListNode* head, int val) {
    vector<int> kept;
    while (head) {
        if (head->val != val) kept.push_back(head->val);
        head = head->next;
    }
    ListNode* newHead = nullptr;
    for (int i = (int) kept.size() - 1; i >= 0; i--) newHead = new ListNode(kept[i], newHead);
    return newHead;
}`,
    },
    {
      name: "Recursive",
      whyNow:
        "Rebuilding replaces every surviving node with a copy. Recursion lets each node decide its own fate and hands back either itself or its tail, so the nodes you keep are the nodes you were given.",
      summary:
        "Clean the tail first, then return either this node with its next already cleaned or, if this node matches, the cleaned tail in its place. Three lines and the clearest statement of the rule. The leading-match problem that complicates every iterative version never appears, because the head is just another node to the recursion, and the whole list sits on the call stack while it runs.",
      complexity: { time: "O(n)", space: "O(n) stack" },
      python: `def remove_elements(head, val):
    if head is None:
        return None
    head.next = remove_elements(head.next, val)
    return head.next if head.val == val else head`,
      java: `public ListNode removeElements(ListNode head, int val) {
    if (head == null) return null;
    head.next = removeElements(head.next, val);
    if (head.val == val) return head.next;
    return head;
}`,
      cpp: `ListNode* removeElements(ListNode* head, int val) {
    if (!head) return nullptr;
    head->next = removeElements(head->next, val);
    if (head->val == val) return head->next;
    return head;
}`,
    },
    {
      name: "Strip the head, then walk with prev",
      whyNow:
        "Recursion holds a frame per node and the list may be 10^4 long. The same unlinking runs in a loop with one pointer and no stack at all.",
      summary:
        "Advance the head past every leading match, then walk with a prev pointer removing the rest. Constant space and one pass — but the same test is written twice, and the head loop is the one that gets forgotten.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def remove_elements(head, val):
    # the head has no predecessor, so it needs its own loop
    while head is not None and head.val == val:
        head = head.next
    node = head
    while node is not None and node.next is not None:
        if node.next.val == val:
            node.next = node.next.next
        else:
            node = node.next
    return head`,
      java: `public ListNode removeElements(ListNode head, int val) {
    while (head != null && head.val == val) head = head.next;
    ListNode node = head;
    while (node != null && node.next != null) {
        if (node.next.val == val) node.next = node.next.next;
        else node = node.next;
    }
    return head;
}`,
      cpp: `ListNode* removeElements(ListNode* head, int val) {
    while (head && head->val == val) head = head->next;
    ListNode* node = head;
    while (node && node->next) {
        if (node->next->val == val) node->next = node->next->next;
        else node = node->next;
    }
    return head;
}`,
    },
  ],
}
