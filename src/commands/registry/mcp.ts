import { log, info } from "../../utils/logger"

export interface RegistryMcpOptions {
  cwd: string
}

export async function registryMcp(options: RegistryMcpOptions): Promise<void> {
  const { cwd } = options

  log("Starting registry MCP server...")

  try {
    const { createMcpServer } = await import("../../mcp")
    const server = createMcpServer({ cwd })
    await server.connect()
    info("Registry MCP server started and listening")
  } catch {
    info("Registry MCP server not available")
  }
}
