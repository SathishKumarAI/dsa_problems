import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "backspace-compare",
  title: "Two Strings After the Backspaces",
  pattern: "two-pointers",
  difficulty: "easy",
  leetcode: "backspace-string-compare",
  brief:
    "Type both strings, treating '#' as a backspace. Do they end up equal?",
  statement:
    "Two strings are typed into an empty editor, where '#' means backspace. Return true if the two finished texts are identical.",
  constraints: [
    "0 <= s.length, t.length <= 200 — and a string made entirely of '#' finishes empty, so the empty text has to work either way",
    "every character is a lowercase letter or '#'",
    "a '#' with nothing typed before it deletes nothing — a no-op, not an error, which is why a leading '#' cannot be handled by blindly dropping the previous character",
    "one '#' removes exactly one surviving character, so a run of them removes that many",
    "the answer is a single boolean, which means the finished texts never have to exist anywhere",
  ],
  examples: [
    {
      input: 's = "ab#c", t = "ad#c"',
      output: "true",
      note: 'Both finish as "ac" — different keystrokes, same text.',
    },
    {
      input: 's = "a#c", t = "b"',
      output: "false",
      note: 'The survivors are "c" and "b": same length, different text.',
    },
    {
      input: 's = "#a", t = "a"',
      output: "true",
      note: "The trap. That leading '#' has nothing to delete, so it vanishes without taking the 'a' with it.",
    },
  ],
  hints: [
    "Reading left to right, a '#' arrives after the character it destroys — so a character's fate is unknown when you first see it.",
    "Reading right to left, the '#' arrives FIRST. Carry a count of deletions still owed and every character can be judged on sight.",
    "Two strings, two backward walks, run in lockstep: compare the surviving characters as they surface and stop at the first disagreement.",
  ],
  whyNow:
    "Every rung so far builds both finished texts in full — up to 400 characters of memory to produce one bit of answer — and none of them can give up early when the very first survivors already disagree. Walking both strings backward at the same time keeps nothing but two indices and two pending-delete counters, compares survivors as they appear, and returns the moment they differ.",
  arc:
    "Reading forwards means a character's fate is decided by things that have not happened yet, which is why the stack rung exists — it undoes work it already did. Reading BACKWARDS turns the hash marks into a debt counter, and each character's fate is known on sight, so nothing is ever pushed only to be popped. That reversal is the transferable idea: when a rule refers to what comes after, try walking the other way. The version to know is the constant-space one, with two independent backward cursors that skip their own debts and then compare — the fiddly part is the loop that must consume a full run of hashes before comparing, which is where every off-by-one in this problem lives.",
  approach:
    "Read both strings from the right. On each side, a small loop skips forward to the next surviving character: a '#' bumps that side's pending-delete count, and a letter with deletes pending consumes one and dies. What the loop leaves behind is the next character that actually survives. Compare the two survivors; if only one side still has a survivor, the texts have different lengths and the answer is false. Repeat until both sides are exhausted. Each character is visited once, and nothing is stored but four integers.",
  complexity: { time: "O(n + m)", space: "O(1)" },
  python: `def backspace_compare(s: str, t: str) -> bool:
    i, j = len(s) - 1, len(t) - 1
    while i >= 0 or j >= 0:
        skip = 0
        while i >= 0:
            if s[i] == "#":
                skip += 1
                i -= 1
            elif skip > 0:
                skip -= 1
                i -= 1
            else:
                break
        skip = 0
        while j >= 0:
            if t[j] == "#":
                skip += 1
                j -= 1
            elif skip > 0:
                skip -= 1
                j -= 1
            else:
                break
        if i >= 0 and j >= 0:
            if s[i] != t[j]:
                return False
        elif i >= 0 or j >= 0:
            # one side ran out of survivors while the other still has one
            return False
        i -= 1
        j -= 1
    return True`,
  java: `public boolean backspaceCompare(String s, String t) {
    int i = s.length() - 1, j = t.length() - 1;
    while (i >= 0 || j >= 0) {
        int skip = 0;
        while (i >= 0) {
            if (s.charAt(i) == '#') { skip++; i--; }
            else if (skip > 0) { skip--; i--; }
            else break;
        }
        skip = 0;
        while (j >= 0) {
            if (t.charAt(j) == '#') { skip++; j--; }
            else if (skip > 0) { skip--; j--; }
            else break;
        }
        if (i >= 0 && j >= 0) {
            if (s.charAt(i) != t.charAt(j)) return false;
        } else if (i >= 0 || j >= 0) {
            return false;
        }
        i--;
        j--;
    }
    return true;
}`,
  cpp: `bool backspaceCompare(const string& s, const string& t) {
    int i = (int)s.size() - 1, j = (int)t.size() - 1;
    while (i >= 0 || j >= 0) {
        int skip = 0;
        while (i >= 0) {
            if (s[i] == '#') { skip++; i--; }
            else if (skip > 0) { skip--; i--; }
            else break;
        }
        skip = 0;
        while (j >= 0) {
            if (t[j] == '#') { skip++; j--; }
            else if (skip > 0) { skip--; j--; }
            else break;
        }
        if (i >= 0 && j >= 0) {
            if (s[i] != t[j]) return false;
        } else if (i >= 0 || j >= 0) {
            return false;
        }
        i--;
        j--;
    }
    return true;
}`,
  walkthrough: [
    {
      cells: {
        values: ["a", "b", "#", "c", "|", "a", "d", "#", "c"],
        marks: { 3: "focus", 8: "focus" },
        labels: { 3: "i", 8: "j" },
      },
      caption:
        's = "ab#c" on the left of the bar, t = "ad#c" on the right. Both walks start at the last character owing nothing.',
    },
    {
      cells: {
        values: ["a", "b", "#", "c", "|", "a", "d", "#", "c"],
        marks: { 3: "done", 8: "done", 2: "compare", 7: "compare" },
        labels: { 2: "i", 7: "j" },
      },
      caption:
        "'c' faces 'c' — a match, so both indices step left and land on a '#'. Each side raises its own pending-delete count to 1.",
    },
    {
      cells: {
        values: ["a", "b", "#", "c", "|", "a", "d", "#", "c"],
        marks: { 3: "done", 8: "done", 1: "compare", 6: "compare" },
        labels: { 1: "i", 6: "j" },
      },
      caption:
        "The whole trick: the '#' was read BEFORE the character it kills. 'b' and 'd' are cancelled on sight and never compared to anything.",
    },
    {
      cells: {
        values: ["a", "b", "#", "c", "|", "a", "d", "#", "c"],
        marks: { 3: "done", 8: "done", 0: "focus", 5: "focus" },
        labels: { 0: "i", 5: "j" },
      },
      caption:
        "With the deletions paid off, the next survivors surface: 'a' against 'a'. Another match.",
    },
    {
      cells: {
        values: ["a", "b", "#", "c", "|", "a", "d", "#", "c"],
        marks: { 0: "done", 3: "done", 5: "done", 8: "done" },
      },
      caption:
        'Both indices fall off the front in the same round, so the texts ran out together: "ac" and "ac". true — and neither text was ever built.',
    },
  ],
  alternatives: [
    {
      name: "Recursion, one cancel at a time",
      summary:
        "Find the first '#', delete it together with the character to its left, and hand the shorter pair back to yourself. When neither string has a '#' left, compare them.",
      complexity: { time: "O((n + m)^2)", space: "O(n + m)" },
      python: `def backspace_compare(s: str, t: str) -> bool:
    at = s.find("#")
    if at >= 0:
        # a '#' at index 0 has nothing to its left, so it only removes itself
        head = s[: at - 1] if at > 0 else ""
        return backspace_compare(head + s[at + 1 :], t)
    at = t.find("#")
    if at >= 0:
        head = t[: at - 1] if at > 0 else ""
        return backspace_compare(s, head + t[at + 1 :])
    return s == t`,
      java: `public boolean backspaceCompare(String s, String t) {
    int at = s.indexOf('#');
    if (at >= 0) {
        String head = at > 0 ? s.substring(0, at - 1) : "";
        return backspaceCompare(head + s.substring(at + 1), t);
    }
    at = t.indexOf('#');
    if (at >= 0) {
        String head = at > 0 ? t.substring(0, at - 1) : "";
        return backspaceCompare(s, head + t.substring(at + 1));
    }
    return s.equals(t);
}`,
      cpp: `bool backspaceCompare(const string& s, const string& t) {
    size_t at = s.find('#');
    if (at != string::npos) {
        string head = at > 0 ? s.substr(0, at - 1) : string("");
        string rest = head + s.substr(at + 1);
        return backspaceCompare(rest, t);
    }
    at = t.find('#');
    if (at != string::npos) {
        string head = at > 0 ? t.substr(0, at - 1) : string("");
        string rest = head + t.substr(at + 1);
        return backspaceCompare(s, rest);
    }
    return s == t;
}`,
    },
    {
      name: "Rebuild the text by slicing",
      summary:
        "Type each string out character by character into a growing text, trimming the last character whenever a '#' arrives, then compare the two finished texts.",
      complexity: { time: "O(n^2 + m^2)", space: "O(n + m)" },
      whyNow:
        "The recursion copies both strings from scratch on every single backspace and stacks one call frame per deletion, so 200 '#' characters mean 200 nested frames and 200 rebuilds. A plain loop applies the identical cancel rule with no call depth at all, and touches one string per pass instead of both.",
      python: `def backspace_compare(s: str, t: str) -> bool:
    typed = []
    for text in (s, t):
        out = ""
        for ch in text:
            if ch == "#":
                out = out[:-1]  # an empty text stays empty — nothing to delete
            else:
                out = out + ch
        typed.append(out)
    return typed[0] == typed[1]`,
      java: `public boolean backspaceCompare(String s, String t) {
    String[] input = {s, t};
    String[] typed = {"", ""};
    for (int k = 0; k < 2; k++) {
        String out = "";
        for (int i = 0; i < input[k].length(); i++) {
            char ch = input[k].charAt(i);
            if (ch == '#') {
                if (out.length() > 0) out = out.substring(0, out.length() - 1);
            } else {
                out = out + ch;
            }
        }
        typed[k] = out;
    }
    return typed[0].equals(typed[1]);
}`,
      cpp: `bool backspaceCompare(const string& s, const string& t) {
    string input[2] = {s, t};
    string typed[2] = {"", ""};
    for (int k = 0; k < 2; k++) {
        string out = "";
        for (char ch : input[k]) {
            if (ch == '#') {
                if (!out.empty()) out = out.substr(0, out.size() - 1);
            } else {
                out = out + ch;
            }
        }
        typed[k] = out;
    }
    return typed[0] == typed[1];
}`,
    },
    {
      name: "Cancel with a stack",
      summary:
        "Push every letter onto a stack and pop on '#'. A pop from an empty stack is simply ignored, which is exactly what a backspace on empty text does.",
      complexity: { time: "O(n + m)", space: "O(n + m)" },
      whyNow:
        "Slicing rebuilds the whole prefix each time a '#' lands, so text typed and deleted repeatedly costs quadratic work for a linear number of keystrokes. A stack's pop touches one element, which brings the whole thing down to a single pass per string — and the empty-stack guard states the leading-'#' rule outright instead of relying on a slice happening to do nothing.",
      python: `def backspace_compare(s: str, t: str) -> bool:
    typed = []
    for text in (s, t):
        keep = []
        for ch in text:
            if ch == "#":
                if keep:
                    keep.pop()
            else:
                keep.append(ch)
        typed.append(keep)
    return typed[0] == typed[1]`,
      java: `public boolean backspaceCompare(String s, String t) {
    String[] input = {s, t};
    StringBuilder[] keep = {new StringBuilder(), new StringBuilder()};
    for (int k = 0; k < 2; k++) {
        for (int i = 0; i < input[k].length(); i++) {
            char ch = input[k].charAt(i);
            if (ch == '#') {
                if (keep[k].length() > 0) keep[k].setLength(keep[k].length() - 1);
            } else {
                keep[k].append(ch);
            }
        }
    }
    return keep[0].toString().equals(keep[1].toString());
}`,
      cpp: `bool backspaceCompare(const string& s, const string& t) {
    string input[2] = {s, t};
    string keep[2];
    for (int k = 0; k < 2; k++) {
        for (char ch : input[k]) {
            if (ch == '#') {
                if (!keep[k].empty()) keep[k].pop_back();
            } else {
                keep[k].push_back(ch);
            }
        }
    }
    return keep[0] == keep[1];
}`,
    },
    {
      name: "Backward pass with a skip counter",
      summary:
        "Read each string from the right, counting deletions still owed. A '#' adds one to the count; a letter either pays one off and dies, or survives. Collect the survivors and compare.",
      complexity: { time: "O(n + m)", space: "O(n + m)" },
      whyNow:
        "The stack pushes every letter before it can know whether that letter lives — work the next pop undoes. Reading right to left, the '#' shows up BEFORE the character it kills, so one counter decides each character on sight and nothing is ever pushed only to be popped. That counter, not the container, is the idea the final solution keeps.",
      python: `def backspace_compare(s: str, t: str) -> bool:
    survivors = []
    for text in (s, t):
        out = []
        skip = 0
        for i in range(len(text) - 1, -1, -1):
            if text[i] == "#":
                skip += 1
            elif skip > 0:
                skip -= 1
            else:
                out.append(text[i])
        survivors.append(out)
    return survivors[0] == survivors[1]`,
      java: `public boolean backspaceCompare(String s, String t) {
    String[] input = {s, t};
    StringBuilder[] survivors = {new StringBuilder(), new StringBuilder()};
    for (int k = 0; k < 2; k++) {
        int skip = 0;
        for (int i = input[k].length() - 1; i >= 0; i--) {
            char ch = input[k].charAt(i);
            if (ch == '#') skip++;
            else if (skip > 0) skip--;
            else survivors[k].append(ch);
        }
    }
    return survivors[0].toString().equals(survivors[1].toString());
}`,
      cpp: `bool backspaceCompare(const string& s, const string& t) {
    string input[2] = {s, t};
    string survivors[2];
    for (int k = 0; k < 2; k++) {
        int skip = 0;
        for (int i = (int)input[k].size() - 1; i >= 0; i--) {
            char ch = input[k][i];
            if (ch == '#') skip++;
            else if (skip > 0) skip--;
            else survivors[k].push_back(ch);
        }
    }
    return survivors[0] == survivors[1];
}`,
    },
  ],
}
