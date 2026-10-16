import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { parseFrontmatter, requireString } from "./frontmatter.ts"
import {
  STACK_IDS,
  type Pack,
  type RuleFile,
  type SkillFile,
  type StackId,
  type StackMeta,
} from "./types.ts"

type IndexFile = {
  version: number
  stacks: StackMeta[]
}

function isStackId(value: string): value is StackId {
  return (STACK_IDS as readonly string[]).includes(value)
}

export function loadPack(rulesRoot: string): Pack {
  const index = JSON.parse(readFileSync(resolve(rulesRoot, "index.json"), "utf8")) as IndexFile
  if (index.version !== 1) {
    throw new Error(`unsupported rules index version: ${String(index.version)}`)
  }
  const rules: RuleFile[] = []
  const skills: SkillFile[] = []
  for (const stack of index.stacks) {
    if (!isStackId(stack.id)) throw new Error(`unknown stack id: ${stack.id}`)
    for (const file of stack.rules) {
      const sourcePath = resolve(rulesRoot, stack.id, file)
      const raw = readFileSync(sourcePath, "utf8")
      const { attrs, body } = parseFrontmatter(raw)
      if (typeof attrs.alwaysApply !== "boolean") {
        throw new Error(`${sourcePath}: alwaysApply must be a boolean`)
      }
      const description =
        attrs.description === undefined ? "" : requireString(attrs, "description")
      const globs = attrs.globs === undefined ? undefined : requireString(attrs, "globs")
      rules.push({
        id: file.replace(/\.mdc$/, ""),
        stack: stack.id,
        filename: file,
        description,
        globs,
        alwaysApply: attrs.alwaysApply,
        body: `${body.trim()}\n`,
        raw,
        sourcePath,
      })
    }
    for (const dirName of stack.skills) {
      const sourcePath = resolve(rulesRoot, stack.id, "skills", dirName, "SKILL.md")
      const raw = readFileSync(sourcePath, "utf8")
      const { attrs } = parseFrontmatter(raw)
      skills.push({
        name: typeof attrs.name === "string" ? attrs.name : "",
        stack: stack.id,
        description: typeof attrs.description === "string" ? attrs.description : "",
        raw,
        dirName,
        sourcePath,
      })
    }
  }
  return { stacks: index.stacks, rules, skills }
}

export function normalizeSelection<T extends string>(requested: readonly string[], allowed: readonly T[]): T[] {
  const known = new Set<string>(allowed)
  for (const id of requested) {
    if (!known.has(id)) {
      throw new Error(`Unknown "${id}". Expected one of: ${allowed.join(", ")}`)
    }
  }
  const want = new Set(requested)
  return allowed.filter((id) => want.has(id))
}
