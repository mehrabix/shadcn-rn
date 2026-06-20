import { type Transformer } from "./index"

export const transformRsc: Transformer = async ({ sourceFile }) => {
  const { SyntaxKind } = await import("ts-morph")

  for (const literal of sourceFile.getDescendantsOfKind(
    SyntaxKind.StringLiteral
  )) {
    const value = literal.getLiteralValue()
    if (value === "use client") {
      const parent = literal.getParent()
      if (parent?.getKind() === SyntaxKind.ExpressionStatement) {
        parent.asKindOrThrow(SyntaxKind.ExpressionStatement).remove()
      }
    }
  }

  return sourceFile
}
