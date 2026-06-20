import { type Transformer } from "./index"

export const transformJsx: Transformer = async ({ sourceFile }) => {
  const { SyntaxKind } = await import("ts-morph")

  for (const element of sourceFile.getDescendantsOfKind(
    SyntaxKind.JsxSelfClosingElement
  )) {
    const tagName = element.getTagNameNode()
    if (tagName && tagName.getText() === "Slot") {
      const parent = element.getParent()
      if (parent && parent.getKind() === SyntaxKind.JsxElement) {
        const jsxElement = parent.asKindOrThrow(SyntaxKind.JsxElement)
        const openElement = jsxElement.getOpeningElement()
        const newTagName = openElement.getTagNameNode().getText()
        element.replaceWithText(`<${newTagName} />`)
      }
    }
  }

  return sourceFile
}
