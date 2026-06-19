export interface TransformContext {
  aliases: Record<string, string>
  style: string
  tsx: boolean
}

export function transformImport(
  sourceCode: string,
  context: TransformContext
): string {
  let result = sourceCode

  for (const [alias, path] of Object.entries(context.aliases)) {
    const regex = new RegExp(`from ["']@/${alias}["']`, "g")
    result = result.replace(regex, `from "${path}"`)
  }

  return result
}

export function transformRsc(
  sourceCode: string,
  options: { rsc?: boolean }
): string {
  if (options.rsc) {
    if (!sourceCode.includes('"use client"')) {
      return `"use client"\n\n${sourceCode}`
    }
  } else {
    return sourceCode.replace(/^"use client"\n\n/, "")
  }
  return sourceCode
}

export function transformCssVars(
  sourceCode: string,
  cssVars: Record<string, string>
): string {
  let result = sourceCode

  for (const [varName, value] of Object.entries(cssVars)) {
    const regex = new RegExp(`var\\(--${varName}\\)`, "g")
    result = result.replace(regex, value)
  }

  return result
}

export function transformTwPrefixes(
  sourceCode: string,
  prefix: string
): string {
  if (!prefix) return sourceCode

  return sourceCode.replace(
    /className=["']([^"']*)["']/g,
    (_, classes: string) => {
      const prefixed = classes
        .split(" ")
        .map((cls: string) => (cls.startsWith(prefix) ? cls : `${prefix}${cls}`))
        .join(" ")
      return `className="${prefixed}"`
    }
  )
}

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
