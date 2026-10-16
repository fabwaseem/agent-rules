import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { detectPackageManager, type PackageManager } from "./detect.ts"
import { loadPack, normalizeSelection } from "./pack.ts"
import { copilotInstruction, cursorDocument, windsurfDocument, workspaceHeader } from "./render.ts"
import {
  AGENT_IDS,
  MARKER,
  type AgentId,
  type Pack,
  type RuleFile,
  type StackId,
  type StackMeta,
} from "./types.ts"

export type PlanInput = {
  rulesRoot: string
  target: string
  stacks: readonly string[]
  agents: readonly string[]
  force: boolean
  packageManager?: PackageManager
}

export type Plan = {
  writes: { path: string; contents: string }[]
  backups: { from: string; to: string }[]
  conflicts: string[]
  unchanged: string[]
  stacks: StackId[]
  agents: AgentId[]
  packageManager: PackageManager
}

function markerBegin(id: string): string {
  return `<!-- ${MARKER}:begin ${id} -->`
}

function markerEnd(id: string): string {
  return `<!-- ${MARKER}:end ${id} -->`
}

function renderBlock(id: string, content: string): string {
  return `${markerBegin(id)}\n${content.trim()}\n${markerEnd(id)}\n`
}

type Segment = { kind: "text"; text: string } | { kind: "block"; id: string }

function parseManaged(source: string): Segment[] | null {
  if (!source.includes(`<!-- ${MARKER}:begin `)) return null
  const re = new RegExp(
    `<!-- ${MARKER}:begin ([a-z0-9-]+) -->\\n[\\s\\S]*?<!-- ${MARKER}:end \\1 -->\\n?`,
    "g",
  )
  const segments: Segment[] = []
  let last = 0
  for (const match of source.matchAll(re)) {
    const index = match.index ?? 0
    const id = match[1]
    if (!id) continue
    if (index > last) segments.push({ kind: "text", text: source.slice(last, index) })
    segments.push({ kind: "block", id })
    last = index + match[0].length
  }
  if (last < source.length) segments.push({ kind: "text", text: source.slice(last) })
  return segments
}

export function mergeMarked(
  existing: string | null,
  blocks: readonly { id: string; content: string }[],
): { text: string; unmanaged: boolean } {
  if (existing === null) {
    return {
      text: `${blocks.map((block) => renderBlock(block.id, block.content)).join("\n")}`,
      unmanaged: false,
    }
  }
  const segments = parseManaged(existing)
  if (!segments) return { text: existing, unmanaged: true }
  const incoming = new Map(blocks.map((block) => [block.id, block.content]))
  const seen = new Set<string>()
  const parts: string[] = []
  for (const segment of segments) {
    if (segment.kind === "text") {
      parts.push(segment.text)
      continue
    }
    const content = incoming.get(segment.id)
    if (content === undefined) continue
    seen.add(segment.id)
    parts.push(renderBlock(segment.id, content))
  }
  for (const block of blocks) {
    if (!seen.has(block.id)) parts.push(`\n${renderBlock(block.id, block.content)}`)
  }
  let text = parts.join("").replace(/\n{3,}/g, "\n\n")
  if (!text.endsWith("\n")) text += "\n"
  return { text, unmanaged: false }
}

function selectedMeta(pack: Pack, stacks: readonly StackId[]): StackMeta[] {
  const want = new Set(stacks)
  return pack.stacks.filter((stack) => want.has(stack.id))
}

function selectedRules(pack: Pack, stacks: readonly StackId[]): RuleFile[] {
  const want = new Set(stacks)
  return pack.rules.filter((rule) => want.has(rule.stack))
}

function backupPath(path: string): string {
  const base = `${path}.bak`
  if (!existsSync(base)) return base
  for (let index = 1; index < 100; index += 1) {
    const candidate = `${base}.${String(index)}`
    if (!existsSync(candidate)) return candidate
  }
  throw new Error(`too many backups for ${path}`)
}

function consider(
  plan: Plan,
  path: string,
  contents: string,
  input: PlanInput,
  managed: boolean,
): void {
  const current = existsSync(path) ? readFileSync(path, "utf8") : null
  if (current === contents) {
    plan.unchanged.push(path)
    return
  }
  if (current !== null && !managed && !input.force) {
    plan.conflicts.push(path)
    return
  }
  if (current !== null && !managed && input.force) {
    plan.backups.push({ from: path, to: backupPath(path) })
  }
  plan.writes.push({ path, contents })
}

