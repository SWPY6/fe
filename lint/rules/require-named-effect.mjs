const requireNamedEffect = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require named function expressions in useEffect for better stack traces",
    },
    messages: {
      requireName:
        "useEffect의 callback에 이름을 붙여 주세요. " +
        "예: useEffect(function fetchData() { ... }, [])",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee
        const isUseEffect =
          (callee.type === "Identifier" && callee.name === "useEffect") ||
          (callee.type === "MemberExpression" &&
            !callee.computed &&
            callee.object.type === "Identifier" &&
            callee.object.name === "React" &&
            callee.property.type === "Identifier" &&
            callee.property.name === "useEffect")

        if (!isUseEffect) return

        const callback = node.arguments[0]
        if (
          callback?.type === "ArrowFunctionExpression" ||
          (callback?.type === "FunctionExpression" && !callback.id)
        ) {
          context.report({ node: callback, messageId: "requireName" })
        }
      },
    }
  },
}

export default {
  meta: { name: "local" },
  rules: { "require-named-effect": requireNamedEffect },
}
