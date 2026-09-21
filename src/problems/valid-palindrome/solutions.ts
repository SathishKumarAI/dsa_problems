// valid-palindrome — the ladder: every way in, worst first.
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

export const approach =
  "Put i at the front and j at the back. Advance i past anything that is not alphanumeric, retreat j the same way, then compare the two characters case-insensitively. A disagreement ends it; a match moves both inward. When the pointers cross, every mirrored pair has agreed and the answer is true — including the case where they cross immediately because the string held no letters at all."

export const whyNow =
  "Building a cleaned copy spends O(n) memory to hold a string you read exactly once. Two indices read the original in place and stop the moment they disagree, so a mismatch in the first two characters costs two comparisons instead of a full rebuild."

export const arc =
  "The only interesting thing here is how much data you are willing to copy. Cleaning the string first is honest and readable and allocates a second copy; two pointers that skip non-alphanumerics in place answer the same question with two integers. The lesson is that filtering does not have to be a separate pass — a cursor can skip while it walks. The two details worth rehearsing are the ones that make people fail this easy question: the empty or all-punctuation input, where the pointers cross immediately and the answer is true, and case folding, where '0P' shows that comparing characters without normalising both sides is a bug the simple examples never reveal."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def is_palindrome(s: str) -> bool:
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
    return True`

export const java = `public boolean isPalindrome(String s) {
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
}`

export const cpp = `bool isPalindrome(const string& s) {
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
}`

export const alternatives: Solution[] = [
  {
    name: "Clean, then reverse",
    costWhy:
      "O(n) time and O(n) space, and the space is the point. Two passes over the input \u2014 one to build the cleaned string, one to reverse and compare it \u2014 so the time is linear with a constant of about three. The memory is a second string the size of the input: at the ceiling of 2\u00b710\u2075 characters that is real, and it buys nothing the [[two pointers|two-pointer]] walk does not get for free. It is worth writing once because it is obviously correct, which makes it the thing the faster rung has to be checked against.",
    summary:
      "Build a lowercase copy holding only letters and digits, then compare it with its own reverse. Clear and linear, and it allocates two full strings to answer a yes/no question — then reads both to the end even when the first and last characters already disagree.",
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
]

// HOW THE TARGET BOUND WAS COUNTED. Each rung carries its own.
export const costWhy =
  "One walk of two pointers toward each other: each iteration advances i or retreats j, so together they cross the string once and the loop runs at most n times \u2014 that is the O(n). The skip loops inside do not change it, because a character skipped is a character the outer walk never revisits; the total number of pointer moves over the whole run is bounded by n, not by n per step. The O(1) space is the two indices, which is what [[in-place|in place]] means here, and that is the entire argument for this rung over the cleaned-copy one: same time, none of the memory. The comparison itself folds case per character, which costs one operation and avoids a second pass over the input."
