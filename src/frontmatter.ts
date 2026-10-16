import type { FrontmatterValue } from "./types.ts"

export function parseFrontmatter(raw: string): {
  attrs: Record<string, FrontmatterValue>
  body: string
} {
  const text = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n")
  if (!text.startsWith("---\n")) {
    throw new Error("frontmatter must open with --- on the first line")
  }
  const end = text.indexOf("\n---\n", 4)
  if (end === -1) {
    throw new Error("frontmatter is missing a closing ---")
  }
  const attrs: Record<string, FrontmatterValue> = {}
  for (const line of text.slice(4, end).split("\n")) {
    if (line.trim() === "") continue
    const match = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line)
    if (!match) throw new Error(`invalid frontmatter line: ${line}`)
    const key = match[1]
    if (!key) throw new Error("missing frontmatter key")
    if (key in attrs) throw new Error(`duplicate frontmatter key: ${key}`)
    const value = (match[2] ?? "").trim()
    if (value === "true" || value === "false") {
      attrs[key] = value === "true"
      continue
    }
    if (value.startsWith('"') && value.endsWith('"')) {
      try {
        const parsed: unknown = JSON.parse(value)
        if (typeof parsed !== "string") {
          throw new Error(`frontmatter value for ${key} must be a string`)
        }
        attrs[key] = parsed
      } catch (error) {
        const message = error instanceof Error ? error.message : "invalid string"
        throw new Error(`frontmatter value for ${key} is not valid JSON: ${message}`)
      }
      continue
    }
    if (value === "") throw new Error(`empty value for ${key}`)
    attrs[key] = value
  }
  return { attrs, body: text.slice(end + 5) }
}

export function requireString(
  attrs: Record<string, FrontmatterValue>,
  key: string,
): string {
  const value = attrs[key]
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${key} must be a non-empty string`)
  }
  return value
}
