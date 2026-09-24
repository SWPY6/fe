import { readFileSync } from "node:fs"

const messagePath = process.argv[2]

if (!messagePath) {
  console.error("Commit message file path was not provided.")
  process.exit(2)
}

const message = readFileSync(messagePath, "utf8")

if (/\p{Script=Hangul}/u.test(message)) {
  console.error("Commit messages must be written in English.")
  process.exit(1)
}
