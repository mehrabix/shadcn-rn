import path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, success, error as logError } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const presetOptionsSchema = z.object({
  cwd: z.string(),
  name: z.string().optional(),
  decode: z.string().optional(),
  list: z.boolean(),
})

export const preset = new Command()
  .name("preset")
  .description("manage presets")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--name <name>", "preset name to apply")
  .option("--decode <code>", "decode a preset code")
  .option("--list", "list all available presets", false)
  .action(async (opts) => {
    try {
      const options = presetOptionsSchema.parse({
        ...opts,
        cwd: path.resolve(opts.cwd),
      })

      if (options.decode) {
        const { decodePresetUrl } = await import("../preset/preset")
        try {
          const state = decodePresetUrl(options.decode)
          if (state) {
            info(`Decoded preset:`)
            log(`  Style: ${highlighter.info(state.style || "default")}`)
            log(`  Base Color: ${highlighter.info(state.baseColor || "neutral")}`)
            log(`  Font: ${highlighter.info(state.font || "default")}`)
            log(`  Radius: ${highlighter.info(String(state.radius || 0.5))}`)
          } else {
            logError("Could not decode preset code")
          }
        } catch (err) {
          logError(`Decode failed: ${err}`)
        }
        return
      }

      if (options.list || !options.name) {
        const { presets } = await import("../preset/defaults")
        info("Available presets:")
        for (const p of presets) {
          log(`  ${highlighter.info(p.name)} - ${p.description}`)
        }
        return
      }

      const { getPresetByName } = await import("../preset/defaults")
      const presetConfig = getPresetByName(options.name)

      if (presetConfig) {
        info(`Preset: ${highlighter.info(presetConfig.name)}`)
        log(`  Description: ${presetConfig.description}`)
        log(`  URL: ${presetConfig.url}`)
      } else {
        logError(`Preset "${options.name}" not found`)
      }
    } catch (err) {
      logError(`Failed: ${err}`)
      process.exit(1)
    }
  })
