import { packageRoot } from "./paths.ts"
import { validatePath } from "./validate.ts"

const target = process.argv[2] ? process.argv[2] : packageRoot(import.meta.url)
const errors = validatePath(target)
if (errors.length > 0) {
  for (const error of errors) console.error(error)
  process.exitCode = 1
} else {
  console.log(`Validated ${target}`)
}
