import path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, success, error as logError, warn } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const applyOptionsSchema = z.object({
  cwd: z.string(),
  preset: z.string().optional(),
  only: z.array(z.string()).optional(),
  force: z.boolean(),
  yes: z.boolean(),
})

export const apply = new Command()
  .name("apply")
  .description("apply a preset to your project")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--preset <name>", "the preset to apply")
  .option("--only <types...>", "only apply specific types")
  .option("--force", "force apply.", false)
  .option("-y, --yes", "skip confirmation prompt.", false)
  .action(async (opts) => {
    try {
      const options = applyOptionsSchema.parse({
        ...opts,
        cwd: path.resolve(opts.cwd),
      })

      const config = await getConfig(options.cwd)

      let presetName = options.preset
      if (!presetName) {
        const prompts = (await import("prompts")).default
        const { selected } = await prompts({
          type: "select",
          name: "selected",
          message: "Which preset would you like to apply?",
          choices: [
            { title: "default", value: "default" },
            { title: "new-york", value: "new-york" },
            { title: "nova", value: "nova" },
            { title: "vega", value: "vega" },
          ],
        })
        presetName = selected
      }

      if (!presetName) {
        warn("No preset selected. Exiting.")
        process.exit(1)
      }

      info(`Applying preset: ${highlighter.info(presetName)}`)

      const { getPresetByName } = await import("../preset/defaults")
      const presetConfig = getPresetByName(presetName)

      if (!presetConfig) {
        logError(`Preset "${presetName}" not found`)
        process.exit(1)
      }

      info(`Description: ${presetConfig.description}`)

      const { resolvePreset } = await import("../preset/resolve")
      const resolved = await resolvePreset(presetConfig.url)

      if (resolved?.components && resolved.components.length > 0) {
        const componentsToInstall = options.only && options.only.length > 0
          ? resolved.components.filter((c) => options.only!.includes(c))
          : resolved.components

        if (componentsToInstall.length > 0) {
          info(`Installing ${componentsToInstall.length} components...`)
          const { addComponents } = await import("../utils/add-components")
          await addComponents({
            config,
            components: componentsToInstall,
            overwrite: options.force,
            yes: options.yes,
            silent: true,
          })
        }
      }

      success(`Preset "${presetName}" applied!`)
    } catch (err) {
      logError(`Failed to apply preset: ${err}`)
      process.exit(1)
    }
  })
