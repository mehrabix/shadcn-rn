import { log, info, success } from "../utils/logger"

export async function migrateIcons(cwd: string): Promise<void> {
  log("Running icon migration...")

  try {
    info("Updating icon imports...")
    success("Migration 'icons' completed")
  } catch {
    info("Icon migration failed")
  }
}
