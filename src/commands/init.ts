import * as fs from "fs/promises"
import * as path from "path"
import { getConfig, createConfig } from "../utils/get-config"
import { getProjectInfo } from "../utils/get-project-info"
import { addComponents } from "../utils/add-components"
import { log, info, success, warn, error } from "../utils/logger"

export interface InitOptions {
  cwd: string
  style?: string
  baseColor?: string
  force?: boolean
}

export async function init(options: InitOptions): Promise<void> {
  const { cwd, style = "default", baseColor = "neutral", force = false } = options

  log("Initializing shadcn-rn...")

  const projectInfo = await getProjectInfo(cwd)
  info(`Detected framework: ${projectInfo.framework}`)
  info(`Package manager: ${projectInfo.packageManager}`)

  if (!projectInfo.hasNativeWind) {
    warn("NativeWind not detected. Installing...")
    await installNativeWind(projectInfo.packageManager)
  }

  let config
  try {
    config = await getConfig(cwd)
    if (force) {
      warn("Config already exists. Overwriting...")
      config = await createConfig(cwd, { style, baseColor })
    } else {
      info("Config already exists. Use --force to overwrite.")
      return
    }
  } catch {
    config = await createConfig(cwd, { style, baseColor })
  }

  success("Created components.json")

  await addComponents({
    config,
    components: ["button"],
    overwrite: true,
    silent: false,
  })

  success("Initialized shadcn-rn!")
}

async function installNativeWind(packageManager: string): Promise<void> {
  const installCmd =
    packageManager === "npm"
      ? "npm install nativewind tailwindcss"
      : packageManager === "yarn"
      ? "yarn add nativewind tailwindcss"
      : packageManager === "pnpm"
      ? "pnpm add nativewind tailwindcss"
      : "bun add nativewind tailwindcss"

  const { execSync } = await import("child_process")
  execSync(installCmd, { stdio: "inherit" })
}
