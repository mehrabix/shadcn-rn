export const REGISTRY_URL =
  process.env.SHADCN_RN_REGISTRY_URL ||
  "https://raw.githubusercontent.com/mehrabix/shadcn-rn/main/registry"

export const BUILTIN_REGISTRIES: Record<string, string> = {
  "@shadcn-rn": `${REGISTRY_URL}/{name}.json`,
}

export const DEFAULT_STYLE = "default"

export const BASE_COLORS = [
  { name: "neutral", label: "Neutral" },
  { name: "zinc", label: "Zinc" },
  { name: "slate", label: "Slate" },
  { name: "stone", label: "Stone" },
] as const

export const DEPRECATED_COMPONENTS: Record<string, string> = {}

export const DEFAULT_COMPONENTS_PATH = "@/components"
export const DEFAULT_UTILS_PATH = "@/lib/utils"
export const DEFAULT_UI_PATH = "@/components/ui"
export const DEFAULT_HOOKS_PATH = "@/hooks"
export const DEFAULT_LIB_PATH = "@/lib"
