import * as path from "path"
import { loadConfig, type ConfigLoaderSuccessResult } from "tsconfig-paths"
import { getPackageImportEntries, resolvePackageImport } from "./package-imports"
import { resolveWorkspacePackageExport } from "./workspace"
import { BUILTIN_MODULES } from "../registry/constants"

export interface ResolvedImport {
  path: string
  source:
    | "package_imports"
    | "workspace_package_exports"
    | "tsconfig_paths"
    | "relative_import"
  matchedAlias: string
  matchedTarget?: string
  emitMode?: string
}

export async function resolveImportWithMetadata(
  importPath: string,
  options: Pick<ConfigLoaderSuccessResult, "absoluteBaseUrl" | "paths"> & {
    cwd: string
  }
): Promise<ResolvedImport | null> {
  const { cwd } = options

  if (BUILTIN_MODULES.has(importPath)) {
    return null
  }

  const packageEntries = await getPackageImportEntries(cwd)
  const packageImport = resolvePackageImport(importPath, packageEntries)
  if (packageImport) {
    return {
      path: packageImport,
      source: "package_imports",
      matchedAlias: importPath,
    }
  }

  if (importPath.startsWith("#")) {
    const workspaceExport = await resolveWorkspacePackageExport(importPath, cwd)
    if (workspaceExport) {
      return {
        path: workspaceExport,
        source: "workspace_package_exports",
        matchedAlias: importPath,
      }
    }
  }

  const tsconfigResult = resolveFromTsconfigPaths(importPath, options)
  if (tsconfigResult) {
    return tsconfigResult
  }

  return null
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

function resolveFromTsconfigPaths(
  importPath: string,
  options: Pick<ConfigLoaderSuccessResult, "absoluteBaseUrl" | "paths"> & {
    cwd: string
  }
): ResolvedImport | null {
  const { absoluteBaseUrl, paths } = options

  for (const [pattern, targets] of Object.entries(paths)) {
    const match = findMatchingTsPathPattern(importPath, pattern)
    if (!match) continue

    for (const target of targets) {
      const resolvedTarget = target.replace("*", match.suffix)
      const resolvedPath = path.resolve(
        absoluteBaseUrl,
        resolvedTarget + match.extension
      )

      return {
        path: resolvedPath,
        source: "tsconfig_paths",
        matchedAlias: pattern,
        matchedTarget: target,
        emitMode: match.emitMode,
      }
    }
  }

  return null
}

function findMatchingTsPathPattern(
  importPath: string,
  pattern: string
): { suffix: string; extension: string; emitMode?: string } | null {
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2)
    if (importPath.startsWith(prefix)) {
      const suffix = importPath.slice(prefix.length)
      const ext = path.extname(suffix)
      return {
        suffix: suffix.slice(0, -ext || undefined),
        extension: ext || "",
      }
    }
  }

  if (importPath === pattern) {
    return { suffix: "", extension: "" }
  }

  return null
}

export interface ImportResolution {
  filePath: string
  alias?: string
  isLocalAlias: boolean
}
