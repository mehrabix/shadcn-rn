import * as fs from "fs/promises"
import * as path from "path"
import { log, info, success } from "../utils/logger"

export interface Migration {
  name: string
  description: string
  run: (cwd: string) => Promise<void>
}

export const migrations: Migration[] = [
  {
    name: "icons",
    description: "Update icon imports",
    run: async (cwd: string) => {
      info("Updating icon imports...")
    },
  },
  {
    name: "rtl",
    description: "Add RTL support",
    run: async (cwd: string) => {
      info("Adding RTL support...")
    },
  },
]

export async function runMigration(
  name: string,
  cwd: string
): Promise<boolean> {
  const migration = migrations.find((m) => m.name === name)
  if (!migration) {
    log(`Migration "${name}" not found`)
    return false
  }

  info(`Running migration: ${migration.description}`)
  await migration.run(cwd)
  success(`Migration "${name}" completed`)
  return true
}

export async function runAllMigrations(cwd: string): Promise<void> {
  for (const migration of migrations) {
    await runMigration(migration.name, cwd)
  }
}
