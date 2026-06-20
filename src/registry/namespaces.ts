import { parseRegistryAndItemFromString } from "./parser"
import { buildUrlAndHeadersForRegistryItem } from "./builder"
import { fetchRegistry } from "./fetcher"
import type { RegistryItem, Config } from "./schema"
import { configWithDefaults } from "./config"

export interface NamespaceResolution {
  registry: string
  items: RegistryItem[]
}

export async function resolveRegistryNamespaces(
  names: string[],
  config: Config
): Promise<NamespaceResolution[]> {
  const resolvedConfig = configWithDefaults(config)
  const namespaceMap = new Map<string, string[]>()

  for (const name of names) {
    const parsed = parseRegistryAndItemFromString(name)
    if (parsed) {
      const existing = namespaceMap.get(parsed.registry) || []
      existing.push(parsed.item)
      namespaceMap.set(parsed.registry, existing)
    }
  }

  const resolutions: NamespaceResolution[] = []

  for (const [namespace, items] of namespaceMap) {
    const registries = resolvedConfig.registries
    if (!registries) {
      continue
    }
    const registryConfig = registries[namespace]
    if (!registryConfig) {
      continue
    }

    const fetchedItems: RegistryItem[] = []

    for (const itemName of items) {
      const fullName = `${namespace}/${itemName}`
      const urlInfo = buildUrlAndHeadersForRegistryItem(
        fullName,
        registries
      )

      if (urlInfo) {
        try {
          const fetched = await fetchRegistry([urlInfo.url], {
            headers: urlInfo.headers,
          })
          fetchedItems.push(...fetched)
        } catch {
          // Skip items that fail to fetch
        }
      }
    }

    resolutions.push({
      registry: namespace,
      items: fetchedItems,
    })
  }

  return resolutions
}
