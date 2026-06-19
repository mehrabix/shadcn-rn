import { getRegistryItems } from "../registry/api"
import { buildUrlAndHeadersForRegistryItem } from "../registry/builder"
import { configWithDefaults } from "../registry/config"
import { REGISTRY_URL, SHADCN_URL } from "../registry/constants"
import { type registryConfigSchema } from "../registry/schema"
import { isUrl } from "../registry/utils"
import { createConfig } from "../utils/get-config"
import { highlighter } from "../utils/highlighter"
import { logger } from "../utils/logger"
import open from "open"
import prompts from "prompts"
import { type z } from "zod"

import { DEFAULT_PRESETS } from "./defaults"

export { DEFAULT_PRESETS } from "./defaults"

export function resolveCreateUrl(
  searchParams?: Partial<{
    command: "create" | "init"
    template: string
    rtl: boolean
    pointer: boolean
    base: string
  }>
) {
  const url = new URL(`${SHADCN_URL}/create`)
  const { rtl, pointer, ...params } = searchParams ?? {}

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  if (rtl) {
    url.searchParams.set("rtl", "true")
  }

  if (pointer) {
    url.searchParams.set("pointer", "true")
  }

  return url.toString()
}

export async function promptToOpenPresetBuilder(options: {
  createUrl: string
  followUp: string
  prompt?: boolean
}) {
  logger.break()
  logger.log(
    `  Build your custom preset on ${highlighter.info(options.createUrl)}`
  )
  logger.log(`  ${options.followUp}`)
  logger.break()

  if (options.prompt === false) {
    return
  }

  const { proceed } = await prompts({
    type: "confirm",
    name: "proceed",
    message: "Open in browser?",
    initial: true,
  })

  if (proceed) {
    await open(options.createUrl)
  }
}

export function resolveInitUrl(
  preset: {
    base: string
    style: string
    baseColor: string
    theme: string
    chartColor?: string
    iconLibrary: string
    font: string
    fontHeading?: string
    rtl: boolean
    menuAccent: string
    menuColor: string
    radius: string
  },
  options?: {
    template?: string
    preset?: string
    only?: string
    pointer?: boolean
  }
) {
  const params = new URLSearchParams({
    base: preset.base,
    style: preset.style,
    baseColor: preset.baseColor,
    theme: preset.theme,
    iconLibrary: preset.iconLibrary,
    font: preset.font,
    rtl: String(preset.rtl ?? false),
    menuAccent: preset.menuAccent,
    menuColor: preset.menuColor,
    radius: preset.radius,
  })

  if (preset.chartColor && preset.chartColor !== "neutral") {
    params.set("chartColor", preset.chartColor)
  }

  if (preset.fontHeading && preset.fontHeading !== "inherit") {
    params.set("fontHeading", preset.fontHeading)
  }

  if (options?.preset) {
    params.set("preset", options.preset)
  }

  if (options?.template) {
    params.set("template", options.template)
  }

  if (options?.only) {
    params.set("only", options.only)
  }

  if (options?.pointer) {
    params.set("pointer", "true")
  }

  params.set("track", "1")

  return `${SHADCN_URL}/init?${params.toString()}`
}

export async function promptForBase() {
  const { base } = await prompts({
    type: "select",
    name: "base",
    message: `Select a ${highlighter.info("component library")}`,
    choices: [
      { title: "Radix", value: "radix" },
      { title: "Base", value: "base" },
    ],
  })
  if (!base) process.exit(1)
  return base as "radix" | "base"
}

export async function promptForPreset(options: {
  rtl: boolean
  base: string
  template?: string
  pointer?: boolean
}) {
  const presets = Object.entries(DEFAULT_PRESETS)

  const { selectedPreset } = await prompts({
    type: "select",
    name: "selectedPreset",
    message: `Which ${highlighter.info("preset")} would you like to use?`,
    choices: [
      ...presets.map(([name, preset]) => ({
        title: preset.title,
        description: preset.description,
        value: name,
      })),
      {
        title: "Custom",
        description: `Build your own at ${highlighter.info(`${SHADCN_URL}/create`)}`,
        value: "custom",
      },
    ],
  })

  if (!selectedPreset) {
    process.exit(1)
  }

  if (selectedPreset === "custom") {
    const createUrl = resolveCreateUrl({
      command: "init",
      rtl: options.rtl,
      pointer: options.pointer,
      base: options.base,
      ...(options.template && { template: options.template }),
    })
    await promptToOpenPresetBuilder({
      createUrl,
      followUp: `Then ${highlighter.info(
        "copy and run the command"
      )} from shadcn-rn.dev.`,
    })

    process.exit(0)
  }

  const preset = DEFAULT_PRESETS[selectedPreset as keyof typeof DEFAULT_PRESETS]
  if (!preset) {
    process.exit(1)
  }

  return {
    url: resolveInitUrl(
      { ...preset, base: options.base, rtl: options.rtl },
      {
        template: options.template,
        pointer: options.pointer,
      }
    ),
    base: options.base,
  }
}

export async function resolveRegistryBaseConfig(
  initUrl: string,
  cwd: string,
  options?: {
    registries?: z.infer<typeof registryConfigSchema>
  }
) {
  let shadowConfig = configWithDefaults(
    createConfig({
      resolvedPaths: {
        cwd,
      },
      ...(options?.registries && { registries: options.registries }),
    })
  )

  const { config: updatedConfig } = await ensureRegistriesInConfig(
    [initUrl],
    shadowConfig,
    {
      silent: true,
      writeFile: false,
    }
  )
  shadowConfig = updatedConfig

  buildUrlAndHeadersForRegistryItem(initUrl, shadowConfig)

  const [item] = await getRegistryItems([initUrl], {
    config: shadowConfig,
    useCache: true,
  })

  const registryBaseConfig =
    item?.type === "registry:base" && item.config ? item.config : undefined

  let cleanUrl = initUrl
  if (isShadcnInitUrl(initUrl)) {
    const url = new URL(initUrl)
    url.searchParams.delete("track")
    cleanUrl = url.toString()
  }

  return {
    registryBaseConfig,
    installStyleIndex: item?.extends !== "none",
    url: cleanUrl,
  }
}

function isShadcnInitUrl(url: string) {
  try {
    return new URL(url).pathname === "/init" && url.startsWith(SHADCN_URL)
  } catch {
    return false
  }
}

async function ensureRegistriesInConfig(
  urls: string[],
  config: ReturnType<typeof configWithDefaults>,
  options: { silent: boolean; writeFile: boolean }
) {
  // Simplified implementation — ensure registries from URLs are added to config
  const registries = { ...config.registries }

  for (const url of urls) {
    try {
      const parsed = new URL(url)
      const registryName = parsed.hostname
      if (!registries[registryName]) {
        registries[registryName] = `${parsed.origin}/r/{name}.json`
      }
    } catch {
      // Skip invalid URLs
    }
  }

  return {
    config: { ...config, registries },
  }
}
