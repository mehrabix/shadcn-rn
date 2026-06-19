import * as fs from "fs/promises"
import * as path from "path"

export async function getMonorepoInfo(cwd: string): Promise<{
  isMonorepo: boolean
  packages: string[]
  type?: "npm" | "yarn" | "pnpm"
}> {
  const packageJsonPath = path.join(cwd, "package.json")

  try {
    const content = await fs.readFile(packageJsonPath, "utf-8")
    const packageJson = JSON.parse(content)

    if (packageJson.workspaces) {
      const workspaces = Array.isArray(packageJson.workspaces)
        ? packageJson.workspaces
        : packageJson.workspaces.packages || []

      return {
        isMonorepo: true,
        packages: workspaces,
        type: await detectMonorepoType(cwd),
      }
    }

    return {
      isMonorepo: false,
      packages: [],
    }
  } catch {
    return {
      isMonorepo: false,
      packages: [],
    }
  }
}

async function detectMonorepoType(
  cwd: string
): Promise<"npm" | "yarn" | "pnpm"> {
  try {
    await fs.access(path.join(cwd, "pnpm-workspace.yaml"))
    return "pnpm"
  } catch {
    // Continue
  }

  try {
    await fs.access(path.join(cwd, "lerna.json"))
    return "npm"
  } catch {
    // Continue
  }

  return "npm"
}
