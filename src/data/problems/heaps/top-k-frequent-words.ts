import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "top-k-frequent-words",
  title: "The k Most Common Words, Ties Alphabetical",
  pattern: "heaps",
  difficulty: "medium",
  leetcode: "top-k-frequent-words",
  brief:
    "Rank words by how often they appear, breaking ties alphabetically, and return the top k.",
  statement:
    "Given a list of words and a number k, return the k most frequent words, ordered by count from high to low. Words with the same count are ordered alphabetically, smallest first.",
  constraints: [
    "1 <= words.length <= 500, 1 <= word length <= 10, lowercase letters only",
    "1 <= k <= number of DISTINCT words, so the answer always has exactly k entries",
    "the ordering has two keys and they point opposite ways: count descending, then the word ascending",
    "ties are common — a naive sort that only compares counts leaves equal-count words in input order and fails",
    "k is usually far smaller than the number of distinct words, which is what makes a full sort look wasteful",
  ],
  examples: [
    {
      input: 'words = ["i","love","leetcode","i","love","coding"], k = 2',
      output: '["i", "love"]',
      note: "Both appear twice, so the tie is broken alphabetically: i before love.",
    },
    {
      input:
        'words = ["the","day","is","sunny","the","the","the","sunny","is","is"], k = 4',
      output: '["the", "is", "sunny", "day"]',
      note: "Counts 4, 3, 2, 1 — no ties to break here.",
    },
    {
      input: 'words = ["b","a"], k = 2',
      output: '["a", "b"]',
      note: "The corner case: every count is 1, so the answer is purely alphabetical.",
    },
  ],
  hints: [
    "Two phases: count, then rank. The counting is a plain hash map; everything interesting is in the ranking.",
    "The comparison is one rule with two parts — higher count first, and when counts match, the alphabetically smaller word first.",
    "You do not need the whole ranking, only its first k entries. A heap gives you those without ordering the rest.",
  ],
  whyNow:
    "Bucketing by count is linear, but it still sorts each bucket, and a corpus where every word appears once puts every word in one bucket — the full sort, back again, wearing a different hat. Heapifying the pairs is linear and then each of the k answers costs one logarithmic pop, so the work follows k rather than the vocabulary: 500 distinct words and k = 2 is two pops, not 500 comparisons.",
  arc: "Two ideas, and the second is the transferable one. First: a ranking with two keys pointing opposite ways — count descending, word ascending — should live in exactly ONE comparison function; every rung that writes the rule twice eventually disagrees with itself on ties. Second: do not order what you will not read. A sort orders the whole vocabulary to hand back k entries; a heap orders only the candidates; buckets skip comparisons on the count entirely because counts are small bounded integers, and small bounded integers can be array indices rather than comparison keys. Choose by which quantity is small: k tiny against a big vocabulary favours the heap, k close to n favours the sort, and a tight bound on counts favours the buckets.",
  approach:
    "Count the words into a map, then heapify the (count, word) pairs under the answer's own ordering — count descending, word ascending — and pop k times. Building the heap is linear in the number of distinct words and each pop is logarithmic, so the ranking costs what the answer costs rather than what the vocabulary costs. The comparison lives in one place, which is also what keeps the two-key tie rule from being written twice.",
  complexity: { time: "O(n + k log n)", space: "O(n)" },
  python: `import heapq
from collections import Counter

def top_k_frequent_words(words: list[str], k: int) -> list[str]:
    counts = Counter(words)
    # -count sorts high-to-low; the word itself sorts a tie low-to-high
    heap = [(-count, word) for word, count in counts.items()]
    heapq.heapify(heap)
    return [heapq.heappop(heap)[1] for _ in range(k)]`,
  java: `public List<String> topKFrequentWords(String[] words, int k) {
    Map<String, Integer> counts = new HashMap<>();
    for (String word : words) counts.put(word, counts.getOrDefault(word, 0) + 1);
    PriorityQueue<String> heap = new PriorityQueue<>((a, b) ->
        counts.get(a).equals(counts.get(b)) ? a.compareTo(b) : counts.get(b) - counts.get(a));
    heap.addAll(counts.keySet());
    List<String> out = new ArrayList<>();
    for (int i = 0; i < k; i++) out.add(heap.poll());
    return out;
}`,
  cpp: `vector<string> topKFrequentWords(vector<string> words, int k) {
    unordered_map<string, int> counts;
    for (const string& word : words) counts[word]++;
    auto worse = [](const pair<int, string>& a, const pair<int, string>& b) {
        if (a.first != b.first) return a.first < b.first;   // fewer is worse
        return a.second > b.second;                         // later is worse
    };
    vector<pair<int, string>> pairs;
    for (const auto& entry : counts) pairs.push_back({entry.second, entry.first});
    priority_queue<pair<int, string>, vector<pair<int, string>>, decltype(worse)> heap(worse, pairs);
    vector<string> out;
    for (int i = 0; i < k; i++) {
        out.push_back(heap.top().second);
        heap.pop();
    }
    return out;
}`,
  walkthrough: [
    {
      cells: {
        values: ["a", "b", "a", "c", "b", "a"],
        marks: { 0: "focus", 2: "focus", 5: "focus" },
      },
      caption:
        'A smaller input, ["a","b","a","c","b","a"] with k = 2. The first pass counts: a three times, b twice, c once.',
    },
    {
      cells: {
        values: ["a3", "b2", "c1"],
        marks: { 0: "window", 1: "window", 2: "window" },
        labels: { 0: "count" },
      },
      caption:
        "The distinct words with their counts — three entries, however long the input was. The heap is built over these.",
    },
    {
      cells: {
        values: ["a3", "b2", "c1"],
        marks: { 0: "focus" },
        labels: { 0: "pop 1" },
      },
      caption:
        'Ordered by (-count, word), the smallest entry is (-3, "a"): the highest count comes off first.',
    },
    {
      cells: {
        values: ["a3", "b2", "c1"],
        marks: { 0: "done", 1: "focus" },
        labels: { 1: "pop 2" },
      },
      caption:
        'The second pop gives (-2, "b") and k is reached. The "c" entry was never compared against anything — the work followed k, not the vocabulary.',
    },
    {
      cells: {
        values: ["b1", "a1"],
        marks: { 1: "focus", 0: "compare" },
        labels: { 1: "wins" },
      },
      caption:
        'The corner case ["b", "a"]: every count is 1, so the tie rule decides everything and "a" comes first — input order plays no part.',
    },
  ],
  alternatives: [
    {
      name: "Count, then sort everything",
      summary:
        "Build the counts, turn them into a list of pairs, and sort by the answer's own rule: count descending, then word ascending so ties break alphabetically. Short and correct, and the two-key ordering is the part to get right. It just fully orders every distinct word when only the first k are ever read.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      python: `from collections import Counter

def top_k_frequent_words(words: list[str], k: int) -> list[str]:
    counts = Counter(words)
    ranked = sorted(counts.items(), key=lambda pair: (-pair[1], pair[0]))
    return [word for word, _ in ranked[:k]]`,
      java: `public List<String> topKFrequentWords(String[] words, int k) {
    Map<String, Integer> counts = new HashMap<>();
    for (String word : words) counts.put(word, counts.getOrDefault(word, 0) + 1);
    List<String> ranked = new ArrayList<>(counts.keySet());
    ranked.sort((a, b) ->
        counts.get(a).equals(counts.get(b)) ? a.compareTo(b) : counts.get(b) - counts.get(a));
    return new ArrayList<>(ranked.subList(0, k));
}`,
      cpp: `vector<string> topKFrequentWords(vector<string> words, int k) {
    unordered_map<string, int> counts;
    for (const string& word : words) counts[word]++;
    vector<pair<string, int>> ranked(counts.begin(), counts.end());
    sort(ranked.begin(), ranked.end(), [](const pair<string, int>& a, const pair<string, int>& b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });
    vector<string> out;
    for (int i = 0; i < k; i++) out.push_back(ranked[i].first);
    return out;
}`,
    },
    {
      name: "Buckets by count",
      summary:
        "Counts are bounded by the input length, so they can be array indices: drop each word into the bucket for its count, then walk the buckets from the highest down, sorting each one alphabetically as it is read.",
      complexity: { time: "O(n + b log b)", space: "O(n)" },
      whyNow:
        "Sorting orders the whole vocabulary when the answer needs only its head — and it compares counts, which are small integers bounded by the number of words. Small bounded integers do not need comparisons at all: they can index an array, which turns the count half of the ordering into placement instead of sorting.",
      python: `from collections import Counter

def top_k_frequent_words(words: list[str], k: int) -> list[str]:
    counts = Counter(words)
    buckets: list[list[str]] = [[] for _ in range(len(words) + 1)]
    for word, count in counts.items():
        buckets[count].append(word)
    out: list[str] = []
    for count in range(len(words), 0, -1):
        if not buckets[count]:
            continue
        for word in sorted(buckets[count]):   # the tie rule, one bucket at a time
            out.append(word)
            if len(out) == k:
                return out
    return out`,
      java: `public List<String> topKFrequentWords(String[] words, int k) {
    Map<String, Integer> counts = new HashMap<>();
    for (String word : words) counts.put(word, counts.getOrDefault(word, 0) + 1);
    List<List<String>> buckets = new ArrayList<>();
    for (int i = 0; i <= words.length; i++) buckets.add(new ArrayList<>());
    for (Map.Entry<String, Integer> entry : counts.entrySet())
        buckets.get(entry.getValue()).add(entry.getKey());
    List<String> out = new ArrayList<>();
    for (int count = words.length; count > 0; count--) {
        List<String> bucket = buckets.get(count);
        if (bucket.isEmpty()) continue;
        Collections.sort(bucket);
        for (String word : bucket) {
            out.add(word);
            if (out.size() == k) return out;
        }
    }
    return out;
}`,
      cpp: `vector<string> topKFrequentWords(vector<string> words, int k) {
    unordered_map<string, int> counts;
    for (const string& word : words) counts[word]++;
    vector<vector<string>> buckets((int)words.size() + 1);
    for (const auto& entry : counts) buckets[entry.second].push_back(entry.first);
    vector<string> out;
    for (int count = (int)words.size(); count > 0; count--) {
        if (buckets[count].empty()) continue;
        sort(buckets[count].begin(), buckets[count].end());
        for (const string& word : buckets[count]) {
            out.push_back(word);
            if ((int)out.size() == k) return out;
        }
    }
    return out;
}`,
    },
  ],
}
