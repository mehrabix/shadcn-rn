import { existsSync, promises as fs } from "fs"
import path from "path"
import { getConfig, type Config } from "../utils/get-config"
import { log, info, success, error as logError } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { transform } from "../utils/transformers"
import { transformImport } from "../utils/transformers/transform-import"
import { transformCssVars } from "../utils/transformers/transform-css-vars"
import { transformReactNative } from "../utils/transformers/transform-react-native"
import { transformCleanup } from "../utils/transformers/transform-cleanup"
import { Command } from "commander"
import { diffLines, type Change } from "diff"
import { z } from "zod"

const diffOptionsSchema = z.object({
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

      const config = await getConfig(cwd).catch(() => null)
      if (!config) {
        logError(
          `Configuration is missing. Please run ${highlighter.success(
            "init"
          )} to create a components.json file.`
        )
        process.exit(1)
      }

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
          changes: { filePath: string; patch: Change[] }[]
        }> = []

        for (const comp of installedComponents) {
          const changes = await diffComponent(comp, config)
          if (changes.length > 0) {
            componentsWithUpdates.push({ name: comp, changes })
          }
        }

        if (componentsWithUpdates.length === 0) {
          success("No updates found. All components are up to date.")
          process.exit(0)
        }

        info("The following components have updates available:")
        for (const component of componentsWithUpdates) {
          log(`- ${highlighter.info(component.name)}`)
          for (const change of component.changes) {
            log(`  - ${change.filePath}`)
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

      const changes = await diffComponent(options.component, config)

      if (changes.length === 0) {
        success(`No updates found for ${options.component}.`)
        process.exit(0)
      }

      for (const change of changes) {
        info(`- ${change.filePath}`)
        printDiff(change.patch)
        info("")
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

async function diffComponent(
  componentName: string,
  config: Config
): Promise<{ filePath: string; patch: Change[] }[]> {
  const { getRegistryItems } = await import("../registry/api")

  const items = await getRegistryItems([`components:${componentName}`])
  if (items.length === 0) {
    return []
  }

  const item = items[0]
  if (!item.files || item.files.length === 0) {
    return []
  }

  const changes: { filePath: string; patch: Change[] }[] = []

  for (const file of item.files) {
    if (!file.content) continue

    const localPath = path.resolve(
      config.resolvedPaths.components,
      file.path || `${componentName}.tsx`
    )

    if (!existsSync(localPath)) continue

    const localContent = await fs.readFile(localPath, "utf-8")

    let registryContent: string
    try {
      registryContent = (await transform(
        {
          filename: file.path,
          raw: file.content,
          config,
        },
        [transformImport, transformCssVars, transformReactNative, transformCleanup]
      )) as string
    } catch {
      registryContent = file.content
    }

    const patch = diffLines(registryContent, localContent)
    if (patch.length > 1) {
      changes.push({ filePath: localPath, patch })
    }
  }

  return changes
}

function printDiff(diff: Change[]) {
  for (const part of diff) {
    if (part.added) {
      process.stdout.write(highlighter.success(part.value))
    } else if (part.removed) {
      process.stdout.write(highlighter.error(part.value))
    } else {
      process.stdout.write(part.value)
    }
  }
}
