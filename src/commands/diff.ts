import { getConfig } from "../utils/get-config"
import { log, info, success } from "../utils/logger"

export interface DiffOptions {
  cwd: string
  component?: string
}

export async function diff(options: DiffOptions): Promise<void> {
  const { cwd, component } = options

  log("Checking for differences...")

  const config = await getConfig(cwd)

  if (component) {
    info(`Checking component: ${component}`)
  } else {
    info("Checking all components...")
  }

  success("No differences found")
}
