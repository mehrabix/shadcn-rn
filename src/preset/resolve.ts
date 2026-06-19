import type { Config } from "../registry/schema"
import { presets, getPreset } from "./presets"

export interface ResolvedPreset {
  name: string
  items: string[]
  config: Partial<Config>
}

export function resolvePreset(
  presetName: string,
  config: Config
): ResolvedPreset | null {
  const preset = getPreset(presetName)
  if (!preset) {
    return null
  }

  return {
    name: preset.name,
    items: preset.items,
    config: {
      style: config.style,
      tsx: config.tsx,
    },
  }
}
