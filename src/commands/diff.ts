import * as fs from "fs/promises"
import * as path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, success, error as logError, warn } from "../utils/logger"

export interface DiffOptions {
  cwd: string
  component?: string
}

interface DiffResult {
  component: string
  differences: string[]
  localPath: string
  registryContent: string | null
  localContent: string | null
}

export async function diff(options: DiffOptions): Promise<void> {
  const { cwd, component } = options

  log("Checking for differences...")

  const config = await getConfig(cwd)
  const uiPath = path.resolve(cwd, "src", "components", "ui")

  const components = component ? [component] : await findInstalledComponents(uiPath)
  const results: DiffResult[] = []

  for (const comp of components) {
    const localPath = path.join(uiPath, `${comp}.tsx`)
    let localContent: string | null = null
    try {
      localContent = await fs.readFile(localPath, "utf-8")
    } catch {
      // Component not installed locally
    }

    const registryContent = await fetchRegistryContent(config.style, comp)

    if (localContent && registryContent) {
      const differences = computeDifferences(localContent, registryContent)
      if (differences.length > 0) {
        results.push({ component: comp, differences, localPath, registryContent, localContent })
      }
    } else if (localContent && !registryContent) {
      warn(`Component "${comp}" not found in registry`)
    } else if (!localContent && registryContent) {
      info(`Component "${comp}" is available in registry but not installed`)
    }
  }

  if (results.length === 0) {
    success("No differences found")
  } else {
    for (const result of results) {
      info(`\nDifferences in ${result.component}:`)
      for (const diff of result.differences) {
        log(`  ${diff}`)
      }
    }
  }
}

async function findInstalledComponents(uiPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(uiPath)
    return files
      .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
      .map((f) => path.basename(f, path.extname(f)))
  } catch {
    return []
  }
}

async function fetchRegistryContent(
  style: string,
  component: string
): Promise<string | null> {
  try {
    const { getRegistryItems } = await import("../registry/api")
    const items = await getRegistryItems([`components:${component}`])
    if (items.length > 0 && items[0].files && items[0].files.length > 0) {
      return items[0].files[0].content
    }
    return null
  } catch {
    return null
  }
}

function computeDifferences(local: string, remote: string): string[] {
  const localLines = local.split("\n")
  const remoteLines = remote.split("\n")
  const diffs: string[] = []

  const maxLen = Math.max(localLines.length, remoteLines.length)
  for (let i = 0; i < maxLen; i++) {
    const localLine = localLines[i] || ""
    const remoteLine = remoteLines[i] || ""
    if (localLine !== remoteLine) {
      diffs.push(`Line ${i + 1}: local differs from registry`)
    }
  }
  return diffs
}
