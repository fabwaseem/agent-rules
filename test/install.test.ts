import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, resolve } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"
import { detectPackageManager, detectStacks } from "../src/detect.ts"
import { applyPlan, planInstall } from "../src/install.ts"
import { validateInstalled, validatePack } from "../src/validate.ts"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const rulesRoot = resolve(root, "rules")

function project(manifest: unknown): string {
  const dir = mkdtempSync(resolve(tmpdir(), "agentkit-"))
  writeFileSync(resolve(dir, "package.json"), JSON.stringify(manifest))
  return dir
}

test("detects stacks and the package manager", () => {
  const nextApp = project({
    packageManager: "pnpm@10.0.0",
    dependencies: { next: "16.4.0", react: "19.0.0", "@prisma/client": "7.0.0" },
    devDependencies: { tailwindcss: "4.0.0", typescript: "5.9.0" },
  })
  writeFileSync(resolve(nextApp, "components.json"), "{}")
  assert.deepEqual(detectStacks(nextApp), [
    "core",
    "nextjs",
    "react",
    "prisma",
    "tailwind",
    "shadcn",
  ])
  assert.equal(detectPackageManager(nextApp), "pnpm")

  const api = project({
    dependencies: { "@nestjs/core": "11.0.0", "drizzle-orm": "0.40.0" },
  })
  writeFileSync(resolve(api, "yarn.lock"), "")
  assert.deepEqual(detectStacks(api), ["core", "node", "nestjs", "drizzle"])
  assert.equal(detectPackageManager(api), "yarn")
  rmSync(nextApp, { recursive: true, force: true })
  rmSync(api, { recursive: true, force: true })
})

test("installs selected formats and refreshes managed blocks", () => {
  const target = project({ packageManager: "pnpm@10.0.0" })
  const first = planInstall({
    rulesRoot,
    target,
    stacks: ["core"],
    agents: ["agents", "cursor", "copilot", "skills", "windsurf"],
    force: false,
  })
  assert.equal(first.conflicts.length, 0)
  applyPlan(first)

  const agentsPath = resolve(target, "AGENTS.md")
  writeFileSync(agentsPath, `${readFileSync(agentsPath, "utf8")}\n<!-- user-note: keep me -->\n`)
  const cursorRule = readFileSync(resolve(target, ".cursor/rules/typescript.mdc"), "utf8")
  assert.match(cursorRule, /alwaysApply: false/)
  assert.match(cursorRule, /globs: "\*\*\/\*\.ts,\*\*\/\*\.tsx"/)
  assert.match(readFileSync(resolve(target, ".cursor/rules/git.mdc"), "utf8"), /alwaysApply: true/)
  assert.equal(
    readFileSync(resolve(target, ".windsurf/rules/git.md"), "utf8"),
    readFileSync(resolve(target, ".devin/rules/git.md"), "utf8"),
  )
  assert.match(readFileSync(resolve(target, ".windsurf/rules/git.md"), "utf8"), /trigger: always_on/)
  assert.match(
    readFileSync(resolve(target, ".windsurf/rules/performance.md"), "utf8"),
    /trigger: model_decision/,
  )
  assert.match(readFileSync(resolve(target, ".claude/skills/security-review/SKILL.md"), "utf8"), /name: security-review/)
  const copilot = readFileSync(resolve(target, ".github/copilot-instructions.md"), "utf8")
  assert.match(copilot, /# Git/)
  assert.doesNotMatch(copilot, /# TypeScript/)
  assert.match(
    readFileSync(resolve(target, ".github/instructions/typescript.instructions.md"), "utf8"),
    /applyTo: "\*\*\/\*\.ts,\*\*\/\*\.tsx"/,
  )

  const second = planInstall({
    rulesRoot,
    target,
    stacks: ["core", "react"],
    agents: ["agents"],
    force: false,
  })
  assert.equal(second.conflicts.length, 0)
  applyPlan(second)
  const updated = readFileSync(agentsPath, "utf8")
  assert.match(updated, /user-note: keep me/)
  assert.match(updated, /# React/)

  const third = planInstall({
    rulesRoot,
    target,
    stacks: ["core"],
    agents: ["agents"],
    force: false,
  })
  applyPlan(third)
  const trimmed = readFileSync(agentsPath, "utf8")
  assert.match(trimmed, /user-note: keep me/)
  assert.doesNotMatch(trimmed, /# React/)
  assert.equal(validateInstalled(target).length, 0)
  rmSync(target, { recursive: true, force: true })
})

test("refuses to replace an unmanaged AGENTS.md unless forced", () => {
  const target = project({})
  writeFileSync(resolve(target, "AGENTS.md"), "# Local notes\n")
  const blocked = planInstall({
    rulesRoot,
    target,
    stacks: ["core"],
    agents: ["agents"],
    force: false,
  })
  assert.equal(blocked.conflicts.length, 1)
  assert.equal(readFileSync(resolve(target, "AGENTS.md"), "utf8"), "# Local notes\n")

  const forced = planInstall({
    rulesRoot,
    target,
    stacks: ["core"],
    agents: ["agents"],
    force: true,
  })
  applyPlan(forced)
  assert.match(readFileSync(resolve(target, "AGENTS.md"), "utf8"), /agentkit-rules:begin header/)
  assert.match(readFileSync(resolve(target, "AGENTS.md.bak"), "utf8"), /Local notes/)
  rmSync(target, { recursive: true, force: true })
})

test("the pack frontmatter validates and the CLI lists stacks", () => {
  assert.deepEqual(validatePack(rulesRoot), [])
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", resolve(root, "src/cli.ts"), "list"],
    { encoding: "utf8" },
  )
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /nextjs/)
  assert.match(result.stdout, /windsurf/)
})

test("committed examples match a fresh install", () => {
  const examples = [
    {
      dir: resolve(root, "examples/nextjs-saas"),
      stacks: ["core", "nextjs", "react", "tailwind", "shadcn", "prisma"],
    },
    {
      dir: resolve(root, "examples/nestjs-api"),
      stacks: ["core", "node", "nestjs", "drizzle"],
    },
  ] as const
  for (const example of examples) {
    const plan = planInstall({
      rulesRoot,
      target: example.dir,
      stacks: [...example.stacks],
      agents: ["agents", "claude", "cursor", "copilot", "skills", "windsurf"],
      force: false,
    })
    assert.deepEqual(plan.conflicts, [])
    assert.deepEqual(plan.writes, [])
    assert.equal(validateInstalled(example.dir).length, 0)
  }
})

test("rejects an unknown stack", () => {
  const target = project({})
  assert.throws(
    () =>
      planInstall({
        rulesRoot,
        target,
        stacks: ["django"],
        agents: ["cursor"],
        force: false,
      }),
    /Unknown "django"/,
  )
  rmSync(target, { recursive: true, force: true })
})

test("a cursor rule without alwaysApply fails validation", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "agentkit-bad-"))
  mkdirSync(resolve(dir, ".cursor/rules"), { recursive: true })
  writeFileSync(
    resolve(dir, ".cursor/rules/broken.mdc"),
    "---\ndescription: \"Missing the apply flag\"\n---\n\n# Broken\n\nThis body is long enough to pass the length check and still fail the schema.\n",
  )
  const errors = validateInstalled(dir)
  assert.ok(errors.some((error) => error.includes("alwaysApply")))
  rmSync(dir, { recursive: true, force: true })
})
