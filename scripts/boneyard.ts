import { createHash } from "node:crypto"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { relative, resolve } from "node:path"

import MagicString from "magic-string"
import ts from "typescript"
import { normalizePath } from "vite"
import type { Plugin } from "vite"

export const bonesDirectory = "src/components/ui/bones"
export const boneBreakpoints = [375, 640, 768, 1024, 1280]

// A source occurrence, not a render counter. Formatting and child UI changes keep the ID.
export function boneSites(code: string, file: string) {
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const imports = new Set<string>()
  for (const statement of source.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === "boneyard-js/react"
    ) {
      const bindings = statement.importClause?.namedBindings
      if (bindings && ts.isNamedImports(bindings)) {
        for (const item of bindings.elements) {
          if ((item.propertyName ?? item.name).text === "BoneSuspense") imports.add(item.name.text)
        }
      }
    }
  }
  const sites: { id: string; position: number; attributes: ts.JsxAttributes }[] = []
  function visit(node: ts.Node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      ts.isIdentifier(node.tagName) &&
      imports.has(node.tagName.text)
    ) {
      const key = `${normalizePath(file)}:${sites.length}`
      sites.push({
        id: `bone_${createHash("sha256").update(key).digest("hex").slice(0, 16)}`,
        position: node.tagName.end,
        attributes: node.attributes,
      })
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return sites
}

export function sourceBoneIds(root: string) {
  return readdirSync(resolve(root, "src"), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
    .flatMap((entry) => {
      const file = resolve(entry.parentPath, entry.name)
      return boneSites(readFileSync(file, "utf8"), relative(root, file)).map((site) => site.id)
    })
    .toSorted()
}

// The existing shrink-to-content parents consume these variables only while busy.
// Measurements come from captures; this does not assign layout to the child skeleton.
export function boneWidthStyles(directory: string) {
  const suffixes = ["", "-sm", "-md", "-lg", "-xl"]
  return (
    readdirSync(directory)
      .filter((file) => file.endsWith(".bones.json"))
      .toSorted()
      .map((file) => {
        const id = file.replace(".bones.json", "")
        const data = JSON.parse(readFileSync(resolve(directory, file), "utf8"))
        const variables = boneBreakpoints.map(
          (width, index) =>
            `  --loading-width${suffixes[index]}: ${data.breakpoints[width].width}px;`,
        )
        return `:where(:has(> [data-boneyard="${id}"][aria-busy="true"])) {\n${variables.join("\n")}\n}`
      })
      .join("\n\n") + "\n"
  )
}

export function automaticBoneNames(): Plugin {
  let root: string
  let production = false
  return {
    name: "automatic-bone-names",
    enforce: "pre",
    configResolved(config) {
      root = config.root
      production = config.command === "build"
    },
    buildStart() {
      if (!production) return
      for (const id of sourceBoneIds(root)) {
        if (!existsSync(resolve(root, bonesDirectory, `${id}.bones.json`))) {
          this.error(`Missing capture for ${id}; run pnpm bones:capture before building.`)
        }
      }
    },
    transform: {
      // Include Router virtual split requests: their input is still the original TSX.
      filter: { id: /\.tsx(?:\?|$)/, code: "boneyard-js/react" },
      handler(code, id) {
        const file = normalizePath(relative(root, id.split("?")[0]!))
        if (!file.startsWith("src/")) return
        const sites = boneSites(code, file)
        if (!sites.length) return
        const output = new MagicString(code)
        for (const site of sites) {
          if (
            site.attributes.properties.some(
              (attribute) =>
                ts.isJsxSpreadAttribute(attribute) ||
                (ts.isJsxAttribute(attribute) &&
                  ["name", "initialBones"].includes(attribute.name.getText())),
            )
          ) {
            this.error(
              `${file}: BoneSuspense names and captures are generated; remove manual props/spreads.`,
            )
          }
          output.appendLeft(site.position, ` name="${site.id}"`)
        }
        return { code: output.toString(), map: output.generateMap({ hires: true, source: id }) }
      },
    },
  }
}
