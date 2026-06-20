import path from "path"
import { log, info, success, error as logError } from "../../utils/logger"
import { highlighter } from "../../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

const validateOptionsSchema = z.object({
  cwd: z.string(),
  registry: z.string().optional(),
})

export const validate = new Command()
  .name("validate")
  .description("validate a registry")
  .argument("[registry]", "path to registry JSON file")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .action(async (registryArg: string | undefined, opts) => {
    try {
      const options = validateOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        registry: registryArg,
      })

      const { validateRegistry } = await import("../../registry/validate")
      const fs = await import("fs/promises")

      const registryPath = options.registry
        ? path.resolve(options.cwd, options.registry)
        : path.resolve(options.cwd, "registry.json")

      log(`Validating registry: ${highlighter.info(registryPath)}`)

      const content = await fs.readFile(registryPath, "utf-8")
      const data = JSON.parse(content)

      const result = validateRegistry(data)

      if (result.valid) {
        success("Registry validation passed!")
      } else {
        logError("Registry validation failed:")
        for (const err of result.errors) {
          info(`  - ${err}`)
        }
      }

      if (result.warnings.length > 0) {
        info("Warnings:")
        for (const warn of result.warnings) {
          info(`  - ${warn}`)
        }
      }
    } catch (err) {
      logError(`Registry validation failed: ${err}`)
      process.exit(1)
    }
  })
