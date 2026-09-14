import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "top-k-frequent",
  title: "Top K Frequent Elements",
  pattern: "arrays-hashing",
  difficulty: "medium",
  leetcode: "top-k-frequent-elements",
  brief: "Return the k values that appear most often.",
  statement:
    "Given an integer array nums and an integer k, return the k elements that occur most frequently. Order among the answers does not matter.",
  constraints: [
    "1 <= nums.length <= 10^5",
    "-10^4 <= nums[i] <= 10^4",
    "1 <= k <= the number of distinct values in nums",
    "the answer is unique — no tie spans the k-th place",
  ],
  examples: [
    { input: "nums = [4, 4, 4, 6, 6, 2], k = 2", output: "[4, 6]" },
    { input: "nums = [9], k = 1", output: "[9]" },
  ],
  hints: [
    "Counting is the easy half — a hash map gives you value → count in one pass.",
    "Sorting the counts costs O(n log n). Can you avoid comparing counts to each other at all?",
    "Counts are bounded by n. Make an array of buckets where bucket[c] holds every value that occurs c times, then read buckets from the top.",
  ],
  whyNow:
    "The heap still pays a logarithm on every count. Counts are bounded by n, so they can be array indices: bucket the values by count and read the top k off the end, with no comparison sort anywhere.",
  arc: "Counting is the easy half; the ladder is entirely about how much ordering the answer really needs. A full sort orders every distinct value to hand back k of them. A heap of size k orders only the candidates, so the logarithm follows k rather than n. Buckets drop comparisons altogether, because a count is a small bounded integer — it can never exceed n — and small bounded integers can be array indices instead of sort keys. That last substitution, comparison becomes placement, is the same move behind counting sort, bucket sort and radix sort. Pick by which quantity is small: tiny k favours the heap, k near n favours sorting, and a tight bound on the key favours buckets.",
  approach:
    "Count occurrences with a hash map. Then bucket-sort by count: index c of a length n+1 array collects all values appearing exactly c times. Scanning buckets from n down to 1 and collecting values until you have k avoids any comparison sort, because a count can never exceed n.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    buckets: list[list[int]] = [[] for _ in range(len(nums) + 1)]
    for value, c in counts.items():
        buckets[c].append(value)
    out: list[int] = []
    for c in range(len(nums), 0, -1):
        for value in buckets[c]:
            out.append(value)
            if len(out) == k:
                return out
    return out`,
  java: `public int[] topKFrequent(int[] nums, int k) {
    Map<Integer,Integer> counts = new HashMap<>();
    for (int num : nums) {
        counts.put(num, counts.getOrDefault(num, 0)+1);
    }
    List<List<Integer>> buckets = new ArrayList<>(nums.length+1);
    for (int i=0;i<=nums.length;i++) buckets.add(new ArrayList<>());
    for (Map.Entry<Integer,Integer> e : counts.entrySet()) {
        int value=e.getKey(), c=e.getValue();
        buckets.get(c).add(value);
    }
    List<Integer> out = new ArrayList<>();
    for (int c=nums.length;c>=1;c--) {
        for (int val : buckets.get(c)) {
            out.add(val);
            if (out.size()==k) break;
        }
        if (out.size()==k) break;
    }
    int[] res = new int[out.size()];
    for (int i=0;i<out.size();i++) res[i]=out.get(i);
    return res;
}
`,
  cpp: `vector<int> topKFrequent(const vector<int>& nums, int k) {
    unordered_map<int,int> counts;
    for (int num : nums) counts[num]++;
    vector<vector<int>> buckets(nums.size()+1);
    for (auto &p: counts) {
        int value=p.first, c=p.second;
        buckets[c].push_back(value);
    }
    vector<int> out;
    for (int c=nums.size();c>=1;c--) {
        for (int val : buckets[c]) {
            out.push_back(val);
            if ((int)out.size()==k) break;
        }
        if ((int)out.size()==k) break;
    }
    return out;
}
`,
  alternatives: [
    {
      name: "Sort by count",
      summary:
        "Count, then sort the distinct values by frequency and slice the top k. Simplest to write; the sort is the only thing costing more than linear.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      python: `from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    return sorted(counts, key=counts.get, reverse=True)[:k]`,
      java: `public int[] topKFrequent(int[] nums, int k) {
    HashMap<Integer,Integer> counts = new HashMap<>();
    for (int num : nums) {
        counts.put(num, counts.getOrDefault(num, 0) + 1);
    }
    List<Integer> keys = new ArrayList<>(counts.keySet());
    Collections.sort(keys, new Comparator<Integer>() {
        public int compare(Integer a, Integer b) {
            return counts.get(b).compareTo(counts.get(a));
        }
    });
    int size = Math.min(k, keys.size());
    int[] result = new int[size];
    for (int i = 0; i < size; i++) {
        result[i] = keys.get(i);
    }
    return result;
}
`,
      cpp: `vector<int> topKFrequent(const vector<int>& nums, int k) {
    unordered_map<int,int> counts;
    for (int num : nums) {
        counts[num]++;
    }
    vector<int> keys;
    keys.reserve(counts.size());
    for (auto &p : counts) keys.push_back(p.first);
    sort(keys.begin(), keys.end(), [&](int a, int b){return counts[a]>counts[b];});
    int size = min(k, (int)keys.size());
    vector<int> result(size);
    for (int i = 0; i < size; i++) result[i] = keys[i];
    return result;
}
`,
    },
    {
      name: "Heap",
      whyNow:
        "Sorting puts every distinct value in order when only k of them are wanted. A heap of size k keeps just the frontrunners, so the cost follows k instead of the whole set of values.",
      summary:
        "Keep a min-heap of the k most frequent seen while iterating counts. Better than sorting when k ≪ distinct values; stdlib nlargest does exactly this.",
      complexity: { time: "O(n log k)", space: "O(n)" },
      python: `import heapq
from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    return heapq.nlargest(k, counts, key=counts.get)`,
      java: `public int[] topKFrequent(int[] nums, int k) {
    Map<Integer,Integer> counts = new HashMap<>();
    for (int num: nums) counts.put(num, counts.getOrDefault(num,0)+1);
    PriorityQueue<Map.Entry<Integer,Integer>> pq = new PriorityQueue<>(k, (a,b)->a.getValue()-b.getValue());
    for (Map.Entry<Integer,Integer> e: counts.entrySet()){
        if (pq.size()<k) pq.offer(e);
        else if (e.getValue()>pq.peek().getValue()){ pq.poll(); pq.offer(e);}    }
    int[] res = new int[k];
    int idx=k-1;
    while (!pq.isEmpty()) {res[idx--]=pq.poll().getKey();}
    return res;
}`,
      cpp: `vector<int> topKFrequent(const vector<int>& nums, int k) {
    unordered_map<int, int> counts;
    for (int num : nums) counts[num]++;
    auto cmp = [](const pair<int, int>& a, const pair<int, int>& b) {
        return a.second > b.second;
    };
    priority_queue<pair<int, int>, vector<pair<int, int>>, decltype(cmp)> pq(cmp);
    for (auto& p : counts) {
        if ((int)pq.size() < k) pq.push(p);
        else if (p.second > pq.top().second) { pq.pop(); pq.push(p); }
    }
    vector<int> res(k);
    int idx = k - 1;
    while (!pq.empty()) { res[idx--] = pq.top().first; pq.pop(); }
    return res;
}`,
    },
  ],
}
