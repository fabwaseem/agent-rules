import { rmSync } from "node:fs"
import { resolve } from "node:path"
import { applyPlan, planInstall } from "../src/install.ts"
import { packageRoot } from "../src/paths.ts"

const root = packageRoot(import.meta.url)
const rulesRoot = resolve(root, "rules")
const generated = [
  "AGENTS.md",
  "CLAUDE.md",
  ".cursor",
  ".github",
  ".claude",
  ".windsurf",
  ".devin",
]

const examples = [
  {
    dir: resolve(root, "examples/nextjs-saas"),
    stacks: ["core", "nextjs", "react", "tailwind", "shadcn", "prisma"],
  },
  {
    dir: resolve(root, "examples/nestjs-api"),
    stacks: ["core", "node", "nestjs", "drizzle"],
  },
]

for (const example of examples) {
  for (const entry of generated) rmSync(resolve(example.dir, entry), { recursive: true, force: true })
  const plan = planInstall({
    rulesRoot,
    target: example.dir,
    stacks: example.stacks,
    agents: ["agents", "claude", "cursor", "copilot", "skills", "windsurf"],
    force: false,
  })
  if (plan.conflicts.length > 0) {
    throw new Error(`conflicts in ${example.dir}: ${plan.conflicts.join(", ")}`)
  }
  applyPlan(plan)
  console.log(`refreshed ${example.dir} (${String(plan.writes.length)} files)`)
}
