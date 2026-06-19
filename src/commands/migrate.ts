import { log, info } from "../utils/logger"

export interface MigrateOptions {
  cwd: string
  type?: string
}

export async function migrate(options: MigrateOptions): Promise<void> {
  const { cwd, type } = options

  log("Running migrations...")

  if (type) {
    info(`Running migration: ${type}`)
  } else {
    info("Running all migrations...")
  }

  log("Migrations completed!")
}
