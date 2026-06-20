import path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, error as logError } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const viewOptionsSchema = z.object({
  name: z.string(),
  registry: z.string(),
  json: z.boolean(),
})

export const view = new Command()
  .name("view")
  .description("view details of a component")
  .argument("<name>", "component name")
  .option("--registry <name>", "registry to search", "@shadcn-rn")
  .option("--json", "output as JSON.", false)
  .action(async (name, opts) => {
    try {
      const options = viewOptionsSchema.parse({
        name,
        ...opts,
      })

      const config = await getConfig(process.cwd())

      const { getRegistryItems } = await import("../registry/api")
      const items = await getRegistryItems([options.name])

      if (items.length === 0) {
        logError(`Component "${options.name}" not found.`)
        process.exit(1)
      }

      const item = items[0]

      if (options.json) {
        console.log(JSON.stringify(item, null, 2))
        return
      }

      info(`Component: ${highlighter.info(item.name)}`)
      if (item.description) {
        log(`  Description: ${item.description}`)
      }
      if (item.type) {
        log(`  Type: ${item.type}`)
      }
      if (item.dependencies && item.dependencies.length > 0) {
        log(`  Dependencies: ${item.dependencies.join(", ")}`)
      }
      if (item.files && item.files.length > 0) {
        log(`  Files:`)
        for (const file of item.files) {
          log(`    ${file.path}`)
        }
      }
    } catch (err) {
      logError(`Failed to view component: ${err}`)
      process.exit(1)
    }
  })
