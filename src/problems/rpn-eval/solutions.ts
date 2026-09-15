// rpn-eval — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The KEYS on
// `alternatives` are load-bearing where a journey exists: `lib/ladder.ts`
// merges an alternative with the act that shares its key, and `from:` in the
// journey must then name that key rather than an array index.
//
// Two arcs, and they are not duplicates. The one here is the short paragraph
// the PROBLEM page renders under the ladder; `arc.ts` holds the long one the
// teaching document ends on. Changing either does not oblige the other.

import type { Solution } from "../../data/types.ts"

export const approach = "Read the tokens left to right. A number is pushed. An operator pops the top two values — the first popped is the RIGHT operand, the second is the left — applies itself, and pushes the result. Because the expression is valid, an operator always finds two values, and the single value left at the end is the answer. Truncation toward zero is the one place the languages disagree, so it is worth writing deliberately rather than relying on the default."

export const whyNow = "Rebuilding a tree makes the nesting explicit, then immediately throws that structure away after one traversal. The stack is that traversal — the operands an operator needs are always the two most recently finished values, which is exactly what a stack holds."

export const arc = "Postfix exists precisely so that no precedence rules and no parentheses are needed, and the stack is what makes that true: operands wait, an operator consumes the two most recent, and the result takes their place. The lesson to carry is about ORDER for non-commutative operators — the first value popped is the right operand — because subtraction and division silently produce plausible wrong answers when that is reversed. Rehearse integer division truncating toward zero as well, since languages disagree there. Knowing this and the shunting-yard idea that converts infix to postfix covers most expression questions without having to write a parser."

export const complexity = { time: "O(n)", space: "O(n)" }

export const python = `def eval_rpn(tokens: list[str]) -> int:
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
    return stack[-1]`

export const java = `public int evalRPN(String[] tokens) {
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
}`

export const cpp = `int evalRPN(const vector<string>& tokens) {
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
}`

export const alternatives: Solution[] = [
  {
    key: "rewrite",
    name: "Rewrite in place",
    summary:
      "Scan the token list for the first operator, replace it and the two tokens before it with their result, and repeat until one token remains. Correct, and it needs no stack to explain, and every replacement re-scans from the front and shifts the rest of the list, so the work is quadratic in the number of tokens.",
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
  // B79. The document reaches the stack through this rung and the page could
  // not name it. It is the one to REJECT, and knowing why is the point: it
  // makes the nesting explicit by building it, then throws the structure away
  // after a single traversal. Build a tree when you need the tree for
  // something else — printing the expression back as infix, simplifying it,
  // evaluating it more than once. For one value it allocates a node per token
  // and recurses as deep as the expression leans.
  {
    key: "tree",
    after: "rewrite",
    name: "Build the expression tree, then evaluate it",
    whyNow:
      "Rewriting the list in place re-scans from the front and shifts the tail on every replacement, so the work is quadratic in the token count. Reading the tokens once into a tree makes the nesting explicit instead of rediscovering it, and turns evaluation into a single walk.",
    summary:
      "Read from the RIGHT: the last token is the root, and an operator's right operand is whatever sits immediately before it, so a recursive build consumes the list backwards and hands back the index just left of each subtree. Evaluating is then a post-order walk. Linear in both passes, and it pays a node per token plus a recursion that reaches n on a left-leaning expression like `1 2 3 4 + + +` — a real stack-overflow risk at the stated 10,000 tokens, and the reason the stack rung below is the answer.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `def eval_rpn(tokens: list[str]) -> int:
    class Node:  # scaffolding for this rung only
        def __init__(self, token, left=None, right=None):
            self.token, self.left, self.right = token, left, right

    ops = ("+", "-", "*", "/")

    def build(i):
        """The subtree ending at i, and the index just left of it."""
        tok = tokens[i]
        if tok not in ops:
            return Node(tok), i - 1
        right, after_right = build(i - 1)  # the right operand is adjacent
        left, after_left = build(after_right)
        return Node(tok, left, right), after_left

    def evaluate(node):
        if node.left is None:  # a leaf, so the token is a number
            return int(node.token)
        a, b = evaluate(node.left), evaluate(node.right)
        if node.token == "+":
            return a + b
        if node.token == "-":
            return a - b
        if node.token == "*":
            return a * b
        return int(a / b)  # truncate toward zero, not floor

    root, _ = build(len(tokens) - 1)
    return evaluate(root)`,
    java: `public int evalRPN(String[] tokens) {
    int[] cursor = { tokens.length - 1 };
    return evaluate(build(tokens, cursor));
}

private static class ExprNode {
    String token;
    ExprNode left, right;
    ExprNode(String token) { this.token = token; }
}

private boolean isOp(String t) {
    return t.equals("+") || t.equals("-") || t.equals("*") || t.equals("/");
}

private ExprNode build(String[] tokens, int[] cursor) {
    String tok = tokens[cursor[0]--];
    ExprNode node = new ExprNode(tok);
    if (isOp(tok)) {
        node.right = build(tokens, cursor);  // the right operand is adjacent
        node.left = build(tokens, cursor);
    }
    return node;
}

private int evaluate(ExprNode node) {
    if (node.left == null) return Integer.parseInt(node.token);
    int a = evaluate(node.left), b = evaluate(node.right);
    if (node.token.equals("+")) return a + b;
    if (node.token.equals("-")) return a - b;
    if (node.token.equals("*")) return a * b;
    return a / b;
}`,
    cpp: `struct ExprNode {
    string token;
    ExprNode* left = nullptr;
    ExprNode* right = nullptr;
    ExprNode(const string& t) : token(t) {}
};

static bool isOp(const string& t) {
    return t == "+" || t == "-" || t == "*" || t == "/";
}

static ExprNode* buildExpr(const vector<string>& tokens, int& cursor) {
    string tok = tokens[cursor--];
    ExprNode* node = new ExprNode(tok);
    if (isOp(tok)) {
        node->right = buildExpr(tokens, cursor);  // the right operand is adjacent
        node->left = buildExpr(tokens, cursor);
    }
    return node;
}

static int evaluateExpr(const ExprNode* node) {
    if (!node->left) return stoi(node->token);
    int a = evaluateExpr(node->left), b = evaluateExpr(node->right);
    if (node->token == "+") return a + b;
    if (node->token == "-") return a - b;
    if (node->token == "*") return a * b;
    return a / b;
}

int evalRPN(const vector<string>& tokens) {
    int cursor = (int)tokens.size() - 1;
    return evaluateExpr(buildExpr(tokens, cursor));
}`,
  },
]
