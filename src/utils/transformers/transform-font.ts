import { type Transformer } from "./index"

export const transformFont: Transformer = async ({ sourceFile, supportedFontMarkers }) => {
  if (!supportedFontMarkers?.length) {
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
        if (supportedFontMarkers.some((marker) => cls.startsWith(marker))) {
          return cls
        }
        return cls
      }).join(" ")

      if (initializer.getKind() === SyntaxKind.StringLiteral) {
        initializer.asKindOrThrow(SyntaxKind.StringLiteral).setLiteralValue(classes)
      }
    }
  }

  return sourceFile
}
