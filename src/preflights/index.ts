import * as fs from "fs/promises"
import * as path from "path"
import { log, info, error } from "../utils/logger"

export interface PreflightResult {
  valid: boolean
  issues: string[]
}

export async function preflightAdd(cwd: string): Promise<PreflightResult> {
  const issues: string[] = []

  const packageJsonPath = path.join(cwd, "package.json")
  try {
    await fs.access(packageJsonPath)
  } catch {
    issues.push("No package.json found. Are you in the right directory?")
  }

  const configPath = path.join(cwd, "components.json")
  try {
    await fs.access(configPath)
  } catch {
    issues.push("No components.json found. Run 'npx shadcn-rn init' first.")
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

export async function preflightInit(cwd: string): Promise<PreflightResult> {
  const issues: string[] = []

  const packageJsonPath = path.join(cwd, "package.json")
  try {
    await fs.access(packageJsonPath)
  } catch {
    issues.push("No package.json found. Are you in the right directory?")
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

export async function preflightBuild(cwd: string): Promise<PreflightResult> {
  const issues: string[] = []

  const registryPath = path.join(cwd, "registry.json")
  try {
    await fs.access(registryPath)
  } catch {
    issues.push("No registry.json found. Are you in the right directory?")
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}
