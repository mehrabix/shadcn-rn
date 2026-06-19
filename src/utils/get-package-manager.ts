import * as fs from "fs/promises"
import * as path from "path"

export async function getPackageManager(
  cwd: string
): Promise<"npm" | "yarn" | "pnpm" | "bun"> {
  const lockFiles: Record<string, "npm" | "yarn" | "pnpm" | "bun"> = {
    "package-lock.json": "npm",
    "yarn.lock": "yarn",
    "pnpm-lock.yaml": "pnpm",
    "bun.lockb": "bun",
  }

  for (const [lockFile, manager] of Object.entries(lockFiles)) {
    try {
      await fs.access(path.join(cwd, lockFile))
      return manager
    } catch {
      continue
    }
  }

  return "npm"
}

export function getInstallCommand(manager: string): string {
  switch (manager) {
    case "yarn":
      return "yarn add"
    case "pnpm":
      return "pnpm add"
    case "bun":
      return "bun add"
    default:
      return "npm install"
  }
}

export function getDevInstallCommand(manager: string): string {
  switch (manager) {
    case "yarn":
      return "yarn add -D"
    case "pnpm":
      return "pnpm add -D"
    case "bun":
      return "bun add -D"
    default:
      return "npm install -D"
  }
}
