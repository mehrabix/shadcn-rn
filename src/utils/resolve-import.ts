import * as path from "path"
import { getPackageImportEntries, resolvePackageImport } from "./package-imports"

export interface ImportResolution {
  filePath: string
  alias?: string
  isLocalAlias: boolean
}

export async function resolveImport(
  importPath: string,
  options: { cwd: string; aliases?: Record<string, string> }
): Promise<ImportResolution | null> {
  const { cwd, aliases = {} } = options

  const packageEntries = await getPackageImportEntries(cwd)
  const packageImport = resolvePackageImport(importPath, packageEntries)
  if (packageImport) {
    return {
      filePath: packageImport,
      isLocalAlias: false,
    }
  }

  for (const [alias, aliasPath] of Object.entries(aliases)) {
    const aliasPattern = alias.replace("/*", "")
    if (importPath.startsWith(aliasPattern)) {
      const suffix = importPath.slice(aliasPattern.length)
      const resolved = aliasPath.replace("/*", suffix)
      return {
        filePath: path.resolve(cwd, resolved),
        alias,
        isLocalAlias: true,
      }
    }
  }

  if (importPath.startsWith("./") || importPath.startsWith("../")) {
    return {
      filePath: path.resolve(cwd, importPath),
      isLocalAlias: false,
    }
  }

  return null
}

export function isLocalAliasImport(
  importPath: string,
  aliases: Record<string, string>
): boolean {
  for (const alias of Object.keys(aliases)) {
    const aliasPattern = alias.replace("/*", "")
    if (importPath.startsWith(aliasPattern)) {
      return true
    }
  }
  return false
}
