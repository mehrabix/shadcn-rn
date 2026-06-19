import * as fs from "fs/promises"
import * as path from "path"
import { log, info, success, warn } from "../utils/logger"
import { glob } from "fast-glob"

export async function migrateRtl(cwd: string): Promise<void> {
  log("Running RTL migration...")

  try {
    const configPath = path.join(cwd, "components.json")
    try {
      const configContent = await fs.readFile(configPath, "utf-8")
      const config = JSON.parse(configContent)
      if (!config.rtl) {
        config.rtl = true
        await fs.writeFile(configPath, JSON.stringify(config, null, 2))
        info("Added rtl: true to components.json")
      }
    } catch {
      warn("Could not update components.json")
    }

    const files = await glob(["**/*.{tsx,ts,jsx,js}"], {
      cwd,
      ignore: ["node_modules/**", "dist/**", ".expo/**"],
      absolute: true,
    })

    let modifiedCount = 0

    for (const filePath of files) {
      try {
        let content = await fs.readFile(filePath, "utf-8")
        let modified = false

        if (content.includes("dir=")) {
          continue
        }

        const rtlPatterns = [
          { regex: /className=\{[^}]*\}/g, replacement: "dir=\"auto\"" },
        ]

        if (
          content.includes("className") &&
          (content.includes("ml-") || content.includes("mr-") || content.includes("pl-") || content.includes("pr-"))
        ) {
          info(`  Found potential RTL candidate: ${path.relative(cwd, filePath)}`)
        }

        if (modified) {
          await fs.writeFile(filePath, content)
          modifiedCount++
        }
      } catch {
        // Skip files that can't be read
      }
    }

    if (modifiedCount > 0) {
      success(`Updated ${modifiedCount} files for RTL support`)
    } else {
      info("RTL migration complete - review files manually for direction-aware styling")
    }
  } catch {
    warn("RTL migration completed with warnings")
  }

  success("Migration 'rtl' completed")
}
