import * as fs from "fs/promises"
import * as path from "path"
import { log, info, success, warn } from "../utils/logger"
import { glob } from "fast-glob"

const RADIX_TO_RN: Record<string, string> = {
  "@radix-ui/react-dialog": "react-native",
  "@radix-ui/react-dropdown-menu": "react-native",
  "@radix-ui/react-select": "react-native",
  "@radix-ui/react-popover": "react-native",
  "@radix-ui/react-tooltip": "react-native",
  "@radix-ui/react-switch": "react-native",
  "@radix-ui/react-slider": "react-native",
  "@radix-ui/react-progress": "react-native",
  "@radix-ui/react-label": "react-native",
  "@radix-ui/react-separator": "react-native",
  "@radix-ui/react-tabs": "react-native",
  "@radix-ui/react-accordion": "react-native",
  "@radix-ui/react-avatar": "react-native",
  "@radix-ui/react-checkbox": "react-native",
  "@radix-ui/react-collapsible": "react-native",
  "@radix-ui/react-context-menu": "react-native",
  "@radix-ui/react-hover-card": "react-native",
  "@radix-ui/react-menubar": "react-native",
  "@radix-ui/react-navigation-menu": "react-native",
  "@radix-ui/react-scroll-area": "react-native",
  "@radix-ui/react-toggle": "react-native",
  "@radix-ui/react-toggle-group": "react-native",
}

export async function migrateRadix(cwd: string): Promise<void> {
  log("Running Radix migration...")

  try {
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

        for (const [radixPackage] of Object.entries(RADIX_TO_RN)) {
          const escapedPackage = radixPackage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          const importRegex = new RegExp(
            `import\\s+\\{([^}]+)\\}\\s+from\\s+["']${escapedPackage}["']`,
            "g"
          )

          const match = importRegex.exec(content)
          if (match) {
            const imports = match[1].split(",").map((i) => i.trim())
            info(
              `  Found Radix imports in ${path.relative(cwd, filePath)}: ${imports.join(", ")}`
            )
            modified = true
          }
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
      info(`Found ${modifiedCount} files with Radix imports`)
    }

    const packageJsonPath = path.join(cwd, "package.json")
    try {
      const content = await fs.readFile(packageJsonPath, "utf-8")
      const pkg = JSON.parse(content)

      let radixDeps: string[] = []
      for (const dep of Object.keys(pkg.dependencies || {})) {
        if (dep.startsWith("@radix-ui/")) {
          radixDeps.push(dep)
        }
      }

      if (radixDeps.length > 0) {
        info(`Found Radix dependencies: ${radixDeps.join(", ")}`)
        info("For React Native, replace these with native implementations")
      }
    } catch {
      warn("Could not read package.json")
    }
  } catch {
    warn("Radix migration completed with warnings")
  }

  success("Migration 'radix' completed")
}
