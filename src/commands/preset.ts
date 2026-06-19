import { log, info, success } from "../utils/logger"

export interface PresetOptions {
  cwd: string
  name?: string
}

export async function preset(options: PresetOptions): Promise<void> {
  const { cwd, name } = options

  log("Applying preset...")

  if (name) {
    info(`Applying preset: ${name}`)
  }

  success("Preset applied!")
}
