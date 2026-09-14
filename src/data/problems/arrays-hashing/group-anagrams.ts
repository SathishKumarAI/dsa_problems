import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "group-anagrams",
  title: "Group the Anagrams Together",
  pattern: "arrays-hashing",
  difficulty: "medium",
  leetcode: "group-anagrams",
  brief: "Bucket words that are rearrangements of each other.",
  statement:
    "Given a list of lowercase words, group together the ones that are rearrangements of each other. Return the groups, each group sorted, and the groups themselves in sorted order so the answer is unambiguous.",
  constraints: [
    "1 <= words.length <= 10^4",
    "0 <= words[i].length <= 100, lowercase English letters",
    "the empty string is a legal word, and all empty strings belong to one group",
    "the answer here is sorted inside each group and between groups, so there is exactly one correct output",
  ],
  examples: [
    {
      input: 'words = ["eat", "tea", "tan", "ate", "nat", "bat"]',
      output: '[["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]',
    },
    {
      input: 'words = [""]',
      output: '[[""]]',
      note: "The empty string groups with itself.",
    },
  ],
  hints: [
    "Two words belong together when something about them is IDENTICAL. What is the same for every anagram of a word?",
    "Anything that survives rearrangement works as a key: the sorted letters, or the count of each letter.",
    "Build the key, then use it as a map key. The map does the grouping for you.",
  ],
  whyNow:
    "Sorting each word costs k log k just to make a label, and the label throws away nothing the counts do not already capture. A 26-slot tally is built in one pass over the word — linear in its length instead of linearithmic — and two anagrams produce the same tally by definition.",
  arc: "One question drives every rung: what is the KEY that makes two words the same? Comparing pairs avoids choosing a key and pays quadratically for it. Sorted letters are a valid key and cost k log k per word. A 26-slot count signature is the same key without sorting, built in k steps. Once the key exists, grouping is a hash map with a list per bucket — the part nobody argues about. The transferable habit is to look for a canonical form: anagram grouping, isomorphic strings, and 'group by shape' problems are all the same shape once the key is chosen. In an interview, name both keys and the trade — sorted strings are shorter to write, count signatures are faster and immune to long words.",
  approach:
    "Give every word a canonical key that is invariant under rearrangement, then let a hash map collect words by that key. The key here is the letter tally rendered as text: twenty-six counts joined by commas, which two anagrams always agree on and two non-anagrams never do. The separator matters — without it, counts of 1,11 and 11,1 would collide. Finally sort inside each group and between groups so the answer has one shape rather than many.",
  complexity: { time: "O(n · k)", space: "O(n · k)" },
  python: `def group_anagrams(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for w in words:
        counts = [0] * 26
        for ch in w:
            counts[ord(ch) - 97] += 1
        key = ",".join(str(c) for c in counts)
        groups.setdefault(key, []).append(w)
    return sorted(sorted(g) for g in groups.values())`,
  java: `public List<List<String>> groupAnagrams(String[] words) {
    Map<String, List<String>> groups = new HashMap<>();
    for (String w : words) {
        int[] counts = new int[26];
        for (int i = 0; i < w.length(); i++) counts[w.charAt(i) - 'a']++;
        StringBuilder key = new StringBuilder();
        for (int c : counts) {
            key.append(c);
            key.append(',');
        }
        groups.computeIfAbsent(key.toString(), k -> new ArrayList<>()).add(w);
    }
    List<List<String>> out = new ArrayList<>();
    for (List<String> g : groups.values()) {
        Collections.sort(g);
        out.add(g);
    }
    out.sort((a, b) -> {
        int n = Math.min(a.size(), b.size());
        for (int i = 0; i < n; i++) {
            int cmp = a.get(i).compareTo(b.get(i));
            if (cmp != 0) return cmp;
        }
        return a.size() - b.size();
    });
    return out;
}`,
  cpp: `vector<vector<string>> groupAnagrams(const vector<string>& words) {
    map<string, vector<string>> groups;
    for (const string& w : words) {
        vector<int> counts(26, 0);
        for (char ch : w) counts[ch - 'a']++;
        string key;
        for (int c : counts) {
            key += to_string(c);
            key += ',';
        }
        groups[key].push_back(w);
    }
    vector<vector<string>> out;
    for (auto& kv : groups) {
        sort(kv.second.begin(), kv.second.end());
        out.push_back(kv.second);
    }
    sort(out.begin(), out.end());
    return out;
}`,
  alternatives: [
    {
      name: "Compare every pair",
      summary:
        "For each word, scan the groups built so far for one whose first member is an anagram of it. Correct, and quadratic in the number of words with an anagram test inside every comparison — it asks whether two words match, over and over, instead of asking each word once what it IS.",
      complexity: { time: "O(n² · k)", space: "O(n · k)" },
      python: `def group_anagrams(words: list[str]) -> list[list[str]]:
    groups: list[list[str]] = []
    for w in words:
        placed = False
        for g in groups:
            if sorted(g[0]) == sorted(w):
                g.append(w)
                placed = True
                break
        if not placed:
            groups.append([w])
    return sorted(sorted(g) for g in groups)`,
      java: `public List<List<String>> groupAnagrams(String[] words) {
    List<List<String>> groups = new ArrayList<>();
    for (String w : words) {
        char[] a = w.toCharArray();
        Arrays.sort(a);
        boolean placed = false;
        for (List<String> g : groups) {
            char[] b = g.get(0).toCharArray();
            Arrays.sort(b);
            if (Arrays.equals(a, b)) {
                g.add(w);
                placed = true;
                break;
            }
        }
        if (!placed) {
            List<String> fresh = new ArrayList<>();
            fresh.add(w);
            groups.add(fresh);
        }
    }
    List<List<String>> out = new ArrayList<>();
    for (List<String> g : groups) {
        Collections.sort(g);
        out.add(g);
    }
    out.sort((a, b) -> {
        int n = Math.min(a.size(), b.size());
        for (int i = 0; i < n; i++) {
            int cmp = a.get(i).compareTo(b.get(i));
            if (cmp != 0) return cmp;
        }
        return a.size() - b.size();
    });
    return out;
}`,
      cpp: `vector<vector<string>> groupAnagrams(const vector<string>& words) {
    vector<vector<string>> groups;
    for (const string& w : words) {
        string a = w;
        sort(a.begin(), a.end());
        bool placed = false;
        for (vector<string>& g : groups) {
            string b = g[0];
            sort(b.begin(), b.end());
            if (a == b) {
                g.push_back(w);
                placed = true;
                break;
            }
        }
        if (!placed) groups.push_back({w});
    }
    for (vector<string>& g : groups) sort(g.begin(), g.end());
    sort(groups.begin(), groups.end());
    return groups;
}`,
    },
    {
      name: "Sorted letters as the key",
      summary:
        "Use the word's own letters, sorted, as a map key, so every anagram lands on the same string. The pairwise scan collapses to one pass, and the only remaining cost is the sort inside each key — k log k per word, paid to produce a label that a 26-slot count could produce in k.",
      complexity: { time: "O(n · k log k)", space: "O(n · k)" },
      python: `def group_anagrams(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for w in words:
        groups.setdefault("".join(sorted(w)), []).append(w)
    return sorted(sorted(g) for g in groups.values())`,
      java: `public List<List<String>> groupAnagrams(String[] words) {
    Map<String, List<String>> groups = new HashMap<>();
    for (String w : words) {
        char[] a = w.toCharArray();
        Arrays.sort(a);
        groups.computeIfAbsent(new String(a), k -> new ArrayList<>()).add(w);
    }
    List<List<String>> out = new ArrayList<>();
    for (List<String> g : groups.values()) {
        Collections.sort(g);
        out.add(g);
    }
    out.sort((a, b) -> {
        int n = Math.min(a.size(), b.size());
        for (int i = 0; i < n; i++) {
            int cmp = a.get(i).compareTo(b.get(i));
            if (cmp != 0) return cmp;
        }
        return a.size() - b.size();
    });
    return out;
}`,
      cpp: `vector<vector<string>> groupAnagrams(const vector<string>& words) {
    map<string, vector<string>> groups;
    for (const string& w : words) {
        string key = w;
        sort(key.begin(), key.end());
        groups[key].push_back(w);
    }
    vector<vector<string>> out;
    for (auto& kv : groups) {
        sort(kv.second.begin(), kv.second.end());
        out.push_back(kv.second);
    }
    sort(out.begin(), out.end());
    return out;
}`,
    },
  ],
}
