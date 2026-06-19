import { promises as fs } from "fs"
import { findTailwindColorFamily } from "../colors"
import type { Config } from "../utils/get-config"
import postcss from "postcss"

import { DEFAULT_PRESETS } from "./defaults"
import {
  encodePreset,
  PRESET_BASE_COLORS,
  PRESET_FONT_HEADINGS,
  PRESET_FONTS,
  PRESET_ICON_LIBRARIES,
  PRESET_MENU_ACCENTS,
  PRESET_MENU_COLORS,
  PRESET_THEMES,
  type PresetConfig,
} from "./preset"

const PRESET_BASE_COLOR_SET = new Set<string>(PRESET_BASE_COLORS)
const PRESET_ICON_LIBRARY_SET = new Set<string>(PRESET_ICON_LIBRARIES)
const PRESET_MENU_ACCENT_SET = new Set<string>(PRESET_MENU_ACCENTS)
const PRESET_MENU_COLOR_SET = new Set<string>(PRESET_MENU_COLORS)
const PRESET_FONT_SET = new Set<string>(PRESET_FONTS)
const PRESET_FONT_HEADING_SET = new Set<string>(PRESET_FONT_HEADINGS)
const PRESET_THEME_SET = new Set<string>(PRESET_THEMES)
const SERIF_FONTS = new Set<PresetConfig["font"]>([
  "eb-garamond",
  "instrument-serif",
  "lora",
  "merriweather",
  "playfair-display",
  "noto-serif",
  "roboto-slab",
])
const MONO_FONTS = new Set<PresetConfig["font"]>([
  "jetbrains-mono",
  "geist-mono",
])
const ROOT_FONT_VARIABLES = [
  "--font-sans",
  "--font-serif",
  "--font-mono",
] as const
type RootFontVariable = (typeof ROOT_FONT_VARIABLES)[number]
const ROOT_FONT_VARIABLE_SET = new Set<string>(ROOT_FONT_VARIABLES)
const FONT_VARIABLES = [...ROOT_FONT_VARIABLES, "--font-heading"] as const
type FontVariable = (typeof FONT_VARIABLES)[number]
const FONT_VARIABLE_SET = new Set<string>(FONT_VARIABLES)
type CssState = {
  darkVars: Record<string, string>
  imports: string[]
  rootVars: Record<string, string>
  themeVars: Record<string, string>
}
const EMPTY_NEXT_FONT_STATE = {
  appliedBodyVariable: null,
  variables: {},
}
const RADIUS_MAP: Record<string, PresetConfig["radius"]> = {
  "0": "none",
  "0rem": "none",
  "0.45rem": "small",
  "0.625rem": "default",
  "0.875rem": "large",
}

export async function resolveProjectPreset(config: Config) {
  const style = normalizePresetStyle(config.style)
  if (!style) {
    return { code: null, fallbacks: [], values: null }
  }

  const defaults = DEFAULT_PRESETS[style]
  if (!defaults) {
    return { code: null, fallbacks: [], values: null }
  }

  const cssState = await readCssState(config.resolvedPaths.tailwindCss)

  const baseColor = asPresetValue<PresetConfig["baseColor"]>(
    PRESET_BASE_COLOR_SET,
    config.tailwind?.baseColor
  )
  const theme = matchTheme(cssState)
  const chartColor = matchChartColor(cssState)
  const iconLibrary = asPresetValue<PresetConfig["iconLibrary"]>(
    PRESET_ICON_LIBRARY_SET,
    config.iconLibrary
  )
  const resolvedFont = resolveBodyFont(cssState)
  const font = resolvedFont ?? defaults.font
  const resolvedFontHeading = resolveHeadingFont(cssState, font)
  const fontHeading = normalizeFontHeading(
    resolvedFontHeading ?? defaults.fontHeading,
    font,
    defaults.fontHeading
  )
  const radius = matchRadius(cssState.rootVars["--radius"])
  const menuAccent = asPresetValue<PresetConfig["menuAccent"]>(
    PRESET_MENU_ACCENT_SET,
    config.menuAccent
  )
  const menuColor = asPresetValue<PresetConfig["menuColor"]>(
    PRESET_MENU_COLOR_SET,
    config.menuColor
  )

  const values = {
    style,
    baseColor: baseColor ?? defaults.baseColor,
    theme: theme ?? defaults.theme,
    chartColor: chartColor ?? defaults.chartColor,
    iconLibrary: iconLibrary ?? defaults.iconLibrary,
    font,
    fontHeading,
    radius: radius ?? defaults.radius,
    menuAccent: menuAccent ?? defaults.menuAccent,
    menuColor: menuColor ?? defaults.menuColor,
  } satisfies PresetConfig

  const fallbacks = [
    !baseColor && "baseColor",
    !theme && "theme",
    !chartColor && "chartColor",
    !iconLibrary && "iconLibrary",
    !resolvedFont && "font",
    !resolvedFontHeading && "fontHeading",
    !radius && "radius",
    !menuAccent && "menuAccent",
    !menuColor && "menuColor",
  ].filter(Boolean)

  return {
    code: encodePreset(values),
    fallbacks,
    values,
  }
}

