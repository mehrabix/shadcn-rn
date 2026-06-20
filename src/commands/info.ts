import path from "path"
import { getConfig } from "../utils/get-config"
import { getProjectInfo, getProjectComponents } from "../utils/get-project-info"
import { log, info, error as logError } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"

const WEDNEST_URL = "https://wednest.dev"

function printEntries(entries: Record<string, string>) {
  const maxKeyLength = Math.max(
    ...Object.keys(entries).map((key) => key.length)
  )
  for (const [key, value] of Object.entries(entries)) {
    log(`  ${key.padEnd(maxKeyLength + 2)}${value}`)
  }
}

export const infoCommand = new Command()
  .name("info")
  .description("get information about your project")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--json", "output as JSON.", false)
  .action(async (opts) => {
    try {
      const cwd = path.resolve(opts.cwd)
      const projectInfo = await getProjectInfo(cwd).catch(() => null)
      const config = await getConfig(cwd).catch(() => null)
      const components = await getProjectComponents(cwd).catch(() => [])

      if (opts.json) {
        console.log(
          JSON.stringify(
            {
              project: projectInfo
                ? {
                    framework: projectInfo.framework.label,
                    frameworkName: projectInfo.framework.name,
                    hasNativeWind: projectInfo.hasNativeWind,
                    typescript: projectInfo.hasTypeScript,
                    packageManager: projectInfo.packageManager,
                    tailwindVersion: projectInfo.tailwindVersion ?? null,
                    tailwindConfig: projectInfo.tailwindConfigFile ?? null,
                    tailwindCss: projectInfo.tailwindCssFile ?? null,
                    aliasPrefix: projectInfo.aliasPrefix ?? null,
                  }
                : null,
              config: config
                ? {
                    style: config.style,
                    typescript: config.tsx,
                    aliases: {
                      components: config.aliases.components,
                      utils: config.aliases.utils,
                      ui: config.aliases.ui ?? null,
                      lib: config.aliases.lib ?? null,
                      hooks: config.aliases.hooks ?? null,
                    },
                    resolvedPaths: {
                      cwd: config.resolvedPaths.cwd,
                      utils: config.resolvedPaths.utils,
                      components: config.resolvedPaths.components,
                      lib: config.resolvedPaths.lib,
                      hooks: config.resolvedPaths.hooks,
                      ui: config.resolvedPaths.ui,
                      nativewindCss: config.resolvedPaths.nativewindCss,
                    },
                    nativewind: config.nativewind ?? null,
                  }
                : null,
              components,
            },
            null,
            2
          )
        )
        return
      }

      info(highlighter.info("Project"))
      if (projectInfo) {
        printEntries({
          framework: `${projectInfo.framework.label} (${projectInfo.framework.name})`,
          nativeWind: projectInfo.hasNativeWind ? "Yes" : "No",
          typescript: projectInfo.hasTypeScript ? "Yes" : "No",
          packageManager: projectInfo.packageManager,
          tailwindVersion: projectInfo.tailwindVersion ?? "-",
          tailwindConfig: projectInfo.tailwindConfigFile ?? "-",
          tailwindCss: projectInfo.tailwindCssFile ?? "-",
          aliasPrefix: projectInfo.aliasPrefix ?? "-",
        })
      } else {
        log("  No project info detected.")
      }

      info(highlighter.info("Configuration"))
      if (config) {
        printEntries({
          style: config.style,
          typescript: config.tsx ? "Yes" : "No",
        })

        log("")
        info(highlighter.info("Aliases"))
        printEntries({
          components: config.aliases.components,
          utils: config.aliases.utils,
          ui: config.aliases.ui ?? "-",
          lib: config.aliases.lib ?? "-",
          hooks: config.aliases.hooks ?? "-",
        })

        log("")
        info(highlighter.info("Resolved Paths"))
        printEntries({
          cwd: config.resolvedPaths.cwd,
          utils: config.resolvedPaths.utils,
          components: config.resolvedPaths.components,
          lib: config.resolvedPaths.lib,
          hooks: config.resolvedPaths.hooks,
          ui: config.resolvedPaths.ui,
          nativewindCss: config.resolvedPaths.nativewindCss,
        })

        if (config.nativewind) {
          log("")
          info(highlighter.info("NativeWind"))
          printEntries({
            baseColor: config.nativewind.baseColor || "default",
            cssVariables: String(config.nativewind.cssVariables),
          })
        }
      } else {
        log("  No components.json found.")
      }

      log("")
      info(highlighter.info("Installed Components"))
      if (components.length > 0) {
        log(`  ${components.join(", ")}`)
      } else {
        log("  No components installed.")
      }

      log("")
      info(highlighter.info("Links"))
      printEntries({
        docs: `${WEDNEST_URL}/docs`,
        components: `${WEDNEST_URL}/docs/components/[component]`,
        schema: `${WEDNEST_URL}/schema.json`,
      })

      log("")
    } catch (err) {
      logError(`Failed to get project info: ${err}`)
      process.exit(1)
    }
  })
