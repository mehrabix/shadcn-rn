import * as fs from "fs/promises"
import * as path from "path"
import * as ERRORS from "../utils/errors"
import { getConfig } from "../utils/get-config"
import {
  isMonorepoRoot,
  getMonorepoTargets,
  formatMonorepoMessage,
} from "../utils/get-monorepo-info"
import { log, info, error as logError } from "../utils/logger"

export interface PreflightResult {
  passed: boolean
  errors: Record<string, boolean>
  config?: ReturnType<typeof getConfig> extends Promise<infer T> ? T : never
  message?: string
}

export async function preflightAdd(cwd: string): Promise<PreflightResult> {
  const errors: Record<string, boolean> = {}

  if (
    !(await exists(cwd)) ||
    !(await exists(path.resolve(cwd, "package.json")))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true
    return { passed: false, errors, config: null as never }
  }

  if (!(await exists(path.resolve(cwd, "components.json")))) {
    if (await isMonorepoRoot(cwd)) {
      const targets = await getMonorepoTargets(cwd)
      if (targets.length > 0) {
        formatMonorepoMessage("add [component]", targets)
        return { passed: false, errors, config: null as never }
      }
    }
    errors[ERRORS.MISSING_CONFIG] = true
    return { passed: false, errors, config: null as never }
  }

  try {
    const config = await getConfig(cwd)
    return { passed: true, errors, config }
  } catch {
    logError(
      `An invalid components.json file was found at ${cwd}.\n` +
        `Run 'npx shadcn-rn init' to create a valid config.`
    )
    return { passed: false, errors, config: null as never }
  }
}

export async function preflightInit(cwd: string): Promise<PreflightResult> {
  const errors: Record<string, boolean> = {}

  if (
    !(await exists(cwd)) ||
    !(await exists(path.resolve(cwd, "package.json")))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true
    return { passed: false, errors, config: null as never }
  }

  if (await exists(path.resolve(cwd, "components.json"))) {
    logError(
      `A components.json file already exists at ${cwd}.\n` +
        `To start over, remove it and run 'npx shadcn-rn init' again.`
    )
    return { passed: false, errors, config: null as never }
  }

  if (await isMonorepoRoot(cwd)) {
    const targets = await getMonorepoTargets(cwd)
    if (targets.length > 0) {
      formatMonorepoMessage("init", targets)
      return { passed: false, errors, config: null as never }
    }
  }

  return { passed: true, errors, config: null as never }
}

export async function preflightBuild(cwd: string): Promise<PreflightResult> {
  const errors: Record<string, boolean> = {}

  const registryFile = path.resolve(cwd, "registry.json")
  const outputDir = path.resolve(cwd, "dist")

  if (!(await exists(registryFile))) {
    errors[ERRORS.BUILD_MISSING_REGISTRY_FILE] = true
    logError(`The registry file at ${registryFile} does not exist.`)
    return { passed: false, errors, config: null as never }
  }

  await fs.mkdir(outputDir, { recursive: true })

  return { passed: true, errors, config: null as never }
}

export async function preflightApply(cwd: string): Promise<PreflightResult> {
  const errors: Record<string, boolean> = {}

  if (
    !(await exists(cwd)) ||
    !(await exists(path.resolve(cwd, "package.json")))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true
    return { passed: false, errors, config: null as never }
  }

  if (!(await exists(path.resolve(cwd, "components.json")))) {
    errors[ERRORS.MISSING_CONFIG] = true
    return { passed: false, errors, config: null as never }
  }

  try {
    const config = await getConfig(cwd)
    return { passed: true, errors, config }
  } catch {
    logError(
      `An invalid components.json file was found at ${cwd}.\n` +
        `Run 'npx shadcn-rn init' to create a valid config.`
    )
    return { passed: false, errors, config: null as never }
  }
}

export async function preflightMigrate(cwd: string): Promise<PreflightResult> {
  const errors: Record<string, boolean> = {}

  if (
    !(await exists(cwd)) ||
    !(await exists(path.resolve(cwd, "package.json")))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true
    return { passed: false, errors, config: null as never }
  }

  if (!(await exists(path.resolve(cwd, "components.json")))) {
    errors[ERRORS.MISSING_CONFIG] = true
    return { passed: false, errors, config: null as never }
  }

  try {
    const config = await getConfig(cwd)
    return { passed: true, errors, config }
  } catch {
    return { passed: false, errors, config: null as never }
  }
}

export async function preflightRegistry(
  cwd: string
): Promise<PreflightResult> {
  const errors: Record<string, boolean> = {}

  if (
    !(await exists(cwd)) ||
    !(await exists(path.resolve(cwd, "package.json")))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true
    return { passed: false, errors, config: null as never }
  }

  if (!(await exists(path.resolve(cwd, "components.json")))) {
    errors[ERRORS.MISSING_CONFIG] = true
    return { passed: false, errors, config: null as never }
  }

  const registryFile = path.resolve(cwd, "registry.json")
  if (!(await exists(registryFile))) {
    errors[ERRORS.BUILD_MISSING_REGISTRY_FILE] = true
    logError(`The registry file at ${registryFile} does not exist.`)
    return { passed: false, errors, config: null as never }
  }

  try {
    const config = await getConfig(cwd)
    return { passed: true, errors, config }
  } catch {
    return { passed: false, errors, config: null as never }
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}
