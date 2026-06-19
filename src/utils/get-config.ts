import * as fs from "fs/promises"
import * as path from "path"
import { z } from "zod"
import type { RawConfig, Config } from "../registry/schema"
import { rawConfigSchema } from "../registry/schema"
import { ConfigMissingError, ConfigParseError } from "../registry/errors"
import {
  DEFAULT_COMPONENTS_PATH,
  DEFAULT_UTILS_PATH,
  DEFAULT_UI_PATH,
  DEFAULT_HOOKS_PATH,
  DEFAULT_LIB_PATH,
} from "../registry/constants"

const CONFIG_FILE = "components.json"

export async function getConfig(cwd: string): Promise<Config> {
  const configPath = path.join(cwd, CONFIG_FILE)

  try {
    const content = await fs.readFile(configPath, "utf-8")
    const data = JSON.parse(content)

    const parsed = rawConfigSchema.safeParse(data)
    if (!parsed.success) {
      throw new ConfigParseError(
        `Invalid config: ${parsed.error.message}`
      )
    }

    return resolveConfigPaths(parsed.data, cwd)
  } catch (error) {
    if (error instanceof ConfigParseError) {
      throw error
    }
    throw new ConfigMissingError(cwd)
  }
}

export async function getRawConfig(cwd: string): Promise<RawConfig> {
  const configPath = path.join(cwd, CONFIG_FILE)

  try {
    const content = await fs.readFile(configPath, "utf-8")
    const data = JSON.parse(content)

    const parsed = rawConfigSchema.safeParse(data)
    if (!parsed.success) {
      throw new ConfigParseError(
        `Invalid config: ${parsed.error.message}`
      )
    }

    return parsed.data
  } catch (error) {
    if (error instanceof ConfigParseError) {
      throw error
    }
    throw new ConfigMissingError(cwd)
  }
}

export function resolveConfigPaths(config: RawConfig, cwd: string): Config {
  return {
    ...config,
    resolvedPaths: {
      cwd,
      nativewindConfig: config.nativewind?.config || "nativewind.config.js",
      nativewindCss: config.nativewind?.css || "global.css",
      utils: config.aliases?.utils || DEFAULT_UTILS_PATH,
      components: config.aliases?.components || DEFAULT_COMPONENTS_PATH,
      lib: config.aliases?.lib || DEFAULT_LIB_PATH,
      hooks: config.aliases?.hooks || DEFAULT_HOOKS_PATH,
      ui: config.aliases?.ui || DEFAULT_UI_PATH,
    },
  }
}

export async function createConfig(
  cwd: string,
  options: {
    style?: string
    baseColor?: string
    tsx?: boolean
  }
): Promise<Config> {
  const config: RawConfig = {
    style: options.style || "default",
    tsx: options.tsx !== false,
    nativewind: {
      baseColor: options.baseColor || "neutral",
      cssVariables: true,
    },
    aliases: {
      components: DEFAULT_COMPONENTS_PATH,
      utils: DEFAULT_UTILS_PATH,
    },
  }

  const configPath = path.join(cwd, CONFIG_FILE)
  await fs.writeFile(configPath, JSON.stringify(config, null, 2))

  return resolveConfigPaths(config, cwd)
}