async function readCssState(tailwindCssPath?: string) {
  const fallbackState: CssState = {
    darkVars: {},
    imports: [],
    rootVars: {},
    themeVars: {},
  }

  if (!tailwindCssPath) {
    return fallbackState
  }

  try {
    const input = await fs.readFile(tailwindCssPath, "utf8")
    return extractCssState(input)
  } catch {
    return fallbackState
  }
}

function normalizePresetStyle(style: string | undefined) {
  if (!style) {
    return null
  }

  const normalized = style.replace(/^(base|radix)-/, "")
  if (!(normalized in DEFAULT_PRESETS)) {
    return null
  }

  return normalized as keyof typeof DEFAULT_PRESETS
}

function extractCssState(input: string) {
  const root = postcss.parse(input)
  const state: CssState = {
    darkVars: {},
    imports: [],
    rootVars: {},
    themeVars: {},
  }

  root.walkAtRules("import", (atRule) => {
    const source = parseImportSource(atRule.params)
    if (source) {
      state.imports.push(source)
    }
  })

  root.walkRules((rule) => {
    const selectors = rule.selector
      .split(",")
      .map((selector) => selector.trim())
      .filter(Boolean)

    if (selectors.includes(":root")) {
      collectDeclarations(rule, state.rootVars)
    }

    if (selectors.includes(".dark")) {
      collectDeclarations(rule, state.darkVars)
    }
  })

  root.walkAtRules("theme", (atRule) => {
    if (atRule.params.trim() !== "inline") {
      return
    }

    collectDeclarations(atRule, state.themeVars)
  })

  return state
}

function collectDeclarations(
  node: { nodes?: postcss.ChildNode[] },
  target: Record<string, string>
) {
  for (const child of node.nodes ?? []) {
    if (child.type !== "decl" || !child.prop.startsWith("--")) {
      continue
    }

    target[child.prop] = child.value.trim()
  }
}

