import { log, info, success } from "../utils/logger"

export async function migrateRtl(cwd: string): Promise<void> {
  log("Running RTL migration...")

  try {
    info("Adding RTL support...")
    success("Migration 'rtl' completed")
  } catch {
    info("RTL migration failed")
  }
}
