import * as fs from "fs/promises"
import * as path from "path"
import { z } from "zod"
import type { RawConfig, Config, WorkspaceConfig } from "../registry/schema"
import { rawConfigSchema, configSchema, workspaceConfigSchema } from "../registry/schema"
import { ConfigMissingError, ConfigParseError } from "../registry/errors"
import {
  BUILTIN_REGISTRIES,
  DEFAULT_COMPONENTS_PATH,
  DEFAULT_UTILS_PATH,
  DEFAULT_UI_PATH,
  DEFAULT_HOOKS_PATH,
  DEFAULT_LIB_PATH,
} from "../registry/constants"
import { cosmiconfig } from "cosmiconfig"
import { loadConfig, type ConfigLoaderSuccessResult } from "tsconfig-paths"
import fg from "fast-glob"
import { highlighter } from "./highlighter"
import { resolveImportWithMetadata } from "./resolve-import"

export const DEFAULT_STYLE = "default"
export const DEFAULT_TAILWIND_CSS = "global.css"
export const DEFAULT_TAILWIND_CONFIG = "nativewind.config.js"
export const DEFAULT_TAILWIND_BASE_COLOR = "neutral"

export const explorer = cosmiconfig("components", {
  searchPlaces: ["components.json"],
})

export type { Config, RawConfig, WorkspaceConfig } from "../registry/schema"

export async function getConfig(cwd: string): Promise<Config> {
  const config = await getRawConfig(cwd)

  if (!config) {
    throw new ConfigMissingError(cwd)
  }

  return await resolveConfigPaths(cwd, config)
}

export async function resolveConfigPaths(
  cwd: string,
  config: z.infer<typeof rawConfigSchema>
): Promise<Config> {
  const parsed = rawConfigSchema.parse(config)
  parsed.registries = {
    ...BUILTIN_REGISTRIES,
    ...(parsed.registries || {}),
  }

  const tsConfig = await loadConfig(cwd)

  if (tsConfig.resultType === "failed") {
    throw new Error(
      `Failed to load ${parsed.tsx ? "tsconfig" : "jsconfig"}.json. ${
        tsConfig.message ?? ""
      }`.trim()
    )
  }

  const resolvedUtils = await resolveAliasPath(
    "utils",
    parsed.aliases["utils"],
    cwd,
    tsConfig
  )
  const resolvedComponents = await resolveAliasPath(
    "components",
    parsed.aliases["components"],
    cwd,
    tsConfig
  )
  const resolvedUi = parsed.aliases["ui"]
    ? await resolveAliasPath("ui", parsed.aliases["ui"], cwd, tsConfig)
    : path.resolve(resolvedComponents ?? cwd, "ui")
  const resolvedLib = parsed.aliases["lib"]
    ? await resolveAliasPath("lib", parsed.aliases["lib"], cwd, tsConfig)
    : path.resolve(resolvedUtils ?? cwd, "..")
  const resolvedHooks = parsed.aliases["hooks"]
    ? await resolveAliasPath("hooks", parsed.aliases["hooks"], cwd, tsConfig)
    : path.resolve(resolvedComponents ?? cwd, "..", "hooks")

  assertResolvedAliases(cwd, {
    components: resolvedComponents,
    utils: resolvedUtils,
    ui: resolvedUi,
    lib: resolvedLib,
    hooks: resolvedHooks,
  })

  return configSchema.parse({
    ...parsed,
    resolvedPaths: {
      cwd,
      nativewindConfig: parsed.nativewind?.config
        ? path.resolve(cwd, parsed.nativewind.config)
        : "",
      nativewindCss: path.resolve(
        cwd,
        parsed.nativewind?.css || DEFAULT_TAILWIND_CSS
      ),
      utils: resolvedUtils,
      components: resolvedComponents,
      ui: resolvedUi,
      lib: resolvedLib,
      hooks: resolvedHooks,
    },
  })
}

async function resolveAliasPath(
  aliasKey: "components" | "utils" | "ui" | "lib" | "hooks",
  alias: string,
  cwd: string,
  tsConfig: Pick<ConfigLoaderSuccessResult, "absoluteBaseUrl" | "paths">
): Promise<string | null> {
  const resolved = await resolveImportWithMetadata(alias, {
    ...tsConfig,
    cwd,
  })

  if (!resolved?.path) {
    return null
  }

  if (alias.startsWith("#") && resolved.path === path.resolve(cwd, alias)) {
    return null
  }

  if (
    aliasKey !== "utils" &&
    (resolved.source === "package_imports" ||
      resolved.source === "workspace_package_exports")
  ) {
    if (
      !resolved.matchedAlias.includes("*") &&
      /\/index\.[^/]+$/.test(resolved.path)
    ) {
      return path.dirname(resolved.path)
    }

    if (
      resolved.matchedAlias.includes("*") &&
      /\.[^/]+$/.test(resolved.path)
    ) {
      return resolved.path.replace(/\.[^/]+$/, "")
    }
  }

  return resolved.path
}

