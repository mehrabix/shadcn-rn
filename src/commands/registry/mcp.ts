import { log, info } from "../../utils/logger"

export interface RegistryMcpOptions {
  cwd: string
}

export async function registryMcp(options: RegistryMcpOptions): Promise<void> {
  const { cwd } = options

  log("Starting registry MCP server...")

  try {
    const { createMcpServer } = await import("../../mcp")
    info("Registry MCP server started")
  } catch {
    info("Registry MCP server not available")
  }
}
