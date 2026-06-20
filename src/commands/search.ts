import path from "path"
import { configWithDefaults } from "../registry/config"
import { clearRegistryContext } from "../registry/context"
import {
  findUnknownSearchTypes,
  printSearchResults,
  resolveSearchRegistries,
  SEARCHABLE_TYPES,
  searchRegistries,
} from "../registry/search"
import { rawConfigSchema } from "../registry/schema"
import { getConfig, createConfig } from "../utils/get-config"
import { log, error as logError } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import fsExtra from "fs-extra"
import { z } from "zod"

const searchOptionsSchema = z.object({
  cwd: z.string(),
  query: z.string().optional(),
  types: z.array(z.string()).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export const search = new Command()
  .name("search")
  .alias("list")
  .description("search items from registries")
  .argument(
    "[registries...]",
    "the registry addresses to search. Supports namespaces. When omitted, searches all registries configured in components.json."
  )
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-q, --query <query>", "query string")
  .option(
    "-t, --type <type>",
    "filter by item type, e.g. ui, block, hook. Comma-separated for multiple."
  )
  .option("-l, --limit <number>", "maximum number of items to display", "100")
  .option("-o, --offset <number>", "number of items to skip", "0")
  .option("--json", "output as JSON.", false)
  .action(async (registries: string[], opts) => {
    try {
      const options = searchOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        query: opts.query,
        types: opts.type
          ? opts.type
              .split(",")
              .map((type: string) => type.trim())
              .filter(Boolean)
          : undefined,
        limit: opts.limit ? parseInt(opts.limit, 10) : undefined,
        offset: opts.offset ? parseInt(opts.offset, 10) : undefined,
      })

      if (options.types?.length) {
        const unknownTypes = findUnknownSearchTypes(options.types)
        if (unknownTypes.length > 0) {
          logError(
            `Unknown ${unknownTypes.length === 1 ? "type" : "types"}: ${unknownTypes
              .map((type) => highlighter.info(type))
              .join(", ")}.`
          )
          logError(`Valid types: ${SEARCHABLE_TYPES.join(", ")}.`)
          process.exit(1)
        }
      }

      const defaultConfig = createConfig({
        style: "default",
        resolvedPaths: {
          cwd: options.cwd,
        },
      })
      let shadowConfig = configWithDefaults(defaultConfig)

      const componentsJsonPath = path.resolve(options.cwd, "components.json")
      const hasComponentsJson = fsExtra.existsSync(componentsJsonPath)
      if (hasComponentsJson) {
        const existingConfig = await fsExtra.readJson(componentsJsonPath)
        const partialConfig = rawConfigSchema.partial().parse(existingConfig)
        shadowConfig = configWithDefaults({
          ...defaultConfig,
          ...partialConfig,
        })
      }

      let config = shadowConfig
      try {
        const fullConfig = await getConfig(options.cwd)
        if (fullConfig) {
          config = configWithDefaults(fullConfig)
        }
      } catch {
        // Use shadow config if getConfig fails
      }

      const searchAllConfigured = registries.length === 0
      if (searchAllConfigured && !hasComponentsJson) {
        logError(
          `Provide a registry or namespace to search, e.g. ${highlighter.info(
            "shadcn-rn search @shadcn-rn"
          )}.`
        )
        process.exit(1)
      }

      const registriesToSearch = resolveSearchRegistries(registries, config)

      if (searchAllConfigured && registriesToSearch.length === 0) {
        logError(
          `No registries are configured in ${highlighter.info(
            "components.json"
          )}.`
        )
        process.exit(1)
      }

      const results = await searchRegistries(registriesToSearch, {
        query: options.query,
        types: options.types,
        limit: options.limit,
        offset: options.offset,
        config,
        continueOnError: searchAllConfigured,
      })

      const allRegistriesFailed =
        searchAllConfigured &&
        results.errors?.length === registriesToSearch.length

      if (opts.json) {
        console.log(JSON.stringify(results, null, 2))
      } else {
        printSearchResults(results, {
          query: options.query,
          types: options.types,
          registries: registriesToSearch,
        })
      }

      process.exit(allRegistriesFailed ? 1 : 0)
    } catch (err) {
      logError(`Search failed: ${err}`)
      process.exit(1)
    } finally {
      clearRegistryContext()
    }
  })
