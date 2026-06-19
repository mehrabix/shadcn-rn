export function isContentSame(
  a: string,
  b: string,
  options: { ignoreImports?: boolean } = {}
): boolean {
  if (options.ignoreImports) {
    const importRegex = /^import\s+.*from\s+['"].*['"]\s*;?\s*$/gm
    const normalizedA = a.replace(importRegex, "").trim()
    const normalizedB = b.replace(importRegex, "").trim()
    return normalizedA === normalizedB
  }
  return a === b
}
