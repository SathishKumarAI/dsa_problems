import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "remove-nth-from-end",
  title: "Remove the nth Node From the End",
  pattern: "linked-list",
  difficulty: "medium",
  leetcode: "remove-nth-node-from-end-of-list",
  brief: "Delete a node counted from the back, in one pass.",
  statement:
    "Given the head of a linked list and a number n, remove the nth node counting from the end and return the head of the result.",
  constraints: [
    "1 <= number of nodes <= 30, and 1 <= n <= number of nodes",
    "0 <= node.val <= 100",
    "n counts from the END, which a forward-only list cannot address directly",
    "removing the HEAD is legal and is the case a naive version breaks on",
  ],
  examples: [
    { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]" },
    {
      input: "head = [1], n = 1",
      output: "[]",
      note: "Removing the only node leaves an empty list.",
    },
  ],
  hints: [
    "Two pointers, one started n nodes ahead of the other, stay exactly n apart for the whole walk.",
    "When the leader reaches the end, the follower is sitting n from the end.",
    "Stop the follower one node EARLIER than the target, because you must relink its predecessor.",
  ],
  whyNow:
    "Counting the length first and then walking to position length − n works, but it needs two traversals and the length before it can begin. A gap of n between two pointers converts a distance from the end into a distance from the front automatically, so one pass does it.",
  approach:
    "Put a dummy node before the head so removing the first node needs no special case — this is the trick the whole problem is really about. Advance a leader n steps, then move leader and follower together until the leader falls off the end; the follower now sits just before the node to remove. Relink past it. Returning the dummy's next handles both the ordinary case and the one where the head itself was removed.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `class ListNode:
    def __init__(self, val: int = 0, nxt: "ListNode | None" = None):
        self.val = val
        self.next = nxt


def remove_nth_from_end(head: ListNode | None, n: int) -> ListNode | None:
    dummy = ListNode(0, head)
    leader = dummy
    follower = dummy
    for _ in range(n):
        leader = leader.next
    while leader.next is not None:
        leader = leader.next
        follower = follower.next
    follower.next = follower.next.next
    return dummy.next`,
  java: `public ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0, head);
    ListNode leader = dummy;
    ListNode follower = dummy;
    for (int i = 0; i < n; i++) leader = leader.next;
    while (leader.next != null) {
        leader = leader.next;
        follower = follower.next;
    }
    follower.next = follower.next.next;
    return dummy.next;
}`,
  cpp: `ListNode* removeNthFromEnd(ListNode* head, int n) {
    ListNode dummy(0, head);
    ListNode* leader = &dummy;
    ListNode* follower = &dummy;
    for (int i = 0; i < n; i++) leader = leader->next;
    while (leader->next != nullptr) {
        leader = leader->next;
        follower = follower->next;
    }
    follower->next = follower->next->next;
    return dummy.next;
}`,
  walkthrough: [
    {
      text: `dummy → 1 → 2 → 3 → 4 → 5 → None
^both`,
      caption:
        "A dummy in front means removing the head is not a special case.",
    },
    {
      text: `dummy → 1 → 2 → 3 → 4 → 5
^follower        ^leader`,
      caption: "The leader takes n = 2 steps first. The gap is now fixed.",
    },
    {
      text: `dummy → 1 → 2 → 3 → 4 → 5
            ^follower       ^leader`,
      caption: "Both advance together, keeping the gap.",
    },
    {
      text: `dummy → 1 → 2 → 3 → 4 → 5
                 ^follower      ^leader at last node`,
      caption:
        "The leader is at the end, so the follower sits just BEFORE the target.",
    },
    {
      text: `1 → 2 → 3 → 5

(node 4 relinked past)`,
      caption:
        "Relink and return dummy.next — correct whether or not the head was the one removed.",
    },
  ],
  alternatives: [
    {
      name: "Count, then walk forward",
      summary:
        "Traverse to count the nodes, then traverse again to the node before position length − n and relink past it.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `class ListNode:
    def __init__(self, val: int = 0, nxt: "ListNode | None" = None):
        self.val = val
        self.next = nxt


def remove_nth_from_end(head: ListNode | None, n: int) -> ListNode | None:
    count = 0
    node = head
    while node is not None:
        count += 1
        node = node.next
    if count == n:
        return head.next
    node = head
    for _ in range(count - n - 1):
        node = node.next
    node.next = node.next.next
    return head`,
      java: `public ListNode removeNthFromEnd(ListNode head, int n) {
    int count = 0;
    ListNode node = head;
    while (node != null) {
        count++;
        node = node.next;
    }
    if (count == n) return head.next;
    node = head;
    for (int i = 0; i < count - n - 1; i++) node = node.next;
    node.next = node.next.next;
    return head;
}`,
      cpp: `ListNode* removeNthFromEnd(ListNode* head, int n) {
    int count = 0;
    ListNode* node = head;
    while (node != nullptr) {
        count++;
        node = node->next;
    }
    if (count == n) return head->next;
    node = head;
    for (int i = 0; i < count - n - 1; i++) node = node->next;
    node->next = node->next->next;
    return head;
}`,
    },
  ],
}