function writeMarked(
  plan: Plan,
  input: PlanInput,
  path: string,
  blocks: readonly { id: string; content: string }[],
): void {
  const existing = existsSync(path) ? readFileSync(path, "utf8") : null
  const merged = mergeMarked(existing, blocks)
  if (merged.unmanaged) {
    if (!input.force) {
      plan.conflicts.push(path)
      return
    }
    const fresh = mergeMarked(null, blocks).text
    consider(plan, path, fresh, input, false)
    return
  }
  consider(plan, path, merged.text, input, existing !== null)
}

export function planInstall(input: PlanInput): Plan {
  const pack = loadPack(input.rulesRoot)
  const stacks = normalizeSelection(
    input.stacks,
    pack.stacks.map((stack) => stack.id),
  )
  const agents = normalizeSelection(input.agents, AGENT_IDS)
  const packageManager = input.packageManager ?? detectPackageManager(input.target)
  const plan: Plan = {
    writes: [],
    backups: [],
    conflicts: [],
    unchanged: [],
    stacks,
    agents,
    packageManager,
  }
  const meta = selectedMeta(pack, stacks)
  const rules = selectedRules(pack, stacks)
  const agentSet = new Set(agents)

  if (agentSet.has("agents") || agentSet.has("claude")) {
    const sections = rules.map((rule) => ({ id: rule.id, content: rule.body }))
    if (agentSet.has("agents")) {
      writeMarked(plan, input, resolve(input.target, "AGENTS.md"), [
        {
          id: "header",
          content: workspaceHeader({
            title: "AGENTS.md",
            packageManager,
            stacks: meta,
            claude: false,
          }),
        },
        ...sections,
      ])
    }
    if (agentSet.has("claude")) {
      writeMarked(plan, input, resolve(input.target, "CLAUDE.md"), [
        {
          id: "header",
          content: workspaceHeader({
            title: "CLAUDE.md",
            packageManager,
            stacks: meta,
            claude: true,
          }),
        },
        ...sections,
      ])
    }
  }

  if (agentSet.has("cursor")) {
    for (const rule of rules) {
      consider(
        plan,
        resolve(input.target, ".cursor/rules", rule.filename),
        cursorDocument(rule),
        input,
        false,
      )
    }
  }

  if (agentSet.has("copilot")) {
    const rootRules = rules.filter((rule) => copilotInstruction(rule) === null)
    writeMarked(plan, input, resolve(input.target, ".github/copilot-instructions.md"), [
      {
        id: "header",
        content: workspaceHeader({
          title: "Copilot instructions",
          packageManager,
          stacks: meta,
          claude: false,
        }),
      },
      ...rootRules.map((rule) => ({ id: rule.id, content: rule.body })),
      {
        id: "paths",
        content:
          "Path-specific instructions for this install live in `.github/instructions/*.instructions.md`. Copilot applies each file when the active file matches its `applyTo` glob.",
      },
    ])
    for (const rule of rules) {
      const document = copilotInstruction(rule)
      if (!document) continue
      consider(
        plan,
        resolve(input.target, ".github/instructions", `${rule.id}.instructions.md`),
        document,
        input,
        false,
      )
    }
  }

  if (agentSet.has("skills")) {
    const want = new Set(stacks)
    for (const skill of pack.skills) {
      if (!want.has(skill.stack)) continue
      consider(
        plan,
        resolve(input.target, ".claude/skills", skill.dirName, "SKILL.md"),
        skill.raw.endsWith("\n") ? skill.raw : `${skill.raw}\n`,
        input,
        false,
      )
    }
  }

  if (agentSet.has("windsurf")) {
    for (const rule of rules) {
      const document = windsurfDocument(rule)
      for (const folder of [".windsurf/rules", ".devin/rules"]) {
        consider(plan, resolve(input.target, folder, `${rule.id}.md`), document, input, false)
      }
    }
  }

  return plan
}

export function applyPlan(plan: Plan): void {
  if (plan.conflicts.length > 0) {
    throw new Error(`refusing to overwrite unmanaged files: ${plan.conflicts.join(", ")}`)
  }
  for (const backup of plan.backups) {
    mkdirSync(dirname(backup.to), { recursive: true })
    renameSync(backup.from, backup.to)
  }
  for (const file of plan.writes) {
    mkdirSync(dirname(file.path), { recursive: true })
    writeFileSync(file.path, file.contents)
  }
}

export function install(input: PlanInput): Plan {
  const plan = planInstall(input)
  applyPlan(plan)
  return plan
}

export function displayPath(target: string, path: string): string {
  const rel = relative(target, path)
  return rel === "" ? path : rel
}
