import { REGISTRY_URL } from "./constants"
import type { RegistryItem } from "./schema"
import { searchResultsSchema, type SearchResultItem } from "./schema"

export const SEARCHABLE_TYPES = [
  "registry:ui",
  "registry:lib",
  "registry:block",
  "registry:hook",
  "registry:theme",
  "registry:style",
  "registry:layout",
  "registry:headless",
  "registry:party",
  "registry:other",
] as const

export interface SearchOptions {
  query?: string
  registries?: string[]
  types?: string[]
  limit?: number
  offset?: number
  config?: unknown
  useCache?: boolean
  continueOnError?: boolean
}

export interface SearchResults {
  pagination: {
    total: number
    offset: number
    limit: number
    hasMore: boolean
  }
  items: SearchResultItem[]
  errors?: Array<{ registry: string; message: string }>
}

export function resolveSearchRegistries(
  registries: string[],
  config: { registries?: Record<string, string> }
): string[] {
  if (registries.length > 0) {
    return registries
  }
  return Object.keys(config.registries ?? {})
}

export function findUnknownSearchTypes(types: string[]): string[] {
  return types.filter((type) => !SEARCHABLE_TYPES.includes(type as typeof SEARCHABLE_TYPES[number]))
}

export async function searchRegistries(
  registries: string[],
  options: SearchOptions
): Promise<SearchResults> {
  const { query, types, limit = 10, offset = 0, continueOnError = false } = options

  const allItems: SearchResultItem[] = []
  const errors: Array<{ registry: string; message: string }> = []

  for (const registry of registries) {
    try {
      const url = `${REGISTRY_URL}/index.json`
      const response = await fetch(url)
      if (!response.ok) continue

      const items = (await response.json()) as RegistryItem[]

      for (const item of items) {
        if (types?.length && !types.includes(item.type ?? "")) {
          continue
        }

        const matchesQuery = !query ||
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())

        if (matchesQuery) {
          allItems.push({
            name: item.name,
            type: item.type,
            description: item.description,
            registry,
            addCommandArgument: `${registry}/${item.name}`,
          })
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      errors.push({ registry, message })
      if (!continueOnError) {
        throw error
      }
    }
  }

  const paginatedItems = allItems.slice(offset, offset + limit)

  return {
    pagination: {
      total: allItems.length,
      offset,
      limit,
      hasMore: offset + limit < allItems.length,
    },
    items: paginatedItems,
    errors: errors.length > 0 ? errors : undefined,
  }
}
