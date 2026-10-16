export const STACK_IDS = [
  "core",
  "nextjs",
  "react",
  "node",
  "nestjs",
  "prisma",
  "drizzle",
  "tailwind",
  "shadcn",
] as const

export type StackId = (typeof STACK_IDS)[number]

export const AGENT_IDS = [
  "agents",
  "claude",
  "cursor",
  "copilot",
  "skills",
  "windsurf",
] as const

export type AgentId = (typeof AGENT_IDS)[number]

export type StackMeta = {
  id: StackId
  title: string
  description: string
  rules: string[]
  skills: string[]
}

export type RuleFile = {
  id: string
  stack: StackId
  filename: string
  description: string
  globs?: string
  alwaysApply: boolean
  body: string
  raw: string
  sourcePath: string
}

export type SkillFile = {
  name: string
  stack: StackId
  description: string
  raw: string
  dirName: string
  sourcePath: string
}

export type Pack = {
  stacks: StackMeta[]
  rules: RuleFile[]
  skills: SkillFile[]
}

export type FrontmatterValue = string | boolean

export const REPO_URL = "https://github.com/fabwaseem/agent-rules"
export const MARKER = "agentkit-rules"
export const WINDSURF_CHAR_LIMIT = 12_000
