import { REGISTRY_URL } from "./constants"
import type { RegistryItem } from "./schema"
import { searchResultsSchema, type SearchResultItem } from "./schema"

export interface SearchOptions {
  query: string
  registries?: string[]
  limit?: number
  offset?: number
}

export interface SearchResults {
  pagination: {
    total: number
    offset: number
    limit: number
    hasMore: boolean
  }
  items: SearchResultItem[]
}

export async function searchRegistries(
  options: SearchOptions
): Promise<SearchResults> {
  const { query, registries = ["@shadcn-rn"], limit = 10, offset = 0 } = options

  const allItems: SearchResultItem[] = []

  for (const registry of registries) {
    try {
      const url = `${REGISTRY_URL}/index.json`
      const response = await fetch(url)
      if (!response.ok) continue

      const items = (await response.json()) as RegistryItem[]

      for (const item of items) {
        if (
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
        ) {
          allItems.push({
            name: item.name,
            type: item.type,
            description: item.description,
            registry,
            addCommandArgument: `${registry}/${item.name}`,
          })
        }
      }
    } catch {
      // Skip registries that fail to load
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
  }
}
