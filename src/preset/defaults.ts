import { type PresetConfig } from "./preset"

export interface PresetDefaults {
  title: string
  description: string
  style: PresetConfig["style"]
  baseColor: PresetConfig["baseColor"]
  theme: PresetConfig["theme"]
  chartColor: PresetConfig["chartColor"]
  iconLibrary: PresetConfig["iconLibrary"]
  font: PresetConfig["font"]
  fontHeading: PresetConfig["fontHeading"]
  radius: PresetConfig["radius"]
  menuAccent: PresetConfig["menuAccent"]
  menuColor: PresetConfig["menuColor"]
}

export const DEFAULT_PRESETS: Record<string, PresetDefaults> = {
  "nova-neutral": {
    title: "Nova Neutral",
    description: "Clean, minimal design with neutral tones",
    style: "nova",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "blue",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    radius: "default",
    menuAccent: "subtle",
    menuColor: "default",
  },
  "vega-zinc": {
    title: "Vega Zinc",
    description: "Modern design with zinc palette",
    style: "vega",
    baseColor: "zinc",
    theme: "zinc",
    chartColor: "amber",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    radius: "default",
    menuAccent: "subtle",
    menuColor: "default",
  },
  "maia-stone": {
    title: "Maia Stone",
    description: "Warm, earthy design with stone tones",
    style: "maia",
    baseColor: "stone",
    theme: "stone",
    chartColor: "lime",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    radius: "default",
    menuAccent: "subtle",
    menuColor: "default",
  },
  "lyra-neutral": {
    title: "Lyra Neutral",
    description: "Elegant design with neutral palette",
    style: "lyra",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "emerald",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    radius: "default",
    menuAccent: "subtle",
    menuColor: "default",
  },
  "mira-mauve": {
    title: "Mira Mauve",
    description: "Soft, purple-tinted design",
    style: "mira",
    baseColor: "mauve",
    theme: "mauve",
    chartColor: "violet",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    radius: "default",
    menuAccent: "subtle",
    menuColor: "default",
  },
  "luma-olive": {
    title: "Luma Olive",
    description: "Natural, green-tinged design",
    style: "luma",
    baseColor: "olive",
    theme: "olive",
    chartColor: "green",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    radius: "default",
    menuAccent: "subtle",
    menuColor: "default",
  },
  "sera-mist": {
    title: "Sera Mist",
    description: "Cool, blue-tinged design",
    style: "sera",
    baseColor: "mist",
    theme: "mist",
    chartColor: "rose",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    radius: "default",
    menuAccent: "subtle",
    menuColor: "default",
  },
  "rhea-taupe": {
    title: "Rhea Taupe",
    description: "Warm, brown-tinged design",
    style: "rhea",
    baseColor: "taupe",
    theme: "taupe",
    chartColor: "cyan",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    radius: "default",
    menuAccent: "subtle",
    menuColor: "default",
  },
}
