import { log, info, error as logError } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const docsOptionsSchema = z.object({
  component: z.string().optional(),
})

export const docs = new Command()
  .name("docs")
  .description("open documentation")
  .argument("[component]", "component to view docs for")
  .action(async (component) => {
    try {
      const options = docsOptionsSchema.parse({
        component,
      })

      const baseUrl = "https://www.nativewind.dev"

      let url = baseUrl
      if (options.component) {
        url = `${baseUrl}/docs/components/${options.component}`
      }

      info(`Opening ${highlighter.info(url)}`)

      const open = (await import("open")).default
      await open(url)
    } catch (err) {
      logError(`Failed to open docs: ${err}`)
      process.exit(1)
    }
  })
