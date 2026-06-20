import path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, success, error as logError, warn } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const migrateOptionsSchema = z.object({
  cwd: z.string(),
  type: z.string().optional(),
  list: z.boolean(),
  yes: z.boolean(),
})

export const migrate = new Command()
  .name("migrate")
  .description("run migrations")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--type <name>", "migration type to run")
  .option("--list", "list available migrations", false)
  .option("-y, --yes", "skip confirmation prompt.", false)
  .action(async (opts) => {
    try {
      const options = migrateOptionsSchema.parse({
        ...opts,
        cwd: path.resolve(opts.cwd),
      })

      await getConfig(options.cwd)

      if (options.list) {
        const { migrations } = await import("../migrations")
        info("Available migrations:")
        for (const m of migrations) {
          log(`  ${highlighter.info(m.name)} - ${m.description}`)
        }
        return
      }

      if (options.type) {
        const { runMigration } = await import("../migrations")
        const ran = await runMigration(options.type, options.cwd)
        if (!ran) {
          logError(
            `Migration "${options.type}" not found. Run ${highlighter.success(
              "shadcn-rn migrate --list"
            )} to see available migrations.`
          )
          process.exit(1)
        }
      } else {
        if (!options.yes) {
          const prompts = (await import("prompts")).default
          const { confirm } = await prompts({
            type: "confirm",
            name: "confirm",
            message: `Run all migrations? This may modify your project files.`,
            initial: true,
          })

          if (!confirm) {
            warn("Migrations cancelled.")
            process.exit(1)
          }
        }

        const { runAllMigrations } = await import("../migrations")
        await runAllMigrations(options.cwd)
      }

      success("Migrations completed!")
    } catch (err) {
      logError(`Migration failed: ${err}`)
      process.exit(1)
    }
  })
