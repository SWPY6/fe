import { existsSync } from "node:fs"
import { basename, dirname, join, relative, sep } from "node:path"

const routePageConvention = {
  meta: {
    type: "problem",
    messages: {
      missingPage: "{{page}} 파일을 만들고 이 라우트의 component에 연결하세요.",
      missingComponent:
        "./page에서 페이지 컴포넌트를 import해 createFileRoute의 component에 지정하세요.",
      flatRoute: "라우트마다 폴더를 만들고 이 파일을 그 폴더의 index.tsx로 옮기세요.",
    },
    schema: [],
  },
  create(context) {
    const file = relative(context.cwd, context.filename).split(sep).join("/")
    if (!file.startsWith("src/routes/") || file === "src/routes/__root.tsx") return {}

    if (basename(context.filename) !== "index.tsx") {
      if (basename(context.filename) === "route.tsx") return {}

      return {
        ExportNamedDeclaration(node) {
          if (
            node.declaration?.type === "VariableDeclaration" &&
            node.declaration.declarations.some(
              (declaration) =>
                declaration.id.type === "Identifier" && declaration.id.name === "Route",
            )
          ) {
            context.report({ node, messageId: "flatRoute" })
          }

          if (
            node.specifiers.some(
              (specifier) =>
                specifier.exported.type === "Identifier" && specifier.exported.name === "Route",
            )
          ) {
            context.report({ node, messageId: "flatRoute" })
          }
        },
      }
    }

    const page = join(dirname(context.filename), "page.tsx")
    const imports = new Set()
    let component

    return {
      ImportDeclaration(node) {
        if (node.source.value !== "./page" || node.importKind === "type") return

        for (const specifier of node.specifiers) {
          if (specifier.type !== "ImportNamespaceSpecifier" && specifier.importKind !== "type") {
            imports.add(specifier.local.name)
          }
        }
      },
      VariableDeclarator(node) {
        if (node.id.type !== "Identifier" || node.id.name !== "Route") return

        const route = node.init
        if (
          route?.type !== "CallExpression" ||
          route.callee.type !== "CallExpression" ||
          route.callee.callee.type !== "Identifier" ||
          route.callee.callee.name !== "createFileRoute" ||
          route.arguments[0]?.type !== "ObjectExpression"
        ) {
          return
        }

        for (const property of route.arguments[0].properties) {
          if (
            property.type === "Property" &&
            !property.computed &&
            ((property.key.type === "Identifier" && property.key.name === "component") ||
              (property.key.type === "Literal" && property.key.value === "component")) &&
            property.value.type === "Identifier"
          ) {
            component = property.value.name
          }
        }
      },
      "Program:exit"(node) {
        if (!existsSync(page)) {
          context.report({
            node,
            messageId: "missingPage",
            data: { page: relative(context.cwd, page).split(sep).join("/") },
          })
        } else if (!imports.has(component)) {
          context.report({ node, messageId: "missingComponent" })
        }
      },
    }
  },
}

export default {
  meta: { name: "route-page" },
  rules: { convention: routePageConvention },
}
