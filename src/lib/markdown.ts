// A markdown parser for ONE corpus: `docs/learn/*.md`.
//
// It is deliberately not a markdown implementation. The corpus is measured,
// and re-measured when it changes — which has already happened once. Written
// against the 80 authored documents (headings levels 1-3 only, quote callouts,
// tables, fences, bullets, and ZERO links or HTML), it then had to grow when
// docs/learn merged those documents with the generated pages: that corpus has
// 2 003 links, 879 `<details>` folds and an HTML comment banner on every one of
// the 127 pages. Still no images, nested lists or numbered lists, so those are
// still unsupported.
//
// The lesson, since it cost a rendering bug on a live page: a measurement is
// true of the corpus you measured. Re-run it when the corpus changes:
//   grep -ho '\[[^]]*\]([^)]*)' docs/learn/*.md | wc -l
//
// Two rules that came out of the measurement rather than out of taste:
//
//   * `_underscores_` are NOT italics here. The corpus is full of Python
//     identifiers — `max_depth`, `node.left`, `_bug_root_only` — and treating
//     them as emphasis mangles the code these documents are made of. Only
//     `*asterisks*` (1 757 of them) mean italic.
//   * Code spans are tokenised FIRST, so `**` and `*` inside `` `a ** b` ``
//     stay literal.
//
// This module is DOM-free and pure, so `markdown.test.ts` can run it under
// `node --test` with no browser. Rendering lives in `components/markdown.tsx`.

export type Span =
  | { kind: "text"; text: string }
  | { kind: "code"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "italic"; text: string }
  | { kind: "link"; text: string; href: string }

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "code"; lang: string; code: string }
  | { kind: "quote"; label?: string; paragraphs: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "list"; items: string[] }
  | { kind: "details"; summary: string; blocks: Block[] }
  | { kind: "rule" }

