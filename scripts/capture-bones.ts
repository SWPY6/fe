import { spawn } from "node:child_process"
import { createHash } from "node:crypto"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"

import { chromium } from "playwright"
import { createServer } from "vite"

import { boneBreakpoints, bonesDirectory, boneWidthStyles, sourceBoneIds } from "./boneyard.ts"

const root = process.cwd()
const output = resolve(root, bonesDirectory)
const expected = sourceBoneIds(root)
if (!expected.length || new Set(expected).size !== expected.length)
  throw new Error("Invalid BoneSuspense source IDs")
if (process.env.VITE_ENABLE_MSW === "true")
  throw new Error("Capture requires the real API, not MSW")

mkdirSync(resolve(root, "node_modules/.tmp"), { recursive: true })
const temporary = mkdtempSync(resolve(root, "node_modules/.tmp/bones-capture-"))
const staged = join(temporary, "bones")
mkdirSync(staged)
const require = createRequire(import.meta.url)
const cli = join(dirname(require.resolve("boneyard-js/package.json")), "bin/cli.js")
const server = await createServer({ server: { host: "127.0.0.1", port: 5174, strictPort: true } })
let context: Awaited<ReturnType<typeof chromium.launchPersistentContext>> | undefined

function completeCapture(data: {
  breakpoints?: Record<string, { width: number; height: number; bones: unknown[] }>
}) {
  return boneBreakpoints.every((width) => {
    const value = data.breakpoints?.[width]
    return value && value.width > 0 && value.height > 0 && value.bones.length > 0
  })
}

async function capture(urls: string[], directory: string, cdp: string, force: boolean) {
  console.log(`Capturing real pages: ${urls.join(", ")}`)
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(
      process.execPath,
      [
        cli,
        "build",
        ...urls,
        "--out",
        directory,
        "--breakpoints",
        boneBreakpoints.join(","),
        "--wait",
        "2000",
        "--no-scan",
        "--cdp",
        cdp,
        ...(force ? ["--force"] : []),
      ],
      { cwd: root, stdio: "inherit" },
    )
    child.once("error", reject)
    child.once("exit", (code) =>
      code === 0 ? resolvePromise() : reject(new Error(`boneyard exited ${code}`)),
    )
  })
}

try {
  if (server.config.env.VITE_ENABLE_MSW === "true")
    throw new Error("Capture requires the real API, not MSW")
  await server.listen()
  const origin = "http://127.0.0.1:5174"
  const stockId = process.env.BONEYARD_STOCK_ID ?? "9035"
  if (!/^[1-9]\d*$/.test(stockId)) throw new Error("BONEYARD_STOCK_ID must be a numeric stock ID")
  const stockResponse = await fetch(`${origin}/api/v1/stocks/${stockId}`)
  if (!stockResponse.ok)
    throw new Error(
      `Real stock API failed: ${stockResponse.status} /api/v1/stocks/${stockId}; existing captures preserved`,
    )
  const stock = (await stockResponse.json()) as { data?: { profile?: { name?: string } } }
  if (!stock.data?.profile?.name)
    throw new Error("Stock API did not return a named stock; existing captures preserved")
  console.log(`Verified stock ${stockId}: ${stock.data.profile.name}`)
  const to = new Date()
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - 30)
  const stockUrl = `${origin}/stocks/${stockId}?market=domestic&from=${from.toISOString().slice(0, 10)}&to=${to.toISOString().slice(0, 10)}&interval=1D`
  const profile = join(temporary, "browser")
  context = await chromium.launchPersistentContext(profile, {
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: ["--remote-debugging-port=0"],
  })
  const [port, endpoint] = readFileSync(join(profile, "DevToolsActivePort"), "utf8")
    .trim()
    .split("\n")
  const cdp = `ws://127.0.0.1:${port}${endpoint}`
  const failures: string[] = []
  const tabSelections: Promise<void>[] = []
  context.on("response", (response) => {
    if (new URL(response.url()).pathname.startsWith("/api/") && !response.ok()) {
      failures.push(`${response.status()} ${response.url()}`)
    }
  })
  context.on("requestfailed", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/"))
      failures.push(`${request.failure()?.errorText} ${request.url()}`)
  })
  context.on("page", (page) => {
    page.on("pageerror", (error) => failures.push(error.message))
    page.on("domcontentloaded", () => {
      if (new URL(page.url()).hash !== "#bones-disclosures") return
      // Exercise the real control; do not reveal hidden panels by changing their CSS.
      tabSelections.push(
        page
          .getByRole("tab", { name: "공시", exact: true })
          .click()
          .catch((error: Error) => {
            failures.push(error.message)
          }),
      )
    })
  })

  const passes = [
    [`${origin}/?market=domestic`, `${origin}/industries?filter=ALL&market=domestic`, stockUrl],
    [`${stockUrl}#bones-disclosures`],
  ]
  for (const [index, urls] of passes.entries()) {
    const directory = join(temporary, `pass-${index}`)
    // One shared browser visits the tab states in order.
    // eslint-disable-next-line no-await-in-loop
    await capture(urls, directory, cdp, true)
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(tabSelections)
    if (failures.length) throw new Error(`Capture failed:\n${failures.join("\n")}`)
    for (const file of readdirSync(directory).filter((entry) => entry.endsWith(".bones.json"))) {
      const bytes = readFileSync(join(directory, file))
      // The CLI also sees force-mounted hidden tabs. Only retain actual, visible measurements.
      if (completeCapture(JSON.parse(bytes.toString()))) writeFileSync(join(staged, file), bytes)
    }
  }
  // Official CLI merges existing maps and generates the complete registry. No manual import map.
  await capture([`${origin}/industries?filter=ALL&market=domestic`], staged, cdp, false)
  if (failures.length) throw new Error(`Capture failed:\n${failures.join("\n")}`)
  const actual = readdirSync(staged)
    .filter((file) => file.endsWith(".bones.json"))
    .map((file) => file.replace(".bones.json", ""))
    .toSorted()
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error("Not every source boundary was captured; existing captures preserved")
  for (const id of expected) {
    if (!completeCapture(JSON.parse(readFileSync(join(staged, `${id}.bones.json`), "utf8")))) {
      throw new Error(`Incomplete capture: ${id}; existing captures preserved`)
    }
  }
  const updated = expected.filter((id) => {
    const file = `${id}.bones.json`
    return (
      !existsSync(join(output, file)) ||
      !readFileSync(join(output, file)).equals(readFileSync(join(staged, file)))
    )
  })
  writeFileSync(
    join(staged, "provenance.json"),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        package: "boneyard-js@1.10.0",
        routes: passes.flat(),
        breakpoints: boneBreakpoints,
        files: Object.fromEntries(
          expected.map((id) => [
            id,
            createHash("sha256")
              .update(readFileSync(join(staged, `${id}.bones.json`)))
              .digest("hex"),
          ]),
        ),
      },
      null,
      2,
    ) + "\n",
  )
  writeFileSync(join(staged, "widths.css"), boneWidthStyles(staged))
  const backup = join(temporary, "previous")
  if (existsSync(output)) renameSync(output, backup)
  try {
    renameSync(staged, output)
  } catch (error) {
    if (existsSync(backup)) renameSync(backup, output)
    throw error
  }
  console.log(
    `Captured ${actual.length} boundaries at ${boneBreakpoints.length} widths; ${updated.length} maps updated.`,
  )
} finally {
  await context?.close()
  await server.close()
  rmSync(temporary, { recursive: true, force: true })
}
