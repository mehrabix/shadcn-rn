import * as fs from "fs/promises"
import * as path from "path"

export async function getProjectInfo(cwd: string): Promise<{
  framework: "expo" | "bare-react-native" | "unknown"
  hasNativeWind: boolean
  hasTypeScript: boolean
  packageManager: string
}> {
  const packageJsonPath = path.join(cwd, "package.json")

  let packageJson: Record<string, unknown> = {}
  try {
    const content = await fs.readFile(packageJsonPath, "utf-8")
    packageJson = JSON.parse(content)
  } catch {
    return {
      framework: "unknown",
      hasNativeWind: false,
      hasTypeScript: false,
      packageManager: "npm",
    }
  }

  const dependencies = {
    ...(packageJson.dependencies as Record<string, string> || {}),
    ...(packageJson.devDependencies as Record<string, string> || {}),
  }

  let framework: "expo" | "bare-react-native" | "unknown" = "unknown"
  if (dependencies["expo"]) {
    framework = "expo"
  } else if (dependencies["react-native"]) {
    framework = "bare-react-native"
  }

  const hasNativeWind = !!dependencies["nativewind"]
  const hasTypeScript = !!dependencies["typescript"]

  const packageManager = await detectPackageManager(cwd)

  return {
    framework,
    hasNativeWind,
    hasTypeScript,
    packageManager,
  }
}

async function detectPackageManager(cwd: string): Promise<string> {
  const lockFiles: Record<string, string> = {
    "package-lock.json": "npm",
    "yarn.lock": "yarn",
    "pnpm-lock.yaml": "pnpm",
    "bun.lockb": "bun",
  }

  for (const [lockFile, manager] of Object.entries(lockFiles)) {
    try {
      await fs.access(path.join(cwd, lockFile))
      return manager
    } catch {
      continue
    }
  }

  return "npm"
}
