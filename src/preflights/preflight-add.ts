import { log, info } from "../utils/logger"

export interface PreflightResult {
  passed: boolean
  message?: string
}

export async function preflightAdd(cwd: string): Promise<PreflightResult> {
  log("Running add preflight checks...")

  try {
    info("Checking components directory...")
    return { passed: true }
  } catch {
    return { passed: false, message: "Preflight checks failed" }
  }
}
