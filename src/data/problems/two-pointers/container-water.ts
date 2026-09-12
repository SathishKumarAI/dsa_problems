import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "container-water",
  title: "Widest Container",
  pattern: "two-pointers",
  difficulty: "medium",
  leetcode: "container-with-most-water",
  brief: "Pick two lines that hold the most water between them.",
  statement:
    "Given an array heights where heights[i] is the height of a vertical line at position i, choose two lines so the area between them (width × shorter height) is maximised. Return that area.",
  constraints: [
    "2 <= height.length <= 10^5",
    "0 <= height[i] <= 10^4",
    "the container is capped by the shorter line and widened by the distance between them",
    "the lines are vertical: nothing between them affects the area",
  ],
  examples: [
    {
      input: "heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]",
      output: "49",
      note: "Lines of height 8 and 7, seven apart: 7 × 7 = 49.",
    },
  ],
  hints: [
    "Area is limited by the shorter line. Start with maximum width — both ends.",
    "Shrinking width is always a loss unless the limiting side improves. Which pointer is pointless to move?",
    "Moving the taller side can never help: width drops and the short side still caps the height. Always move the shorter one.",
  ],
  whyNow:
    "Measuring every pair is n squared comparisons for one number. Moving the pointer at the shorter line inward discards only the pairs that line already capped, so a single sweep is enough.",
  arc:
    "One greedy argument carries the whole problem, and it is worth being able to say precisely: the area is limited by the SHORTER wall, so moving the taller one inward can never help — the width shrinks and the height is still capped by the short wall. Moving the shorter one is the only move that can improve anything, so no pair worth checking is ever skipped. That is the shape of every two-pointer proof: show that the pointer you advance cannot be part of a better remaining answer. Brute force is worth writing once to see the quadratic, and the exchange argument is worth rehearsing out loud, because an interviewer asking 'why is that safe?' is asking for exactly this paragraph.",
  approach:
    "Two pointers at the extremes. Record the area, then move the pointer at the shorter line inward — keeping it could only pair it with narrower widths while it stays the cap. This greedy discard is safe because every skipped pair is provably no better than one already measured.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def max_area(heights: list[int]) -> int:
    i, j = 0, len(heights) - 1
    best = 0
    while i < j:
        best = max(best, (j - i) * min(heights[i], heights[j]))
        if heights[i] < heights[j]:
            i += 1
        else:
            j -= 1
    return best`,
  java: `public int maxArea(int[] h) {
    int i = 0, j = h.length - 1, best = 0;
    while (i < j) {
        best = Math.max(best, (j - i) * Math.min(h[i], h[j]));
        if (h[i] < h[j]) i++;
        else j--;
    }
    return best;
}`,
  cpp: `int maxArea(const vector<int>& h) {
    int i = 0, j = (int)h.size() - 1, best = 0;
    while (i < j) {
        best = max(best, (j - i) * min(h[i], h[j]));
        if (h[i] < h[j]) i++;
        else j--;
    }
    return best;
}`,
  alternatives: [
    {
      name: "Brute force",
      summary:
        "Measure all pairs. Fine for tiny inputs; quadratic wall at scale. State it, then improve it.",
      complexity: { time: "O(n²)", space: "O(1)" },
      python: `def max_area(heights: list[int]) -> int:
    best = 0
    for i in range(len(heights)):
        for j in range(i + 1, len(heights)):
            best = max(best, (j - i) * min(heights[i], heights[j]))
    return best`,
      java: `public int maxArea(int[] h) {
    int best = 0;
    for (int i = 0; i < h.length; i++)
        for (int j = i + 1; j < h.length; j++)
            best = Math.max(best, (j - i) * Math.min(h[i], h[j]));
    return best;
}`,
      cpp: `int maxArea(const vector<int>& h) {
    int best = 0;
    for (int i = 0; i < (int)h.size(); i++)
        for (int j = i + 1; j < (int)h.size(); j++)
            best = max(best, (j - i) * min(h[i], h[j]));
    return best;
}`,
    },
  ],
}
