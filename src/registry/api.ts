import path from "path"
import { buildUrlAndHeadersForRegistryItem } from "./builder"
import { configWithDefaults } from "./config"
import {
  BASE_COLORS,
  BUILTIN_REGISTRIES,
  REGISTRY_URL,
} from "./constants"
import {
  clearRegistryContext,
  setRegistryHeaders,
} from "./context"
import {
  RegistryNotFoundError,
  RegistryParseError,
} from "./errors"
import { fetchRegistry } from "./fetcher"
import {
  resolveRegistryTree,
} from "./resolver"
import { isUrl } from "./utils"
import {
  iconsSchema,
  registriesIndexSchema,
  registriesSchema,
  registryConfigSchema,
  registryIndexSchema,
  registryItemSchema,
  registrySchema,
  stylesSchema,
} from "./schema"
import { type Config, explorer } from "../utils/get-config"
import { z } from "zod"

export async function getRegistry(
  name: string,
  options?: {
    config?: Partial<Config>
    useCache?: boolean
  }
) {
  const { config, useCache } = options || {}

  if (isUrl(name)) {
    const [result] = await fetchRegistry([name], { useCache })
    return parseRegistryCatalog(name, result)
  }

  if (!name.startsWith("@")) {
    throw new RegistryNotFoundError(name)
  }

  let registryName = name
  if (!registryName.endsWith("/registry")) {
    registryName = `${registryName}/registry`
  }

  const resolvedConfig = configWithDefaults(config)
  const registries = resolvedConfig.registries
  if (!registries) {
    throw new RegistryNotFoundError(registryName)
  }

  const urlAndHeaders = buildUrlAndHeadersForRegistryItem(
    registryName as `@${string}`,
    registries
  )

  if (!urlAndHeaders?.url) {
    throw new RegistryNotFoundError(registryName)
  }

  if (urlAndHeaders.headers && Object.keys(urlAndHeaders.headers).length > 0) {
    setRegistryHeaders({
      [urlAndHeaders.url]: urlAndHeaders.headers,
    })
  }

  const [result] = await fetchRegistry([urlAndHeaders.url], { useCache })

  return parseRegistryCatalog(registryName, result)
}

function parseRegistryCatalog(name: string, result: unknown) {
  try {
    const registry = registrySchema.parse(result)
    return registry
  } catch (error) {
    throw new RegistryParseError(name, { cause: error })
  }
}

export async function getRegistryItems(
  items: string[],
  options?: {
    config?: Partial<Config>
    useCache?: boolean
  }
) {
  const { config, useCache = false } = options || {}

  clearRegistryContext()

  const registries = config?.registries || BUILTIN_REGISTRIES
  const results: z.infer<typeof registryItemSchema>[] = []

  for (const itemName of items) {
    const urlInfo = buildUrlAndHeadersForRegistryItem(itemName, registries)
    if (!urlInfo) {
      continue
    }
    const [item] = await fetchRegistry([urlInfo.url], {
      useCache,
      headers: urlInfo.headers,
    })
    if (item) {
      results.push(item)
    }
  }

  return results
}

export async function resolveRegistryItems(
  items: string[],
  options?: {
    config?: Partial<Config>
    useCache?: boolean
  }
) {
  const { config, useCache = false } = options || {}

  clearRegistryContext()
  return resolveRegistryTree(items, { config: configWithDefaults(config) as Config })
}

export async function getRegistriesConfig(
  cwd: string,
  options?: { useCache?: boolean }
) {
  const { useCache = true } = options || {}

  if (!useCache) {
    explorer.clearCaches()
  }

  const configResult = await explorer.search(cwd)

  if (!configResult) {
    return {
      registries: BUILTIN_REGISTRIES,
    }
  }

  const registriesConfig = z
    .object({
      registries: registryConfigSchema.optional(),
    })
    .safeParse(configResult.config)

  if (!registriesConfig.success) {
    return {
      registries: BUILTIN_REGISTRIES,
    }
  }

  return {
    registries: {
      ...BUILTIN_REGISTRIES,
      ...(registriesConfig.data.registries || {}),
    },
  }
}

export async function getShadcnRegistryIndex() {
  const [result] = await fetchRegistry(["index.json"])
  return registryIndexSchema.parse(result)
}

export async function getRegistryStyles() {
  try {
    const [result] = await fetchRegistry(["styles/index.json"])
    return stylesSchema.parse(result)
  } catch {
    return []
  }
}

export async function getRegistryIcons() {
  try {
    const [result] = await fetchRegistry(["icons/index.json"])
    return iconsSchema.parse(result)
  } catch {
    return {}
  }
}

export async function getRegistryBaseColors() {
  return BASE_COLORS
}

export async function resolveTree(
  index: z.infer<typeof registryIndexSchema>,
  names: string[]
) {
  const tree: z.infer<typeof registryIndexSchema> = []

  for (const name of names) {
    const entry = index.find((entry) => entry.name === name)

    if (!entry) {
      continue
    }

    tree.push(entry)

    if (entry.registryDependencies) {
      const dependencies = await resolveTree(index, entry.registryDependencies)
      tree.push(...dependencies)
    }
  }

  return tree.filter(
    (component, index, self) =>
      self.findIndex((c) => c.name === component.name) === index
  )
}

export async function fetchTree(
  style: string,
  tree: z.infer<typeof registryIndexSchema>
) {
  try {
    const paths = tree.map((item) => `styles/${style}/${item.name}.json`)
    const results = await fetchRegistry(paths)
    return results.map((result) => registryItemSchema.parse(result))
  } catch {
    return []
  }
}

export async function getItemTargetPath(
  config: Config,
  item: Pick<z.infer<typeof registryItemSchema>, "type">,
  override?: string
) {
  if (override) {
    return override
  }

  if (item.type === "registry:ui") {
    return config.resolvedPaths.ui ?? config.resolvedPaths.components
  }

  const [parent, type] = item.type?.split(":") ?? []
  if (!(parent in config.resolvedPaths)) {
    return null
  }

  return path.join(
    config.resolvedPaths[parent as keyof typeof config.resolvedPaths],
    type
  )
}

export async function getRegistries(options?: { useCache?: boolean }) {
  options = {
    useCache: true,
    ...options,
  }

  const url = `${REGISTRY_URL}/registries.json`
  const [data] = await fetchRegistry([url], {
    useCache: options.useCache,
  })

  return registriesSchema.parse(data)
}

export async function getRegistriesIndex(options?: { useCache?: boolean }) {
  const registries = await getRegistries(options)
  if (!registries) return null
  return Object.fromEntries(registries.map((r) => [r.name, r.url])) as z.infer<
    typeof registriesIndexSchema
  >
}
