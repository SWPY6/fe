import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { basename, dirname, relative, resolve } from "node:path"

import type { Plugin } from "vite"

export default function skeletonPlugin(): Plugin {
  let projectRoot = process.cwd()
  let isBuild = false
  const skeletonSources = new Map<string, { file: string; line: number; column: number }>()

  return {
    name: "skeleton",
    enforce: "pre",

    configResolved(config) {
      projectRoot = config.root
      isBuild = config.command === "build"
      skeletonSources.clear()
    },

    transform(code, id) {
      const file = id.split("?")[0]
      if (
        !/\.[jt]sx$/.test(file) ||
        file.includes("/node_modules/") ||
        !code.includes("data-skeleton")
      ) {
        return
      }

      const ast = this.parse(code, { lang: file.endsWith(".tsx") ? "tsx" : "jsx" })
      type JSXElement = Extract<
        Extract<(typeof ast)["body"][number], { type: "ExpressionStatement" }>["expression"],
        { type: "JSXElement" }
      >
      const suspenseNames = new Set<string>()
      const suspenseNamespaces = new Set<string>()
      for (const statement of ast.body) {
        if (
          statement.type !== "ImportDeclaration" ||
          (statement.source.value !== "react" && statement.source.value !== "@suspensive/react")
        )
          continue
        for (const specifier of statement.specifiers) {
          if (
            specifier.type === "ImportSpecifier" &&
            specifier.imported.type === "Identifier" &&
            specifier.imported.name === "Suspense"
          ) {
            suspenseNames.add(specifier.local.name)
          }
          if (
            specifier.type === "ImportNamespaceSpecifier" ||
            (specifier.type === "ImportDefaultSpecifier" && statement.source.value === "react")
          ) {
            suspenseNamespaces.add(specifier.local.name)
          }
        }
      }

      const nodes: unknown[] = [ast]
      const elements: JSXElement[] = []
      while (nodes.length) {
        const node = nodes.pop()
        if (!node || typeof node !== "object") continue
        if ("type" in node && node.type === "JSXElement") elements.push(node as JSXElement)
        for (const value of Object.values(node)) {
          if (Array.isArray(value)) nodes.push(...value)
          else if (value && typeof value === "object") nodes.push(value)
        }
      }
      elements.sort((a, b) => a.start - b.start)

      let skeletonComponent = "__Skeleton"
      while (code.includes(skeletonComponent)) skeletonComponent += "_"
      const imports: string[] = []
      const edits: { start: number; end: number; text: string }[] = []
      let markerIndex = 0

      for (const element of elements) {
        const opening = element.openingElement
        const marker = opening.attributes.find(
          (attribute) =>
            attribute.type === "JSXAttribute" && attribute.name.name === "data-skeleton",
        )
        if (!marker) continue
        const isSuspense =
          (opening.name.type === "JSXIdentifier" && suspenseNames.has(opening.name.name)) ||
          (opening.name.type === "JSXMemberExpression" &&
            opening.name.object.type === "JSXIdentifier" &&
            suspenseNamespaces.has(opening.name.object.name) &&
            opening.name.property.name === "Suspense")
        if (!isSuspense || !element.closingElement) {
          this.error(
            "data-skeleton은 React 또는 Suspensive의 Suspense에 표시해야 합니다.",
            marker.start,
          )
        }
        if (opening.attributes.some((attribute) => attribute.type === "JSXSpreadAttribute")) {
          this.error("마킹된 Suspense의 속성은 spread 대신 직접 작성해야 합니다.", marker.start)
        }

        const sourcePath = relative(projectRoot, file).replaceAll("\\", "/")
        const skeletonId = `sk_${createHash("sha256").update(`${sourcePath}:${markerIndex++}`).digest("hex").slice(0, 16)}`
        const beforeMarker = code.slice(0, marker.start)
        skeletonSources.set(skeletonId, {
          file,
          line: beforeMarker.split("\n").length,
          column: marker.start - beforeMarker.lastIndexOf("\n") - 1,
        })
        let dataName = `__skeleton_${skeletonId}`
        while (code.includes(dataName)) dataName += "_"
        imports.push(`import ${dataName} from "virtual:skeleton/${skeletonId}";`)

        const fallback = opening.attributes.find(
          (attribute) => attribute.type === "JSXAttribute" && attribute.name.name === "fallback",
        )
        const skeletonFallback = `<${skeletonComponent} name="${skeletonId}" initialBones={${dataName}} select="viewport" loading>{null}</${skeletonComponent}>`
        if (fallback?.type === "JSXAttribute" && fallback.value) {
          const value = fallback.value
          if (value.type === "JSXExpressionContainer") {
            edits.push({
              start: value.start,
              end: value.start + 1,
              text: `{${dataName} ? ${skeletonFallback} : (`,
            })
            edits.push({ start: value.end - 1, end: value.end, text: ")}" })
          } else {
            edits.push({
              start: value.start,
              end: value.start,
              text: `{${dataName} ? ${skeletonFallback} : (`,
            })
            edits.push({ start: value.end, end: value.end, text: ")}" })
          }
        } else if (fallback) {
          edits.push({
            start: fallback.end,
            end: fallback.end,
            text: `={${dataName} ? ${skeletonFallback} : true}`,
          })
        } else {
          edits.push({
            start: opening.end - 1,
            end: opening.end - 1,
            text: ` fallback={${dataName} ? ${skeletonFallback} : undefined}`,
          })
        }
        edits.push({ start: marker.start, end: marker.end, text: "" })
        edits.push({
          start: opening.end,
          end: opening.end,
          text: `<${skeletonComponent} name="${skeletonId}" initialBones={${dataName}} select="viewport" loading={false}>`,
        })
        edits.push({
          start: element.closingElement.start,
          end: element.closingElement.start,
          text: `</${skeletonComponent}>`,
        })
      }
      if (!markerIndex) return

      edits.sort((a, b) => b.start - a.start || b.end - a.end)
      let transformed = code
      for (const edit of edits) {
        transformed = transformed.slice(0, edit.start) + edit.text + transformed.slice(edit.end)
      }
      const importPosition =
        ast.body.find(
          (statement) =>
            statement.type !== "ExpressionStatement" ||
            statement.expression.type !== "Literal" ||
            typeof statement.expression.value !== "string",
        )?.start ?? code.length
      const prefix = `import { Skeleton as ${skeletonComponent} } from "boneyard-js/react";${imports.join("")}`
      transformed =
        transformed.slice(0, importPosition) + prefix + transformed.slice(importPosition)
      return { code: transformed, map: null }
    },

    resolveId(source) {
      if (
        source.startsWith("virtual:skeleton/") &&
        skeletonSources.has(source.slice("virtual:skeleton/".length))
      ) {
        return `\0${source}`
      }
    },

    load(id) {
      if (!id.startsWith("\0virtual:skeleton/")) return
      const skeletonId = id.slice("\0virtual:skeleton/".length)
      const source = skeletonSources.get(skeletonId)
      if (!source) return
      const path = resolve(projectRoot, "bones", `${skeletonId}.bones.json`)
      if (!existsSync(path)) {
        if (!isBuild) return "export default undefined"
        this.error({
          id: source.file,
          loc: source,
          message: `스켈레톤 JSON 매핑을 찾을 수 없습니다: ${skeletonId}\n${path}`,
        })
      }
      this.addWatchFile(path)

      let skeletonData: unknown
      try {
        skeletonData = JSON.parse(readFileSync(path, "utf8"))
      } catch (error) {
        this.error({
          id: source.file,
          loc: source,
          message: `스켈레톤 JSON을 읽을 수 없습니다: ${skeletonId}\n${path}\n${error instanceof Error ? error.message : String(error)}`,
        })
      }
      if (
        !skeletonData ||
        typeof skeletonData !== "object" ||
        !("breakpoints" in skeletonData) ||
        !skeletonData.breakpoints ||
        typeof skeletonData.breakpoints !== "object" ||
        Array.isArray(skeletonData.breakpoints) ||
        !Object.keys(skeletonData.breakpoints).length
      ) {
        this.error({
          id: source.file,
          loc: source,
          message: `스켈레톤 JSON 형식이 올바르지 않습니다: ${skeletonId}\n${path}`,
        })
      }
      for (const result of Object.values(skeletonData.breakpoints)) {
        if (
          !result ||
          typeof result !== "object" ||
          !("name" in result) ||
          result.name !== skeletonId ||
          !("bones" in result) ||
          !Array.isArray(result.bones)
        ) {
          this.error({
            id: source.file,
            loc: source,
            message: `스켈레톤 JSON의 이름 또는 캡처 데이터가 일치하지 않습니다: ${skeletonId}\n${path}`,
          })
        }
      }
      return `export default ${JSON.stringify(skeletonData)}`
    },

    hotUpdate({ file, timestamp }) {
      if (dirname(file) !== resolve(projectRoot, "bones") || !file.endsWith(".bones.json")) return
      const skeletonId = basename(file, ".bones.json")
      const module = this.environment.moduleGraph.getModuleById(`\0virtual:skeleton/${skeletonId}`)
      if (!module) return
      this.environment.moduleGraph.invalidateModule(module, new Set(), timestamp, true)
      this.environment.hot.send({ type: "full-reload" })
      return []
    },
  }
}
