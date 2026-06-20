import * as fs from "fs/promises"
import * as path from "path"
import fg from "fast-glob"

export interface WorkspacePackage {
  name: string
  path: string
}

const workspacePackageCache = new Map<string, WorkspacePackage[]>()
const workspaceExportEntriesCache = new Map<string, Map<string, string>>()
const workspaceRootCache = new Map<string, string | null>()
const gitRootCache = new Map<string, string | null>()

export async function resolveWorkspacePackageExport(
  exportPath: string,
  cwd: string
): Promise<string | null> {
  const root = await findWorkspaceRoot(cwd)
  if (!root) {
    return null
  }

  const entriesCacheKey = `${root}:${exportPath}`
  if (workspaceExportEntriesCache.has(entriesCacheKey)) {
    const cached = workspaceExportEntriesCache.get(entriesCacheKey)!
    for (const [pkgName, exportValue] of cached) {
      if (pkgName) {
        return exportValue
      }
    }
  }

  const packages = await findWorkspacePackages(root)

  for (const pkg of packages) {
    const pkgJsonPath = path.join(pkg.path, "package.json")
    try {
      const content = await fs.readFile(pkgJsonPath, "utf-8")
      const pkgJson = JSON.parse(content)

      if (pkgJson.exports && typeof pkgJson.exports === "object") {
        const exportEntry = pkgJson.exports[exportPath]
        if (exportEntry && typeof exportEntry === "string") {
          const resolved = path.resolve(pkg.path, exportEntry)
          if (!workspaceExportEntriesCache.has(entriesCacheKey)) {
            workspaceExportEntriesCache.set(entriesCacheKey, new Map())
          }
          workspaceExportEntriesCache.get(entriesCacheKey)!.set(pkg.name, resolved)
          return resolved
        }
        if (
          exportEntry &&
          typeof exportEntry === "object" &&
          "default" in exportEntry
        ) {
          const resolved = path.resolve(
            pkg.path,
            (exportEntry as { default: string }).default
          )
          if (!workspaceExportEntriesCache.has(entriesCacheKey)) {
            workspaceExportEntriesCache.set(entriesCacheKey, new Map())
          }
          workspaceExportEntriesCache.get(entriesCacheKey)!.set(pkg.name, resolved)
          return resolved
        }
      }
    } catch {
      continue
    }
  }

  return null
}

export async function findWorkspaceRoot(
  cwd: string
): Promise<string | null> {
  if (workspaceRootCache.has(cwd)) {
    return workspaceRootCache.get(cwd)!
  }

  let current = cwd
  while (true) {
    const packageJsonPath = path.join(current, "package.json")
    try {
      const content = await fs.readFile(packageJsonPath, "utf-8")
      const packageJson = JSON.parse(content)

      if (packageJson.workspaces) {
        workspaceRootCache.set(cwd, current)
        return current
      }
    } catch {
      // Continue
    }

    const parent = path.dirname(current)
    if (parent === current) {
      workspaceRootCache.set(cwd, null)
      return null
    }
    current = parent
  }
}

export async function findGitRoot(cwd: string): Promise<string | null> {
  if (gitRootCache.has(cwd)) {
    return gitRootCache.get(cwd)!
  }

  let current = cwd
  while (true) {
    const gitDir = path.join(current, ".git")
    try {
      const stat = await fs.stat(gitDir)
      if (stat.isDirectory()) {
        gitRootCache.set(cwd, current)
        return current
      }
    } catch {
      // Continue
    }

    const parent = path.dirname(current)
    if (parent === current) {
      gitRootCache.set(cwd, null)
      return null
    }
    current = parent
  }
}

export async function findWorkspacePackages(
  root: string
): Promise<WorkspacePackage[]> {
  const cacheKey = root
  if (workspacePackageCache.has(cacheKey)) {
    return workspacePackageCache.get(cacheKey)!
  }

  const packageJsonPath = path.join(root, "package.json")
  try {
    const content = await fs.readFile(packageJsonPath, "utf-8")
    const packageJson = JSON.parse(content)

    if (!packageJson.workspaces) {
      return []
    }

    const workspaces = Array.isArray(packageJson.workspaces)
      ? packageJson.workspaces
      : packageJson.workspaces.packages || []

    const packages: WorkspacePackage[] = []

    for (const workspace of workspaces) {
      const globPattern = workspace.replace("*", "")
      const dirPath = path.join(root, globPattern)

      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const pkgPath = path.join(dirPath, entry.name)
            const pkgJsonPath = path.join(pkgPath, "package.json")
            try {
              const pkgContent = await fs.readFile(pkgJsonPath, "utf-8")
              const pkgJson = JSON.parse(pkgContent)
              packages.push({
                name: pkgJson.name,
                path: pkgPath,
              })
            } catch {
              continue
            }
          }
        }
      } catch {
        continue
      }
    }

    workspacePackageCache.set(cacheKey, packages)
    return packages
  } catch {
    return []
  }
}

export function parsePackageSpecifier(specifier: string): {
  packageName: string
  subpath: string
} {
  if (specifier.startsWith("@")) {
    const parts = specifier.split("/")
    if (parts.length >= 2) {
      return {
        packageName: `${parts[0]}/${parts[1]}`,
        subpath: parts.slice(2).join("/"),
      }
    }
  }

  const firstSlash = specifier.indexOf("/")
  if (firstSlash === -1) {
    return { packageName: specifier, subpath: "" }
  }

  return {
    packageName: specifier.slice(0, firstSlash),
    subpath: specifier.slice(firstSlash + 1),
  }
}

export function getAliasBase(
  packageName: string,
  exportKey: string
): string | null {
  if (exportKey === ".") {
    return packageName
  }

  const cleanExport = exportKey.replace(/^\.\//, "").replace(/\/$/, "")
  if (cleanExport === "index") {
    return packageName
  }

  return null
}
