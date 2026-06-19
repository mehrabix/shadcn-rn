import * as fs from "fs/promises"
import * as path from "path"

export interface ProjectInfo {
  framework: {
    name: "expo" | "bare-react-native" | "manual"
    label: string
    links: {
      installation?: string
      tailwind?: string
    }
  }
  hasNativeWind: boolean
  hasTypeScript: boolean
  packageManager: string
  tailwindVersion: "v3" | "v4" | null
  tailwindConfigFile: string | null
  tailwindCssFile: string | null
  aliasPrefix: string | null
}

export async function getProjectInfo(
  cwd: string,
  options?: { configCssFile?: string }
): Promise<ProjectInfo> {
  const packageJsonPath = path.join(cwd, "package.json")

  let packageJson: Record<string, unknown> = {}
  try {
    const content = await fs.readFile(packageJsonPath, "utf-8")
    packageJson = JSON.parse(content)
  } catch {
    return {
      framework: { name: "manual", label: "Manual", links: {} },
      hasNativeWind: false,
      hasTypeScript: false,
      packageManager: "npm",
      tailwindVersion: null,
      tailwindConfigFile: null,
      tailwindCssFile: null,
      aliasPrefix: null,
    }
  }

  const dependencies = {
    ...(packageJson.dependencies as Record<string, string> || {}),
    ...(packageJson.devDependencies as Record<string, string> || {}),
  }

  let framework: ProjectInfo["framework"]
  if (dependencies["expo"]) {
    framework = {
      name: "expo",
      label: "Expo",
      links: {
        installation: "https://docs.expo.dev/get-started/installation/",
        tailwind: "https://www.nativewind.dev/getting-started/expo-router",
      },
    }
  } else if (dependencies["react-native"]) {
    framework = {
      name: "bare-react-native",
      label: "Bare React Native",
      links: {
        installation: "https://reactnative.dev/docs/environment-setup",
        tailwind: "https://www.nativewind.dev/getting-started/installation",
      },
    }
  } else {
    framework = {
      name: "manual",
      label: "Manual",
      links: {},
    }
  }

  const hasNativeWind = !!dependencies["nativewind"]
  const hasTypeScript = !!dependencies["typescript"] || !!dependencies["@types/react"]

  const packageManager = await detectPackageManager(cwd)
  const { tailwindVersion, tailwindConfigFile, tailwindCssFile } =
    await detectTailwind(cwd, options?.configCssFile)
  const aliasPrefix = await detectAliasPrefix(cwd)

  return {
    framework,
    hasNativeWind,
    hasTypeScript,
    packageManager,
    tailwindVersion,
    tailwindConfigFile,
    tailwindCssFile,
    aliasPrefix,
  }
}

async function detectTailwind(
  cwd: string,
  configCssFile?: string
): Promise<{
  tailwindVersion: "v3" | "v4" | null
  tailwindConfigFile: string | null
  tailwindCssFile: string | null
}> {
  const tailwindConfigFiles = [
    "tailwind.config.js",
    "tailwind.config.ts",
    "tailwind.config.cjs",
    "tailwind.config.mjs",
  ]

  let tailwindConfigFile: string | null = null
  for (const file of tailwindConfigFiles) {
    try {
      await fs.access(path.join(cwd, file))
      tailwindConfigFile = file
      break
    } catch {
      continue
    }
  }

  const cssFiles = [configCssFile, "global.css", "app.css", "styles.css"].filter(
    Boolean
  ) as string[]
  let tailwindCssFile: string | null = null
  for (const file of cssFiles) {
    try {
      const content = await fs.readFile(path.join(cwd, file), "utf-8")
      if (
        content.includes("@tailwind") ||
        content.includes("@import") && content.includes("tailwindcss")
      ) {
        tailwindCssFile = file
        break
      }
    } catch {
      continue
    }
  }

  if (tailwindConfigFile) {
    return { tailwindVersion: "v3", tailwindConfigFile, tailwindCssFile }
  }

  if (tailwindCssFile) {
    try {
      const content = await fs.readFile(
        path.join(cwd, tailwindCssFile),
        "utf-8"
      )
      if (content.includes("@import") && content.includes("tailwindcss")) {
        return { tailwindVersion: "v4", tailwindConfigFile: null, tailwindCssFile }
      }
    } catch {
      // continue
    }
  }

  return { tailwindVersion: null, tailwindConfigFile: null, tailwindCssFile: null }
}

async function detectAliasPrefix(cwd: string): Promise<string | null> {
  try {
    const tsConfigPath = path.join(cwd, "tsconfig.json")
    const content = await fs.readFile(tsConfigPath, "utf-8")
    const tsConfig = JSON.parse(content)

    const paths = tsConfig.compilerOptions?.paths
    if (paths) {
      const pathEntries = Object.entries(paths) as [string, string[]][]
      for (const [alias, targets] of pathEntries) {
        if (alias.startsWith("@/")) {
          return alias.replace("/*", "").replace("*", "")
        }
      }
    }

    if (tsConfig.compilerOptions?.baseUrl) {
      return "@"
    }
  } catch {
    // continue
  }

  try {
    const packageJsonPath = path.join(cwd, "package.json")
    const content = await fs.readFile(packageJsonPath, "utf-8")
    const packageJson = JSON.parse(content)
    const imports = packageJson.imports as Record<string, string> | undefined
    if (imports) {
      for (const [key, value] of Object.entries(imports)) {
        if (key.startsWith("#") && typeof value === "string") {
          return key.split("/")[0]
        }
      }
    }
  } catch {
    // continue
  }

  return null
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
