import * as open from "open"
import { log, info } from "../utils/logger"

export interface DocsOptions {
  component?: string
}

export async function docs(options: DocsOptions): Promise<void> {
  const { component } = options

  const baseUrl = "https://shadcn-rn.dev"
  const url = component ? `${baseUrl}/docs/components/${component}` : baseUrl

  log("Opening documentation...")
  info(`URL: ${url}`)

  try {
    await open(url)
  } catch {
    info("Could not open browser automatically")
  }
}
