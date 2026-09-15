// The trie load list.
//
// GENERATED in spirit, hand-owned in fact: add a problem by adding two lines.
// A load list is not the grouping — `problemsByPattern` filters the record's
// own `pattern` field — so moving a record between lists changes nothing a
// reader sees. The lists exist so there is one obvious place to register a new
// file, which is exactly what eight patterns went without.

import type { Problem } from "../../types.ts"
import { problem as implementTrie } from "../../../problems/implement-trie/index.ts"
import { problem as replaceWords } from "../../../problems/replace-words/index.ts"
import { problem as wildcardDictionary } from "../../../problems/wildcard-dictionary/index.ts"

export const trie: Problem[] = [
  implementTrie,
  replaceWords,
  wildcardDictionary,
]
