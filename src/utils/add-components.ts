import path from "path"
import type { Config, WorkspaceConfig } from "../registry/schema"
import type { ResolvedItemsTree } from "../registry/schema"
import {
  registryItemFileSchema,
  registryItemSchema,
} from "../registry/schema"
import { resolveRegistryTree } from "../registry/resolver"
import { configWithDefaults } from "../registry/config"
import { isSafeTarget } from "./is-safe-target"
import { getPackageManager, getInstallCommand } from "./get-package-manager"
import { transform } from "./transformers"
import { spinner } from "./spinner"
import { logger } from "./logger"
import { getWorkspaceConfig, findCommonRoot, findPackageRoot } from "./get-config"
import { updateCss } from "./updaters/update-css"
import { updateDependencies } from "./updaters/update-dependencies"
import { updateEnvVars } from "./updaters/update-env-vars"
import { updateFiles } from "./updaters/update-files"
import { updateFonts } from "./updaters/update-fonts"
import { updateTailwindConfig } from "./updaters/update-tailwind-config"
import { z } from "zod"

export async function addComponents(
  components: string[],
  config: Config,
  options: {
    overwrite?: boolean
    overwriteCssVars?: boolean
    silent?: boolean
    isNewProject?: boolean
    skipFonts?: boolean
    path?: string
  }
) {
  options = {
    overwrite: false,
    silent: false,
    isNewProject: false,
    ...options,
  }

  const workspaceConfig = await getWorkspaceConfig(config)
  if (
    workspaceConfig &&
    workspaceConfig.ui &&
    workspaceConfig.ui.resolvedPaths.cwd !== config.resolvedPaths.cwd
  ) {
    return await addWorkspaceComponents(components, config, workspaceConfig, options)
  }

  return await addProjectComponents(components, config, options)
}

async function addProjectComponents(
  components: string[],
  config: Config,
  options: {
    overwrite?: boolean
    overwriteCssVars?: boolean
    silent?: boolean
    isNewProject?: boolean
    skipFonts?: boolean
    path?: string
  }
) {
  if (!components.length) {
    return
  }

  const registrySpinner = spinner(`Checking registry.`, {
    silent: options.silent,
  })?.start()

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

  try {
    validateFilesTarget(tree.files ?? [], config.resolvedPaths.cwd)
  } catch (error) {
    registrySpinner?.fail()
    throw error
  }

  registrySpinner?.succeed()

  await updateDependencies(tree.dependencies, tree.devDependencies, config, {
    silent: options.silent,
  })

  await updateTailwindConfig(tree.tailwind?.config, config, {
    silent: options.silent,
  })

  await updateEnvVars(tree.envVars, config, {
    silent: options.silent,
  })

  await updateFonts(tree.fonts, config, {
    silent: options.silent,
  })

  await updateFiles(tree.files, config, {
    overwrite: options.overwrite,
    silent: options.silent,
    path: options.path,
  })

  const overwriteCssVars = tree.cssVars
    ? (options.overwriteCssVars ?? false)
    : undefined
  await updateCss(tree.css, config, {
    silent: options.silent,
    cssVars: tree.cssVars,
    cleanupDefaultNextStyles: options.isNewProject,
    overwriteCssVars,
    tailwindConfig: tree.tailwind?.config,
  })

  if (tree.docs) {
    logger.info(tree.docs)
  }
}

