import { registryItemSchema } from "./schema"
import type { RegistryItem } from "./schema"
import {
  BUILTIN_REGISTRIES,
} from "./constants"
import {
  clearRegistryContext,
} from "./context"
import {
  RegistryNotFoundError,
  RegistryParseError,
} from "./errors"
import { fetchRegistry } from "./fetcher"
import {
  fetchRegistryItems,
  resolveRegistryTree,
} from "./resolver"
import {
  registryConfigSchema,
  registrySchema,
} from "../schema"
import { type Config } from "../utils/get-config"

export async function getRegistry(
  name: string,
  options?: {
    config?: Partial<Config>
    useCache?: boolean
  }
) {
  const { config, useCache } = options || {}

  if (!name.startsWith("@")) {
    throw new RegistryNotFoundError(name, {
      suggestion: "Registry names must start with @",
    })
  }

  let registryName = name
  if (!registryName.endsWith("/registry")) {
    registryName = `${registryName}/registry`
  }

  const [result] = await fetchRegistry([`${registryName}/index.json`], { useCache })

  return parseRegistryCatalog(registryName, result)
}

function parseRegistryCatalog(name: string, result: unknown) {
  try {
    const registry = registrySchema.parse(result)
    return registry
  } catch (error) {
    throw new RegistryParseError(name, error, {
      subject: "registry catalog",
      suggestion:
        "The registry catalog may be corrupted or have an invalid format.",
    })
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

  return fetchRegistryItems(items, config as Config, { useCache })
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
  return resolveRegistryTree(items, config as Config, { useCache })
}

export async function getRegistriesConfig(
  _cwd: string,
  _options?: { useCache?: boolean }
) {
  return {
    registries: BUILTIN_REGISTRIES,
  }
}

let registryIcons: Record<string, Record<string, string>> | null = null

export async function getRegistryIcons(): Promise<
  Record<string, Record<string, string>>
> {
  if (registryIcons) {
    return registryIcons
  }

  registryIcons = {}
  return registryIcons
}
