// Minimal OpenAI-compatible client for a LOCAL model server (LM Studio on
// :1234, Ollama on :11434). No dependencies: this repo adds none, and a
// 30-line fetch wrapper is the whole surface we need.
//
// Owns: talking to the server, JSON extraction, retries on malformed output.
// Owns no policy about WHAT to generate — that lives in the task modules.

export const ENDPOINTS = {
  lmstudio: "http://localhost:1234/v1",
  ollama: "http://localhost:11434/v1",
}

export async function models(base) {
  const r = await fetch(`${base}/models`)
  const j = await r.json()
  return (j.data ?? []).map((m) => m.id)
}

/** one completion; returns { text, inTokens, outTokens, tokens, ms } */
export async function complete(
  { base, model, prompt, system, temperature = 0.2, maxTokens = 1200 },
  { timeoutMs = 180000 } = {}
) {
  const messages = []
  if (system) messages.push({ role: "system", content: system })
  messages.push({ role: "user", content: prompt })
  const t0 = Date.now()
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: ctl.signal,
    })
    if (!r.ok) throw new Error(`${r.status} ${await r.text().catch(() => "")}`)
    const j = await r.json()
    // Both halves, because only counting what came back hides the larger
    // number: the prompt carries the house style and two worked examples, so
    // input dominates output on this task (docs/MODELS.md).
    const inTokens = j.usage?.prompt_tokens ?? 0
    const outTokens = j.usage?.completion_tokens ?? 0
    return {
      text: j.choices?.[0]?.message?.content ?? "",
      inTokens,
      outTokens,
      tokens: outTokens, // kept: existing callers mean "produced"
      ms: Date.now() - t0,
    }
  } finally {
    clearTimeout(timer)
  }
}

/** pull the first JSON object out of a reply, tolerating prose and fences */
export function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = fenced ? fenced[1] : text
  const start = body.indexOf("{")
  if (start < 0) throw new Error("no JSON object in reply")
  // walk to the matching brace so trailing prose cannot break the parse
  let depth = 0
  let inStr = false
  let esc = false
  for (let i = start; i < body.length; i++) {
    const c = body[i]
    if (esc) {
      esc = false
      continue
    }
    if (c === "\\") {
      esc = true
      continue
    }
    if (c === '"') inStr = !inStr
    if (inStr) continue
    if (c === "{") depth++
    if (c === "}" && --depth === 0) return JSON.parse(body.slice(start, i + 1))
  }
  throw new Error("unbalanced JSON in reply")
}

/** complete → extract JSON → validate; retry with the failure fed back */
export async function completeJson(opts, validate, tries = 3) {
  let last = ""
  // a retry costs another prompt, so the totals accumulate across attempts
  let inTokens = 0
  let outTokens = 0
  for (let t = 0; t < tries; t++) {
    const reply = await complete({
      ...opts,
      prompt:
        t === 0
          ? opts.prompt
          : `${opts.prompt}\n\nYour previous reply was rejected: ${last}\nReturn ONLY the corrected JSON.`,
    })
    const { text, tokens, ms } = reply
    inTokens += reply.inTokens ?? 0
    outTokens += reply.outTokens ?? 0
    try {
      const value = extractJson(text)
      const problem = validate?.(value)
      if (problem) throw new Error(problem)
      return { value, tokens, inTokens, outTokens, ms, attempts: t + 1 }
    } catch (e) {
      last = e.message
    }
  }
  throw new Error(`gave up after ${tries} tries: ${last}`)
}
