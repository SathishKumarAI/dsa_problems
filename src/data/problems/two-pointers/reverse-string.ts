import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "reverse-string",
  title: "Reverse the Characters in Place",
  pattern: "two-pointers",
  difficulty: "easy",
  leetcode: "reverse-string",
  brief: "Swap the two ends inward until the pointers meet.",
  statement:
    "Given a string, return it with its characters in the opposite order. Build the answer by moving characters around inside one buffer rather than growing a new string a concatenation at a time.",
  constraints: [
    "0 <= s.length <= 10^5",
    "the characters are ordinary printable ASCII; nothing here depends on the alphabet, only on position",
    "the empty string and a one-character string are both legal input and both answer with themselves — the swap loop must run zero times, not once",
    "an odd length leaves a middle character with no partner: it is its own mirror and must not be touched, which is why the loop stops when the pointers MEET rather than when they cross",
  ],
  examples: [
    { input: 's = "hello"', output: '"olleh"' },
    {
      input: 's = "abc"',
      output: '"cba"',
      note: "Odd length: 'b' sits at the middle and stays exactly where it is.",
    },
    {
      input: 's = ""',
      output: '""',
      note: "The right pointer starts at -1, already past the left one — the trap is a loop that swaps before it tests.",
    },
  ],
  hints: [
    "The first character has to end up last. Which other character has an equally obvious destination?",
    "Position i and position n - 1 - i trade places, and that one pairing covers every character in the string.",
    "So walk one index in from each end, swap, and stop when they meet: n/2 swaps, no second buffer, and the middle of an odd string is already home.",
  ],
  whyNow:
    "Copying back to front still reads all n positions and writes all n into a buffer the same size as the input, so it does twice the work of the thing it is describing. A swap moves two characters at once, which means the walk only has to reach the middle: n/2 swaps, no output buffer beyond the one being reversed, and the two indices are the entire state.",
  arc: "The point of this problem is to see how many plausible solutions are quietly quadratic: building a new string by concatenation, recursion that slices, or anything that copies the tail on every step. In a language with immutable strings, 'append in a loop' is the trap. Once the input is a mutable array, the answer is the smallest possible loop — swap the ends and walk inward, n/2 swaps and no allocation. Take two habits: check whether your language's string concatenation is O(1) or O(n) before using it in a loop, and remember that the two-pointer swap is the base pattern behind reversing a sub-range, which is what rotate-array and next-permutation both lean on.",
  approach:
    "Reversal is a pairing, not a rebuild: whatever is at position i belongs at position n - 1 - i, and the same is true the other way round, so the two can simply trade. Put one index at each end of a mutable buffer, swap what they point at, and step them toward each other. Every swap places two characters permanently, so the loop finishes after n/2 of them. Stopping while the indices are still apart is what protects an odd-length string: the middle character is paired with itself, and swapping it would be a no-op at best. Nothing is allocated beyond the buffer holding the answer, and the character count is never needed again after the right index is set.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def reverse_string(s: str) -> str:
    chars = list(s)
    i, j = 0, len(chars) - 1
    while i < j:
        chars[i], chars[j] = chars[j], chars[i]
        i += 1
        j -= 1
    return "".join(chars)`,
  java: `public String reverseString(String s) {
    char[] chars = s.toCharArray();
    int i = 0, j = chars.length - 1;
    while (i < j) {
        char tmp = chars[i];
        chars[i] = chars[j];
        chars[j] = tmp;
        i++;
        j--;
    }
    return new String(chars);
}`,
  cpp: `string reverseString(string s) {
    int i = 0, j = (int)s.size() - 1;
    while (i < j) {
        char tmp = s[i];
        s[i] = s[j];
        s[j] = tmp;
        i++;
        j--;
    }
    return s;
}`,
  walkthrough: [
    {
      cells: {
        values: ["h", "e", "l", "l", "o"],
        marks: { 0: "focus", 4: "focus" },
        labels: { 0: "i", 4: "j" },
      },
      caption:
        "One index at each end. The pair (i, j) is about to trade, which settles two characters in one move.",
    },
    {
      cells: {
        values: ["o", "e", "l", "l", "h"],
        marks: { 0: "done", 4: "done", 1: "focus", 3: "focus" },
        labels: { 1: "i", 3: "j" },
      },
      caption:
        "'h' and 'o' are now final. Both indices step inward; nothing outside them will be looked at again.",
    },
    {
      cells: {
        values: ["o", "l", "l", "e", "h"],
        marks: { 0: "done", 1: "done", 3: "done", 4: "done", 2: "compare" },
        labels: { 2: "i/j" },
      },
      caption:
        "'e' and the second 'l' swap. The indices have met at position 2 — for an odd length that is the unpaired middle.",
    },
    {
      cells: {
        values: ["o", "l", "l", "e", "h"],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done" },
      },
      caption:
        "i is no longer less than j, so the loop ends without touching the middle. Five characters, two swaps.",
    },
  ],
  alternatives: [
    {
      name: "Recursion",
      summary:
        "Reverse everything after the first character, then put that character on the end. It reads like the definition and it is quadratic: each of the n levels builds a new string by concatenation, and it spends a call frame per character on top of that.",
      complexity: { time: "O(n^2)", space: "O(n)" },
      python: `def reverse_string(s: str) -> str:
    if len(s) <= 1:
        return s
    return reverse_string(s[1:]) + s[0]`,
      java: `public String reverseString(String s) {
    if (s.length() <= 1) {
        return s;
    }
    return reverseString(s.substring(1)) + s.charAt(0);
}`,
      cpp: `string reverseString(string s) {
    if ((int)s.size() <= 1) {
        return s;
    }
    return reverseString(s.substr(1)) + s[0];
}`,
    },
    {
      name: "Grow a new string",
      summary:
        "Walk forward, putting each character in front of everything collected so far, so the answer grows backwards. Neat — and each prepend copies the entire accumulated string, so the total work is quadratic even though the loop is linear.",
      complexity: { time: "O(n^2)", space: "O(n)" },
      whyNow:
        "The recursion copies a fresh substring at every level AND opens a stack frame per character, so a long string overflows the stack before it finishes being wrong about the cost. The same prepending done in a loop is still quadratic, but it cannot blow the stack — a real improvement, and it makes the actual expense visible: every step rebuilds the whole answer so far.",
      python: `def reverse_string(s: str) -> str:
    out = ""
    for c in s:
        out = c + out
    return out`,
      java: `public String reverseString(String s) {
    String out = "";
    for (int i = 0; i < s.length(); i++) {
        out = s.charAt(i) + out;
    }
    return out;
}`,
      cpp: `string reverseString(string s) {
    string out = "";
    for (char c : s) {
        out = c + out;
    }
    return out;
}`,
    },
    {
      name: "Stack of characters",
      summary:
        "Push every character, then pop them all: last in, first out is exactly the reversed order. Linear at last, and the stack is a container holding the whole input to express a relationship — position i belongs at n-1-i — that needs no container at all.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "Prepending copies everything already collected on every single step, which is n copies of an average of n/2 characters. A stack appends and removes at one end in constant time, so the whole reversal finally becomes linear instead of quadratic.",
      python: `def reverse_string(s: str) -> str:
    box = []
    for c in s:
        box.append(c)
    out = []
    while box:
        out.append(box.pop())
    return "".join(out)`,
      java: `public String reverseString(String s) {
    Deque<Character> box = new ArrayDeque<>();
    for (int i = 0; i < s.length(); i++) {
        box.push(s.charAt(i));
    }
    StringBuilder out = new StringBuilder();
    while (!box.isEmpty()) {
        out.append(box.pop());
    }
    return out.toString();
}`,
      cpp: `string reverseString(string s) {
    stack<char> box;
    for (char c : s) {
        box.push(c);
    }
    string out;
    while (!box.empty()) {
        out += box.top();
        box.pop();
    }
    return out;
}`,
    },
    {
      name: "Copy back to front",
      summary:
        "Read the input from the last index down to the first, appending to a buffer. Linear, one pass, no stack — and still a second array of n, because it treats reversal as building a new thing rather than as swapping pairs that are already in place.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "The stack is doing nothing an index could not do: the characters come out in decreasing position order, which is just the input read backwards. Dropping it removes n pushes, n pops and a whole container whose ordering was already implied by the string itself.",
      python: `def reverse_string(s: str) -> str:
    out = []
    for i in range(len(s) - 1, -1, -1):
        out.append(s[i])
    return "".join(out)`,
      java: `public String reverseString(String s) {
    StringBuilder out = new StringBuilder();
    for (int i = s.length() - 1; i >= 0; i--) {
        out.append(s.charAt(i));
    }
    return out.toString();
}`,
      cpp: `string reverseString(string s) {
    string out;
    for (int i = (int)s.size() - 1; i >= 0; i--) {
        out += s[i];
    }
    return out;
}`,
    },
  ],
}
