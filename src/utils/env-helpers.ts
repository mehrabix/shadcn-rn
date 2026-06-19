import * as fs from "fs/promises"
import * as path from "path"

export function isEnvFile(filePath: string): boolean {
  const basename = path.basename(filePath)
  return /^\.env(\..*)?$/.test(basename)
}

export async function findExistingEnvFile(
  cwd: string
): Promise<string | null> {
  const envFiles = [".env.local", ".env"]

  for (const envFile of envFiles) {
    const filePath = path.join(cwd, envFile)
    try {
      await fs.access(filePath)
      return filePath
    } catch {
      continue
    }
  }

  return null
}

export function parseEnvContent(content: string): Record<string, string> {
  const env: Record<string, string> = {}
  const lines = content.split("\n")

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[key] = value
  }

  return env
}

export function getNewEnvKeys(
  existing: string,
  newContent: string
): string[] {
  const existingKeys = Object.keys(parseEnvContent(existing))
  const newKeys = Object.keys(parseEnvContent(newContent))
  return newKeys.filter((key) => !existingKeys.includes(key))
}

export function mergeEnvContent(
  existing: string,
  newContent: string
): string {
  const existingVars = parseEnvContent(existing)
  const newVars = parseEnvContent(newContent)

  const merged = { ...existingVars, ...newVars }

  const lines: string[] = []
  for (const [key, value] of Object.entries(merged)) {
    lines.push(`${key}=${value}`)
  }

  return lines.join("\n") + "\n"
}
