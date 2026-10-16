#!/usr/bin/env node
import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { createInterface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { detectStacks } from "./detect.ts"
import { applyPlan, displayPath, planInstall } from "./install.ts"
import { loadPack } from "./pack.ts"
import { packageRoot } from "./paths.ts"
import { AGENT_IDS, type AgentId } from "./types.ts"
import { validatePath } from "./validate.ts"

type Command = "install" | "list" | "validate" | "help"

type Args = {
  command: Command
  target: string
  stacks?: string[]
  agents?: string[]
  yes: boolean
  force: boolean
  dryRun: boolean
}

function printHelp(): void {
  output.write(`agentkit-rules

Install modular AI coding-agent instructions into a project.

Usage
  agentkit-rules [install] [target] [options]
  agentkit-rules list
  agentkit-rules validate [target]

Options
  --stacks <ids>     Comma-separated stacks. core is recommended.
  --agents <ids>     agents,claude,cursor,copilot,skills,windsurf or all
  --yes, -y          Accept detected stacks and every agent format
  --force, -f        Back up unmanaged files that would be replaced
  --dry-run          Print the plan and write nothing
  --target <dir>     Project directory (default: the current directory)
  --help, -h         Show this help

Stacks
  core, nextjs, react, node, nestjs, prisma, drizzle, tailwind, shadcn

Detected from package.json unless you pass --stacks. core is always detected.
`)
}

function splitList(value: string): string[] {
  return value
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

function parseArgs(argv: readonly string[]): Args {
  const args: Args = {
    command: "install",
    target: process.cwd(),
    yes: false,
    force: false,
    dryRun: false,
  }
  const positionals: string[] = []
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index] ?? ""
    const next = argv[index + 1]
    const take = (flag: string): string => {
      if (!next || next.startsWith("-")) throw new Error(`${flag} requires a value`)
      index += 1
      return next
    }
    if (token === "--help" || token === "-h") args.command = "help"
    else if (token === "--yes" || token === "-y") args.yes = true
    else if (token === "--force" || token === "-f") args.force = true
    else if (token === "--dry-run") args.dryRun = true
    else if (token === "--stacks") args.stacks = splitList(take("--stacks"))
    else if (token === "--agents") args.agents = splitList(take("--agents"))
    else if (token === "--target") args.target = resolve(take("--target"))
    else if (token.startsWith("-")) throw new Error(`Unknown option ${token}`)
    else positionals.push(token)
  }
  const [first, second] = positionals
  if (first === "install" || first === "list" || first === "validate" || first === "help") {
    args.command = first
    if (second) args.target = resolve(second)
  } else if (first) {
    args.target = resolve(first)
    if (second) throw new Error(`Unexpected argument ${second}`)
  }
  if (positionals.length > 2) throw new Error(`Unexpected argument ${positionals[2] ?? ""}`)
  return args
}

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input, output })
  try {
    return (await rl.question(question)).trim()
  } finally {
    rl.close()
  }
}

function resolveAgents(value: readonly string[] | undefined): AgentId[] {
  if (!value || value.length === 0 || value.includes("all")) return [...AGENT_IDS]
  return value as AgentId[]
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  if (args.command === "help") {
    printHelp()
    return
  }
  const root = packageRoot(import.meta.url)
  const rulesRoot = resolve(root, "rules")
  if (args.command === "list") {
    const pack = loadPack(rulesRoot)
    output.write("Stacks\n")
    for (const stack of pack.stacks) {
      output.write(`  ${stack.id.padEnd(10)} ${stack.description}\n`)
    }
    output.write("\nAgents\n")
    output.write("  agents     AGENTS.md\n")
    output.write("  claude     CLAUDE.md\n")
    output.write("  cursor     .cursor/rules/*.mdc\n")
    output.write("  copilot    .github/copilot-instructions.md and .github/instructions\n")
    output.write("  skills     .claude/skills/*/SKILL.md\n")
    output.write("  windsurf   .windsurf/rules and .devin/rules\n")
    return
  }
  if (args.command === "validate") {
    const target = args.target
    const errors = validatePath(target)
    if (errors.length > 0) {
      for (const error of errors) console.error(error)
      process.exitCode = 1
      return
    }
    output.write(`Validated ${target}\n`)
    return
  }

  if (!existsSync(args.target)) {
    throw new Error(`Target does not exist: ${args.target}`)
  }
  const detected = detectStacks(args.target)
  let stacks = args.stacks
  let agents = args.agents ? resolveAgents(args.agents) : undefined
  const interactive = Boolean(input.isTTY) && !args.yes && !args.dryRun
  if (!stacks) {
    if (interactive) {
      const answer = await ask(`Stacks [${detected.join(",")}]: `)
      stacks = answer ? splitList(answer) : detected
    } else if (args.yes || args.dryRun) {
      stacks = detected
    } else {
      throw new Error("Pass --stacks or --yes. There is no interactive terminal.")
    }
  }
  if (!agents) {
    if (interactive) {
      const defaults = AGENT_IDS.join(",")
      const answer = await ask(`Agents [${defaults}]: `)
      agents = resolveAgents(answer ? splitList(answer) : [...AGENT_IDS])
    } else {
      agents = [...AGENT_IDS]
    }
  }
  const plan = planInstall({
    rulesRoot,
    target: args.target,
    stacks,
    agents,
    force: args.force,
  })
  if (plan.conflicts.length > 0) {
    console.error("These files are not managed by agentkit-rules and would change:")
    for (const path of plan.conflicts) console.error(`  ${displayPath(args.target, path)}`)
    console.error("Re-run with --force to back them up and replace them.")
    process.exitCode = 1
    return
  }
  const prefix = args.dryRun ? "dry-run" : "write"
  for (const file of plan.writes) output.write(`${prefix}  ${displayPath(args.target, file.path)}\n`)
  for (const file of plan.unchanged) output.write(`keep   ${displayPath(args.target, file)}\n`)
  for (const backup of plan.backups) {
    output.write(`backup ${displayPath(args.target, backup.from)} -> ${displayPath(args.target, backup.to)}\n`)
  }
  if (args.dryRun) return
  applyPlan(plan)
  output.write(
    `Installed ${plan.stacks.join(", ")} (${plan.agents.join(", ")}) with ${plan.packageManager}.\n`,
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
