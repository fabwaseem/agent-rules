import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { parseFrontmatter } from "./frontmatter.ts"
import { loadPack } from "./pack.ts"
import { packageRoot } from "./paths.ts"
import { windsurfDocument } from "./render.ts"
import { STACK_IDS, WINDSURF_CHAR_LIMIT, type FrontmatterValue, type StackId } from "./types.ts"

const CURSOR_KEYS = new Set(["description", "globs", "alwaysApply"])
const SKILL_KEYS = new Set(["name", "description"])
const WINDSURF_KEYS = new Set(["trigger", "globs", "description"])
const COPILOT_KEYS = new Set(["applyTo"])
const TRIGGERS = new Set(["always_on", "glob", "model_decision", "manual"])

function walk(dir: string, predicate: (path: string) => boolean): string[] {
  if (!existsSync(dir)) return []
  const found: string[] = []
  for (const entry of readdirSync(dir)) {
    const path = resolve(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) found.push(...walk(path, predicate))
    else if (predicate(path)) found.push(path)
  }
  return found
}

function rel(root: string, path: string): string {
  return relative(root, path) || path
}

function keysOf(attrs: Record<string, FrontmatterValue>): string[] {
  return Object.keys(attrs)
}

export function validateCursor(path: string, raw: string): string[] {
  const errors: string[] = []
  let attrs: Record<string, FrontmatterValue>
  let body: string
  try {
    const parsed = parseFrontmatter(raw)
    attrs = parsed.attrs
    body = parsed.body
  } catch (error) {
    return [`${path}: ${error instanceof Error ? error.message : "invalid frontmatter"}`]
  }
  for (const key of keysOf(attrs)) {
    if (!CURSOR_KEYS.has(key)) errors.push(`${path}: unknown frontmatter key "${key}"`)
  }
  if (typeof attrs.alwaysApply !== "boolean") {
    errors.push(`${path}: alwaysApply must be true or false`)
  }
  if (typeof attrs.description !== "string" || attrs.description.trim() === "") {
    errors.push(`${path}: description must be a non-empty string`)
  }
  const always = attrs.alwaysApply === true
  if (attrs.globs !== undefined && typeof attrs.globs !== "string") {
    errors.push(`${path}: globs must be a string of comma-separated patterns`)
  }
  if (!always && (typeof attrs.globs !== "string" || attrs.globs.trim() === "") && typeof attrs.description !== "string") {
    errors.push(`${path}: a rule that is not always applied needs globs or a description`)
  }
  if (typeof attrs.globs === "string" && /[\n\r]/.test(attrs.globs)) {
    errors.push(`${path}: globs must be a single line`)
  }
  if (body.trim().length < 80) errors.push(`${path}: rule body is too short to be useful`)
  return errors
}

export function validateSkill(path: string, raw: string, directoryName?: string): string[] {
  const errors: string[] = []
  let attrs: Record<string, FrontmatterValue>
  let body: string
  try {
    const parsed = parseFrontmatter(raw)
    attrs = parsed.attrs
    body = parsed.body
  } catch (error) {
    return [`${path}: ${error instanceof Error ? error.message : "invalid frontmatter"}`]
  }
  for (const key of keysOf(attrs)) {
    if (!SKILL_KEYS.has(key)) errors.push(`${path}: unknown skill frontmatter key "${key}"`)
  }
  const name = attrs.name
  const description = attrs.description
  if (typeof name !== "string" || !/^[a-z0-9-]{1,64}$/.test(name)) {
    errors.push(`${path}: name must be 1-64 chars of lowercase letters, numbers, and hyphens`)
  } else {
    if (name.includes("anthropic") || name.includes("claude")) {
      errors.push(`${path}: name must not contain reserved words anthropic or claude`)
    }
    const folder = directoryName ?? dirname(path).split("/").at(-1)
    if (folder && name !== folder) errors.push(`${path}: name "${name}" must match directory "${folder}"`)
  }
  if (typeof description !== "string" || description.trim() === "" || description.length > 1024) {
    errors.push(`${path}: description must be a non-empty string of at most 1024 characters`)
  } else if (/[<>]/.test(description)) {
    errors.push(`${path}: description must not contain XML tags`)
  }
  if (body.trim().length < 40) errors.push(`${path}: skill body is too short`)
  return errors
}

