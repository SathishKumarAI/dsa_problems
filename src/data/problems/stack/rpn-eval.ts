import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "rpn-eval",
  title: "Evaluate Reverse Polish Notation",
  pattern: "stack",
  difficulty: "medium",
  leetcode: "evaluate-reverse-polish-notation",
  brief: "Evaluate an expression written operator-last.",
  statement:
    "Given an arithmetic expression in reverse Polish notation as a list of tokens, evaluate it and return the result. Each token is either an integer or one of +, -, * and /, and division truncates toward zero.",
  constraints: [
    "1 <= tokens.length <= 10^4",
    "each token is an operator or an integer in the range -200 to 200",
    "the expression is always valid, so an operator always has two operands waiting",
    "division truncates toward zero, so -7 / 2 is -3 and not -4",
  ],
  examples: [
    {
      input: 'tokens = ["2", "1", "+", "3", "*"]',
      output: "9",
      note: "(2 + 1) * 3.",
    },
    {
      input: 'tokens = ["4", "13", "5", "/", "+"]',
      output: "6",
      note: "4 + (13 / 5) = 4 + 2.",
    },
  ],
  hints: [
    "An operator in this notation always applies to the two values immediately before it. Which structure hands you the two most recent things?",
    "Push numbers. On an operator, pop two, combine, push the result back.",
    "Order matters for - and /: the value popped SECOND is the left operand.",
  ],
  whyNow:
    "Rebuilding a tree makes the nesting explicit, then immediately throws that structure away after one traversal. The stack is that traversal — the operands an operator needs are always the two most recently finished values, which is exactly what a stack holds.",
  approach:
    "Read the tokens left to right. A number is pushed. An operator pops the top two values — the first popped is the RIGHT operand, the second is the left — applies itself, and pushes the result. Because the expression is valid, an operator always finds two values, and the single value left at the end is the answer. Truncation toward zero is the one place the languages disagree, so it is worth writing deliberately rather than relying on the default.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def eval_rpn(tokens: list[str]) -> int:
    stack = []
    for tok in tokens:
        if tok in ("+", "-", "*", "/"):
            right = stack.pop()
            left = stack.pop()
            if tok == "+":
                stack.append(left + right)
            elif tok == "-":
                stack.append(left - right)
            elif tok == "*":
                stack.append(left * right)
            else:
                stack.append(int(left / right))
        else:
            stack.append(int(tok))
    return stack[-1]`,
  java: `public int evalRPN(String[] tokens) {
    Deque<Integer> stack = new ArrayDeque<>();
    for (String tok : tokens) {
        if (tok.equals("+") || tok.equals("-") || tok.equals("*") || tok.equals("/")) {
            int right = stack.pop();
            int left = stack.pop();
            if (tok.equals("+")) stack.push(left + right);
            else if (tok.equals("-")) stack.push(left - right);
            else if (tok.equals("*")) stack.push(left * right);
            else stack.push(left / right);
        } else {
            stack.push(Integer.parseInt(tok));
        }
    }
    return stack.peek();
}`,
  cpp: `int evalRPN(const vector<string>& tokens) {
    vector<int> stack;
    for (const string& tok : tokens) {
        if (tok == "+" || tok == "-" || tok == "*" || tok == "/") {
            int right = stack.back();
            stack.pop_back();
            int left = stack.back();
            stack.pop_back();
            if (tok == "+") stack.push_back(left + right);
            else if (tok == "-") stack.push_back(left - right);
            else if (tok == "*") stack.push_back(left * right);
            else stack.push_back(left / right);
        } else {
            stack.push_back(stoi(tok));
        }
    }
    return stack.back();
}`,
  alternatives: [
    {
      name: "Rewrite in place",
      summary:
        "Scan the list for the first operator, replace it and the two tokens before it with their result, and repeat until a single token remains.",
      complexity: { time: "O(n²)", space: "O(n)" },
      python: `def eval_rpn(tokens: list[str]) -> int:
    items = list(tokens)
    while len(items) > 1:
        i = 0
        while items[i] not in ("+", "-", "*", "/"):
            i += 1
        left = int(items[i - 2])
        right = int(items[i - 1])
        op = items[i]
        if op == "+":
            value = left + right
        elif op == "-":
            value = left - right
        elif op == "*":
            value = left * right
        else:
            value = int(left / right)
        items[i - 2 : i + 1] = [str(value)]
    return int(items[0])`,
      java: `public int evalRPN(String[] tokens) {
    List<String> items = new ArrayList<>(Arrays.asList(tokens));
    while (items.size() > 1) {
        int i = 0;
        while (!items.get(i).equals("+") && !items.get(i).equals("-")
                && !items.get(i).equals("*") && !items.get(i).equals("/")) {
            i++;
        }
        int left = Integer.parseInt(items.get(i - 2));
        int right = Integer.parseInt(items.get(i - 1));
        String op = items.get(i);
        int value;
        if (op.equals("+")) value = left + right;
        else if (op.equals("-")) value = left - right;
        else if (op.equals("*")) value = left * right;
        else value = left / right;
        items.subList(i - 2, i + 1).clear();
        items.add(i - 2, String.valueOf(value));
    }
    return Integer.parseInt(items.get(0));
}`,
      cpp: `int evalRPN(const vector<string>& tokens) {
    vector<string> items = tokens;
    while (items.size() > 1) {
        size_t i = 0;
        while (items[i] != "+" && items[i] != "-" && items[i] != "*" && items[i] != "/") {
            i++;
        }
        int left = stoi(items[i - 2]);
        int right = stoi(items[i - 1]);
        string op = items[i];
        int value = 0;
        if (op == "+") value = left + right;
        else if (op == "-") value = left - right;
        else if (op == "*") value = left * right;
        else value = left / right;
        items.erase(items.begin() + (i - 2), items.begin() + (i + 1));
        items.insert(items.begin() + (i - 2), to_string(value));
    }
    return stoi(items[0]);
}`,
    },
  ],
}
