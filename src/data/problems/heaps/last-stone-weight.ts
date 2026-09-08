import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "last-stone-weight",
  title: "Smash the Two Heaviest Stones",
  pattern: "heaps",
  difficulty: "easy",
  leetcode: "last-stone-weight",
  brief: "Repeatedly smash the two heaviest stones; report what survives.",
  statement:
    "Given the weights of a pile of stones, repeatedly take the two heaviest and smash them together: equal weights destroy both, otherwise the heavier one survives with the difference. Return the weight of the last remaining stone, or 0 if none is left.",
  constraints: [
    "1 <= stones.length <= 30",
    "1 <= stones[i] <= 1000",
    "each smash removes two stones and puts back at most one, so the pile always shrinks",
    "an empty pile at the end means the answer is 0, not an error",
  ],
  examples: [
    {
      input: "stones = [2, 7, 4, 1, 8, 1]",
      output: "1",
      note: "8 and 7 leave 1; then 4 and 2 leave 2; then 2 and 1 leave 1; then 1 and 1 destroy each other.",
    },
    {
      input: "stones = [1]",
      output: "1",
      note: "Nothing to smash it against.",
    },
  ],
  hints: [
    "The pile changes after every smash, and each round asks the same question: which two are heaviest right now?",
    "Re-sorting the whole pile every round answers a question you only need two answers from.",
    "A max-heap gives the largest in O(log n) and takes the remainder back for the same price.",
  ],
  whyNow:
    "Sorting recomputes the full order every round when only one stone changed. A heap maintains just enough order to answer 'what is the largest?', so each round costs log n instead of n log n — and the remainder drops back in without disturbing anything else.",
  approach:
    "Put every stone into a max-heap. While two or more remain, pop the two largest; if they differ, push the difference back. The heap keeps the invariant that the top is the heaviest, which is the only fact each round needs. When at most one stone is left, that stone (or 0 for an empty heap) is the answer. Languages without a max-heap get one by negating on the way in and out.",
  complexity: { time: "O(n log n)", space: "O(n)" },
  python: `import heapq


def last_stone_weight(stones: list[int]) -> int:
    heap = [-s for s in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        first = -heapq.heappop(heap)
        second = -heapq.heappop(heap)
        if first != second:
            heapq.heappush(heap, -(first - second))
    return -heap[0] if heap else 0`,
  java: `public int lastStoneWeight(int[] stones) {
    PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
    for (int s : stones) heap.add(s);
    while (heap.size() > 1) {
        int first = heap.poll();
        int second = heap.poll();
        if (first != second) heap.add(first - second);
    }
    return heap.isEmpty() ? 0 : heap.peek();
}`,
  cpp: `int lastStoneWeight(const vector<int>& stones) {
    priority_queue<int> heap(stones.begin(), stones.end());
    while (heap.size() > 1) {
        int first = heap.top();
        heap.pop();
        int second = heap.top();
        heap.pop();
        if (first != second) heap.push(first - second);
    }
    return heap.empty() ? 0 : heap.top();
}`,
  walkthrough: [
    {
      cells: { values: [2, 7, 4, 1, 8, 1] },
      caption: "Six stones. The heap will keep the heaviest at the top.",
    },
    {
      cells: {
        values: [2, 7, 4, 1, 8, 1],
        marks: { 1: "focus", 4: "focus" },
        labels: { 4: "8", 1: "7" },
      },
      caption:
        "Heaviest two: 8 and 7. They differ, so a stone of weight 1 goes back.",
    },
    {
      cells: {
        values: [2, 4, 1, 1, 1],
        marks: { 1: "focus", 0: "focus" },
      },
      caption: "Pile is now {2, 4, 1, 1, 1}. Heaviest two: 4 and 2 → push 2.",
    },
    {
      cells: { values: [2, 1, 1, 1], marks: { 0: "focus", 1: "focus" } },
      caption: "Pile {2, 1, 1, 1}. Heaviest two: 2 and 1 → push 1.",
    },
    {
      cells: { values: [1, 1, 1], marks: { 0: "compare", 1: "compare" } },
      caption: "Two equal stones destroy each other, leaving one.",
    },
    {
      cells: { values: [1], marks: { 0: "done" } },
      caption: "One stone left → the answer is 1.",
    },
  ],
  alternatives: [
    {
      name: "Re-sort every round",
      summary:
        "Sort the pile, take the two largest off the end, push any remainder back, and sort again for the next round.",
      complexity: { time: "O(n² log n)", space: "O(n)" },
      python: `def last_stone_weight(stones: list[int]) -> int:
    pile = list(stones)
    while len(pile) > 1:
        pile.sort()
        first = pile.pop()
        second = pile.pop()
        if first != second:
            pile.append(first - second)
    return pile[0] if pile else 0`,
      java: `public int lastStoneWeight(int[] stones) {
    List<Integer> pile = new ArrayList<>();
    for (int s : stones) pile.add(s);
    while (pile.size() > 1) {
        Collections.sort(pile);
        int first = pile.remove(pile.size() - 1);
        int second = pile.remove(pile.size() - 1);
        if (first != second) pile.add(first - second);
    }
    return pile.isEmpty() ? 0 : pile.get(0);
}`,
      cpp: `int lastStoneWeight(const vector<int>& stones) {
    vector<int> pile = stones;
    while (pile.size() > 1) {
        sort(pile.begin(), pile.end());
        int first = pile.back();
        pile.pop_back();
        int second = pile.back();
        pile.pop_back();
        if (first != second) pile.push_back(first - second);
    }
    return pile.empty() ? 0 : pile[0];
}`,
    },
  ],
}
