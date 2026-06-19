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
    if (element.getTagNameNode()?.getText() !== "IconPlaceholder") {
      continue
    }

    const libraryPropAttr = element.getAttributes().find((attr) => {
      if (attr.getKind() !== SyntaxKind.JsxAttribute) {
        return false
      }
      const jsxAttr = attr.asKindOrThrow(SyntaxKind.JsxAttribute)
      return jsxAttr.getName() === iconLibrary
    })

    if (libraryPropAttr && libraryPropAttr.getKind() === SyntaxKind.JsxAttribute) {
      const jsxAttr = libraryPropAttr.asKindOrThrow(SyntaxKind.JsxAttribute)
      const initializer = jsxAttr.getInitializer()
      if (initializer?.getKind() === SyntaxKind.StringLiteral) {
        const iconName = initializer.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue()
        element.setTagNameNode(iconName)
        element.removeAttributes()
      }
    }
  }

  return sourceFile
}
