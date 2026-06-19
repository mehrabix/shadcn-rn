export function importMatcher(
  sourceCode: string,
  importPath: string
): boolean {
  const importRegex = new RegExp(
    `import\\s+.*\\s+from\\s+["']${escapeRegExp(importPath)}["']`,
    "g"
  )
  return importRegex.test(sourceCode)
}

export function addImport(
  sourceCode: string,
  importStatement: string
): string {
  const importLines = sourceCode.split("\n")
  let lastImportIndex = -1

  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i].startsWith("import ")) {
      lastImportIndex = i
    }
  }

  if (lastImportIndex >= 0) {
    importLines.splice(lastImportIndex + 1, 0, importStatement)
  } else {
    importLines.unshift(importStatement)
  }

  return importLines.join("\n")
}

export function removeImport(
  sourceCode: string,
  importPath: string
): string {
  const lines = sourceCode.split("\n")
  const filtered = lines.filter((line) => {
    if (line.startsWith("import ")) {
      return !line.includes(importPath)
    }
    return true
  })
  return filtered.join("\n")
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
