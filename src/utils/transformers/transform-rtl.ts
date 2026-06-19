import { type Transformer } from "./index"

export const transformRtl: Transformer = async ({ sourceFile, config }) => {
  if (!config.rtl) {
    return sourceFile
  }

  const { SyntaxKind } = await import("ts-morph")

  for (const element of sourceFile.getDescendantsOfKind(
    SyntaxKind.JsxOpeningElement
  )) {
    const dirAttr = element.getAttribute("dir")
    if (!dirAttr) {
      const openingElement = element
      openingElement.addAttribute({ name: "dir", initializer: '"rtl"' })
    }
  }

  return sourceFile
}
