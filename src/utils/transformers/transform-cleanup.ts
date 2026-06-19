export function transformCleanup(sourceCode: string): string {
  const lines = sourceCode.split("\n")
  const filtered = lines.filter((line) => {
    const trimmed = line.trim()
    if (trimmed === "") return true
    if (trimmed.startsWith("//") && trimmed.includes("TODO")) return false
    return true
  })
  return filtered.join("\n")
}
