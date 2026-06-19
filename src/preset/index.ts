export interface Preset {
  name: string
  title: string
  description: string
  style: string
  baseColor: string
  iconLibrary: string
}

export const defaultPresets: Preset[] = [
  {
    name: "default",
    title: "Default",
    description: "Default preset with standard styling",
    style: "default",
    baseColor: "neutral",
    iconLibrary: "lucide",
  },
  {
    name: "new-york",
    title: "New York",
    description: "New York style preset",
    style: "new-york",
    baseColor: "zinc",
    iconLibrary: "lucide",
  },
]

export function getPreset(name: string): Preset | undefined {
  return defaultPresets.find((p) => p.name === name)
}

export function getPresetNames(): string[] {
  return defaultPresets.map((p) => p.name)
}
