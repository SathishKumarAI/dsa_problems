import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "calculator-basic",
  title: "Evaluate + − × ÷ Without Parentheses",
  pattern: "stack",
  difficulty: "medium",
  leetcode: "basic-calculator-ii",
  brief: "Evaluate an arithmetic string honouring precedence, with integer division truncated toward zero.",
  statement:
    "Given a string holding non-negative integers and the operators +, -, * and /, evaluate it. Multiplication and division bind tighter than addition and subtraction, division truncates toward zero, and spaces may appear anywhere.",
  constraints: [
    "1 <= length <= 3 · 10^5, and the expression is always valid",
    "numbers may be multi-digit, so a character is not a token",
    "spaces may sit anywhere, including between a number's digits and its operator",
    "* and / bind tighter than + and -, so the expression cannot be folded strictly left to right",
    "division truncates TOWARD ZERO, which differs from Python's floor division the moment the left side is negative",
  ],
  examples: [
    { input: 's = "3+2*2"', output: "7", note: "The multiplication happens first." },
    {
      input: 's = " 3/2 "',
      output: "1",
      note: "Truncation, not rounding — and the spaces are noise.",
    },
    {
      input: 's = "1-5/2"',
      output: "-1",
      note: "The corner case: the term being divided carries the minus with it, so the division is -5 / 2 = -2 (toward zero), not -3.",
    },
    { input: 's = " 3+5 / 2 "', output: "5" },
  ],
  hints: [
    "Precedence with only two levels has a shape: the expression is a SUM of terms, and each term is a product or quotient chain.",
    "So carry a running total and the value of the term currently being built. A + or - closes the term and starts a new one.",
    "A * or / does not close anything — it modifies the term in progress, which is why the last term has to stay reachable.",
  ],
  whyNow:
    "The stack holds one number per term and then adds them all up, which is a second pass over data the first pass already had — and for a long sum it is a list whose only use is being summed. The only entry the algorithm ever touches is the top one, so keeping the running total and the last term in two integers does the same work with constant memory, and the sum falls out as the walk ends.",
  arc:
    "Precedence with two levels has a shape you can hold in your head: the expression is a sum of terms, and * and / build a term while + and - close one. Once that is said, the ladder is just how much of the expression you keep in memory — two passes over materialised tokens, a stack holding one number per term, or two integers holding the total and the term in progress. The stack version is the one to write first in an interview because it generalises: add parentheses and the stack starts holding the enclosing state rather than just numbers, which is exactly Basic Calculator III. The detail that bites is division. Truncation toward zero and floor division differ the moment the left side is negative, and the term carrying a minus sign is what makes that happen here.",
  approach:
    "One pass with two numbers: the total of the terms already closed, and the value of the term in progress. Read a full number, then look at the operator that preceded it — for + or -, close the current term into the total and start a new one with the sign; for * or /, fold the number straight into the term in progress. At the end, close the last term. Division is done by dividing magnitudes and reapplying the sign, which is truncation toward zero in every language.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def evaluate_expression(s: str) -> int:
    def trunc_div(a: int, b: int) -> int:
        q = abs(a) // abs(b)
        return q if (a < 0) == (b < 0) else -q

    total = 0
    term = 0
    op = "+"
    i = 0
    while i < len(s):
        ch = s[i]
        if ch.isdigit():
            value = 0
            while i < len(s) and s[i].isdigit():
                value = value * 10 + int(s[i])
                i += 1
            if op == "+":
                total += term
                term = value
            elif op == "-":
                total += term
                term = -value
            elif op == "*":
                term *= value
            else:
                term = trunc_div(term, value)
            continue
        if ch != " ":
            op = ch
        i += 1
    return total + term`,
  java: `public int evaluateExpression(String s) {
    int total = 0, term = 0;
    char op = '+';
    int i = 0;
    while (i < s.length()) {
        char ch = s.charAt(i);
        if (Character.isDigit(ch)) {
            int value = 0;
            while (i < s.length() && Character.isDigit(s.charAt(i))) {
                value = value * 10 + (s.charAt(i) - '0');
                i++;
            }
            if (op == '+') { total += term; term = value; }
            else if (op == '-') { total += term; term = -value; }
            else if (op == '*') { term *= value; }
            else { term /= value; }
            continue;
        }
        if (ch != ' ') op = ch;
        i++;
    }
    return total + term;
}`,
  cpp: `int evaluateExpression(string s) {
    int total = 0, term = 0;
    char op = '+';
    int i = 0;
    while (i < (int)s.size()) {
        char ch = s[i];
        if (ch >= '0' && ch <= '9') {
            int value = 0;
            while (i < (int)s.size() && s[i] >= '0' && s[i] <= '9') {
                value = value * 10 + (s[i] - '0');
                i++;
            }
            if (op == '+') { total += term; term = value; }
            else if (op == '-') { total += term; term = -value; }
            else if (op == '*') { term *= value; }
            else { term /= value; }
            continue;
        }
        if (ch != ' ') op = ch;
        i++;
    }
    return total + term;
}`,
  walkthrough: [
    {
      cells: {
        values: [3, "+", 2, "*", 2],
        marks: { 0: "focus" },
        labels: { 0: "term = 3" },
      },
      caption:
        'Reading "3+2*2". The first number opens a term: total 0, term 3, and the pending operator is the implicit +.',
    },
    {
      cells: {
        values: [3, "+", 2, "*", 2],
        marks: { 0: "done", 1: "compare", 2: "focus" },
        labels: { 2: "term = 2" },
      },
      caption:
        "The + closes the term: total becomes 3 and a new term opens at 2. Addition is the only thing that ever moves a term into the total.",
    },
    {
      cells: {
        values: [3, "+", 2, "*", 2],
        marks: { 2: "window", 3: "compare", 4: "focus" },
        labels: { 4: "term = 4" },
      },
      caption:
        "The * does NOT close anything — it folds the next number into the term in progress: 2 × 2 = 4. That is precedence, expressed as which variable gets touched.",
    },
    {
      cells: {
        values: [3, "+", 2, "*", 2],
        marks: { 0: "done", 2: "done", 4: "done" },
        labels: { 4: "3 + 4" },
      },
      caption: "At the end the open term is closed: 3 + 4 = 7.",
    },
    {
      cells: {
        values: [1, "-", 5, "/", 2],
        marks: { 2: "compare", 4: "focus" },
        labels: { 2: "term = -5" },
      },
      caption:
        'The corner case "1-5/2": the minus makes the open term -5, so the division is -5 / 2. Truncating toward zero gives -2 and the answer -1; flooring would give -3 and the answer -2.',
    },
  ],
  alternatives: [
    {
      name: "Two passes over the tokens",
      summary:
        "Tokenise the string into numbers and operators, sweep once collapsing every * and / into their left operand, then add and subtract what is left.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def evaluate_expression(s: str) -> int:
    def trunc_div(a: int, b: int) -> int:
        q = abs(a) // abs(b)
        return q if (a < 0) == (b < 0) else -q

    tokens: list[object] = []
    i = 0
    while i < len(s):
        if s[i].isdigit():
            value = 0
            while i < len(s) and s[i].isdigit():
                value = value * 10 + int(s[i])
                i += 1
            tokens.append(value)
            continue
        if s[i] != " ":
            tokens.append(s[i])
        i += 1

    folded: list[object] = []
    i = 0
    while i < len(tokens):
        token = tokens[i]
        if token == "*" or token == "/":
            left = folded.pop()
            right = tokens[i + 1]
            folded.append(left * right if token == "*" else trunc_div(left, right))
            i += 2
            continue
        folded.append(token)
        i += 1

    total = folded[0]
    i = 1
    while i < len(folded):
        if folded[i] == "+":
            total += folded[i + 1]
        else:
            total -= folded[i + 1]
        i += 2
    return total`,
      java: `public int evaluateExpression(String s) {
    List<Integer> numbers = new ArrayList<>();
    List<Character> ops = new ArrayList<>();
    int i = 0;
    while (i < s.length()) {
        char ch = s.charAt(i);
        if (Character.isDigit(ch)) {
            int value = 0;
            while (i < s.length() && Character.isDigit(s.charAt(i))) {
                value = value * 10 + (s.charAt(i) - '0');
                i++;
            }
            numbers.add(value);
            continue;
        }
        if (ch != ' ') ops.add(ch);
        i++;
    }
    List<Integer> folded = new ArrayList<>();
    List<Character> rest = new ArrayList<>();
    folded.add(numbers.get(0));
    for (int k = 0; k < ops.size(); k++) {
        char op = ops.get(k);
        int right = numbers.get(k + 1);
        if (op == '*' || op == '/') {
            int left = folded.remove(folded.size() - 1);
            folded.add(op == '*' ? left * right : left / right);
        } else {
            rest.add(op);
            folded.add(right);
        }
    }
    int total = folded.get(0);
    for (int k = 0; k < rest.size(); k++)
        total = rest.get(k) == '+' ? total + folded.get(k + 1) : total - folded.get(k + 1);
    return total;
}`,
      cpp: `int evaluateExpression(string s) {
    vector<int> numbers;
    vector<char> ops;
    int i = 0;
    while (i < (int)s.size()) {
        char ch = s[i];
        if (ch >= '0' && ch <= '9') {
            int value = 0;
            while (i < (int)s.size() && s[i] >= '0' && s[i] <= '9') {
                value = value * 10 + (s[i] - '0');
                i++;
            }
            numbers.push_back(value);
            continue;
        }
        if (ch != ' ') ops.push_back(ch);
        i++;
    }
    vector<int> folded{numbers[0]};
    vector<char> rest;
    for (int k = 0; k < (int)ops.size(); k++) {
        char op = ops[k];
        int right = numbers[k + 1];
        if (op == '*' || op == '/') {
            int left = folded.back();
            folded.pop_back();
            folded.push_back(op == '*' ? left * right : left / right);
        } else {
            rest.push_back(op);
            folded.push_back(right);
        }
    }
    int total = folded[0];
    for (int k = 0; k < (int)rest.size(); k++)
        total = rest[k] == '+' ? total + folded[k + 1] : total - folded[k + 1];
    return total;
}`,
    },
    {
      name: "A stack of terms",
      summary:
        "One pass, pushing each number as its own term: a + pushes it, a - pushes its negation, and a * or / pops the top, combines, and pushes the result. The answer is the sum of the stack.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "Two passes means the tokens are materialised, walked, rewritten and walked again — three lists for an expression that is read once. Precedence only ever needs the term most recently pushed, so a single pass can do the folding the second pass was doing, at the moment the operator is read.",
      python: `def evaluate_expression(s: str) -> int:
    def trunc_div(a: int, b: int) -> int:
        q = abs(a) // abs(b)
        return q if (a < 0) == (b < 0) else -q

    terms: list[int] = []
    op = "+"
    i = 0
    while i < len(s):
        ch = s[i]
        if ch.isdigit():
            value = 0
            while i < len(s) and s[i].isdigit():
                value = value * 10 + int(s[i])
                i += 1
            if op == "+":
                terms.append(value)
            elif op == "-":
                terms.append(-value)
            elif op == "*":
                terms.append(terms.pop() * value)
            else:
                terms.append(trunc_div(terms.pop(), value))
            continue
        if ch != " ":
            op = ch
        i += 1
    return sum(terms)`,
      java: `public int evaluateExpression(String s) {
    Deque<Integer> terms = new ArrayDeque<>();
    char op = '+';
    int i = 0;
    while (i < s.length()) {
        char ch = s.charAt(i);
        if (Character.isDigit(ch)) {
            int value = 0;
            while (i < s.length() && Character.isDigit(s.charAt(i))) {
                value = value * 10 + (s.charAt(i) - '0');
                i++;
            }
            if (op == '+') terms.push(value);
            else if (op == '-') terms.push(-value);
            else if (op == '*') terms.push(terms.pop() * value);
            else terms.push(terms.pop() / value);
            continue;
        }
        if (ch != ' ') op = ch;
        i++;
    }
    int total = 0;
    for (int term : terms) total += term;
    return total;
}`,
      cpp: `int evaluateExpression(string s) {
    vector<int> terms;
    char op = '+';
    int i = 0;
    while (i < (int)s.size()) {
        char ch = s[i];
        if (ch >= '0' && ch <= '9') {
            int value = 0;
            while (i < (int)s.size() && s[i] >= '0' && s[i] <= '9') {
                value = value * 10 + (s[i] - '0');
                i++;
            }
            if (op == '+') {
                terms.push_back(value);
            } else if (op == '-') {
                terms.push_back(-value);
            } else if (op == '*') {
                int left = terms.back();
                terms.pop_back();
                terms.push_back(left * value);
            } else {
                int left = terms.back();
                terms.pop_back();
                terms.push_back(left / value);
            }
            continue;
        }
        if (ch != ' ') op = ch;
        i++;
    }
    int total = 0;
    for (int term : terms) total += term;
    return total;
}`,
    },
  ],
}
