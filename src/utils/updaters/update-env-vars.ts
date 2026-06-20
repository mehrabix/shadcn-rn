import { existsSync, promises as fs } from "fs"
import * as path from "path"
import type { Config } from "../../registry/schema"
import { findExistingEnvFile, mergeEnvContent, getNewEnvKeys } from "../env-helpers"
import { highlighter } from "../highlighter"
import { logger } from "../logger"
import { spinner } from "../spinner"

export async function updateEnvVars(
  envVars: Record<string, string> | undefined,
  config: Config,
  options: { silent?: boolean } = {}
): Promise<{
  envVarsAdded: string[]
  envFileUpdated: string | null
  envFileCreated: string | null
}> {
  if (!envVars || Object.keys(envVars).length === 0) {
    return { envVarsAdded: [], envFileUpdated: null, envFileCreated: null }
  }

  const envSpinner = spinner("Adding environment variables.", {
    silent: options.silent,
  })?.start()

  const projectRoot = config.resolvedPaths.cwd
  let envFilePath = path.join(projectRoot, ".env.local")
  const existingEnvFile = await findExistingEnvFile(projectRoot)

  if (existingEnvFile) {
    envFilePath = existingEnvFile
  }

  const envFileExists = existsSync(envFilePath)
  const envFileName = path.basename(envFilePath)

  const newEnvContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")

  let envVarsAdded: string[] = []
  let envFileUpdated: string | null = null
  let envFileCreated: string | null = null

  if (envFileExists) {
    const existingContent = await fs.readFile(envFilePath, "utf-8")
    const mergedContent = mergeEnvContent(existingContent, newEnvContent)
    envVarsAdded = getNewEnvKeys(existingContent, newEnvContent)

    if (envVarsAdded.length > 0) {
      await fs.writeFile(envFilePath, mergedContent, "utf-8")
      envFileUpdated = path.relative(projectRoot, envFilePath)

      envSpinner?.succeed(
        `Added variables to ${highlighter.info(envFileName)}:`
      )

      if (!options.silent) {
        for (const key of envVarsAdded) {
          logger.log(`  ${highlighter.success("+")} ${key}`)
        }
      }
    } else {
      envSpinner?.stop()
    }
  } else {
    await fs.writeFile(envFilePath, newEnvContent + "\n", "utf-8")
    envFileCreated = path.relative(projectRoot, envFilePath)
    envVarsAdded = Object.keys(envVars)

    envSpinner?.succeed(
      `Added variables to ${highlighter.info(envFileName)}:`
    )

    if (!options.silent) {
      for (const key of envVarsAdded) {
        logger.log(`  ${highlighter.success("+")} ${key}`)
      }
    }
  }

  return { envVarsAdded, envFileUpdated, envFileCreated }
}