async function addWorkspaceComponents(
  components: string[],
  config: Config,
  workspaceConfig: WorkspaceConfig,
  options: {
    overwrite?: boolean
    overwriteCssVars?: boolean
    silent?: boolean
    isNewProject?: boolean
    path?: string
  }
) {
  if (!components.length) {
    return
  }

  const registrySpinner = spinner(`Checking registry.`, {
    silent: options.silent,
  })?.start()

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

  try {
    validateFilesTarget(tree.files ?? [], config.resolvedPaths.cwd)
  } catch (error) {
    registrySpinner?.fail()
    throw error
  }

  registrySpinner?.succeed()

  const filesCreated: string[] = []
  const filesUpdated: string[] = []
  const filesSkipped: string[] = []

  const rootSpinner = spinner(`Installing components.`, {
    silent: options.silent,
  })?.start()

  const mainTargetConfig = workspaceConfig.ui!
  const workspaceRoot = findCommonRoot(
    config.resolvedPaths.cwd,
    mainTargetConfig.resolvedPaths.ui
  )

  await updateDependencies(tree.dependencies, tree.devDependencies, mainTargetConfig, {
    silent: true,
  })

  await updateTailwindConfig(tree.tailwind?.config, mainTargetConfig, {
    silent: true,
  })

  if (tree.envVars) {
    await updateEnvVars(tree.envVars, mainTargetConfig, {
      silent: true,
    })
  }

  await updateFonts(tree.fonts, config, {
    silent: true,
  })

  const TARGET_ALIAS_KEYS = ["components", "ui", "lib", "hooks"] as const
  type TargetAliasKey = (typeof TARGET_ALIAS_KEYS)[number]
  const filesByTarget = new Map<TargetAliasKey, typeof tree.files>()
  const FILE_TYPE_TO_CONFIG_KEY: Record<string, TargetAliasKey> = {
    "registry:ui": "ui",
    "registry:hook": "hooks",
    "registry:lib": "lib",
  }
  const isTargetAliasKey = (key: string): key is TargetAliasKey => {
    return TARGET_ALIAS_KEYS.includes(key as TargetAliasKey)
  }
  const getTargetAliasKey = (target?: string) => {
    const match = target?.match(/^@([^/]+)\//)
    return match && isTargetAliasKey(match[1]) ? match[1] : null
  }
  const getTargetConfigKeyForFile = (
    file: z.infer<typeof registryItemFileSchema>
  ) => {
    return (
      getTargetAliasKey(file.target) ??
      FILE_TYPE_TO_CONFIG_KEY[file.type || "registry:ui"] ??
      "components"
    )
  }
  const getTargetConfigForKey = (configKey: TargetAliasKey) => {
    return configKey && workspaceConfig[configKey]
      ? workspaceConfig[configKey]
      : config
  }

  for (const file of tree.files ?? []) {
    const targetKey = getTargetConfigKeyForFile(file)
    if (!filesByTarget.has(targetKey)) {
      filesByTarget.set(targetKey, [])
    }
    filesByTarget.get(targetKey)!.push(file)
  }

  for (const targetKey of Array.from(filesByTarget.keys())) {
    const targetFiles = filesByTarget.get(targetKey)!
    const targetConfig = getTargetConfigForKey(targetKey)

    const files = await updateFiles(targetFiles, targetConfig, {
      overwrite: options.overwrite,
      silent: true,
      isWorkspace: true,
      path: options.path,
    })

    filesCreated.push(...(files.filesCreated || []))
    filesUpdated.push(...(files.filesUpdated || []))
    filesSkipped.push(...(files.filesSkipped || []))
  }

  const overwriteCssVars = tree.cssVars
    ? (options.overwriteCssVars ?? false)
    : undefined
  await updateCss(tree.css, mainTargetConfig, {
    silent: true,
    cssVars: tree.cssVars,
    overwriteCssVars,
    tailwindConfig: tree.tailwind?.config,
  })

  rootSpinner?.succeed()

  const dedupedCreated = Array.from(new Set(filesCreated)).sort()
  const dedupedUpdated = Array.from(
    new Set(filesUpdated.filter((file) => !filesCreated.includes(file)))
  ).sort()
  const dedupedSkipped = Array.from(new Set(filesSkipped)).sort()

  if (dedupedCreated.length) {
    const s = spinner(
      `Created ${dedupedCreated.length} ${
        dedupedCreated.length === 1 ? "file" : "files"
      }:`,
      { silent: options.silent }
    )
    s?.succeed()
    for (const file of dedupedCreated) {
      logger.log(`  - ${file}`)
    }
  }

  if (dedupedUpdated.length) {
    const s = spinner(
      `Updated ${dedupedUpdated.length} ${
        dedupedUpdated.length === 1 ? "file" : "files"
      }:`,
      { silent: options.silent }
    )
    s?.info()
    for (const file of dedupedUpdated) {
      logger.log(`  - ${file}`)
    }
  }

  if (dedupedSkipped.length) {
    const s = spinner(
      `Skipped ${dedupedSkipped.length} ${
        dedupedSkipped.length === 1 ? "file" : "files"
      }: (use --overwrite to overwrite)`,
      { silent: options.silent }
    )
    s?.info()
    for (const file of dedupedSkipped) {
      logger.log(`  - ${file}`)
    }
  }

  if (tree.docs) {
    logger.info(tree.docs)
  }
}

function validateFilesTarget(
  files: z.infer<typeof registryItemFileSchema>[],
  cwd: string
) {
  for (const file of files) {
    if (!file?.target) {
      continue
    }

    if (!isSafeTarget(file.target, cwd)) {
      throw new Error(
        `We found an unsafe file path "${file.target}" in the registry item. Installation aborted.`
      )
    }
  }
}
