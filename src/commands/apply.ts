import path from "path"
import { preflightApply } from "../preflights"
import { getConfig, createConfigFile } from "../utils/get-config"
import { addComponents } from "../utils/add-components"
import { getProjectInfo, getProjectComponents } from "../utils/get-project-info"
import { log, info, success, error as logError, warn } from "../utils/logger"
import { spinner } from "../utils/spinner"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"
import * as ERRORS from "../utils/errors"

export const applyOptionsSchema = z.object({
  cwd: z.string(),
  preset: z.string().optional(),
  only: z.union([z.boolean(), z.string()]).optional(),
  yes: z.boolean(),
  silent: z.boolean(),
})

export const apply = new Command()
  .name("apply")
  .description("apply a preset to your project")
  .argument("[preset]", "the preset to apply")
  .option("--preset <preset>", "the preset to apply")
  .option("--only [parts]", "apply only parts of a preset: theme, font")
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-s, --silent", "mute output.", false)
  .action(async (positionalPreset, opts) => {
    try {
      const options = applyOptionsSchema.parse({
        ...opts,
        cwd: path.resolve(opts.cwd),
        preset: opts.preset ?? positionalPreset,
      })

      const preset = options.preset?.trim()

      const preflight = await preflightApply(options.cwd)

      if (preflight.errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
        logError(
          `The ${highlighter.info(
            "apply"
          )} command only works in an existing project.`
        )
        logError(
          `Run ${highlighter.info("shadcn-rn init")} first.`
        )
        process.exit(1)
      }

      if (preflight.errors[ERRORS.MISSING_CONFIG]) {
        logError(
          `No ${highlighter.info("components.json")} found at ${highlighter.info(
            options.cwd
          )}.`
        )
        logError(
          `Run ${highlighter.info("shadcn-rn init")} first.`
        )
        process.exit(1)
      }

      const existingConfig = preflight.config
      if (!existingConfig) {
        process.exit(1)
      }

      if (!preset) {
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

        if (!selected) {
          warn("No preset selected. Exiting.")
          process.exit(1)
        }

        await applyPreset(options.cwd, selected, existingConfig, options)
      } else {
        await applyPreset(options.cwd, preset, existingConfig, options)
      }

      success("Preset applied successfully.")
    } catch (err) {
      logError(`Failed to apply preset: ${err}`)
      process.exit(1)
    }
  })

async function applyPreset(
  cwd: string,
  presetName: string,
  existingConfig: ReturnType<typeof getConfig> extends Promise<infer T> ? T : never,
  options: { silent?: boolean; yes?: boolean }
) {
  const applySpinner = spinner("Applying preset...", {
    silent: options.silent,
  }).start()

  try {
    const components = await getProjectComponents(cwd)

    if (components.length > 0 && !options.yes) {
      applySpinner.stop()
      const prompts = (await import("prompts")).default
      const { proceed } = await prompts({
        type: "confirm",
        name: "proceed",
        message: `This will re-install ${highlighter.info(
          String(components.length)
        )} components with the new preset. Continue?`,
        initial: false,
      })

      if (!proceed) {
        warn("Installation cancelled.")
        process.exit(1)
      }
      applySpinner.start()
    }

    const { DEFAULT_PRESETS } = await import("../preset/defaults")
    const presetConfig = DEFAULT_PRESETS[presetName]

    if (presetConfig) {
      info(`Applying preset: ${highlighter.info(presetConfig.title || presetName)}`)
    } else {
      info(`Applying preset: ${highlighter.info(presetName)}`)
    }

    if (components.length > 0) {
      applySpinner.start("Re-installing components...")
      await addComponents(components, existingConfig, {
        overwrite: true,
        silent: true,
      })
    }

    applySpinner.succeed("Preset applied!")
  } catch (err) {
    applySpinner.fail(`Failed to apply preset: ${err}`)
    throw err
  }
}
