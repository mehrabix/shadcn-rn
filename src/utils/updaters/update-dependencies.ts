import { execSync } from "child_process"
import * as fs from "fs/promises"
import * as path from "path"

export interface UpdateDepsOptions {
  packageManager: string
  dev?: boolean
  cwd?: string
  silent?: boolean
}

export async function updateDependencies(
  dependencies: string[],
  options: UpdateDepsOptions
): Promise<void> {
  if (dependencies.length === 0) return

  const cwd = options.cwd || process.cwd()
  const isExpo = await detectExpo(cwd)

  if (isExpo) {
    await installExpoDeps(dependencies, options)
    return
  }

  let installCmd = ""
  switch (options.packageManager) {
    case "yarn":
      installCmd = `yarn add ${dependencies.join(" ")}`
      break
    case "pnpm":
      installCmd = `pnpm add ${dependencies.join(" ")}`
      break
    case "bun":
      installCmd = `bun add ${dependencies.join(" ")}`
      break
    default:
      installCmd = `npm install ${dependencies.join(" ")}`
  }

  if (options.dev) {
    installCmd += " -D"
  }

  try {
    execSync(installCmd, {
      stdio: options.silent ? "ignore" : "inherit",
      cwd,
    })
  } catch (error) {
    if (!options.silent) {
      console.error(`Failed to install dependencies: ${error}`)
    }
    throw error
  }
}

async function detectExpo(cwd: string): Promise<boolean> {
  try {
    const pkgPath = path.join(cwd, "package.json")
    const content = await fs.readFile(pkgPath, "utf-8")
    const pkg = JSON.parse(content)
    return !!(
      pkg.dependencies?.expo ||
      pkg.devDependencies?.expo
    )
  } catch {
    return false
  }
}

async function installExpoDeps(
  dependencies: string[],
  options: UpdateDepsOptions
): Promise<void> {
  const cwd = options.cwd || process.cwd()

  const installCmd = `npx expo install ${dependencies.join(" ")}`

  try {
    execSync(installCmd, {
      stdio: options.silent ? "ignore" : "inherit",
      cwd,
    })
  } catch (error) {
    if (!options.silent) {
      console.error(`Failed to install Expo dependencies: ${error}`)
    }
    throw error
  }
}
