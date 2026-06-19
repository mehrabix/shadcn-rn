import * as fs from "fs/promises"
import * as path from "path"

export interface PackageImportEntry {
  name: string
  path: string
}

export async function getPackageImportEntries(
  cwd: string
): Promise<PackageImportEntry[]> {
  const packageJsonPath = path.join(cwd, "package.json")

  try {
    const content = await fs.readFile(packageJsonPath, "utf-8")
    const packageJson = JSON.parse(content)

    if (!packageJson.imports) {
      return []
    }

    const entries: PackageImportEntry[] = []
    for (const [name, importPath] of Object.entries(packageJson.imports)) {
      if (typeof importPath === "string") {
        entries.push({ name, path: importPath })
      } else if (
        typeof importPath === "object" &&
        importPath !== null &&
        "default" in importPath
      ) {
        entries.push({
          name,
          path: (importPath as { default: string }).default,
        })
      }
    }

    return entries
  } catch {
    return []
  }
}

export function getPackageImportPrefix(entries: PackageImportEntry[]): string {
  if (entries.length === 0) {
    return ""
  }

  const firstEntry = entries[0]
  const prefixIndex = firstEntry.name.indexOf("*")
  if (prefixIndex === -1) {
    return ""
  }

  return firstEntry.name.slice(0, prefixIndex)
}

export function resolvePackageImport(
  importPath: string,
  entries: PackageImportEntry[]
): string | null {
  for (const entry of entries) {
    const entryPrefix = entry.name.replace("*", "")
    if (importPath.startsWith(entryPrefix)) {
      const suffix = importPath.slice(entryPrefix.length)
      return entry.path.replace("*", suffix)
    }
  }

  return null
}

export async function getPackageImportAliases(
  cwd: string
): Promise<Record<string, string>> {
  const entries = await getPackageImportEntries(cwd)
  const aliases: Record<string, string> = {}

  for (const entry of entries) {
    const alias = entry.name.replace("*", "/*")
    aliases[alias] = entry.path
  }

  return aliases
}
