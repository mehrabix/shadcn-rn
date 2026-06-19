import { type Transformer } from "./index"

export const transformCleanup: Transformer = async ({ sourceFile }) => {
  const fullText = sourceFile.getFullText()
  const lines = fullText.split("\n")
  const filtered = lines.filter((line) => {
    const trimmed = line.trim()
    if (trimmed === "") return true
    if (trimmed.startsWith("//") && trimmed.includes("TODO")) return false
    return true
  })
  sourceFile.replaceWithText(filtered.join("\n"))
  return sourceFile
}
