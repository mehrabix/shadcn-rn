import * as fs from "fs/promises"
import * as path from "path"

export async function loadEnvFiles(cwd: string): Promise<void> {
  const envFiles = [".env.local", ".env"]

  for (const envFile of envFiles) {
    const filePath = path.join(cwd, envFile)
    try {
      const content = await fs.readFile(filePath, "utf-8")
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

        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    } catch {
      continue
    }
  }
}