export function validateWindsurf(path: string, raw: string): string[] {
  const errors: string[] = []
  if (raw.length > WINDSURF_CHAR_LIMIT) {
    errors.push(`${path}: Windsurf workspace rules must stay within ${WINDSURF_CHAR_LIMIT} characters`)
  }
  let attrs: Record<string, FrontmatterValue>
  try {
    attrs = parseFrontmatter(raw).attrs
  } catch (error) {
    return [`${path}: ${error instanceof Error ? error.message : "invalid frontmatter"}`]
  }
  for (const key of keysOf(attrs)) {
    if (!WINDSURF_KEYS.has(key)) errors.push(`${path}: unknown Windsurf frontmatter key "${key}"`)
  }
  const trigger = attrs.trigger
  if (typeof trigger !== "string" || !TRIGGERS.has(trigger)) {
    errors.push(`${path}: trigger must be always_on, glob, model_decision, or manual`)
    return errors
  }
  if (trigger === "glob" && (typeof attrs.globs !== "string" || attrs.globs.trim() === "")) {
    errors.push(`${path}: glob trigger requires globs`)
  }
  if (trigger === "model_decision" && (typeof attrs.description !== "string" || attrs.description.trim() === "")) {
    errors.push(`${path}: model_decision trigger requires description`)
  }
  return errors
}

export function validateCopilotInstruction(path: string, raw: string): string[] {
  const errors: string[] = []
  let attrs: Record<string, FrontmatterValue>
  try {
    attrs = parseFrontmatter(raw).attrs
  } catch (error) {
    return [`${path}: ${error instanceof Error ? error.message : "invalid frontmatter"}`]
  }
  for (const key of keysOf(attrs)) {
    if (!COPILOT_KEYS.has(key)) errors.push(`${path}: unknown Copilot frontmatter key "${key}"`)
  }
  if (typeof attrs.applyTo !== "string" || attrs.applyTo.trim() === "") {
    errors.push(`${path}: applyTo must be a non-empty glob string`)
  }
  return errors
}

export function validatePack(rulesRoot: string): string[] {
  const errors: string[] = []
  let pack
  try {
    pack = loadPack(rulesRoot)
  } catch (error) {
    return [`${rulesRoot}: ${error instanceof Error ? error.message : "failed to load pack"}`]
  }
  const ids = pack.stacks.map((stack) => stack.id)
  if (ids.length !== new Set(ids).size) errors.push("duplicate stack id in rules/index.json")
  const expected = [...STACK_IDS]
  if (ids.join(",") !== expected.join(",")) {
    errors.push(`rules/index.json stacks must be ${expected.join(", ")} in that order`)
  }
  const listedRules = new Set(pack.rules.map((rule) => rule.sourcePath))
  const onDisk = walk(rulesRoot, (path) => path.endsWith(".mdc"))
  for (const path of onDisk) {
    if (!listedRules.has(path)) errors.push(`${rel(rulesRoot, path)}: .mdc file is not listed in rules/index.json`)
  }
  const seenIds = new Set<string>()
  for (const rule of pack.rules) {
    if (seenIds.has(rule.id)) errors.push(`${rule.sourcePath}: duplicate rule id ${rule.id}`)
    seenIds.add(rule.id)
    errors.push(...validateCursor(rel(rulesRoot, rule.sourcePath), rule.raw))
    if (!rule.alwaysApply && !rule.globs) {
      if (!rule.description) errors.push(`${rule.sourcePath}: intelligent rules need a description`)
    }
    errors.push(...validateWindsurf(`${rule.id}.md`, windsurfDocument(rule)))
  }
  const listedSkills = new Set(pack.skills.map((skill) => skill.sourcePath))
  for (const path of walk(rulesRoot, (file) => file.endsWith("/SKILL.md") || file.endsWith("\\SKILL.md"))) {
    if (!listedSkills.has(path)) {
      errors.push(`${rel(rulesRoot, path)}: skill is not listed in rules/index.json`)
    }
  }
  for (const skill of pack.skills) {
    errors.push(...validateSkill(rel(rulesRoot, skill.sourcePath), skill.raw, skill.dirName))
  }
  for (const stack of pack.stacks) {
    if (!isKnownStack(stack.id)) errors.push(`unknown stack ${stack.id}`)
    if (stack.rules.length === 0) errors.push(`${stack.id}: stack has no rules`)
  }
  return errors
}

