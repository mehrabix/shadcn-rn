import path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, error as logError } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const searchOptionsSchema = z.object({
  query: z.string(),
  registries: z.array(z.string()).optional(),
  json: z.boolean(),
  limit: z.number().optional(),
})

export const search = new Command()
  .name("search")
  .description("search for components")
  .argument("<query>", "search query")
  .option("--registries <names...>", "registries to search")
  .option("--json", "output as JSON.", false)
  .option("--limit <n>", "max results", parseInt)
  .action(async (query, opts) => {
    try {
      const options = searchOptionsSchema.parse({
        query,
        ...opts,
      })

      const config = await getConfig(process.cwd())

      const { searchRegistries } = await import("../registry/search")
      const results = await searchRegistries(
        options.registries || ["@shadcn-rn"],
        { query: options.query }
      )

      if (options.json) {
        console.log(JSON.stringify(results, null, 2))
        return
      }

      if (results.length === 0) {
        info("No results found.")
        return
      }

      info(`Found ${results.length} results:`)
      for (const result of results) {
        log(`  ${highlighter.info(result.name)} - ${result.description || "No description"}`)
      }
    } catch (err) {
      logError(`Search failed: ${err}`)
      process.exit(1)
    }
  })
