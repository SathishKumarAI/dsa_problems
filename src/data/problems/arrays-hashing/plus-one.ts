import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "plus-one",
  title: "Add One to a Digit Array",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "plus-one",
  brief:
    "A number written one digit per slot — add one and hand back the digits.",
  statement:
    "A non-negative integer is given as an array of its decimal digits, most significant first. Add one to that number and return the digits of the result in the same form.",
  constraints: [
    "1 <= digits.length <= 100, so the number can be far larger than any fixed-width integer type holds",
    "0 <= digits[i] <= 9",
    "no leading zeros, except that the array [0] is a legal way to write zero",
    "a carry out of the leading digit makes the answer exactly one digit longer (999 + 1 = 1000), and that is the only way the length ever changes",
  ],
  examples: [
    { input: "digits = [1, 2, 3]", output: "[1, 2, 4]" },
    {
      input: "digits = [9, 9, 9]",
      output: "[1, 0, 0, 0]",
      note: "All nines is the only shape that grows. A version that writes the answer back into the input array has nowhere to put the leading 1.",
    },
    { input: "digits = [1, 9, 9]", output: "[2, 0, 0]" },
  ],
  hints: [
    "This is the addition you learned on paper: start at the right-hand end, not the left.",
    "A digit below 9 absorbs the increment and stops everything — nothing to its left can change.",
    "A 9 becomes 0 and passes the problem one place left. If you run off the front, every digit was a 9 and the answer is a 1 followed by that many zeros.",
  ],
  whyNow:
    "Checking for all nines up front costs a full pass before any work begins, and then walks the digits a second time to do the increment. The same test comes for free at the end of a single backward walk: running off the front IS the all-nines case, so one pass decides both.",
  approach:
    "Walk from the last digit towards the first. The first digit below 9 can take the increment on its own, so add one and return immediately — everything to its left is untouched, which is why the common case costs one step rather than n. A 9 cannot take it: write 0 and carry on left. If the loop runs off the front, every digit was a 9 and every one is now 0, so the answer is that row of zeros with a 1 in front — the one case where the array grows, and the only case that allocates.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def plus_one(digits: list[int]) -> list[int]:
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits
        digits[i] = 0
    # fell off the front: every digit was a 9
    return [1] + digits`,
  java: `public int[] plusOne(int[] digits) {
    for (int i = digits.length - 1; i >= 0; i--) {
        if (digits[i] < 9) {
            digits[i]++;
            return digits;
        }
        digits[i] = 0;
    }
    int[] grown = new int[digits.length + 1];
    grown[0] = 1;
    return grown;
}`,
  cpp: `vector<int> plusOne(vector<int> digits) {
    for (int i = (int)digits.size() - 1; i >= 0; i--) {
        if (digits[i] < 9) {
            digits[i]++;
            return digits;
        }
        digits[i] = 0;
    }
    digits.insert(digits.begin(), 1);
    return digits;
}`,
  walkthrough: [
    {
      cells: { values: [1, 2, 3], marks: { 2: "focus" }, labels: { 2: "i" } },
      caption:
        "Start at the last digit. 3 is below 9, so it takes the increment alone.",
    },
    {
      cells: { values: [1, 2, 4], marks: { 2: "done" } },
      caption: "Return at once — the digits to the left never had to be read.",
    },
    {
      cells: { values: [9, 9, 9], marks: { 2: "focus" }, labels: { 2: "i" } },
      caption:
        "The other shape: 9 cannot absorb the one. Write 0 and step left.",
    },
    {
      cells: {
        values: [9, 0, 0],
        marks: { 0: "focus", 1: "done", 2: "done" },
        labels: { 0: "i" },
      },
      caption:
        "Same again at index 1 and index 0 — the walk runs off the front.",
    },
    {
      cells: { values: [1, 0, 0, 0], marks: { 0: "focus" } },
      caption:
        "Every digit was a 9, so the answer is one digit longer: a 1 in front of the zeros.",
    },
  ],
  alternatives: [
    {
      name: "Build the number, add one, split it back",
      summary:
        "Fold the digits into an integer, add one, then peel the digits off with % 10. Reads like the definition of the problem — and dies as soon as the number outgrows a 64-bit integer, which 100 digits certainly do.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def plus_one(digits: list[int]) -> list[int]:
    value = 0
    for d in digits:
        value = value * 10 + d
    value += 1
    out = []
    while value > 0:
        out.append(value % 10)
        value //= 10
    out.reverse()
    return out`,
      java: `public int[] plusOne(int[] digits) {
    long value = 0;
    for (int d : digits) value = value * 10 + d;
    value++;
    int len = 0;
    for (long v = value; v > 0; v /= 10) len++;
    int[] out = new int[len];
    for (int i = len - 1; i >= 0; i--) {
        out[i] = (int)(value % 10);
        value /= 10;
    }
    return out;
}`,
      cpp: `vector<int> plusOne(vector<int> digits) {
    long long value = 0;
    for (int d : digits) value = value * 10 + d;
    value++;
    vector<int> out;
    while (value > 0) {
        out.push_back((int)(value % 10));
        value /= 10;
    }
    for (int lo = 0, hi = (int)out.size() - 1; lo < hi; lo++, hi--) swap(out[lo], out[hi]);
    return out;
}`,
    },
    {
      name: "Reverse, carry, reverse back",
      summary:
        "Flip the digits so the least significant one is first, run a carry left to right the way a loop naturally goes, append any leftover carry, and flip back.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "The integer version stops being correct at about 19 digits, and the problem allows 100 — the failure is silent, since an overflowed sum still returns digits. Carrying one digit at a time has no width at all: it works on a hundred digits or a million.",
      python: `def plus_one(digits: list[int]) -> list[int]:
    rev = digits[::-1]
    carry = 1
    for i in range(len(rev)):
        total = rev[i] + carry
        rev[i] = total % 10
        carry = total // 10
    if carry:
        rev.append(carry)
    rev.reverse()
    return rev`,
      java: `public int[] plusOne(int[] digits) {
    int n = digits.length;
    int[] rev = new int[n + 1];
    for (int i = 0; i < n; i++) rev[i] = digits[n - 1 - i];
    int carry = 1;
    for (int i = 0; i <= n; i++) {
        int total = rev[i] + carry;
        rev[i] = total % 10;
        carry = total / 10;
    }
    int len = rev[n] > 0 ? n + 1 : n;
    int[] out = new int[len];
    for (int i = 0; i < len; i++) out[i] = rev[len - 1 - i];
    return out;
}`,
      cpp: `vector<int> plusOne(vector<int> digits) {
    vector<int> rev(digits.rbegin(), digits.rend());
    int carry = 1;
    for (int i = 0; i < (int)rev.size(); i++) {
        int total = rev[i] + carry;
        rev[i] = total % 10;
        carry = total / 10;
    }
    if (carry > 0) rev.push_back(carry);
    for (int lo = 0, hi = (int)rev.size() - 1; lo < hi; lo++, hi--) swap(rev[lo], rev[hi]);
    return rev;
}`,
    },
    {
      name: "Carry from the back",
      summary:
        "Keep the digits as they are and run the index backwards instead, stopping as soon as the carry is spent. A carry still alive at the end means the array has to grow.",
      complexity: { time: "O(n)", space: "O(1)" },
      whyNow:
        "Reversing costs two extra passes and a full copy purely to face the digits the other way, which a decrementing index does for nothing. The loop can also stop the moment the carry becomes 0 rather than marching through digits it will not change.",
      python: `def plus_one(digits: list[int]) -> list[int]:
    carry = 1
    i = len(digits) - 1
    while i >= 0 and carry:
        total = digits[i] + carry
        digits[i] = total % 10
        carry = total // 10
        i -= 1
    if carry:
        return [1] + digits
    return digits`,
      java: `public int[] plusOne(int[] digits) {
    int carry = 1;
    for (int i = digits.length - 1; i >= 0 && carry > 0; i--) {
        int total = digits[i] + carry;
        digits[i] = total % 10;
        carry = total / 10;
    }
    if (carry == 0) return digits;
    int[] grown = new int[digits.length + 1];
    grown[0] = 1;
    for (int i = 0; i < digits.length; i++) grown[i + 1] = digits[i];
    return grown;
}`,
      cpp: `vector<int> plusOne(vector<int> digits) {
    int carry = 1;
    for (int i = (int)digits.size() - 1; i >= 0 && carry > 0; i--) {
        int total = digits[i] + carry;
        digits[i] = total % 10;
        carry = total / 10;
    }
    if (carry > 0) digits.insert(digits.begin(), 1);
    return digits;
}`,
    },
    {
      name: "Special-case all nines",
      summary:
        "Only one input grows: the one made entirely of nines. Test for it up front and return 1 followed by zeros; otherwise zero out the trailing nines and bump the first digit that is not one.",
      complexity: { time: "O(n)", space: "O(1)" },
      whyNow:
        "The carry variable is state that has to be read correctly after the loop ends, and forgetting the leftover carry is the classic wrong answer on [9, 9, 9] — it silently returns [0, 0, 0]. Deciding the growing case before the loop starts removes the carry, and with it the boundary that gets missed.",
      python: `def plus_one(digits: list[int]) -> list[int]:
    if all(d == 9 for d in digits):
        return [1] + [0] * len(digits)
    i = len(digits) - 1
    while digits[i] == 9:
        digits[i] = 0
        i -= 1
    digits[i] += 1
    return digits`,
      java: `public int[] plusOne(int[] digits) {
    boolean allNine = true;
    for (int d : digits) if (d != 9) allNine = false;
    if (allNine) {
        int[] grown = new int[digits.length + 1];
        grown[0] = 1;
        return grown;
    }
    int i = digits.length - 1;
    while (digits[i] == 9) {
        digits[i] = 0;
        i--;
    }
    digits[i]++;
    return digits;
}`,
      cpp: `vector<int> plusOne(vector<int> digits) {
    bool allNine = true;
    for (int d : digits) if (d != 9) allNine = false;
    if (allNine) {
        vector<int> grown(digits.size() + 1, 0);
        grown[0] = 1;
        return grown;
    }
    int i = (int)digits.size() - 1;
    while (digits[i] == 9) {
        digits[i] = 0;
        i--;
    }
    digits[i]++;
    return digits;
}`,
    },
  ],
}
