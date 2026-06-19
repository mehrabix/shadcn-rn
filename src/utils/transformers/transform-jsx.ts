import { type Transformer } from "./index"

export const transformJsx: Transformer = async ({ sourceFile }) => {
  const { SyntaxKind } = await import("ts-morph")

  for (const element of sourceFile.getDescendantsOfKind(
    SyntaxKind.JsxSelfClosingElement
  )) {
    const tagName = element.getTagNameNode()
    if (tagName && tagName.getText() === "Slot") {
      const attributes = element.getAttributes()
      const children: string[] = []

      for (const attr of attributes) {
        if (attr.getKind() === SyntaxKind.JsxAttribute) {
          const jsxAttr = attr.asKindOrThrow(SyntaxKind.JsxAttribute)
          const name = jsxAttr.getName()
          const init = jsxAttr.getInitializer()
          if (init?.getKind() === SyntaxKind.JsxExpression) {
            const expr = init.asKindOrThrow(SyntaxKind.JsxExpression).getExpression()
            if (expr) {
              children.push(`${name}={${expr.getText()}}`)
            }
          } else if (init?.getKind() === SyntaxKind.StringLiteral) {
            children.push(`${name}="${init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue()}"`)
          }
        }
      }

      const parent = element.getParent()
      if (parent && parent.getKind() === SyntaxKind.JsxElement) {
        const jsxElement = parent.asKindOrThrow(SyntaxKind.JsxElement)
        const openElement = jsxElement.getOpeningElement()
        const newTagName = openElement.getTagNameNode().getText()
        element.setTagNameNode(newTagName)
        element.removeAttributes()
      }
    }
  }

  return sourceFile
}
