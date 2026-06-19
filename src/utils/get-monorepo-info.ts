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

export async function isMonorepoRoot(cwd: string): Promise<boolean> {
  const info = await getMonorepoInfo(cwd)
  if (!info.isMonorepo) return false

  try {
    const content = await fs.readFile(path.join(cwd, "package.json"), "utf-8")
    const packageJson = JSON.parse(content)
    return !!packageJson.workspaces
  } catch {
    return false
  }
}

export async function getMonorepoTargets(cwd: string): Promise<string[]> {
  const info = await getMonorepoInfo(cwd)
  if (!info.isMonorepo) return []

  const targets: string[] = []
  for (const pattern of info.packages) {
    const globPattern = pattern.replace("*", "**")
    const resolved = path.resolve(cwd, globPattern)
    try {
      const stat = await fs.stat(resolved)
      if (stat.isDirectory()) {
        targets.push(path.relative(cwd, resolved))
      }
    } catch {
      // skip
    }
  }
  return targets
}

export function formatMonorepoMessage(
  command: string,
  targets: string[]
): void {
  console.log(
    `\n  Looks like you're in a monorepo root. To use '${command}', run it from one of the following packages:\n`
  )
  for (const target of targets) {
    console.log(`  - ${target}`)
  }
  console.log("")
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
