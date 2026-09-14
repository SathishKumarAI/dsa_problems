import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "add-two-numbers",
  title: "Add the Digits, Least Significant First",
  pattern: "linked-list",
  difficulty: "medium",
  leetcode: "add-two-numbers",
  brief: "Add two numbers stored one digit per node, ones digit at the head.",
  statement:
    "Two non-negative numbers are stored as linked lists, one digit per node, with the ones digit at the head. Add them and return the sum as a list in the same form.",
  constraints: [
    "1 <= nodes in each list <= 100, and each node holds a single digit 0..9",
    "the digits run LEAST significant first, so the two heads line up and the walk needs no alignment pass",
    "the lists may be different lengths — a missing node counts as a zero, not as the end of the sum",
    "the carry may run past the end of BOTH lists, and that carry is a real digit: 999 + 1 is four nodes long",
    "no leading zeros except the number zero itself, which is the single node [0]",
  ],
  examples: [
    { input: "head1 = [2,4,3], head2 = [5,6,4]", output: "[7,0,8]" },
    {
      input: "head1 = [9,9,9], head2 = [1]",
      output: "[0,0,0,1]",
      note: "The carry survives both lists. A loop that stops the moment both inputs are exhausted drops the leading 1 and answers 999 + 1 = 0.",
    },
    { input: "head1 = [0], head2 = [0]", output: "[0]" },
  ],
  hints: [
    "The heads are the ones digits, so you can add them straight across — no reversing, no matching of lengths.",
    "Carry the tens digit into the next step, exactly the way you were taught to add on paper.",
    "Keep looping while EITHER list still has a node or the carry is non-zero; that third condition is the whole leading-digit case.",
  ],
  whyNow:
    "Padding destroys both input lists and spends a whole pass writing zeros just to make the lengths match. Treating a missing node as a zero inside the same loop needs neither the pass nor the damage, and it writes only the answer.",
  arc: "Every rung is school addition — one column at a time, least significant first, carrying the tens digit — so the ladder is really a list of things you can stop keeping. Reading each list into an integer keeps the whole number, which is why it dies at the twentieth digit rather than the hundredth: a long holds nineteen. Digit arrays never build the number, but they keep three copies of data the two lists already hold in exactly the right order. Recursion drops the arrays and keeps a frame per digit instead. Padding drops the frames and keeps the damage — a pass writing nothing but zeros, into inputs it does not own. What survives is the loop worth knowing cold: a dummy head, a running carry, and a condition reading l1 or l2 or carry. A missing node is a zero, not the end, and that trailing carry is a real digit, because 999 plus 1 is four nodes long. The same dummy-and-carry shape solves the most-significant-first variant, once a stack or a reversal lines the digits up.",
  approach:
    "Walk both lists together behind a dummy head. Each step sums whatever digits are still available plus the carry, appends the ones digit of that sum as a new node, and keeps the tens digit as the next carry. The loop condition is l1 or l2 or carry — that third term is what lets the answer be longer than either input. Returning dummy.next means the first node needs no special handling.",
  complexity: { time: "O(n + m)", space: "O(1) beyond the answer" },
  python: `def add_two_numbers(l1, l2):
    dummy = ListNode(0)
    tail = dummy
    carry = 0
    # the carry keeps the loop alive after both lists are spent
    while l1 is not None or l2 is not None or carry:
        total = carry
        if l1 is not None:
            total += l1.val
            l1 = l1.next
        if l2 is not None:
            total += l2.val
            l2 = l2.next
        carry = total // 10
        tail.next = ListNode(total % 10)
        tail = tail.next
    return dummy.next`,
  java: `public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode tail = dummy;
    int carry = 0;
    while (l1 != null || l2 != null || carry != 0) {
        int total = carry;
        if (l1 != null) { total += l1.val; l1 = l1.next; }
        if (l2 != null) { total += l2.val; l2 = l2.next; }
        carry = total / 10;
        tail.next = new ListNode(total % 10);
        tail = tail.next;
    }
    return dummy.next;
}`,
  cpp: `ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    ListNode* dummy = new ListNode(0);
    ListNode* tail = dummy;
    int carry = 0;
    while (l1 || l2 || carry) {
        int total = carry;
        if (l1) { total += l1->val; l1 = l1->next; }
        if (l2) { total += l2->val; l2 = l2->next; }
        carry = total / 10;
        tail->next = new ListNode(total % 10);
        tail = tail->next;
    }
    return dummy->next;
}`,
  alternatives: [
    {
      name: "Turn both lists into numbers",
      summary:
        "Read each list into an integer, add, split the total back into digits. It reads like the problem statement, and it is the version that dies on a 100-digit input: 10^100 does not fit in a long.",
      complexity: { time: "O(n + m)", space: "O(1) beyond the answer" },
      python: `def add_two_numbers(l1, l2):
    if l1 is None and l2 is None:
        return None
    a = 0
    place = 1
    while l1 is not None:
        a += l1.val * place
        place *= 10
        l1 = l1.next
    b = 0
    place = 1
    while l2 is not None:
        b += l2.val * place
        place *= 10
        l2 = l2.next
    total = a + b
    dummy = ListNode(0)
    tail = dummy
    # a do-while: zero still owes one digit
    while True:
        tail.next = ListNode(total % 10)
        tail = tail.next
        total //= 10
        if total == 0:
            break
    return dummy.next`,
      java: `public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    if (l1 == null && l2 == null) return null;
    long a = 0, place = 1;
    while (l1 != null) { a += l1.val * place; place *= 10; l1 = l1.next; }
    long b = 0;
    place = 1;
    while (l2 != null) { b += l2.val * place; place *= 10; l2 = l2.next; }
    long total = a + b;
    ListNode dummy = new ListNode(0);
    ListNode tail = dummy;
    while (true) {
        tail.next = new ListNode((int) (total % 10));
        tail = tail.next;
        total /= 10;
        if (total == 0) break;
    }
    return dummy.next;
}`,
      cpp: `ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    if (!l1 && !l2) return nullptr;
    long long a = 0, place = 1;
    while (l1) { a += l1->val * place; place *= 10; l1 = l1->next; }
    long long b = 0;
    place = 1;
    while (l2) { b += l2->val * place; place *= 10; l2 = l2->next; }
    long long total = a + b;
    ListNode* dummy = new ListNode(0);
    ListNode* tail = dummy;
    while (true) {
        tail->next = new ListNode((int) (total % 10));
        tail = tail->next;
        total /= 10;
        if (total == 0) break;
    }
    return dummy->next;
}`,
    },
    {
      name: "Digit arrays",
      whyNow:
        "A hundred digits is a number with a hundred digits, and a long holds nineteen. Adding column by column out of two arrays never builds the whole number, so there is nothing left to overflow.",
      summary:
        "Copy both lists into arrays, add them column by column with a carry, then build the answer. Correct at any length — at the price of three passes and two arrays for a sum the lists could have carried themselves.",
      complexity: { time: "O(n + m)", space: "O(n + m)" },
      python: `def add_two_numbers(l1, l2):
    a = []
    while l1 is not None:
        a.append(l1.val)
        l1 = l1.next
    b = []
    while l2 is not None:
        b.append(l2.val)
        l2 = l2.next
    out = []
    carry = 0
    for i in range(max(len(a), len(b))):
        total = carry
        if i < len(a):
            total += a[i]
        if i < len(b):
            total += b[i]
        carry = total // 10
        out.append(total % 10)
    if carry:
        out.append(carry)
    head = None
    for d in reversed(out):
        head = ListNode(d, head)
    return head`,
      java: `public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ArrayList<Integer> a = new ArrayList<>();
    while (l1 != null) { a.add(l1.val); l1 = l1.next; }
    ArrayList<Integer> b = new ArrayList<>();
    while (l2 != null) { b.add(l2.val); l2 = l2.next; }
    ArrayList<Integer> out = new ArrayList<>();
    int carry = 0;
    int n = Math.max(a.size(), b.size());
    for (int i = 0; i < n; i++) {
        int total = carry;
        if (i < a.size()) total += a.get(i);
        if (i < b.size()) total += b.get(i);
        carry = total / 10;
        out.add(total % 10);
    }
    if (carry != 0) out.add(carry);
    ListNode head = null;
    for (int i = out.size() - 1; i >= 0; i--) head = new ListNode(out.get(i), head);
    return head;
}`,
      cpp: `ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    vector<int> a;
    while (l1) { a.push_back(l1->val); l1 = l1->next; }
    vector<int> b;
    while (l2) { b.push_back(l2->val); l2 = l2->next; }
    vector<int> out;
    int carry = 0;
    int n = (int) (a.size() > b.size() ? a.size() : b.size());
    for (int i = 0; i < n; i++) {
        int total = carry;
        if (i < (int) a.size()) total += a[i];
        if (i < (int) b.size()) total += b[i];
        carry = total / 10;
        out.push_back(total % 10);
    }
    if (carry) out.push_back(carry);
    ListNode* head = nullptr;
    for (int i = (int) out.size() - 1; i >= 0; i--) head = new ListNode(out[i], head);
    return head;
}`,
    },
    {
      name: "Recursive carry",
      whyNow:
        "The two arrays are a third copy of an input the lists already hold in exactly the right order. Recursion adds one column per call and spills any carry into the node ahead, so nothing gets copied.",
      summary:
        "Add the second digit into the first node, spill anything over nine into the next node, recurse on the tails. Neat and in place — and one stack frame per digit.",
      complexity: { time: "O(n + m)", space: "O(n + m) stack" },
      python: `def add_two_numbers(l1, l2):
    if l1 is None and l2 is None:
        return None
    if l1 is None:
        l1, l2 = l2, l1
    if l2 is not None:
        l1.val += l2.val
        l2 = l2.next
    if l1.val >= 10:
        l1.val -= 10
        # the carry lands as a 10 in the next node; the next level splits it
        if l1.next is None:
            l1.next = ListNode(1)
        else:
            l1.next.val += 1
    l1.next = add_two_numbers(l1.next, l2)
    return l1`,
      java: `public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    if (l1 == null && l2 == null) return null;
    if (l1 == null) { ListNode t = l1; l1 = l2; l2 = t; }
    if (l2 != null) { l1.val += l2.val; l2 = l2.next; }
    if (l1.val >= 10) {
        l1.val -= 10;
        if (l1.next == null) l1.next = new ListNode(1);
        else l1.next.val += 1;
    }
    l1.next = addTwoNumbers(l1.next, l2);
    return l1;
}`,
      cpp: `ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    if (!l1 && !l2) return nullptr;
    if (!l1) { ListNode* t = l1; l1 = l2; l2 = t; }
    if (l2) { l1->val += l2->val; l2 = l2->next; }
    if (l1->val >= 10) {
        l1->val -= 10;
        if (!l1->next) l1->next = new ListNode(1);
        else l1->next->val += 1;
    }
    l1->next = addTwoNumbers(l1->next, l2);
    return l1;
}`,
    },
    {
      name: "Pad, then add in place",
      whyNow:
        "Recursion opens a frame per digit, so a hundred digits is a hundred frames deep before the first one returns. Once both lists are the same length the carry propagates in a plain loop with three variables.",
      summary:
        "Walk both lists together, appending zero nodes to whichever runs out first, then add straight down the columns into the first list. Constant extra space — at the cost of vandalising both inputs and a whole pass that writes nothing but zeros.",
      complexity: { time: "O(n + m)", space: "O(1) beyond the answer" },
      python: `def add_two_numbers(l1, l2):
    if l1 is None:
        return l2
    if l2 is None:
        return l1
    a, b = l1, l2
    while a.next is not None or b.next is not None:
        if a.next is None:
            a.next = ListNode(0)
        if b.next is None:
            b.next = ListNode(0)
        a, b = a.next, b.next
    a, b = l1, l2
    carry = 0
    while a is not None:
        total = a.val + b.val + carry
        a.val = total % 10
        carry = total // 10
        if a.next is None:
            if carry:
                a.next = ListNode(carry)
            break
        a, b = a.next, b.next
    return l1`,
      java: `public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    if (l1 == null) return l2;
    if (l2 == null) return l1;
    ListNode a = l1, b = l2;
    while (a.next != null || b.next != null) {
        if (a.next == null) a.next = new ListNode(0);
        if (b.next == null) b.next = new ListNode(0);
        a = a.next;
        b = b.next;
    }
    a = l1;
    b = l2;
    int carry = 0;
    while (a != null) {
        int total = a.val + b.val + carry;
        a.val = total % 10;
        carry = total / 10;
        if (a.next == null) {
            if (carry != 0) a.next = new ListNode(carry);
            break;
        }
        a = a.next;
        b = b.next;
    }
    return l1;
}`,
      cpp: `ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    if (!l1) return l2;
    if (!l2) return l1;
    ListNode* a = l1;
    ListNode* b = l2;
    while (a->next || b->next) {
        if (!a->next) a->next = new ListNode(0);
        if (!b->next) b->next = new ListNode(0);
        a = a->next;
        b = b->next;
    }
    a = l1;
    b = l2;
    int carry = 0;
    while (a) {
        int total = a->val + b->val + carry;
        a->val = total % 10;
        carry = total / 10;
        if (!a->next) {
            if (carry) a->next = new ListNode(carry);
            break;
        }
        a = a->next;
        b = b->next;
    }
    return l1;
}`,
    },
  ],
}
