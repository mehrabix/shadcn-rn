import * as fs from "fs/promises"
import * as path from "path"

export interface WorkspacePackage {
  name: string
  path: string
}

let cachedRoot: string | null = null
let cachedPackages: WorkspacePackage[] | null = null

export async function resolveWorkspacePackageExport(
  exportPath: string,
  cwd: string
): Promise<string | null> {
  const root = await findWorkspaceRoot(cwd)
  if (!root) {
    return null
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
          return path.resolve(pkg.path, exportEntry)
        }
        if (
          exportEntry &&
          typeof exportEntry === "object" &&
          "default" in exportEntry
        ) {
          return path.resolve(
            pkg.path,
            (exportEntry as { default: string }).default
          )
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
  if (cachedRoot && cwd.startsWith(path.dirname(cachedRoot))) {
    return cachedRoot
  }

  let current = cwd
  while (true) {
    const packageJsonPath = path.join(current, "package.json")
    try {
      const content = await fs.readFile(packageJsonPath, "utf-8")
      const packageJson = JSON.parse(content)

      if (packageJson.workspaces) {
        cachedRoot = current
        return current
      }
    } catch {
      // Continue
    }

    const parent = path.dirname(current)
    if (parent === current) {
      return null
    }
    current = parent
  }
}

export async function findWorkspacePackages(
  root: string
): Promise<WorkspacePackage[]> {
  if (cachedPackages) {
    return cachedPackages
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

    cachedPackages = packages
    return packages
  } catch {
    return []
  }
}
