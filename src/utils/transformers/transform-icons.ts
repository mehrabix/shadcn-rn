import { type Transformer } from "./index"

export const transformIcons: Transformer = async ({ sourceFile, config }) => {
  const iconLibrary = config.iconLibrary
  if (!iconLibrary) {
    return sourceFile
  }

  const { SyntaxKind } = await import("ts-morph")

  for (const element of sourceFile.getDescendantsOfKind(
    SyntaxKind.JsxSelfClosingElement
  )) {
    const tagName = element.getTagNameNode()?.getText()
    if (tagName !== "IconPlaceholder") {
      continue
    }

    const attributes = element.getAttributes()
    for (const attr of attributes) {
      if (attr.getKind() !== SyntaxKind.JsxAttribute) continue
      const jsxAttr = attr.asKindOrThrow(SyntaxKind.JsxAttribute)
      const nameNode = jsxAttr.getNameNode()
      if (nameNode?.getText() !== iconLibrary) continue

      const initializer = jsxAttr.getInitializer()
      if (initializer?.getKind() === SyntaxKind.StringLiteral) {
        const iconName = initializer.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue()
        if (typeof iconName === "string") {
          element.replaceWithText(`<${iconName} />`)
        }
      }
    }
  }

  return sourceFile
}
