import { REGISTRY_URL } from "./constants"
import type { RegistryItem } from "./schema"
import { searchResultsSchema, type SearchResultItem } from "./schema"
import { highlighter } from "../utils/highlighter"
import { logger } from "../utils/logger"

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

export function formatSearchResultType(type?: string) {
  if (!type) {
    return ""
  }
  return type.startsWith("registry:") ? type.slice("registry:".length) : type
}

export function findUnknownSearchTypes(types: string[]): string[] {
  const valid = new Set(SEARCHABLE_TYPES.map((type) => type.toLowerCase()))
  return types.filter(
    (type) => !valid.has(formatSearchResultType(type).toLowerCase())
  )
}

export function resolveSearchRegistries(
  registries: string[],
  config: { registries?: Record<string, string | { url: string; params?: Record<string, string>; headers?: Record<string, string> }> }
): string[] {
  if (registries.length > 0) {
    return registries
  }
  return Object.keys(config.registries ?? {})
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

function formatSearchResultDescription(
  description: string,
  maxLength = 80
) {
  const normalized = description.trim().replace(/\s+/g, " ")
  if (normalized.length <= maxLength) {
    return normalized
  }
  const truncated = normalized.slice(0, maxLength - 3).trimEnd()
  const lastSpace = truncated.lastIndexOf(" ")
  const base =
    lastSpace > maxLength * 0.6 ? truncated.slice(0, lastSpace) : truncated
  return `${base.trimEnd()}...`
}

function formatSearchScope(options: {
  query?: string
  types?: string[]
  registries: string[]
}) {
  const { query, types, registries } = options
  let scope = ""
  if (types?.length) {
    scope += ` of type ${types.map((type) => formatSearchResultType(type)).join(", ")}`
  }
  if (query) {
    scope += ` matching ${highlighter.info(`"${query}"`)}`
  }
  if (registries.length > 0) {
    scope += ` in ${registries.join(", ")}`
  }
  return scope
}

function formatSearchResultItem(
  item: SearchResultItem,
  options: { showRegistry: boolean }
) {
  const name = item.addCommandArgument ?? item.name
  const type = formatSearchResultType(item.type)
  const typeSuffix = type ? ` (${type})` : ""
  const registrySuffix =
    options.showRegistry && item.registry ? ` · ${item.registry}` : ""
  const descriptionSuffix = item.description
    ? ` — ${formatSearchResultDescription(item.description)}`
    : ""
  return `- ${highlighter.info(name)}${typeSuffix}${registrySuffix}${descriptionSuffix}`
}

export function printSearchResults(
  results: SearchResults,
  options: {
    query?: string
    types?: string[]
    registries: string[]
  }
) {
  const { pagination, items, errors } = results
  const showRegistry = options.registries.length > 1

  if (errors?.length) {
    for (const { registry, message } of errors) {
      logger.warn(`Skipped ${registry}: ${message}`)
    }
  }

  if (items.length === 0) {
    logger.warn(`No items found${formatSearchScope(options)}.`)
    return
  }

  const itemCount = `${pagination.total} item${pagination.total === 1 ? "" : "s"}`
  logger.info(`Found ${itemCount}${formatSearchScope(options)}`)

  const start = pagination.offset + 1
  const end = Math.min(pagination.offset + pagination.limit, pagination.total)
  logger.log(`Showing ${start}-${end} of ${pagination.total}`)

  logger.log(
    items.map((item) => formatSearchResultItem(item, { showRegistry })).join("\n")
  )

  if (pagination.hasMore) {
    logger.log(
      `More items available. Use ${highlighter.info(
        `--offset ${pagination.offset + pagination.limit}`
      )} to see the next page.`
    )
  }
}
