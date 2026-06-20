import * as fs from "fs/promises"
import * as path from "path"
import { preflightBuild } from "../preflights"
import { readRegistryWithIncludes } from "../registry/loader"
import { log, success, error as logError } from "../utils/logger"
import { spinner } from "../utils/spinner"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const buildOptionsSchema = z.object({
  cwd: z.string(),
  registryFile: z.string(),
  outputDir: z.string(),
})

export const build = new Command()
  .name("build")
  .description("build components for a shadcn registry")
  .argument("[registry]", "path to registry.json file", "./registry.json")
  .option(
    "-o, --output <path>",
    "destination directory for json files",
    "./public/r"
  )
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .action(async (registryFile: string, opts) => {
    try {
      const options = buildOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        registryFile,
        outputDir: opts.output,
      })

      const preflight = await preflightBuild(options.cwd)
      if (!preflight.passed) {
        process.exit(1)
      }

      const registryPath = path.resolve(options.cwd, options.registryFile)
      const outputDir = path.resolve(options.cwd, options.outputDir)

      await fs.mkdir(outputDir, { recursive: true })

      const buildSpinner = spinner("Building registry...").start()

      const registryResult = await readRegistryWithIncludes(registryPath)

      const registryCatalog = {
        ...registryResult,
        items: registryResult.items.map((item) => ({
          ...item,
          files: item.files?.map(({ content, ...file }) => file),
        })),
      }

      for (const item of registryResult.items) {
        buildSpinner.start(`Building ${item.name}...`)

        const itemForBuild = {
          ...item,
          $schema: "https://shadcn-rn.dev/schema/registry-item.json",
        }

        await fs.writeFile(
          path.resolve(outputDir, `${item.name}.json`),
          JSON.stringify(itemForBuild, null, 2)
        )
      }

      await fs.writeFile(
        path.resolve(outputDir, "registry.json"),
        JSON.stringify(registryCatalog, null, 2)
      )

      buildSpinner.succeed("Building registry.")
      success(
        `Registry built to ${highlighter.info(options.outputDir)} (${
          registryResult.items.length
        } items)`
      )
    } catch (err) {
      logError(`Failed to build registry: ${err}`)
      process.exit(1)
    }
  })
