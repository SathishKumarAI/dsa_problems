import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "valid-palindrome",
  title: "Palindrome, Ignoring the Noise",
  pattern: "two-pointers",
  difficulty: "easy",
  leetcode: "valid-palindrome",
  brief: "Reads the same both ways, counting only letters and digits.",
  statement:
    "Given a string, return true if it reads the same forwards and backwards once every non-alphanumeric character is ignored and case is disregarded.",
  constraints: [
    "1 <= s.length <= 2 * 10^5",
    "s may contain letters, digits, spaces and punctuation",
    "a string with no alphanumeric characters at all is an empty palindrome — true, not false",
    "case is not part of the comparison, so 'A' and 'a' are the same character",
  ],
  examples: [
    {
      input: 's = "A man, a plan, a canal: Panama"',
      output: "true",
      note: "Strip the noise and it reads amanaplanacanalpanama.",
    },
    {
      input: 's = " "',
      output: "true",
      note: "Nothing left to compare, so it is trivially a palindrome.",
    },
  ],
  hints: [
    "Two indices, one at each end, walking toward each other. What has to be true at every meeting?",
    "Punctuation is not a mismatch — it is something to skip. Advance the pointer without comparing.",
    "Skip first, compare second. If you compare before skipping, a comma will fail a perfectly good palindrome.",
  ],
  whyNow:
    "Building a cleaned copy spends O(n) memory to hold a string you read exactly once. Two indices read the original in place and stop the moment they disagree, so a mismatch in the first two characters costs two comparisons instead of a full rebuild.",
  approach:
    "Put i at the front and j at the back. Advance i past anything that is not alphanumeric, retreat j the same way, then compare the two characters case-insensitively. A disagreement ends it; a match moves both inward. When the pointers cross, every mirrored pair has agreed and the answer is true — including the case where they cross immediately because the string held no letters at all.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def is_palindrome(s: str) -> bool:
    i, j = 0, len(s) - 1
    while i < j:
        while i < j and not s[i].isalnum():
            i += 1
        while i < j and not s[j].isalnum():
            j -= 1
        if s[i].lower() != s[j].lower():
            return False
        i += 1
        j -= 1
    return True`,
  java: `public boolean isPalindrome(String s) {
    int i = 0, j = s.length() - 1;
    while (i < j) {
        while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;
        while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;
        if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) {
            return false;
        }
        i++;
        j--;
    }
    return true;
}`,
  cpp: `bool isPalindrome(const string& s) {
    int i = 0, j = (int)s.size() - 1;
    while (i < j) {
        while (i < j && !isalnum((unsigned char)s[i])) i++;
        while (i < j && !isalnum((unsigned char)s[j])) j--;
        if (tolower((unsigned char)s[i]) != tolower((unsigned char)s[j])) {
            return false;
        }
        i++;
        j--;
    }
    return true;
}`,
  walkthrough: [
    {
      cells: { values: ["a", "b", ",", " ", "B", "A"] },
      caption:
        'The string "ab, BA". i starts at the front, j at the back, and neither has compared anything yet.',
    },
    {
      cells: {
        values: ["a", "b", ",", " ", "B", "A"],
        marks: { 0: "focus", 5: "focus" },
        labels: { 0: "i", 5: "j" },
      },
      caption:
        "'a' vs 'A' — equal once case is ignored. Both pointers move in.",
    },
    {
      cells: {
        values: ["a", "b", ",", " ", "B", "A"],
        marks: { 0: "done", 1: "focus", 4: "focus", 5: "done" },
        labels: { 1: "i", 4: "j" },
      },
      caption: "'b' vs 'B' — equal. Move in again.",
    },
    {
      cells: {
        values: ["a", "b", ",", " ", "B", "A"],
        marks: {
          0: "done",
          1: "done",
          2: "compare",
          3: "compare",
          4: "done",
          5: "done",
        },
        labels: { 2: "i", 3: "j" },
      },
      caption:
        "Now i sits on ',' and j on ' '. Neither is alphanumeric, so both are skipped — not compared.",
    },
    {
      cells: {
        values: ["a", "b", ",", " ", "B", "A"],
        marks: {
          0: "done",
          1: "done",
          2: "done",
          3: "done",
          4: "done",
          5: "done",
        },
      },
      caption:
        "The pointers have crossed with no disagreement → true. The punctuation never got a vote.",
    },
  ],
  alternatives: [
    {
      name: "Clean, then reverse",
      summary:
        "Build a lowercase copy holding only the letters and digits, then check it against its own reverse.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def is_palindrome(s: str) -> bool:
    cleaned = [c.lower() for c in s if c.isalnum()]
    return cleaned == cleaned[::-1]`,
      java: `public boolean isPalindrome(String s) {
    StringBuilder b = new StringBuilder();
    for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);
        if (Character.isLetterOrDigit(c)) b.append(Character.toLowerCase(c));
    }
    String cleaned = b.toString();
    return cleaned.equals(b.reverse().toString());
}`,
      cpp: `bool isPalindrome(const string& s) {
    string cleaned;
    for (char c : s) {
        if (isalnum((unsigned char)c)) cleaned += (char)tolower((unsigned char)c);
    }
    string flipped(cleaned.rbegin(), cleaned.rend());
    return cleaned == flipped;
}`,
    },
  ],
}
