import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "balanced-brackets",
  title: "Balanced Brackets",
  pattern: "stack",
  difficulty: "easy",
  leetcode: "valid-parentheses",
  brief: "Is every bracket opened and closed in the right order?",
  statement:
    "Given a string of the characters ()[]{} only, decide whether it is well-formed: every opener has a matching closer of the same kind, closed in last-opened-first-closed order.",
  constraints: [
    "1 <= s.length <= 10^4",
    "s holds only the six characters ()[]{}",
    "every closer must match the most recent unclosed opener",
  ],
  examples: [
    { input: 's = "([{}])"', output: "true" },
    { input: 's = "(]"', output: "false" },
    { input: 's = "("', output: "false", note: "Unclosed opener left over." },
  ],
  hints: [
    '"Last opened, first closed" is the literal definition of a stack.',
    "Push openers. On a closer, the top of the stack must be its partner.",
    "Two failure modes: mismatch mid-string, and a non-empty stack at the end.",
  ],
  whyNow:
    "Deleting matched pairs rescans the whole string after every deletion. A stack remembers what is still open as you go, so one pass decides it.",
  arc: "The canonical stack problem, and the reason it is canonical is the shape of the rule: a closing bracket must match the MOST RECENT unmatched opening one, which is the definition of last-in-first-out. Once seen that way, the repeated-replace rung reads as what it is — an expensive simulation of popping. Three failure modes are the whole test suite: a closer with an empty stack, a closer that mismatches the top, and a non-empty stack at the end. Rehearse all three, because two of them are easy to forget and both make a wrong answer look right on the happy path. Every nesting problem after this one — decode-string, basic calculator with parentheses, valid parenthesis string — is this rule with payload added.",
  approach:
    "Scan once. Push each opening bracket. For each closing bracket, the stack must be non-empty and its top must be the corresponding opener — otherwise the string is invalid. After the scan the stack must be empty, or some opener was never closed.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def is_balanced(s: str) -> bool:
    partner = {")": "(", "]": "[", "}": "{"}
    st: list[str] = []
    for ch in s:
        if ch in partner:
            if not st or st.pop() != partner[ch]:
                return False
        else:
            st.append(ch)
    return not st`,
  java: `public boolean isBalanced(String s) {
    Map<Character, Character> partner = new HashMap<>();
    partner.put(')', '(');
    partner.put(']', '[');
    partner.put('}', '{');
    List<Character> st = new ArrayList<>();
    for (int i = 0; i < s.length(); i++) {
        char ch = s.charAt(i);
        if (partner.containsKey(ch)) {
            if (st.isEmpty() || st.remove(st.size()-1) != partner.get(ch))
                return false;
        } else {
            st.add(ch);
        }
    }
    return st.isEmpty();
}
`,
  cpp: `bool isBalanced(const string& s) {
    unordered_map<char, char> partner{{')','('},{']','['},{'}','{'}};
    vector<char> st;
    for (char ch : s) {
        auto it = partner.find(ch);
        if (it != partner.end()) {
            if (st.empty() || st.back() != it->second) return false;
            st.pop_back();
        } else {
            st.push_back(ch);
        }
    }
    return st.empty();
}
`,
  alternatives: [
    {
      name: "Repeated replace",
      summary:
        'Keep deleting adjacent matched pairs ("()", "[]", "{}") until nothing changes; valid iff empty. Cute one-liner logic, quadratic runtime — good to know why it\'s worse, not to use.',
      complexity: { time: "O(n²)", space: "O(n)" },
      python: `def is_balanced(s: str) -> bool:
    prev = None
    while prev != s:
        prev = s
        s = s.replace("()", "").replace("[]", "").replace("{}", "")
    return s == ""`,
      java: `public boolean isBalanced(String s) {
    String prev;
    do {
        prev = s;
        s = s.replace("()", "").replace("[]", "").replace("{}", "");
    } while (!prev.equals(s));
    return s.isEmpty();
}`,
      cpp: `bool isBalanced(const string& input) {
    string s = input;
    string prev;
    do {
        prev = s;
        size_t pos;
        while ((pos = s.find("()")) != string::npos) s.erase(pos, 2);
        while ((pos = s.find("[]")) != string::npos) s.erase(pos, 2);
        while ((pos = s.find("{}")) != string::npos) s.erase(pos, 2);
    } while (prev != s);
    return s.empty();
}`,
    },
  ],
}
