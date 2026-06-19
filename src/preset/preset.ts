import type { Config } from "../registry/schema"
import { resolvePreset } from "./resolve"

export async function applyPreset(
  presetName: string,
  config: Config
): Promise<Config> {
  const resolved = resolvePreset(presetName, config)
  if (!resolved) {
    return config
  }

  return {
    ...config,
    ...resolved.config,
  } as Config
}
