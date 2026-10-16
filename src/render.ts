import type { RuleFile, StackMeta } from "./types.ts"
import { REPO_URL } from "./types.ts"

export function cursorDocument(rule: RuleFile): string {
  return rule.raw.endsWith("\n") ? rule.raw : `${rule.raw}\n`
}

export function windsurfDocument(rule: RuleFile): string {
  const lines = ["---"]
  if (rule.alwaysApply) {
    lines.push("trigger: always_on")
  } else if (rule.globs) {
    lines.push("trigger: glob", `globs: ${JSON.stringify(rule.globs)}`)
  } else {
    lines.push("trigger: model_decision")
  }
  if (rule.description) lines.push(`description: ${JSON.stringify(rule.description)}`)
  lines.push("---", "", rule.body)
  return lines.join("\n")
}

export function copilotInstruction(rule: RuleFile): string | null {
  if (rule.alwaysApply || !rule.globs) return null
  return `---\napplyTo: ${JSON.stringify(rule.globs)}\n---\n\n${rule.body}`
}

export function workspaceHeader(input: {
  title: string
  packageManager: string
  stacks: readonly StackMeta[]
  claude: boolean
}): string {
  const stacks = input.stacks
    .map((stack) => `- \`${stack.id}\`: ${stack.description}`)
    .join("\n")
  const bothClients =
    input.stacks.some((stack) => stack.id === "prisma") &&
    input.stacks.some((stack) => stack.id === "drizzle")
  const claude = input.claude
    ? `Claude Code loads this file as project memory. The same constraints are written to AGENTS.md for other agents. When a task is a procedure, invoke the matching skill under \`.claude/skills\` instead of improvising the steps.

- Do not widen permissions, skip hooks, or disable tests to get a change through.
- Ask before destructive git, a production deploy, or a migration that drops or rewrites data.
- After a code change, run typecheck and the narrowest test that covers it.

`
    : ""
  const database = bothClients
    ? "\n- Prisma and Drizzle are both installed. Use the client the module already uses. Do not add the other one to that module.\n"
    : ""
  return `# ${input.title}

${claude}Instructions for coding agents in this repository. Blocks marked \`agentkit-rules\` are rewritten by [agentkit-rules](${REPO_URL}). Text outside the markers is left as you wrote it.

## Workspace

- Package manager: \`${input.packageManager}\`. Use it for installs, scripts, and one-off binaries. Do not add a second lockfile or switch package managers.
- A nested AGENTS.md overrides this file for its directory tree.
- Do not hand-edit generated output (\`dist/\`, \`.next/\`, coverage, or generated database clients).
- Match the public types and error style of a module you are extending. These rules govern new code; they are not a license for a drive-by rewrite.
${database}
## Installed stacks

${stacks}
`
}
