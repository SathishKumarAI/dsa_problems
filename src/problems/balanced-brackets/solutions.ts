// The ladder: every way into this problem, worst first, each rung carrying the
// weakness in the one below it.
//
// `alternatives` is worst -> best and the KEYS are load-bearing. `delete` is the
// same rung as the journey's `delete` act, so `lib/ladder.ts` merges them; the
// act wins and this record supplies the ladder metadata an act has no field
// for. `counter` has no act, so it joins the ladder above the optimal as an
// aside — a variant argued against the answer rather than a step toward it.
//
// Two arcs, and they are not duplicates. The one here is the short closing
// paragraph the PROBLEM page renders under the ladder; `arc.ts` holds the long
// one the teaching document ends on. Changing either does not oblige the other.

import type { Code, Solution } from "../../data/types.ts"

export const approach =
  "Scan once. Push each opening bracket. For each closing bracket, the stack must be non-empty and its top must be the corresponding opener — otherwise the string is invalid. After the scan the stack must be empty, or some opener was never closed."

export const whyNow =
  "Deleting matched pairs rescans the whole string after every deletion. A stack remembers what is still open as you go, so one pass decides it."

export const complexity = { time: "O(n)", space: "O(n)" }

export const arc =
  "The canonical stack problem, and the reason it is canonical is the shape of the rule: a closing bracket must match the MOST RECENT unmatched opening one, which is the definition of last-in-first-out. Once seen that way, the repeated-replace rung reads as what it is — an expensive simulation of popping. Three failure modes are the whole test suite: a closer with an empty stack, a closer that mismatches the top, and a non-empty stack at the end. Rehearse all three, because two of them are easy to forget and both make a wrong answer look right on the happy path. Every nesting problem after this one — decode-string, basic calculator with parentheses, valid parenthesis string — is this rule with payload added."

/** the optimal: one pass, a stack of the openers still unmatched */
export const code: Code = {
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
}

export const alternatives: Solution[] = [
  {
    key: "delete",
    name: "Repeated replace",
    costWhy:
      "O(n\u00b2) time and O(n) space. Each pass deletes the innermost matching pairs and starts again, and a string like ((((\u2026)))) removes only one pair per pass \u2014 so n/2 passes over a string of length n, about 5\u00b710\u2077 character reads at the ceiling. The space is the new string each pass builds. It is on the page because it is genuinely the first idea most people have, and because seeing the rescan is what motivates carrying the unclosed openers instead.",
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
  {
    key: "counter",
    name: "Single counter",
    costWhy:
      "O(n) time and O(1) space \u2014 the best bounds on this page, and WRONG for this problem, which is why it is here. A counter that rises on an opener and falls on a closer validates one bracket type perfectly and cannot see type at all: ([)] keeps every count non-negative and balanced. The lesson is that a cheaper bound is not an answer unless it computes the right thing, and the constraint that kills it is the one naming the most recent unclosed opener.",
    summary:
      'Drop the stack for one integer: an opener is one level deeper, a closer one level back up, and the string is well-formed if the depth never goes negative and ends at zero. Constant space — and correct ONLY when the alphabet is a single bracket kind, because a count stores depth but not identity, so it accepts "(]" and "([)]" without noticing.',
    whyNow:
      "The stack holds one entry per unmatched opener, so its space is the nesting depth. Narrow the alphabet to one kind of bracket and every opener is interchangeable — you no longer need to know WHICH one is on top, only how many are open — and the whole structure collapses to a single integer. What it costs is the ability to detect a closer of the wrong kind at all.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def is_balanced(s: str) -> bool:
    """Correct ONLY when s uses a single bracket kind: depth has no identity."""
    depth = 0
    for ch in s:
        if ch in "([{":
            depth += 1
        else:
            depth -= 1
            if depth < 0:  # a closer with nothing open
                return False
    return depth == 0  # an opener never closed`,
    java: `public boolean isBalanced(String s) {
    // Correct ONLY when s uses a single bracket kind: depth has no identity.
    int depth = 0;
    for (int i = 0; i < s.length(); i++) {
        char ch = s.charAt(i);
        if (ch == '(' || ch == '[' || ch == '{') {
            depth++;
        } else {
            depth--;
            if (depth < 0) return false;
        }
    }
    return depth == 0;
}
`,
    cpp: `bool isBalanced(const string& s) {
    // Correct ONLY when s uses a single bracket kind: depth has no identity.
    int depth = 0;
    for (char ch : s) {
        if (ch == '(' || ch == '[' || ch == '{') {
            depth++;
        } else {
            depth--;
            if (depth < 0) return false;
        }
    }
    return depth == 0;
}
`,
  },
]

// HOW THE TARGET BOUND WAS COUNTED. Each rung carries its own.
export const costWhy =
  "One pass over n characters, O(n) time: each character is pushed at most once and popped at most once, so the total stack work is bounded by 2n however deeply the string nests. Everything inside the loop is constant \u2014 a table lookup for the matching opener and a comparison. The O(n) space is the stack, and the worst case is real rather than theoretical: a string of n opening brackets holds all n of them before anything closes. That is the honest trade against the counter rung, which uses O(1) space and cannot answer the question for more than one bracket type."
