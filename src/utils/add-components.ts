import * as fs from "fs/promises"
import * as path from "path"
import type { Config } from "../registry/schema"
import type { ResolvedItemsTree } from "../registry/schema"
import { resolveRegistryTree } from "../registry/resolver"
import { configWithDefaults } from "../registry/config"
import { isSafeTarget } from "./is-safe-target"
import { getPackageManager, getInstallCommand } from "./get-package-manager"
import { transform } from "./transformers"

export interface AddComponentsOptions {
  config: Config
  components: string[]
  overwrite?: boolean
  silent?: boolean
  skipTransform?: boolean
  path?: string
}

export async function addComponents(
  options: AddComponentsOptions
): Promise<void> {
  const {
    config,
    components,
    overwrite = false,
    silent = false,
    skipTransform = false,
    path: targetPath,
  } = options

  if (!components.length) {
    return
  }

  const registrySpinner = spinner(`Checking registry.`, { silent })?.start()

  let tree: ResolvedItemsTree | null = null
  try {
    tree = await resolveRegistryTree(components, configWithDefaults(config))
  } catch (error) {
    registrySpinner?.fail()
    throw error
  }

  if (!tree) {
    registrySpinner?.fail()
    throw new Error("Failed to fetch components from registry.")
  }

  registrySpinner?.succeed()

  if (tree.dependencies?.length) {
    await updateDependencies(tree.dependencies, config, { silent })
  }

  if (tree.devDependencies?.length) {
    await updateDevDependencies(tree.devDependencies, config, { silent })
  }

  await updateFiles(tree, config, {
    overwrite,
    silent,
    skipTransform,
    path: targetPath,
  })

  if (tree.docs && !silent) {
    console.log(tree.docs)
  }
}

async function updateFiles(
  tree: ResolvedItemsTree,
  config: Config,
  options: {
    overwrite: boolean
    silent: boolean
    skipTransform: boolean
    path?: string
  }
): Promise<void> {
  if (!tree.files || tree.files.length === 0) {
    return
  }

  const cwd = config.resolvedPaths.cwd
  const uiDir = options.path
    ? path.resolve(cwd, options.path)
    : path.resolve(cwd, config.resolvedPaths.ui)

  await fs.mkdir(uiDir, { recursive: true })

  for (const file of tree.files) {
    const targetFilePath = file.target
      ? path.resolve(cwd, file.target)
      : path.resolve(uiDir, file.path)

    if (!isSafeTarget(targetFilePath, cwd)) {
      if (!options.silent) {
        console.log(`  Skipping ${file.path} (unsafe target)`)
      }
      continue
    }

    if (!options.overwrite) {
      try {
        await fs.access(targetFilePath)
        if (!options.silent) {
          console.log(`  Skipping ${file.path} (already exists)`)
        }
        continue
      } catch {
        // File doesn't exist, proceed
      }
    }

    const dir = path.dirname(targetFilePath)
    await fs.mkdir(dir, { recursive: true })

    let content = file.content || ""

    if (!options.skipTransform && content) {
      try {
        content = await transform({
          filename: file.path,
          raw: content,
          config,
        })
      } catch {
        // If transformation fails, use original content
      }
    }

    await fs.writeFile(targetFilePath, content)

    if (!options.silent) {
      console.log(`  Writing ${file.path}`)
    }
  }
}

async function updateDependencies(
  dependencies: string[],
  config: Config,
  options: { silent: boolean }
): Promise<void> {
  if (!dependencies.length) return

  const cwd = config.resolvedPaths.cwd
  const packageManager = await getPackageManager(cwd)
  const installCmd = getInstallCommand(packageManager)

  if (!options.silent) {
    console.log(`Installing dependencies: ${dependencies.join(", ")}`)
  }

  try {
    const { execSync } = await import("child_process")
    execSync(`${installCmd} ${dependencies.join(" ")}`, {
      cwd,
      stdio: options.silent ? "ignore" : "inherit",
    })
  } catch (error) {
    if (!options.silent) {
      console.log("  Failed to install dependencies automatically.")
      console.log(`  Run: ${installCmd} ${dependencies.join(" ")}`)
    }
  }
}

async function updateDevDependencies(
  devDependencies: string[],
  config: Config,
  options: { silent: boolean }
): Promise<void> {
  if (!devDependencies.length) return

  const cwd = config.resolvedPaths.cwd
  const packageManager = await getPackageManager(cwd)
  const installCmd = getInstallCommand(packageManager).replace(" add ", " add -D ")

  if (!options.silent) {
    console.log(`Installing dev dependencies: ${devDependencies.join(", ")}`)
  }

  try {
    const { execSync } = await import("child_process")
    execSync(`${installCmd} ${devDependencies.join(" ")}`, {
      cwd,
      stdio: options.silent ? "ignore" : "inherit",
    })
  } catch {
    if (!options.silent) {
      console.log("  Failed to install dev dependencies automatically.")
      console.log(`  Run: ${installCmd} ${devDependencies.join(" ")}`)
    }
  }
}

function spinner(text: string, options?: { silent: boolean }) {
  if (options?.silent) return null
  return {
    start: () => ({
      succeed: () => {},
      fail: () => {},
    }),
  }
}
