import { log, info } from "../utils/logger"

export interface SearchOptions {
  query: string
  registries?: string[]
}

export async function search(options: SearchOptions): Promise<void> {
  const { query, registries = ["@shadcn-rn"] } = options

  log(`Searching for "${query}"...`)

  try {
    const { searchRegistries } = await import("../registry/search")
    const results = await searchRegistries({
      query,
      registries,
    })

    if (results.items.length === 0) {
      info("No results found")
      return
    }

    log(`Found ${results.items.length} results:`)
    for (const item of results.items) {
      info(`  ${item.name} - ${item.description || "No description"}`)
    }
  } catch {
    info("Search failed")
  }
}