function isKnownStack(id: string): id is StackId {
  return (STACK_IDS as readonly string[]).includes(id)
}

export function validateInstalled(root: string): string[] {
  const errors: string[] = []
  const cursorFiles = walk(resolve(root, ".cursor/rules"), (path) => path.endsWith(".mdc"))
  const skills = walk(resolve(root, ".claude/skills"), (path) => path.endsWith("SKILL.md"))
  const windsurf = walk(resolve(root, ".windsurf/rules"), (path) => path.endsWith(".md"))
  const devin = walk(resolve(root, ".devin/rules"), (path) => path.endsWith(".md"))
  const instructions = walk(resolve(root, ".github/instructions"), (path) => path.endsWith(".instructions.md"))
  if (
    cursorFiles.length + skills.length + windsurf.length + devin.length + instructions.length ===
    0
  ) {
    errors.push(`${root}: no Cursor, skill, Windsurf, or Copilot instruction files found`)
  }
  for (const path of cursorFiles) errors.push(...validateCursor(rel(root, path), readFileSync(path, "utf8")))
  for (const path of skills) {
    errors.push(...validateSkill(rel(root, path), readFileSync(path, "utf8")))
  }
  for (const path of [...windsurf, ...devin]) {
    errors.push(...validateWindsurf(rel(root, path), readFileSync(path, "utf8")))
  }
  for (const path of instructions) {
    errors.push(...validateCopilotInstruction(rel(root, path), readFileSync(path, "utf8")))
  }
  const windsurfNames = new Map(windsurf.map((path) => [path.split("/").at(-1) ?? path, readFileSync(path, "utf8")]))
  const devinNames = new Map(devin.map((path) => [path.split("/").at(-1) ?? path, readFileSync(path, "utf8")]))
  if (windsurf.length > 0 && devin.length > 0) {
    for (const [name, contents] of windsurfNames) {
      const other = devinNames.get(name)
      if (other === undefined) errors.push(`${root}: .devin/rules/${name} is missing the Windsurf copy`)
      else if (other !== contents) errors.push(`${root}: .devin/rules/${name} does not match .windsurf/rules/${name}`)
    }
    for (const name of devinNames.keys()) {
      if (!windsurfNames.has(name)) errors.push(`${root}: .windsurf/rules/${name} is missing the Devin copy`)
    }
  }
  return errors
}

export function validateRepository(root: string): string[] {
  const errors = validatePack(resolve(root, "rules")).map((error) =>
    error.startsWith("rules/") || error.startsWith("/") ? error : `rules: ${error}`,
  )
  const kitRule = resolve(root, ".cursor/rules")
  for (const path of walk(kitRule, (file) => file.endsWith(".mdc"))) {
    errors.push(...validateCursor(rel(root, path), readFileSync(path, "utf8")))
  }
  for (const path of walk(resolve(root, ".claude/skills"), (file) => file.endsWith("SKILL.md"))) {
    errors.push(...validateSkill(rel(root, path), readFileSync(path, "utf8")))
  }
  for (const example of ["examples/nextjs-saas", "examples/nestjs-api"]) {
    const dir = resolve(root, example)
    if (!existsSync(dir)) {
      errors.push(`${example}: missing example`)
      continue
    }
    for (const error of validateInstalled(dir)) errors.push(`${example}: ${error}`)
  }
  return errors
}

export function validatePath(dir: string): string[] {
  if (existsSync(resolve(dir, "rules/index.json"))) return validateRepository(dir)
  return validateInstalled(dir)
}

export function defaultRepositoryRoot(): string {
  return packageRoot(import.meta.url)
}
