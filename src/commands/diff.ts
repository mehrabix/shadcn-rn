import { existsSync, promises as fs } from "fs"
import path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, success, error as logError, warn } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const diffOptionsSchema = z.object({
  component: z.string().optional(),
  yes: z.boolean(),
  cwd: z.string(),
})

export const diff = new Command()
  .name("diff")
  .description("check for differences between local and registry components")
  .argument("[component]", "the component name to check")
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .action(async (name, opts) => {
    try {
      const options = diffOptionsSchema.parse({
        component: name,
        ...opts,
      })

      const cwd = path.resolve(options.cwd)

      if (!existsSync(cwd)) {
        logError(`The path ${cwd} does not exist.`)
        process.exit(1)
      }

      const config = await getConfig(cwd)

      const { getRegistryItems } = await import("../registry/api")

      if (!options.component) {
        const uiPath = path.resolve(cwd, "src", "components", "ui")
        const installedComponents = await findInstalledComponents(uiPath)

        if (installedComponents.length === 0) {
          info("No components found in the project.")
          process.exit(0)
        }

        info(`Checking ${installedComponents.length} installed components...`)

        const componentsWithUpdates: Array<{
          name: string
          differences: string[]
        }> = []

        for (const comp of installedComponents) {
          try {
            const differences = await checkComponentDiff(comp, config)
            if (differences.length > 0) {
              componentsWithUpdates.push({ name: comp, differences })
            }
          } catch {
            // Skip components that can't be fetched
          }
        }

        if (componentsWithUpdates.length === 0) {
          success("No updates found. All components are up to date.")
          process.exit(0)
        }

        info(
          `\nThe following components have updates available:`
        )
        for (const component of componentsWithUpdates) {
          log(`- ${highlighter.info(component.name)}`)
          for (const diff of component.differences) {
            log(`  ${diff}`)
          }
        }
        info("")
        info(
          `Run ${highlighter.success(
            "npx shadcn-rn diff <component>"
          )} to see detailed changes.`
        )
        process.exit(0)
      }

      const differences = await checkComponentDiff(options.component, config)

      if (differences.length === 0) {
        success(`No updates found for ${options.component}.`)
        process.exit(0)
      }

      info(`Differences for ${highlighter.info(options.component)}:`)
      for (const diff of differences) {
        log(`  ${diff}`)
      }
    } catch (err) {
      logError(`Failed to check differences: ${err}`)
      process.exit(1)
    }
  })

async function findInstalledComponents(uiPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(uiPath)
    return files
      .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
      .map((f) => path.basename(f, path.extname(f)))
  } catch {
    return []
  }
}

async function checkComponentDiff(
  componentName: string,
  config: ReturnType<typeof getConfig> extends Promise<infer T> ? T : never
): Promise<string[]> {
  const differences: string[] = []

  try {
    const { getRegistryItems } = await import("../registry/api")
    const items = await getRegistryItems([`components:${componentName}`])

    if (items.length === 0) {
      differences.push(`Component "${componentName}" not found in registry`)
      return differences
    }

    const item = items[0]
    if (!item.files || item.files.length === 0) {
      return differences
    }

    const uiPath = path.resolve(
      config.resolvedPaths.cwd,
      "src",
      "components",
      "ui"
    )

    for (const file of item.files) {
      const localPath = path.join(uiPath, file.path || `${componentName}.tsx`)
      let localContent: string | null = null

      try {
        localContent = await fs.readFile(localPath, "utf-8")
      } catch {
        differences.push(
          `File ${file.path || `${componentName}.tsx`} exists in registry but not locally`
        )
        continue
      }

      if (file.content && localContent) {
        const localLines = localContent.split("\n")
        const remoteLines = file.content.split("\n")

        const maxLen = Math.max(localLines.length, remoteLines.length)
        let diffCount = 0

        for (let i = 0; i < maxLen; i++) {
          const localLine = localLines[i] || ""
          const remoteLine = remoteLines[i] || ""
          if (localLine !== remoteLine) {
            diffCount++
            if (diffCount <= 3) {
              differences.push(
                `Line ${i + 1}: local differs from registry`
              )
            }
          }
        }

        if (diffCount > 3) {
          differences.push(`... and ${diffCount - 3} more differences`)
        }
      }
    }
  } catch (err) {
    differences.push(`Error fetching registry: ${err}`)
  }

  return differences
}
