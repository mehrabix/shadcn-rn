import path from "path"
import { preflightAdd } from "../preflights"
import { getConfig, createConfig } from "../utils/get-config"
import { addComponents } from "../utils/add-components"
import { getProjectInfo } from "../utils/get-project-info"
import { log, info, success, error as logError, warn } from "../utils/logger"
import { spinner } from "../utils/spinner"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const addOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  overwrite: z.boolean(),
  cwd: z.string(),
  all: z.boolean(),
  silent: z.boolean(),
  dryRun: z.boolean(),
})

export const add = new Command()
  .name("add")
  .description("add a component to your project")
  .argument("[components...]", "component names to add")
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option("-o, --overwrite", "overwrite existing files.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-a, --all", "add all available components", false)
  .option("-s, --silent", "mute output.", false)
  .option("--dry-run", "preview changes without writing files.", false)
  .action(async (components, opts) => {
    try {
      const options = addOptionsSchema.parse({
        components,
        ...opts,
        cwd: path.resolve(opts.cwd),
      })

      const isDryRun = options.dryRun

      let config = await getConfig(options.cwd).catch(() => null)

      if (!config) {
        const { passed, errors } = await preflightAdd(options.cwd)

        if (errors["MISSING_DIR_OR_EMPTY_PROJECT"]) {
          logError(
            `No package.json found at ${highlighter.info(options.cwd)}.\n` +
              `Are you in the right directory?`
          )
          process.exit(1)
        }

        if (errors["MISSING_CONFIG"]) {
          const prompts = (await import("prompts")).default
          const { proceed } = await prompts({
            type: "confirm",
            name: "proceed",
            message: `You need to create a ${highlighter.info(
              "components.json"
            )} file to add components. Proceed with init?`,
            initial: true,
          })

          if (!proceed) {
            process.exit(1)
          }

          const { init } = await import("./init")
          await init({ cwd: options.cwd, force: true })
          config = await getConfig(options.cwd)
        }
      }

      if (!config) {
        logError(
          `Failed to read config at ${highlighter.info(options.cwd)}.`
        )
        process.exit(1)
      }

      if (!options.components?.length) {
        const prompts = (await import("prompts")).default
        const { components: selected } = await prompts({
          type: "text",
          name: "components",
          message: "Which components would you like to add?",
          hint: "Separate multiple with spaces.",
        })

        if (!selected) {
          warn("No components selected. Exiting.")
          process.exit(1)
        }

        options.components = selected.split(" ").filter(Boolean)
      }

      if (options.components!.length === 0) {
        warn("No components specified.")
        process.exit(1)
      }

      if (isDryRun) {
        const dryRunSpinner = spinner("Resolving items...", {
          silent: options.silent,
        }).start()

        const { resolveRegistryTree } = await import("../registry/resolver")
        const tree = await resolveRegistryTree(options.components!, { config })

        dryRunSpinner.stop()

        info("\nFiles that would be added:")
        for (const file of tree.files || []) {
          log(`  ${highlighter.info(file.path)}`)
        }

        if (tree.dependencies && tree.dependencies.length > 0) {
          info("\nDependencies that would be installed:")
          for (const dep of tree.dependencies) {
            log(`  ${dep}`)
          }
        }

        if (tree.devDependencies && tree.devDependencies.length > 0) {
          info("\nDev dependencies that would be installed:")
          for (const dep of tree.devDependencies) {
            log(`  ${dep}`)
          }
        }

        return
      }

      if (!options.yes) {
        const prompts = (await import("prompts")).default
        const { confirm } = await prompts({
          type: "confirm",
          name: "confirm",
          message: `Ready to add ${highlighter.info(
            options.components!.join(", ")
          )}. Continue?`,
          initial: true,
        })

        if (!confirm) {
          warn("Installation cancelled.")
          process.exit(1)
        }
      }

      const addSpinner = spinner("Adding components...", {
        silent: options.silent,
      }).start()

      await addComponents({
        config,
        components: options.components!,
        overwrite: options.overwrite,
        silent: options.silent,
      })

      addSpinner.stop()
      success(
        `Added ${options.components!.length} component(s): ${options.components!.join(
          ", "
        )}`
      )
    } catch (err) {
      logError(`Failed to add components: ${err}`)
      process.exit(1)
    }
  })
