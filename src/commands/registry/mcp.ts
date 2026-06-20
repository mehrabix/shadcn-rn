import { log, info } from "../../utils/logger"

export interface RegistryMcpOptions {
  cwd: string
}

export async function registryMcp(options: RegistryMcpOptions): Promise<void> {
  const { cwd } = options

  log("Starting registry MCP server...")

  try {
    const { server } = await import("../../mcp")
    const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js")
    const transport = new StdioServerTransport()
    await server.connect(transport)
    info("Registry MCP server started and listening")
  } catch {
    info("Registry MCP server not available")
  }
}
