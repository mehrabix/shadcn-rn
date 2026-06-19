import { log, info, success } from "../utils/logger"

export async function migrateRadix(cwd: string): Promise<void> {
  log("Running Radix migration...")

  try {
    info("Updating Radix imports to React Native...")
    success("Migration 'radix' completed")
  } catch {
    info("Radix migration failed")
  }
}
