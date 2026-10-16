import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { STACK_IDS, type StackId } from "./types.ts"

export type PackageJson = {
  packageManager?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export type PackageManager = "pnpm" | "yarn" | "bun" | "npm"

export function readPackageJson(root: string): PackageJson | null {
  const path = resolve(root, "package.json")
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, "utf8")) as PackageJson
}

export function dependencyNames(pkg: PackageJson | null): Set<string> {
  return new Set([
    ...Object.keys(pkg?.dependencies ?? {}),
    ...Object.keys(pkg?.devDependencies ?? {}),
  ])
}

export function detectPackageManager(root: string, pkg: PackageJson | null = readPackageJson(root)): PackageManager {
  const field = pkg?.packageManager ?? ""
  if (field.startsWith("pnpm")) return "pnpm"
  if (field.startsWith("yarn")) return "yarn"
  if (field.startsWith("bun")) return "bun"
  if (field.startsWith("npm")) return "npm"
  if (existsSync(resolve(root, "pnpm-lock.yaml")) || existsSync(resolve(root, "pnpm-workspace.yaml"))) {
    return "pnpm"
  }
  if (existsSync(resolve(root, "yarn.lock"))) return "yarn"
  if (existsSync(resolve(root, "bun.lock")) || existsSync(resolve(root, "bun.lockb"))) return "bun"
  return "npm"
}

export function detectStacks(root: string): StackId[] {
  const pkg = readPackageJson(root)
  const deps = dependencyNames(pkg)
  const has = (name: string): boolean => deps.has(name)
  const hasPrefix = (prefix: string): boolean => [...deps].some((name) => name.startsWith(prefix))
  const detected = new Set<StackId>(["core"])
  if (has("next")) detected.add("nextjs")
  if (has("react") || has("react-dom") || has("next")) detected.add("react")
  if (has("@nestjs/core") || has("express") || has("fastify") || has("hono") || has("koa")) {
    detected.add("node")
  }
  if (has("@nestjs/core")) detected.add("nestjs")
  if (has("prisma") || has("@prisma/client")) detected.add("prisma")
  if (has("drizzle-orm")) detected.add("drizzle")
  if (has("tailwindcss") || has("@tailwindcss/postcss") || has("@tailwindcss/vite")) {
    detected.add("tailwind")
  }
  if (
    has("shadcn") ||
    has("@shadcn/react") ||
    has("@base-ui/react") ||
    hasPrefix("@radix-ui/") ||
    existsSync(resolve(root, "components.json"))
  ) {
    detected.add("shadcn")
  }
  return STACK_IDS.filter((id) => detected.has(id))
}
