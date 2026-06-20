import { type Transformer } from "./index"

export const transformTwPrefixes: Transformer = async ({ sourceFile, config }) => {
  const prefix = config.nativewind?.prefix
  if (!prefix) {
    return sourceFile
  }

  const { SyntaxKind } = await import("ts-morph")

  for (const element of sourceFile.getDescendantsOfKind(
    SyntaxKind.JsxOpeningElement
  )) {
    const className = element.getAttribute("className")
    if (!className || className.getKind() !== SyntaxKind.JsxAttribute) {
      continue
    }

    const jsxAttr = className.asKindOrThrow(SyntaxKind.JsxAttribute)
    const initializer = jsxAttr.getInitializer()
    if (!initializer) {
      continue
    }

    let text = ""
    if (initializer.getKind() === SyntaxKind.StringLiteral) {
      text = initializer.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue()
    } else if (initializer.getKind() === SyntaxKind.JsxExpression) {
      const expression = initializer.asKindOrThrow(SyntaxKind.JsxExpression).getExpression()
      if (expression?.getKind() === SyntaxKind.StringLiteral) {
        text = expression.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue()
      }
    }

    if (text) {
      const classes = text.split(" ").map((cls) => {
        if (cls.startsWith(prefix)) {
          return cls
        }
        return `${prefix}${cls}`
      }).join(" ")

      if (initializer.getKind() === SyntaxKind.StringLiteral) {
        initializer.asKindOrThrow(SyntaxKind.StringLiteral).setLiteralValue(classes)
      }
    }
  }

  return sourceFile
}
