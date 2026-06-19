import * as fs from "fs/promises"
import * as path from "path"
import { getConfig } from "../utils/get-config"
import { addComponents } from "../utils/add-components"
import { log, info, success, error as logError } from "../utils/logger"
import { resolvePreset } from "../preset/resolve"
import { getPresetByName } from "../preset/defaults"

export interface ApplyOptions {
  cwd: string
  preset?: string
  only?: string[]
  force?: boolean
}

export async function apply(options: ApplyOptions): Promise<void> {
  const { cwd, preset, only, force = false } = options

  log("Applying preset...")

  const config = await getConfig(cwd)

  let presetName = preset
  if (!presetName) {
    presetName = "default"
  }

  const presetConfig = getPresetByName(presetName)
  if (!presetConfig) {
    logError(`Preset "${presetName}" not found`)
    return
  }

  info(`Applying preset: ${presetName}`)
  info(`Description: ${presetConfig.description}`)

  const resolved = await resolvePreset(presetConfig.url)

  if (resolved?.components && resolved.components.length > 0) {
    const componentsToInstall = only && only.length > 0
      ? resolved.components.filter((c) => only.includes(c))
      : resolved.components

    if (componentsToInstall.length > 0) {
      info(`Installing ${componentsToInstall.length} components...`)
      await addComponents({
        components: componentsToInstall,
        cwd,
        overwrite: force,
        yes: true,
        silent: true,
      })
    }
  }

  if (resolved?.cssVars) {
    const cssPath = path.resolve(cwd, config.resolvedPaths.nativewindCss)
    const cssVars = resolved.cssVars
    let cssContent: string
    try {
      cssContent = await fs.readFile(cssPath, "utf-8")
    } catch {
      cssContent = ""
    }

    for (const [selector, vars] of Object.entries(cssVars)) {
      const block = `${selector} {\n${Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join("\n")}\n}`
      if (!cssContent.includes(selector)) {
        cssContent += `\n${block}`
      }
    }

    await fs.writeFile(cssPath, cssContent)
    info("Applied CSS variables")
  }

  success(`Preset "${presetName}" applied!`)
}

async function resolvePreset(
  presetUrl: string
): Promise<{ components: string[]; cssVars?: Record<string, Record<string, string>> } | null> {
  try {
    const { resolvePreset: resolve } = await import("../preset/resolve")
    const resolved = await resolve(presetUrl)
    return resolved
  } catch {
    return null
  }
}
