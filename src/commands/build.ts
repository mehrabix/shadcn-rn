import path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, success, error as logError } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const buildOptionsSchema = z.object({
  cwd: z.string(),
  output: z.string(),
  silent: z.boolean(),
})

export const build = new Command()
  .name("build")
  .description("build registry JSON files")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-o, --output <dir>", "the output directory.", "registry-output")
  .option("-s, --silent", "mute output.", false)
  .action(async (opts) => {
    try {
      const options = buildOptionsSchema.parse({
        ...opts,
        cwd: path.resolve(opts.cwd),
      })

      const config = await getConfig(options.cwd)

      log("Building registry...")

      const { buildRegistry } = await import("../registry/builder")
      await buildRegistry({
        cwd: options.cwd,
        outputDir: options.output,
      })

      success(`Registry built to ${highlighter.info(options.output)}`)
    } catch (err) {
      logError(`Failed to build registry: ${err}`)
      process.exit(1)
    }
  })