// Code first of all, so nothing inside a span is re-parsed; then links, whose
// brackets would otherwise survive as literal text; then `**bold**` before
// `*italic*`, so the longer marker wins.
const INLINE = /(`[^`]+`|\[[^\]\n]+\]\([^)\s]+\)|\*\*[^*]+\*\*|\*[^*\n]+\*)/g

export function inlineSpans(text: string): Span[] {
  const out: Span[] = []
  for (const piece of text.split(INLINE)) {
    if (!piece) continue
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(piece)
    if (piece.length > 1 && piece.startsWith("`") && piece.endsWith("`")) {
      out.push({ kind: "code", text: piece.slice(1, -1) })
    } else if (link) {
      out.push({ kind: "link", text: link[1], href: link[2] })
    } else if (piece.length > 4 && piece.startsWith("**") && piece.endsWith("**")) {
      out.push({ kind: "bold", text: piece.slice(2, -2) })
    } else if (piece.length > 2 && piece.startsWith("*") && piece.endsWith("*")) {
      out.push({ kind: "italic", text: piece.slice(1, -1) })
    } else {
      out.push({ kind: "text", text: piece })
    }
  }
  return out
}

const cells = (row: string) =>
  row
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim())

const isSeparator = (line: string) => /^\s*\|?[\s:-]*-[\s:|-]*$/.test(line) && line.includes("-")

// The document's own title (`# …`) is parsed like any other heading; the PAGE
// decides not to render it twice (see `titleOf`).
export function parseMarkdown(source: string): Block[] {
  // CRLF: git checks these files out with Windows endings, and a parser that
  // splits on "\n" alone leaves a trailing \r on every line — which turns a
  // fence into "```python\r" and matches nothing (CLAUDE.md, the CRLF trap).
  //
  // HTML comments go first and whole: every generated page opens with a "do
  // not edit this, edit the data" banner meant for whoever opens the file, not
  // for a reader. Stripped before anything else, so a comment spanning several
  // lines cannot leave half of itself behind as a paragraph.
  const lines = source
    .replace(/\r\n/g, "\n")
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
      continue
    }

    // fenced code — taken first, so nothing inside it is parsed as anything
    const fence = /^```(\w*)\s*$/.exec(line)
    if (fence) {
      const body: string[] = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++])
      i++ // the closing fence
      blocks.push({ kind: "code", lang: fence[1] || "text", code: body.join("\n") })
      continue
    }

    // <details><summary>…</summary> … </details> — how the generated pages fold
    // the hints and the Java/C++ blocks away. The inner markdown is parsed by
    // the same function, so a fold can hold code, tables, anything.
    if (/^<details>\s*$/.test(line)) {
      i++
      let summary = ""
      const inner: string[] = []
      let depth = 1
      while (i < lines.length) {
        const l = lines[i]
        if (/^<details>\s*$/.test(l)) depth++
        if (/^<\/details>\s*$/.test(l)) {
          depth--
          if (depth === 0) {
            i++
            break
          }
        }
        const sum = /^<summary>(.*)<\/summary>\s*$/.exec(l)
        if (sum && !summary) summary = sum[1]
        else inner.push(l)
        i++
      }
      blocks.push({
        kind: "details",
        summary: summary || "Show more",
        blocks: parseMarkdown(inner.join("\n")),
      })
      continue
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading) {
      blocks.push({
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2].trim(),
      })
      i++
      continue
    }

    if (/^-{3,}\s*$/.test(line)) {
      blocks.push({ kind: "rule" })
      i++
      continue
    }

    if (line.startsWith(">")) {
      const paragraphs: string[] = []
      let buffer: string[] = []
      while (i < lines.length && lines[i].startsWith(">")) {
        const content = lines[i].replace(/^>\s?/, "")
        if (content.trim()) buffer.push(content)
        else if (buffer.length) {
          paragraphs.push(buffer.join(" "))
          buffer = []
        }
        i++
      }
      if (buffer.length) paragraphs.push(buffer.join(" "))
      // "**Intuition.** the mental model" -> label + the rest
      const labelled = /^\*\*([^*]+)\*\*\s*(.*)$/s.exec(paragraphs[0] ?? "")
      if (labelled) {
        paragraphs[0] = labelled[2]
        blocks.push({ kind: "quote", label: labelled[1], paragraphs })
      } else {
        blocks.push({ kind: "quote", paragraphs })
      }
      continue
    }

    if (line.trimStart().startsWith("|") && isSeparator(lines[i + 1] ?? "")) {
      const head = cells(line)
      const rows: string[][] = []
      i += 2
      while (i < lines.length && lines[i].trimStart().startsWith("|")) {
        rows.push(cells(lines[i]))
        i++
      }
      blocks.push({ kind: "table", head, rows })
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        const item = [lines[i].replace(/^[-*]\s+/, "")]
        i++
        // a wrapped continuation line is indented and is part of the same item
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) {
          item.push(lines[i].trim())
          i++
        }
        items.push(item.join(" "))
      }
      blocks.push({ kind: "list", items })
      continue
    }

    // a paragraph: hard-wrapped in this corpus, so the lines rejoin with a space
    const paragraph: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith(">") &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !/^-{3,}\s*$/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^<\/?details>\s*$/.test(lines[i]) &&
      !(lines[i].trimStart().startsWith("|") && isSeparator(lines[i + 1] ?? ""))
    ) {
      paragraph.push(lines[i].trim())
      i++
    }
    if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join(" ") })
    else i++
  }

  return blocks
}

// The `##` and `###` headings, for the page's contents rail.
export interface Outline {
  id: string
  text: string
  level: 2 | 3
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

export const outlineOf = (blocks: Block[]): Outline[] =>
  blocks
    .filter((b): b is Block & { kind: "heading" } => b.kind === "heading" && b.level > 1)
    .map((b) => ({ id: slugify(b.text), text: b.text, level: b.level as 2 | 3 }))

export const titleOf = (blocks: Block[]): string | undefined =>
  blocks.find(
    (b): b is Block & { kind: "heading" } => b.kind === "heading" && b.level === 1
  )?.text
