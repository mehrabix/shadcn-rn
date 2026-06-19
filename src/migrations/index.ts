import { log, info, success } from "../utils/logger"
import { migrateIcons } from "./migrate-icons"
import { migrateRtl } from "./migrate-rtl"
import { migrateRadix } from "./migrate-radix"

export interface Migration {
  name: string
  description: string
  run: (cwd: string) => Promise<void>
}

export const migrations: Migration[] = [
  {
    name: "icons",
    description: "Update icon imports",
    run: migrateIcons,
  },
  {
    name: "rtl",
    description: "Add RTL support",
    run: migrateRtl,
  },
  {
    name: "radix",
    description: "Migrate Radix UI imports to React Native",
    run: migrateRadix,
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
