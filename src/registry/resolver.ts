import type { RegistryItem, ResolvedItemsTree } from "./schema"
import { fetchRegistry } from "./fetcher"
import { buildUrlAndHeadersForRegistryItem } from "./builder"
import { configWithDefaults } from "./config"
import type { Config } from "./schema"

export interface ResolveRegistryTreeOptions {
  config: Config
}

export async function resolveRegistryTree(
  names: string[],
  options: ResolveRegistryTreeOptions
): Promise<ResolvedItemsTree> {
  const { config } = options
  const resolvedConfig = configWithDefaults(config)
  const registries = resolvedConfig.registries
  if (!registries) {
    return {
      dependencies: [],
      devDependencies: [],
      files: [],
      tailwind: {},
      cssVars: {},
      css: {},
      envVars: {},
    }
  }

  const visited = new Set<string>()
  const allItems: RegistryItem[] = []

  async function resolveItem(name: string): Promise<void> {
    if (visited.has(name)) {
      return
    }
    visited.add(name)

    const urlInfo = buildUrlAndHeadersForRegistryItem(name, registries!)
    if (!urlInfo) {
      return
    }

    const items = await fetchRegistry([urlInfo.url], {
      headers: urlInfo.headers,
    })

    for (const item of items) {
      allItems.push(item)

      if (item.registryDependencies) {
        for (const dep of item.registryDependencies) {
          await resolveItem(dep)
        }
      }
    }
  }

  for (const name of names) {
    await resolveItem(name)
  }

  const sortedItems = topologicalSortRegistryItems(allItems)

  const merged: ResolvedItemsTree = {
    dependencies: [],
    devDependencies: [],
    files: [],
    tailwind: {},
    cssVars: {},
    css: {},
    envVars: {},
  }

  for (const item of sortedItems) {
    if (item.dependencies) {
      merged.dependencies = [...new Set([...merged.dependencies!, ...item.dependencies])]
    }
    if (item.devDependencies) {
      merged.devDependencies = [...new Set([...merged.devDependencies!, ...item.devDependencies])]
    }
    if (item.files) {
      for (const file of item.files) {
        const existingIndex = merged.files!.findIndex(
          (f) => f.target === file.target || f.path === file.path
        )
        if (existingIndex >= 0) {
          merged.files![existingIndex] = file
        } else {
          merged.files!.push(file)
        }
      }
    }
    if (item.tailwind) {
      merged.tailwind = deepMerge(merged.tailwind!, item.tailwind)
    }
    if (item.cssVars) {
      merged.cssVars = deepMergeCssVars(merged.cssVars!, item.cssVars)
    }
    if (item.css) {
      merged.css = deepMerge(merged.css!, item.css)
    }
    if (item.envVars) {
      merged.envVars = { ...merged.envVars, ...item.envVars }
    }
  }

  return merged
}

function topologicalSortRegistryItems(items: RegistryItem[]): RegistryItem[] {
  const itemMap = new Map<string, RegistryItem>()
  const inDegree = new Map<string, number>()
  const adjacency = new Map<string, string[]>()

  for (const item of items) {
    itemMap.set(item.name, item)
    inDegree.set(item.name, 0)
    adjacency.set(item.name, [])
  }

  for (const item of items) {
    if (item.registryDependencies) {
      for (const dep of item.registryDependencies) {
        if (itemMap.has(dep)) {
          adjacency.get(dep)!.push(item.name)
          inDegree.set(item.name, (inDegree.get(item.name) || 0) + 1)
        }
      }
    }
  }

  const queue: string[] = []
  for (const [name, degree] of inDegree) {
    if (degree === 0) {
      queue.push(name)
    }
  }

  const sorted: RegistryItem[] = []

  while (queue.length > 0) {
    const name = queue.shift()!
    const item = itemMap.get(name)
    if (item) {
      sorted.push(item)
    }

    for (const neighbor of adjacency.get(name) || []) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1
      inDegree.set(neighbor, newDegree)
      if (newDegree === 0) {
        queue.push(neighbor)
      }
    }
  }

  for (const item of items) {
    if (!sorted.find((s) => s.name === item.name)) {
      sorted.push(item)
    }
  }

  return sorted
}

function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target }
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      ) as T[Extract<keyof T, string>]
    } else if (source[key] !== undefined) {
      result[key] = source[key] as T[Extract<keyof T, string>]
    }
  }
  return result
}

function deepMergeCssVars(
  target: Record<string, Record<string, string> | undefined>,
  source: Record<string, Record<string, string> | undefined>
): Record<string, Record<string, string> | undefined> {
  const result = { ...target }
  for (const key in source) {
    if (source[key]) {
      result[key] = { ...(result[key] || {}), ...source[key] }
    }
  }
  return result
}

export { topologicalSortRegistryItems }
