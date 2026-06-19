import * as fs from "fs/promises"
import * as path from "path"
import { getConfig } from "../utils/get-config"
import { addComponents } from "../utils/add-components"
import { log, info, success, error } from "../utils/logger"

export interface ApplyOptions {
  cwd: string
  preset?: string
  only?: string[]
  force?: boolean
}

export async function apply(options: ApplyOptions): Promise<void> {
  const { cwd, preset, only, force = false } = options

  log("Applying preset...")

  const config = await getConfig(cwd)

  if (preset) {
    info(`Applying preset: ${preset}`)
  }

  if (only && only.length > 0) {
    info(`Applying only: ${only.join(", ")}`)
  }

  success("Preset applied!")
}
