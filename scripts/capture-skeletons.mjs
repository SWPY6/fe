import { spawn } from "node:child_process"
import { once } from "node:events"
import { existsSync } from "node:fs"
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { chromium } from "playwright"
import { createServer } from "vite"

import { validateSkeletonData } from "../vite-plugin-skeleton.ts"

const projectRoot = resolve(import.meta.dirname, "..")
const output = resolve(projectRoot, "bones")
const captured = await mkdtemp(resolve(tmpdir(), "swpy6-skeletons-"))
const server = await createServer({
  root: projectRoot,
  define: { "import.meta.env.VITE_CAPTURE_SKELETONS": JSON.stringify("true") },
  server: { host: "127.0.0.1", port: 0, strictPort: false, open: false },
})
let browser

try {
  await server.listen()
  const origin = server.resolvedUrls.local[0]
  browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(origin, { waitUntil: "domcontentloaded" })
  const { urls, errors } = JSON.parse(await page.locator("#skeleton-routes").textContent())
  if (errors.length) throw new Error(errors.join("\n"))
  if (!urls.length) throw new Error("TanStack Router에서 방문할 라우트를 찾지 못했습니다.")
  await browser.close()
  browser = undefined

  const routes = urls.map((url) => new URL(url, origin).href)
  const configPath = resolve(projectRoot, "boneyard.config.json")
  const config = existsSync(configPath) ? JSON.parse(await readFile(configPath, "utf8")) : {}
  // 루트 URL만 있어도 링크 탐색 없이 전달한 목록만 방문하도록 CLI의 guided 설정을 사용한다.
  await writeFile(
    resolve(captured, "boneyard.config.json"),
    JSON.stringify({
      ...config,
      skeletons: Object.fromEntries(
        routes.map((url, index) => {
          const target = new URL(url)
          return [String(index), { route: target.pathname + target.search }]
        }),
      ),
    }),
  )
  console.log(`라우트 ${routes.length}개를 캡처 CLI에 전달합니다.\n${routes.join("\n")}`)
  const cli = spawn(
    process.execPath,
    [
      fileURLToPath(new URL("../bin/cli.js", import.meta.resolve("boneyard-js"))),
      "build",
      ...routes,
      "--out",
      captured,
      "--breakpoints",
      "375,768,1280",
      "--force",
      "--no-scan",
    ],
    { cwd: captured, stdio: "inherit" },
  )
  const [exitCode, signal] = await once(cli, "exit")
  if (exitCode !== 0) throw new Error(`캡처 CLI 실패: ${signal ?? exitCode}`)

  const required = [...server.environments.client.moduleGraph.idToModuleMap.keys()]
    .filter((id) => id.startsWith("\0virtual:skeleton/"))
    .map((id) => id.slice("\0virtual:skeleton/".length))
  const files = await readdir(captured)
  await Promise.all(
    required.map(async (id) => {
      const file = `${id}.bones.json`
      if (!files.includes(file)) throw new Error(`캡처 결과가 없는 스켈레톤: ${id}`)
      const data = JSON.parse(await readFile(resolve(captured, file), "utf8"))
      validateSkeletonData(data, id)
    }),
  )

  await mkdir(output, { recursive: true })
  const previous = await readdir(output)
  await Promise.all(
    previous
      .filter((file) => /^sk_[a-f0-9]{16}\.bones\.json$/.test(file))
      .map((file) => rm(resolve(output, file))),
  )
  await Promise.all(
    files
      .filter((file) => /^sk_[a-f0-9]{16}\.bones\.json$/.test(file))
      .map((file) => copyFile(resolve(captured, file), resolve(output, file))),
  )
  const format = spawn("pnpm", ["exec", "oxfmt", output], { cwd: projectRoot, stdio: "inherit" })
  const [formatExitCode] = await once(format, "exit")
  if (formatExitCode !== 0) throw new Error("스켈레톤 JSON 포맷 실패")
} finally {
  await browser?.close()
  await server.close()
  await rm(captured, { recursive: true, force: true })
}
