import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

/** Package root for a module that lives one directory under it (`src/` or `dist/`). */
export function packageRoot(importMetaUrl: string): string {
  return resolve(dirname(fileURLToPath(importMetaUrl)), "..")
}
