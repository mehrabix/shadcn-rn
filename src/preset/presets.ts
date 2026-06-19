export interface Preset {
  name: string
  label: string
  description: string
  items: string[]
}

export const presets: Preset[] = [
  {
    name: "default",
    label: "Default",
    description: "Default preset with common components",
    items: ["button", "card", "input", "badge"],
  },
  {
    name: "extended",
    label: "Extended",
    description: "Extended preset with more components",
    items: [
      "button",
      "card",
      "input",
      "badge",
      "alert",
      "separator",
      "label",
      "avatar",
    ],
  },
]

export function getPreset(name: string): Preset | undefined {
  return presets.find((p) => p.name === name)
}
