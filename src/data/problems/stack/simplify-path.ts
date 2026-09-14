import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "simplify-path",
  title: "Reduce a Unix Path to Its Canonical Form",
  pattern: "stack",
  difficulty: "medium",
  leetcode: "simplify-path",
  brief:
    "Resolve '.', '..' and repeated slashes into the one canonical absolute path.",
  statement:
    "Given an absolute Unix-style path, return its canonical form: one leading slash, single slashes between names, no trailing slash, no '.' components, and every '..' consuming the directory before it.",
  constraints: [
    "1 <= path length <= 3000, and the path always starts with '/'",
    "components are separated by slashes and may repeat them — '//' and '///' mean the same as '/'",
    "'.' means 'this directory' and disappears; '..' means 'the parent' and removes the component before it",
    "'..' at the root has nothing to remove and is simply dropped — the root is its own parent",
    "a name may contain dots without being special: '...' and '..a' are ordinary directory names",
  ],
  examples: [
    {
      input: 'path = "/home/"',
      output: '"/home"',
      note: "The trailing slash goes.",
    },
    {
      input: 'path = "/a/./b/../../c/"',
      output: '"/c"',
      note: "'.' drops, then two '..' undo b and a in turn.",
    },
    {
      input: 'path = "/../"',
      output: '"/"',
      note: "The corner case: '..' at the root removes nothing, and the answer is the root itself.",
    },
    {
      input: 'path = "/a/.../b"',
      output: '"/a/.../b"',
      note: "'...' is a perfectly ordinary name — only exactly '.' and exactly '..' are special.",
    },
  ],
  hints: [
    "Split on '/' first. Every interesting rule is about a single component, and splitting makes the empty components from '//' fall out for free.",
    "Three cases per component: '' or '.' changes nothing, '..' undoes the last kept component, anything else is kept.",
    "'Undo the last kept thing' is a pop. The structure is a stack and the answer is what is left in it, joined by slashes.",
  ],
  whyNow:
    "Scanning from the right with a counter of pending '..' is linear, but it builds the answer backwards and has to be reversed, and the counter has to be reasoned about at the root where a '..' expires with nothing to cancel. Left to right with a stack is the same linear cost while saying the rule literally — keep a name, pop on '..', ignore the rest — and 'pop from empty' is exactly the root case, handled by a single guard.",
  arc: "The first move is not an algorithm: split on the separator. Half the difficulty of path problems is that a character-by-character reading has to invent rules for '//' and for a name that merely contains dots, while a component-by-component reading gets those for free. What is left is three cases and a structure — and 'undo the previous thing I kept' is the definition of a stack, which is why this problem sits in the pattern at all. The corner case is the one worth rehearsing: a pop on an empty stack. Here it is legal and means 'the root is its own parent', so a guard turns it into a no-op; in other stack problems the same situation means the input is malformed. Decide which, out loud, before you write the pop.",
  approach:
    "Split the path on '/', which turns repeated slashes into empty components. Walk the components left to right against a stack: an empty component or '.' is skipped, '..' pops the stack when it has something to pop, and any other name is pushed. The answer is '/' plus the stack joined by slashes — which is the root itself when the stack ends up empty. One pass, one structure, and each rule is one line.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def simplify_path(path: str) -> str:
    keep: list[str] = []
    for part in path.split("/"):
        if part == "" or part == ".":
            continue                  # '//' and '.' change nothing
        if part == "..":
            if keep:
                keep.pop()            # at the root there is nothing to undo
            continue
        keep.append(part)
    return "/" + "/".join(keep)`,
  java: `public String simplifyPath(String path) {
    Deque<String> keep = new ArrayDeque<>();
    for (String part : path.split("/")) {
        if (part.isEmpty() || part.equals(".")) continue;
        if (part.equals("..")) {
            if (!keep.isEmpty()) keep.removeLast();
            continue;
        }
        keep.addLast(part);
    }
    StringBuilder out = new StringBuilder();
    for (String part : keep) out.append('/').append(part);
    return out.length() == 0 ? "/" : out.toString();
}`,
  cpp: `string simplifyPath(string path) {
    vector<string> keep;
    string part;
    path.push_back('/');
    for (char ch : path) {
        if (ch != '/') {
            part.push_back(ch);
            continue;
        }
        if (part.empty() || part == ".") {
            part.clear();
            continue;
        }
        if (part == "..") {
            if (!keep.empty()) keep.pop_back();
            part.clear();
            continue;
        }
        keep.push_back(part);
        part.clear();
    }
    string out;
    for (const string& name : keep) out += "/" + name;
    return out.empty() ? "/" : out;
}`,
  walkthrough: [
    {
      cells: {
        values: ["a", ".", "b", "..", "..", "c"],
        marks: { 0: "focus" },
        labels: { 0: "push" },
      },
      caption:
        '"/a/./b/../../c/" split on slashes, with the empty pieces dropped. The first component is an ordinary name: push it.',
    },
    {
      cells: {
        values: ["a", ".", "b", "..", "..", "c"],
        marks: { 0: "done", 1: "compare", 2: "focus" },
        labels: { 1: "skip", 2: "push" },
      },
      caption:
        "'.' is skipped — it names the directory you are already in — and 'b' is pushed. The stack holds [a, b].",
    },
    {
      cells: {
        values: ["a", ".", "b", "..", "..", "c"],
        marks: { 2: "compare", 3: "focus" },
        labels: { 3: "pop b" },
      },
      caption: "The first '..' pops the most recent name. The stack holds [a].",
    },
    {
      cells: {
        values: ["a", ".", "b", "..", "..", "c"],
        marks: { 0: "compare", 4: "focus", 5: "window" },
        labels: { 4: "pop a" },
      },
      caption:
        "The second '..' pops again, emptying the stack; then 'c' is pushed. The answer is '/' + 'c'.",
    },
    {
      cells: {
        values: [".."],
        marks: { 0: "compare" },
        labels: { 0: "nothing" },
      },
      caption:
        'The corner case "/../": a pop with nothing to pop. The guard makes it a no-op, and the empty stack renders as the root "/" rather than an empty string.',
    },
  ],
  alternatives: [
    {
      name: "Chop the answer string as you go",
      summary:
        "Carry the answer as a string. An ordinary name is appended with a slash; a '..' searches backwards for the last slash and cuts everything after it.",
      complexity: { time: "O(n²)", space: "O(n)" },
      python: `def simplify_path(path: str) -> str:
    out = ""
    for part in path.split("/"):
        if part == "" or part == ".":
            continue
        if part == "..":
            cut = out.rfind("/")      # scan back to the previous separator
            if cut >= 0:
                out = out[:cut]
            continue
        out += "/" + part
    return out if out else "/"`,
      java: `public String simplifyPath(String path) {
    String out = "";
    for (String part : path.split("/")) {
        if (part.isEmpty() || part.equals(".")) continue;
        if (part.equals("..")) {
            int cut = out.lastIndexOf('/');
            if (cut >= 0) out = out.substring(0, cut);
            continue;
        }
        out = out + "/" + part;
    }
    return out.isEmpty() ? "/" : out;
}`,
      cpp: `string simplifyPath(string path) {
    string out;
    string part;
    path.push_back('/');
    for (char ch : path) {
        if (ch != '/') {
            part.push_back(ch);
            continue;
        }
        if (part.empty() || part == ".") {
            part.clear();
            continue;
        }
        if (part == "..") {
            size_t cut = out.find_last_of('/');
            if (cut != string::npos) out = out.substr(0, cut);
            part.clear();
            continue;
        }
        out += "/" + part;
        part.clear();
    }
    return out.empty() ? "/" : out;
}`,
    },
    {
      name: "Right to left with a debt counter",
      summary:
        "Walk the components backwards. A '..' adds one to a debt; any ordinary name either pays off a debt and vanishes, or survives and is written down. The collected names come out reversed.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "Cutting the string costs a backwards scan and a fresh copy on every '..', so a path of three thousand characters ending in a run of '..' is quadratic. Reading right to left turns the whole thing into arithmetic: a '..' is a debt, and the first name that meets it settles it — no string is rebuilt and nothing is searched.",
      python: `def simplify_path(path: str) -> str:
    parts = path.split("/")
    debt = 0
    kept: list[str] = []
    for part in reversed(parts):
        if part == "" or part == ".":
            continue
        if part == "..":
            debt += 1
            continue
        if debt > 0:
            debt -= 1        # this name is the one that '..' was cancelling
            continue
        kept.append(part)
    kept.reverse()
    return "/" + "/".join(kept)`,
      java: `public String simplifyPath(String path) {
    String[] parts = path.split("/");
    int debt = 0;
    List<String> kept = new ArrayList<>();
    for (int i = parts.length - 1; i >= 0; i--) {
        String part = parts[i];
        if (part.isEmpty() || part.equals(".")) continue;
        if (part.equals("..")) {
            debt++;
            continue;
        }
        if (debt > 0) {
            debt--;
            continue;
        }
        kept.add(part);
    }
    StringBuilder out = new StringBuilder();
    for (int i = kept.size() - 1; i >= 0; i--) out.append('/').append(kept.get(i));
    return out.length() == 0 ? "/" : out.toString();
}`,
      cpp: `string simplifyPath(string path) {
    vector<string> parts;
    string part;
    path.push_back('/');
    for (char ch : path) {
        if (ch == '/') {
            parts.push_back(part);
            part.clear();
        } else {
            part.push_back(ch);
        }
    }
    int debt = 0;
    vector<string> kept;
    for (int i = (int)parts.size() - 1; i >= 0; i--) {
        if (parts[i].empty() || parts[i] == ".") continue;
        if (parts[i] == "..") {
            debt++;
            continue;
        }
        if (debt > 0) {
            debt--;
            continue;
        }
        kept.push_back(parts[i]);
    }
    string out;
    for (int i = (int)kept.size() - 1; i >= 0; i--) out += "/" + kept[i];
    return out.empty() ? "/" : out;
}`,
    },
  ],
}
