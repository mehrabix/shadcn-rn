import * as fs from "fs/promises"
import * as path from "path"
import { log, info, success, warn } from "../utils/logger"
import { glob } from "fast-glob"

const ICON_MAPPINGS: Record<string, string> = {
  "@heroicons/react/24/outline": "lucide-react-native",
  "@heroicons/react/24/solid": "lucide-react-native",
  "@heroicons/react/outline": "lucide-react-native",
  "@heroicons/react/solid": "lucide-react-native",
  "react-icons": "lucide-react-native",
  "react-icons/hi": "lucide-react-native",
  "react-icons/hi2": "lucide-react-native",
  "react-icons/fi": "lucide-react-native",
  "react-icons/io": "lucide-react-native",
  "react-icons/md": "lucide-react-native",
  "react-icons/fa": "lucide-react-native",
  "@expo/vector-icons": "lucide-react-native",
}

const NAME_MAPPINGS: Record<string, Record<string, string>> = {
  "lucide-react-native": {
    PlusIcon: "Plus",
    MinusIcon: "Minus",
    XMarkIcon: "X",
    CheckIcon: "Check",
    ChevronDownIcon: "ChevronDown",
    ChevronUpIcon: "ChevronUp",
    ChevronLeftIcon: "ChevronLeft",
    ChevronRightIcon: "ChevronRight",
    Bars3Icon: "Menu",
    MagnifyingGlassIcon: "Search",
    ArrowLeftIcon: "ArrowLeft",
    ArrowRightIcon: "ArrowRight",
  },
}

export async function migrateIcons(cwd: string): Promise<void> {
  log("Running icon migration...")

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

        for (const [oldPackage, newPackage] of Object.entries(ICON_MAPPINGS)) {
          const importRegex = new RegExp(
            `from ["']${oldPackage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
            "g"
          )
          if (importRegex.test(content)) {
            content = content.replace(importRegex, `from "${newPackage}"`)
            modified = true
            info(`  Updated import in ${path.relative(cwd, filePath)}: ${oldPackage} -> ${newPackage}`)
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
      success(`Updated ${modifiedCount} files with new icon imports`)
    } else {
      info("No files needed icon import updates")
    }
  } catch {
    warn("Icon migration completed with warnings")
  }

  success("Migration 'icons' completed")
}
