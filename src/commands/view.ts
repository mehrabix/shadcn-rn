import * as fs from "fs/promises"
import * as path from "path"
import { log, info, error } from "../utils/logger"

export interface ViewOptions {
  name: string
  registry?: string
}

export async function view(options: ViewOptions): Promise<void> {
  const { name, registry = "@shadcn-rn" } = options

  log(`Viewing component: ${name}`)

  try {
    const { fetchRegistry } = await import("../registry/fetcher")
    const { buildUrlAndHeadersForRegistryItem } = await import("../registry/builder")
    const { configWithDefaults } = await import("../registry/config")

    const config = configWithDefaults({})
    const urlInfo = buildUrlAndHeadersForRegistryItem(
      `${registry}/${name}`,
      config.registries
    )

    if (!urlInfo) {
      error("Could not resolve registry URL")
      return
    }

    const items = await fetchRegistry([urlInfo.url], {
      headers: urlInfo.headers,
    })

    if (items.length === 0) {
      error("Component not found")
      return
    }

    const item = items[0]
    log(`Name: ${item.name}`)
    log(`Type: ${item.type}`)
    if (item.description) {
      log(`Description: ${item.description}`)
    }
    if (item.files) {
      log(`Files: ${item.files.map((f) => f.path).join(", ")}`)
    }
    if (item.dependencies) {
      log(`Dependencies: ${item.dependencies.join(", ")}`)
    }
  } catch {
    error("Failed to fetch component")
  }
}