function assertResolvedAliases(
  cwd: string,
  resolvedAliases: Record<
    "components" | "utils" | "ui" | "lib" | "hooks",
    string | null
  >
) {
  const missingAliases = ["components", "ui", "lib", "hooks", "utils"].filter(
    (key) => !resolvedAliases[key as keyof typeof resolvedAliases]
  )

  if (!missingAliases.length) {
    return
  }

  throw new Error(
    [
      `Could not resolve the following aliases in ${highlighter.info(cwd)}: ${highlighter.info(
        missingAliases.join(", ")
      )}.`,
      `Configure path aliases in ${highlighter.info(
        "tsconfig.json"
      )} or imports in ${highlighter.info(
        "package.json"
      )} for this workspace and try again.`,
    ].join("\n")
  )
}

export async function getRawConfig(
  cwd: string
): Promise<z.infer<typeof rawConfigSchema> | null> {
  try {
    const configResult = await explorer.search(cwd)

    if (!configResult) {
      return null
    }

    const config = rawConfigSchema.parse(configResult.config)

    if (config.registries) {
      for (const registryName of Object.keys(config.registries)) {
        if (registryName in BUILTIN_REGISTRIES) {
          throw new Error(
            `"${registryName}" is a built-in registry and cannot be overridden.`
          )
        }
      }
    }

    return config
  } catch (error) {
    const componentPath = `${cwd}/components.json`
    if (error instanceof Error && error.message.includes("reserved registry")) {
      throw error
    }
    throw new Error(
      `Invalid configuration found in ${highlighter.info(componentPath)}.`
    )
  }
}

export async function getWorkspaceConfig(
  config: Config
): Promise<WorkspaceConfig | null> {
  let resolvedAliases: Record<string, Config | null> = {}

  for (const key of Object.keys(config.aliases)) {
    if (!isAliasKey(key, config)) {
      continue
    }

    const resolvedPath = config.resolvedPaths[key]
    const packageRoot = await findPackageRoot(
      config.resolvedPaths.cwd,
      resolvedPath
    )

    if (!packageRoot) {
      resolvedAliases[key] = config
      continue
    }

    const workspaceConfig = await getConfig(packageRoot)

    if (!workspaceConfig) {
      throw new Error(
        [
          `Could not load the workspace config in ${highlighter.info(packageRoot)}.`,
          `Add ${highlighter.info(
            "components.json"
          )} to this workspace and configure its path aliases or package imports, then try again.`,
        ].join("\n")
      )
    }

    resolvedAliases[key] = workspaceConfig
  }

  const result = workspaceConfigSchema.safeParse(resolvedAliases)
  if (!result.success) {
    return null
  }

  return result.data
}

export async function findPackageRoot(
  cwd: string,
  resolvedPath: string
): Promise<string | null> {
  const commonRoot = findCommonRoot(cwd, resolvedPath)
  const relativePath = path.relative(commonRoot, resolvedPath)

  const packageRoots = await fg.glob("**/package.json", {
    cwd: commonRoot,
    deep: 3,
    ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/public/**",
    ],
  })

  const matchingPackageRoot = packageRoots
    .map((pkgPath) => path.dirname(pkgPath))
    .find((pkgDir) => relativePath.startsWith(pkgDir))

  return matchingPackageRoot ? path.join(commonRoot, matchingPackageRoot) : null
}

function isAliasKey(
  key: string,
  config: Config
): key is keyof Config["aliases"] {
  return Object.keys(config.resolvedPaths)
    .filter((key) => key !== "utils")
    .includes(key)
}

export function findCommonRoot(cwd: string, resolvedPath: string): string {
  const parts1 = cwd.split(path.sep)
  const parts2 = resolvedPath.split(path.sep)
  const commonParts: string[] = []

  for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
    if (parts1[i] !== parts2[i]) {
      break
    }
    commonParts.push(parts1[i])
  }

  return commonParts.join(path.sep)
}

export function getBase(style: string | undefined) {
  return style?.startsWith("base-") ? "base" : "radix"
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export function createConfig(partial?: DeepPartial<Config>): Config {
  const defaultConfig: Config = {
    resolvedPaths: {
      cwd: process.cwd(),
      nativewindConfig: "",
      nativewindCss: "",
      utils: "",
      components: "",
      ui: "",
      lib: "",
      hooks: "",
    },
    style: "",
    nativewind: {
      config: "",
      css: "",
      baseColor: "",
      cssVariables: false,
    },
    tsx: true,
    aliases: {
      components: "",
      utils: "",
    },
    registries: {
      ...BUILTIN_REGISTRIES,
    },
  }

  if (partial) {
    return {
      ...defaultConfig,
      ...partial,
      resolvedPaths: {
        ...defaultConfig.resolvedPaths,
        ...(partial.resolvedPaths || {}),
      },
      nativewind: {
        ...defaultConfig.nativewind,
        ...(partial.nativewind || {}),
      },
      aliases: {
        ...defaultConfig.aliases,
        ...(partial.aliases || {}),
      },
      registries: {
        ...defaultConfig.registries,
        ...(partial.registries || {}),
      },
    }
  }

  return defaultConfig
}

export async function createConfigFile(
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

  const configPath = path.join(cwd, "components.json")
  await fs.writeFile(configPath, JSON.stringify(config, null, 2))

  return resolveConfigPaths(cwd, config)
}
