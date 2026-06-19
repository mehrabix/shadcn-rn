import * as fs from "fs/promises"
import * as path from "path"
import type { Config } from "../registry/schema"
import type { ResolvedItemsTree } from "../registry/schema"
import { resolveRegistryTree } from "../registry/resolver"
import { isSafeTarget } from "./is-safe-target"

export interface AddComponentsOptions {
  config: Config
  components: string[]
  overwrite?: boolean
  silent?: boolean
}

export async function addComponents(
  options: AddComponentsOptions
): Promise<void> {
  const { config, components, overwrite = false, silent = false } = options

  const tree = await resolveRegistryTree(components, { config })

  await updateFiles(tree, config, { overwrite, silent })

  if (tree.dependencies && tree.dependencies.length > 0) {
    await installDependencies(tree.dependencies)
  }
}

async function updateFiles(
  tree: ResolvedItemsTree,
  config: Config,
  options: { overwrite: boolean; silent: boolean }
): Promise<void> {
  if (!tree.files || tree.files.length === 0) {
    return
  }

  const cwd = config.resolvedPaths.cwd
  const uiDir = path.resolve(cwd, config.resolvedPaths.ui)

  await fs.mkdir(uiDir, { recursive: true })

  for (const file of tree.files) {
    const targetPath = file.target
      ? path.resolve(cwd, file.target)
      : path.resolve(uiDir, file.path)

    if (!isSafeTarget(targetPath, cwd)) {
      continue
    }

    if (!options.overwrite) {
      try {
        await fs.access(targetPath)
        if (!options.silent) {
          console.log(`  Skipping ${file.path} (already exists)`)
        }
        continue
      } catch {
        // File doesn't exist, proceed
      }
    }

    const dir = path.dirname(targetPath)
    await fs.mkdir(dir, { recursive: true })

    const content = file.content || ""
    await fs.writeFile(targetPath, content)

    if (!options.silent) {
      console.log(`  Writing ${file.path}`)
    }
  }
}

async function installDependencies(dependencies: string[]): Promise<void> {
  console.log(`Installing dependencies: ${dependencies.join(", ")}`)
}
