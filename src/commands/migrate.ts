import * as fs from "fs/promises"
import * as path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, success, error as logError } from "../utils/logger"
import { runMigration, runAllMigrations } from "../migrations"

export interface MigrateOptions {
  cwd: string
  type?: string
}

export async function migrate(options: MigrateOptions): Promise<void> {
  const { cwd, type } = options

  log("Running migrations...")

  try {
    await getConfig(cwd)
  } catch {
    logError(
      "Could not find components.json. Run 'npx shadcn-rn init' first."
    )
    return
  }

  if (type) {
    info(`Running migration: ${type}`)
    const ran = await runMigration(type, cwd)
    if (!ran) {
      logError(`Migration "${type}" not found. Available: icons, rtl, radix`)
      return
    }
  } else {
    info("Running all migrations...")
    await runAllMigrations(cwd)
  }

  success("Migrations completed!")
}