function parseImportSource(params: string) {
  const normalized = params.trim()
  const match =
    normalized.match(/^url\((['"]?)(.+?)\1\)$/) ??
    normalized.match(/^(['"])(.+?)\1$/)

  return match?.[2] ?? null
}

function matchTheme(state: CssState) {
  const lightTheme = matchPresetThemeValue(state.rootVars["--primary"])
  if (!lightTheme) {
    return null
  }

  const darkPrimary = state.darkVars["--primary"]
  if (!darkPrimary) {
    return lightTheme
  }

  const darkTheme = matchPresetThemeValue(darkPrimary)
  return darkTheme === lightTheme ? lightTheme : null
}

function matchChartColor(state: CssState) {
  const lightChartColor = matchPresetThemeValue(state.rootVars["--chart-1"])
  if (!lightChartColor) {
    return null
  }

  const darkChartColorValue = state.darkVars["--chart-1"]
  if (!darkChartColorValue) {
    return lightChartColor
  }

  const darkChartColor = matchPresetThemeValue(darkChartColorValue)
  return darkChartColor === lightChartColor ? lightChartColor : null
}

function matchPresetThemeValue(value: string | undefined) {
  const family = findTailwindColorFamily(value)

  if (!family || !PRESET_THEME_SET.has(family)) {
    return null
  }

  return family as PresetConfig["theme"]
}

function matchRadius(value: string | undefined) {
  if (!value) {
    return null
  }

  const normalized = normalizeCssValue(value)
  return RADIUS_MAP[normalized] ?? null
}

function resolveBodyFont(state: CssState) {
  for (const variable of ROOT_FONT_VARIABLES) {
    const resolved = resolveFontValue(state, variable)
    const matched = resolved ? parseFontFromFamily(resolved) : null
    if (matched) {
      return matched
    }
  }

  for (const variable of ROOT_FONT_VARIABLES) {
    const matches = state.imports.flatMap((input) => {
      const font = parseFontFromDependency(input)
      return font && getFontVariable(font) === variable ? [font] : []
    })

    if (matches.length === 1) {
      return matches[0]
    }
  }

  return null
}

function resolveHeadingFont(
  state: CssState,
  bodyFont: PresetConfig["font"]
) {
  const resolved = resolveFontValue(state, "--font-heading")
  const matched = resolved ? parseFontFromFamily(resolved) : null
  if (matched) {
    return matched === bodyFont ? "inherit" : matched
  }

  return null
}

function normalizeFontHeading(
  fontHeading: PresetConfig["fontHeading"],
  bodyFont: PresetConfig["font"],
  fallback: PresetConfig["fontHeading"]
) {
  const normalized = fontHeading === bodyFont ? "inherit" : fontHeading
  return PRESET_FONT_HEADING_SET.has(normalized) ? normalized : fallback
}

function resolveFontValue(
  state: CssState,
  variable: FontVariable,
  seen = new Set<string>()
) {
  if (seen.has(variable)) {
    return null
  }

  seen.add(variable)

  const value = getCssVariableValue(state, variable)
  if (!value) {
    return null
  }

  const reference = getVarReference(value)
  if (!reference) {
    return value
  }

  if (FONT_VARIABLE_SET.has(reference)) {
    return resolveFontValue(state, reference as FontVariable, seen)
  }

  return null
}

function getCssVariableValue(state: CssState, variable: FontVariable) {
  const themeValue = state.themeVars[variable]
  if (themeValue && getVarReference(themeValue) !== variable) {
    return themeValue
  }

  return state.rootVars[variable] ?? themeValue ?? null
}

function getVarReference(value: string) {
  const normalized = normalizeCssValue(value)
  const match = normalized.match(/^var\((--[a-z0-9-]+)\)$/)
  return match?.[1] ?? null
}

function parseFontFromFamily(value: string | undefined) {
  if (!value) {
    return null
  }

  const primaryFamily = stripQuotes(value.split(",")[0]?.trim() ?? "")
    .replace(/\s+variable$/i, "")
    .trim()

  if (!primaryFamily) {
    return null
  }

  return toPresetFont(primaryFamily.replace(/\s+/g, "-"))
}

function parseFontFromDependency(value: string | undefined) {
  if (!value) {
    return null
  }

  const normalized = normalizeCssValue(value)
  const prefix = "@fontsource-variable/"
  if (!normalized.startsWith(prefix)) {
    return null
  }

  return toPresetFont(normalized.slice(prefix.length))
}

function toPresetFont(value: string | undefined) {
  const normalized = normalizeCssValue(value)
  return PRESET_FONT_SET.has(normalized)
    ? (normalized as PresetConfig["font"])
    : null
}

function getFontVariable(font: PresetConfig["font"]) {
  if (MONO_FONTS.has(font)) {
    return "--font-mono"
  }

  if (SERIF_FONTS.has(font)) {
    return "--font-serif"
  }

  return "--font-sans"
}

function normalizeCssValue(value: string | undefined) {
  if (!value) {
    return ""
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/"/g, "'")
    .toLowerCase()
}

function stripQuotes(value: string) {
  return value.replace(/^['"]|['"]$/g, "")
}

function asPresetValue<T extends string>(
  set: Set<string>,
  value: string | undefined
) {
  return value && set.has(value) ? (value as T) : null
}
