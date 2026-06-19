import * as fs from "fs/promises"
import * as path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, success, warn } from "../utils/logger"
import { decodePresetUrl, parsePresetState } from "../preset/preset"
import { getPresetByName } from "../preset/defaults"

export interface PresetOptions {
  cwd: string
  name?: string
}

export async function preset(options: PresetOptions): Promise<void> {
  const { cwd, name } = options

  log("Applying preset...")

  const config = await getConfig(cwd)

  if (name) {
    info(`Applying preset: ${name}`)

    const presetConfig = getPresetByName(name)
    if (presetConfig) {
      info(`Found preset: ${presetConfig.name}`)
      info(`Description: ${presetConfig.description}`)
      info(`URL: ${presetConfig.url}`)
    } else {
      warn(`Preset "${name}" not found in defaults, treating as URL`)
      try {
        const state = decodePresetUrl(name)
        if (state) {
          info(`Decoded preset state: ${JSON.stringify(state, null, 2)}`)
        }
      } catch {
        warn(`Could not decode preset URL: ${name}`)
      }
    }
  } else {
    const { presets: defaultPresets } = await import("../preset/defaults")
    info("Available presets:")
    for (const p of defaultPresets) {
      log(`  ${p.name} - ${p.description}`)
    }
  }

  success("Preset applied!")
}
