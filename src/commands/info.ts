import * as fs from "fs/promises"
import * as path from "path"
import { getConfig } from "../utils/get-config"
import { log, info } from "../utils/logger"

export interface InfoOptions {
  cwd: string
}

export async function infoCommand(options: InfoOptions): Promise<void> {
  const { cwd } = options

  try {
    const config = await getConfig(cwd)

    log("Project Info:")
    info(`Style: ${config.style}`)
    info(`TSX: ${config.tsx}`)
    info(`Components Path: ${config.resolvedPaths.components}`)
    info(`Utils Path: ${config.resolvedPaths.utils}`)
    info(`UI Path: ${config.resolvedPaths.ui}`)
    info(`Hooks Path: ${config.resolvedPaths.hooks}`)
    info(`NativeWind CSS: ${config.resolvedPaths.nativewindCss}`)
  } catch {
    log("No shadcn-rn configuration found")
  }
}
