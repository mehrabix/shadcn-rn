import path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, success, error as logError } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const infoOptionsSchema = z.object({
  cwd: z.string(),
  json: z.boolean(),
})

export const infoCommand = new Command()
  .name("info")
  .description("display information about the project")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--json", "output as JSON.", false)
  .action(async (opts) => {
    try {
      const options = infoOptionsSchema.parse({
        ...opts,
        cwd: path.resolve(opts.cwd),
      })

      const config = await getConfig(options.cwd)

      if (options.json) {
        console.log(JSON.stringify(config, null, 2))
        return
      }

      info("Project Information:")
      log(`  Style: ${highlighter.info(config.style)}`)
      log(`  TSX: ${highlighter.info(String(config.tsx))}`)
      log(`  Components Path: ${highlighter.info(config.aliases.components)}`)
      log(`  Utils Path: ${highlighter.info(config.aliases.utils)}`)
      log(`  UI Path: ${highlighter.info(config.aliases.ui)}`)
      log(`  Hooks Path: ${highlighter.info(config.aliases.hooks)}`)
      log(`  NativeWind CSS: ${highlighter.info(config.resolvedPaths.nativewindCss)}`)

      if (config.nativewind) {
        log(`  Base Color: ${highlighter.info(config.nativewind.baseColor || "default")}`)
        log(`  CSS Variables: ${highlighter.info(String(config.nativewind.cssVariables))}`)
      }
    } catch (err) {
      logError(`Failed to get project info: ${err}`)
      process.exit(1)
    }
  })
