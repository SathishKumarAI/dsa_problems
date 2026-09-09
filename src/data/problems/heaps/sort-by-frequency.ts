import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "sort-by-frequency",
  title: "Sort Characters by How Often They Appear",
  pattern: "heaps",
  difficulty: "medium",
  leetcode: "sort-characters-by-frequency",
  brief: "Most frequent characters first.",
  statement:
    "Given a string, rearrange it so characters appear in decreasing order of frequency. Characters with the same count are ordered by the character itself, so the answer is unambiguous.",
  constraints: [
    "1 <= s.length <= 5 * 10^5",
    "s consists of letters and digits, upper and lower case being distinct",
    "ties are broken by the CHARACTER here, so there is exactly one correct output",
    "every occurrence must appear in the result — this is a rearrangement, not a deduplication",
  ],
  examples: [
    {
      input: 's = "tree"',
      output: '"eert"',
      note: "e twice, then r and t in character order.",
    },
    {
      input: 's = "cccaaa"',
      output: '"aaaccc"',
      note: "Both appear three times, so the character breaks the tie and a comes first.",
    },
  ],
  hints: [
    "Count the characters first. The rest of the problem is about ordering those counts.",
    "A heap gives you the largest count repeatedly, which is exactly the output order.",
    "A tie needs a rule, or two correct programs will disagree — here the character itself decides.",
  ],
  whyNow:
    "Sorting all the counts orders every character even when only the first few matter, and for a small alphabet that difference is modest. The heap is here because it generalises: the same shape answers 'the top k' without ordering the rest, and it is the structure to reach for when the alphabet is large or the stream is unbounded.",
  approach:
    "Tally the characters, then push every (count, character) pair into a heap ordered by falling count and then by the character, so ties resolve the same way in every language. Pop repeatedly, emitting each character as many times as its count. The explicit tie-break is not decoration: without it the answer depends on the heap's internal ordering, and two correct-looking implementations disagree.",
  complexity: { time: "O(n + k log k)", space: "O(n)" },
  python: `import heapq


def frequency_sort(s: str) -> str:
    counts: dict[str, int] = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    heap = [(-count, ch) for ch, count in counts.items()]
    heapq.heapify(heap)
    out = ""
    while heap:
        count, ch = heapq.heappop(heap)
        out += ch * (-count)
    return out`,
  java: `public String frequencySort(String s) {
    Map<Character, Integer> counts = new HashMap<>();
    for (int i = 0; i < s.length(); i++) counts.merge(s.charAt(i), 1, Integer::sum);
    PriorityQueue<Character> heap = new PriorityQueue<>((a, b) -> {
        int byCount = counts.get(b) - counts.get(a);
        return byCount != 0 ? byCount : a - b;
    });
    heap.addAll(counts.keySet());
    StringBuilder out = new StringBuilder();
    while (!heap.isEmpty()) {
        char ch = heap.poll();
        for (int r = 0; r < counts.get(ch); r++) out.append(ch);
    }
    return out.toString();
}`,
  cpp: `string frequencySort(const string& s) {
    map<char, int> counts;
    for (char ch : s) counts[ch]++;
    priority_queue<pair<int, char>, vector<pair<int, char>>, greater<pair<int, char>>> heap;
    for (const auto& kv : counts) heap.push(make_pair(-kv.second, kv.first));
    string out;
    while (!heap.empty()) {
        pair<int, char> top = heap.top();
        heap.pop();
        out.append((size_t)(-top.first), top.second);
    }
    return out;
}`,
  walkthrough: [
    {
      cells: { values: ["t", "r", "e", "e"] },
      caption: 's = "tree". First count: t:1, r:1, e:2.',
    },
    {
      cells: { values: ["e", "e"], marks: { 0: "focus", 1: "focus" } },
      caption: "The heap's top is the highest count — e, twice.",
    },
    {
      cells: { values: ["e", "e", "r"], marks: { 2: "focus" } },
      caption:
        "Then the tie between r and t, broken by the character: r first.",
    },
    {
      cells: { values: ["e", "e", "r", "t"], marks: { 3: "focus" } },
      caption:
        "Then t. The tie-break is what makes this the only correct answer.",
    },
    {
      cells: {
        values: ["e", "e", "r", "t"],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done" },
      },
      caption:
        '"eert". Without a stated tie-break, "eetr" would look equally right.',
    },
  ],
  alternatives: [
    {
      name: "Sort the counted pairs",
      summary:
        "Tally the characters, then sort the pairs by falling count and rising character, and emit each one its many times.",
      complexity: { time: "O(n + k log k)", space: "O(n)" },
      python: `def frequency_sort(s: str) -> str:
    counts: dict[str, int] = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    pairs = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    out = ""
    for ch, count in pairs:
        out += ch * count
    return out`,
      java: `public String frequencySort(String s) {
    Map<Character, Integer> counts = new HashMap<>();
    for (int i = 0; i < s.length(); i++) counts.merge(s.charAt(i), 1, Integer::sum);
    List<Character> keys = new ArrayList<>(counts.keySet());
    keys.sort((a, b) -> {
        int byCount = counts.get(b) - counts.get(a);
        return byCount != 0 ? byCount : a - b;
    });
    StringBuilder out = new StringBuilder();
    for (char ch : keys) {
        for (int r = 0; r < counts.get(ch); r++) out.append(ch);
    }
    return out.toString();
}`,
      cpp: `string frequencySort(const string& s) {
    map<char, int> counts;
    for (char ch : s) counts[ch]++;
    vector<pair<char, int>> pairs(counts.begin(), counts.end());
    sort(pairs.begin(), pairs.end(), [](const pair<char, int>& a, const pair<char, int>& b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });
    string out;
    for (const auto& kv : pairs) out.append((size_t)kv.second, kv.first);
    return out;
}`,
    },
  ],
}
